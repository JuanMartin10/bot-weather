# bot-weather

A small Telegram bot that sends the day's weather forecast every morning and follows up later
only if something worth a warning shows up. It runs on GitHub Actions, so nothing has to stay
switched on.

No dependencies: plain TypeScript run directly by Node, `fetch` for HTTP, and
[Open-Meteo](https://open-meteo.com/) for the forecast (no API key needed).

## What it sends

The morning message. The alert block at the top only appears when there is something to warn about:

```
⚠️ Avisos para hoy
⛈️ Tormenta entre las 17 y las 19 h

⛈️ Madrid, hoy: tormenta
🌡️ 14–21 °C

🌅 Mañana: 14–16 °C · ☔ 43 %
🌇 Tarde: 17–21 °C · ☔ 80 %
🌙 Noche: 17–20 °C · ☔ 10 %

💨 Viento: 9 km/h, rachas de 30 km/h
☀️ Sol: 08:17 – 19:47
```

The follow-up checks stay silent unless a new kind of alert appears that has not been notified
that day:

```
⚠️ Cambia la previsión de hoy en Madrid
💨 Rachas de hasta 78 km/h entre las 20 y las 23 h
```

Message text is in Spanish; everything else in the project is in English.

## Alerts

Alerts only look at the hours left in the day.

| Alert        | Raised when                                 |
| ------------ | ------------------------------------------- |
| Thunderstorm | Any hour has a thunderstorm weather code    |
| Heavy rain   | 15 mm or more of precipitation in one hour  |
| Strong wind  | Gusts of 70 km/h or more                    |
| Snow         | Any hour has a snow weather code            |

The rain and wind thresholds are hand-picked, not official weather warnings. They live at the top
of [`src/alerts.ts`](src/alerts.ts).

## Setup

Requires Node 23.6 or later, which runs `.ts` files without a build step.

1. Create a bot with [@BotFather](https://t.me/BotFather) (`/newbot`) and copy its token.
2. Copy the environment template and fill in the token:

   ```bash
   cp .env.example .env
   ```

3. Send any message to your bot, then get your chat id and add it to `.env`:

   ```bash
   npm run chat-id
   ```

4. Set `WEATHER_LATITUDE` and `WEATHER_LONGITUDE` in `.env` to the place you want the forecast for.

The place name shown in the message and the timezone are constants in
[`src/config.ts`](src/config.ts).

## Usage

```bash
npm run weather        # send today's forecast
npm run check-alerts   # send a message only if there is a new alert
```

Add `-- --once-daily` to `npm run weather` to skip the send when it is before 08:30 or the
forecast already went out today. The send time is `DAILY_SEND_TIME` in
[`src/config.ts`](src/config.ts).

Two flags help when testing:

```bash
npm run weather -- --dry-run            # print the message instead of sending it
npm run weather -- --dry-run --from-hour=0   # behave as if it were midnight
```

## Running on a schedule

Two workflows in [`.github/workflows`](.github/workflows) run the bot on GitHub Actions.

| Workflow         | When (Madrid time)                      | What it does                        |
| ---------------- | --------------------------------------- | ----------------------------------- |
| `daily-forecast` | 08:30                                   | Sends the full forecast             |
| `check-alerts`   | 13:05 and 19:05 (an hour earlier in winter) | Sends a message only on a new alert |

Both can also be started by hand from the Actions tab.

GitHub's scheduler works in UTC and is best effort: runs can start late or be dropped. So
`daily-forecast` is queued every hour from 06:30 to 10:30 UTC and runs with `--once-daily`, which
sends the forecast on the first run at or after 08:30 Madrid time and does nothing on the rest.
That keeps the send time stable across daylight saving changes and gives it a few retries.

To use them in your own copy, add these repository secrets under
**Settings → Secrets and variables → Actions**:

- `TELEGRAM_BOT_TOKEN`
- `TELEGRAM_CHAT_ID`
- `WEATHER_LATITUDE`
- `WEATHER_LONGITUDE`

Each run starts on a clean machine, so the record of what was already sent today
(`state/daily.json`) is carried from one run to the next with `actions/cache`.

## How it is organised

Each module has one job, and `main.ts` only wires them together.

| Module             | Responsibility                                          |
| ------------------ | ------------------------------------------------------- |
| `main.ts`          | Entry point: decides what to send                       |
| `options.ts`       | Command-line flags                                      |
| `config.ts`        | Place name, timezone and environment variables          |
| `forecast.ts`      | Fetches the forecast from Open-Meteo and normalises it  |
| `weather-codes.ts` | WMO weather codes: descriptions, emoji, severity        |
| `alerts.ts`        | Decides which conditions deserve an alert               |
| `day-periods.ts`   | Summarises morning, afternoon and evening               |
| `messages.ts`      | Builds the message text                                 |
| `state-store.ts`   | Remembers what was already sent today                   |
| `clock.ts`         | Current time in a given timezone                        |
| `telegram.ts`      | Sends a message through the Telegram Bot API            |

## Credits

Weather data by [Open-Meteo](https://open-meteo.com/), licensed under
[CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).
