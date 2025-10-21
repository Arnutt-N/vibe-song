# Feature Specification: User Preferences & Authentication

## Overview

User Preferences & Authentication enables personalization and data persistence across sessions. This includes user account creation, authentication, preference management, and saved content (favorite tracks, listening history).

## User Need

**Problem**: Anonymous users can't save their preferences, favorite tracks, or listening history. When they leave and return, everything is lost. Personalized recommendations can't improve without user data.

**Solution**: A flexible authentication system that:
- Allows anonymous exploration (no account needed to start)
- Enables easy account creation when users want to save data
- Persists preferences, favorites, and history
- Improves recommendations over time
- Protects user privacy

---

## Requirements

### Functional Requirements

#### ADDED:

**FR-1: Anonymous Usage**
- Users MUST be able to use core features without creating an account:
  - Select mood
  - Get recommendations
  - Play music
  - Browse recommendations
- Anonymous usage data SHOULD be stored in localStorage (session-only)
- Anonymous users SHOULD see a prompt to create account (non-intrusive)
- Converting from anonymous to authenticated SHOULD migrate session data

**FR-2: Account Creation**
- Users MUST be able to create account with email/password
- Email MUST be validated (format check)
- Password MUST meet security requirements:
  - Minimum 8 characters
  - At least one letter and one number
- Email verification SHOULD be sent after signup
- Users MAY skip email verification initially (grace period)

**FR-3: Authentication Methods**
- Email/Password (Phase 1)
- Google OAuth (Phase 2)
- GitHub OAuth (Phase 2 - optional)
- Magic link email login (future)

**FR-4: Session Management**
- Users MUST stay logged in across browser sessions (remember me)
- Sessions MUST expire after 30 days of inactivity
- Users MUST be able to log out manually
- Users SHOULD be able to see active sessions and revoke them

**FR-5: Password Management**
- Users MUST be able to reset forgotten password
- Password reset link sent via email
- Reset link expires after 1 hour
- Users MUST be able to change password when logged in
- Old password required to change password

**FR-6: Profile Management**
- Users MUST be able to set/update:
  - Display name
  - Avatar (upload or choose default)
  - Bio (optional, max 200 chars)
- Profile changes saved immediately
- Avatar upload: max 2MB, JPG/PNG only

**FR-7: Music Preferences**
- Users SHOULD be able to set favorite genres (multi-select)
- System SHOULD learn favorite artists from listening history
- Users MAY manually add favorite artists
- Users SHOULD be able to adjust recommendation preferences:
  - Discovery vs. familiarity slider (30% discovery - 70%)
  - Explicit content filter (on/off)
  - Preferred energy range
  - Preferred mood types

**FR-8: Saved Tracks**
- Users MUST be able to save/favorite tracks
- Users MUST be able to view all saved tracks (library)
- Users MUST be able to remove tracks from saved
- Users SHOULD be able to organize saved tracks:
  - Add notes to tracks
  - Add custom tags
  - Search saved tracks
  - Sort by date saved, artist, mood

**FR-9: Listening History**
- System MUST automatically track listening history (when logged in)
- Users MUST be able to view listening history
- Users SHOULD be able to filter history:
  - By date range
  - By mood
  - By artist
  - By liked/disliked
- Users MUST be able to clear history (GDPR compliance)
- History tracks when user played > 50% of preview

**FR-10: Privacy & Data Control**
- Users MUST be able to export all their data (GDPR)
- Users MUST be able to delete their account
- Account deletion MUST remove all user data
- Users SHOULD be able to control:
  - History tracking (on/off)
  - Recommendation personalization (on/off)
  - Email notifications (on/off)

### Non-Functional Requirements

#### ADDED:

**NFR-1: Security**
- Passwords hashed with bcrypt (handled by Supabase)
- JWT tokens for authentication
- HTTP-only cookies for session
- HTTPS only (enforced)
- Rate limiting on auth endpoints (prevent brute force)
- Email verification before sensitive actions

**NFR-2: Performance**
- Login/signup response time < 1s
- Profile update response time < 500ms
- Saved tracks load time < 1s
- Listening history load time < 2s (paginated)

