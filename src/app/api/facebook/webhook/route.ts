import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { COLLECTIONS } from "@/lib/schema";
import { verifyMessengerWebhook, extractMessengerMessages, sendMessengerMessage } from "@/server/facebook-messenger";
import { askHermes, logHermesInteraction } from "@/server/hermes";
import { logAuditEvent } from "@/server/audit";

const VERIFY_TOKEN = process.env.FACEBOOK_MESSENGER_VERIFY_TOKEN || "hermes_webhook_verify_2024";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (!mode || !token || !challenge) {
    return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
  }

  const result = verifyMessengerWebhook(mode, token, VERIFY_TOKEN, challenge);

  if (result.success) {
    return new NextResponse(result.challenge, { status: 200 });
  }

  return NextResponse.json({ error: result.error }, { status: 403 });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (body.object !== "page") {
      return NextResponse.json({ message: "Not a page event" }, { status: 200 });
    }

    const messages = extractMessengerMessages(body);

    for (const msg of messages) {
      try {
        const fbIntegration = await adminDb
          .collection(COLLECTIONS.integrations)
          .where("provider", "==", "facebook")
          .where("status", "==", "active")
          .limit(1)
          .get();

        if (fbIntegration.empty) continue;

        const fbData = fbIntegration.docs[0].data();
        const accessToken = fbData.config?.accessToken;
        if (!accessToken) continue;

        const hermesResponse = await askHermes(msg.text || "", {
          channel: "facebook",
          userId: msg.senderId,
        });

        await logHermesInteraction(msg.text || "", hermesResponse, {
          channel: "facebook",
          userId: msg.senderId,
        });

        await sendMessengerMessage(
          accessToken,
          msg.senderId,
          hermesResponse.text,
          hermesResponse.quickReplies
        );

        await logAuditEvent({
          action: "hermes_facebook_response",
          category: "hermes",
          userId: msg.senderId,
          resourceType: "facebook_message",
          resourceId: msg.mid,
          organizationId: fbData.organizationId || "default",
          metadata: {
            channel: "facebook_messenger",
            messagePreview: (msg.text || "").slice(0, 100),
            responsePreview: hermesResponse.text.slice(0, 100),
          },
        });
      } catch (error) {
        console.error("Error processing Facebook Messenger message:", error);
      }
    }

    return NextResponse.json({ message: "EVENT_RECEIVED" }, { status: 200 });
  } catch (error) {
    console.error("POST /api/facebook/webhook error:", error);
    return NextResponse.json({ message: "EVENT_RECEIVED" }, { status: 200 });
  }
}
