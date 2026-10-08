import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import type { AlertType } from "./alerts.ts";

const STATE_FILE = "state/daily.json";

export type DailyState = {
  forecastSent: boolean;
  notifiedAlerts: AlertType[];
};

type StoredState = Partial<DailyState> & { date: string };

const EMPTY_STATE: DailyState = { forecastSent: false, notifiedAlerts: [] };

// State stored for any other day is stale and counts as nothing done yet.
export function readDailyState(date: string): DailyState {
  if (!existsSync(STATE_FILE)) return EMPTY_STATE;

  const stored = JSON.parse(readFileSync(STATE_FILE, "utf8")) as StoredState;
  if (stored.date !== date) return EMPTY_STATE;

  return { ...EMPTY_STATE, ...stored };
}

export function saveDailyState(date: string, state: DailyState): void {
  const stored: StoredState = { date, ...state };

  mkdirSync(dirname(STATE_FILE), { recursive: true });
  writeFileSync(STATE_FILE, `${JSON.stringify(stored, null, 2)}\n`);
}
