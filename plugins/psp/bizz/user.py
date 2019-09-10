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
# @@license_version:1.5@@
import dateutil
from plugins.psp.models import UserSettings
from plugins.psp.to import UserSettingsTO


def get_user_settings(app_user_email):
    # type: (str) -> UserSettings
    key = UserSettings.create_key(app_user_email)
    settings = key.get()
    if not settings:
        settings = UserSettings(key=key)
        settings.put()
    return settings


def save_user_settings(app_user_email, data):
    # type: (str, UserSettingsTO) -> UserSettings
    settings = get_user_settings(app_user_email)
    settings.tour_date = dateutil.parser.parse(data.tour_date).replace(tzinfo=None)
    settings.put()
    return settings
