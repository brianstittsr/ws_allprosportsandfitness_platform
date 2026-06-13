# Firestore Data Model

## Document Conventions

Every operational and financial document includes:
- `organizationId` - Organization reference
- `createdAt` / `updatedAt` - Firestore Timestamps
- `createdBy` / `updatedBy` - Firebase Auth UID
- `status` - Document-specific status
- `schemaVersion` - Schema version for migrations

## Top-Level Collections

### organizations
Organization configuration and settings.

```typescript
interface Organization {
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
```

### users
Firebase Authentication user references (minimal - sensitive data in userAccess).

### userAccess
Role and permission documents. The primary authorization record.

```typescript
interface UserAccess {
  userId: string;
  email: string;
  displayName: string;
  roles: UserRole[];
  programIds: string[];
  departmentIds: string[];
  permissions: UserPermissions;
  accountStatus: "active" | "disabled" | "invited";
  telegramUserId?: string;
}
```

### contacts
Unified contact model for all person types.

```typescript
interface Contact {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  contactTypes: ContactType[];
  programIds: string[];
  currentStatus: ContactStatus;
  assignedStaffId?: string;
  emailConsent: boolean;
  smsConsent: boolean;
  optOutStatus: boolean;
  tags: string[];
  customFields: Record<string, string | number | boolean>;
  externalIds: Record<string, string>;
}
```

### staff
Staff records linked to contacts.

```typescript
interface Staff {
  contactId: string;
  userId?: string;
  departmentIds: string[];
  programIds: string[];
  jobTitle: string;
  employmentType: "full_time" | "part_time" | "contractor" | "volunteer";
  supervisorId?: string;
  compensationPlanId?: string;
  permissions: StaffPermissions;
  isActive: boolean;
}
```

### programs
Programs, classes, leagues, and events.

```typescript
interface Program {
  name: string;
  type: ProgramType;
  departmentId: string;
  locationIds: string[];
  managerIds: string[];
  instructorIds: string[];
  capacity?: number;
  pricing?: PricingConfig;
  waiverRequired: boolean;
}
```

### departments
Business units and departments.

```typescript
interface Department {
  name: string;
  type: DepartmentType;
  managerIds: string[];
  locationIds: string[];
}
```

### locations
Training facilities and venues.

```typescript
interface Location {
  name: string;
  address: Address;
  phone?: string;
  email?: string;
  capacity?: number;
  operatingHours: OperatingHours;
}
```

### classSessions
Individual class or training session instances.

```typescript
interface ClassSession {
  programId: string;
  locationId: string;
  instructorIds: string[];
  startTime: Timestamp;
  endTime: Timestamp;
  capacity: number;
  registeredCount: number;
  attendanceCount: number;
  status: "scheduled" | "in_progress" | "completed" | "cancelled";
}
```

### registrations
Program and class registrations.

```typescript
interface Registration {
  contactId: string;
  programId: string;
  classSessionId?: string;
  registrationDate: Timestamp;
  status: "active" | "cancelled" | "transferred" | "waitlisted";
  paymentStatus: PaymentStatus;
  amount: number;
  waiverSigned: boolean;
}
```

### attendance
Check-in and attendance records.

```typescript
interface Attendance {
  contactId: string;
  programId: string;
  classSessionId: string;
  checkInAt: Timestamp;
  checkInSource: string;
  status: "present" | "late" | "absent" | "excused";
}
```

### financialTransactions
Double-entry-aware financial records.

```typescript
interface FinancialTransaction {
  transactionDate: Timestamp;
  transactionType: string;
  category: string;
  amount: number; // integer cents
  debitAccountId?: string;
  creditAccountId?: string;
  paymentStatus: PaymentStatus;
  sourceSystem: string;
  financialPeriodId: string;
  approvalStatus: ApprovalStatus;
  reversedTransactionId?: string;
}
```

### financialAccounts
Chart of accounts.

```typescript
interface FinancialAccount {
  name: string;
  type: "asset" | "liability" | "equity" | "revenue" | "expense";
  category: string;
  programId?: string;
  departmentId?: string;
  balance: number;
}
```

### financialPeriods
Accounting periods.

```typescript
interface FinancialPeriod {
  name: string;
  startDate: Timestamp;
  endDate: Timestamp;
  status: "open" | "closed" | "locked";
  totalRevenue: number;
  totalExpenses: number;
  netIncome: number;
}
```

### compensationPlans
Compensation plan definitions.

```typescript
interface CompensationPlan {
  name: string;
  type: CompensationType;
  programId?: string;
  departmentId?: string;
  components: CompensationComponent[];
  effectiveDate: Timestamp;
  endDate?: Timestamp;
}
```

### compensationCalculations
Calculated compensation (before approval).

```typescript
interface CompensationCalculation {
  staffId: string;
  compensationPlanId: string;
  financialPeriodId: string;
  totalAmount: number;
  status: "calculated" | "reviewed" | "approved" | "locked" | "paid";
}
```

### payouts
Approved and submitted payouts.

```typescript
interface Payout {
  staffId: string;
  calculationId: string;
  amount: number;
  paymentMethod: string;
  status: ApprovalStatus;
}
```

### communications
Individual communications sent.

### communicationTemplates
Reusable message templates.

### communicationJobs
Bulk communication campaigns.

### leads
Sales pipeline leads.

```typescript
interface Lead {
  contactId: string;
  source: string;
  pipelineId: string;
  stageId: string;
  assignedTo: string;
  estimatedValue?: number;
  probability?: number;
  status: "open" | "won" | "lost" | "nurturing";
}
```

### integrations
External system integrations.

### webhookEvents
Received webhook events with idempotency tracking.

### auditLogs
Immutable audit trail.

```typescript
interface AuditLog {
  action: string;
  category: AuditCategory;
  userId: string;
  resourceType: string;
  resourceId: string;
  changes: Record<string, { old: unknown; new: unknown }> | null;
  metadata: Record<string, unknown>;
}
```

### reports
Generated report metadata.

### alerts
System and business alerts.

### systemSettings
Configuration key-value pairs.

## Subcollections

Subcollections are used when they improve access control or query performance:

- `organizations/{id}/settings` - Organization-specific settings
- `contacts/{id}/communications` - Communication history for a contact
- `programs/{id}/classSessions` - Sessions for a program (when querying by program)
- `staff/{id}/compensationHistory` - Historical compensation records

## Data Access Patterns

### Primary Queries
1. List by organization + status (most common)
2. List by organization + program
3. List by organization + department
4. List by assigned staff member
5. Time-range queries for financial and attendance data

### Pagination
All list endpoints use cursor-based pagination via Firestore `startAfter` with `limit`.

## Indexes

See `firestore.indexes.json` for all composite indexes required for production queries.

Key indexes include:
- `contacts`: organizationId + status + createdAt
- `contacts`: organizationId + contactTypes (array contains) + createdAt
- `staff`: organizationId + departmentIds (array contains) + createdAt
- `classSessions`: organizationId + programId + startTime
- `attendance`: organizationId + classSessionId + checkInAt
- `financialTransactions`: organizationId + financialPeriodId + transactionDate
- `auditLogs`: organizationId + category + createdAt
