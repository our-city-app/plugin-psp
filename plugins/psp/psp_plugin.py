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

from framework.plugin_loader import Plugin, get_auth_plugin
from framework.utils.plugins import Handler, Module
from mcfw.consts import NOT_AUTHENTICATED, AUTHENTICATED
from mcfw.restapi import rest_functions
from plugins.psp.api import cities, qr_codes, projects, places, app, merchants
from plugins.psp.consts import ROLE_GROUPS, PspPermission
from plugins.psp.handlers import ScheduleInvalidateCachesHandler, QRHandler, IndexPageHandler, \
    AppleAppSiteAssociationHandler, TestHandler


class PspPlugin(Plugin):

    def __init__(self, configuration=None):
        super(PspPlugin, self).__init__(configuration)
        get_auth_plugin().register_roles(ROLE_GROUPS)

    def get_handlers(self, auth):
        yield Handler(url='/', handler=IndexPageHandler)
        if auth == Handler.AUTH_AUTHENTICATED:
            modules = [cities, qr_codes, projects, places, merchants]
            for mod in modules:
                for url, handler in rest_functions(mod, authentication=AUTHENTICATED):
                    yield Handler(url=url, handler=handler)
        elif auth == Handler.AUTH_UNAUTHENTICATED:
            for url, handler in rest_functions(app, authentication=NOT_AUTHENTICATED):
                yield Handler(url=url, handler=handler)
        elif auth == Handler.AUTH_ADMIN:
            yield Handler(url='/admin/cron/psp/schedule_invalidate_caches', handler=ScheduleInvalidateCachesHandler)
        yield Handler(url='/qr/<city_id:[^/]+>/<qr_id:\d+>', handler=QRHandler)
        yield Handler(url='/apple-app-site-association', handler=AppleAppSiteAssociationHandler)
        yield Handler(url='/test', handler=TestHandler)

    def get_modules(self):
        yield Module('psp_admin', [PspPermission.LIST_CITY], 1)

    def get_client_routes(self):
        return ['/psp<route:.*>']
