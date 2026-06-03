# SafeVoice Case Management System - Setup Guide

## Overview

SafeVoice is a trauma-informed case management system for documenting and managing abuse cases with end-to-end encryption, secure messaging, and comprehensive analytics.

## Technology Stack

- **Frontend**: Next.js 16 with React 19
- **Backend**: Supabase PostgreSQL with Row-Level Security (RLS)
- **Authentication**: Supabase Auth
- **Encryption**: AES-256 via crypto-js
- **Analytics**: Recharts
- **UI Framework**: shadcn/ui with Tailwind CSS 4
- **Styling**: Tailwind CSS 4.2

## Prerequisites

- Node.js 18+ and pnpm
- Supabase account (free tier available at supabase.com)
- Mapbox account (optional, for geographic heatmaps)

## Setup Instructions

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Note your `Project URL` and `Anon Key` from the API Settings
3. Copy the database connection string

### 2. Create Database Schema

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Create a new query and paste the contents of `/db/schema.sql`
4. Execute the query to create all tables with RLS policies

### 3. Environment Configuration

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Update `.env.local` with your values:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   NEXT_PUBLIC_ENCRYPTION_KEY=$(openssl rand -base64 32)
   ```

3. Generate a secure encryption key:
   ```bash
   openssl rand -base64 32
   ```

### 4. Install Dependencies

```bash
pnpm install
```

### 5. Run Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Architecture Overview

### Portals

#### 1. **Victim Portal** (`/report`)
- Anonymous, trauma-informed case reporting
- Quick escape button (redirects to Google)
- 4-step form: Welcome → Incident Details → Narrative → Evidence → Consent
- Voice recording support for narrative
- File upload for evidence
- Client-side AES-256 encryption before upload

#### 2. **Caseworker Dashboard** (`/dashboard`)
- Triage queue for new cases
- Case assignment and status management
- Secure messaging with victims
- Case notes (internal, private)
- Evidence management
- Audit logging for compliance

#### 3. **Analytics Hub** (`/analytics`)
- 30-day case trends
- Case type breakdown
- Priority distribution
- Key performance indicators
- Geographic heatmap support (requires Mapbox)

### Data Model

**Cases Table**
- Case number, status, priority
- Incident date and location
- Encrypted narrative
- Assignment tracking
- Consent management

**Case Messages**
- Encrypted secure messaging
- Sender role tracking (victim/caseworker)
- Read status

**Case Notes**
- Internal caseworker notes
- Privacy flags
- Audit trail

**Evidence**
- File storage with encryption metadata
- Expiration tracking (90 days after case closure)
- Locking mechanism

**Audit Log**
- All case access tracking
- Action history
- Compliance reporting

### Security Features

1. **End-to-End Encryption**
   - Client-side AES-256 encryption for narratives, messages, notes
   - Encryption key in environment variables
   - Never store plaintext sensitive data

2. **Row-Level Security (RLS)**
   - Database-level access control
   - Victims see own cases
   - Caseworkers see assigned cases
   - Admins see all cases

3. **Audit Trail**
   - All case access logged
   - IP address and user agent tracking
   - Compliance reporting

4. **Evidence Expiration**
   - Evidence expires 90 days after case closure
   - Locking mechanism prevents deletion of critical evidence
   - Automated cleanup for archived cases

### Key Components

**Quick Escape Button**
- Fixed position in top-right corner
- Uses `window.location.replace()` to avoid browser history
- Redirects to safe website

**Voice Recorder**
- Real-time audio recording
- WebM format support
- File upload integration

**Dashboard Sidebar**
- Navigation between portals
- User menu with logout
- Active route highlighting

## Deployment

### Deploy to Vercel

```bash
git push origin main
```

Vercel will automatically deploy on push.

### Environment Variables in Vercel

Set these in your Vercel project settings:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_ENCRYPTION_KEY`

## Development Workflow

### Adding a New Case Status

1. Update the database schema: `ALTER TYPE case_status ADD VALUE 'new_status'`
2. Update TypeScript types in `/lib/supabase.ts`
3. Add status option in UI components

### Adding Encryption to New Fields

```typescript
import { encryptData, decryptData } from '@/lib/encryption'

// Encrypt before storing
const encrypted = encryptData(sensitiveData)

// Decrypt when retrieving
const decrypted = decryptData(encryptedData)
```

### Running Tests

```bash
pnpm test
```

### Linting

```bash
pnpm lint
```

## Troubleshooting

### Supabase Connection Issues

1. Verify credentials in `.env.local`
2. Check Supabase project is active
3. Ensure RLS policies are enabled

### Encryption Key Not Found

```bash
# Regenerate encryption key
openssl rand -base64 32
```

### Database Migration Failed

1. Review SQL syntax
2. Check user permissions in Supabase
3. Verify PostgreSQL version compatibility

## Compliance & Legal

- Ensure HIPAA compliance for health information
- Implement data residency requirements
- Regular security audits recommended
- GDPR compliance for EU users

## Support Resources

- Supabase Docs: https://supabase.com/docs
- Next.js Docs: https://nextjs.org/docs
- crypto-js Docs: https://cryptojs.gitbook.io/docs/

## Future Enhancements

- [ ] Geographic heatmaps with Mapbox GL
- [ ] Multi-language support (EN/TWI/FR)
- [ ] PWA offline support
- [ ] Real-time notifications
- [ ] Advanced search and filtering
- [ ] Custom report generation
- [ ] Integration with external services
- [ ] Mobile app (React Native)
