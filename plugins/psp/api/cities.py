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
from mcfw.exceptions import HttpForbiddenException
from mcfw.restapi import rest, GenericRESTRequestHandler
from mcfw.rpc import returns, arguments
from plugins.psp.bizz.cities import create_city, update_city, get_city, list_cities
from plugins.psp.bizz.general import validate_admin_request_auth, validate_city_request_auth
from plugins.psp.consts import PspPermission

from plugins.psp.to import CityTO, AppCityTO


@rest('/cities', 'get', custom_auth_method=validate_admin_request_auth, scopes=PspPermission.LIST_CITY)
@returns([CityTO])
@arguments()
def api_list_cities():
    return [CityTO.from_model(model) for model in list_cities()]


@rest('/cities', 'post', custom_auth_method=validate_admin_request_auth, scopes=PspPermission.CREATE_CITY)
@returns(CityTO)
@arguments(data=CityTO)
def api_create_city(data):
    return CityTO.from_model(create_city(data))


def _city_auth(func, handler):
    return validate_admin_request_auth(func, handler) or validate_city_request_auth(func, handler)


@rest('/cities/<city_id:[^/]+>', 'get', custom_auth_method=_city_auth, scopes=PspPermission.GET_CITY)
@returns((CityTO, AppCityTO))
@arguments(city_id=unicode)
def api_get_city(city_id):
    handler = GenericRESTRequestHandler()
    handler.request = GenericRESTRequestHandler.get_current_request()
    city = get_city(city_id)
    if validate_admin_request_auth(api_get_city, handler):
        return CityTO.from_model(city)
    elif validate_city_request_auth(api_get_city, handler):
        return AppCityTO.from_model(city)
    raise HttpForbiddenException()


@rest('/cities/<city_id:[^/]+>', 'put', custom_auth_method=_city_auth, scopes=PspPermission.UPDATE_CITY)
@returns((CityTO, AppCityTO))
@arguments(city_id=unicode, data=CityTO)
def api_save_city(city_id, data):
    # type: (unicode, CityTO) -> CityTO
    handler = GenericRESTRequestHandler()
    handler.request = GenericRESTRequestHandler.get_current_request()
    if validate_admin_request_auth(api_save_city, handler):
        return CityTO.from_model(update_city(city_id, data))
    elif validate_city_request_auth(api_save_city, handler):
        return AppCityTO.from_model(update_city(city_id, AppCityTO.from_dict(data.to_dict())))
    else:
        raise HttpForbiddenException()
