// One-off setup helper: prints the chat id of whoever has messaged the bot.
// Send any message to your bot first, then run `npm run chat-id`.

import { requireEnv } from "../src/config.ts";

type Update = { message?: { chat: { id: number; first_name?: string } } };
type UpdatesResponse = { ok: true; result: Update[] } | { ok: false; description: string };

const token = requireEnv("TELEGRAM_BOT_TOKEN");

const response = await fetch(`https://api.telegram.org/bot${token}/getUpdates`);
const body = (await response.json()) as UpdatesResponse;

if (!body.ok) {
  throw new Error(`Telegram returned an error: ${body.description}`);
}

if (body.result.length === 0) {
  console.log("No pending messages. Send one to your bot and run this again.");
}

for (const update of body.result) {
  const chat = update.message?.chat;
  if (chat) {
    console.log(`chat_id: ${chat.id}  (${chat.first_name ?? "unknown"})`);
  }
}
