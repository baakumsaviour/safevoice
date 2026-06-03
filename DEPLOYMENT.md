# SafeVoice Deployment Guide

## Vercel Deployment

### Prerequisites
- Vercel account
- GitHub repository with SafeVoice code
- Supabase project

### Step 1: Push to GitHub

```bash
git init
git add .
git commit -m "Initial SafeVoice setup"
git remote add origin https://github.com/yourusername/safevoice.git
git push -u origin main
```

### Step 2: Import to Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. Select your GitHub repository
3. Click "Import"

### Step 3: Configure Environment Variables

In Vercel project settings, add:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_ENCRYPTION_KEY=your-encryption-key
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=your-mapbox-token (optional)
```

### Step 4: Deploy

Vercel will automatically deploy on push to main branch.

## Production Security Checklist

- [ ] Use production Supabase project
- [ ] Enable HTTPS only
- [ ] Set secure environment variables
- [ ] Enable CORS for your domain
- [ ] Configure custom domain
- [ ] Enable rate limiting
- [ ] Set up error monitoring (Sentry)
- [ ] Enable analytics (Vercel Analytics)
- [ ] Regular security audits
- [ ] Database backups enabled
- [ ] WAF rules configured
- [ ] CSP headers set

## Performance Optimization

### Image Optimization
- Use Next.js Image component
- Optimize images before upload
- Set appropriate image dimensions

### Database Optimization
- Indexes on frequently queried columns (already set in schema.sql)
- Query optimization
- Connection pooling via Supabase

### Caching Strategy
- Use Next.js revalidation for static content
- Implement Redis caching for frequently accessed data
- Use browser caching for client assets

### Monitoring

#### Vercel Analytics
```
https://vercel.com/docs/analytics
```

#### Error Tracking (Optional)
```bash
pnpm add @sentry/nextjs
```

Configure in `next.config.js`:
```javascript
const withSentryConfig = require("@sentry/nextjs/withSentryConfig");

module.exports = withSentryConfig(nextConfig, {
  org: "your-org",
  project: "safevoice",
});
```

## Scaling Considerations

### As you grow:

1. **Database**
   - Monitor Supabase quota
   - Consider Supabase Pro plan
   - Implement read replicas if needed

2. **Storage**
   - Monitor storage usage
   - Implement file cleanup policies
   - Consider CDN for file delivery

3. **Performance**
   - Use Vercel Serverless Functions for heavy operations
   - Implement job queues (Upstash, Bull)
   - Cache API responses

4. **Security**
   - Rotate encryption keys quarterly
   - Regular penetration testing
   - Compliance audits (HIPAA, GDPR)

## Disaster Recovery

### Backup Strategy

1. **Database Backups**
   - Supabase: Automated daily backups (Pro plan)
   - Retention: 30 days
   - Test restore quarterly

2. **Code Backups**
   - GitHub repository
   - Regular commits
   - Protected main branch

3. **Evidence Files**
   - Supabase Storage backups
   - Cross-region replication (if available)
   - Regular integrity checks

### Incident Response

1. **Identify Issue**
   - Check Vercel dashboard
   - Review error logs
   - Monitor database health

2. **Communicate**
   - Notify users if necessary
   - Update status page
   - Document incident

3. **Restore**
   - Use backups to restore data
   - Rollback code if needed
   - Verify recovery

4. **Post-Incident**
   - Root cause analysis
   - Implement preventative measures
   - Update documentation

## Compliance & Legal

### HIPAA Compliance (if handling PHI)
- BAA with Supabase
- Encryption at rest and in transit
- Access logging and audit trails
- Data retention policies
- Regular security audits

### GDPR Compliance (if EU users)
- Data Privacy Policy
- User consent management
- Right to be forgotten process
- Data minimization practices
- DPA with Supabase

### SOC 2 Compliance
- Documented security procedures
- Regular audits
- Incident response plan
- Access controls
- Change management process

## Support

- Vercel Support: https://vercel.com/support
- Supabase Support: https://supabase.com/support
- Create issues on GitHub for bug reports

## Additional Resources

- [Next.js Deployment](https://nextjs.org/docs/deployment/vercel)
- [Supabase Deployment](https://supabase.com/docs/guides/deployment)
- [Vercel Security](https://vercel.com/security)
