# Telegram Integration Guide

## Overview

The platform supports two Telegram bot integrations:

1. **Code Updates via GitHub** - Admin-only commands to update code, create branches, and manage deployments
2. **GoHighLevel Workflow Commands** - Staff commands to sync contacts, send emails/SMS, and trigger CRM workflows

## Setup

### 1. Create a Telegram Bot

1. Open Telegram and message [@BotFather](https://t.me/BotFather)
2. Send `/newbot` and follow prompts to create your bot
3. Save the **bot token** provided

### 2. Configure Environment Variables

Add to `.env.local`:

```env
TELEGRAM_BOT_TOKEN=123456789:ABCdefGHIjklMNOpqrSTUvwxyz
TELEGRAM_WEBHOOK_SECRET=your_random_secret_here
TELEGRAM_ADMIN_CHAT_ID=123456789
```

### 3. Set Webhook URL

Use the admin API or curl:

```bash
curl -X POST https://your-app.vercel.app/api/telegram/setup \
  -H "Authorization: Bearer <firebase_id_token>" \
  -H "Content-Type: application/json" \
  -d '{"webhookUrl": "https://your-app.vercel.app/api/telegram/webhook"}'
```

Or use the GoHighLevel-specific webhook:

```bash
curl -X POST https://your-app.vercel.app/api/telegram/setup \
  -H "Authorization: Bearer <firebase_id_token>" \
  -H "Content-Type: application/json" \
  -d '{"webhookUrl": "https://your-app.vercel.app/api/telegram/highlevel", "secretToken": "your_secret"}'
```

### 4. Link Telegram Account

Staff must link their Telegram account through the admin panel before they can use bot commands. The system matches `telegramUserId` to the `userAccess` document.

## Code Update Commands (`/api/telegram/webhook`)

**Requires:** `accessAdminPanel` permission

| Command | Description |
|---------|-------------|
| `/help` | Show available commands |
| `/ping` | Check bot status |
| `/branch <name>` | Create a new branch from main |
| `/update <path> <content>` | Update a file and commit to a new branch |
| `/pr <branch>` | Create a pull request for a branch |
| `/status` | Show latest commit and workflow status |

### Example Usage

```
/branch feature-new-dashboard

/update src/app/dashboard/page.tsx <new component code here>

/pr feature-new-dashboard
```

This creates a branch, commits your change, and opens a PR for review before merging to main.

## GoHighLevel Commands (`/api/telegram/highlevel`)

**Requires:** `useHermes` permission

| Command | Description |
|---------|-------------|
| `/hl_help` | Show HighLevel commands |
| `/sync_contact <contactId>` | Sync a platform contact to HighLevel |
| `/send_email <email> <subject> <message>` | Send email via HighLevel |
| `/send_sms <phone> <message>` | Send SMS via HighLevel |
| `/workflow <workflowId> <contactId>` | Add contact to a workflow |
| `/workflows` | List available workflows |
| `/contacts <search>` | Search HighLevel contacts |

### Example Usage

```
/sync_contact abc123def456

/send_email john@example.com "Class Reminder" "Hi John, your yoga class is tomorrow at 6pm!"

/send_sms +15551234567 "Your payment is past due. Please contact us."

/workflow workflow_123 contact_456
```

## Security

- **Webhook Secret**: The `x-telegram-webhook-secret` header is verified on every request
- **User Verification**: Every command checks that the Telegram user ID is linked to a valid platform user
- **Permission Checks**: Code commands require `accessAdminPanel`; HighLevel commands require `useHermes`
- **Audit Logging**: All Telegram actions are logged in the `auditLogs` collection
- **No Secrets in Messages**: Bot tokens, API keys, and webhook secrets are never sent in Telegram messages

## Architecture

```
Telegram Bot
     |
     | webhook POST
     v
Vercel API Route (/api/telegram/webhook or /api/telegram/highlevel)
     |
     | verify secret + user
     v
Firebase Admin SDK
     |
     | read userAccess + check permissions
     v
GitHub API or HighLevel API
     |
     v
Response to Telegram
```

## Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `TELEGRAM_BOT_TOKEN` | Yes | From @BotFather |
| `TELEGRAM_WEBHOOK_SECRET` | Recommended | Random string for webhook verification |
| `TELEGRAM_ADMIN_CHAT_ID` | Optional | For admin notifications |
| `GITHUB_TOKEN` | For code updates | Personal access token with `repo` scope |
| `GITHUB_REPO_OWNER` | For code updates | GitHub username or org |
| `GITHUB_REPO_NAME` | For code updates | Repository name |
| `HIGHLEVEL_API_KEY` | For CRM | GoHighLevel API key |
| `HIGHLEVEL_LOCATION_ID` | For CRM | GoHighLevel location ID |

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "You are not authorized" | Link Telegram account in admin panel |
| "GitHub token not configured" | Add `GITHUB_TOKEN`, `GITHUB_REPO_OWNER`, `GITHUB_REPO_NAME` to env |
| "HighLevel API key not configured" | Add `HIGHLEVEL_API_KEY` and `HIGHLEVEL_LOCATION_ID` to env |
| Webhook not receiving messages | Check webhook URL with `/api/telegram/setup` GET endpoint |
| Bot not responding | Verify `TELEGRAM_BOT_TOKEN` is correct and bot is not blocked |
