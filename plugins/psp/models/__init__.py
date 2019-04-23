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

import random

from google.appengine.ext import ndb

from framework.models.common import NdbModel
from mcfw.cache import CachedModelMixIn, invalidate_cache
from mcfw.serialization import register, List, s_any, ds_any
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


class ProjectBudget(ndb.Model):
    amount = ndb.IntegerProperty(indexed=False)  # amount in `currency`, no demicals
    currency = ndb.StringProperty(indexed=False)


class Project(CachedModelMixIn, NdbModel):
    NAMESPACE = NAMESPACE
    title = ndb.StringProperty(indexed=False)
    description = ndb.TextProperty()
    start_time = ndb.DateTimeProperty()
    end_time = ndb.DateTimeProperty()
    budget = ndb.LocalStructuredProperty(ProjectBudget)
    action_count = ndb.IntegerProperty(indexed=False)

    @property
    def id(self):
        return self.key.id()

    @property
    def city_id(self):
        return self.key.parent().id()

    @classmethod
    def create_key(cls, city_id, project_id):
        return ndb.Key(cls, project_id, parent=City.create_key(city_id), namespace=NAMESPACE)

    @classmethod
    def list_by_city(cls, city_id):
        return cls.query(ancestor=City.create_key(city_id)).order(-cls.start_time)

    @classmethod
    def list_projects_after(cls, city_id, timestamp):
        return cls.query(ancestor=City.create_key(city_id)) \
            .filter(cls.start_time < timestamp)

    def invalidateCache(self):
        from plugins.psp.bizz.projects import list_active_projects
        invalidate_cache(list_active_projects, self.city_id)


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
    time = ndb.StringProperty(indexed=False)

    @classmethod
    def from_to(cls, to):
        if not to:
            return None
        return cls(day=to.day, time=to.time)


class OpeningPeriod(NdbModel):
    # open contains a pair of day and time objects describing when the place opens:
    open = ndb.LocalStructuredProperty(OpeningHour)
    # close may contain a pair of day and time objects describing when the place closes.
    close = ndb.LocalStructuredProperty(OpeningHour)
    # Note: If a place is always open, close will be None.
    # Always-open is represented as an open period containing day with value 0 and time with value 0000, and no close.
    @classmethod
    def from_to(cls, period):
        return cls(close=OpeningHour.from_to(period.close), open=OpeningHour.from_to(period.open))


class Merchant(NdbModel):
    NAMESPACE = NAMESPACE
    name = ndb.StringProperty(indexed=False)
    formatted_address = ndb.TextProperty()
    location = ndb.GeoPtProperty()
    opening_hours = ndb.LocalStructuredProperty(OpeningPeriod, repeated=True)
    city_id = ndb.StringProperty()
    qr_id = ndb.IntegerProperty()
    place_id = ndb.StringProperty()

    @property
    def id(self):
        return self.key.id()

    @classmethod
    def list_by_city_id(cls, city_id):
        return cls.query().filter(cls.city_id == city_id)  # .order(cls.name)

    @classmethod
    def list_by_place_id(cls, place_id):
        return cls.query().filter(cls.place_id == place_id)

    @classmethod
    def create_key(cls, merchant_id):
        return ndb.Key(cls, merchant_id, namespace=NAMESPACE)


class Scan(NdbModel):
    NAMESPACE = NAMESPACE
    timestamp = ndb.DateTimeProperty(auto_now_add=True)
    app_user = ndb.StringProperty()
    merchant_id = ndb.IntegerProperty()
    project_id = ndb.IntegerProperty()

    @property
    def id(self):
        return self.key.id()

    @classmethod
    def list_by_user(cls, app_user, project_id):
        return cls.query().filter(Scan.app_user == app_user).filter(Scan.project_id == project_id)


class ProjectStatisticShardConfig(NdbModel):
    shard_count = ndb.IntegerProperty(default=5)  # increase as needed. 5 => ~5 writes (project scans) / sec

    @property
    def project_id(self):
        return self.key.id()

    def get_random_shard_number(self):
        return random.randint(0, self.shard_count - 1)

    def get_random_shard_key(self):
        return ProjectStatisticShard.create_key(
            ProjectStatisticShard.SHARD_KEY_TEMPLATE % (self.project_id, self.get_random_shard_number()))

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
        shard_key_strings = [ProjectStatisticShard.SHARD_KEY_TEMPLATE % (project_id, i)
                             for i in range(config.shard_count)]
        return [ProjectStatisticShardConfig.create_key(shard_key) for shard_key in shard_key_strings]


class ProjectStatisticShard(NdbModel):
    NAMESPACE = NAMESPACE
    SHARD_KEY_TEMPLATE = '%d-%d'
    total = ndb.IntegerProperty(indexed=False, default=0)
    merchants = ndb.JsonProperty(compressed=True)  # {str(merchant_id): count}


class ProjectUserStaticstics(NdbModel):
    NAMESPACE = NAMESPACE
    total = ndb.IntegerProperty(indexed=False, default=0)
    last_entry = ndb.DateTimeProperty(auto_now=True)

    @classmethod
    def create_key(cls, project_id, app_user):
        return ndb.Key(cls, project_id, parent=ndb.Key('psp', app_user.email(), namespace=NAMESPACE),
                       namespace=NAMESPACE)


register(List(Project), s_any, ds_any)
register(List(Merchant), s_any, ds_any)
