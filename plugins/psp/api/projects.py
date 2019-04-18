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
from plugins.psp.bizz.general import validate_city_request_auth
from plugins.psp.bizz.projects import create_project, update_project, get_project, list_projects
from plugins.psp.to import ProjectTO


@rest('/projects/<city_id:[^/]+>', 'get', custom_auth_method=validate_city_request_auth)
@returns([ProjectTO])
@arguments(city_id=unicode)
def api_list_projects(city_id):
    return [ProjectTO.from_model(model) for model in list_projects(city_id)]


@rest('/projects/<city_id:[^/]+>', 'post', custom_auth_method=validate_city_request_auth)
@returns(ProjectTO)
@arguments(city_id=unicode, data=ProjectTO)
def api_create_project(city_id, data):
    return ProjectTO.from_model(create_project(city_id, data))


@rest('/projects/<city_id:[^/]+>/<project_id:[^/]+>', 'get', custom_auth_method=validate_city_request_auth)
@returns(ProjectTO)
@arguments(project_id=long)
def api_get_project(project_id):
    return ProjectTO.from_model(get_project(project_id))


@rest('/projects/<city_id:[^/]+>/<project_id:[^/]+>', 'put', custom_auth_method=validate_city_request_auth)
@returns(ProjectTO)
@arguments(city_id=unicode, project_id=long, data=ProjectTO)
def api_save_project(city_id, project_id, data):
    return ProjectTO.from_model(update_project(city_id, project_id, data))