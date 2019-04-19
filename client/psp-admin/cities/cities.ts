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
  start_time: string;
  end_time: string;
  budget: {
    amount: number;
    currency: string;
  };
  target_scan_count: number;
}

export interface ActivateMerchant {
  place_id: string | null;
  qr_content: string | null;
  name: string | null;
  formatted_address: string | null;
  location: LatLngLiteral | null;
  opening_hours: OpeningHours[];
}

export interface OpeningHours {
  open: Pick<OpeningHoursTime, 'day' | 'time'>;
  close?: Pick<OpeningHoursTime, 'day' | 'time'>;
}

