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

import datetime
import random
from urllib import urlencode

from google.appengine.ext import ndb

from framework.consts import get_base_url
from framework.models.common import NdbModel
from mcfw.cache import CachedModelMixIn, invalidate_cache
from mcfw.consts import DEBUG
from mcfw.serialization import register, List, s_any, ds_any
from plugins.psp.bizz.gcs_util import get_gcs_url


def parent_key(user):
    return ndb.Key('User', user.email())


class UploadedFileOrigin(object):
    CLOUDSTORAGE = 1
    GOOGLE_PLACES = 2

    @classmethod
    def all(cls):
        return [cls.CLOUDSTORAGE, cls.GOOGLE_PLACES]


class UploadedFile(NdbModel):
    reference = ndb.StringProperty(indexed=False)
    origin = ndb.IntegerProperty(indexed=False, choices=UploadedFileOrigin.all())
    uploaded_by = ndb.IntegerProperty()
    content_type = ndb.StringProperty(indexed=False)
    created_on = ndb.DateTimeProperty(auto_now_add=True)
    size = ndb.IntegerProperty(indexed=False)  # in bytes
    copyright = ndb.TextProperty()

    @property
    def id(self):
        return self.key.id()

    @classmethod
    def create_key(cls, file_id):
        return ndb.Key(cls, file_id)

    @classmethod
    def file_url(cls, general_settings, origin, reference):
        # type: (GeneralSettings, int, str) -> str
        if origin == UploadedFileOrigin.CLOUDSTORAGE:
            return get_gcs_url(reference)
        elif origin == UploadedFileOrigin.GOOGLE_PLACES:
            if not general_settings.google_maps_client_key:
                raise Exception('google_maps_client_key is not set on GeneralSettings')
            parameters = {
                'key': general_settings.google_maps_client_key,
                'photoreference': reference,
                'maxheight': 600,
            }
            return 'https://maps.googleapis.com/maps/api/place/photo?%s' % (urlencode(parameters))
        else:
            raise Exception('Invalid origin %s, reference %s' % (origin, reference))

    @classmethod
    def url(cls, file_id):
        return '%s/files/%s' % (get_base_url(), file_id)


class GeneralSettings(NdbModel):
    secret = ndb.StringProperty(indexed=False)
    qr_domain = ndb.StringProperty(indexed=False)
    google_maps_key = ndb.StringProperty(indexed=False)
    google_maps_client_key = ndb.StringProperty(indexed=False)

    @classmethod
    def create_key(cls):
        return ndb.Key(cls, 'GeneralSettings')

    @classmethod
    def instance(cls):
        return cls.create_key().get()


class City(NdbModel):
    app_id = ndb.StringProperty()
    secret = ndb.StringProperty(indexed=False)
    api_key = ndb.StringProperty(indexed=False)
    avatar_url = ndb.StringProperty(indexed=False)
    name = ndb.StringProperty()
    info = ndb.TextProperty()
    timezone = ndb.StringProperty(indexed=False, default='Europe/Brussels')
    # minimum time between 2 scans at the same merchant
    min_interval = ndb.IntegerProperty(indexed=False, default=30 if DEBUG else 7200)

    @property
    def id(self):
        return self.key.id()

    @classmethod
    def create_key(cls, city_id):
        return ndb.Key(cls, city_id)

    @classmethod
    def list(cls):
        return cls.query().order(cls.name)


class ProjectBudget(ndb.Model):
    amount = ndb.IntegerProperty(indexed=False)  # amount in `currency`, no demicals
    currency = ndb.StringProperty(indexed=False)


class Project(CachedModelMixIn, NdbModel):
    title = ndb.StringProperty(indexed=False)
    description = ndb.TextProperty()
    start_date = ndb.DateTimeProperty()
    end_date = ndb.DateTimeProperty()
    budget = ndb.LocalStructuredProperty(ProjectBudget)
    action_count = ndb.IntegerProperty(indexed=False)
    city_id = ndb.IntegerProperty()

    @property
    def id(self):
        return self.key.id()

    @property
    def is_active(self):
        now = datetime.datetime.now()
        has_started = self.start_date is None or self.start_date < now
        has_not_ended = self.end_date is None or self.end_date > now
        return has_started and has_not_ended

    @classmethod
    def create_key(cls, city_id, project_id):
        return ndb.Key(cls, project_id, parent=City.create_key(city_id))

    @classmethod
    def list_by_city(cls, city_id):
        return cls.query(ancestor=City.create_key(city_id)).order(-cls.start_date)

    @classmethod
    def list_projects_after(cls, timestamp, city_id=None):
        kwargs = {}
        if city_id:
            kwargs['ancestor'] = City.create_key(city_id)
        return cls.query(**kwargs).filter(cls.start_date < timestamp)

    def invalidateCache(self):
        from plugins.psp.bizz.projects import list_active_project_keys
        invalidate_cache(list_active_project_keys, self.city_id)


class QRBatch(NdbModel):
    date = ndb.DateTimeProperty(auto_now_add=True)
    city_id = ndb.IntegerProperty()
    amount = ndb.IntegerProperty(indexed=False)

    @property
    def id(self):
        return self.key.id()

    @classmethod
    def create_key(cls, id_):
        return ndb.Key(cls, id_)

    @classmethod
    def list_by_city(cls, city_id):
        return cls.query(cls.city_id == city_id)


