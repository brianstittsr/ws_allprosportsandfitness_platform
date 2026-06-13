# NC Fitness Club - Unified Operations Platform

A secure, modular, production-ready platform for NC Fitness Club and its related sports, fitness, events, marketing, and community programs.

## Technology Stack

- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Next.js Route Handlers, Server Actions, Firebase Admin SDK
- **Database**: Cloud Firestore
- **Authentication**: Firebase Authentication with custom claims
- **Storage**: Firebase Storage
- **Hosting**: Vercel
- **Integrations**: Stripe, GoHighLevel, Telegram

## Project Structure

```
nc-fitness-platform/
├── src/
│   ├── app/              # Next.js App Router
│   │   ├── admin/        # Admin panel routes
│   │   ├── api/          # API route handlers
│   │   ├── dashboard/    # Staff dashboard
│   │   ├── login/        # Authentication
│   │   ├── contacts/     # Contact management
│   │   └── staff/        # Staff directory
│   ├── components/
│   │   └── ui/           # shadcn/ui components
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # Utilities and Firebase config
│   ├── schemas/          # Zod validation schemas
│   ├── server/           # Server-side utilities
│   ├── stores/           # Zustand state stores
│   └── types/            # TypeScript types
├── docs/                 # Documentation
├── tests/                # Test files
├── firestore.rules       # Firestore security rules
├── firestore.indexes.json # Firestore composite indexes
├── storage.rules         # Firebase Storage rules
└── firebase.json         # Firebase configuration
```

## Getting Started

### Prerequisites

- Node.js 20+
- npm or yarn
- Firebase CLI (`npm install -g firebase-tools`)

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy environment variables:
   ```bash
   cp .env.local.example .env.local
   ```
4. Fill in your Firebase and integration credentials in `.env.local`
5. Start the development server:
   ```bash
   npm run dev
   ```

### Firebase Emulator Suite (Local Development)

```bash
firebase emulators:start
```

This starts local emulators for Auth, Firestore, and Storage.

### Environment Variables

See `ENVIRONMENT.md` for the complete list of required environment variables.

## Deployment

### Vercel

1. Connect your GitHub repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Deploy

### Firebase Rules

Deploy Firestore and Storage rules:
```bash
firebase deploy --only firestore:rules,firestore:indexes,storage
```

## Security

- Never commit `.env.local` or service account keys
- All financial data uses integer cents (not floating-point)
- Firebase custom claims for roles + Firestore documents for permissions
- Audit logging for all sensitive operations
- Server-side authorization on every write

## Documentation

- `docs/ARCHITECTURE.md` - System architecture and design decisions
- `docs/DATA-MODEL.md` - Firestore data model and access patterns
- `docs/ROADMAP.md` - Implementation phases and milestones

## License

Private - NC Fitness Club
