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

from mcfw.restapi import rest, GenericRESTRequestHandler
from mcfw.rpc import returns, arguments
from plugins.psp.bizz.cities import create_city, update_city, get_city, list_cities
from plugins.psp.bizz.general import validate_admin_request_auth

from plugins.psp.to import CityTO, AppCityTO


@rest('/cities', 'get', custom_auth_method=validate_admin_request_auth)
@returns([CityTO])
@arguments()
def api_list_cities():
    return [CityTO.from_model(model) for model in list_cities()]


@rest('/cities', 'post', custom_auth_method=validate_admin_request_auth)
@returns(CityTO)
@arguments(data=CityTO)
def api_create_city(data):
    return CityTO.from_model(create_city(data))


@rest('/cities/<city_id:[^/]+>', 'get', cors=True)
@returns((CityTO, AppCityTO))
@arguments(city_id=unicode)
def api_get_city(city_id):
    city = get_city(city_id)
    handler = GenericRESTRequestHandler()
    handler.request = GenericRESTRequestHandler.get_current_request()
    if validate_admin_request_auth(None, handler):
        return CityTO.from_model(city)
    return AppCityTO.from_model(city)


@rest('/cities/<city_id:[^/]+>', 'put', custom_auth_method=validate_admin_request_auth)
@returns(CityTO)
@arguments(city_id=unicode, data=CityTO)
def api_save_city(city_id, data):
    return CityTO.from_model(update_city(city_id, data))
