# Technical Plan: User Preferences & Authentication

## Document Information
- **Specification**: [user-preferences.md](../../openspec/changes/user-preferences.md)
- **Created**: 2025-10-21
- **Status**: Ready for Implementation
- **Version**: 1.0

---

## Architecture Overview

User authentication and preferences using Supabase Auth with Row Level Security, Zustand for auth state management, and server-side middleware for protected routes.

```
User Action
    ↓
Auth UI Component
    ↓
Supabase Auth API
    ↓
JWT Token (HTTP-only cookie)
    ↓
useAuthStore (Zustand)
    ↓
Protected Routes / User Data Access
```

---

## Authentication Flow

### Sign Up Flow

```
User enters email/password
    ↓
Client: supabase.auth.signUp()
    ↓
Supabase: Create user + Send verification email
    ↓
Client: Set session, redirect to /discover
    ↓
Background: Migrate anonymous data (if exists)
```

### Login Flow

```
User enters credentials
    ↓
Client: supabase.auth.signInWithPassword()
    ↓
Supabase: Verify credentials
    ↓
Client: Set session, redirect
    ↓
Load user preferences
```

### OAuth Flow (Google)

```
User clicks "Continue with Google"
    ↓
Client: supabase.auth.signInWithOAuth({ provider: 'google' })
    ↓
Redirect to Google consent screen
    ↓
Google redirects to /auth/callback
    ↓
Callback handler sets session
    ↓
Redirect to /discover
```

---

## Components Structure

### 1. Auth Modal

**Location**: `components/auth/auth-modal.tsx`

```typescript
'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { SignUpForm } from './signup-form'
import { LoginForm } from './login-form'
import { OAuthButtons } from './oauth-buttons'

interface AuthModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  defaultTab?: 'login' | 'signup'
}

export function AuthModal({ open, onOpenChange, defaultTab = 'login' }: AuthModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Welcome to Vibe-Song</DialogTitle>
          <DialogDescription>
            Sign in to save your preferences and listening history
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue={defaultTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Log In</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <OAuthButtons />
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or continue with email
                </span>
              </div>
            </div>
            <LoginForm onSuccess={() => onOpenChange(false)} />
          </TabsContent>

          <TabsContent value="signup">
            <OAuthButtons />
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or continue with email
                </span>
              </div>
            </div>
            <SignUpForm onSuccess={() => onOpenChange(false)} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
```

---

### 2. Sign Up Form

**Location**: `components/auth/signup-form.tsx`

```typescript
'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuthStore } from '@/stores/auth-store'
import { Loader2 } from 'lucide-react'

const signupSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Za-z]/, 'Password must contain at least one letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  displayName: z.string().optional()
})

type SignupForm = z.infer<typeof signupSchema>

export function SignUpForm({ onSuccess }: { onSuccess: () => void }) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { signUp } = useAuthStore()

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<SignupForm>({
    resolver: zodResolver(signupSchema)
  })

  const onSubmit = async (data: SignupForm) => {
    setIsLoading(true)
    setError(null)

    try {
      await signUp(data.email, data.password, data.displayName)
      onSuccess()
    } catch (err: any) {
      setError(err.message || 'Failed to sign up')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="you@example.com"
          {...register('email')}
        />
        {errors.email && (
          <p className="text-sm text-destructive">{errors.email.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          placeholder="••••••••"
          {...register('password')}
        />
        {errors.password && (
          <p className="text-sm text-destructive">{errors.password.message}</p>
        )}
        <p className="text-xs text-muted-foreground">
          At least 8 characters with a letter and number
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="displayName">Display Name (Optional)</Label>
        <Input
          id="displayName"
          type="text"
          placeholder="Your name"
          {...register('displayName')}
        />
      </div>

      {error && (
        <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">
          {error}
        </div>
      )}

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Create Account
      </Button>

      <p className="text-xs text-center text-muted-foreground">
        By signing up, you agree to our{' '}
        <a href="/terms" className="underline">
          Terms
        </a>{' '}
        and{' '}
        <a href="/privacy" className="underline">
          Privacy Policy
        </a>
      </p>
    </form>
  )
}
```

---

### 3. Login Form

**Location**: `components/auth/login-form.tsx`

```typescript
'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuthStore } from '@/stores/auth-store'

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, 'Password is required')
})

type LoginForm = z.infer<typeof loginSchema>

export function LoginForm({ onSuccess }: { onSuccess: () => void }) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { signIn } = useAuthStore()

  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema)
  })

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true)
    setError(null)

    try {
      await signIn(data.email, data.password)
      onSuccess()
    } catch (err: any) {
      setError(err.message || 'Invalid credentials')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="login-email">Email</Label>
        <Input
          id="login-email"
          type="email"
          placeholder="you@example.com"
          {...register('email')}
        />
        {errors.email && (
          <p className="text-sm text-destructive">{errors.email.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="login-password">Password</Label>
          <Button variant="link" size="sm" className="px-0" type="button">
            Forgot password?
          </Button>
        </div>
        <Input
          id="login-password"
          type="password"
          {...register('password')}
        />
        {errors.password && (
          <p className="text-sm text-destructive">{errors.password.message}</p>
        )}
      </div>

      {error && (
        <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">
          {error}
        </div>
      )}

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Log In
      </Button>
    </form>
  )
}
```

