# -*- coding: utf-8 -*-
# Copyright 2019 Green Valley Belgium NV
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
#
# @@license_version:1.3@@

import logging
from collections import defaultdict
from datetime import datetime, timedelta

from google.appengine.api import taskqueue
from google.appengine.ext import ndb, deferred
from google.appengine.ext.ndb.query import Cursor

import dateutil.parser
from framework.utils.cloud_tasks import run_tasks
from mcfw.cache import cached, invalidate_cache
from mcfw.consts import MISSING
from mcfw.exceptions import HttpNotFoundException, HttpBadRequestException, HttpConflictException
from mcfw.rpc import returns, arguments
from plugins.psp.consts import SCHEDULED_QUEUE
from plugins.psp.models import Project, ProjectBudget, City, QRCode, Scan, ProjectUserStatistics, \
    ProjectStatisticShard, ProjectStatisticShardConfig, Merchant, parent_key
from plugins.psp.to import ProjectTO, QRScanTO, MerchantStatisticsListTO, MerchantStatisticsTO  # @UnusedImport


def list_projects(city_id):
    # type: (unicode) -> [Project]
    return Project.list_by_city(city_id)


# This cache is cleared when a Project is updated, or when the end_date is reached
@cached(version=1, lifetime=0, request=True, memcache=True, datastore='list_active_project_keys')
@returns([ndb.Key])
@arguments(city_id=unicode)
def list_active_project_keys(city_id):
    now = datetime.now()
    return [p.key for p in Project.list_projects_after(now, city_id)
            if p.end_date and p.end_date > now]


def list_active_projects(city_id):
    # type: (unicode) -> [Project]
    return ndb.get_multi(list_active_project_keys(city_id))


def get_project(city_id, project_id):
    # type: (unicode, int) -> Project
    project = Project.create_key(city_id, project_id).get()
    if not project:
        raise HttpNotFoundException('project_not_found', {'id': project_id, 'city_id': city_id})
    return project


def create_project(city_id, data):
    # type: (int, ProjectTO) -> Project
    if data.id is not MISSING:
        key = Project.create_key(city_id, data.id)
        if key.get():
            raise HttpBadRequestException('project_already_exists')
    project = Project(parent=City.create_key(city_id))
    _populate_project(project, data)
    project.put()
    return project


@ndb.transactional(xg=True)
def update_project(city_id, project_id, data):
    # type: (unicode, int, ProjectTO) -> Project
    if data.id != project_id:
        raise HttpBadRequestException('bad_project_id')
    project = get_project(city_id, project_id)
    old_end_date = project.end_date
    old_start_date = project.start_date
    _populate_project(project, data)
    if old_end_date != project.end_date:
        delta = project.end_date - datetime.now()
        if delta.days < 32:
            logging.debug('Scheduling invalidate_cache of list_active_project_keys(%s) in %s', city_id, delta)
            deferred.defer(invalidate_cache, list_active_project_keys, city_id,
                           _countdown=delta.total_seconds(), _transactional=True, _queue=SCHEDULED_QUEUE)
    if old_start_date != project.start_date:
        delta = project.start_date - datetime.now()
        if 0 <= delta.days < 32:
            logging.debug('Scheduling invalidate_cache of list_active_project_keys(%s) in %s', city_id, delta)
            deferred.defer(invalidate_cache, list_active_project_keys, city_id,
                           _countdown=delta.total_seconds(), _transactional=True, _queue=SCHEDULED_QUEUE)
    project.put()
    return project


def _populate_project(project, data):
    # type: (Project, ProjectTO) -> None
    start_date = MISSING.default(data.start_date, None) and dateutil.parser.parse(data.start_date).replace(tzinfo=None)
    end_date = MISSING.default(data.end_date, None) and dateutil.parser.parse(data.end_date).replace(tzinfo=None)
    project.populate(title=data.title,
                     description=data.description,
                     start_date=start_date,
                     end_date=end_date,
                     budget=ProjectBudget(amount=data.budget.amount,
                                          currency=data.budget.currency),
                     action_count=data.action_count)


def _required(*args):
    for arg in args:
        if arg in (MISSING, None):
            raise HttpBadRequestException()


def qr_scanned(data):
    # type: (QRScanTO) -> (Project, ProjectUserStatistics, long)
    _required(data, data.email, data.app_id, data.qr_content)

    try:
        qr_id = long(data.qr_content.split('/')[-1])
    except ValueError:
        raise HttpBadRequestException('psp.errors.invalid_qr_code')

    qr_code = QRCode.create_key(qr_id).get()
    if not qr_code:
        logging.info('No QR code found for %s', data.qr_content)
        raise HttpNotFoundException('psp.errors.qr_code_not_found')

    if not qr_code.merchant_id:
        logging.warn('QR code is not linked: %s', qr_code)
        raise HttpConflictException('psp.errors.qr_code_not_linked')

    project_id = data.project_id
    project = get_project(qr_code.city_id, project_id)
    if not project.is_active:
        raise HttpBadRequestException('psp.errors.project_not_active')

    city, shard_config = ndb.get_multi([
        City.create_key(qr_code.city_id),
        ProjectStatisticShardConfig.create_key(project_id),
    ])

    user_stats = add_project_scan(shard_config, project.id, qr_code.merchant_id, data.app_user, city.min_interval)
    return project, user_stats, get_project_stats(project.id, None)[1]


