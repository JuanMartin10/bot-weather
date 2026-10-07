import { requireEnv } from "./config.ts";

type TelegramResponse = { ok: true } | { ok: false; description: string };

export async function sendMessage(text: string): Promise<void> {
  const token = requireEnv("TELEGRAM_BOT_TOKEN");
  const chatId = requireEnv("TELEGRAM_CHAT_ID");

  const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text }),
  });
  const body = (await response.json()) as TelegramResponse;

  if (!body.ok) {
    throw new Error(`Telegram rejected the message: ${body.description}`);
  }
}