**NFR-3: Privacy**
- Passwords never stored in plain text
- User data encrypted at rest (Supabase default)
- No selling of user data
- Clear privacy policy
- Opt-in for email communications

**NFR-4: Scalability**
- Support 50,000 users (Supabase free tier)
- Efficient database queries (indexed)
- Paginated history/saved tracks (50 per page)

**NFR-5: Reliability**
- 99.9% authentication uptime
- Graceful degradation (if Supabase Auth down, allow anonymous)
- Automatic retry on failed auth

---

## User Scenarios

### ADDED:

### Scenario 1: New User Starts Anonymous

**As a** first-time visitor
**I want to** explore the app without creating an account
**So that** I can try it before committing

**Steps**:
1. User lands on homepage
2. User selects mood and gets recommendations
3. User plays a few tracks
4. User enjoys the experience
5. After 3-5 tracks, subtle prompt appears: "Create account to save your favorites"
6. User can dismiss or click "Sign Up"
7. If user leaves, all data is lost (localStorage only)

**Expected Outcome**:
- No friction to start
- User experiences core value immediately
- Gentle nudge to create account
- No forced registration

---

### Scenario 2: User Creates Account After Exploring

**As an** anonymous user who wants to save a track
**I want to** create an account quickly
**So that** I can save my favorites without losing context

**Steps**:
1. User (anonymous) finds a track they love
2. User clicks "Save" heart icon
3. Modal appears: "Create account to save tracks"
4. User clicks "Sign Up"
5. Signup form appears (email, password)
6. User enters credentials
7. Account created instantly
8. Session data (current mood, queue) migrates to account
9. Track is now saved to user's library
10. User continues listening seamlessly

**Expected Outcome**:
- Minimal interruption
- Quick signup process (< 30s)
- Data migration feels automatic
- Track is saved

---

### Scenario 3: Returning User Logs In

**As a** returning user
**I want to** log back in easily
**So that** I can access my saved tracks and preferences

**Steps**:
1. User visits app (not logged in)
2. User clicks "Log In" button in header
3. Login modal appears
4. User enters email and password
5. User clicks "Log In"
6. Authentication successful (< 1s)
7. User redirected to /discover
8. User's favorite genres auto-populate recommendations
9. User sees saved tracks count in header

**Expected Outcome**:
- Fast login (< 1s)
- Seamless experience
- Personalization kicks in immediately

---

### Scenario 4: User Manages Preferences

**As a** logged-in user
**I want to** set my music preferences
**So that** recommendations improve

**Steps**:
1. User goes to Settings/Profile page
2. User sees "Music Preferences" section
3. User selects favorite genres:
   - Clicks "Pop", "Indie", "Electronic" (multi-select)
4. User adjusts "Discovery" slider to 40%
5. User toggles "Explicit Content" OFF
6. User clicks "Save Preferences"
7. Toast: "Preferences saved"
8. Next recommendations reflect new preferences

**Expected Outcome**:
- Easy to understand UI
- Immediate feedback
- Preferences actually improve recommendations

---

### Scenario 5: User Views Listening History

**As a** user curious about my patterns
**I want to** see what I've listened to recently
**So that** I can rediscover tracks or understand my moods

**Steps**:
1. User goes to Library > History
2. User sees list of recently played tracks:
   - Today: 12 tracks
   - Yesterday: 8 tracks
   - This Week: 56 tracks
3. User filters by "Happy Mood" 😊
4. List shows only happy mood listens
5. User clicks on a track from history
6. Track plays in player
7. User can add to saved if not already saved

**Expected Outcome**:
- Clear chronological view
- Useful filters
- Can replay or save from history

---

### Scenario 6: User Exports Data (GDPR)

**As a** privacy-conscious user
**I want to** export all my data
**So that** I have a copy and feel in control

**Steps**:
1. User goes to Settings > Privacy & Data
2. User sees "Export Your Data" button
3. User clicks button
4. System generates JSON file with:
   - Profile data
   - Saved tracks
   - Listening history
   - Preferences
5. Download starts (vibe-song-data.json)
6. User receives email confirmation

**Expected Outcome**:
- Data export works
- User feels in control
- Complies with GDPR

---

### Scenario 7: User Deletes Account

