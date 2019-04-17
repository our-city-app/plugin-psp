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

from google.appengine.ext import ndb

from framework.models.common import NdbModel
from plugins.psp.consts import NAMESPACE


class GeneralSettings(NdbModel):
    NAMESPACE = NAMESPACE

    secret = ndb.StringProperty(indexed=False)
    qr_domain = ndb.StringProperty(indexed=False)
    google_maps_key = ndb.StringProperty(indexed=False)

    @classmethod
    def create_key(cls):
        return ndb.Key(cls, 'GeneralSettings', namespace=NAMESPACE)

    @classmethod
    def instance(cls):
        return cls.create_key().get()


class City(NdbModel):
    NAMESPACE = NAMESPACE
    secret = ndb.StringProperty(indexed=False)
    api_key = ndb.StringProperty(indexed=False)
    avatar_url = ndb.StringProperty(indexed=False)
    name = ndb.StringProperty()

    @property
    def id(self):
        return self.key.id().decode('utf-8')

    @classmethod
    def create_key(cls, city_id):
        return ndb.Key(cls, city_id, namespace=NAMESPACE)

    @classmethod
    def list(cls):
        return cls.query().order(cls.name)


class Project(NdbModel):
    NAMESPACE = NAMESPACE
    title = ndb.StringProperty(indexed=False)
    description = ndb.TextProperty()
    start_time = ndb.DateTimeProperty()
    end_time = ndb.DateTimeProperty()
    target_budget = ndb.IntegerProperty(indexed=False)
    target_scan_count = ndb.IntegerProperty(indexed=False)

    @property
    def id(self):
        return self.key.id()


class QRBatch(NdbModel):
    NAMESPACE = NAMESPACE
    date = ndb.DateTimeProperty(auto_now_add=True)
    city_id = ndb.StringProperty()
    amount = ndb.IntegerProperty(indexed=False)

    @property
    def id(self):
        return self.key.id()

    @classmethod
    def create_key(cls, id_):
        return ndb.Key(cls, id_, namespace=NAMESPACE)

    @classmethod
    def list_by_city(cls, city_id):
        return cls.query(cls.city_id == city_id)


class QRCode(NdbModel):
    NAMESPACE = NAMESPACE
    city_id = ndb.StringProperty()
    merchant_id = ndb.IntegerProperty()
    batch_id = ndb.IntegerProperty()
    content = ndb.StringProperty(indexed=False)  # Should be an url

    @property
    def id(self):
        return self.key.id()

    @classmethod
    def list_by_batch(cls, batch_id):
        return cls.query(cls.batch_id == batch_id)

    @classmethod
    def create_key(cls, id_):
        return ndb.Key(cls, id_, namespace=NAMESPACE)


class OpeningHour(ndb.Model):
    # day: a number from 0–6, corresponding to the days of the week, starting on Sunday. For example, 2 means Tuesday.
    day = ndb.IntegerProperty(indexed=False)
    # time may contain a time in 24-hour hhmm format. Values are in the range 0000–2359 (in the place's time zone).
    time = ndb.StringProperty(indexed=False, repeated=True)


class OpeningPeriod(NdbModel):
    # open contains a pair of day and time objects describing when the place opens:
    open = ndb.LocalStructuredProperty(OpeningHour)
    # close may contain a pair of day and time objects describing when the place closes.
    close = ndb.LocalStructuredProperty(OpeningHour)
    # Note: If a place is always open, close will be None.
    # Always-open is represented as an open period containing day with value 0 and time with value 0000, and no close.


class Merchant(NdbModel):
    NAMESPACE = NAMESPACE
    name = ndb.StringProperty(indexed=False)
    address = ndb.TextProperty()
    opening_hours = ndb.LocalStructuredProperty(OpeningPeriod)
    city_id = ndb.IntegerProperty()
    qr_id = ndb.IntegerProperty()
    google_place_id = ndb.StringProperty()

    @property
    def id(self):
        return self.key.id()


class Scan(NdbModel):
    NAMESPACE = NAMESPACE
    timestamp = ndb.DateTimeProperty(auto_now_add=True)
    app_user = ndb.StringProperty()
    merchant_id = ndb.IntegerProperty()
    project_id = ndb.IntegerProperty()

    @property
    def id(self):
        return self.key.id()
