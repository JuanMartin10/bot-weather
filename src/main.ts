// Usage:
//   node src/main.ts                  send today's forecast, with any alerts for the rest of the day
//   node src/main.ts --check-alerts   send a message only if an alert not yet notified today shows up
//
// Testing flags:
//   --dry-run        print the message instead of sending it; nothing is stored
//   --from-hour=N    behave as if it were N o'clock

import { readNotifiedAlerts, saveNotifiedAlerts } from "./alert-store.ts";
import { detectAlerts } from "./alerts.ts";
import { currentHour, timestamp } from "./clock.ts";
import { TIMEZONE } from "./config.ts";
import { fetchTodayForecast } from "./forecast.ts";
import { formatAlertUpdate, formatDailyForecast } from "./messages.ts";
import { parseOptions } from "./options.ts";
import { sendMessage } from "./telegram.ts";
import { worstWeatherCode } from "./weather-codes.ts";

const options = parseOptions(process.argv.slice(2));
const fromHour = options.fromHour ?? currentHour(TIMEZONE);

const forecast = await fetchTodayForecast();

// Hours already gone are of no use to the reader, so alerts and the headline ignore them.
const remainingHours = forecast.hours.filter((h) => h.hour >= fromHour);
const alerts = detectAlerts(remainingHours);

const alreadyNotified = options.checkAlertsOnly ? readNotifiedAlerts(forecast.date) : [];
const newAlerts = alerts.filter((alert) => !alreadyNotified.includes(alert.type));

let message: string | null;

if (options.checkAlertsOnly) {
  message = newAlerts.length > 0 ? formatAlertUpdate(newAlerts) : null;
} else {
  const headlineCode =
    worstWeatherCode(remainingHours.map((h) => h.weatherCode)) ?? forecast.weatherCode;
  message = formatDailyForecast(forecast, headlineCode, alerts);
}

const now = timestamp(TIMEZONE);

if (message === null) {
  console.log(`[${now}] No new alerts. Nothing sent.`);
} else if (options.dryRun) {
  console.log(`[${now}] Dry run, not sent:\n${message}`);
} else {
  await sendMessage(message);
  saveNotifiedAlerts(forecast.date, [...alreadyNotified, ...newAlerts.map((alert) => alert.type)]);
  console.log(`[${now}] Sent:\n${message}`);
}
