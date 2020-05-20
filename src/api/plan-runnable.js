const Level = {
  Success: 'success',
  Primary: 'primary',
  Warning: 'warning',
  Danger: 'danger',
  Error: 'error'
};

/**
 * @param {ApiTypes.CaiYunRealtime} data
 */
export function forecastLevel(data) {
  const {
    wind: { speed: wind_speed }, // unit: m/s
    precipitation: {
      local: { intensity: precipitation_intensity },
      nearest: { distance: precipitation_distance } = { distance: 65535 }
    }
  } = data.result;
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
    wind: {
      speed: wind_speed
    },
    rain: {
      distance: precipitation_distance,
      intensity: precipitation_intensity
    }
  };
}
