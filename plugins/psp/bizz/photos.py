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
import logging
from base64 import b64decode

from google.appengine.ext import ndb

import cloudstorage
from framework.bizz.job import run_job
from html2text import HTML2Text
from mcfw.exceptions import HttpBadRequestException, HttpNotFoundException
from plugins.psp.bizz.general import get_general_settings
from plugins.psp.bizz.places import get_place_details, get_place_photo
from plugins.psp.models import UploadedFile, Merchant, UploadedFileOrigin
from plugins.psp.to.config import get_psp_config, get_photo_gcs_path


def upload_merchant_photo(user_id, merchant_id, base64_photo):
    # type: (int, int, str) -> UploadedFile
    config = get_psp_config()
    try:
        # image/png;base64,<base64 encoded image>
        meta, encoded_photo = base64_photo.split(',')
        content_type = meta.split(';')[0]
        decoded_photo = b64decode(encoded_photo)
    except TypeError:
        raise HttpBadRequestException('psp.errors.invalid_image')
    photo_id = UploadedFile.allocate_ids(1)[0]

    gcs_path = get_photo_gcs_path(config, photo_id)
    with cloudstorage.open(gcs_path, 'w', content_type=content_type) as f:
        f.write(decoded_photo)

    @ndb.transactional(xg=True)
    def _save():
        photo = UploadedFile(key=UploadedFile.create_key(photo_id))
        photo.size = len(decoded_photo)
        photo.origin = UploadedFileOrigin.CLOUDSTORAGE
        photo.reference = gcs_path
        photo.uploaded_by = user_id
        merchant = Merchant.create_key(merchant_id).get()
        if not merchant:
            raise HttpBadRequestException('psp.errors.merchant_not_found')
        merchant.photos.append(photo.key)
        ndb.put_multi([photo, merchant])
        return photo

    return _save()


def remove_merchant_photo(merchant_id, photo_id):
    merchant, uploaded_file = ndb.get_multi([Merchant.create_key(merchant_id), UploadedFile.create_key(photo_id)])
    if not merchant:
        raise HttpBadRequestException('psp.errors.merchant_not_found')
    if not uploaded_file:
        raise HttpNotFoundException('psp.errors.file_not_found')
    try:
        cloudstorage.delete(uploaded_file.reference)
    except cloudstorage.NotFoundError:
        pass
    merchant.photos = [file_key for file_key in merchant.photos if file_key.id() != photo_id]
    merchant.put()
    uploaded_file.key.delete()


def sync_google_places():
    run_job(_get_all_merchants, [], sync_pictures_from_google_places, [])


def _get_all_merchants():
    return Merchant.query()


def sync_pictures_from_google_places(merchant_key):
    # type: (ndb.Key) -> list[UploadedFile]
    # Sync pictures from google places to our db
    merchant = merchant_key.get()  # type: Merchant
    if not merchant.place_id:
        return []
    general_settings = get_general_settings()
    place_details = get_place_details(general_settings, merchant.place_id, ['photos'])
    existing_photos = ndb.get_multi(merchant.photos)  # type: list[UploadedFile]
    to_delete = [p.key for p in existing_photos if p.origin == UploadedFileOrigin.GOOGLE_PLACES]
    new_photos = []
    # delete everything with origin from google places, and re-import.
    # Don't bother checking if we already have a reference since the reference changes every time you request a photo
    for photo in place_details.get('photos', []):
        ref = photo['photo_reference']
        photo_content, content_type = get_place_photo(general_settings, ref)
        new_photos.append(UploadedFile(
            size=len(photo_content),
            content_type=content_type,
            reference=ref,
            origin=UploadedFileOrigin.GOOGLE_PLACES,
            copyright='\n'.join(html_to_markdown(a) for a in photo['html_attributions'])
        ))
    if to_delete:
        logging.debug('Deleting %d old photos from google place', len(to_delete))
        ids_to_remove = [p.id() for p in to_delete]
        ndb.delete_multi(to_delete)
        merchant.photos = [p for p in merchant.photos if p.id() not in ids_to_remove]

    if new_photos:
        logging.debug('Adding %d photos from google place photos', len(new_photos))
        ndb.put_multi(new_photos)
        merchant.photos.extend([p.key for p in new_photos])
    merchant.put()
    return new_photos


def html_to_markdown(html_content, base_url=None):
    if not html_content:
        return html_content
    converter = HTML2Text(baseurl=base_url, bodywidth=0)
    converter.ignore_images = True
    return converter.handle(html_content)
