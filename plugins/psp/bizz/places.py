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
import json
import logging
import urllib
from collections import defaultdict

from google.appengine.api import urlfetch

import pytz
from babel.dates import format_date, format_time
from framework.i18n_utils import translate
from mcfw.exceptions import HttpException
from plugins.psp.bizz.general import get_general_settings
from plugins.psp.consts import PREFIX
from plugins.psp.models import OpeningHour, OpeningPeriod

MIDNIGHT = datetime.time(hour=0, minute=0)
_NAMES = {}


def search_places(query, location):
    # type: (str, str) -> object
    parameters = {
        'key': get_general_settings().google_maps_key,
        'fields': 'geometry,name,place_id,formatted_address',
    }
    if location:
        parameters.update({'location': location, 'keyword': query, 'rankby': 'distance'})
        api = 'nearbysearch'
    else:
        parameters.update({'inputtype': 'textquery', 'input': query})
        api = 'findplacefromtext'
    url = 'https://maps.googleapis.com/maps/api/place/%s/json?%s' % (api, urllib.urlencode(parameters))
    result = urlfetch.fetch(url)  # type: urlfetch._URLFetchResult
    if result.status_code == 200:
        content = json.loads(result.content)
        if content['status'] in ('OK', 'ZERO_RESULTS'):
            if api == 'nearbysearch':
                return content['results']
            else:
                return content['candidates']
    logging.error('Error while searching for places: %s', result.content)
    err = HttpException(result.content)
    err.http_code = result.status_code
    raise err


def get_place_details(place_id):
    # type: (str) -> dict
    parameters = {
        'key': get_general_settings().google_maps_key,
        'placeid': place_id,
        'fields': 'geometry,name,place_id,formatted_address,opening_hours,formatted_phone_number,website',
    }
    url = 'https://maps.googleapis.com/maps/api/place/details/json?%s' % (urllib.urlencode(parameters))
    result = urlfetch.fetch(url)
    if result.status_code == 200:
        content = json.loads(result.content)
        if content['status'] == 'OK':
            return content['result']
    err = HttpException(result.content)
    err.http_code = result.status_code
    raise err


def is_always_open(opening_hours):
    # type: (list[OpeningPeriod]) -> bool
    # If a place is always open, close will be None.
    # Always-open is represented as an open period containing day with value 0 and time with value 0000, and no close.
    if len(opening_hours) != 1:
        return False

    period = opening_hours[0]
    if period.close or not period.open:
        return False

    return period.open.day == 0 and period.open.time == '0000'


def get_opening_hours_info(opening_hours, timezone, lang):
    # type: (list[OpeningPeriod], unicode, unicode) -> [bool, unicode, [unicode]]
    now_open, open_until = is_now_open(opening_hours, timezone, lang)
    weekday_text = get_weekday_text(opening_hours, lang)
    return now_open, open_until, weekday_text


def is_now_open(opening_hours, timezone, lang):
    # type: ([OpeningPeriod], unicode, unicode) -> (bool, unicode)
    now = datetime.datetime.utcnow()
    now += pytz.timezone(timezone).utcoffset(now)
    return get_open_until(opening_hours, now, lang)


def get_open_until(opening_hours, now, lang):
    # type: (list[OpeningPeriod], datetime.datetime, unicode) -> [bool, unicode]
    if is_always_open(opening_hours):
        return True, translate(lang, PREFIX, 'open_24_hours')

    weekday = _get_weekday(now)
    now_time = datetime.time(now.hour, now.minute)
    for period in opening_hours:
        if period.open and period.close:
            if period.open.day == weekday:
                if now_time >= period.open.datetime:
                    if period.close.day != weekday:
                        day_name = _get_weekday_names(lang)[period.close.day]
                        hour_str = _format_opening_hour(period and period.close, lang)
                        open_until_str = translate(lang, PREFIX, 'open_until', time='%s %s' % (day_name, hour_str))
                        return True, open_until_str
                    elif now_time < period.close.datetime:
                        return True, _format_open_until(period, lang)

            elif period.close.day == weekday:
                # open.day != weekday, only needed to check the time
                if now_time < period.close.datetime:
                    return True, _format_open_until(period, lang)
        elif period.open:
            # close is NULL
            if period.open.day == weekday and now_time >= period.open.datetime:
                return True, _format_open_until(None, lang)
        elif period.close:
            # open is NULL
            if period.close.day == weekday and now_time < period.close.datetime:
                return True, _format_open_until(period, lang)

    return False, translate(lang, PREFIX, 'closed')


def _format_open_until(period, lang):
    return translate(lang, PREFIX, 'open_until', time=_format_opening_hour(period and period.close, lang))


def _get_weekday(datetime):
    return (datetime.weekday() + 1) % 7


def _get_weekday_names(lang):
    # type: (unicode) -> dict
    if lang in _NAMES:
        return _NAMES[lang]
    day_names = {}
    today = datetime.datetime.today()
    for days in xrange(7):
        date = today + datetime.timedelta(days=days)
        weekday = _get_weekday(date)
        day_names[weekday] = format_date(date, 'EEEE', locale=lang)
    _NAMES[lang] = day_names
    return day_names


def _format_opening_hour(opening_hour, lang):
    # type: (OpeningHour, unicode) -> unicode
    return format_time(opening_hour and opening_hour.datetime or MIDNIGHT, 'short', locale=lang)


def get_weekday_text(opening_hours, lang):
    # type: (list[OpeningPeriod], unicode) -> list[unicode]
    if is_always_open(opening_hours):
        open_24_h = translate(lang, PREFIX, 'open_24_hours')
        periods = {x: [open_24_h] for x in xrange(7)}
    else:
        periods = defaultdict(list)
        for period in sorted(opening_hours, key=lambda p: (p.open and p.open.day, p.open and p.open.time)):
            weekday = period.open.day if period.open else period.close.day
            other_day = period.open and period.close and period.open.day != period.close.day
            start = None if other_day and not period.open and period.close else period.open
            stop = None if other_day and period.open else period.close
            periods[weekday].append('%s - %s' % (_format_opening_hour(start, lang),
                                                 _format_opening_hour(stop, lang)))
            if other_day:
                diff = period.close.day - period.open.day
                if diff < 0:
                    diff += 7
                for x in xrange(diff):
                    weekday = (period.open.day + x + 1) % 7
                    start = None
                    stop = None if period.close.day != weekday else period.close
                    periods[weekday].append('%s - %s' % (_format_opening_hour(start, lang),
                                                         _format_opening_hour(stop, lang)))

    result = []
    closed = [translate(lang, PREFIX, 'closed')]
    day_names = _get_weekday_names(lang)
    for day in [1, 2, 3, 4, 5, 6, 0]:  # Monday, Tuesday, ..., Sunday
        result.append('%s: %s' % (day_names[day], ', '.join(periods.get(day, closed))))

    return result
