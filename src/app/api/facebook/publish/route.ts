import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase-admin";
import { COLLECTIONS } from "@/lib/schema";
import { publishToFacebookPage } from "@/server/facebook";
import { logAuditEvent } from "@/server/audit";

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const idToken = authHeader.split("Bearer ")[1];
    const decoded = await adminAuth.verifyIdToken(idToken);

    if (!decoded.permissions?.canSendBulkMessages && !decoded.roles?.includes("owner") && !decoded.roles?.includes("platform_administrator")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { message, organizationId } = body;

    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "message is required" }, { status: 400 });
    }
    if (!organizationId) {
      return NextResponse.json({ error: "organizationId is required" }, { status: 400 });
    }

    const fbIntegration = await adminDb
      .collection(COLLECTIONS.integrations)
      .where("organizationId", "==", organizationId)
      .where("provider", "==", "facebook")
      .where("status", "==", "active")
      .limit(1)
      .get();

    if (fbIntegration.empty) {
      return NextResponse.json({ error: "No active Facebook integration found. Configure it in Settings first." }, { status: 400 });
    }

    const fbData = fbIntegration.docs[0].data();
    const pageId = fbData.config?.pageId;
    const accessToken = fbData.config?.accessToken;

    if (!pageId || !accessToken) {
      return NextResponse.json({ error: "Facebook Page ID and Access Token must be configured" }, { status: 400 });
    }

    const result = await publishToFacebookPage(pageId, accessToken, message);

    await logAuditEvent({
      action: "publish_facebook_post",
      category: "communication",
      userId: decoded.uid,
      resourceType: "facebook_post",
      resourceId: result.id,
      organizationId,
      metadata: { pageId, postId: result.id, messagePreview: message.slice(0, 100) },
    });

    return NextResponse.json({ data: { postId: result.id, published: true } });
  } catch (error) {
    console.error("POST /api/facebook/publish error:", error);
    const msg = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
