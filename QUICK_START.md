# SafeVoice Quick Start Guide

## 🚀 5-Minute Setup

### Step 1: Clone & Install (2 min)
```bash
git clone <your-repo>
cd safevoice
pnpm install
```

### Step 2: Configure Environment (1 min)
```bash
cp .env.example .env.local
```

Edit `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_ENCRYPTION_KEY=$(openssl rand -base64 32)
```

### Step 3: Run Development Server (1 min)
```bash
pnpm dev
```

Open http://localhost:3000

### Step 4: Setup Database (1 min)
1. Go to Supabase dashboard
2. SQL Editor → New Query
3. Copy contents of `/db/schema.sql`
4. Execute

## 🌐 Accessing the App

| Portal | URL | Purpose |
|--------|-----|---------|
| Home | http://localhost:3000 | Navigation hub |
| Report | http://localhost:3000/report | Anonymous victim reporting |
| Dashboard | http://localhost:3000/dashboard | Case management |
| Analytics | http://localhost:3000/analytics | Insights & trends |
| Login | http://localhost:3000/auth/login | Caseworker authentication |

## 📁 Key Files to Know

| File | Purpose |
|------|---------|
| `app/page.tsx` | Home landing page |
| `app/report/page.tsx` | Victim reporting portal |
| `app/dashboard/page.tsx` | Case triage queue |
| `app/dashboard/case/[id]/page.tsx` | Case detail view |
| `app/analytics/page.tsx` | Analytics dashboard |
| `lib/supabase.ts` | Supabase client setup |
| `lib/encryption.ts` | AES-256 utilities |
| `lib/actions/cases.ts` | Case server actions |
| `db/schema.sql` | Database schema |
| `proxy.ts` | Authentication middleware |

## 🔐 Quick Security Checklist

- [ ] Generate encryption key: `openssl rand -base64 32`
- [ ] Add to `.env.local`: `NEXT_PUBLIC_ENCRYPTION_KEY=...`
- [ ] Enable HTTPS in production
- [ ] Configure Supabase RLS policies (schema.sql does this)
- [ ] Set up email verification
- [ ] Enable database backups

## 🛠️ Common Commands

```bash
# Development
pnpm dev              # Start dev server
pnpm build            # Production build
pnpm start            # Run production build
pnpm lint             # Check code

# Database
pnpm db:push          # Push schema to Supabase
pnpm db:pull          # Pull schema from Supabase

# Deployment
git push origin main  # Deploy to Vercel (if connected)
```

## 📝 Creating a Test Case

1. Go to http://localhost:3000/report
2. Click "Start Report"
3. Fill in incident details
4. Add narrative or record audio
5. (Optional) Upload evidence
6. Accept consent
7. Submit

Case will appear in Dashboard triage queue.

## 👤 Caseworker Access

1. Go to http://localhost:3000/auth/login
2. Use credentials from your Supabase user table
3. Dashboard loads automatically
4. View triage queue and manage cases

## 🔄 Real-Time Features

Cases and messages update in real-time thanks to Supabase Realtime:
- New cases appear in queue immediately
- Messages sync across sessions
- Case status updates live

## 📊 Analytics

Analytics dashboard shows:
- **Trends**: 30-day case volume
- **Priority**: Urgent, high, medium, low breakdown
- **Types**: Sexual assault, domestic violence, trafficking
- **Metrics**: Total, open, closed, urgent counts

## 🚢 Deploy to Vercel

### Connect to GitHub
```bash
git remote add origin https://github.com/you/safevoice
git push -u origin main
```

### In Vercel Dashboard
1. Import from GitHub
2. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_ENCRYPTION_KEY`
3. Deploy

## 🆘 Troubleshooting

### Supabase Connection Error
```
Error: supabaseUrl is required
```
→ Check `.env.local` has correct Supabase credentials

### Build Fails
```
Type error in lib/supabase.ts
```
→ Run `pnpm install` to get all dependencies

### Database Error
```
RLS policy violation
```
→ Ensure schema.sql was executed in Supabase

### Quick Escape Button Not Working
→ Check browser console for JavaScript errors

## 📖 More Resources

- **Full Setup**: See [SETUP.md](./SETUP.md)
- **Deployment**: See [DEPLOYMENT.md](./DEPLOYMENT.md)
- **Architecture**: See [BUILD_SUMMARY.md](./BUILD_SUMMARY.md)
- **Project Info**: See [README.md](./README.md)

## 💡 Tips

### Development
- Use TypeScript for type safety
- Server Actions handle auth automatically
- Check browser console for client-side errors
- Check terminal for server-side errors

### Database
- Encryption happens client-side automatically
- RLS policies enforce access control
- Audit log tracks all case access
- Indexes optimize common queries

### Deployment
- Vercel auto-deploys on push
- Environment variables kept secure
- Database backups recommended
- Monitor Vercel Analytics dashboard

## 🎯 Next Features to Consider

- [ ] Multi-language support (EN/TWI/FR)
- [ ] PWA offline support
- [ ] Mapbox geographic heatmaps
- [ ] Advanced search/filtering
- [ ] Custom report generation
- [ ] Email notifications
- [ ] SMS alerts for urgent cases
- [ ] Mobile app (React Native)

## 📞 Support

- Check docs first (SETUP.md, DEPLOYMENT.md)
- Review console errors
- Check Supabase dashboard
- Create GitHub issue for bugs

---

**Questions?** See the comprehensive documentation files:
- [SETUP.md](./SETUP.md) - Detailed setup
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Production deployment
- [BUILD_SUMMARY.md](./BUILD_SUMMARY.md) - Complete feature list
