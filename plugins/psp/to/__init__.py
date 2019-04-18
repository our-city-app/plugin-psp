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

from framework.to import TO
from mcfw.properties import unicode_property, long_property, typed_property


class CityTO(TO):
    id = unicode_property('id')
    secret = unicode_property('secret')
    api_key = unicode_property('api_key')
    avatar_url = unicode_property('avatar_url')
    name = unicode_property('name')


class QRBatchTO(TO):
    id = long_property('id')
    city_id = unicode_property('city_id')
    date = unicode_property('date')
    amount = long_property('amount')


class ProjectBudgetTO(TO):
    amount = long_property('amount')  # amount in `currency`, no demicals
    currency = unicode_property('currency')


class ProjectTO(TO):
    id = long_property('id')
    title = unicode_property('title')
    description = unicode_property('description')
    start_time = unicode_property('start_time')
    end_time = unicode_property('end_time')
    budget = typed_property('budget', ProjectBudgetTO)
    action_count = long_property('action_count')
