namespace ApiTypes {
  export interface CaiYunResult<T> {
    status: string;
    lang: string;
    unit?: string;
    server_time: number;
    location: number[];
    api_status: string;
    tzshift: number;
    api_version: string;
    result: T;
  }
  export type CaiYunRealtime = CaiYunResult<RealtimeResult>;
  export type CaiYunMinutely = CaiYunResult<MinutelyResult>;
  export type Weather3sResult = Weather3sData[];

  export interface LoginResponseOk {
    access_token: string;
    token_type: string;
    expires_in: number;
    created_at: number;
  }

  export interface LoginResponseErr {
    error: string;
    error_description: string;
  }
}

interface RealtimeResult {
  status: string;
  o3: number;
  co: number;
  temperature: number;
  pm10: number;
  skycon: string;
  cloudrate: number;
  precipitation: Precipitation;
  dswrf: number;
  visibility: number;
  humidity: number;
  so2: number;
  ultraviolet: Comfort;
  pres: number;
  aqi: number;
  pm25: number;
  no2: number;
  apparent_temperature: number;
  comfort: Comfort;
  wind: {
    direction: number;
    speed: number;
  };
}

interface Comfort {
  index: number;
  desc: string;
}

interface PrecipitationCommon {
  status: string;
  intensity: number;
}

interface PrecipitationNearest extends PrecipitationCommon {
  distance: number
};

interface PrecipitationLocal extends PrecipitationCommon {
  datasource: string
};

interface Precipitation {
  nearest: PrecipitationNearest;
  local: PrecipitationLocal;
}

interface MinutelyResult {
  forecast_keypoint: string;
  minutely: MinutelyDetails;
  primary: number;
}

interface MinutelyDetails {
  status: string;
  description: string;
  probability: number[];
  probability_4h: number[];
  datasource: string;
  precipitation_2h: number[];
  precipitation: number[];
}

interface Weather3sData {
  _id: string;
  wind_direction_AD: string;
  wind_direction: string;
  wind_speed_Hz: string;
  wind_speed: string;
  wind_speed_before_1m: string;
  wind_speed_before_5m: string;
  rainfall_count: string;
  rainfall_count_before_1m: string;
  rainfall_before_1m: string;
  rainfall_before_1h: string;
  rainfall_before_1d: string;
  temperature: string;
  humidity: string;
  air_pressure: string;
  timestamp: string;
  __v: number;
}
