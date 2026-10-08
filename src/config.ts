export const LOCATION_NAME = "Madrid";
export const TIMEZONE = "Europe/Madrid";

// Earliest local time ("HH:MM") at which a `--once-daily` run sends the forecast.
export const DAILY_SEND_TIME = "08:30";

export function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing environment variable ${name}. See .env.example.`);
  }
  return value;
}
