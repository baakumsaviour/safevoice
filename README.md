# SafeVoice - Trauma-Informed Case Management System

A secure, modern case management system designed specifically for documenting and managing abuse cases with military-grade encryption, trauma-informed design principles, and comprehensive security features.

## 🔐 Key Features

### Victim Portal (`/report`)
- **Anonymous Reporting**: Submit cases without creating an account
- **Trauma-Informed Design**: Minimal navigation, supportive messaging, quick escape button
- **Quick Escape Button**: One-click emergency exit to safe website (no browser history)
- **4-Step Form**: Guided experience covering incident details, narrative, evidence, and consent
- **Voice Recording**: Record your account instead of typing
- **Evidence Upload**: Secure file upload with client-side encryption
- **Multi-Language Support**: Ready for internationalization

### Caseworker Dashboard (`/dashboard`)
- **Triage Queue**: Prioritized view of new cases
- **Case Management**: Assign, track, and update case status
- **Secure Messaging**: Encrypted communication with victims
- **Case Notes**: Internal documentation with privacy controls
- **Evidence Tracking**: Manage uploaded files with expiration
- **Audit Logging**: Complete access and modification history

### Analytics Hub (`/analytics`)
- **Case Trends**: 30-day visualization of incoming cases
- **Priority Distribution**: Pie chart breakdown by urgency
- **Case Type Analysis**: Bar chart of incident categories
- **Key Metrics**: Total, open, closed, and urgent case counts
- **Geographic Heatmaps**: Ready for Mapbox GL integration

## 🏗️ Architecture

### Technology Stack
- **Next.js 16**: Latest React server components and App Router
- **React 19**: Modern component patterns
- **TypeScript**: Full type safety
- **Supabase**: PostgreSQL with Row-Level Security (RLS)
- **Tailwind CSS 4**: Utility-first styling
- **shadcn/ui**: Accessible component library
- **Recharts**: Data visualization
- **crypto-js**: Client-side encryption

### Security Architecture
```
Client Layer
  ├─ AES-256 Encryption (crypto-js)
  ├─ Quick Escape Button (window.location.replace)
  └─ Voice Recorder (WebM format)
         ↓
Network Layer (HTTPS)
         ↓
Server Layer (Next.js 16)
  ├─ Server Actions (secure operations)
  ├─ Middleware (authentication)
  └─ API Routes (when needed)
         ↓
Database Layer (Supabase PostgreSQL)
  ├─ Row-Level Security (RLS Policies)
  ├─ Encrypted Columns (at-rest)
  ├─ Audit Logging (all access)
  └─ Field Constraints (data integrity)
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and pnpm
- Supabase account (free tier works)

### Setup

1. **Clone and install**:
   ```bash
   git clone <repository>
   cd safevoice
   pnpm install
   ```

2. **Configure environment**:
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your Supabase credentials
   openssl rand -base64 32  # Generate encryption key
   ```

3. **Setup database**:
   - Copy `/db/schema.sql` contents
   - Paste into Supabase SQL Editor
   - Execute to create all tables with RLS

4. **Run development server**:
   ```bash
   pnpm dev
   ```

5. **Access the app**:
   - Home: http://localhost:3000
   - Report: http://localhost:3000/report
   - Dashboard: http://localhost:3000/dashboard (requires auth)
   - Analytics: http://localhost:3000/analytics

See [SETUP.md](./SETUP.md) for detailed setup instructions.

## 📁 Project Structure

