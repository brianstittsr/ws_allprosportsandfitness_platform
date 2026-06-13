import { COLLECTIONS } from "@/lib/schema";

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

export async function sendTelegramMessage(
  chatId: number | string,
  text: string,
  options: { parseMode?: "Markdown" | "HTML"; replyToMessageId?: number } = {}
): Promise<void> {
  if (!BOT_TOKEN) {
    console.warn("Telegram bot token not configured");
    return;
  }

  const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: options.parseMode || "Markdown",
      reply_to_message_id: options.replyToMessageId,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Telegram API error: ${error}`);
  }
}

export async function sendTelegramAlert(
  title: string,
  message: string,
  severity: "low" | "medium" | "high" | "critical" = "medium",
  chatId?: number
): Promise<void> {
  const targetChatId = chatId || (process.env.TELEGRAM_ADMIN_CHAT_ID ? Number(process.env.TELEGRAM_ADMIN_CHAT_ID) : undefined);

  if (!targetChatId) {
    console.warn("No Telegram admin chat ID configured");
    return;
  }

  const severityEmoji = {
    low: "🟢",
    medium: "🟡",
    high: "🟠",
    critical: "🔴",
  };

  const text = [
    `${severityEmoji[severity]} *${title}*`,
    ``,
    message,
    ``,
    `_${new Date().toLocaleString()}_`,
  ].join("\n");

  await sendTelegramMessage(targetChatId, text);
}

export async function verifyTelegramUser(telegramUserId: number): Promise<{ userId: string; permissions: Record<string, boolean>; displayName: string; organizationId: string } | null> {
  const { adminDb } = await import("@/lib/firebase-admin");

  const q = adminDb.collection(COLLECTIONS.userAccess).where("telegramUserId", "==", String(telegramUserId)).limit(1);
  const snapshot = await q.get();

  if (snapshot.empty) return null;

  const data = snapshot.docs[0].data();
  return {
    userId: data.userId,
    permissions: data.permissions || {},
    displayName: data.displayName || "Unknown",
    organizationId: data.organizationId || "default",
  };
}

export async function getBotInfo(): Promise<{ username: string; first_name: string; id: number } | null> {
  if (!BOT_TOKEN) return null;

  const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getMe`);
  const data = await response.json();

  if (!data.ok) return null;
  return data.result;
}

export async function setWebhook(webhookUrl: string, secretToken?: string): Promise<boolean> {
  if (!BOT_TOKEN) return false;

  const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/setWebhook`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      url: webhookUrl,
      secret_token: secretToken,
      allowed_updates: ["message"],
    }),
  });

  const data = await response.json();
  return data.ok === true;
}

export async function deleteWebhook(): Promise<boolean> {
  if (!BOT_TOKEN) return false;

  const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/deleteWebhook`);
  const data = await response.json();
  return data.ok === true;
}
