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

from collections import defaultdict
import datetime
import json
import logging
import urllib

from babel.dates import format_date, format_time
from framework.i18n_utils import translate
from google.appengine.api import urlfetch
from mcfw.exceptions import HttpException
from plugins.psp.bizz.general import get_general_settings
from plugins.psp.consts import PREFIX


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
    else:
        logging.error('Error while searching for places: %s', result.content)
        err = HttpException(result.content)
        err.http_code = result.status_code
        raise err


def get_place_details(place_id):
    # type: (str) -> dict
    parameters = {
        'key': get_general_settings().google_maps_key,
        'placeid': place_id,
        'fields': 'geometry,name,place_id,formatted_address,opening_hours',
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
    # type: [OpeningPeriod] -> bool
    # If a place is always open, close will be None.
    # Always-open is represented as an open period containing day with value 0 and time with value 0000, and no close.
    if len(opening_hours) != 1:
        return False

    period = opening_hours[0]
    if period.close or not period.open:
        return False

    return period.open.day == 0 and period.open.time == '0000'


def is_open(opening_hours, now):
    # type: ([OpeningPeriod], unicode) -> bool
    if is_always_open(opening_hours):
        return True

    weekday = get_weekday(now)
    now_time = datetime.time(now.hour, now.minute)
    for period in opening_hours:
        if period.open and period.close:
            if period.open.day == weekday:
                if now_time >= period.open.datetime:
                    if period.close.day != weekday or now_time < period.close.datetime:
                        return True
            elif period.close.day == weekday:
                # open.day != weekday, only needed to check the time
                if now_time < period.close.datetime:
                    return True
        elif period.open:
            # close is NULL
            if period.open.day == weekday and now_time >= period.open.datetime:
                return True
        elif period.close:
            # open is NULL
            if period.close.day == weekday and now_time < period.close.datetime:
                return True

    return False


def get_weekday(datetime):
    return (datetime.weekday() + 1) % 7


def get_weekday_names(lang):
    # type: unicode -> dict
    day_names = {}
    today = datetime.datetime.today()
    for days in xrange(7):
        date = today + datetime.timedelta(days=days)
        weekday = get_weekday(date)
        day_names[weekday] = format_date(date, 'EEEE', locale=lang)
    return day_names


def format_opening_hour(opening_hour, lang):
    # type: (OpeningHour, unicode) -> unicode
    return format_time(opening_hour and opening_hour.datetime or '0000', 'short', locale=lang)


def format_period(period, lang):
    other_day = period.open and period.close and period.open.day != period.close.day
    start = None if other_day and not period.open and period.close else period.open
    stop = None if other_day and period.open else period.close
    result = ['%s - %s' % (format_opening_hour(start, lang), format_opening_hour(stop, lang))]
    return result


def weekday_text(opening_hours, lang):
    # type: ([OpeningPeriod], unicode) -> unicode
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
            periods[weekday].append('%s - %s' % (format_opening_hour(start, lang),
                                                 format_opening_hour(stop, lang)))
            if other_day:
                diff = period.close.day - period.open.day
                if diff < 0:
                    diff += 7
                for x in xrange(diff):
                    weekday = (period.open.day + x + 1) % 7
                    start = None
                    stop = None if period.close.day != weekday else period.close
                    periods[weekday].append('%s - %s' % (format_opening_hour(start, lang),
                                                         format_opening_hour(stop, lang)))

    result = []
    closed = [translate(lang, PREFIX, 'closed')]
    day_names = get_weekday_names(lang)
    for day in [1, 2, 3, 4, 5, 6, 0]:  # Monday, Tuesday, ..., Sunday
        result.append('%s: %s' % (day_names[day], ', '.join(periods.get(day, closed))))

    return result
