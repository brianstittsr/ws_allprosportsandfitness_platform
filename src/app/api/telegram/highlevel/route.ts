import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { COLLECTIONS } from "@/lib/schema";
import { logAuditEvent } from "@/server/audit";
import { createHighLevelService, syncContactToHighLevel } from "@/server/highlevel";

interface TelegramMessage {
  message_id: number;
  from: { id: number; first_name: string; username?: string };
  chat: { id: number; type: string };
  text?: string;
  date: number;
}

interface TelegramUpdate {
  update_id: number;
  message?: TelegramMessage;
}

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const WEBHOOK_SECRET = process.env.TELEGRAM_WEBHOOK_SECRET;

function sendTelegramMessage(chatId: number, text: string): Promise<void> {
  if (!BOT_TOKEN) return Promise.resolve();
  return fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: "Markdown" }),
  }).then(() => {});
}

async function verifyTelegramUser(telegramUserId: number): Promise<{ userId: string; permissions: Record<string, boolean>; displayName: string; organizationId: string } | null> {
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

export async function POST(request: NextRequest) {
  try {
    const secret = request.headers.get("x-telegram-webhook-secret");
    if (WEBHOOK_SECRET && secret !== WEBHOOK_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const update: TelegramUpdate = await request.json();
    const message = update.message;
    if (!message || !message.text) {
      return NextResponse.json({ ok: true });
    }

    const chatId = message.chat.id;
    const telegramUserId = message.from.id;
    const text = message.text.trim();

    const user = await verifyTelegramUser(telegramUserId);
    if (!user) {
      await sendTelegramMessage(chatId, "You are not authorized. Please link your Telegram account via the admin panel first.");
      return NextResponse.json({ ok: true });
    }

    if (!user.permissions.useHermes) {
      await sendTelegramMessage(chatId, "You do not have Hermes access. Contact a platform administrator.");
      return NextResponse.json({ ok: true });
    }

    if (text.startsWith("/hl_help")) {
      const helpText = `
*GoHighLevel Integration Commands*

/sync_contact \<contactId\> \- Sync a contact to HighLevel
/send_email \<email\> \<subject\> \<message\> \- Send email via HighLevel
/send_sms \<phone\> \<message\> \- Send SMS via HighLevel
/workflow \<workflowId\> \<contactId\> \- Add contact to workflow
/workflows \- List available workflows
/contacts \<search\> \- Search contacts in HighLevel
      `.trim();
      await sendTelegramMessage(chatId, helpText);
      return NextResponse.json({ ok: true });
    }

    if (text.startsWith("/sync_contact ")) {
      const contactId = text.replace("/sync_contact ", "").trim();
      if (!contactId) {
        await sendTelegramMessage(chatId, "Usage: /sync_contact <contactId>");
        return NextResponse.json({ ok: true });
      }

      try {
        const contactDoc = await adminDb.collection(COLLECTIONS.contacts).doc(contactId).get();
        if (!contactDoc.exists) {
          await sendTelegramMessage(chatId, `Contact ${contactId} not found.`);
          return NextResponse.json({ ok: true });
        }

        const contact = contactDoc.data()!;
        const highLevelId = await syncContactToHighLevel(
          {
            id: contactId,
            firstName: contact.firstName,
            lastName: contact.lastName,
            email: contact.email,
            phone: contact.phone,
            tags: contact.tags || [],
          },
          user.userId,
          user.organizationId
        );

        await sendTelegramMessage(chatId, `Contact synced to HighLevel successfully. HighLevel ID: \`${highLevelId}\``);
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        await sendTelegramMessage(chatId, `Failed to sync contact: ${msg}`);
      }
      return NextResponse.json({ ok: true });
    }

    if (text.startsWith("/send_email ")) {
      const parts = text.replace("/send_email ", "").trim();
      const spaceIdx = parts.indexOf(" ");
      const secondSpace = parts.indexOf(" ", spaceIdx + 1);

      if (spaceIdx === -1 || secondSpace === -1) {
        await sendTelegramMessage(chatId, "Usage: /send_email <email> <subject> <message>");
        return NextResponse.json({ ok: true });
      }

      const email = parts.slice(0, spaceIdx);
      const subject = parts.slice(spaceIdx + 1, secondSpace);
      const message = parts.slice(secondSpace + 1);

      try {
        const service = createHighLevelService();
        await service.sendEmail(email, subject, `<p>${message}</p>`);
        await sendTelegramMessage(chatId, `Email sent to ${email} with subject: "${subject}"`);

        await logAuditEvent({
          action: "telegram_send_email_highlevel",
          category: "communication",
          userId: user.userId,
          resourceType: "email",
          resourceId: email,
          organizationId: user.organizationId,
          metadata: { subject, telegramUserId, via: "highlevel" },
        });
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        await sendTelegramMessage(chatId, `Failed to send email: ${msg}`);
      }
      return NextResponse.json({ ok: true });
    }

    if (text.startsWith("/send_sms ")) {
      const parts = text.replace("/send_sms ", "").trim();
      const spaceIdx = parts.indexOf(" ");

      if (spaceIdx === -1) {
        await sendTelegramMessage(chatId, "Usage: /send_sms <phone> <message>");
        return NextResponse.json({ ok: true });
      }

      const phone = parts.slice(0, spaceIdx);
      const message = parts.slice(spaceIdx + 1);

      try {
        const service = createHighLevelService();
        await service.sendSms(phone, message);
        await sendTelegramMessage(chatId, `SMS sent to ${phone}.`);

        await logAuditEvent({
          action: "telegram_send_sms_highlevel",
          category: "communication",
          userId: user.userId,
          resourceType: "sms",
          resourceId: phone,
          organizationId: user.organizationId,
          metadata: { telegramUserId, via: "highlevel" },
        });
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        await sendTelegramMessage(chatId, `Failed to send SMS: ${msg}`);
      }
      return NextResponse.json({ ok: true });
    }

    if (text.startsWith("/workflow ")) {
      const parts = text.replace("/workflow ", "").trim();
      const spaceIdx = parts.indexOf(" ");

      if (spaceIdx === -1) {
        await sendTelegramMessage(chatId, "Usage: /workflow <workflowId> <contactId>");
        return NextResponse.json({ ok: true });
      }

      const workflowId = parts.slice(0, spaceIdx);
      const contactId = parts.slice(spaceIdx + 1);

      try {
        const service = createHighLevelService();
        await service.addContactToWorkflow({ workflowId, contactId });
        await sendTelegramMessage(chatId, `Contact \`${contactId}\` added to workflow \`${workflowId}\`.`);

        await logAuditEvent({
          action: "telegram_trigger_workflow",
          category: "integration",
          userId: user.userId,
          resourceType: "workflow",
          resourceId: workflowId,
          organizationId: user.organizationId,
          metadata: { contactId, telegramUserId },
        });
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        await sendTelegramMessage(chatId, `Failed to add to workflow: ${msg}`);
      }
      return NextResponse.json({ ok: true });
    }

    if (text === "/workflows") {
      try {
        const service = createHighLevelService();
        const workflows = await service.getWorkflows();
        const list = workflows.map((w) => `- \`${w.id}\` ${w.name} (${w.status})`).join("\n");
        await sendTelegramMessage(chatId, `*Available Workflows:*\n${list}`);
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        await sendTelegramMessage(chatId, `Failed to list workflows: ${msg}`);
      }
      return NextResponse.json({ ok: true });
    }

    if (text.startsWith("/contacts ")) {
      const search = text.replace("/contacts ", "").trim();
      try {
        const service = createHighLevelService();
        const contacts = await service.getContacts(20);
        const filtered = search
          ? contacts.filter((c) =>
              (c.email?.toLowerCase().includes(search.toLowerCase()) ?? false) ||
              (c.name?.toLowerCase().includes(search.toLowerCase()) ?? false) ||
              (c.phone?.includes(search) ?? false)
            )
          : contacts;

        const list = filtered.slice(0, 10).map((c) => `- \`${c.id}\` ${c.name || `${c.firstName} ${c.lastName}`} (${c.email || "no email"})`).join("\n");
        await sendTelegramMessage(chatId, `*HighLevel Contacts:*\n${list || "No contacts found."}`);
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        await sendTelegramMessage(chatId, `Failed to list contacts: ${msg}`);
      }
      return NextResponse.json({ ok: true });
    }

    await sendTelegramMessage(chatId, "Unknown command. Type /hl_help for available GoHighLevel commands.");
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Telegram HighLevel webhook error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
