import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase-admin";
import { createHighLevelService } from "@/server/highlevel";
import { bulkImportContacts } from "@/server/contacts";

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
    const { organizationId, mergeDuplicates = true, defaultStatus = "new_lead", limit = 100, tags = ["ghl_import"] } = body;

    if (!organizationId) {
      return NextResponse.json({ error: "organizationId is required" }, { status: 400 });
    }

    const service = createHighLevelService();
    const ghlContacts = await service.getContacts(limit);

    if (ghlContacts.length === 0) {
      return NextResponse.json({ data: { message: "No contacts found in GoHighLevel", created: 0, updated: 0, skipped: 0 } });
    }

    const inputs = ghlContacts.map((c) => ({
      firstName: c.firstName || c.name?.split(" ")[0] || "Unknown",
      lastName: c.lastName || c.name?.split(" ").slice(1).join(" ") || "",
      email: c.email || "",
      phone: c.phone || undefined,
      mobile: undefined,
      contactTypes: ["prospect"],
      leadSource: "GoHighLevel",
      campaignSource: undefined,
      assignedStaffId: undefined,
      emailConsent: true,
      smsConsent: true,
      tags: [...tags, ...(c.tags || [])],
      externalIds: c.id ? { highlevel: c.id } : ({} as Record<string, string>),
      customFields: c.customFields ? (c.customFields as Record<string, string | number | boolean>) : {},
    })).filter((c) => c.email); // only import contacts with email

    if (inputs.length === 0) {
      return NextResponse.json({ data: { message: "No valid contacts with email found in GoHighLevel", created: 0, updated: 0, skipped: 0 } });
    }

    // For large imports, queue as background job
    if (inputs.length > 50) {
      const jobRef = await adminDb.collection("communicationJobs").add({
        name: `GoHighLevel Contact Sync - ${inputs.length} contacts`,
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
        metadata: { source: "gohighlevel", mergeDuplicates, defaultStatus, totalRecords: inputs.length },
        schemaVersion: 1,
      });

      await adminDb.collection("tasks").add({
        type: "highlevel_contact_sync",
        status: "pending",
        jobId: jobRef.id,
        inputs: inputs.slice(0, 500),
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
          message: `Sync of ${inputs.length} contacts from GoHighLevel has been queued for background processing.`,
        },
      });
    }

    const result = await bulkImportContacts(inputs, organizationId, decoded.uid, {
      mergeDuplicates,
      defaultStatus,
    });

    // Update integration record with sync timestamp
    const integrationQuery = await adminDb
      .collection("integrations")
      .where("organizationId", "==", organizationId)
      .where("provider", "==", "highlevel")
      .limit(1)
      .get();

    if (!integrationQuery.empty) {
      await integrationQuery.docs[0].ref.update({
        lastSyncAt: new Date(),
        lastSyncStatus: result.errors.length > 0 ? "partial" : "success",
        updatedAt: new Date(),
      });
    }

    return NextResponse.json({ data: { ...result, source: "gohighlevel", totalFetched: ghlContacts.length } });
  } catch (error) {
    console.error("POST /api/contacts/sync-highlevel error:", error);
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
