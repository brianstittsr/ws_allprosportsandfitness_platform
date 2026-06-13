/**
 * Firebase Firestore collection names.
 * Use these constants to avoid typos and centralize schema references.
 */

export const COLLECTIONS = {
  /** Users (Firebase Auth user profiles) */
  users: "users",
  /** User access control and permissions */
  userAccess: "userAccess",
  /** Organizations / tenants */
  organizations: "organizations",
  /** Fitness programs */
  programs: "programs",
  /** Departments within organization */
  departments: "departments",
  /** Physical locations / facilities */
  locations: "locations",
  /** Contact records (clients, leads, partners) */
  contacts: "contacts",
  /** Staff profiles */
  staff: "staff",
  /** External service integrations */
  integrations: "integrations",
  /** Audit log entries */
  auditLogs: "auditLogs",
  /** System configuration settings */
  systemSettings: "systemSettings",
  /** Communication records */
  communications: "communications",
  /** Message templates */
  communicationTemplates: "communicationTemplates",
  /** Bulk communication jobs */
  communicationJobs: "communicationJobs",
  /** Class sessions */
  classSessions: "classSessions",
  /** Program registrations */
  registrations: "registrations",
  /** Attendance records */
  attendance: "attendance",
  /** Sales leads */
  leads: "leads",
  /** Financial accounts */
  financialAccounts: "financialAccounts",
  /** Financial transactions */
  financialTransactions: "financialTransactions",
  /** Financial periods */
  financialPeriods: "financialPeriods",
  /** Compensation plans */
  compensationPlans: "compensationPlans",
  /** Compensation calculations */
  compensationCalculations: "compensationCalculations",
  /** Staff payouts */
  payouts: "payouts",
  /** Reports generated in-app */
  reports: "reports",
  /** System alerts and notifications */
  alerts: "alerts",
  /** Webhook event log */
  webhookEvents: "webhookEvents",
  /** Background tasks queue */
  tasks: "tasks",
} as const;

export type CollectionName = (typeof COLLECTIONS)[keyof typeof COLLECTIONS];
