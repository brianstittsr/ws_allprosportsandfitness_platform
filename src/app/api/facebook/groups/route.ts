import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase-admin";
import { COLLECTIONS } from "@/lib/schema";
import { logAuditEvent } from "@/server/audit";
import { Timestamp } from "firebase-admin/firestore";

export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const { name, description, privacy = "CLOSED", organizationId } = body;

    if (!name || !organizationId) {
      return NextResponse.json({ error: "name and organizationId are required" }, { status: 400 });
    }

    const fbIntegration = await adminDb
      .collection(COLLECTIONS.integrations)
      .where("organizationId", "==", organizationId)
      .where("provider", "==", "facebook")
      .where("status", "==", "active")
      .limit(1)
      .get();

    if (fbIntegration.empty) {
      return NextResponse.json({ error: "No active Facebook integration found" }, { status: 400 });
    }

    const fbData = fbIntegration.docs[0].data();
    const accessToken = fbData.config?.accessToken;
    const pageId = fbData.config?.pageId;

    if (!accessToken) {
      return NextResponse.json({ error: "Facebook Access Token not configured" }, { status: 400 });
    }

    let groupId: string | null = null;
    let apiError: string | null = null;

    try {
      const response = await fetch("https://graph.facebook.com/v18.0/me/groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          description: description?.trim() || "",
          privacy,
          admin: pageId,
          access_token: accessToken,
        }),
      });

      const data = await response.json();

      if (response.ok && data.id) {
        groupId = data.id;
      } else {
        apiError = data.error?.message || `Facebook API error: ${response.status}`;
      }
    } catch (error) {
      apiError = error instanceof Error ? error.message : "Failed to call Facebook API";
    }

    const groupRef = await adminDb.collection(COLLECTIONS.facebookGroups).add({
      name: name.trim(),
      description: description?.trim() || "",
      privacy,
      facebookGroupId: groupId,
      facebookPageId: pageId,
      organizationId,
      createdBy: decoded.uid,
      status: groupId ? "active" : "pending",
      apiError: apiError || null,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      schemaVersion: 1,
    });

    await logAuditEvent({
      action: groupId ? "create_facebook_group" : "attempt_create_facebook_group",
      category: "integration",
      userId: decoded.uid,
      resourceType: "facebook_group",
      resourceId: groupId || groupRef.id,
      organizationId,
      metadata: { name, privacy, facebookGroupId: groupId, apiError },
    });

    if (groupId) {
      return NextResponse.json({
        data: { groupId, name, privacy, message: "Facebook group created successfully" },
      }, { status: 201 });
    }

    return NextResponse.json({
      data: {
        groupId: groupRef.id,
        name,
        privacy,
        status: "pending",
        message: apiError || "Group creation requires manual approval. Group details saved for tracking.",
        manualLink: `https://www.facebook.com/groups/create/`,
      },
    }, { status: 202 });
  } catch (error) {
    console.error("POST /api/facebook/groups error:", error);
    const msg = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

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

    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get("organizationId");

    if (!organizationId) {
      return NextResponse.json({ error: "organizationId is required" }, { status: 400 });
    }

    const snapshot = await adminDb
      .collection(COLLECTIONS.facebookGroups)
      .where("organizationId", "==", organizationId)
      .orderBy("createdAt", "desc")
      .limit(100)
      .get();

    const groups = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    return NextResponse.json({ data: groups });
  } catch (error) {
    console.error("GET /api/facebook/groups error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
