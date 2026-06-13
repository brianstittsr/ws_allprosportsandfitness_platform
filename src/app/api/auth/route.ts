import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase-admin";

export async function POST(request: NextRequest) {
  try {
    const { idToken } = await request.json();

    if (!idToken) {
      return NextResponse.json({ error: "ID token is required" }, { status: 400 });
    }

    const decodedToken = await adminAuth.verifyIdToken(idToken);

    return NextResponse.json({
      data: {
        uid: decodedToken.uid,
        email: decodedToken.email,
        roles: decodedToken.roles || [],
        permissions: decodedToken.permissions || {},
      },
    });
  } catch (error) {
    console.error("Auth verification error:", error);
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }
}
