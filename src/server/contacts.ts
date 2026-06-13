import { adminDb } from "@/lib/firebase-admin";
import { COLLECTIONS } from "@/lib/schema";
import { Timestamp } from "firebase-admin/firestore";
import { logAuditEvent } from "@/server/audit";

export interface ImportContactInput {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  mobile?: string;
  contactTypes: string[];
  leadSource?: string;
  campaignSource?: string;
  assignedStaffId?: string;
  emailConsent: boolean;
  smsConsent: boolean;
  tags: string[];
  externalIds: Record<string, string>;
  customFields?: Record<string, string | number | boolean>;
}

export interface ImportResult {
  created: number;
  updated: number;
  skipped: number;
  errors: string[];
  duplicates: number;
}

/**
 * Find existing contact by email or phone to prevent duplicates.
 */
export async function findExistingContact(
  organizationId: string,
  email?: string,
  phone?: string
): Promise<{ id: string; data: Record<string, unknown> } | null> {
  if (!email && !phone) return null;

  if (email) {
    const q = adminDb
      .collection(COLLECTIONS.contacts)
      .where("organizationId", "==", organizationId)
      .where("email", "==", email.toLowerCase().trim())
      .limit(1);
    const snap = await q.get();
    if (!snap.empty) return { id: snap.docs[0].id, data: snap.docs[0].data() };
  }

  if (phone) {
    const normalizedPhone = phone.replace(/\D/g, "");
    const q = adminDb
      .collection(COLLECTIONS.contacts)
      .where("organizationId", "==", organizationId)
      .where("phone", "==", normalizedPhone)
      .limit(1);
    const snap = await q.get();
    if (!snap.empty) return { id: snap.docs[0].id, data: snap.docs[0].data() };
  }

  return null;
}

/**
 * Import a single contact with deduplication logic.
 * Returns the Firestore document ID.
 */
export async function importSingleContact(
  input: ImportContactInput,
  organizationId: string,
  userId: string,
  options: { mergeDuplicates?: boolean; defaultStatus?: string } = {}
): Promise<{ id: string; action: "created" | "updated" | "skipped" }> {
  const existing = await findExistingContact(organizationId, input.email, input.phone);
  const now = Timestamp.now();

  const contactData: Record<string, unknown> = {
    firstName: input.firstName.trim(),
    lastName: input.lastName.trim(),
    email: input.email.toLowerCase().trim(),
    phone: input.phone ? input.phone.replace(/\D/g, "") : undefined,
    mobile: input.mobile ? input.mobile.replace(/\D/g, "") : undefined,
    preferredLanguage: "en",
    contactTypes: input.contactTypes.length > 0 ? input.contactTypes : ["prospect"],
    programIds: [],
    leadSource: input.leadSource || undefined,
    campaignSource: input.campaignSource || undefined,
    assignedStaffId: input.assignedStaffId || undefined,
    currentStatus: options.defaultStatus || "new_lead",
    lastContactAt: now,
    nextActionDate: Timestamp.fromMillis(now.toMillis() + 2 * 24 * 60 * 60 * 1000), // 2 days for follow-up
    nextActionType: "follow_up",
    emailConsent: input.emailConsent,
    smsConsent: input.smsConsent,
    optOutStatus: false,
    tags: input.tags || [],
    customFields: input.customFields || {},
    externalIds: input.externalIds || {},
    organizationId,
    updatedAt: now,
    updatedBy: userId,
    schemaVersion: 1,
  };

  if (existing) {
    if (options.mergeDuplicates) {
      // Merge: update the existing contact with new data
      const merged = { ...contactData };
      // Preserve some existing fields
      if (existing.data.createdAt) merged.createdAt = existing.data.createdAt;
      if (existing.data.createdBy) merged.createdBy = existing.data.createdBy;

      await adminDb.collection(COLLECTIONS.contacts).doc(existing.id).update(merged);
      return { id: existing.id, action: "updated" };
    }
    return { id: existing.id, action: "skipped" };
  }

  contactData.status = "active";
  contactData.createdAt = now;
  contactData.createdBy = userId;

  const docRef = await adminDb.collection(COLLECTIONS.contacts).add(contactData);
  return { id: docRef.id, action: "created" };
}

/**
 * Bulk import contacts from an array of inputs.
 */
export async function bulkImportContacts(
  inputs: ImportContactInput[],
  organizationId: string,
  userId: string,
  options: { mergeDuplicates?: boolean; defaultStatus?: string } = {}
): Promise<ImportResult> {
  const result: ImportResult = { created: 0, updated: 0, skipped: 0, errors: [], duplicates: 0 };

  for (const input of inputs) {
    try {
      if (!input.firstName || !input.lastName || !input.email) {
        result.errors.push(`Missing required fields for ${input.email || "unknown"}`);
        continue;
      }
      const res = await importSingleContact(input, organizationId, userId, options);
      if (res.action === "created") result.created++;
      else if (res.action === "updated") result.updated++;
      else result.skipped++;
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      result.errors.push(`Error importing ${input.email}: ${msg}`);
    }
  }

  await logAuditEvent({
    action: "bulk_import_contacts",
    category: "import",
    userId,
    resourceType: COLLECTIONS.contacts,
    resourceId: "bulk",
    organizationId,
    metadata: {
      totalProcessed: inputs.length,
      created: result.created,
      updated: result.updated,
      skipped: result.skipped,
      errors: result.errors.length,
    },
  });

  return result;
}

/**
 * Parse CSV content into import inputs.
 * Expected headers: firstName, lastName, email, phone, mobile, contactTypes, leadSource, tags, emailConsent, smsConsent
 */
export function parseCsvContacts(csvText: string): ImportContactInput[] {
  const lines = csvText.split("\n").filter((l) => l.trim());
  if (lines.length < 2) return [];

  const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
  const rows: ImportContactInput[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(",").map((v) => v.trim());
    const row: Record<string, string> = {};
    headers.forEach((h, idx) => { if (values[idx] !== undefined) row[h] = values[idx]; });

    if (!row.firstname && !row.first_name && !row["first name"]) continue;
    if (!row.email) continue;

    rows.push({
      firstName: row.firstname || row.first_name || row["first name"] || "",
      lastName: row.lastname || row.last_name || row["last name"] || "",
      email: row.email,
      phone: row.phone || row["phone number"] || undefined,
      mobile: row.mobile || undefined,
      contactTypes: (row.contacttypes || row["contact types"] || "prospect").split(";").map((t) => t.trim()).filter(Boolean),
      leadSource: row.leadsource || row["lead source"] || undefined,
      campaignSource: row.campaignsource || row["campaign source"] || undefined,
      assignedStaffId: row.assignedstaffid || row["assigned staff"] || undefined,
      emailConsent: row.emailconsent === "true" || row["email consent"] === "true" || row.emailconsent === "yes",
      smsConsent: row.smsconsent === "true" || row["sms consent"] === "true" || row.smsconsent === "yes",
      tags: (row.tags || "").split(";").map((t) => t.trim()).filter(Boolean),
      externalIds: {},
      customFields: {},
    });
  }

  return rows;
}
