import { adminDb } from "@/lib/firebase-admin";
import { type AuditCategory, type AuditLog } from "@/types";

interface AuditLogInput {
  action: string;
  category: AuditCategory;
  userId: string;
  userEmail?: string;
  userRole?: string;
  resourceType: string;
  resourceId: string;
  organizationId: string;
  changes?: Record<string, { old: unknown; new: unknown }> | null;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
}

export async function logAuditEvent(input: AuditLogInput): Promise<void> {
  try {
    const timestamp = new Date();
    const logEntry: Omit<AuditLog, "id"> = {
      ...input,
      changes: input.changes ?? null,
      metadata: input.metadata ?? {},
      createdAt: timestamp as unknown as import("firebase/firestore").Timestamp,
      updatedAt: timestamp as unknown as import("firebase/firestore").Timestamp,
      createdBy: input.userId,
      updatedBy: input.userId,
      status: "active",
      schemaVersion: 1,
    };

    await adminDb.collection("auditLogs").add(logEntry);
  } catch (error) {
    console.error("Failed to write audit log:", error);
  }
}

export async function logAuthEvent(
  userId: string,
  action: "login" | "logout" | "failed_login" | "password_reset" | "role_changed" | "permission_changed",
  metadata?: Record<string, unknown>,
  ipAddress?: string
): Promise<void> {
  await logAuditEvent({
    action,
    category: "authentication",
    userId,
    resourceType: "user",
    resourceId: userId,
    organizationId: metadata?.organizationId as string || "system",
    metadata,
    ipAddress,
  });
}

export async function logFinancialEvent(
  userId: string,
  userEmail: string,
  action: string,
  resourceType: string,
  resourceId: string,
  organizationId: string,
  changes?: Record<string, { old: unknown; new: unknown }>
): Promise<void> {
  await logAuditEvent({
    action,
    category: "financial",
    userId,
    userEmail,
    resourceType,
    resourceId,
    organizationId,
    changes,
  });
}

export async function logContactEvent(
  userId: string,
  action: string,
  contactId: string,
  organizationId: string,
  changes?: Record<string, { old: unknown; new: unknown }>
): Promise<void> {
  await logAuditEvent({
    action,
    category: "contact",
    userId,
    resourceType: "contact",
    resourceId: contactId,
    organizationId,
    changes,
  });
}
