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

from google.appengine.api import users

from framework.plugin_loader import Plugin
from framework.utils.plugins import Handler, Module
from mcfw.consts import NOT_AUTHENTICATED
from mcfw.restapi import rest_functions
from plugins.psp.api import cities, qr_codes, projects, places
from plugins.psp.handlers import ScheduleInvalidateCachesHandler, QRHandler, IndexPageHandler


class PspPlugin(Plugin):

    def get_handlers(self, auth):
        yield Handler(url='/', handler=IndexPageHandler)
        if auth == Handler.AUTH_UNAUTHENTICATED:
            modules = [cities, qr_codes, projects, places]
            for mod in modules:
                for url, handler in rest_functions(mod, authentication=NOT_AUTHENTICATED):
                    yield Handler(url=url, handler=handler)
        elif auth == Handler.AUTH_ADMIN:
            yield Handler(url='/admin/cron/psp/schedule_invalidate_caches', handler=ScheduleInvalidateCachesHandler)
        yield Handler(url='/qr/<city_id:[^/]+>/<qr_id:\d+>', handler=QRHandler)

    def get_modules(self):
        if users.is_current_user_admin():
            yield Module('psp_admin', [], 1)
