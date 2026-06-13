import { NextRequest, NextResponse } from "next/server";
import { adminDb, adminAuth } from "@/lib/firebase-admin";
import { logAuditEvent } from "@/server/audit";
import { createGitHubService, updateCodeViaTelegram, createDeploymentPullRequest } from "@/server/github";

interface TelegramMessage {
  message_id: number;
  from: {
    id: number;
    first_name: string;
    username?: string;
  };
  chat: {
    id: number;
    type: string;
  };
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

async function verifyTelegramUser(telegramUserId: number): Promise<{ userId: string; permissions: Record<string, boolean>; displayName: string } | null> {
  const q = adminDb.collection("userAccess").where("telegramUserId", "==", String(telegramUserId)).limit(1);
  const snapshot = await q.get();
  if (snapshot.empty) return null;
  const data = snapshot.docs[0].data();
  return {
    userId: data.userId,
    permissions: data.permissions || {},
    displayName: data.displayName || "Unknown",
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

    const organizationDoc = await adminDb.collection("organizations").limit(1).get();
    const organizationId = organizationDoc.empty ? "default" : organizationDoc.docs[0].id;

    if (text.startsWith("/help")) {
      const helpText = `
*NC Fitness Club Bot Commands*

*Code Updates (Admin Only):*
/branch \<name\> \- Create a new branch
/update \<path\> \<content\> \- Update a file
/pr \<branch\> \- Create a pull request
/status \- Check deployment status

*Operational:*
/ping \- Check bot status
      `.trim();
      await sendTelegramMessage(chatId, helpText);
      return NextResponse.json({ ok: true });
    }

    if (text === "/ping") {
      await sendTelegramMessage(chatId, `Pong! Hello ${user.displayName}. Bot is operational.`);
      return NextResponse.json({ ok: true });
    }

    if (!user.permissions.accessAdminPanel) {
      await sendTelegramMessage(chatId, "You do not have admin access. Contact a platform administrator.");
      return NextResponse.json({ ok: true });
    }

    if (text.startsWith("/branch ")) {
      const branchName = text.replace("/branch ", "").trim();
      if (!branchName) {
        await sendTelegramMessage(chatId, "Usage: /branch <branch-name>");
        return NextResponse.json({ ok: true });
      }

      try {
        const gh = createGitHubService();
        await gh.createBranch(branchName, "main");
        await sendTelegramMessage(chatId, `Branch *${branchName}* created successfully.`);
        await logAuditEvent({
          action: "telegram_create_branch",
          category: "telegram",
          userId: user.userId,
          resourceType: "branch",
          resourceId: branchName,
          organizationId,
          metadata: { telegramUserId, chatId },
        });
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        await sendTelegramMessage(chatId, `Failed to create branch: ${msg}`);
      }
      return NextResponse.json({ ok: true });
    }

    if (text.startsWith("/update ")) {
      const parts = text.replace("/update ", "").trim();
      const firstSpace = parts.indexOf(" ");
      if (firstSpace === -1) {
        await sendTelegramMessage(chatId, "Usage: /update <file-path> <content>");
        return NextResponse.json({ ok: true });
      }

      const filePath = parts.slice(0, firstSpace);
      const content = parts.slice(firstSpace + 1);

      if (!filePath || !content) {
        await sendTelegramMessage(chatId, "Usage: /update <file-path> <content>");
        return NextResponse.json({ ok: true });
      }

      try {
        const result = await updateCodeViaTelegram(
          filePath,
          content,
          `Update via Telegram by ${user.displayName}`,
          user.userId,
          organizationId
        );
        await sendTelegramMessage(chatId, `File *${filePath}* updated. Commit: \`${result.commitSha.slice(0, 7)}\` on branch *${result.branch}*.`);
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        await sendTelegramMessage(chatId, `Failed to update file: ${msg}`);
      }
      return NextResponse.json({ ok: true });
    }

    if (text.startsWith("/pr ")) {
      const branch = text.replace("/pr ", "").trim();
      if (!branch) {
        await sendTelegramMessage(chatId, "Usage: /pr <branch-name>");
        return NextResponse.json({ ok: true });
      }

      try {
        const pr = await createDeploymentPullRequest(branch, user.userId, organizationId);
        await sendTelegramMessage(chatId, `Pull request #${pr.number} created: ${pr.url}`);
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        await sendTelegramMessage(chatId, `Failed to create PR: ${msg}`);
      }
      return NextResponse.json({ ok: true });
    }

    if (text === "/status") {
      try {
        const gh = createGitHubService();
        const latest = await gh.getLatestCommit("main");
        const workflows = await gh.listWorkflows();
        const activeWorkflows = workflows.filter((w) => w.state === "active");

        const statusText = [
          `*Main Branch Status:*`,
          `Latest commit: \`${latest.sha.slice(0, 7)}\``,
          `Message: ${latest.message.slice(0, 60)}`,
          `Date: ${new Date(latest.date).toLocaleString()}`,
          ``,
          `*Workflows:* ${activeWorkflows.length} active`,
          activeWorkflows.map((w) => `- ${w.name}`).join("\n"),
        ].join("\n");

        await sendTelegramMessage(chatId, statusText);
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        await sendTelegramMessage(chatId, `Failed to get status: ${msg}`);
      }
      return NextResponse.json({ ok: true });
    }

    await sendTelegramMessage(chatId, "Unknown command. Type /help for available commands.");
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Telegram webhook error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
