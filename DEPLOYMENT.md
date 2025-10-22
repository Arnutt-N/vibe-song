# Deployment Guide

This guide covers deploying Vibe-Song to production using Vercel (frontend) and Supabase (database).

## Table of Contents

- [Prerequisites](#prerequisites)
- [Supabase Production Setup](#supabase-production-setup)
- [Vercel Deployment](#vercel-deployment)
- [Environment Variables](#environment-variables)
- [Post-Deployment](#post-deployment)
- [Monitoring](#monitoring)
- [Troubleshooting](#troubleshooting)

## Prerequisites

Before deploying, ensure you have:

- ✅ A GitHub account
- ✅ A Vercel account (free tier available)
- ✅ A Supabase account (free tier available)
- ✅ A Last.fm API key (free)
- ✅ (Optional) Google Cloud project for OAuth
- ✅ (Optional) GitHub OAuth app for authentication

## Supabase Production Setup

### 1. Create Production Project

1. Go to [https://app.supabase.com](https://app.supabase.com)
2. Click "New Project"
3. Fill in details:
   - **Name**: vibe-song-production
   - **Database Password**: Generate a strong password (save it securely!)
   - **Region**: Choose closest to your users
   - **Pricing Plan**: Free tier is sufficient for MVP
4. Click "Create new project"
5. Wait 2-3 minutes for provisioning

### 2. Run Database Migrations

1. Go to SQL Editor in your Supabase dashboard
2. Copy contents of `supabase/migrations/20251022000000_initial_schema.sql`
3. Paste into SQL Editor
4. Click "Run" to execute

Verify tables were created:
- `mood_sessions`
- `saved_tracks`
- `listening_history`

### 3. Configure Authentication

#### Email/Password Authentication

1. Go to Authentication > Providers
2. Email is enabled by default
3. Configure email templates (optional):
   - Confirmation email
   - Password recovery email

#### Google OAuth (Optional)

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create new project or select existing
3. Enable Google+ API
4. Go to Credentials > Create Credentials > OAuth 2.0 Client ID
5. Application type: Web application
6. Authorized redirect URIs:
   ```
   https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback
   ```
7. Copy Client ID and Client Secret
8. In Supabase:
   - Go to Authentication > Providers > Google
   - Enable Google provider
   - Paste Client ID and Secret
   - Save

#### GitHub OAuth (Optional)

1. Go to [GitHub Settings > Developer Settings](https://github.com/settings/developers)
2. Click "New OAuth App"
3. Fill in:
   - **Application name**: Vibe-Song
   - **Homepage URL**: Your domain (or Vercel URL)
   - **Authorization callback URL**:
     ```
     https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback
     ```
4. Register application
5. Copy Client ID and generate Client Secret
6. In Supabase:
   - Go to Authentication > Providers > GitHub
   - Enable GitHub provider
   - Paste Client ID and Secret
   - Save

### 4. Get API Credentials

1. Go to Settings > API
2. Copy the following (you'll need these for Vercel):
   - **Project URL**: `https://YOUR_PROJECT_REF.supabase.co`
   - **Anon/Public Key**: `eyJ...` (long string)

### 5. Configure Security

#### Update Site URL

1. Go to Authentication > URL Configuration
2. Set Site URL to your production domain:
   ```
   https://vibe-song.vercel.app
   ```
   (or your custom domain)

#### Add Redirect URLs

Add allowed redirect URLs:
```
https://vibe-song.vercel.app/**
https://your-custom-domain.com/**
```

## Vercel Deployment

### 1. Push Code to GitHub

If you haven't already:

```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "feat: MVP complete - ready for deployment"

# Create GitHub repository (via GitHub website)

# Add remote
git remote add origin https://github.com/YOUR_USERNAME/vibe-song.git

# Push
git push -u origin main
```

### 2. Import to Vercel

1. Go to [https://vercel.com](https://vercel.com)
2. Click "Add New" > "Project"
3. Import your GitHub repository
4. Configure project:
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: ./
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: `.next` (default)

### 3. Add Environment Variables

Click "Environment Variables" and add:

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ... (your anon key)
LASTFM_API_KEY=your_lastfm_api_key
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
```

**Important**: Replace with your actual values!

### 4. Deploy

1. Click "Deploy"
2. Wait 2-3 minutes for build
3. Vercel will provide a deployment URL like:
   ```
   https://vibe-song.vercel.app
   ```

### 5. Verify Deployment

Visit your deployment URL and test:

- ✅ Homepage loads
- ✅ Mood input works
- ✅ Recommendations load
- ✅ Audio player works
- ✅ Authentication works
- ✅ Saving tracks works

## Environment Variables

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | `https://abc123.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | `eyJ...` |
| `LASTFM_API_KEY` | Last.fm API key | `abc123...` |
| `NEXT_PUBLIC_APP_URL` | Your app's production URL | `https://vibe-song.vercel.app` |

### Optional Variables

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_GOOGLE_ANALYTICS_ID` | Google Analytics tracking ID |
| `SENTRY_DSN` | Sentry error tracking DSN |

## Custom Domain (Optional)

### 1. Add Domain to Vercel

1. Go to your project in Vercel
2. Settings > Domains
3. Add your custom domain (e.g., `vibe-song.com`)
4. Vercel will provide DNS records to configure

### 2. Configure DNS

With your domain registrar, add the DNS records provided by Vercel.

**A Record:**
```
Type: A
Name: @
Value: 76.76.21.21
```

**CNAME (www):**
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

### 3. Update Supabase URLs

After domain is active, update in Supabase:

1. Authentication > URL Configuration
2. Set Site URL to `https://your-domain.com`
3. Add to redirect URLs:
   ```
   https://your-domain.com/**
   https://www.your-domain.com/**
   ```

### 4. Update Environment Variables

In Vercel:
1. Settings > Environment Variables
2. Update `NEXT_PUBLIC_APP_URL` to your custom domain
3. Redeploy

## Post-Deployment

### 1. Test All Features

Create a testing checklist:

- [ ] Homepage loads correctly
- [ ] Mood selection works
- [ ] "Find Music" returns recommendations
- [ ] Tracks play correctly
- [ ] Keyboard shortcuts work
- [ ] Sign up flow works
- [ ] Sign in flow works
- [ ] OAuth (Google/GitHub) works
- [ ] Save track functionality works
- [ ] User menu displays correctly
- [ ] Mobile responsive design works

### 2. Performance Check

Use these tools to check performance:

- [PageSpeed Insights](https://pagespeed.web.dev/)
- [GTmetrix](https://gtmetrix.com/)
- [WebPageTest](https://www.webpagetest.org/)

Target metrics:
- First Contentful Paint < 1.8s
- Largest Contentful Paint < 2.5s
- Time to Interactive < 3.8s
- Cumulative Layout Shift < 0.1

### 3. Set Up Monitoring

#### Vercel Analytics

1. Go to your project in Vercel
2. Analytics tab
3. Enable Web Analytics (free)

#### Sentry (Error Tracking)

1. Sign up at [sentry.io](https://sentry.io)
2. Create new Next.js project
3. Follow setup instructions
4. Add `SENTRY_DSN` to Vercel environment variables

### 4. Database Backups

Supabase automatically backs up your database daily on the free tier. To verify:

1. Go to Database > Backups
2. Confirm backups are enabled

## Monitoring

### Check Application Health

**Vercel Dashboard:**
- Deployment status
- Build logs
- Runtime logs
- Analytics

**Supabase Dashboard:**
- Database usage
- API requests
- Auth users
- Storage usage

### Set Up Alerts

**Vercel:**
1. Project Settings > Notifications
2. Enable deployment notifications
3. Add email or Slack integration

**Supabase:**
1. Project Settings > Notifications
2. Set up alerts for:
   - Database usage > 80%
   - API requests threshold
   - Error rate increases

## Troubleshooting

### Build Failures

**Error: TypeScript compilation failed**
```bash
# Run locally to debug
npm run type-check
```

**Error: Missing environment variables**
- Check all required env vars are set in Vercel
- Make sure they match production values

### Runtime Errors

**Error: Supabase connection failed**
- Verify `NEXT_PUBLIC_SUPABASE_URL` is correct
- Verify `NEXT_PUBLIC_SUPABASE_ANON_KEY` is correct
- Check Supabase project is active

**Error: Authentication not working**
- Verify Site URL in Supabase matches your domain
- Check redirect URLs include your domain
- Verify OAuth credentials if using Google/GitHub

**Error: API rate limits**
- Deezer API: No auth required, generous limits
- Last.fm API: Free tier 5 requests/second
- Consider implementing caching if needed

### Performance Issues

**Slow page loads:**
- Enable Vercel Edge caching
- Optimize images (already using Next.js Image)
- Consider CDN for album artwork

**High database usage:**
- Check for N+1 queries
- Add indexes to frequently queried columns
- Implement pagination

### Database Issues

**Connection errors:**
```bash
# Check database status
# Go to Supabase dashboard > Database > Connection pooling
```

**Migration errors:**
- Verify all migrations ran successfully
- Check for syntax errors in SQL
- Ensure RLS policies are configured

## Rollback Procedure

If deployment has critical issues:

### 1. Rollback Deployment

**Via Vercel Dashboard:**
1. Go to Deployments
2. Find last working deployment
3. Click "..." menu
4. Select "Promote to Production"

**Via Vercel CLI:**
```bash
vercel rollback
```

### 2. Rollback Database (if needed)

**Restore from backup:**
1. Go to Supabase > Database > Backups
2. Select backup to restore
3. Click "Restore"
4. Confirm restoration

**Note**: This will overwrite current data!

## Production Checklist

Before going live:

- [ ] All environment variables configured
- [ ] Database migrations run successfully
- [ ] Authentication working (all providers)
- [ ] All features tested manually
- [ ] Performance metrics acceptable
- [ ] Error tracking set up (Sentry)
- [ ] Analytics set up (Vercel/GA)
- [ ] Custom domain configured (if applicable)
- [ ] SSL certificate active (automatic via Vercel)
- [ ] Backup strategy verified
- [ ] Monitoring alerts configured
- [ ] Documentation updated

## Scaling Considerations

As your app grows, consider:

### Vercel
- **Free tier limits**: 100 GB bandwidth/month
- **Upgrade to Pro**: $20/month for unlimited bandwidth
- **Edge Functions**: For API routes that need low latency

### Supabase
- **Free tier limits**: 500 MB database, 1 GB file storage
- **Upgrade to Pro**: $25/month for 8 GB database, 100 GB storage
- **Connection pooling**: Enable for high traffic
- **Read replicas**: For heavy read workloads

### External APIs
- **Deezer**: No auth required, very generous limits
- **Last.fm**: Free tier sufficient for MVP, upgrade if needed

## Support

For deployment issues:
- **Vercel**: [vercel.com/support](https://vercel.com/support)
- **Supabase**: [supabase.com/support](https://supabase.com/support)
- **GitHub Issues**: Report bugs in repository

---

## Congratulations!

Your Vibe-Song app is now live! 🎉🎵

Share your deployment:
- Tweet about it
- Post on Product Hunt
- Share in music/tech communities
- Get user feedback

**Next steps**: Monitor usage, gather feedback, and iterate on features!
