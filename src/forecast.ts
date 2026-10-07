import { requireEnv, TIMEZONE } from "./config.ts";

export type HourlyForecast = {
  hour: number;
  temperature: number;
  precipitationProbability: number;
  precipitationMm: number;
  windGustsKmh: number;
  weatherCode: number;
};

export type Forecast = {
  date: string;
  weatherCode: number;
  minTemperature: number;
  maxTemperature: number;
  maxWindSpeedKmh: number;
  maxWindGustsKmh: number;
  sunrise: string;
  sunset: string;
  hours: HourlyForecast[];
};

type OpenMeteoForecast = {
  daily: {
    time: string[];
    weather_code: number[];
    temperature_2m_min: number[];
    temperature_2m_max: number[];
    wind_speed_10m_max: number[];
    wind_gusts_10m_max: number[];
    sunrise: string[];
    sunset: string[];
  };
  hourly: {
    time: string[];
    temperature_2m: number[];
    precipitation_probability: number[];
    precipitation: number[];
    wind_gusts_10m: number[];
    weather_code: number[];
  };
};

type OpenMeteoError = { error: true; reason: string };

const DAILY_FIELDS = [
  "weather_code",
  "temperature_2m_min",
  "temperature_2m_max",
  "wind_speed_10m_max",
  "wind_gusts_10m_max",
  "sunrise",
  "sunset",
];

const HOURLY_FIELDS = [
  "temperature_2m",
  "precipitation_probability",
  "precipitation",
  "wind_gusts_10m",
  "weather_code",
];

// Open-Meteo timestamps look like "2026-10-07T08:17", already in the requested timezone.
const timeOfDay = (timestamp: string) => timestamp.slice(11, 16);
const hourOf = (timestamp: string) => Number(timestamp.slice(11, 13));

export async function fetchTodayForecast(): Promise<Forecast> {
  const query = new URLSearchParams({
    latitude: requireEnv("WEATHER_LATITUDE"),
    longitude: requireEnv("WEATHER_LONGITUDE"),
    timezone: TIMEZONE,
    forecast_days: "1",
    daily: DAILY_FIELDS.join(","),
    hourly: HOURLY_FIELDS.join(","),
  });

  const response = await fetch(`https://api.open-meteo.com/v1/forecast?${query}`);
  const body = (await response.json()) as OpenMeteoForecast | OpenMeteoError;

  if ("error" in body) {
    throw new Error(`Open-Meteo returned an error: ${body.reason}`);
  }

  const { daily, hourly } = body;

  return {
    date: daily.time[0],
    weatherCode: daily.weather_code[0],
    minTemperature: daily.temperature_2m_min[0],
    maxTemperature: daily.temperature_2m_max[0],
    maxWindSpeedKmh: daily.wind_speed_10m_max[0],
    maxWindGustsKmh: daily.wind_gusts_10m_max[0],
    sunrise: timeOfDay(daily.sunrise[0]),
    sunset: timeOfDay(daily.sunset[0]),
    hours: hourly.time.map((timestamp, i) => ({
      hour: hourOf(timestamp),
      temperature: hourly.temperature_2m[i],
      precipitationProbability: hourly.precipitation_probability[i],
      precipitationMm: hourly.precipitation[i],
      windGustsKmh: hourly.wind_gusts_10m[i],
      weatherCode: hourly.weather_code[i],
    })),
  };
}
