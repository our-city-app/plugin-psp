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
import random
from string import ascii_lowercase

from mcfw.exceptions import HttpNotFoundException, HttpBadRequestException
from plugins.psp.models import City
from plugins.psp.to import CityTO


def get_city(city_id):
    # type: (unicode) -> City
    city = City.create_key(city_id).get()
    if not city:
        raise HttpNotFoundException('city_not_found', {'id': city_id})
    return city


def create_city(data):
    # type: (CityTO) -> City
    key = City.create_key(data.id)
    if key.get():
        raise HttpBadRequestException('city_already_exists')
    city = City(key=key,
                secret=''.join(random.choice(ascii_lowercase) for _ in range(40)))
    _populate_city(city, data)
    city.put()
    return city


def update_city(city_id, data):
    # type: (unicode, CityTO) -> City
    city = get_city(city_id)
    _populate_city(city, data)
    city.put()
    return city


def _populate_city(city, data):
    # type: (City, CityTO) -> None
    city.populate(
        avatar_url=data.avatar_url,
        api_key=data.api_key,
    )
