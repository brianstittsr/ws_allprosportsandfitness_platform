import { adminDb } from "@/lib/firebase-admin";
import { Timestamp } from "firebase-admin/firestore";
import { COLLECTIONS } from "@/lib/schema";
import { logAuditEvent } from "@/server/audit";

export interface ImportStaffInput {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  jobTitle: string;
  employmentType?: string;
  departmentIds?: string[];
  programIds?: string[];
  supervisorId?: string;
  isActive?: boolean;
}

export interface ImportStaffResult {
  created: number;
  updated: number;
  skipped: number;
  errors: string[];
}

export async function findExistingStaff(
  organizationId: string,
  email?: string
): Promise<{ id: string; data: Record<string, unknown> } | null> {
  if (!email) return null;
  const q = adminDb
    .collection(COLLECTIONS.staff)
    .where("organizationId", "==", organizationId)
    .where("email", "==", email.toLowerCase().trim())
    .limit(1);
  const snap = await q.get();
  if (!snap.empty) return { id: snap.docs[0].id, data: snap.docs[0].data() };
  return null;
}

export async function importSingleStaff(
  input: ImportStaffInput,
  organizationId: string,
  userId: string,
  options: { mergeDuplicates?: boolean } = {}
): Promise<{ id: string; action: "created" | "updated" | "skipped" }> {
  const existing = await findExistingStaff(organizationId, input.email);
  const now = Timestamp.now();

  const staffData: Record<string, unknown> = {
    firstName: input.firstName.trim(),
    lastName: input.lastName.trim(),
    email: input.email.toLowerCase().trim(),
    phone: input.phone ? input.phone.replace(/\D/g, "") : undefined,
    jobTitle: input.jobTitle.trim(),
    employmentType: input.employmentType || "full_time",
    departmentIds: input.departmentIds || [],
    programIds: input.programIds || [],
    supervisorId: input.supervisorId || undefined,
    isActive: input.isActive !== false,
    permissions: {
      canManageContacts: false,
      canManagePrograms: false,
      canViewFinancials: false,
      canManageFinancials: false,
      canApprovePayouts: false,
      canAccessAdmin: false,
      canUseHermes: false,
    },
    communicationPermissions: {
      canEmailClients: false,
      canSmsClients: false,
      canEmailStaff: false,
      canSendBulkMessages: false,
      requiresApprovalForBulk: true,
    },
    organizationId,
    updatedAt: now,
    updatedBy: userId,
    schemaVersion: 1,
  };

  if (existing) {
    if (options.mergeDuplicates) {
      const merged = { ...staffData };
      if (existing.data.createdAt) merged.createdAt = existing.data.createdAt;
      if (existing.data.createdBy) merged.createdBy = existing.data.createdBy;
      await adminDb.collection(COLLECTIONS.staff).doc(existing.id).update(merged);
      return { id: existing.id, action: "updated" };
    }
    return { id: existing.id, action: "skipped" };
  }

  staffData.status = "active";
  staffData.createdAt = now;
  staffData.createdBy = userId;

  const docRef = await adminDb.collection(COLLECTIONS.staff).add(staffData);
  return { id: docRef.id, action: "created" };
}

export async function bulkImportStaff(
  inputs: ImportStaffInput[],
  organizationId: string,
  userId: string,
  options: { mergeDuplicates?: boolean } = {}
): Promise<ImportStaffResult> {
  const result: ImportStaffResult = { created: 0, updated: 0, skipped: 0, errors: [] };

  for (const input of inputs) {
    try {
      if (!input.firstName || !input.lastName || !input.email || !input.jobTitle) {
        result.errors.push(`Missing required fields for ${input.email || "unknown"}`);
        continue;
      }
      const res = await importSingleStaff(input, organizationId, userId, options);
      if (res.action === "created") result.created++;
      else if (res.action === "updated") result.updated++;
      else result.skipped++;
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      result.errors.push(`Error importing ${input.email}: ${msg}`);
    }
  }

  await logAuditEvent({
    action: "bulk_import_staff",
    category: "import",
    userId,
    resourceType: COLLECTIONS.staff,
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

export function parseCsvStaff(csvText: string): ImportStaffInput[] {
  const lines = csvText.split("\n").filter((l) => l.trim());
  if (lines.length < 2) return [];

  const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
  const rows: ImportStaffInput[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(",").map((v) => v.trim());
    const row: Record<string, string> = {};
    headers.forEach((h, idx) => { if (values[idx] !== undefined) row[h] = values[idx]; });

    if (!row.firstname && !row.first_name && !row["first name"]) continue;
    if (!row.email) continue;
    if (!row.jobtitle && !row.job_title && !row["job title"]) continue;

    rows.push({
      firstName: row.firstname || row.first_name || row["first name"] || "",
      lastName: row.lastname || row.last_name || row["last name"] || "",
      email: row.email,
      phone: row.phone || undefined,
      jobTitle: row.jobtitle || row.job_title || row["job title"] || "",
      employmentType: (row.employmenttype || row["employment type"] || "full_time").replace(" ", "_"),
      departmentIds: (row.departmentids || row["department ids"] || "").split(";").map((t) => t.trim()).filter(Boolean),
      programIds: (row.programids || row["program ids"] || "").split(";").map((t) => t.trim()).filter(Boolean),
      supervisorId: row.supervisorid || row.supervisor || undefined,
      isActive: row.isactive !== "false" && row["is active"] !== "false",
    });
  }

  return rows;
}
