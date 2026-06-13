# NC Fitness Club - Technical Architecture

## Overview

The NC Fitness Club Unified Operations Platform is a Next.js + TypeScript application deployed to Vercel, using Firebase as the primary data and identity platform.

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Vercel Edge                           │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────────┐  │
│  │  Next.js    │  │  API Routes  │  │  Server Actions │  │
│  │  App Router │  │  (Route      │  │  (Secure        │  │
│  │  (React      │  │   Handlers)  │  │   Operations)   │  │
│  │   Server/    │  │              │  │                 │  │
│  │   Client     │  │              │  │                 │  │
│  │   Components)│  │              │  │                 │  │
│  └─────────────┘  └──────────────┘  └─────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
              ┌───────────────┼───────────────┐
              ▼               ▼               ▼
        ┌──────────┐   ┌──────────┐   ┌──────────────┐
        │ Firebase │   │ Firebase │   │  Firebase    │
        │ Auth     │   │ Firestore│   │  Storage     │
        │ (Identity│   │ (Database│   │  (Files)     │
        │  & Roles)│   │  of Record│  │              │
        └──────────┘   └──────────┘   └──────────────┘
                              │
              ┌───────────────┼───────────────┐
              ▼               ▼               ▼
        ┌──────────┐   ┌──────────┐   ┌──────────────┐
        │  Stripe  │   │HighLevel │   │   Telegram   │
        │ (Payments│   │  (CRM)   │   │   (Hermes)   │
        │  & Billing│  │          │   │              │
        └──────────┘   └──────────┘   └──────────────┘
```

## Technology Stack

### Frontend
- **Next.js 16** with App Router
- **React 19** with Server Components and Client Components
- **TypeScript** with strict mode
- **Tailwind CSS 4** for styling
- **shadcn/ui** component primitives (Radix UI + Tailwind)
- **Zustand** for client state
- **React Query** for server state

### Backend
- **Next.js Route Handlers** for REST API
- **Next.js Server Actions** for secure mutations
- **Firebase Admin SDK** for trusted server operations
- **Zod** for request validation

### Data & Identity
- **Firebase Authentication** for identity
- **Firebase Custom Claims** for platform roles
- **Cloud Firestore** for primary database
- **Firebase Storage** for documents and files

### Integrations
- **Stripe** for payments and billing
- **GoHighLevel** for CRM and communications
- **Telegram** for Hermes Agent staff commands

## Deployment Architecture

### Environments
- **Development**: Local Firebase Emulator Suite + `next dev`
- **Staging**: Separate Firebase project + Vercel preview deployments
- **Production**: Production Firebase project + Vercel production domain

### Vercel Configuration
- Serverless functions for API routes
- Edge runtime where appropriate
- Cron jobs for scheduled operations
- Environment variables for secrets

## Security Architecture

### Two-Layer Authorization
1. **Firebase Custom Claims**: Broad platform roles (owner, admin, staff, etc.)
2. **Firestore Permission Documents**: Program-level, department-level, and feature-level access

### Defense in Depth
- Firebase Authentication + custom claims
- Firestore security rules (document-level)
- Firebase Storage rules (path-level)
- Server-side authorization in API routes and Server Actions
- Client-side route guards (defense in depth, not primary security)

### Secret Management
- Firebase Admin credentials: server-only environment variables
- Stripe secret keys: server-only environment variables
- Telegram bot tokens: server-only environment variables
- CRM API keys: server-only environment variables
- Firebase client config: public (safe for browser)

## Data Flow

### Authentication Flow
1. User signs in via Firebase Authentication (email/password, Google, etc.)
2. Firebase returns ID token
3. Client sends ID token to server
4. Server verifies token with Firebase Admin SDK
5. Server reads custom claims and Firestore permission document
6. Server enforces authorization for requested operation

### Write Operation Flow
1. Client initiates action (form submit, API call, Server Action)
2. Server verifies Firebase ID token
3. Server checks custom claims for role
4. Server checks Firestore permission document for feature access
5. Server validates input with Zod schema
6. Server writes to Firestore
7. Server writes audit log
8. Server returns result to client

## Background Processing

Because Vercel functions are serverless (not always-running), background operations use:

- **Vercel Cron Jobs** for scheduled tasks (daily reports, reminders)
- **Firestore task documents** processed through scheduled jobs
- **Idempotent function execution** with deduplication via processed event IDs
- **Webhook endpoints** for external system events (Stripe, CRM)

## Scalability Considerations

- Firestore queries use composite indexes for performance
- Large exports use async job pattern with file storage
- Pagination for all list endpoints
- Client-side caching with React Query
- Image optimization disabled for static export compatibility

## Monitoring and Observability

- Firebase Console for database and auth metrics
- Vercel Analytics for web performance
- Vercel Logs for function execution
- Custom audit logs in Firestore for business events
- Alert documents for operational exceptions