---

### 4. OAuth Buttons

**Location**: `components/auth/oauth-buttons.tsx`

```typescript
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/stores/auth-store'
import { FaGoogle, FaGithub } from 'react-icons/fa'

export function OAuthButtons() {
  const [isLoading, setIsLoading] = useState<string | null>(null)
  const { signInWithOAuth } = useAuthStore()

  const handleOAuth = async (provider: 'google' | 'github') => {
    setIsLoading(provider)
    try {
      await signInWithOAuth(provider)
    } catch (error) {
      console.error(`${provider} sign in error:`, error)
    } finally {
      setIsLoading(null)
    }
  }

  return (
    <div className="space-y-2">
      <Button
        variant="outline"
        className="w-full"
        onClick={() => handleOAuth('google')}
        disabled={!!isLoading}
      >
        <FaGoogle className="mr-2 h-4 w-4" />
        Continue with Google
      </Button>

      <Button
        variant="outline"
        className="w-full"
        onClick={() => handleOAuth('github')}
        disabled={!!isLoading}
      >
        <FaGithub className="mr-2 h-4 w-4" />
        Continue with GitHub
      </Button>
    </div>
  )
}
```

---

## State Management

### Auth Store

**Location**: `stores/auth-store.ts`

```typescript
import { create } from 'zustand'
import { supabase } from '@/lib/supabase'
import type { User, Session } from '@supabase/supabase-js'

interface AuthState {
  user: User | null
  session: Session | null
  isLoading: boolean
  isAuthenticated: boolean

  signUp: (email: string, password: string, displayName?: string) => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  signInWithOAuth: (provider: 'google' | 'github') => Promise<void>
  signOut: () => Promise<void>
  initialize: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  session: null,
  isLoading: true,
  isAuthenticated: false,

  signUp: async (email, password, displayName) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: displayName
        }
      }
    })

    if (error) throw error

    // Create user profile
    if (data.user) {
      await supabase.from('user_profiles').insert({
        user_id: data.user.id,
        display_name: displayName
      })

      // Migrate anonymous data if exists
      await migrateAnonymousData(data.user.id)
    }

    set({
      user: data.user,
      session: data.session,
      isAuthenticated: !!data.user
    })
  },

  signIn: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) throw error

    set({
      user: data.user,
      session: data.session,
      isAuthenticated: !!data.user
    })
  },

  signInWithOAuth: async (provider) => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    })

    if (error) throw error
  },

  signOut: async () => {
    await supabase.auth.signOut()
    set({
      user: null,
      session: null,
      isAuthenticated: false
    })
  },

  initialize: async () => {
    set({ isLoading: true })

    const { data: { session } } = await supabase.auth.getSession()

    set({
      user: session?.user || null,
      session: session,
      isAuthenticated: !!session?.user,
      isLoading: false
    })

    // Listen to auth changes
    supabase.auth.onAuthStateChange((_event, session) => {
      set({
        user: session?.user || null,
        session: session,
        isAuthenticated: !!session?.user
      })
    })
  }
}))

// Helper function to migrate anonymous data
async function migrateAnonymousData(userId: string) {
  const localData = localStorage.getItem('vibe_anonymous_data')
  if (!localData) return

  try {
    const { savedTracks } = JSON.parse(localData)

    if (savedTracks?.length) {
      await supabase.from('saved_tracks').insert(
        savedTracks.map((track: any) => ({
          user_id: userId,
          track_id: track.id,
          track_data: track
        }))
      )
    }

    localStorage.removeItem('vibe_anonymous_data')
  } catch (error) {
    console.error('Migration error:', error)
  }
}
```

---

## API Routes

### OAuth Callback

**Location**: `app/auth/callback/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    const supabase = createRouteHandlerClient({ cookies })
    await supabase.auth.exchangeCodeForSession(code)
  }

  // Redirect to discover page
  return NextResponse.redirect(new URL('/discover', request.url))
}
```

---

## User Profile & Preferences

### Profile Page

**Location**: `app/profile/page.tsx`

```typescript
'use client'

import { useAuthStore } from '@/stores/auth-store'
import { ProfileForm } from '@/components/profile/profile-form'
import { MusicPreferences } from '@/components/profile/music-preferences'
import { PrivacySettings } from '@/components/profile/privacy-settings'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default function ProfilePage() {
  const { user } = useAuthStore()

  if (!user) {
    return <div>Please log in</div>
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Settings</h1>

      <Tabs defaultValue="profile">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="preferences">Music Preferences</TabsTrigger>
          <TabsTrigger value="privacy">Privacy & Data</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <ProfileForm />
        </TabsContent>

        <TabsContent value="preferences">
          <MusicPreferences />
        </TabsContent>

        <TabsContent value="privacy">
          <PrivacySettings />
        </TabsContent>
      </Tabs>
    </div>
  )
}
```