```
safevoice/
├── app/                          # Next.js App Router
│   ├── (auth)/
│   │   ├── login/page.tsx       # Caseworker login
│   │   └── register/page.tsx    # (future) Registration
│   ├── analytics/               # Analytics hub
│   ├── dashboard/               # Caseworker portal
│   │   ├── page.tsx            # Triage queue
│   │   ├── messages/           # Messaging interface
│   │   ├── case/[id]/          # Case detail view
│   │   └── settings/           # User settings
│   ├── report/                 # Victim reporting portal
│   ├── layout.tsx              # Root layout
│   ├── page.tsx                # Home/landing page
│   └── globals.css             # Global styles
├── components/
│   ├── ui/                     # shadcn/ui components
│   ├── quick-escape-button.tsx # Emergency exit
│   ├── voice-recorder.tsx      # Audio recording
│   ├── dashboard-sidebar.tsx   # Nav sidebar
│   └── ...
├── lib/
│   ├── supabase.ts             # Supabase client
│   ├── encryption.ts           # AES-256 utilities
│   ├── actions/
│   │   ├── cases.ts            # Case server actions
│   │   ├── upload.ts           # Evidence upload
│   │   └── ...
│   ├── hooks/
│   │   └── use-realtime-cases.ts  # Real-time subscriptions
│   └── utils.ts
├── db/
│   └── schema.sql              # Database schema & RLS
├── middleware.ts               # Auth middleware
├── .env.example                # Environment variables template
├── SETUP.md                    # Setup instructions
├── DEPLOYMENT.md               # Deployment guide
└── package.json
```

## 🔒 Security Features

### Encryption
- **Client-side**: Narratives encrypted with AES-256 before transmission
- **In Transit**: HTTPS/TLS for all communications
- **At Rest**: Data encrypted in Supabase storage

### Access Control
- **Row-Level Security**: Victims see own cases, caseworkers see assigned cases, admins see all
- **Role-Based**: victim, caseworker, admin, analyst roles
- **Middleware**: Protected routes require authentication

### Audit Trail
- Complete logging of all case access
- User, timestamp, action, and description tracked
- IP address and user agent captured
- Compliance-ready reporting

### Data Protection
- Evidence expires 90 days after case closure
- Evidence locking mechanism for critical files
- Quick escape button uses `window.location.replace()` (no history)
- Automatic cleanup of archived case data

## 🌐 Environment Variables

Required:
```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_ENCRYPTION_KEY=your-encryption-key
```

Optional:
```env
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=your-mapbox-token
```

## 📊 Database Schema

### Core Tables
- **cases**: Case management with encryption support
- **case_messages**: Secure messaging between parties
- **case_notes**: Internal caseworker documentation
- **evidence**: File tracking and expiration
- **audit_log**: Compliance and security logging
- **resources**: Support resources (offline-first)
- **users**: User profiles and roles

All tables include Row-Level Security policies for fine-grained access control.

## 🚢 Deployment

### Vercel (Recommended)
1. Push code to GitHub
2. Connect repository to Vercel
3. Add environment variables
4. Deploy (automatic on push)

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions and production checklist.

## 📈 Performance

### Optimizations Included
- Turbopack bundling (Next.js 16)
- React Server Components for reduced JS
- Image optimization with next/image
- Database indexes for common queries
- Real-time subscriptions with Supabase

### Monitoring
- Vercel Analytics integration
- Optional Sentry error tracking
- Database performance monitoring

## 🧪 Testing

```bash
# Run tests
pnpm test

# Run linter
pnpm lint

# Type check
pnpm type-check
```

## 📚 Additional Resources

- [Setup Guide](./SETUP.md) - Detailed setup instructions
- [Deployment Guide](./DEPLOYMENT.md) - Production deployment
- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Tailwind CSS](https://tailwindcss.com)

## 🤝 Contributing

This project is designed for organizations supporting survivors of abuse. We welcome contributions that improve security, accessibility, and user experience.

## 📄 License

MIT - See LICENSE file for details

## ⚠️ Important

### For Production Use
- Enable Supabase email verification
- Configure custom SMTP for emails
- Set up automated backups
- Enable row-level security verification
- Implement HIPAA/GDPR compliance measures
- Regular security audits recommended
- Use strong encryption keys
- Implement rate limiting

### Privacy & Compliance
- Transparent data handling
- User consent management
- GDPR-compliant data retention
- HIPAA support for healthcare data
- Compliance audit logging

## 🆘 Support

For issues, security concerns, or feature requests:
1. Check documentation
2. Review issue tracker
3. Contact security team for security issues

## 🙏 Acknowledgments

SafeVoice is built with care for survivors. Special thanks to:
- Trauma-informed design principles
- Organizations supporting survivors
- Open-source community

---

**Built with Next.js 16, Supabase, and ❤️**
