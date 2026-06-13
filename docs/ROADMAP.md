# Implementation Roadmap

## Phase 1: Platform Foundation (Current)

### Delivered
- [x] Next.js + TypeScript project scaffold
- [x] Tailwind CSS + shadcn/ui component setup
- [x] Firebase client and admin configuration
- [x] Core TypeScript types and Zod schemas
- [x] Authentication store and hook
- [x] Login page with Firebase Auth
- [x] Staff dashboard shell
- [x] Admin panel with sidebar navigation
- [x] Firestore security rules
- [x] Firestore composite indexes
- [x] Firebase Storage rules
- [x] Audit logging infrastructure
- [x] API route foundation (auth, programs)
- [x] Environment variable documentation
- [x] Technical architecture documentation
- [x] Data model documentation

### Pending in Phase 1
- [ ] User invitation and role assignment workflow
- [ ] Firebase custom claims management
- [ ] Organization setup wizard
- [ ] Seed scripts for initial data
- [ ] Firestore security rule tests (Firebase Emulator Suite)
- [ ] Authentication authorization tests
- [ ] Admin panel access tests

## Phase 2: Operations

### Classes and Events
- [ ] Class session creation and scheduling
- [ ] Recurring class patterns
- [ ] Event management
- [ ] Registration and waitlist
- [ ] Capacity management

### Check-Ins
- [ ] Staff dashboard check-in
- [ ] QR code generation and scanning
- [ ] Kiosk mode
- [ ] Mobile-friendly web check-in
- [ ] SMS check-in links
- [ ] Attendance tracking and reporting

### Communications
- [ ] Email template system
- [ ] SMS integration (HighLevel or provider)
- [ ] Audience filtering and segmentation
- [ ] Bulk send with approval workflow
- [ ] Delivery tracking and failure reporting
- [ ] Communication history per contact

### Staff Dashboard
- [ ] Today&apos;s schedule view
- [ ] Check-in interface
- [ ] Contact quick search
- [ ] Task list and follow-ups
- [ ] Program dashboards

## Phase 3: Financial Management

### Stripe Integration
- [ ] Checkout Sessions for payments
- [ ] Subscription management
- [ ] Invoice generation
- [ ] Payment status tracking
- [ ] Webhook handling with signature verification
- [ ] Idempotency and duplicate prevention
- [ ] Program and contact attribution

### Revenue Tracking
- [ ] Revenue categories
- [ ] Registration revenue
- [ ] Membership revenue
- [ ] Personal training revenue
- [ ] Event and ticket revenue

### Collections
- [ ] Past-due tracking
- [ ] Collection workflow
- [ ] Payment plan setup
- [ ] Automated follow-up sequences

### Financial Reporting
- [ ] Revenue vs. collected dashboard
- [ ] Recurring monthly revenue tracking
- [ ] Financial period management
- [ ] Period locking and reopening

### Compensation
- [ ] Compensation plan builder
- [ ] Calculation engine
- [ ] Review and approval workflow
- [ ] Payout generation
- [ ] Instructor performance reports

### Investor and Rent Obligations
- [ ] Investor repayment tracking
- [ ] Rent allocation rules
- [ ] Obligation scheduling
- [ ] Reserve calculations

## Phase 4: CRM and Marketing

### HighLevel Integration
- [ ] Contact synchronization adapter
- [ ] Lead pipeline sync
- [ ] Appointment sync
- [ ] Campaign attribution
- [ ] Opt-out synchronization

### Sweatsetter Integration
- [ ] Adapter interface implementation
- [ ] Contact and lead sync
- [ ] Form submission handling

### Lead Management
- [ ] Lead pipeline stages
- [ ] Lead assignment and rotation
- [ ] Lead scoring
- [ ] Follow-up task automation
- [ ] Lead source attribution

### Marketing Automation
- [ ] Welcome sequences
- [ ] No-show recovery
- [ ] Inactivity detection and reactivation
- [ ] Membership renewal reminders
- [ ] Failed payment recovery

## Phase 5: Hermes and Telegram

### Hermes Integration
- [ ] JavaScript/TypeScript MCP server or API endpoints
- [ ] Tool definitions for Hermes
- [ ] Secure tool invocation

### Telegram Bot
- [ ] Bot setup and webhook configuration
- [ ] Firebase-to-Telegram identity linking workflow
- [ ] Admin-approved linking process

### Telegram Commands
- [ ] Today&apos;s classes and events
- [ ] Attendance by program
- [ ] Uncontacted leads
- [ ] Lead follow-up alerts
- [ ] Revenue collected today
- [ ] Outstanding balances
- [ ] Failed payments
- [ ] Program profitability
- [ ] Weekly and monthly reports
- [ ] Draft and preview communications
- [ ] Send approved communications
- [ ] Check-in recording and correction
- [ ] Task creation and escalation

### Approval Workflows
- [ ] Bulk communication approval
- [ ] Refund and credit approval
- [ ] Compensation change approval
- [ ] Payout approval
- [ ] Hermes audit logging

## Phase 6: Forecasting and Advanced Automation

### Analytics
- [ ] Revenue forecasting
- [ ] Cash-flow forecasting
- [ ] Program profitability analysis
- [ ] Retention analysis
- [ ] Attendance trend detection

### Advanced Automations
- [ ] Morning operations briefing
- [ ] End-of-day summaries
- [ ] Lead aging alerts
- [ ] Class capacity alerts
- [ ] Instructor absence workflow
- [ ] Weather-related cancellation workflow
- [ ] Equipment issue tracking
- [ ] Month-ahead cash-flow warnings
- [ ] Daily Stripe reconciliation
- [ ] Unapproved payout reminders

### Reporting
- [ ] Daily operations summary
- [ ] Weekly lead and conversion report
- [ ] Weekly attendance report
- [ ] Weekly collections report
- [ ] Monthly revenue report
- [ ] Monthly retention report
- [ ] Monthly compensation report
- [ ] Monthly profitability report
- [ ] Investor repayment statement
- [ ] Program scorecard
- [ ] Executive dashboard
- [ ] Instructor performance report
- [ ] Marketing campaign ROI report
- [ ] CSV, Excel, and PDF export
- [ ] Async report generation with Firebase Storage

## Phase 7: Production Readiness

### Testing
- [ ] Unit test coverage for utilities and schemas
- [ ] Integration tests for API routes
- [ ] Firestore security rule tests
- [ ] Firebase Authentication tests
- [ ] End-to-end browser tests (Playwright)
- [ ] Stripe webhook tests
- [ ] CRM adapter tests
- [ ] Communication consent tests
- [ ] Hermes authorization tests

### Security
- [ ] Multi-factor authentication for admins
- [ ] Firebase App Check
- [ ] Content Security Policy
- [ ] Rate limiting
- [ ] Input sanitization review
- [ ] Secret rotation procedures
- [ ] Penetration testing checklist

### Operations
- [ ] Backup and recovery procedures
- [ ] Data retention policy implementation
- [ ] Incident response procedures
- [ ] Monitoring and alerting
- [ ] Health check endpoints
- [ ] System status screen
- [ ] Vercel function usage monitoring
- [ ] Firebase read/write usage monitoring

### Documentation
- [ ] Administrator guide
- [ ] Staff guide
- [ ] API specification
- [ ] Integration specification
- [ ] Financial calculation specification
- [ ] Compensation plan specification
- [ ] Hermes tool definitions
- [ ] Telegram command catalog
- [ ] Production-readiness checklist
