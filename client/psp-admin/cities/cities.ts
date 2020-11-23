export interface DayTime {
  /**
   * A number from 0–6, corresponding to the days of the week, starting on Sunday.
   * For example, 2 means Tuesday.
   */
  day: number;
  /**
   * `time` may contain a time of day in 24-hour hhmm format.
   * Values are in the range 0000–2359.
   * The time will be reported in the place’s time zone.
   */
  time: string;
}

export interface OpeningHourPeriod {
  /**
   * `open` contains a pair of day and time objects describing when the place opens:
   */
  open: DayTime;
  /**
   * `close` may contain a pair of day and time objects describing when the place closes.
   * Note: If a place is always open, the close section will be missing from the response.
   * Clients can rely on always-open being represented as an open period containing day with value 0 and time with value 0000, and no close.
   */
  close: DayTime;
}

export interface OpeningHours {
  /**
   * A boolean value indicating if the place is open at the current time.
   */
  open_now: boolean;
  open_until: string;
  periods: OpeningHourPeriod[];
  weekday_text: {
    day: string;
    hours: string[];
  }[];
}

export interface GeoPoint {
  lat: number;
  lon: number;
}

export interface City {
  id: string;
  name: string;
  secret: string;
  app_id: string;
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
