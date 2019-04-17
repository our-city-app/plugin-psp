import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { PspConfig } from '../../psp-config';
import { City, QRBatch } from './cities';

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
    let params = new HttpParams();
    params = params.set('city_id', cityId);
    return this.http.get<QRBatch[]>(`${PspConfig.API_URL}/qr-batches`, { params });
  }

  downloadQrBatch(id: number) {
    return this.http.get<{ download_url: string }>(`${PspConfig.API_URL}/qr-batches/${id}/download`);
  }

  createQrCodes(cityId: string, amount: number) {
    return this.http.post<QRBatch>(`${PspConfig.API_URL}/qr-batches`, { city_id: cityId, amount });
  }
}
