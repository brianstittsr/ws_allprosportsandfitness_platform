# Environment Variables

Create a `.env.local` file with the following variables.

## Firebase Client Configuration (Public)

These values are safe to expose in client-side code. They are from your Firebase project settings.

- `NEXT_PUBLIC_FIREBASE_API_KEY` - Firebase API key
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` - Firebase Auth domain
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID` - Firebase project ID
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` - Firebase Storage bucket
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` - Firebase messaging sender ID
- `NEXT_PUBLIC_FIREBASE_APP_ID` - Firebase app ID

## Firebase Admin SDK (Server-Only)

These values must never be exposed to the client. They are used by the Firebase Admin SDK in server-side code.

- `FIREBASE_ADMIN_PROJECT_ID` - Same as project ID above
- `FIREBASE_ADMIN_CLIENT_EMAIL` - Service account client email from Firebase console
- `FIREBASE_ADMIN_PRIVATE_KEY` - Service account private key (replace newlines with `\n`)

## Stripe (Server-Only)

- `STRIPE_SECRET_KEY` - Stripe secret key (test or live)
- `STRIPE_WEBHOOK_SECRET` - Stripe webhook endpoint secret
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Stripe publishable key (safe for client)

## Application Configuration

- `NEXT_PUBLIC_APP_URL` - Public URL of the application (e.g., https://nc-fitness.vercel.app)
- `APP_ENV` - Current environment: development, staging, or production

## Optional Integrations

- `HIGHLEVEL_API_KEY` - GoHighLevel API key (server-only)
- `HIGHLEVEL_LOCATION_ID` - GoHighLevel location ID
- `TELEGRAM_BOT_TOKEN` - Telegram bot token (server-only)
- `SLACK_WEBHOOK_URL` - Slack webhook URL (server-only)
- `SENDGRID_API_KEY` - SendGrid API key (server-only)

## Security Notes

- Never commit `.env.local` to version control.
- Never expose `FIREBASE_ADMIN_PRIVATE_KEY`, `STRIPE_SECRET_KEY`, or `TELEGRAM_BOT_TOKEN` in client code.
- Rotate secrets immediately if they are accidentally exposed.
- Use separate Firebase projects for development, staging, and production.
- Use separate Stripe keys for test and live environments.
