import type { Alert } from "./alerts.ts";
import { LOCATION_NAME } from "./config.ts";
import { summarizeDayPeriods, type DayPeriodId } from "./day-periods.ts";
import type { Forecast, HourlyForecast } from "./forecast.ts";
import { describeWeather, weatherEmoji, worstWeatherCode } from "./weather-codes.ts";

const PERIOD_LABELS: Record<DayPeriodId, string> = {
  morning: "🌅 Mañana",
  afternoon: "🌇 Tarde",
  evening: "🌙 Noche",
};

function formatAlert(alert: Alert): string {
  const span = `entre las ${alert.fromHour} y las ${alert.toHour} h`;
  const peak = Math.round(alert.peak ?? 0);

  switch (alert.type) {
    case "thunderstorm":
      return `⛈️ Tormenta ${span}`;
    case "heavy-rain":
      return `🌧️ Lluvia fuerte ${span}, hasta ${peak} mm en una hora`;
    case "strong-wind":
      return `💨 Rachas de hasta ${peak} km/h ${span}`;
    case "snow":
      return `❄️ Nieve ${span}`;
  }
}

// The headline and the periods describe `remainingHours` only: what is already over is of no
// use to the reader. The temperature range, wind and sun lines still cover the whole day.
export function formatDailyForecast(
  forecast: Forecast,
  remainingHours: HourlyForecast[],
  alerts: Alert[],
): string {
  const degrees = (min: number, max: number) => {
    const [low, high] = [Math.round(min), Math.round(max)];
    return low === high ? `${low} °C` : `${low}–${high} °C`;
  };

  const headlineCode =
    worstWeatherCode(remainingHours.map((h) => h.weatherCode)) ?? forecast.weatherCode;

  const alertLines =
    alerts.length > 0 ? ["⚠️ Avisos para hoy", ...alerts.map(formatAlert), ""] : [];

  const periodLines = summarizeDayPeriods(remainingHours).map(
    (period) =>
      `${PERIOD_LABELS[period.id]}: ${degrees(period.minTemperature, period.maxTemperature)}` +
      ` · ☔ ${period.maxPrecipitationProbability} %`,
  );

  const wind = Math.round(forecast.maxWindSpeedKmh);
  const gusts = Math.round(forecast.maxWindGustsKmh);

  return [
    ...alertLines,
    `${weatherEmoji(headlineCode)} ${LOCATION_NAME}, hoy: ${describeWeather(headlineCode)}`,
    `🌡️ ${degrees(forecast.minTemperature, forecast.maxTemperature)}`,
    "",
    ...(periodLines.length > 0 ? [...periodLines, ""] : []),
    `💨 Viento: ${wind} km/h, rachas de ${gusts} km/h`,
    `☀️ Sol: ${forecast.sunrise} – ${forecast.sunset}`,
  ].join("\n");
}

export function formatAlertUpdate(alerts: Alert[]): string {
  return [`⚠️ Cambia la previsión de hoy en ${LOCATION_NAME}`, ...alerts.map(formatAlert)].join(
    "\n",
  );
}
