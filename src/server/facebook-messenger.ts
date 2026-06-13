/**
 * Facebook Messenger Platform API helpers
 * Supports sending messages and processing incoming webhook events.
 */

export interface MessengerMessage {
  senderId: string;
  recipientId: string;
  text?: string;
  timestamp: number;
  mid: string;
}

export interface MessengerWebhookEntry {
  id: string;
  time: number;
  messaging: MessengerMessagingEvent[];
}

export interface MessengerMessagingEvent {
  sender: { id: string };
  recipient: { id: string };
  timestamp: number;
  message?: {
    mid: string;
    text?: string;
    quick_reply?: { payload: string };
    attachments?: unknown[];
  };
  postback?: { payload: string; title: string };
}

/**
 * Send a text message to a Messenger user.
 */
export async function sendMessengerMessage(
  pageAccessToken: string,
  recipientId: string,
  text: string,
  quickReplies?: string[]
): Promise<{ messageId: string }> {
  const url = `https://graph.facebook.com/v18.0/me/messages?access_token=${encodeURIComponent(pageAccessToken)}`;

  const body: Record<string, unknown> = {
    recipient: { id: recipientId },
    message: { text },
  };

  if (quickReplies && quickReplies.length > 0) {
    (body.message as Record<string, unknown>).quick_replies = quickReplies.map((title) => ({
      content_type: "text",
      title,
      payload: title.toLowerCase().replace(/\s+/g, "_"),
    }));
  }

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await response.json();

  if (!response.ok) {
    const errorMsg = data.error?.message || `Messenger API error: ${response.status}`;
    throw new Error(errorMsg);
  }

  return { messageId: data.message_id };
}

/**
 * Verify the webhook subscription challenge from Meta.
 */
export function verifyMessengerWebhook(
  mode: string,
  verifyToken: string,
  expectedToken: string,
  challenge: string
): { success: boolean; challenge?: string; error?: string } {
  if (mode !== "subscribe") {
    return { success: false, error: "Invalid mode" };
  }
  if (verifyToken !== expectedToken) {
    return { success: false, error: "Invalid verify token" };
  }
  return { success: true, challenge };
}

/**
 * Extract incoming messages from the webhook payload.
 */
export function extractMessengerMessages(
  body: { object: string; entry: MessengerWebhookEntry[] }
): MessengerMessage[] {
  if (body.object !== "page") return [];

  const messages: MessengerMessage[] = [];

  for (const entry of body.entry) {
    for (const event of entry.messaging || []) {
      if (event.message?.text) {
        messages.push({
          senderId: event.sender.id,
          recipientId: event.recipient.id,
          text: event.message.text,
          timestamp: event.timestamp,
          mid: event.message.mid,
        });
      }
    }
  }

  return messages;
}
