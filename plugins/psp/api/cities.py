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

from mcfw.restapi import rest
from mcfw.rpc import returns, arguments
from plugins.psp.bizz.cities import create_city, update_city, get_city
from plugins.psp.bizz.general import validate_admin_request_auth

from plugins.psp.to import CityTO


@rest('/cities', 'post', custom_auth_method=validate_admin_request_auth)
@returns(CityTO)
@arguments(data=CityTO)
def api_create_city(data):
    return CityTO.from_model(create_city(data))


@rest('/cities/<city_id:[^/]+>', 'get', custom_auth_method=validate_admin_request_auth)
@returns(CityTO)
@arguments(city_id=unicode)
def api_get_city(city_id):
    return CityTO.from_model(get_city(city_id))


@rest('/cities/<city_id:[^/]+>', 'put', custom_auth_method=validate_admin_request_auth)
@returns(CityTO)
@arguments(city_id=unicode, data=CityTO)
def api_save_city(city_id, data):
    return CityTO.from_model(update_city(city_id, data))
