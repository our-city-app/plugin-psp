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
from google.appengine.api import users
from mcfw.properties import unicode_property, long_property, typed_property, float_property, bool_property,\
    unicode_list_property


class ListResultTO(TO):
    cursor = unicode_property('cursor')
    more = bool_property('more')


class CityTO(TO):
    id = unicode_property('id')
    secret = unicode_property('secret')
    api_key = unicode_property('api_key')
    avatar_url = unicode_property('avatar_url')
    name = unicode_property('name')


class GeoPointTO(TO):
    lat = float_property('lat')
    lng = float_property('lng')


class OpeningHourTO(TO):
    day = long_property('day')
    time = unicode_property('time')


class OpeningPeriodTO(TO):
    open = typed_property('open', OpeningHourTO)
    close = typed_property('close', OpeningHourTO)

    @classmethod
    def from_model(cls, model):
        return cls(open=OpeningHourTO(day=model.open.day, time=model.open.time) if model.open else None,
                   close=OpeningHourTO(day=model.close.day, time=model.close.time) if model.close else None)


class MerchantTO(TO):
    id = long_property('id')
    name = unicode_property('name')
    formatted_address = unicode_property('formatted_address')
    location = typed_property('location', GeoPointTO)
    opening_hours = typed_property('opening_hours', OpeningPeriodTO, True)
    city_id = unicode_property('city_id')
    place_id = unicode_property('place_id')
    open_now = unicode_property('open_now')
    open_until = unicode_property('open_until')
    weekday_text = unicode_list_property('weekday_text')

    @classmethod
    def from_model(cls, model, open_now, open_until, weekday_text):
        return cls(id=model.id,
                   name=model.name,
                   formatted_address=model.formatted_address,
                   location=GeoPointTO(lat=model.location.lat, lng=model.location.lon) if model.location else None,
                   opening_hours=[OpeningPeriodTO.from_model(period) for period in model.opening_hours],
                   city_id=model.city_id,
                   place_id=model.place_id,
                   open_now=open_now,
                   open_until=open_until,
                   weekday_text=weekday_text)


class MerchantListResultTO(ListResultTO):
    results = typed_property('results', MerchantTO, True)


class QRBatchTO(TO):
    id = long_property('id')
    city_id = unicode_property('city_id')
    date = unicode_property('date')
    amount = long_property('amount')


class ProjectBudgetTO(TO):
    amount = long_property('amount')  # amount in `currency`, no demicals
    currency = unicode_property('currency')


class PersonalProjectStatisticsTO(TO):
    total = long_property('total')  # amount in `currency`, no demicals
    last_entry = unicode_property('last_entry')


class ProjectStatisticsTO(TO):
    total = long_property('total')
    personal = typed_property('personal', PersonalProjectStatisticsTO)


class ProjectTO(TO):
    id = long_property('id')
    title = unicode_property('title')
    description = unicode_property('description')
    start_time = unicode_property('start_time')
    end_time = unicode_property('end_time')
    budget = typed_property('budget', ProjectBudgetTO)
    action_count = long_property('action_count')


class ProjectDetailsTO(ProjectTO):
    statistics = typed_property('statistics', ProjectStatisticsTO)

    @classmethod
    def from_model(cls, project, user_stats, total_scan_count):
        details = super(ProjectDetailsTO, cls).from_model(project)
        details.statistics = ProjectStatisticsTO(
            total=total_scan_count,
            personal=user_stats and PersonalProjectStatisticsTO.from_model(user_stats)
        )
        return details


class LocationTO(TO):
    lat = float_property('lat')
    lng = float_property('lng')


class DayTimeTO(TO):
    time = unicode_property('time')
    day = long_property('day')


class OpeningHoursTO(TO):
    close = typed_property('close', DayTimeTO)
    open = typed_property('open', DayTimeTO)


class LinkQRTO(TO):
    qr_content = unicode_property('qr_content')
    name = unicode_property('name')
    formatted_address = unicode_property('formatted_address')
    location = typed_property('location', LocationTO)  # type: LocationTO
    opening_hours = typed_property('opening_hours', OpeningHoursTO, True)  # type: list[OpeningHoursTO]
    place_id = unicode_property('place_id')


class UserInfoTO(TO):
    email = unicode_property('email')
    app_id = unicode_property('app_id')

    @property
    def app_user(self):
        return users.User(u"%s:%s" % (self.email, self.app_id))


class QRScanTO(UserInfoTO):
    qr_content = unicode_property('qr_content')


class QRScanResultTO(TO):
    project_details = typed_property('project_details', ProjectDetailsTO, True)

    @classmethod
    def from_model(cls, project, user_stats, total_scan_count):
        return cls(project_details=ProjectDetailsTO.from_model(project, user_stats, total_scan_count))
