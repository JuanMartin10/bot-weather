// Both helpers take a timezone so the result does not depend on where the script runs.

export function currentHour(timeZone: string): number {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone,
    hour: "numeric",
    hourCycle: "h23",
  }).formatToParts(new Date());

  return Number(parts.find((part) => part.type === "hour")?.value);
}

export function timestamp(timeZone: string): string {
  return new Date().toLocaleString("en-GB", { timeZone });
}
