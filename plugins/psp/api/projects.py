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

from google.appengine.api import users

from framework.bizz.authentication import get_browser_language
from framework.i18n_utils import get_supported_locale
from mcfw.restapi import rest
from mcfw.rpc import returns, arguments
from plugins.psp.bizz.cities import get_city
from plugins.psp.bizz.general import validate_city_request_auth
from plugins.psp.bizz.places import get_opening_hours_info
from plugins.psp.bizz.projects import create_project, update_project, get_project, list_projects, list_active_projects, \
    qr_scanned, get_project_stats, list_merchants
from plugins.psp.to import ProjectTO, ProjectDetailsTO, QRScanTO, MerchantTO, \
    MerchantListResultTO


@rest('/cities/<city_id:[^/]+>/projects', 'get', cors=True)
@returns([ProjectTO])
@arguments(city_id=unicode, active=bool)
def api_list_projects(city_id, active=False):
    projects = list_active_projects(city_id) if active else list_projects(city_id)
    return [ProjectTO.from_model(project) for project in projects]


@rest('/cities/<city_id:[^/]+>/projects', 'post', custom_auth_method=validate_city_request_auth)
@returns(ProjectTO)
@arguments(city_id=unicode, data=ProjectTO)
def api_create_project(city_id, data):
    return ProjectTO.from_model(create_project(city_id, data))


@rest('/cities/<city_id:[^/]+>/projects/<project_id:[^/]+>', 'get', custom_auth_method=validate_city_request_auth)
@returns(ProjectTO)
@arguments(city_id=unicode, project_id=long)
def api_get_project(city_id, project_id):
    return ProjectTO.from_model(get_project(city_id, project_id))


@rest('/cities/<city_id:[^/]+>/projects/<project_id:[^/]+>', 'put', custom_auth_method=validate_city_request_auth)
@returns(ProjectTO)
@arguments(city_id=unicode, project_id=long, data=ProjectTO)
def api_save_project(city_id, project_id, data):
    return ProjectTO.from_model(update_project(city_id, project_id, data))


@rest('/cities/<city_id:[^/]+>/projects/<project_id:[^/]+>/statistics', 'get', cors=True)
@returns(ProjectDetailsTO)
@arguments(city_id=unicode, project_id=long, app_user=unicode)
def api_get_project_statistics(city_id, project_id, app_user=None):
    user_stats, total_scan_count = get_project_stats(project_id, app_user and users.User(app_user))
    return ProjectDetailsTO.from_model(get_project(city_id, project_id), user_stats, total_scan_count)


@rest('/cities/<city_id:[^/]+>/merchants', 'get', cors=True)
@returns(MerchantListResultTO)
@arguments(city_id=unicode, lang=unicode, cursor=unicode)
def api_get_merchants(city_id, lang=None, cursor=None):
    lang = get_supported_locale(lang) if lang else get_browser_language()
    city = get_city(city_id)
    merchants, new_cursor, has_more = list_merchants(city_id, cursor)
    results = [MerchantTO.from_model(m, *get_opening_hours_info(m.opening_hours, city.timezone, lang))
               for m in merchants]
    return MerchantListResultTO(results=results, cursor=new_cursor, more=has_more)


@rest('/scan', 'post', cors=True)
@returns(ProjectDetailsTO)
@arguments(data=QRScanTO)
def api_scanned(data):
    project, user_stats, total_scan_count = qr_scanned(data)
    return ProjectDetailsTO.from_model(project, user_stats, total_scan_count)


@rest('/scan', 'options', cors=True)
@returns(dict)
@arguments()
def api_scanned_options():
    return {}
