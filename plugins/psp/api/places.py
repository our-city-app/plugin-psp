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
from mcfw.restapi import rest
from mcfw.rpc import returns, arguments
from plugins.psp.bizz.places import search_places, get_place_details
from plugins.psp.consts import PspPermission


@rest('/places', 'get', silent_result=True, scopes=PspPermission.CREATE_MERCHANT)
@returns([dict])
@arguments(query=unicode, location=unicode)
def api_search_places(query, location=None):
    return search_places(query, location)


@rest('/places/<place_id:[^/]+>', 'get', silent_result=True, scopes=PspPermission.CREATE_MERCHANT)
@returns(dict)
@arguments(place_id=unicode)
def api_place_details(place_id):
    return get_place_details(place_id)
