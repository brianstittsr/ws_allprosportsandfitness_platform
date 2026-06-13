import { z } from "zod";

export const emailSchema = z.string().email("Invalid email address");
export const passwordSchema = z.string().min(8, "Password must be at least 8 characters");

export const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

export type LoginInput = z.infer<typeof loginSchema>;

export const addressSchema = z.object({
  street: z.string().min(1, "Street is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  zip: z.string().min(1, "ZIP code is required"),
  country: z.string().min(1, "Country is required"),
});

export const organizationSchema = z.object({
  name: z.string().min(1, "Organization name is required"),
  legalName: z.string().optional(),
  taxId: z.string().optional(),
  address: addressSchema.optional(),
  phone: z.string().optional(),
  email: emailSchema.optional(),
  website: z.string().url().optional(),
});

export type OrganizationInput = z.infer<typeof organizationSchema>;

export const programSchema = z.object({
  name: z.string().min(1, "Program name is required"),
  description: z.string().optional(),
  type: z.enum([
    "fitness",
    "sports",
    "yoga",
    "zumba",
    "boxing",
    "kickboxing_hiit",
    "core_blast",
    "personal_training",
    "weight_loss",
    "event",
    "league",
    "community",
    "camp",
  ]),
  departmentId: z.string().min(1, "Department is required"),
  locationIds: z.array(z.string()).default([]),
  managerIds: z.array(z.string()).default([]),
  instructorIds: z.array(z.string()).default([]),
  capacity: z.number().int().positive().optional(),
  waiverRequired: z.boolean().default(false),
});

export type ProgramInput = z.infer<typeof programSchema>;

export const departmentSchema = z.object({
  name: z.string().min(1, "Department name is required"),
  description: z.string().optional(),
  type: z.enum([
    "operations",
    "finance",
    "marketing",
    "sales",
    "collections",
    "programs",
    "sports_operations",
    "community_outreach",
    "events",
    "facilities",
  ]),
  managerIds: z.array(z.string()).default([]),
  locationIds: z.array(z.string()).default([]),
});

export type DepartmentInput = z.infer<typeof departmentSchema>;

export const locationSchema = z.object({
  name: z.string().min(1, "Location name is required"),
  description: z.string().optional(),
  address: addressSchema,
  phone: z.string().optional(),
  email: emailSchema.optional(),
  capacity: z.number().int().positive().optional(),
});

export type LocationInput = z.infer<typeof locationSchema>;

export const contactSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: emailSchema,
  phone: z.string().optional(),
  mobile: z.string().optional(),
  preferredLanguage: z.string().default("en"),
  contactTypes: z.array(z.string()).min(1, "At least one contact type is required"),
  programIds: z.array(z.string()).default([]),
  leadSource: z.string().optional(),
  campaignSource: z.string().optional(),
  assignedStaffId: z.string().optional(),
  emailConsent: z.boolean().default(false),
  smsConsent: z.boolean().default(false),
  dateOfBirth: z.string().datetime().optional(),
  gender: z.string().optional(),
  emergencyContactName: z.string().optional(),
  emergencyContactPhone: z.string().optional(),
  emergencyContactRelation: z.string().optional(),
  tags: z.array(z.string()).default([]),
});

export type ContactInput = z.infer<typeof contactSchema>;

export const staffSchema = z.object({
  contactId: z.string().min(1, "Contact is required"),
  userId: z.string().optional(),
  employeeId: z.string().optional(),
  departmentIds: z.array(z.string()).min(1, "At least one department is required"),
  programIds: z.array(z.string()).default([]),
  jobTitle: z.string().min(1, "Job title is required"),
  jobDuties: z.array(z.string()).default([]),
  supervisorId: z.string().optional(),
  employmentType: z.enum(["full_time", "part_time", "contractor", "volunteer"]),
  startDate: z.string().datetime(),
});

export type StaffInput = z.infer<typeof staffSchema>;

export const userAccessSchema = z.object({
  userId: z.string().min(1),
  email: emailSchema,
  displayName: z.string().min(1),
  roles: z.array(z.string()).min(1, "At least one role is required"),
  programIds: z.array(z.string()).default([]),
  departmentIds: z.array(z.string()).default([]),
  permissions: z.object({
    viewFinancials: z.boolean().default(false),
    manageFinancials: z.boolean().default(false),
    approvePayments: z.boolean().default(false),
    sendClientMessages: z.boolean().default(false),
    sendStaffMessages: z.boolean().default(false),
    manageContacts: z.boolean().default(false),
    managePrograms: z.boolean().default(false),
    manageUsers: z.boolean().default(false),
    accessAdminPanel: z.boolean().default(false),
    useHermes: z.boolean().default(false),
  }),
});

export type UserAccessInput = z.infer<typeof userAccessSchema>;

export const financialTransactionSchema = z.object({
  transactionDate: z.string().datetime(),
  transactionType: z.string().min(1),
  category: z.string().min(1),
  subcategory: z.string().optional(),
  amount: z.number().int(),
  debitAccountId: z.string().optional(),
  creditAccountId: z.string().optional(),
  paymentStatus: z.enum(["pending", "paid", "failed", "refunded", "partially_refunded", "cancelled"]),
  sourceSystem: z.string().min(1),
  externalTransactionId: z.string().optional(),
  relatedContactId: z.string().optional(),
  relatedInvoiceId: z.string().optional(),
  relatedPaymentId: z.string().optional(),
  financialPeriodId: z.string().min(1),
  notes: z.string().optional(),
});

export type FinancialTransactionInput = z.infer<typeof financialTransactionSchema>;
