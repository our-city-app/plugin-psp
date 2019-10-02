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
from urlparse import urlparse

from google.appengine.api.app_identity import app_identity
from google.appengine.ext import ndb
from google.appengine.ext.deferred import deferred

import cloudstorage
from mcfw.consts import MISSING
from mcfw.exceptions import HttpBadRequestException, HttpNotFoundException, HttpConflictException
from plugins.psp.bizz.cities import get_city
from plugins.psp.bizz.general import get_general_settings
from plugins.psp.bizz.photos import sync_pictures_from_google_places
from plugins.psp.bizz.gcs_util import get_gcs_url
from plugins.psp.bizz.projects import _update_merchant
from plugins.psp.consts import NAMESPACE
from plugins.psp.models import QRBatch, QRCode, Merchant
from plugins.psp.to import LinkQRTO


def list_qr_batches(city_id):
    # type: (unicode) -> list[QRBatch]
    return sorted(QRBatch.list_by_city(city_id), key=lambda q: q.date, reverse=True)


def create_qr_batch(city_id, amount):
    # type: (unicode, long) -> QRBatch
    settings = get_general_settings()
    get_city(city_id)
    batch = QRBatch(city_id=city_id, amount=amount, namespace=NAMESPACE)
    batch.put()
    min_id, max_id = QRCode.allocate_ids(amount)
    iterable = xrange(min_id, max_id + 1)
    to_put = [QRCode(key=QRCode.create_key(id_),
                     city_id=city_id,
                     batch_id=batch.id,
                     content='%s/qr/%s/%s' % (settings.qr_domain, city_id, id_)) for id_ in iterable]
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
    return get_gcs_url(file_path)


def link_qr_code(city_id, data):
    # type: (unicode, LinkQRTO) -> Merchant
    get_city(city_id)
    place_id = MISSING.default(data.merchant.place_id, None)
    url = urlparse(data.qr_content)
    split_path = url.path.strip('/').split('/')
    try:
        if split_path[0] != 'qr':
            raise HttpBadRequestException('psp.errors.invalid_qr_code')
        if split_path[1] != city_id:
            raise HttpBadRequestException('psp.errors.qr_code_for_different_city', {'expected': city_id,
                                                                                    'actual': split_path[1]})
        qr_id = long(split_path[2])
    except TypeError:
        raise HttpBadRequestException('psp.errors.invalid_qr_code')

    qr = QRCode.create_key(qr_id).get()  # type: QRCode
    if not qr:
        raise HttpNotFoundException('psp.errors.qr_code_not_found', {'id': qr_id})
    if qr.merchant_id:
        name = Merchant.create_key(qr.merchant_id).get().name
        raise HttpConflictException('psp.errors.qr_already_linked', {'id': qr.merchant_id, 'name': name})
    if place_id:
        merchant = Merchant.list_by_place_id(data.merchant.place_id).get()
        if merchant:
            raise HttpConflictException('psp.errors.merchant_exists', {'merchant_id': merchant.id})
    merchant = Merchant()
    merchant.city_id = city_id
    _update_merchant(merchant, data.merchant)
    merchant.put()
    qr.merchant_id = merchant.id
    qr.put()
    deferred.defer(sync_pictures_from_google_places, merchant.key)
    return merchant
