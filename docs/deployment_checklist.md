# Prayog India Production Deployment Checklist (Phase B12)

Follow this step-by-step checklist to deploy Prayog India to production safely.

---

## 1. Environment Configuration Setup

Verify that all required environment variables are set in production:

```env
DATABASE_URL="postgresql://username:password@prod-db-host:5432/prayog_production?schema=public&sslmode=require"
NODE_ENV="production"
NEXT_PUBLIC_USE_MOCK_DATA="false"

# Production Storage (B8)
STORAGE_PROVIDER="s3"
STORAGE_BUCKET="prayog-prod-media"
STORAGE_REGION="ap-south-1"
STORAGE_ENDPOINT="https://s3.ap-south-1.amazonaws.com"
STORAGE_ACCESS_KEY="PROD_ACCESS_KEY"
STORAGE_SECRET_KEY="PROD_SECRET_KEY"
STORAGE_PUBLIC_URL_PREFIX="https://media.prayogindia.com"

# Production Email (B9)
EMAIL_PROVIDER="smtp"
EMAIL_FROM="support@prayogindia.com"
SMTP_HOST="smtp.sendgrid.net"
SMTP_PORT="587"
SMTP_USER="apikey"
SMTP_PASS="PROD_SMTP_PASSWORD"
```

---

## 2. PostgreSQL Database Migration

Run Prisma production database migrations:

```bash
npx prisma migrate deploy
npx prisma generate
```

> [!IMPORTANT]
> Verify that PostgreSQL automated backups and point-in-time recovery (PITR) are enabled on your database provider (e.g. AWS RDS or Supabase).

---

## 3. Production Build & Health Verification

Build the application bundle:

```bash
npm run build
```

Start the production server:

```bash
npm run start
```

Verify health check:

```bash
curl http://localhost:3000/api/health
```

Expected output:
```json
{
  "status": "ok",
  "timestamp": "2026-08-27T11:47:50.000Z",
  "service": "prayog-india-backend",
  "version": "1.0.0",
  "database": "ok"
}
```

---

## 4. Final Security Checklist

- [x] HttpOnly, Secure, SameSite=lax session cookies enabled.
- [x] Account enumeration protection verified on login/register endpoints.
- [x] Rate limiting active on login, service enquiry, and file upload endpoints.
- [x] Server-authoritative trusted price recalculation on Cart & Order creation.
- [x] Pre-signed S3 storage upload authorization with MIME whitelisting and 10MB size cap.
- [x] Strict customer isolation across Cart, Wishlist, Orders, Tracking, Support Tickets, Attachments, and Notifications.
- [x] XSS escaping and structured log redaction active.
- [x] Approved Home Hero Video, Hero Banner, and Hero Section remain completely untouched.
