export type Options = {
  checkAlertsOnly: boolean;
  onceDaily: boolean;
  dryRun: boolean;
  fromHour?: number;
};

const FROM_HOUR_FLAG = "--from-hour=";

export function parseOptions(args: string[]): Options {
  const fromHour = args.find((arg) => arg.startsWith(FROM_HOUR_FLAG));

  return {
    checkAlertsOnly: args.includes("--check-alerts"),
    onceDaily: args.includes("--once-daily"),
    dryRun: args.includes("--dry-run"),
    fromHour: fromHour ? Number(fromHour.slice(FROM_HOUR_FLAG.length)) : undefined,
  };
}