**As a** user who wants to leave
**I want to** delete my account and all data
**So that** my privacy is protected

**Steps**:
1. User goes to Settings > Privacy & Data
2. User sees "Delete Account" (red button)
3. User clicks button
4. Warning modal: "This is permanent. All data will be deleted."
5. User must type "DELETE" to confirm
6. User confirms
7. Account and all data deleted from Supabase
8. User logged out
9. Redirect to homepage

**Expected Outcome**:
- Clear warning
- Confirmation required
- Complete data deletion
- No orphaned data

---

## Success Criteria

### ADDED:

1. **Anonymous to Authenticated Conversion**: 30% of anonymous users create accounts within 7 days

2. **Account Creation**: 90% of signup attempts succeed (no technical errors)

3. **Login Success**: 95% of login attempts succeed (correct credentials)

4. **Personalization Impact**: Logged-in users report 20% higher satisfaction than anonymous

5. **Saved Tracks**: 60% of logged-in users save at least one track

6. **History Usage**: 25% of users view their listening history at least once

7. **Privacy Compliance**: 100% of data export and deletion requests fulfilled within 24 hours

---

## Out of Scope

### ADDED:

- Social login (Twitter, Facebook, Apple)
- Multi-factor authentication (2FA)
- Biometric login
- Account linking (merge multiple accounts)
- Family accounts / shared accounts
- Public profiles
- Follow other users
- Sharing playlists
- Privacy levels (public/private profile)

---

## Dependencies

### ADDED:

1. **Supabase Auth**: Core authentication service
2. **Supabase Database**: User profiles, preferences, saved tracks, history
3. **Supabase Storage**: Avatar uploads
4. **Email Service**: Supabase email (signup verification, password reset)
5. **State Management**: Zustand for auth state
6. **Forms**: React Hook Form + Zod validation

---

## Technical Considerations

### ADDED:

**Authentication Flow (Supabase)**:
```typescript
// Sign up
const { data, error } = await supabase.auth.signUp({
  email: email,
  password: password,
  options: {
    data: {
      display_name: displayName
    }
  }
})

// Log in
const { data, error } = await supabase.auth.signInWithPassword({
  email: email,
  password: password
})

// Log out
await supabase.auth.signOut()

// Get session
const { data: { session } } = await supabase.auth.getSession()

// OAuth (Google)
await supabase.auth.signInWithOAuth({
  provider: 'google'
})
```

**Auth State Management (Zustand)**:
```typescript
interface AuthState {
  user: User | null
  session: Session | null
  isLoading: boolean
  isAuthenticated: boolean

  signUp: (email: string, password: string) => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  updateProfile: (updates: ProfileUpdates) => Promise<void>
}
```

**Protected Routes**:
```typescript
// Middleware to protect routes
export function withAuth(Component) {
  return function AuthComponent(props) {
    const { isAuthenticated, isLoading } = useAuthStore()

    if (isLoading) return <LoadingSpinner />
    if (!isAuthenticated) redirect('/login')

    return <Component {...props} />
  }
}
```

**Anonymous Data Migration**:
```typescript
async function migrateAnonymousData(userId: string) {
  const localData = localStorage.getItem('vibe_session')
  if (!localData) return

  const { savedTracks, moodHistory } = JSON.parse(localData)

  // Migrate to Supabase
  await supabase.from('saved_tracks').insert(
    savedTracks.map(track => ({ user_id: userId, ...track }))
  )

  // Clear localStorage
  localStorage.removeItem('vibe_session')
}
```

**Row Level Security (RLS)**:
```sql
-- Users can only see their own data
CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- Similar policies for saved_tracks, listening_history, etc.
```

---

## Open Questions

### ADDED:

1. **Email Verification**: Require immediately or allow grace period?
   - **Recommendation**: Allow grace period (7 days), then prompt

2. **Social Login Priority**: Google first or multiple at once?
   - **Recommendation**: Google only for MVP, others in Phase 2

3. **Avatar Upload vs. URL**: Allow upload or just use Gravatar?
   - **Recommendation**: Both - upload for customization, Gravatar as fallback

4. **Listening History Privacy**: Default on or off?
   - **Recommendation**: Default ON, allow opt-out in settings

