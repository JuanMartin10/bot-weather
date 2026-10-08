// Usage:
//   node src/main.ts                  send today's forecast, with any alerts for the rest of the day
//   node src/main.ts --once-daily     same, but skip if it is too early or it was already sent today
//   node src/main.ts --check-alerts   send a message only if an alert not yet notified today shows up
//
// Testing flags:
//   --dry-run        print the message instead of sending it; nothing is stored
//   --from-hour=N    behave as if it were N o'clock

import { detectAlerts } from "./alerts.ts";
import { currentHour, currentTimeOfDay, timestamp } from "./clock.ts";
import { DAILY_SEND_TIME, TIMEZONE } from "./config.ts";
import { fetchTodayForecast } from "./forecast.ts";
import { formatAlertUpdate, formatDailyForecast } from "./messages.ts";
import { parseOptions } from "./options.ts";
import { readDailyState, saveDailyState } from "./state-store.ts";
import { sendMessage } from "./telegram.ts";

const log = (text: string) => console.log(`[${timestamp(TIMEZONE)}] ${text}`);

async function run(): Promise<void> {
  const options = parseOptions(process.argv.slice(2));

  const forecast = await fetchTodayForecast();
  const state = readDailyState(forecast.date);

  // Scheduled runs are neither punctual nor guaranteed, so several are queued for the same
  // forecast and these two checks turn all but the first valid one into no-ops.
  if (options.onceDaily && state.forecastSent) {
    log("Forecast already sent today. Nothing sent.");
    return;
  }
  if (options.onceDaily && currentTimeOfDay(TIMEZONE) < DAILY_SEND_TIME) {
    log(`Too early: the forecast goes out from ${DAILY_SEND_TIME}. Nothing sent.`);
    return;
  }

  // Hours already gone are of no use to the reader, so alerts and the message ignore them.
  const fromHour = options.fromHour ?? currentHour(TIMEZONE);
  const remainingHours = forecast.hours.filter((h) => h.hour >= fromHour);
  const alerts = detectAlerts(remainingHours);

  let message: string;
  let includedAlerts = alerts;

  if (options.checkAlertsOnly) {
    includedAlerts = alerts.filter((alert) => !state.notifiedAlerts.includes(alert.type));
    if (includedAlerts.length === 0) {
      log("No new alerts. Nothing sent.");
      return;
    }
    message = formatAlertUpdate(includedAlerts);
  } else {
    message = formatDailyForecast(forecast, remainingHours, alerts);
  }

  if (options.dryRun) {
    log(`Dry run, not sent:\n${message}`);
    return;
  }

  await sendMessage(message);
  saveDailyState(forecast.date, {
    forecastSent: state.forecastSent || !options.checkAlertsOnly,
    notifiedAlerts: [...new Set([...state.notifiedAlerts, ...includedAlerts.map((a) => a.type)])],
  });
  log(`Sent:\n${message}`);
}

await run();
