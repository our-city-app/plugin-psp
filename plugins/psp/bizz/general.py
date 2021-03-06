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
from types import FunctionType

from framework.bizz.authentication import get_current_session
from mcfw.restapi import GenericRESTRequestHandler
from plugins.basic_auth.bizz.user import get_permissions_from_roles
from plugins.psp.models import GeneralSettings


def get_general_settings():
    # type: () -> GeneralSettings
    return GeneralSettings.create_key().get()


def validate_session_auth(args, scopes):
    session = get_current_session()
    if session:
        user_permissions = get_permissions_from_roles(session.scopes)
        for permission in scopes:
            permission_with_arg = permission % args if args else permission
            if permission_with_arg in user_permissions:
                return True
    return False


def validate_admin_request_auth(func, handler):
    # type: (FunctionType, GenericRESTRequestHandler) -> bool
    route_kwargs = handler.request.route.match(handler.request)[-1]
    if validate_session_auth(route_kwargs, func.meta['scopes']):
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
    route_kwargs = handler.request.route.match(handler.request)[-1]
    if validate_session_auth(route_kwargs, func.meta['scopes']):
        return True
    auth = handler.request.headers.get('Authentication')
    if not auth:
        return False

    from plugins.psp.bizz.cities import get_city
    try:
        type_, encoded = auth.split(' ')
        if type_ != 'Basic':
            return False
        city = get_city(route_kwargs['city_id'])
        return city.secret == b64decode(encoded)
    except TypeError:
        return False
