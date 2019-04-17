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

from google.appengine.api.app_identity import app_identity
from google.appengine.ext import ndb

import cloudstorage
from cloudstorage.common import LOCAL_GCS_ENDPOINT
from framework.consts import get_base_url
from mcfw.consts import DEBUG
from plugins.psp.bizz.cities import get_city
from plugins.psp.bizz.general import get_general_settings
from plugins.psp.consts import NAMESPACE
from plugins.psp.models import QRBatch, QRCode
from plugins.psp.to import QRBatchTO


def list_qr_batches(city_id):
    # type: (unicode) -> list[QRBatch]
    return sorted(QRBatch.list_by_city(city_id), key=lambda q: q.date, reverse=True)


def create_qr_batch(data):
    # type: (QRBatchTO) -> QRBatch
    settings = get_general_settings()
    get_city(data.city_id)
    batch = QRBatch(city_id=data.city_id, amount=data.amount, namespace=NAMESPACE)
    batch.put()
    min_id, max_id = QRCode.allocate_ids(data.amount)
    iterable = xrange(min_id, max_id + 1)
    to_put = [QRCode(key=QRCode.create_key(id_),
                     city_id=data.city_id,
                     batch_id=batch.id,
                     content='%s/%s/psp-admin/%s' % (settings.qr_domain, data.city_id, id_)) for id_ in iterable]
    ndb.put_multi(to_put)
    return batch


def download_qr_code_batch(batch_id):
    qr_codes = QRCode.list_by_batch(batch_id)  # type: list[QRCode]
    bucket = app_identity.get_default_gcs_bucket_name()
    # TODO: Correct output format (png files?)
    file_path = '/%s/qr-batches/%d.csv' % (bucket, batch_id)
    with cloudstorage.open(file_path, 'w') as f:
        f.write('Url\n')
        f.write('\n'.join(qr.content for qr in qr_codes).encode('utf-8'))
    return get_serving_url(file_path)


def get_serving_url(filename):
    if DEBUG:
        return '%s%s%s' % (get_base_url(), LOCAL_GCS_ENDPOINT, filename)
    return 'https://storage.googleapis.com%s' % filename
