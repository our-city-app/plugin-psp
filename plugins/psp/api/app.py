# -*- coding: utf-8 -*-
# Copyright 2019 Green Valley NV
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
# @@license_version:1.5@@

from framework.bizz.authentication import get_browser_language
from framework.i18n_utils import get_supported_locale
from mcfw.restapi import rest
from mcfw.rpc import returns, arguments
from plugins.psp.api.projects import get_merchants, get_project_details
from plugins.psp.bizz.cities import get_city
from plugins.psp.bizz.places import get_opening_hours_info
from plugins.psp.bizz.projects import list_active_projects, qr_scanned, get_merchant
from plugins.psp.to import ProjectTO, ProjectDetailsTO, QRScanTO, AppMerchantTO, MerchantListResultTO, AppCityTO


@rest('/app/cities/<city_id:[^/]+>/projects', 'get', cors=True)
@returns([ProjectTO])
@arguments(city_id=unicode)
def api_app_list_projects(city_id):
    return [ProjectTO.from_model(project) for project in list_active_projects(city_id)]


@rest('/app/cities/<city_id:[^/]+>/projects/<project_id:[^/]+>/details', 'get', cors=True)
@returns(ProjectDetailsTO)
@arguments(city_id=unicode, project_id=long, app_user=unicode)
def api_app_get_project_details(city_id, project_id, app_user=None):
    return get_project_details(city_id, project_id, app_user)


@rest('/app/cities/<city_id:[^/]+>/merchants', 'get', cors=True)
@returns(MerchantListResultTO)
@arguments(city_id=unicode, lang=unicode, cursor=unicode)
def api_app_get_merchants(city_id, lang=None, cursor=None):
    return get_merchants(city_id, lang, cursor)


@rest('/app/cities/<city_id:[^/]+>/merchants/<merchant_id:[^/]+>', 'get', cors=True)
@returns(AppMerchantTO)
@arguments(city_id=unicode, merchant_id=(int, long), lang=unicode)
def api_app_get_merchant(city_id, merchant_id, lang=None):
    lang = get_supported_locale(lang) if lang else get_browser_language()
    city = get_city(city_id)
    merchant = get_merchant(merchant_id)
    return AppMerchantTO.from_model(merchant, *get_opening_hours_info(merchant.opening_hours, city.timezone, lang))


@rest('/app/scan', 'post', cors=True)
@returns(ProjectDetailsTO)
@arguments(data=QRScanTO)
def api_scanned(data):
    project, user_stats, total_scan_count = qr_scanned(data)
    return ProjectDetailsTO.from_model(project, user_stats, total_scan_count)


@rest('/app/scan', 'options', cors=True)
@returns(dict)
@arguments()
def api_scanned_options():
    return {}


@rest('/app/cities/<city_id:[^/]+>', 'get', cors=True)
@returns(AppCityTO)
@arguments(city_id=unicode)
def api_get_city(city_id):
    return AppCityTO.from_model(get_city(city_id))
