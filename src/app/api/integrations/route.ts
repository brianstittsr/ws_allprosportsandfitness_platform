import { NextRequest, NextResponse } from "next/server";
import { adminDb, adminAuth } from "@/lib/firebase-admin";
import { COLLECTIONS } from "@/lib/schema";

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
      .collection(COLLECTIONS.integrations)
      .where("organizationId", "==", organizationId)
      .orderBy("createdAt", "desc")
      .get();

    const integrations = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    return NextResponse.json({ data: integrations });
  } catch (error) {
    console.error("GET /api/integrations error:", error);
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

    if (!decoded.permissions?.accessAdminPanel && !decoded.roles?.includes("owner") && !decoded.roles?.includes("platform_administrator")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();

    if (!body.organizationId || !body.name || !body.provider) {
      return NextResponse.json({ error: "organizationId, name, and provider are required" }, { status: 400 });
    }

    const docRef = await adminDb.collection(COLLECTIONS.integrations).add({
      name: body.name,
      provider: body.provider,
      type: body.type || "custom",
      status: body.status || "pending",
      config: body.config || {},
      webhookUrl: body.webhookUrl || null,
      organizationId: body.organizationId,
      errorCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: decoded.uid,
      updatedBy: decoded.uid,
      schemaVersion: 1,
    });

    return NextResponse.json({ data: { id: docRef.id } }, { status: 201 });
  } catch (error) {
    console.error("POST /api/integrations error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