5. **Display Name**: Required or optional?
   - **Recommendation**: Optional, default to email username

6. **Anonymous Session Duration**: How long to keep localStorage data?
   - **Recommendation**: Clear on browser close (session storage)

---

## UI/UX Design Requirements

### ADDED:

**Signup/Login Modal**:
- Clean, minimal design
- Tabs: "Log In" | "Sign Up"
- Social login buttons at top
- Email/password form below
- "Forgot password?" link
- "Terms of Service" and "Privacy Policy" links

**Profile Page Sections**:
1. Account Information (email, display name, avatar)
2. Music Preferences (genres, discovery slider, explicit content)
3. Privacy & Data (history tracking, export data, delete account)
4. Notifications (email preferences)

**Library Page Tabs**:
- Saved Tracks
- Listening History
- Mood Sessions (optional)

**Settings Icon Locations**:
- Header: Avatar dropdown → Settings
- Mobile: Hamburger menu → Settings

---

## Testing Checklist

### ADDED:

**Unit Tests**:
- [ ] Signup creates user in Supabase
- [ ] Login sets session correctly
- [ ] Logout clears session
- [ ] Password validation works
- [ ] Email validation works
- [ ] Profile update saves to database

**Integration Tests**:
- [ ] Auth state syncs with Supabase
- [ ] Protected routes redirect when not authenticated
- [ ] Anonymous data migrates on signup
- [ ] Saved tracks persist after logout/login
- [ ] Preferences affect recommendations

**E2E Tests**:
- [ ] Complete signup flow works
- [ ] Complete login flow works
- [ ] Password reset flow works
- [ ] Profile update flow works
- [ ] Save track → view library → track appears
- [ ] Data export works
- [ ] Account deletion works

**Security Tests**:
- [ ] Passwords not exposed in network requests
- [ ] RLS policies prevent unauthorized access
- [ ] Rate limiting prevents brute force
- [ ] XSS prevention in profile fields

---

## Implementation Priority

### Phase 1 (MVP - Must Have):
1. ✅ Anonymous usage
2. ✅ Email/password signup
3. ✅ Email/password login
4. ✅ Logout
5. ✅ Basic profile (display name, avatar)
6. ✅ Saved tracks
7. ✅ Listening history
8. ✅ Basic preferences (favorite genres)

### Phase 2 (Post-MVP - Should Have):
- Google OAuth
- Password reset
- Email verification
- Advanced preferences (discovery slider, etc.)
- Data export
- Account deletion
- Listening history filters
- Saved tracks organization

### Phase 3 (Future - Nice to Have):
- GitHub OAuth
- Magic link login
- Multi-factor authentication
- Public profiles
- Social features

---

## Privacy & Compliance

### ADDED:

**GDPR Compliance**:
- [ ] Privacy policy page
- [ ] Terms of service page
- [ ] Cookie consent (if using cookies beyond auth)
- [ ] Data export functionality
- [ ] Right to be forgotten (account deletion)
- [ ] Data retention policy documented
- [ ] User consent tracking

**Data Handling**:
- User passwords: Hashed (Supabase Auth handles)
- User emails: Encrypted at rest
- Listening history: User can opt-out
- Saved tracks: User data, can be deleted
- Analytics: Anonymized, no PII

---

## Analytics & Metrics

### ADDED:

**Authentication Metrics**:
- Signup conversion rate
- Login success rate
- Password reset requests
- Email verification rate
- OAuth vs. email/password ratio

**Engagement Metrics**:
- Saved tracks per user (average, median)
- Listening history entries per user
- Profile completion rate
- Preferences customization rate

**Privacy Metrics**:
- Data export requests
- Account deletion requests
- History opt-out rate

---

## Related Documents

- [Music Recommendation Engine](./music-recommendation-engine.md) - Uses preferences
- [Audio Player](./audio-player.md) - Tracks listening history
- [Data Models](../architecture/data-models.md) - User tables
- [Tech Stack](../architecture/tech-stack.md) - Supabase Auth

---

**Status**: Draft - Ready for Review
**Created**: 2025-10-21
**Version**: 1.0
**Next Step**: Review → Approve → Create Technical Plan (`/plan user-preferences`)
