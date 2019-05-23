# -*- coding: utf-8 -*-
# Copyright 2019 Green Valley NV
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
from mcfw.restapi import rest
from mcfw.rpc import returns, arguments
from plugins.psp.bizz.projects import get_merchant, update_merchant
from plugins.psp.consts import PspPermission
from plugins.psp.to import MerchantTO


@rest('/merchants/<merchant_id:[^/]+>', 'get', scopes=PspPermission.GET_MERCHANT)
@returns(MerchantTO)
@arguments(merchant_id=(int, long))
def api_get_merchant(merchant_id):
    return MerchantTO.from_model(get_merchant(merchant_id))


@rest('/merchants/<merchant_id:[^/]+>', 'put', scopes=PspPermission.UPDATE_MERCHANT)
@returns(MerchantTO)
@arguments(merchant_id=(int, long), data=MerchantTO)
def api_update_merchant(merchant_id, data):
    return MerchantTO.from_model(update_merchant(merchant_id, data))
