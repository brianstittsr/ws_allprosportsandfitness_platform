import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase-admin";

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const idToken = authHeader.split("Bearer ")[1];
    const decoded = await adminAuth.verifyIdToken(idToken);

    if (!decoded.permissions?.accessAdminPanel && !decoded.roles?.includes("owner") && !decoded.roles?.includes("platform_administrator")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (!BOT_TOKEN) {
      return NextResponse.json({ error: "Telegram bot token not configured" }, { status: 500 });
    }

    const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getMe`);
    const data = await response.json();

    if (!data.ok) {
      return NextResponse.json({ error: data.description || "Failed to get bot info" }, { status: 500 });
    }

    return NextResponse.json({
      data: {
        bot: data.result,
        webhookUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/telegram/webhook`,
        highlevelWebhookUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/telegram/highlevel`,
      },
    });
  } catch (error) {
    console.error("GET /api/telegram/setup error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const idToken = authHeader.split("Bearer ")[1];
    const decoded = await adminAuth.verifyIdToken(idToken);

    if (!decoded.roles?.includes("owner") && !decoded.roles?.includes("platform_administrator")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (!BOT_TOKEN) {
      return NextResponse.json({ error: "Telegram bot token not configured" }, { status: 500 });
    }

    const { webhookUrl, secretToken } = await request.json();
    const appUrl = process.env.NEXT_PUBLIC_APP_URL;

    const targetUrl = webhookUrl || `${appUrl}/api/telegram/webhook`;

    const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/setWebhook`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        url: targetUrl,
        secret_token: secretToken || process.env.TELEGRAM_WEBHOOK_SECRET,
        allowed_updates: ["message"],
      }),
    });

    const data = await response.json();

    if (!data.ok) {
      return NextResponse.json({ error: data.description || "Failed to set webhook" }, { status: 500 });
    }

    return NextResponse.json({ data: { success: true, webhookUrl: targetUrl } });
  } catch (error) {
    console.error("POST /api/telegram/setup error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const idToken = authHeader.split("Bearer ")[1];
    const decoded = await adminAuth.verifyIdToken(idToken);

    if (!decoded.roles?.includes("owner") && !decoded.roles?.includes("platform_administrator")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (!BOT_TOKEN) {
      return NextResponse.json({ error: "Telegram bot token not configured" }, { status: 500 });
    }

    const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/deleteWebhook`);
    const data = await response.json();

    if (!data.ok) {
      return NextResponse.json({ error: data.description || "Failed to delete webhook" }, { status: 500 });
    }

    return NextResponse.json({ data: { success: true } });
  } catch (error) {
    console.error("DELETE /api/telegram/setup error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
