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
from base64 import b64decode

from google.appengine.api import users

from plugins.psp.models import GeneralSettings


def get_general_settings():
    # type: () -> GeneralSettings
    return GeneralSettings.create_key().get()


def validate_admin_request_auth(func, handler):
    # type: (function, GenericRESTRequestHandler) -> bool
    if users.is_current_user_admin():
        return True

    auth = handler.request.headers.get('Authentication')
    if not auth:
        return False

    try:
        type_, encoded = auth.split(' ')
        if type_ != 'Basic':
            return False

        settings = get_general_settings()
        return settings.secret == b64decode(encoded)
    except TypeError:
        return False


def validate_city_request_auth(func, handler):
    # type: (function, GenericRESTRequestHandler) -> bool
    if users.is_current_user_admin():
        return True

    auth = handler.request.headers.get('Authentication')
    if not auth:
        return False

    from plugins.psp.bizz.cities import get_city
    try:
        type_, encoded = auth.split(' ')
        if type_ != 'Basic':
            return False

        kwargs = handler.request.route.match(handler.request)[-1]
        city = get_city(kwargs['city_id'])
        return city.secret == b64decode(encoded)
    except TypeError:
        return False
