import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { AddParticipationData, City, AppMerchant, AppMerchantList, Project, ProjectDetails } from './projects';

@Injectable({
  providedIn: 'root',
})
export class ProjectsService {
  BASE_URL = `${environment.baseUrl}/api/plugins/psp/v1.0/app`;
  constructor(private http: HttpClient) {
  }

  getCity(cityId: string) {
    return this.http.get<City>(`${this.BASE_URL}/cities/${cityId}`);
  }

  getProjects(cityId: string): Observable<Project[]> {
    return this.http.get<Project[]>(`${this.BASE_URL}/cities/${cityId}/projects`);
  }

  getProjectDetails(cityId: string, projectId: number, app_user: string): Observable<ProjectDetails> {
    const params = new HttpParams({ fromObject: { app_user: encodeURIComponent(app_user) } });
    return this.http.get<ProjectDetails>(`${this.BASE_URL}/cities/${cityId}/projects/${projectId}/details`, { params });
  }

  addParticipation(data: AddParticipationData): Observable<ProjectDetails> {
    return this.http.post<ProjectDetails>(`${this.BASE_URL}/scan`, data);
  }

  getCityMerchants(cityId: string, cursor?: string | null): Observable<AppMerchantList> {
    let params = new HttpParams();
    if (cursor) {
      params = params.set('cursor', cursor);
    }
    return this.http.get<AppMerchantList>(`${this.BASE_URL}/cities/${cityId}/merchants`, { params });
  }

  getMerchant(cityId: string, id: number) {
    return this.http.get<AppMerchant>(`${this.BASE_URL}/cities/${cityId}/merchants/${id}`);
  }
}
