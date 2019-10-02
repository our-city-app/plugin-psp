import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { PspConfig } from '../../psp-config';
import { ActivateMerchant, City, Merchant, MerchantList, Project, QRBatch, UploadedFile } from './cities';

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
    return this.http.get<QRBatch[]>(`${PspConfig.API_URL}/cities/${cityId}/qr-batches`);
  }

  downloadQrBatch(cityId: string, id: number) {
    return this.http.get<{ download_url: string }>(`${PspConfig.API_URL}/cities/${cityId}/qr-batches/${id}/download`);
  }

  createQrCodes(cityId: string, amount: number) {
    return this.http.post<QRBatch>(`${PspConfig.API_URL}/cities/${cityId}/qr-batches`, { amount });
  }

  listProjects(cityId: string, active = true) {
    const params = new HttpParams({ fromObject: { active: active.toString() } });
    return this.http.get<Project[]>(`${PspConfig.API_URL}/cities/${cityId}/projects`, { params });
  }

  linkQR(cityId: string, data: ActivateMerchant) {
    return this.http.post<Merchant>(`${PspConfig.API_URL}/cities/${cityId}/link`, data);
  }

  searchPlaces(query: string, location: string) {
    const params = new HttpParams({ fromObject: { query, location } });
    return this.http.get<google.maps.places.PlaceResult[]>(`${PspConfig.API_URL}/places`, { params });
  }

  getPlaceDetails(placeId: string) {
    return this.http.get<google.maps.places.PlaceResult>(`${PspConfig.API_URL}/places/${placeId}`);
  }

  getMerchants(cityId: string, cursor?: string | null) {
    let params;
    if (cursor) {
      params = new HttpParams({ fromObject: { cursor } });
    }
    return this.http.get<MerchantList>(`${PspConfig.API_URL}/cities/${cityId}/merchants`, { params });
  }

  getMerchant(cityId: string, id: number) {
    return this.http.get<Merchant>(`${PspConfig.API_URL}/cities/${cityId}/merchants/${id}`);
  }

  updateMerchant(cityId: string, merchant: Merchant) {
    return this.http.put<Merchant>(`${PspConfig.API_URL}/cities/${cityId}/merchants/${merchant.id}`, merchant);
  }

  uploadPhoto(cityId: string, merchantId: number, file: string) {
    return this.http.post<UploadedFile>(`${PspConfig.API_URL}/cities/${cityId}/merchants/${merchantId}/photos`, { photo: file });
  }

  deletePhoto(cityId: string, merchantId: number, photoId: number) {
    return this.http.delete(`${PspConfig.API_URL}/cities/${cityId}/merchants/${merchantId}/photos/${photoId}`);
  }
}
