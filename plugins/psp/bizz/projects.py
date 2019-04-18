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

import dateutil.parser

from mcfw.consts import MISSING
from mcfw.exceptions import HttpNotFoundException, HttpBadRequestException
from plugins.psp.models import Project, ProjectBudget, City
from datetime import datetime


def list_projects(city_id):
    return Project.list_by_city(city_id)


def get_project(city_id, project_id):
    # type: (unicode) -> Project
    project = Project.create_key(city_id, project_id).get()
    if not project:
        raise HttpNotFoundException('project_not_found', {'id': project_id, 'city_id': city_id})
    return project


def create_project(city_id, data):
    # type: (ProjectTO) -> Project
    if data.id is not MISSING:
        key = Project.create_key(city_id, data.id)
        if key.get():
            raise HttpBadRequestException('project_already_exists')
    project = Project(parent=City.create_key(city_id))
    _populate_project(project, data)
    project.put()
    return project


def update_project(city_id, project_id, data):
    # type: (unicode, unicode, ProjectTO) -> Project
    if data.id != project_id:
        raise HttpBadRequestException('bad_project_id')
    project = get_project(city_id, project_id)
    _populate_project(project, data)
    project.put()
    return project


def _populate_project(project, data):
    # type: (Project, ProjectTO) -> None
    start_time = MISSING.default(data.start_time, None) and dateutil.parser.parse(data.start_time).replace(tzinfo=None)
    end_time = MISSING.default(data.end_time, None) and dateutil.parser.parse(data.end_time).replace(tzinfo=None)
    project.populate(title=data.title,
                     description=data.description,
                     start_time=start_time,
                     end_time=end_time,
                     budget=ProjectBudget(amount=data.budget.amount,
                                          currency=data.budget.currency),
                     action_count=data.action_count)


def list_active_projects(city_id):
    # type: (unicode) -> [Project]
    now = datetime.now()
    return [p for p in Project.list_projects_after(city_id, now)
            if p.end_time and p.end_time > now]
