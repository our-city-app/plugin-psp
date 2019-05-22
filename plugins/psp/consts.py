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
from __future__ import unicode_literals

from plugins.basic_auth.to import RoleGroup, Role

NAMESPACE = 'PSP'
PREFIX = 'psp'
SCHEDULED_QUEUE = "scheduled-queue"


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


ROLE_GROUPS = (
    RoleGroup(name='psp.perms.participation', roles=[
        Role(id='role/psp.admin',
             name='psp.perms.participation_admin',
             permissions=PspPermission.all()),
        Role(id='role/psp.merchantAdmin',
             name='psp.perms.merchants_admin',
             permissions=[PspPermission.LIST_CITY,
                          PspPermission.LIST_MERCHANTS,
                          PspPermission.GET_MERCHANT,
                          PspPermission.UPDATE_MERCHANT,
                          PspPermission.CREATE_MERCHANT])
    ]),
)
