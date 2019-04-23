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
from datetime import datetime
import dateutil.parser
import logging

from google.appengine.ext import ndb
from google.appengine.ext.ndb.query import Cursor
from mcfw.cache import cached
from mcfw.consts import MISSING
from mcfw.exceptions import HttpNotFoundException, HttpBadRequestException, HttpConflictException
from mcfw.rpc import returns, arguments
from plugins.psp.models import Project, ProjectBudget, City, QRCode, Scan, ProjectUserStaticstics, ProjectStatisticShard,\
    ProjectStatisticShardConfig, Merchant


def list_projects(city_id):
    # type: (unicode) -> [Project]
    return Project.list_by_city(city_id)


# This cache is cleared when a Project is updated, or when the end_time is reached
@cached(version=1, lifetime=0, request=True, memcache=True, datastore='list_active_projects')
@returns([Project])
@arguments(city_id=unicode)
def list_active_projects(city_id):
    # type: (unicode) -> [Project]
    now = datetime.now()
    return [p for p in Project.list_projects_after(city_id, now)
            if p.end_time and p.end_time > now]


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


def update_project(city_id, project_id, data):
    # type: (unicode, int, ProjectTO) -> Project
    if data.id != project_id:
        raise HttpBadRequestException('bad_project_id')
    project = get_project(city_id, project_id)
    _populate_project(project, data)
    project.put()
    return project


def _populate_project(project, data):
    # type: (Project, ProjectTO) -> None
    start_time = MISSING.default(data.start_time, None) and dateutil.parser.parse(data.start_time).replace(tzinfo=None)
    end_time = MISSING.default(data.end_time, None) and dateutil.parser.parse(data.end_time).replace(tzinfo=None)
    project.populate(title=data.title,
                     description=data.description,
                     start_time=start_time,
                     end_time=end_time,
                     budget=ProjectBudget(amount=data.budget.amount,
                                          currency=data.budget.currency),
                     action_count=data.action_count)


def _required(*args):
    for arg in args:
        if arg in (MISSING, None):
            raise HttpBadRequestException()


def qr_scanned(data):
    # type: QRScanTO -> (Project, ProjectUserStaticstics, long)
    _required(data, data.email, data.app_id, data.qr_content)

    qr_id = long(data.qr_content.split('/')[-1])
    qr_code = QRCode.create_key(qr_id).get()
    if not qr_code:
        logging.info('No QR code found for %s', data.qr_content)
        raise HttpNotFoundException('qr_code_not_found')

    if not qr_code.merchant_id:
        logging.warn('QR code is not linked: %s', qr_code)
        raise HttpConflictException('qr_code_not_linked')

    active_projects = list_active_projects(qr_code.city_id)
    if not active_projects:
        logging.info('There is no active project for %s', qr_code.city_id)
        raise HttpConflictException('no_active_project')

    # TODO: get last UserScan for this merchant and check if there's enough time in between

    # At this moment only 1 active project
    project = active_projects[0]
    project_shard_config = ProjectStatisticShardConfig.create_key(project.id).get()
    user_stats = add_project_scan(project_shard_config, project.id, qr_code.merchant_id, data.app_user)
    return project, user_stats, get_project_stats(project.id, None)[0]


@ndb.transactional(xg=True)
def add_project_scan(project_shard_config, project_id, merchant_id, app_user):
    # type: (long, long, users.User) -> ProjectUserStaticstics
    to_put = []
    scan = Scan(app_user=app_user, merchant_id=merchant_id, project_id=project_id)
    to_put.append(scan)

    user_stats_key = ProjectUserStaticstics.create_key(project_id, app_user)
    user_stats = user_stats_key.get() or ProjectUserStaticstics(key=user_stats_key)
    user_stats.total += 1
    to_put.append(user_stats)

    project_stats_key = project_shard_config.get_random_shard_key()
    project_stats_shard = project_stats_key.get() or ProjectStatisticShard(key=project_stats_key)
    project_stats_shard.total += 1
    if project_stats_shard.merchants is None:
        project_stats_shard.merchants = {}
    merchant_str_id = str(merchant_id)
    project_stats_shard.merchants[merchant_str_id] = project_stats_shard.merchants.get(merchant_str_id, 0)
    to_put.append(project_stats_shard)

    ndb.put_multi(to_put)

    return user_stats


def get_project_stats(project_id, app_user=None):
    # type: (long, users.User) -> (ProjectUserStaticstics, long)
    keys = ProjectStatisticShardConfig.get_all_keys(project_id)
    if app_user:
        keys.append(ProjectUserStaticstics.create_key(project_id, app_user))
    models = ndb.get_multi(keys)
    user_stats = app_user and models.pop(-1)
    total_count = sum([shard.total_count for shard in models if shard])

    return user_stats, total_count


def list_merchants(city_id, cursor=None):
    # type: (unicode, unicode) -> ([Merchant], unicode, bool)
    merchants, new_cursor, has_more = Merchant.list_by_city_id(city_id).fetch_page(
        50, start_cursor=Cursor.from_websafe_string(cursor) if cursor else None, keys_only=False)
    new_cursor = new_cursor.to_websafe_string().decode('utf-8') if new_cursor and has_more else None
    return merchants, new_cursor, has_more
