import { Timestamp } from "firebase/firestore";

export type RecordStatus = "active" | "inactive" | "archived" | "deleted";
export type ApprovalStatus = "pending" | "approved" | "rejected" | "cancelled";
export type PaymentStatus = "pending" | "paid" | "failed" | "refunded" | "partially_refunded" | "cancelled";

export interface BaseDocument<TStatus extends string = string> {
  id: string;
  organizationId: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: string;
  updatedBy: string;
  status: TStatus;
  schemaVersion: number;
}

export type UserRole =
  | "owner"
  | "platform_administrator"
  | "system_administrator"
  | "operations_coordinator"
  | "finance_and_bookkeeping"
  | "marketing_manager"
  | "sales_representative"
  | "collections_representative"
  | "program_manager"
  | "instructor_or_coach"
  | "sports_operations"
  | "content_creator"
  | "secretary_and_outreach"
  | "investor_read_only"
  | "staff_read_only";

export interface UserPermissions {
  viewFinancials: boolean;
  manageFinancials: boolean;
  approvePayments: boolean;
  sendClientMessages: boolean;
  sendStaffMessages: boolean;
  manageContacts: boolean;
  managePrograms: boolean;
  manageUsers: boolean;
  accessAdminPanel: boolean;
  useHermes: boolean;
}

export interface UserAccess extends BaseDocument {
  userId: string;
  email: string;
  displayName: string;
  roles: UserRole[];
  programIds: string[];
  departmentIds: string[];
  permissions: UserPermissions;
  accountStatus: "active" | "disabled" | "invited";
  telegramUserId?: string;
  telegramLinkedAt?: Timestamp;
  lastLoginAt?: Timestamp;
}

