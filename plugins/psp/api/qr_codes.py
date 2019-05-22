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
from framework.bizz.authentication import get_browser_language
from mcfw.restapi import rest
from mcfw.rpc import returns, arguments
from plugins.psp.bizz.cities import get_city
from plugins.psp.bizz.places import get_opening_hours_info
from plugins.psp.bizz.qr_codes import list_qr_batches, download_qr_code_batch, create_qr_batch, link_qr_code
from plugins.psp.consts import PspPermission
from plugins.psp.to import QRBatchTO, LinkQRTO, MerchantTO


@rest('/qr-batches', 'get', scopes=PspPermission.LIST_QR_BATCHES)
@returns([dict])
@arguments(city_id=unicode)
def api_list_qr_batches(city_id):
    return [b.to_dict() for b in list_qr_batches(city_id)]


@rest('/qr-batches', 'post', scopes=PspPermission.CREATE_QR_BATCH)
@returns(QRBatchTO)
@arguments(data=QRBatchTO)
def api_create_qr_batch(data):
    # type: (QRBatchTO) -> QRBatchTO
    return QRBatchTO.from_model(create_qr_batch(data))


@rest('/qr-batches/<batch_id:[^/]+>/download', 'get', scopes=PspPermission.GET_QR_BATCH)
@returns(dict)
@arguments(batch_id=(int, long))
def api_download_qr_batch(batch_id):
    return {'download_url': download_qr_code_batch(batch_id)}


@rest('/cities/<city_id:[^/]+>/link', 'post', scopes=PspPermission.CREATE_MERCHANT)
@returns(MerchantTO)
@arguments(city_id=unicode, data=LinkQRTO)
def api_link_qr(city_id, data):
    lang = get_browser_language()
    merchant = link_qr_code(city_id, data)
    city = get_city(city_id)
    return MerchantTO.from_model(merchant, *get_opening_hours_info(merchant.opening_hours, city.timezone, lang))
