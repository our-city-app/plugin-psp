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
import webapp2


@rest('/city/<city_id:[^/]+>', 'get')
@returns([CityTO])
@arguments(city_id=int)
def api_get_city(city_id):
    city = City.get_by_id(city_id)
    if not city:
        webapp2.abort(404)
    return map(CityTO.from_model, )


@rest('/city', 'post')
@returns([CityTO])
@arguments(city=CityTO)
def api_get_city():
    return map(CityTO.from_model, get_city())
