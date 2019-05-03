import LatLngLiteral = google.maps.LatLngLiteral;
import OpeningHoursTime = google.maps.places.OpeningHoursTime;

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
  formatted_address: string | null;
  formatted_phone_number: string | null;
  location: LatLngLiteral | null;
  name: string | null;
  opening_hours: OpeningHours[];
  place_id: string | null;
  qr_content: string | null;
  website: string | null;
}

export interface OpeningHours {
  open: Pick<OpeningHoursTime, 'day' | 'time'>;
  close?: Pick<OpeningHoursTime, 'day' | 'time'>;
}

