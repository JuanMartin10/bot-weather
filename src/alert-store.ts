import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import type { AlertType } from "./alerts.ts";

const STATE_FILE = "state/alerts.json";

type StoredAlerts = {
  date: string;
  types: AlertType[];
};

// Alerts stored for any other day are stale and count as nothing notified yet.
export function readNotifiedAlerts(date: string): AlertType[] {
  if (!existsSync(STATE_FILE)) return [];

  const stored = JSON.parse(readFileSync(STATE_FILE, "utf8")) as StoredAlerts;
  return stored.date === date ? stored.types : [];
}

export function saveNotifiedAlerts(date: string, types: AlertType[]): void {
  const stored: StoredAlerts = { date, types };

  mkdirSync(dirname(STATE_FILE), { recursive: true });
  writeFileSync(STATE_FILE, `${JSON.stringify(stored, null, 2)}\n`);
}
