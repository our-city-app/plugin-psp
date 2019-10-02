import { GeoPoint, OpeningHourPeriod } from '../../../app/src/app/projects/projects';

export interface City {
  id: string;
  name: string;
  secret: string;
  api_key: string;
  avatar_url: string;
}

export interface QRBatch {
  id: number;
  city_id: string;
  amount: number;
  date: string;
}

export interface Project {
  id: number;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  budget: {
    amount: number;
    currency: string;
  };
  target_scan_count: number;
}

export interface ActivateMerchant {
  qr_content: string | null;
  merchant: Omit<Merchant, 'id' | 'city_id'>;
}

export interface UploadedFile {
  id: number;
  url: string;
}

export interface Merchant {
  id: number;
  city_id: string;
  formatted_address: string | null;
  formatted_phone_number: string | null;
  location: GeoPoint | null;
  name: string | null;
  opening_hours: OpeningHourPeriod[];
  place_id: string | null;
  website: string | null;
  photos: UploadedFile[];
}

export interface MerchantList {
  results: Merchant[];
  cursor: string | null;
  more: boolean;
}
