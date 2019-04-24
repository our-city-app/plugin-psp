import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { AddParticipationData, MerchantList, Project, ProjectDetails } from './projects';

@Injectable({
  providedIn: 'root',
})
export class ProjectsService {
  BASE_URL = `${environment.baseUrl}/api/plugins/psp/v1.0`;
  constructor(private http: HttpClient) {
  }

  getProjects(cityId: string): Observable<Project[]> {
    const params = new HttpParams({ fromObject: { active: 'true' } });
    return this.http.get<Project[]>(`${this.BASE_URL}/cities/${cityId}/projects`, { params });
  }

  getProjectDetails(cityId: string, projectId: number, app_user: string): Observable<ProjectDetails> {
    const params = new HttpParams({ fromObject: { app_user } });
    return this.http.get<ProjectDetails>(`${this.BASE_URL}/cities/${cityId}/projects/${projectId}/statistics`, { params });
  }

  addParticipation(data: AddParticipationData): Observable<ProjectDetails> {
    return this.http.post<ProjectDetails>(`${this.BASE_URL}/scan`, data);
  }

  getCityMerchants(cityId: string, cursor?: string | null): Observable<MerchantList> {
    let params = new HttpParams();
    if (cursor) {
      params = params.set('cursor', cursor);
    }
    return this.http.get<MerchantList>(`${this.BASE_URL}/cities/${cityId}/merchants`, { params });
  }
}