@ndb.transactional(xg=True)
def add_project_scan(project_shard_config, project_id, merchant_id, app_user, min_interval):
    # type: (ProjectStatisticShardConfig, long, long, users.User, long) -> ProjectUserStatistics
    if Scan.has_recent_scan(app_user, merchant_id, datetime.now() - timedelta(seconds=min_interval)):
        raise HttpConflictException('psp.errors.already_scanned_recently')

    scan = Scan(parent=parent_key(app_user), merchant_id=merchant_id, project_id=project_id)

    user_stats_key = ProjectUserStatistics.create_key(project_id, app_user)
    user_stats = user_stats_key.get() or ProjectUserStatistics(key=user_stats_key)
    user_stats.total += 1

    project_stats_key = project_shard_config.get_random_shard_key()
    project_stats_shard = project_stats_key.get() or ProjectStatisticShard(key=project_stats_key)
    project_stats_shard.total += 1
    if project_stats_shard.merchants is None:
        project_stats_shard.merchants = {}
    merchant_str_id = str(merchant_id)
    project_stats_shard.merchants[merchant_str_id] = project_stats_shard.merchants.get(merchant_str_id, 0) + 1

    to_put = [scan, user_stats, project_stats_shard]
    logging.info('Saving user scan: %s', to_put)
    ndb.put_multi(to_put)

    return user_stats


def get_project_stats(project_id, app_user=None):
    # type: (long, users.User) -> [ProjectUserStatistics, long]
    keys = ProjectStatisticShardConfig.get_all_keys(project_id)
    if app_user:
        keys.append(ProjectUserStatistics.create_key(project_id, app_user))
    models = ndb.get_multi(keys)
    user_stats = app_user and models.pop(-1)
    total_count = sum(shard.total for shard in models if shard)
    return user_stats, total_count


def get_merchant_statistics(city_id, project_id, cursor):
    # type: (int, int, unicode) -> object
    page_size = 50
    cursor = Cursor.from_websafe_string(cursor) if cursor else None
    merchant_future = Merchant.list_by_city_id(city_id).fetch_page_async(page_size, start_cursor=cursor)
    shard_keys = ProjectStatisticShardConfig.get_all_keys(project_id)
    stats_models = [s for s in ndb.get_multi(shard_keys) if s]  # type: list[ProjectStatisticShard]
    total = sum(m.total for m in stats_models)
    items, new_cursor, more = merchant_future.get_result()
    results = [MerchantStatisticsTO(id=merchant.id,
                                    name=merchant.name,
                                    total=sum(m.merchants.get(str(merchant.id), 0) for m in stats_models))
               for merchant in items]
    return MerchantStatisticsListTO(new_cursor and new_cursor.to_websafe_string(), more, results, project_id, total)


def list_merchants(city_id, cursor=None):
    # type: (unicode, unicode) -> tuple[list[Merchant], unicode, bool]
    merchants, new_cursor, has_more = Merchant.list_by_city_id(city_id).fetch_page(
        50, start_cursor=Cursor.from_websafe_string(cursor) if cursor else None, keys_only=False)
    new_cursor = new_cursor.to_websafe_string().decode('utf-8') if new_cursor and has_more else None
    return merchants, new_cursor, has_more


def get_merchant(merchant_id):
    # type: (long) -> Merchant
    return Merchant.create_key(merchant_id).get()


def schedule_invalidate_caches():
    now = datetime.now()
    deadline = now + timedelta(days=30)
    cities = defaultdict(list)
    for project in Project.list_projects_after(now):
        if project.start_date and project.start_date < deadline:
            cities[project.city_id].append(project.start_date)
        if project.end_date and project.end_date < deadline:
            cities[project.city_id].append(project.end_date)

    tasks = []
    for city_id, dates in cities.iteritems():
        payload = deferred.deferred.serialize(invalidate_cache, list_active_project_keys, city_id)
        for date in dates:
            logging.debug('Scheduling invalidate_cache of list_active_project_keys(%s) at %s', city_id, date)
            countdown = (date - now).total_seconds()
            tasks.append(taskqueue.Task(payload=payload,
                                        url=deferred.deferred._DEFAULT_URL,
                                        headers=deferred.deferred._TASKQUEUE_HEADERS,
                                        countdown=countdown))
    if tasks:
        run_tasks(tasks, queue_name=SCHEDULED_QUEUE)
