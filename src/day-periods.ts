import type { HourlyForecast } from "./forecast.ts";

export type DayPeriodId = "morning" | "afternoon" | "evening";

export type DayPeriodSummary = {
  id: DayPeriodId;
  minTemperature: number;
  maxTemperature: number;
  maxPrecipitationProbability: number;
};

// `toHour` is exclusive: the morning covers hours 6 to 11.
const DAY_PERIODS: { id: DayPeriodId; fromHour: number; toHour: number }[] = [
  { id: "morning", fromHour: 6, toHour: 12 },
  { id: "afternoon", fromHour: 12, toHour: 20 },
  { id: "evening", fromHour: 20, toHour: 24 },
];

// Periods with none of the given hours are left out, so passing only the hours still to come
// drops the periods that are already over.
export function summarizeDayPeriods(hours: HourlyForecast[]): DayPeriodSummary[] {
  return DAY_PERIODS.flatMap(({ id, fromHour, toHour }) => {
    const inPeriod = hours.filter((h) => h.hour >= fromHour && h.hour < toHour);
    if (inPeriod.length === 0) return [];

    const temperatures = inPeriod.map((h) => h.temperature);

    return {
      id,
      minTemperature: Math.min(...temperatures),
      maxTemperature: Math.max(...temperatures),
      maxPrecipitationProbability: Math.max(...inPeriod.map((h) => h.precipitationProbability)),
    };
  });
}