class QRCode(NdbModel):
    city_id = ndb.IntegerProperty()
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
        return ndb.Key(cls, id_)


def _validate_opening_time(prop, value):
    if value is None or len(value) == 4:
        return value

    raise ValueError('OpeningHour.time should be None or have length 4. Got "%s".' % value)


class OpeningHour(ndb.Model):
    # day: a number from 0–6, corresponding to the days of the week, starting on Sunday. For example, 2 means Tuesday.
    day = ndb.IntegerProperty(indexed=False)
    # time may contain a time in 24-hour hhmm format. Values are in the range 0000–2359 (in the place's time zone).
    time = ndb.StringProperty(indexed=False, validator=_validate_opening_time)

    @property
    def datetime(self):
        return self.time and datetime.time(hour=int(self.time[:2]), minute=int(self.time[2:]))

    @classmethod
    def from_to(cls, to):
        if not to:
            return None
        return cls(day=to.day, time=to.time)


class OpeningPeriod(NdbModel):
    # open contains a pair of day and time objects describing when the place opens:
    open = ndb.LocalStructuredProperty(OpeningHour)  # type: OpeningHour
    # close may contain a pair of day and time objects describing when the place closes.
    close = ndb.LocalStructuredProperty(OpeningHour)  # type: OpeningHour
    # Note: If a place is always open, close will be None.
    # Always-open is represented as an open period containing day with value 0 and time with value 0000, and no close.

    @classmethod
    def from_to(cls, period):
        return cls(close=OpeningHour.from_to(period.close), open=OpeningHour.from_to(period.open))


class Merchant(NdbModel):
    name = ndb.StringProperty()
    formatted_address = ndb.TextProperty()
    location = ndb.GeoPtProperty()
    opening_hours = ndb.LocalStructuredProperty(OpeningPeriod, repeated=True)
    city_id = ndb.IntegerProperty()
    qr_id = ndb.IntegerProperty()
    place_id = ndb.StringProperty()
    formatted_phone_number = ndb.StringProperty(indexed=False)
    website = ndb.StringProperty(indexed=False)
    photos = ndb.KeyProperty(kind=UploadedFile, repeated=True)

    @property
    def id(self):
        return self.key.id()

    @classmethod
    def list_by_city_id(cls, city_id):
        return cls.query().filter(cls.city_id == city_id).order(cls.name)

    @classmethod
    def list_by_place_id(cls, place_id):
        return cls.query().filter(cls.place_id == place_id)

    @classmethod
    def create_key(cls, merchant_id):
        return ndb.Key(cls, merchant_id)


class Scan(NdbModel):
    timestamp = ndb.DateTimeProperty(auto_now_add=True)
    merchant_id = ndb.IntegerProperty()
    project_id = ndb.IntegerProperty()
    user_id = ndb.StringProperty()

    @property
    def id(self):
        return self.key.id()

    @classmethod
    def list_by_user(cls, app_user, project_id):
        return cls.query() \
            .filter(cls.user_id == app_user.email()) \
            .filter(Scan.project_id == project_id)

    @classmethod
    def get_recent_scan(cls, app_user, merchant_id, max_date_time):
        return cls.query() \
            .filter(cls.user_id == app_user.email()) \
            .filter(Scan.merchant_id == merchant_id) \
            .filter(Scan.timestamp > max_date_time).get()


class ProjectStatisticShard(NdbModel):
    SHARD_KEY_TEMPLATE = '%d-%d'
    total = ndb.IntegerProperty(indexed=False, default=0)
    merchants = ndb.JsonProperty(compressed=True)  # {str(merchant_id): count}

    @classmethod
    def create_key(cls, project_id, shard_number):
        return ndb.Key(cls, cls.SHARD_KEY_TEMPLATE % (project_id, shard_number))


class ProjectStatisticShardConfig(NdbModel):
    shard_count = ndb.IntegerProperty(default=5)  # increase as needed. 5 => ~5 writes (project scans) / sec

    @property
    def project_id(self):
        return self.key.id()

    def get_random_shard_number(self):
        return random.randint(0, self.shard_count - 1)

    def get_random_shard_key(self):
        return ProjectStatisticShard.create_key(self.project_id, self.get_random_shard_number())

    @classmethod
    def create_key(cls, project_id):
        return ndb.Key(cls, project_id)

    @classmethod
    def get_all_keys(cls, project_id):
        key = cls.create_key(project_id)
        config = key.get()
        if not config:
            config = cls(key=key)
            config.put()
        return [ProjectStatisticShard.create_key(project_id, i) for i in xrange(config.shard_count)]


class ProjectUserStatistics(NdbModel):
    total = ndb.IntegerProperty(indexed=False, default=0)
    last_entry = ndb.DateTimeProperty(auto_now=True)

    @classmethod
    def create_key(cls, project_id, app_user):
        return ndb.Key(cls, project_id, parent=parent_key(app_user))


class UserSettings(NdbModel):
    tour_date = ndb.DateTimeProperty(indexed=False)

    @classmethod
    def create_key(cls, app_user_email):
        return ndb.Key(cls, app_user_email)


register(List(ndb.Key), s_any, ds_any)
register(List(Merchant), s_any, ds_any)


class AppleAppAssociation(NdbModel):
    config = ndb.JsonProperty()

    @classmethod
    def create_key(cls):
        return ndb.Key(cls, 'config')
