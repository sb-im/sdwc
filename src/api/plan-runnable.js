import { realtime } from './caiyun';
import { get as get3s } from './weather3s';

const Level = {
  Success: 'success',
  Primary: 'primary',
  Warning: 'warning',
  Danger: 'danger',
  Error: 'error'
};

/**
 * @param {import('./api-types').Weather3sResult} data
 */
function realtimeLevel(data) {
  let { wind_speed, rainfall_count } = data[0];  // unit: 0.1 m/s
  wind_speed = Number.parseInt(wind_speed) / 10; // unit: m/s
  rainfall_count = Number.parseInt(rainfall_count);
  let level;
  if (wind_speed >= 10 || rainfall_count >= 15) {
    level = Level.Error;
  } else if (wind_speed >= 6 || rainfall_count >= 10) {
    level = Level.Danger;
  } else if (wind_speed >= 4 || rainfall_count >= 5) {
    level = Level.Warning;
  } else if (wind_speed >= 2 || rainfall_count > 0) {
    level = Level.Primary;
  } else {
    level = Level.Success;
  }
  return {
    level,
    wind_speed,
    rainfall_count
  };
}

/**
 * @param {import('./api-types').CaiYunRealtime} data
 */
function forecastLevel(data) {
  let {
    wind: { speed: wind_speed }, // unit: km/h
    precipitation: {
      local: { intensity: precipitation_intensity },
      nearest: { distance: precipitation_distance }
    }
  } = data.result;
  wind_speed /= 3.6;             // unit: m/s
  let level;
  if (wind_speed >= 10 || precipitation_intensity >= 0.4 || precipitation_distance < 0) {
    level = Level.Error;
  } else if (wind_speed >= 6 || precipitation_intensity >= 0.3 || precipitation_distance < 1) {
    level = Level.Danger;
  } else if (wind_speed >= 4 || precipitation_intensity >= 0.1 || precipitation_distance < 2) {
    level = Level.Warning;
  } else if (wind_speed >= 2 || precipitation_intensity > 0 || precipitation_distance < 3) {
    level = Level.Primary;
  } else {
    level = Level.Success;
  }
  return {
    level,
    wind_speed,
    precipitation_distance,
    precipitation_intensity
  };
}

/**
 * @param {number} ws wind speed, unit: 0.1 m/s
 */
export function windSpeedLevel(ws) {
  let level;
  const wind_speed = ws / 10; // unit: m/s
  if (wind_speed >= 10) {
    level = Level.Error;
  } else if (wind_speed >= 6) {
    level = Level.Danger;
  } else if (wind_speed >= 4) {
    level = Level.Warning;
  } else if (wind_speed >= 2) {
    level = Level.Primary;
  } else {
    level = Level.Success;
  }
  return {
    wind_speed: wind_speed.toFixed(1),
    level
  };
}

/**
 * @param {{lng: number; lat: number}} _
 */
export function checkForecast({ lng, lat }) {
  return realtime(lng, lat).then(forecastLevel);
}

/**
 * @param {string} id
 */
export function checkRealtime(id) {
  return get3s(id).then(realtimeLevel);
}
