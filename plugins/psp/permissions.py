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
from __future__ import unicode_literals

from plugins.basic_auth.models import Role, RoleGroup, PermissionName


class PspPermission(object):
    LIST_CITY = 'psp.cities.list'
    GET_CITY = 'psp.cities.get'
    CREATE_CITY = 'psp.cities.create'
    UPDATE_CITY = 'psp.cities.update'
    LIST_QR_BATCHES = 'psp.qr.list'
    CREATE_QR_BATCH = 'psp.qr.create'
    GET_QR_BATCH = 'psp.qr.get'
    LIST_MERCHANTS = 'psp.merchants.list'
    GET_MERCHANT = 'psp.merchants.get'
    UPDATE_MERCHANT = 'psp.merchants.update'
    CREATE_MERCHANT = 'psp.merchants.create'

    @classmethod
    def all(cls):
        return [getattr(cls, a) for a in dir(cls) if not a.startswith('_') and not a == 'all']


class CityPermission(object):
    GET_CITY = 'psp.cities.%(city_id)s.get'
    UPDATE_CITY = 'psp.cities.%(city_id)s.update'
    LIST_MERCHANTS = 'psp.cities.%(city_id)s.merchants.list'
    GET_MERCHANT = 'psp.cities.%(city_id)s.merchants.get'
    UPDATE_MERCHANT = 'psp.cities.%(city_id)s.merchants.update'
    CREATE_MERCHANT = 'psp.cities.%(city_id)s.merchants.create'
    LIST_QR_BATCHES = 'psp.cities.%(city_id)s.qr.list'
    CREATE_QR_BATCH = 'psp.cities.%(city_id)s.qr.create'
    GET_QR_BATCH = 'psp.cities.%(city_id)s.qr.get'

    @classmethod
    def all(cls):
        return [getattr(cls, a) for a in dir(cls) if not a.startswith('_') and not a == 'all']


CITY_ADMIN_ROLE = 'role/psp.cities.%(city_id)s.admin'
CITY_MERCHANT_ROLE = 'role/psp.cities.%(city_id)s.merchantManager'
CITY_GROUP_ID = 'psp.cities.%(city_id)s'
PARTICIPATION_CITIES_GROUP_ID = 'psp.cities'

ROLE_GROUPS = (
    RoleGroup(
        id='psp.perms.participation',
        name=PermissionName(key='psp.perms.participation'),
        roles=[
            Role(id='role/psp.admin',
                 name=PermissionName(key='psp.perms.participation_admin'),
                 permissions=PspPermission.all()),
            Role(id='role/psp.merchantAdmin',
                 name=PermissionName(key='psp.perms.merchants_admin'),
                 permissions=[PspPermission.LIST_CITY,
                              PspPermission.LIST_MERCHANTS,
                              PspPermission.GET_MERCHANT,
                              PspPermission.UPDATE_MERCHANT,
                              PspPermission.CREATE_MERCHANT]),
        ],
        # This group contains one group per city, dynamically created when a city is created.
        groups=[RoleGroup(id=PARTICIPATION_CITIES_GROUP_ID, name=PermissionName(key='psp.perms.cities'), groups=[])]
    ),
)
