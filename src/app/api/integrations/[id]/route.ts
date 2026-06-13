import { NextRequest, NextResponse } from "next/server";
import { adminDb, adminAuth } from "@/lib/firebase-admin";
import { COLLECTIONS } from "@/lib/schema";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
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

    const { id } = await params;
    const body = await request.json();

    const updateData: Record<string, unknown> = {
      updatedAt: new Date(),
      updatedBy: decoded.uid,
    };

    if (body.config !== undefined) updateData.config = body.config;
    if (body.status !== undefined) updateData.status = body.status;
    if (body.webhookUrl !== undefined) updateData.webhookUrl = body.webhookUrl;
    if (body.lastSyncAt !== undefined) updateData.lastSyncAt = new Date(body.lastSyncAt);
    if (body.lastSyncStatus !== undefined) updateData.lastSyncStatus = body.lastSyncStatus;
    if (body.lastErrorMessage !== undefined) {
      updateData.lastErrorMessage = body.lastErrorMessage;
      updateData.lastErrorAt = new Date();
    }
    if (body.errorCount !== undefined) updateData.errorCount = body.errorCount;

    await adminDb.collection(COLLECTIONS.integrations).doc(id).update(updateData);

    return NextResponse.json({ data: { id } });
  } catch (error) {
    console.error("PATCH /api/integrations/[id] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
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

    const { id } = await params;
    await adminDb.collection(COLLECTIONS.integrations).doc(id).delete();

    return NextResponse.json({ data: { id, deleted: true } });
  } catch (error) {
    console.error("DELETE /api/integrations/[id] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
