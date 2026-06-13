import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase-admin";
import { COLLECTIONS } from "@/lib/schema";
import { bulkImportContacts, parseCsvContacts } from "@/server/contacts";

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const idToken = authHeader.split("Bearer ")[1];
    const decoded = await adminAuth.verifyIdToken(idToken);

    if (!decoded.permissions?.manageContacts && !decoded.roles?.includes("owner") && !decoded.roles?.includes("platform_administrator")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { format, data, organizationId, mergeDuplicates = false, defaultStatus = "new_lead" } = body;

    if (!organizationId) {
      return NextResponse.json({ error: "organizationId is required" }, { status: 400 });
    }

    if (!data || !Array.isArray(data) || data.length === 0) {
      return NextResponse.json({ error: "No data provided" }, { status: 400 });
    }

    let inputs;
    if (format === "csv") {
      inputs = parseCsvContacts(data[0] as string);
    } else {
      inputs = data.map((item: Record<string, unknown>) => ({
        firstName: String(item.firstName || item.first_name || ""),
        lastName: String(item.lastName || item.last_name || ""),
        email: String(item.email || ""),
        phone: item.phone ? String(item.phone) : undefined,
        mobile: item.mobile ? String(item.mobile) : undefined,
        contactTypes: Array.isArray(item.contactTypes) ? item.contactTypes : String(item.contactTypes || "prospect").split(";").map((t) => t.trim()).filter(Boolean),
        leadSource: item.leadSource ? String(item.leadSource) : undefined,
        campaignSource: item.campaignSource ? String(item.campaignSource) : undefined,
        assignedStaffId: item.assignedStaffId ? String(item.assignedStaffId) : undefined,
        emailConsent: Boolean(item.emailConsent),
        smsConsent: Boolean(item.smsConsent),
        tags: Array.isArray(item.tags) ? item.tags : String(item.tags || "").split(";").map((t) => t.trim()).filter(Boolean),
        externalIds: item.externalIds ? (item.externalIds as Record<string, string>) : {},
        customFields: item.customFields ? (item.customFields as Record<string, string | number | boolean>) : {},
      }));
    }

    if (inputs.length === 0) {
      return NextResponse.json({ error: "No valid contacts found in data" }, { status: 400 });
    }

    // For large imports, create a background job
    if (inputs.length > 50) {
      const jobRef = await adminDb.collection(COLLECTIONS.communicationJobs).add({
        name: `Bulk Contact Import - ${inputs.length} contacts`,
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
        metadata: { importFormat: format, mergeDuplicates, defaultStatus, totalRecords: inputs.length },
        schemaVersion: 1,
      });

      // Store inputs in a temporary collection for async processing
      await adminDb.collection(COLLECTIONS.tasks).add({
        type: "bulk_contact_import",
        status: "pending",
        jobId: jobRef.id,
        inputs: inputs.slice(0, 500), // cap at 500 per task
        organizationId,
        userId: decoded.uid,
        mergeDuplicates,
        defaultStatus,
        createdAt: new Date(),
        schemaVersion: 1,
      });

      return NextResponse.json({
        data: {
          jobId: jobRef.id,
          status: "queued",
          message: `Import of ${inputs.length} contacts has been queued for background processing.`,
        },
      });
    }

    const result = await bulkImportContacts(inputs, organizationId, decoded.uid, {
      mergeDuplicates,
      defaultStatus,
    });

    return NextResponse.json({ data: result });
  } catch (error) {
    console.error("POST /api/contacts/import error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
