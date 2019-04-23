import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { PspConfig } from '../../psp-config';
import { ActivateMerchant, City, Project, QRBatch } from './cities';

@Injectable({ providedIn: 'root' })
export class CitiesService {
  constructor(private http: HttpClient) {
  }

  getCities() {
    return this.http.get<City[]>(`${PspConfig.API_URL}/cities`);
  }

  getCity(cityId: string) {
    return this.http.get<City>(`${PspConfig.API_URL}/cities/${cityId}`);
  }

  saveCity(city: City) {
    return this.http.put<City>(`${PspConfig.API_URL}/cities/${city.id}`, city);
  }

  getQrBatches(cityId: string) {
    const params = new HttpParams({ fromObject: { city_id: cityId } });
    return this.http.get<QRBatch[]>(`${PspConfig.API_URL}/qr-batches`, { params });
  }

  downloadQrBatch(id: number) {
    return this.http.get<{ download_url: string }>(`${PspConfig.API_URL}/qr-batches/${id}/download`);
  }

  createQrCodes(cityId: string, amount: number) {
    return this.http.post<QRBatch>(`${PspConfig.API_URL}/qr-batches`, { city_id: cityId, amount });
  }

  listProjects(cityId: string, active = true) {
    const params = new HttpParams({ fromObject: { active: active.toString() } });
    return this.http.get<Project[]>(`${PspConfig.API_URL}/cities/${cityId}/projects`, { params });
  }

  linkQR(cityId: string, data: ActivateMerchant) {
    return this.http.post<ActivateMerchant>(`${PspConfig.API_URL}/cities/${cityId}/link`, data);
  }

  searchPlaces(query: string, location: string) {
    const params = new HttpParams({ fromObject: { query, location } });
    return this.http.get<google.maps.places.PlaceResult[]>(`${PspConfig.API_URL}/places`, { params });
  }

  getPlaceDetails(placeId: string) {
    return this.http.get<google.maps.places.PlaceResult>(`${PspConfig.API_URL}/places/${placeId}`);
  }
}