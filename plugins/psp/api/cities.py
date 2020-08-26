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

from framework.bizz.authentication import get_current_session
from mcfw.exceptions import HttpForbiddenException
from mcfw.restapi import rest, GenericRESTRequestHandler
from mcfw.rpc import returns, arguments
from plugins.basic_auth.bizz.user import get_permissions_from_roles
from plugins.psp.bizz.cities import create_city, update_city, get_city, list_cities, get_cities_by_ids, \
    add_app_to_apple_association
from plugins.psp.bizz.general import validate_admin_request_auth, validate_city_request_auth, get_general_settings
from plugins.psp.bizz.photos import upload_merchant_photo, remove_merchant_photo
from plugins.psp.bizz.projects import get_merchant, update_merchant
from plugins.psp.permissions import PspPermission, CityPermission
from plugins.psp.to import CityTO, AppCityTO, MerchantTO, RegisterAppleIdTO, UploadPhotoTO, UploadedFileTO
from typing import List, Union


def _get_city_ids_from_scopes(scopes):
    # type: (List[str]) -> List[long]
    city_ids = []
    for permission in scopes:
        if permission.startswith('role/psp.cities.'):
            city_id = permission.replace('role/psp.cities.', '').rsplit('.', 1)[0]
            city_ids.append(long(city_id))
    return city_ids


@rest('/cities', 'get')
@returns([CityTO])
@arguments()
def api_list_cities():
    session = get_current_session()
    if not session:
        raise HttpForbiddenException()
    permissions = get_permissions_from_roles(session.scopes)
    if PspPermission.LIST_CITY in permissions:
        cities = list_cities()
    else:
        cities = get_cities_by_ids(_get_city_ids_from_scopes(session.scopes))
    return [CityTO.from_model(model) for model in cities]


@rest('/cities', 'post', custom_auth_method=validate_admin_request_auth, scopes=PspPermission.CREATE_CITY)
@returns(CityTO)
@arguments(data=CityTO)
def api_create_city(data):
    return CityTO.from_model(create_city(data))


def _city_auth(func, handler):
    return validate_admin_request_auth(func, handler) or validate_city_request_auth(func, handler)


@rest('/cities/<city_id:[^/]+>', 'get', custom_auth_method=_city_auth,
      scopes=[CityPermission.GET_CITY, PspPermission.GET_CITY])
@returns((CityTO, AppCityTO))
@arguments(city_id=(int, long))
def api_get_city(city_id):
    handler = GenericRESTRequestHandler()
    handler.request = GenericRESTRequestHandler.get_current_request()
    city = get_city(city_id)
    if validate_admin_request_auth(api_get_city, handler):
        return CityTO.from_model(city)
    elif validate_city_request_auth(api_get_city, handler):
        return AppCityTO.from_model(city)
    raise HttpForbiddenException()


@rest('/cities/<city_id:[^/]+>', 'put', custom_auth_method=_city_auth,
      scopes=[CityPermission.UPDATE_CITY, PspPermission.UPDATE_CITY])
@returns((CityTO, AppCityTO))
@arguments(city_id=(int, long), data=CityTO)
def api_save_city(city_id, data):
    # type: (long, CityTO) -> Union[CityTO, AppCityTO]
    handler = GenericRESTRequestHandler()
    handler.request = GenericRESTRequestHandler.get_current_request()
    if validate_admin_request_auth(api_save_city, handler):
        return CityTO.from_model(update_city(city_id, data))
    elif validate_city_request_auth(api_save_city, handler):
        return AppCityTO.from_model(update_city(city_id, AppCityTO.from_dict(data.to_dict())))
    else:
        raise HttpForbiddenException()


@rest('/register-app', 'post', custom_auth_method=validate_admin_request_auth, scopes=PspPermission.CREATE_CITY)
@returns()
@arguments(data=RegisterAppleIdTO)
def api_register_app(data):
    # type: (RegisterAppleIdTO) -> None
    add_app_to_apple_association(data.app_id, data.ios_dev_team)


@rest('/cities/<city_id:[^/]+>/merchants/<merchant_id:[^/]+>', 'get',
      scopes=[PspPermission.GET_MERCHANT, CityPermission.GET_MERCHANT])
@returns(MerchantTO)
@arguments(city_id=(int, long), merchant_id=(int, long))
def api_get_merchant(city_id, merchant_id):
    merchant = get_merchant(merchant_id)
    photos = ndb.get_multi(merchant.photos) if merchant.photos else []
    return MerchantTO.from_model(merchant, photos, get_general_settings())


@rest('/cities/<city_id:[^/]+>/merchants/<merchant_id:[^/]+>', 'put',
      scopes=[PspPermission.UPDATE_MERCHANT, CityPermission.UPDATE_MERCHANT])
@returns(MerchantTO)
@arguments(city_id=(int, long), merchant_id=(int, long), data=MerchantTO)
def api_update_merchant(city_id, merchant_id, data):
    merchant = update_merchant(merchant_id, data)
    photos = ndb.get_multi(merchant.photos) if merchant.photos else []
    return MerchantTO.from_model(merchant, photos, get_general_settings())


@rest('/cities/<city_id:[^/]+>/merchants/<merchant_id:[^/]+>/photos', 'post',
      scopes=[PspPermission.UPDATE_MERCHANT, CityPermission.UPDATE_MERCHANT], silent=True)
@returns(UploadedFileTO)
@arguments(city_id=(int, long), merchant_id=(int, long), data=UploadPhotoTO)
def api_upload_merchant_photo(city_id, merchant_id, data):
    # type: (long, str, UploadPhotoTO) -> UploadedFileTO
    user_id = int(get_current_session().user_id)
    uploaded_file = upload_merchant_photo(user_id, merchant_id, data.photo)
    return UploadedFileTO.from_model(uploaded_file, get_general_settings())


@rest('/cities/<city_id:[^/]+>/merchants/<merchant_id:[^/]+>/photos/<photo_id:[^/]+>', 'delete',
      scopes=[PspPermission.UPDATE_MERCHANT, CityPermission.UPDATE_MERCHANT], silent=True)
@returns()
@arguments(city_id=(int, long), merchant_id=(int, long), photo_id=(int, long))
def api_delete_merchant_photo(city_id, merchant_id, photo_id):
    # type: (long, str, int) -> None
    remove_merchant_photo(merchant_id, photo_id)
