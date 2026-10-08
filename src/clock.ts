// All helpers take a timezone so the result does not depend on where the script runs.

function parts(timeZone: string): Record<string, string> {
  const formatted = new Intl.DateTimeFormat("en-GB", {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date());

  return Object.fromEntries(formatted.map((part) => [part.type, part.value]));
}

export function currentHour(timeZone: string): number {
  return Number(parts(timeZone).hour);
}

// "HH:MM", zero-padded, so two values compare correctly as plain strings.
export function currentTimeOfDay(timeZone: string): string {
  const { hour, minute } = parts(timeZone);
  return `${hour}:${minute}`;
}

export function timestamp(timeZone: string): string {
  return new Date().toLocaleString("en-GB", { timeZone });
}
