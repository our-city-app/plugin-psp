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
from os import path

import webapp2
from google.appengine.api import users

from framework.bizz.authentication import get_current_session
from framework.handlers import render_logged_in_page, render_page
from plugins.psp.bizz.projects import schedule_invalidate_caches
from plugins.psp.consts import NAMESPACE


class ScheduleInvalidateCachesHandler(webapp2.RequestHandler):

    def get(self):
        schedule_invalidate_caches()


class IndexPageHandler(webapp2.RequestHandler):
    def get(self):
        if get_current_session() or users.is_current_user_admin():
            render_logged_in_page(self)
        else:
            params = {
                'login_url': users.create_login_url('/')
            }
            render_page(self.response, path.join('unauthenticated', 'main_page.html'), plugin_name=NAMESPACE,
                        template_parameters=params)


class QRHandler(webapp2.RequestHandler):
    def get(self, city_id, qr_id):
        self.redirect('https:///rogerthat-server.appspot.com/install/%s' % city_id)
