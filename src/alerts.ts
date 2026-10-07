import type { HourlyForecast } from "./forecast.ts";
import { isSnow, isThunderstorm } from "./weather-codes.ts";

export type AlertType = "thunderstorm" | "heavy-rain" | "strong-wind" | "snow";

export type Alert = {
  type: AlertType;
  fromHour: number;
  toHour: number;
  peak?: number;
};

// Hand-picked thresholds, not official weather warnings.
const HEAVY_RAIN_MM_PER_HOUR = 15;
const STRONG_GUST_KMH = 70;

// Gaps between matching hours are not reported: the span runs from the first to the last one.
function span(hours: HourlyForecast[]): Pick<Alert, "fromHour" | "toHour"> {
  return { fromHour: hours[0].hour, toHour: hours[hours.length - 1].hour + 1 };
}

export function detectAlerts(hours: HourlyForecast[]): Alert[] {
  const alerts: Alert[] = [];

  const thunderstorm = hours.filter((h) => isThunderstorm(h.weatherCode));
  if (thunderstorm.length > 0) {
    alerts.push({ type: "thunderstorm", ...span(thunderstorm) });
  }

  const heavyRain = hours.filter((h) => h.precipitationMm >= HEAVY_RAIN_MM_PER_HOUR);
  if (heavyRain.length > 0) {
    const peak = Math.max(...heavyRain.map((h) => h.precipitationMm));
    alerts.push({ type: "heavy-rain", ...span(heavyRain), peak });
  }

  const strongWind = hours.filter((h) => h.windGustsKmh >= STRONG_GUST_KMH);
  if (strongWind.length > 0) {
    const peak = Math.max(...strongWind.map((h) => h.windGustsKmh));
    alerts.push({ type: "strong-wind", ...span(strongWind), peak });
  }

  const snow = hours.filter((h) => isSnow(h.weatherCode));
  if (snow.length > 0) {
    alerts.push({ type: "snow", ...span(snow) });
  }

  return alerts;
}
