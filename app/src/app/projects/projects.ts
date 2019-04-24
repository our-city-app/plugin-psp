export interface Project {
  action_count: number;
  city_id: string;
  budget: {
    amount: number;
    currency: string;
  };
  description: string;
  end_date: string;
  id: number;
  start_date: string;
  title: string;
}

export interface ProjectDetails extends Project {
  statistics: {
    total: number;
    personal: {
      amount: number;
      last_entry_date: string;
    }
  };
}

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
  periods: OpeningHourPeriod[];
  /**
   * `weekday_text` is an array of seven strings representing the formatted opening hours for each day of the week.
   * If a language parameter was specified in the Place Details request, the Places Service will format and localize the opening hours appropriately for that language.
   * The ordering of the elements in this array depends on the language parameter.
   * Some languages start the week on Monday while others start on Sunday.
   */
  weekday_text: string[];
}

export interface LatLng {
  lat: number;
  lng: number;
}

export interface Merchant {
  city_id: string;
  formatted_address: string;
  id: number;
  location: LatLng;
  name: string;
  opening_hours: OpeningHours;
  place_id: string;
  place_url: string | null;
}

export interface MerchantList {
  results: Merchant[];
  cursor: string | null;
  more: boolean;
}


export interface AddParticipationData {
  qr_content: string;
  project_id: number;
  email: string;
  app_id: string;
}
