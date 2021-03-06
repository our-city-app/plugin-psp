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
import urllib

from google.appengine.api import users

from framework.to import TO
from mcfw.properties import unicode_property, long_property, typed_property, float_property, bool_property, \
    unicode_list_property
from plugins.psp.models import UploadedFile


class ListResultTO(TO):
    cursor = unicode_property('cursor')
    more = bool_property('more')


class AppCityTO(TO):
    id = long_property('id')
    avatar_url = unicode_property('avatar_url')
    name = unicode_property('name')
    info = unicode_property('info')


class CityTO(AppCityTO):
    secret = unicode_property('secret')
    app_id = unicode_property('app_id')
    api_key = unicode_property('api_key')


class GeoPointTO(TO):
    lat = float_property('lat')
    lon = float_property('long')


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


class WeekDayTextTO(TO):
    day = unicode_property('day')
    hours = unicode_list_property('hours')


class OpeningInfoTO(TO):
    open_now = bool_property('open_now')
    open_until = unicode_property('open_until')
    periods = typed_property('periods', OpeningPeriodTO, True)
    weekday_text = typed_property('weekday_text', WeekDayTextTO, True)


class AppPhotoTO(TO):
    url = unicode_property('url')


class AppMerchantTO(TO):
    id = long_property('id')
    name = unicode_property('name')
    formatted_address = unicode_property('formatted_address')
    location = typed_property('location', GeoPointTO)
    city_id = long_property('city_id')
    opening_hours = typed_property('opening_hours', OpeningInfoTO)
    place_id = unicode_property('place_id')
    place_url = unicode_property('place_url')
    formatted_phone_number = unicode_property('formatted_phone_number')
    website = unicode_property('website')
    photos = typed_property('photos', AppPhotoTO, True)

    @classmethod
    def from_model(cls, model, open_now, open_until, weekday_text):
        if model.place_id:
            params = {
                'api': 1,
                'query': '%s, %s' % (model.name, model.formatted_address),
                'query_placed_id': model.place_id,
            }
            place_url = 'https://www.google.com/maps/search/?%s' % urllib.urlencode(params)
        else:
            place_url = None
        return cls(id=model.id,
                   name=model.name,
                   formatted_address=model.formatted_address,
                   location=GeoPointTO(lat=model.location.lat, lon=model.location.lon) if model.location else None,
                   opening_hours=OpeningInfoTO(
                       periods=[OpeningPeriodTO.from_model(period) for period in model.opening_hours],
                       open_now=open_now,
                       open_until=open_until,
                       weekday_text=weekday_text),
                   city_id=model.city_id,
                   place_id=model.place_id,
                   place_url=place_url,
                   formatted_phone_number=model.formatted_phone_number,
                   website=model.website,
                   photos=[AppPhotoTO(url=UploadedFile.url(photo_key.id())) for photo_key in model.photos])


class MerchantListResultTO(ListResultTO):
    results = typed_property('results', AppMerchantTO, True)


class QRBatchTO(TO):
    id = long_property('id')
    city_id = long_property('city_id')
    date = unicode_property('date')
    amount = long_property('amount')


class ProjectBudgetTO(TO):
    amount = long_property('amount')  # amount in `currency`, no demicals
    currency = unicode_property('currency')


class PersonalProjectStatisticsTO(TO):
    total = long_property('total', default=0)  # amount of scans
    last_entry = unicode_property('last_entry', default=None)


class ProjectStatisticsTO(TO):
    total = long_property('total')
    personal = typed_property('personal', PersonalProjectStatisticsTO)


class ProjectTO(TO):
    id = long_property('id')
    city_id = long_property('city_id')
    title = unicode_property('title')
    description = unicode_property('description')
    start_date = unicode_property('start_date')
    end_date = unicode_property('end_date')
    budget = typed_property('budget', ProjectBudgetTO)
    action_count = long_property('action_count')


class ProjectDetailsTO(ProjectTO):
    statistics = typed_property('statistics', ProjectStatisticsTO)

    @classmethod
    def from_model(cls, project, user_stats, total_scan_count):
        details = super(ProjectDetailsTO, cls).from_model(project)
        details.statistics = ProjectStatisticsTO(
            total=total_scan_count,
            personal=PersonalProjectStatisticsTO.from_model(user_stats) if user_stats else PersonalProjectStatisticsTO()
        )
        return details


class DayTimeTO(TO):
    time = unicode_property('time')
    day = long_property('day')


class OpeningHoursTO(TO):
    close = typed_property('close', DayTimeTO)
    open = typed_property('open', DayTimeTO)


class UploadedFileTO(TO):
    id = long_property('id')
    url = unicode_property('url')

    @classmethod
    def from_model(cls, model, general_settings):
        return cls(id=model.id, url=model.file_url(general_settings, model.origin, model.reference))


class MerchantTO(TO):
    id = long_property('id')
    city_id = long_property('city_id')
    name = unicode_property('name')
    formatted_address = unicode_property('formatted_address')
    location = typed_property('location', GeoPointTO)  # type: LocationTO
    opening_hours = typed_property('opening_hours', OpeningHoursTO, True)  # type: list[OpeningHoursTO]
    place_id = unicode_property('place_id')
    formatted_phone_number = unicode_property('formatted_phone_number')
    website = unicode_property('website')
    photos = typed_property('photos', UploadedFileTO, True)

    @classmethod
    def from_model(cls, model, photos, general_settings):
        to = super(MerchantTO, cls).from_dict(model.to_dict(exclude=['photos']))
        to.photos = [UploadedFileTO.from_model(p, general_settings) for p in photos]
        return to


class UploadPhotoTO(TO):
    photo = unicode_property('photo')  # base64


class LinkQRTO(TO):
    qr_content = unicode_property('qr_content')
    merchant = typed_property('merchant', MerchantTO)  # type: MerchantTO


class UserInfoTO(TO):
    email = unicode_property('email')
    app_id = unicode_property('app_id')

    @property
    def app_user(self):
        if self.app_id != 'rogerthat':
            return users.User(u'%s:%s' % (self.email, self.app_id))
        return users.User(self.email)


class QRScanTO(UserInfoTO):
    qr_content = unicode_property('qr_content')
    project_id = long_property('project_id')


class MerchantStatisticsTO(TO):
    id = long_property('id')
    name = unicode_property('name')
    formatted_address = unicode_property('formatted_address')
    location = typed_property('location', GeoPointTO)
    total = long_property('total')


class MerchantStatisticsListTO(TO):
    cursor = unicode_property('cursor')
    more = bool_property('more')
    project_id = long_property('project_id')
    total = long_property('total')
    results = typed_property('results', MerchantStatisticsTO, True)


class UserSettingsTO(TO):
    tour_date = unicode_property('tour_date')


class RegisterAppleIdTO(TO):
    app_id = unicode_property('app_id')
    ios_dev_team = unicode_property('ios_dev_team')