export interface Organization extends BaseDocument {
  name: string;
  legalName?: string;
  taxId?: string;
  address?: Address;
  phone?: string;
  email?: string;
  website?: string;
  logoUrl?: string;
  settings: OrganizationSettings;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

export interface OrganizationSettings {
  timezone: string;
  currency: string;
  dateFormat: string;
  communicationSettings: CommunicationSettings;
  financialSettings: FinancialSettings;
}

export interface CommunicationSettings {
  defaultEmailFrom: string;
  defaultReplyTo: string;
  smsProvider?: string;
  highLevelSettings?: CRMIntegrationSettings;
  telegramSettings?: TelegramSettings;
  slackWebhookUrl?: string;
}

export interface CRMIntegrationSettings {
  apiKeyRef: string;
  locationId?: string;
  enabled: boolean;
  lastSyncAt?: Timestamp;
}

export interface TelegramSettings {
  botTokenRef: string;
  enabled: boolean;
  adminChatId?: string;
}

export interface FinancialSettings {
  fiscalYearStart: number;
  fiscalYearEnd: number;
  defaultRevenueCategories: string[];
  defaultExpenseCategories: string[];
  stripeAccountId?: string;
}

export interface Program extends BaseDocument {
  name: string;
  description?: string;
  type: ProgramType;
  departmentId: string;
  locationIds: string[];
  managerIds: string[];
  instructorIds: string[];
  capacity?: number;
  schedule?: ScheduleEntry[];
  pricing?: PricingConfig;
  compensationPlanIds: string[];
  waiverRequired: boolean;
  waiverTemplateId?: string;
  settings: ProgramSettings;
}

export type ProgramType =
  | "fitness"
  | "sports"
  | "yoga"
  | "zumba"
  | "boxing"
  | "kickboxing_hiit"
  | "core_blast"
  | "personal_training"
  | "weight_loss"
  | "event"
  | "league"
  | "community"
  | "camp";

export interface ScheduleEntry {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  locationId: string;
}

export interface PricingConfig {
  dropInRate?: number;
  monthlyRate?: number;
  packageRate?: number;
  siblingDiscount?: number;
  registrationFee?: number;
}

export interface ProgramSettings {
  allowDropIns: boolean;
  allowOnlineRegistration: boolean;
  waitlistEnabled: boolean;
  autoPromoteWaitlist: boolean;
  cancellationPolicy: string;
  attendanceRequired: boolean;
}

export interface Department extends BaseDocument {
  name: string;
  description?: string;
  type: DepartmentType;
  managerIds: string[];
  locationIds: string[];
  budget?: number;
}

export type DepartmentType =
  | "operations"
  | "finance"
  | "marketing"
  | "sales"
  | "collections"
  | "programs"
  | "sports_operations"
  | "community_outreach"
  | "events"
  | "facilities";

export interface Location extends BaseDocument {
  name: string;
  description?: string;
  address: Address;
  phone?: string;
  email?: string;
  capacity?: number;
  operatingHours: OperatingHours;
  amenities: string[];
  status: RecordStatus;
}

export interface OperatingHours {
  monday?: TimeRange;
  tuesday?: TimeRange;
  wednesday?: TimeRange;
  thursday?: TimeRange;
  friday?: TimeRange;
  saturday?: TimeRange;
  sunday?: TimeRange;
}

export interface TimeRange {
  open: string;
  close: string;
}

export type ContactType =
  | "prospect"
  | "active_client"
  | "former_client"
  | "staff"
  | "coach"
  | "instructor"
  | "athlete"
  | "parent"
  | "guardian"
  | "sponsor"
  | "vendor"
  | "community_partner"
  | "investor";

export interface Contact extends BaseDocument {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  mobile?: string;
  preferredLanguage: string;
  contactTypes: ContactType[];
  programIds: string[];
  departmentIds: string[];
  leadSource?: string;
  campaignSource?: string;
  assignedStaffId?: string;
  currentStatus: ContactStatus;
  lastContactAt?: Timestamp;
  nextActionDate?: Timestamp;
  nextActionType?: string;
  assignedTo?: string;
  emailConsent: boolean;
  smsConsent: boolean;
  optOutStatus: boolean;
  optOutDate?: Timestamp;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelation?: string;
  dateOfBirth?: Timestamp;
  gender?: string;
  tags: string[];
  customFields: Record<string, string | number | boolean>;
  notes?: string;
  externalIds: Record<string, string>;
}

export type ContactStatus =
  | "new_lead"
  | "contacted"
  | "qualified"
  | "enrolled"
  | "active"
  | "inactive"
  | "churned"
  | "reengaged";

export interface Staff extends BaseDocument {
  contactId: string;
  userId?: string;
  employeeId?: string;
  departmentIds: string[];
  programIds: string[];
  jobTitle: string;
  jobDuties: string[];
  supervisorId?: string;
  employmentType: "full_time" | "part_time" | "contractor" | "volunteer";
  startDate: Timestamp;
  endDate?: Timestamp;
  compensationPlanId?: string;
  baseCompensation?: number;
  revenueShareTerms?: RevenueShareTerm[];
  collectionIncentives?: CollectionIncentive[];
  bonusRules?: BonusRule[];
  permissions: StaffPermissions;
  communicationPermissions: CommunicationPermissions;
  requiredDocuments: RequiredDocument[];
  trainingStatus: TrainingStatus;
  telegramUserId?: string;
  slackUserId?: string;
  crmUserId?: string;
  isActive: boolean;
}

export interface RevenueShareTerm {
  programId?: string;
  percentage: number;
  minimumAmount?: number;
  maximumAmount?: number;
  effectiveDate: Timestamp;
  endDate?: Timestamp;
}

export interface CollectionIncentive {
  percentage: number;
  thresholdAmount?: number;
  effectiveDate: Timestamp;
}

export interface BonusRule {
  name: string;
  type: "attendance" | "retention" | "new_client" | "collection" | "goal" | "tiered";
  criteria: Record<string, unknown>;
  amount: number;
  effectiveDate: Timestamp;
}

export interface StaffPermissions {
  canManageContacts: boolean;
  canManagePrograms: boolean;
  canViewFinancials: boolean;
  canManageFinancials: boolean;
  canApprovePayouts: boolean;
  canAccessAdmin: boolean;
  canUseHermes: boolean;
}

export interface CommunicationPermissions {
  canEmailClients: boolean;
  canSmsClients: boolean;
  canEmailStaff: boolean;
  canSendBulkMessages: boolean;
  requiresApprovalForBulk: boolean;
}

export interface RequiredDocument {
  documentType: string;
  required: boolean;
  uploadedAt?: Timestamp;
  documentUrl?: string;
  status: "missing" | "pending" | "approved" | "rejected";
}

export interface TrainingStatus {
  completedTrainings: string[];
  pendingTrainings: string[];
  certificationIds: string[];
  lastTrainingDate?: Timestamp;
}

export interface AuditLog extends BaseDocument {
  action: string;
  category: AuditCategory;
  userId: string;
  userEmail?: string;
  userRole?: string;
  resourceType: string;
  resourceId: string;
  changes: Record<string, { old: unknown; new: unknown }> | null;
  metadata: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
}

export type AuditCategory =
  | "authentication"
  | "authorization"
  | "contact"
  | "staff"
  | "compensation"
  | "financial"
  | "payment"
  | "communication"
  | "hermes"
  | "telegram"
  | "webhook"
  | "import"
  | "export"
  | "admin"
  | "integration"
  | "scheduled_job"
  | "system_error";

export interface SystemSettings extends BaseDocument {
  key: string;
  value: unknown;
  category: string;
  description?: string;
  editableByRoles: UserRole[];
}

export interface FinancialTransaction extends BaseDocument {
  transactionDate: Timestamp;
  transactionType: string;
  category: string;
  subcategory?: string;
  amount: number;
  debitAccountId?: string;
  creditAccountId?: string;
  paymentStatus: PaymentStatus;
  sourceSystem: string;
  externalTransactionId?: string;
  relatedContactId?: string;
  relatedInvoiceId?: string;
  relatedPaymentId?: string;
  financialPeriodId: string;
  approvalStatus: ApprovalStatus;
  approvedBy?: string;
  approvedAt?: Timestamp;
  notes?: string;
  reversedTransactionId?: string;
  metadata: Record<string, unknown>;
}

export interface FinancialAccount extends BaseDocument {
  name: string;
  type: "asset" | "liability" | "equity" | "revenue" | "expense";
  category: string;
  subcategory?: string;
  programId?: string;
  departmentId?: string;
  balance: number;
  parentAccountId?: string;
  isBankAccount: boolean;
  bankName?: string;
  accountNumberLast4?: string;
  externalAccountId?: string;
}

export interface FinancialPeriod extends BaseDocument {
  name: string;
  startDate: Timestamp;
  endDate: Timestamp;
  status: "open" | "closed" | "locked";
  closedBy?: string;
  closedAt?: Timestamp;
  reopenedBy?: string;
  reopenedAt?: Timestamp;
  reopenReason?: string;
  totalRevenue: number;
  totalExpenses: number;
  netIncome: number;
}

export interface CompensationPlan extends BaseDocument {
  name: string;
  description?: string;
  type: CompensationType;
  programId?: string;
  departmentId?: string;
  components: CompensationComponent[];
  effectiveDate: Timestamp;
  endDate?: Timestamp;
  status: RecordStatus;
}

export type CompensationType =
  | "fixed_per_class"
  | "hourly"
  | "monthly_base"
  | "per_participant"
  | "revenue_percentage"
  | "profit_percentage"
  | "new_client_incentive"
  | "retention_incentive"
  | "attendance_bonus"
  | "collections_incentive"
  | "goal_bonus"
  | "tiered_bonus";

export interface CompensationComponent {
  type: CompensationType;
  amount?: number;
  percentage?: number;
  minimumAmount?: number;
  maximumAmount?: number;
  threshold?: number;
  tierRanges?: TierRange[];
  programIds?: string[];
  effectiveDate: Timestamp;
  endDate?: Timestamp;
}

export interface TierRange {
  min: number;
  max: number;
  amount: number;
}

export interface CompensationCalculation extends BaseDocument {
  staffId: string;
  compensationPlanId: string;
  financialPeriodId: string;
  periodStart: Timestamp;
  periodEnd: Timestamp;
  components: CalculationComponent[];
  totalAmount: number;
  status: "calculated" | "reviewed" | "approved" | "locked" | "paid";
  reviewedBy?: string;
  reviewedAt?: Timestamp;
  approvedBy?: string;
  approvedAt?: Timestamp;
  paidAt?: Timestamp;
  paidBy?: string;
}

export interface CalculationComponent {
  componentType: CompensationType;
  baseAmount: number;
  adjustments: number;
  totalAmount: number;
  calculationDetails: Record<string, unknown>;
}

export interface Payout extends BaseDocument {
  staffId: string;
  calculationId: string;
  amount: number;
  paymentMethod: "direct_deposit" | "check" | "cash" | "other";
  paymentDate?: Timestamp;
  status: ApprovalStatus;
  approvedBy?: string;
  approvedAt?: Timestamp;
  notes?: string;
}

export interface CommunicationTemplate extends BaseDocument {
  name: string;
  subject?: string;
  body: string;
  type: "email" | "sms" | "push" | "telegram";
  category: string;
  variables: string[];
  requiresApproval: boolean;
  previewData?: Record<string, string>;
}

export interface CommunicationJob extends BaseDocument {
  name: string;
  templateId: string;
  audienceFilter: AudienceFilter;
  channel: "email" | "sms" | "telegram" | "slack" | "in_app";
  scheduledAt?: Timestamp;
  sentAt?: Timestamp;
  status: "draft" | "pending_approval" | "scheduled" | "sending" | "sent" | "failed" | "cancelled";
  approvedBy?: string;
  approvedAt?: Timestamp;
  recipientCount: number;
  sentCount: number;
  failedCount: number;
  errorLog?: string[];
  metadata: Record<string, unknown>;
}

export interface AudienceFilter {
  contactTypes?: ContactType[];
  programIds?: string[];
  departmentIds?: string[];
  locationIds?: string[];
  status?: ContactStatus[];
  tags?: string[];
  leadSources?: string[];
  paymentStatus?: PaymentStatus[];
  attendanceStatus?: string[];
  customFilter?: Record<string, unknown>;
}

export interface Integration extends BaseDocument {
  name: string;
  provider: string;
  type: "crm" | "payment" | "communication" | "calendar" | "analytics" | "custom";
  status: "active" | "inactive" | "error" | "pending";
  config: Record<string, string>;
  webhookUrl?: string;
  lastSyncAt?: Timestamp;
  lastSyncStatus?: "success" | "error" | "partial";
  errorCount: number;
  lastErrorAt?: Timestamp;
  lastErrorMessage?: string;
}

export interface WebhookEvent extends BaseDocument {
  integrationId: string;
  provider: string;
  eventType: string;
  payload: Record<string, unknown>;
  processedAt?: Timestamp;
  processingStatus: "pending" | "processing" | "completed" | "failed" | "ignored";
  errorMessage?: string;
  retryCount: number;
  signature?: string;
  idempotencyKey: string;
}

export interface ClassSession extends BaseDocument {
  programId: string;
  locationId: string;
  instructorIds: string[];
  substituteInstructorId?: string;
  startTime: Timestamp;
  endTime: Timestamp;
  capacity: number;
  registeredCount: number;
  waitlistCount: number;
  attendanceCount: number;
  status: "scheduled" | "in_progress" | "completed" | "cancelled";
  cancellationReason?: string;
  notes?: string;
}

export interface Registration extends BaseDocument {
  contactId: string;
  programId: string;
  classSessionId?: string;
  registrationDate: Timestamp;
  status: "active" | "cancelled" | "transferred" | "waitlisted";
  paymentStatus: PaymentStatus;
  amount: number;
  waiverSigned: boolean;
  waiverSignedAt?: Timestamp;
  notes?: string;
}

export interface Attendance extends BaseDocument {
  contactId: string;
  programId: string;
  classSessionId: string;
  checkInAt: Timestamp;
  checkInSource: "staff_dashboard" | "web_form" | "qr_code" | "kiosk" | "sms" | "telegram" | "crm";
  checkInBy?: string;
  checkedOutAt?: Timestamp;
  status: "present" | "late" | "absent" | "excused";
  notes?: string;
}

export interface Lead extends BaseDocument {
  contactId: string;
  source: string;
  campaign?: string;
  pipelineId: string;
  stageId: string;
  assignedTo: string;
  estimatedValue?: number;
  probability?: number;
  expectedCloseDate?: Timestamp;
  actualCloseDate?: Timestamp;
  closeReason?: string;
  status: "open" | "won" | "lost" | "nurturing";
  lastActivityAt: Timestamp;
  nextFollowUpDate?: Timestamp;
  nextFollowUpType?: string;
  tags: string[];
}

export interface Alert extends BaseDocument {
  type: string;
  severity: "low" | "medium" | "high" | "critical";
  title: string;
  message: string;
  relatedResourceType?: string;
  relatedResourceId?: string;
  acknowledgedAt?: Timestamp;
  acknowledgedBy?: string;
  resolvedAt?: Timestamp;
  resolvedBy?: string;
  autoGenerated: boolean;
}

export interface Report extends BaseDocument {
  name: string;
  type: string;
  parameters: Record<string, unknown>;
  status: "pending" | "generating" | "completed" | "failed";
  generatedAt?: Timestamp;
  fileUrl?: string;
  fileFormat: "csv" | "xlsx" | "pdf";
  errorMessage?: string;
}
