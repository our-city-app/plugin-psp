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

from google.appengine.ext import ndb

from mcfw.exceptions import HttpNotFoundException, HttpBadRequestException, HttpConflictException
from plugins.basic_auth.basic_auth_plugin import get_basic_auth_plugin
from plugins.basic_auth.models import Role, PermissionName, RoleGroup
from plugins.psp.models import City, AppleAppAssociation
from plugins.psp.permissions import CityPermission, CITY_ADMIN_ROLE, CITY_GROUP_ID, CITY_MERCHANT_ROLE, \
    PARTICIPATION_CITIES_GROUP_ID
from plugins.psp.to import CityTO


def list_cities():
    return City.list()


def get_cities_by_ids(city_ids):
    # type: (list[long]) -> list[City]
    return ndb.get_multi([City.create_key(city_id) for city_id in city_ids])


def get_city(city_id):
    # type: (long) -> City
    city = City.create_key(city_id).get()
    if not city:
        raise HttpNotFoundException('city_not_found', {'id': city_id})
    return city


@ndb.transactional(xg=True)
def create_city(data):
    # type: (CityTO) -> City
    key = City.create_key(data.id)
    if key.get():
        raise HttpBadRequestException('city_already_exists')
    city = City(key=key,
                secret=''.join(random.choice(ascii_lowercase) for _ in range(40)))
    _populate_city(city, data)
    city.put()
    get_basic_auth_plugin().register_groups([_get_group_for_city(city)], PARTICIPATION_CITIES_GROUP_ID)
    return city


def _get_group_for_city(city):
    # type: (City) -> RoleGroup
    return RoleGroup(
        id=CITY_GROUP_ID % {'city_id': city.id},
        name=PermissionName(value=city.name),
        roles=_get_roles_for_city(city)
    )


def _get_roles_for_city(city):
    # type: (City) -> list[Role]
    args = {'city_id': city.id}
    return [
        Role(id=CITY_ADMIN_ROLE % args,
             name=PermissionName(value='%s administrator' % city.name),
             permissions=[permission % args for permission in CityPermission.all()]),
        Role(id=CITY_MERCHANT_ROLE % args,
             name=PermissionName(value='%s merchant manager' % city.name),
             permissions=[p % args for p in
                          (CityPermission.LIST_MERCHANTS, CityPermission.GET_MERCHANT, CityPermission.CREATE_MERCHANT,
                           CityPermission.UPDATE_MERCHANT)])
    ]


@ndb.transactional(xg=True)
def update_city(city_id, data):
    # type: (long, CityTO) -> City
    city = get_city(city_id)
    _populate_city(city, data)
    get_basic_auth_plugin().update_group(_get_group_for_city(city))
    city.put()
    return city


def _populate_city(city, data):
    # type: (City, CityTO) -> None
    city.populate(
        avatar_url=data.avatar_url,
        name=data.name,
        app_id=data.app_id,
        info=data.info
    )
    if isinstance(data, CityTO):
        city.api_key = data.api_key


def add_app_to_apple_association(app_id, ios_dev_team):
    get_city(app_id)
    model = AppleAppAssociation.create_key().get()  # type: AppleAppAssociation
    existing_ids = [detail['appID'] for detail in model.config['applinks']['details']]
    new_id = '%s.com.mobicage.rogerthat.%s' % (ios_dev_team, app_id)
    if any(app_id in id_ for id_ in existing_ids):
        raise HttpConflictException('App %s is already registered' % app_id)
    new_details = {
        'appID': new_id,
        'paths': ['/qr/%s/*' % app_id]
    }
    model.config['applinks']['details'].append(new_details)
    model.put()
    return model
