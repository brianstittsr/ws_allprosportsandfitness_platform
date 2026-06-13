import { NextRequest, NextResponse } from "next/server";
import { adminDb, adminAuth } from "@/lib/firebase-admin";
import { programSchema } from "@/schemas";

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const idToken = authHeader.split("Bearer ")[1];
    const decoded = await adminAuth.verifyIdToken(idToken);

    if (!decoded.permissions?.managePrograms && !decoded.roles?.includes("owner") && !decoded.roles?.includes("platform_administrator")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get("organizationId");

    if (!organizationId) {
      return NextResponse.json({ error: "organizationId is required" }, { status: 400 });
    }

    const snapshot = await adminDb
      .collection("programs")
      .where("organizationId", "==", organizationId)
      .orderBy("createdAt", "desc")
      .limit(100)
      .get();

    const programs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    return NextResponse.json({ data: programs });
  } catch (error) {
    console.error("GET /api/programs error:", error);
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

    if (!decoded.permissions?.managePrograms && !decoded.roles?.includes("owner") && !decoded.roles?.includes("platform_administrator")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const validated = programSchema.parse(body);

    const docRef = await adminDb.collection("programs").add({
      ...validated,
      organizationId: body.organizationId,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: decoded.uid,
      updatedBy: decoded.uid,
      status: "active",
      schemaVersion: 1,
    });

    return NextResponse.json({ data: { id: docRef.id } }, { status: 201 });
  } catch (error) {
    console.error("POST /api/programs error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
