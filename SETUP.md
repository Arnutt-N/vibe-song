# Vibe-Song Setup Guide

This guide will help you set up and run the Vibe-Song project locally.

## Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- A Supabase account (free tier)
- A Last.fm API account (free)

## Step 1: Install Dependencies

```bash
npm install
```

## Step 2: Set Up Supabase

### Create a Supabase Project

1. Go to [https://app.supabase.com](https://app.supabase.com)
2. Create a new project (free tier)
3. Wait for the project to be provisioned

### Run Database Migrations

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy the contents of `supabase/migrations/20251022000000_initial_schema.sql`
4. Paste and run the SQL in the editor

See [supabase/README.md](./supabase/README.md) for more details.

### Get API Credentials

1. Go to Project Settings > API
2. Copy the following:
   - Project URL
   - Anon/Public key

## Step 3: Set Up Last.fm API

1. Go to [https://www.last.fm/api/account/create](https://www.last.fm/api/account/create)
2. Fill in the application form
3. Copy your API key

## Step 4: Configure Environment Variables

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Fill in your credentials in `.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your-project-url.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   LASTFM_API_KEY=your-lastfm-api-key
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

## Step 5: Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Step 6: Verify Setup

You should see the Vibe-Song homepage with the mood input interface. The setup is complete!

## Step 7: Configure OAuth (Optional)

If you want to enable Google or GitHub sign-in:

### Google OAuth
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add redirect URI: `https://YOUR_PROJECT.supabase.co/auth/v1/callback`
6. Add credentials to Supabase:
   - Go to Authentication > Providers > Google
   - Enable and add Client ID and Secret

### GitHub OAuth
1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Create a new OAuth App
3. Set callback URL: `https://YOUR_PROJECT.supabase.co/auth/v1/callback`
4. Copy Client ID and generate Client Secret
5. Add credentials to Supabase:
   - Go to Authentication > Providers > GitHub
   - Enable and add Client ID and Secret

## Using the Application

The MVP is fully functional! Here's what you can do:

### 1. Express Your Mood
- Select a mood emoji (Happy, Sad, Energetic, Calm, etc.)
- Adjust the Energy Level slider (1-10)
- Adjust the Mood Valence slider (1-10)

### 2. Get Recommendations
- Click "Find Music" button
- Wait for personalized recommendations based on your mood
- Browse through recommended tracks

### 3. Play Music
- Click on any track's album cover to play
- Use playback controls at the bottom:
  - Play/Pause button
  - Previous/Next track buttons
  - Progress bar (click to seek)
  - Volume control

### 4. Keyboard Shortcuts
- `Space`: Play/Pause
- `→`: Next track
- `←`: Previous track
- `↑`: Increase volume
- `↓`: Decrease volume
- `M`: Mute/Unmute

### 5. Save Tracks (Requires Sign In)
- Click "Sign In" button in header
- Sign up with email/password or OAuth
- Click heart icon on tracks to save them
- Access saved tracks from user menu

### 6. View History
- Listening history is automatically tracked
- View from user menu > History
- See your mood context for each play

## Project Structure

```
vibe-song/
├── src/
│   ├── app/              # Next.js app directory
│   ├── components/       # React components
│   │   └── ui/          # shadcn/ui components
│   ├── lib/             # Utilities and configurations
│   │   └── supabase/    # Supabase client setup
│   ├── store/           # Zustand stores
│   ├── types/           # TypeScript types
│   └── services/        # API services
├── supabase/
│   └── migrations/      # Database migrations
├── docs/                # Documentation
│   ├── PRPs/           # Technical plans
│   └── architecture/   # Architecture docs
└── openspec/           # Feature specifications
```

## Common Commands

```bash
# Development
npm run dev          # Start dev server
npm run build        # Build for production
npm start            # Start production server

# Code Quality
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript compiler
```

## Troubleshooting

### Database Connection Issues

- Verify your Supabase URL and anon key in `.env.local`
- Check that your Supabase project is active
- Ensure migrations have been run successfully

### API Issues

- Check that your Last.fm API key is valid
- Verify network connectivity
- Check browser console for errors

### Build Issues

- Clear Next.js cache: `rm -rf .next`
- Reinstall dependencies: `rm -rf node_modules && npm install`
- Check Node.js version: `node --version` (should be 18+)

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Deezer API Documentation](https://developers.deezer.com/api)
- [Last.fm API Documentation](https://www.last.fm/api)
- [shadcn/ui Documentation](https://ui.shadcn.com)

## Support

For issues and questions:
- Check the [technical plans](./docs/PRPs/)
- Review the [architecture documentation](./docs/architecture/)
- Open an issue on GitHub

---

**MVP is ready!** Start discovering music that matches your vibe! 🎵✨