---

## Protected Routes

### Middleware

**Location**: `middleware.ts`

```typescript
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  const {
    data: { session }
  } = await supabase.auth.getSession()

  // Protected routes
  const protectedPaths = ['/profile', '/library']
  const isProtectedPath = protectedPaths.some((path) =>
    req.nextUrl.pathname.startsWith(path)
  )

  if (isProtectedPath && !session) {
    const redirectUrl = new URL('/login', req.url)
    redirectUrl.searchParams.set('redirect', req.nextUrl.pathname)
    return NextResponse.redirect(redirectUrl)
  }

  return res
}

export const config = {
  matcher: ['/profile/:path*', '/library/:path*']
}
```

---

## Database Schema

Already defined in [data-models.md](../architecture/data-models.md):

- `user_profiles` - User profile information
- `user_preferences` - Music preferences
- `saved_tracks` - Favorited tracks
- `listening_history` - Playback history

All tables have Row Level Security enabled.

---

## Implementation Strategy

### Phase 1: Authentication (Week 4, Days 1-2)
1. Setup Supabase Auth
2. Create auth components
3. Email/password signup/login
4. Auth store with Zustand

### Phase 2: OAuth (Week 4, Day 3)
1. Configure Google OAuth
2. OAuth callback handler
3. Migration logic

### Phase 3: Profile (Week 4, Days 4-5)
1. Profile page UI
2. Profile update functionality
3. Avatar upload

### Phase 4: Preferences (Week 5, Days 1-2)
1. Music preferences UI
2. Saved tracks
3. Listening history
4. Privacy controls

---

## Testing Strategy

### Unit Tests

```typescript
describe('Auth Store', () => {
  it('signs up user successfully', async () => {
    const { signUp } = useAuthStore.getState()
    await signUp('test@example.com', 'password123', 'Test User')

    const { user, isAuthenticated } = useAuthStore.getState()
    expect(user).toBeTruthy()
    expect(isAuthenticated).toBe(true)
  })

  it('handles sign up error', async () => {
    const { signUp } = useAuthStore.getState()

    await expect(
      signUp('invalid', 'short', 'Test')
    ).rejects.toThrow()
  })
})
```

### E2E Tests

```typescript
test('complete signup flow', async ({ page }) => {
  await page.goto('/signup')

  await page.fill('input[type="email"]', 'test@example.com')
  await page.fill('input[type="password"]', 'password123')
  await page.click('button[type="submit"]')

  await expect(page).toHaveURL('/discover')
  await expect(page.locator('text=test@example.com')).toBeVisible()
})
```

---

## GDPR Compliance

### Data Export

```typescript
// app/api/profile/export/route.ts
export async function GET(request: NextRequest) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new Response('Unauthorized', { status: 401 })

  const userData = await exportUserData(user.id)

  return new Response(JSON.stringify(userData, null, 2), {
    headers: {
      'Content-Type': 'application/json',
      'Content-Disposition': 'attachment; filename="vibe-song-data.json"'
    }
  })
}

async function exportUserData(userId: string) {
  const [profile, preferences, savedTracks, history] = await Promise.all([
    supabase.from('user_profiles').select('*').eq('user_id', userId).single(),
    supabase.from('user_preferences').select('*').eq('user_id', userId).single(),
    supabase.from('saved_tracks').select('*').eq('user_id', userId),
    supabase.from('listening_history').select('*').eq('user_id', userId)
  ])

  return {
    profile: profile.data,
    preferences: preferences.data,
    saved_tracks: savedTracks.data,
    listening_history: history.data,
    exported_at: new Date().toISOString()
  }
}
```

### Account Deletion

```typescript
// app/api/profile/delete/route.ts
export async function DELETE(request: NextRequest) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new Response('Unauthorized', { status: 401 })

  // Delete all user data (cascades via foreign keys)
  await supabase.auth.admin.deleteUser(user.id)

  return new Response(null, { status: 204 })
}
```

---

## Success Criteria

- [ ] Sign up works (email/password)
- [ ] Login works
- [ ] OAuth works (Google)
- [ ] Profile updates save
- [ ] Preferences save and affect recommendations
- [ ] Saved tracks persist
- [ ] Listening history tracks correctly
- [ ] Data export works
- [ ] Account deletion works
- [ ] Anonymous to authenticated migration works
- [ ] All tests passing
- [ ] GDPR compliant

---

**Status**: Ready for Implementation
**Estimated Effort**: 5-6 days
**Last Updated**: 2025-10-21
