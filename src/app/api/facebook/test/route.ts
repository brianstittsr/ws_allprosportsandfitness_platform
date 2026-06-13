import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase-admin";
import { getFacebookPageInfo } from "@/server/facebook";

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
    const { pageId, accessToken } = body;

    if (!pageId || !accessToken) {
      return NextResponse.json({ error: "pageId and accessToken are required" }, { status: 400 });
    }

    const pageInfo = await getFacebookPageInfo(pageId, accessToken);

    return NextResponse.json({
      data: { pageId: pageInfo.id, pageName: pageInfo.name, connected: true },
    });
  } catch (error) {
    console.error("POST /api/facebook/test error:", error);
    const msg = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
