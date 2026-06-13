import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase-admin";
import { bulkImportStaff, parseCsvStaff } from "@/server/staff";
import { COLLECTIONS } from "@/lib/schema";

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const idToken = authHeader.split("Bearer ")[1];
    const decoded = await adminAuth.verifyIdToken(idToken);

    if (!decoded.permissions?.manageUsers && !decoded.roles?.includes("owner") && !decoded.roles?.includes("platform_administrator")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { format, data, organizationId, mergeDuplicates = false } = body;

    if (!organizationId) {
      return NextResponse.json({ error: "organizationId is required" }, { status: 400 });
    }

    if (!data || !Array.isArray(data) || data.length === 0) {
      return NextResponse.json({ error: "No data provided" }, { status: 400 });
    }

    let inputs;
    if (format === "csv") {
      inputs = parseCsvStaff(data[0]);
    } else if (format === "json") {
      inputs = data;
    } else {
      return NextResponse.json({ error: "Unsupported format" }, { status: 400 });
    }

    if (inputs.length === 0) {
      return NextResponse.json({ error: "No valid staff found in data" }, { status: 400 });
    }

    if (inputs.length > 50) {
      const jobRef = await adminDb.collection(COLLECTIONS.communicationJobs).add({
        name: `Bulk Staff Import - ${inputs.length} staff`,
        type: "import",
        status: "pending",
        channel: "in_app",
        recipientCount: inputs.length,
        sentCount: 0,
        failedCount: 0,
        scheduledAt: new Date(),
        organizationId,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: decoded.uid,
        updatedBy: decoded.uid,
        metadata: { importFormat: format, mergeDuplicates, totalRecords: inputs.length },
        schemaVersion: 1,
      });

      await adminDb.collection(COLLECTIONS.tasks).add({
        type: "bulk_staff_import",
        status: "pending",
        jobId: jobRef.id,
        inputs: inputs.slice(0, 500),
        organizationId,
        userId: decoded.uid,
        mergeDuplicates,
        createdAt: new Date(),
        schemaVersion: 1,
      });

      return NextResponse.json({
        data: { status: "queued", message: `Import queued for ${inputs.length} staff members`, jobId: jobRef.id },
      });
    }

    const result = await bulkImportStaff(inputs, organizationId, decoded.uid, { mergeDuplicates });

    return NextResponse.json({ data: result });
  } catch (error) {
    console.error("POST /api/staff/import error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
