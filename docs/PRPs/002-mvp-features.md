# Product Requirements Prompt: MVP Features Summary

## Document Information
- **Created**: 2025-10-21
- **Status**: Approved
- **Version**: 1.0

---

## Overview

This document summarizes the MVP (Minimum Viable Product) features for Vibe-Song. Each feature has a detailed specification in `openspec/changes/`.

---

## MVP Feature List

### Core Features (Must Have)

1. **Mood Input Interface** - [Spec](../../openspec/changes/mood-input-interface.md)
2. **Music Recommendation Engine** - [Spec](../../openspec/changes/music-recommendation-engine.md)
3. **Audio Player** - [Spec](../../openspec/changes/audio-player.md)
4. **User Preferences & Authentication** - [Spec](../../openspec/changes/user-preferences.md)

---

## 1. Mood Input Interface

### Purpose
Enable users to express their current emotional state and energy level to drive music recommendations.

### Key Capabilities
- 8 emoji mood selections (😊 😢 😌 🔥 💭 😴 💪 🎉)
- Energy level slider (1-10)
- Mood valence slider (1-10)
- "Find Music" action button
- Mood history (logged-in users)

### User Value
Users can quickly express what they're feeling without having to think about specific songs, artists, or genres.

### Success Metric
90% of first-time users can select mood and generate recommendations within 30 seconds.

### Dependencies
- None (entry point feature)

---

## 2. Music Recommendation Engine

### Purpose
Translate user mood input into personalized, relevant music recommendations using external APIs and user data.

### Key Capabilities
- Mood-to-music mapping (keywords, genres, tags)
- Multi-source search (Deezer + Last.fm)
- Track scoring and ranking
- Personalization (for logged-in users)
- Diversity assurance (no echo chamber)
- Recommendation refresh

### User Value
Users discover music that matches their mood without manual searching, with improving personalization over time.

### Success Metric
80% of users rate recommendations as "relevant" or "very relevant" to their mood.

### Dependencies
- Mood Input Interface (provides mood data)
- Deezer API
- Last.fm API
- Supabase (for personalization)

---

## 3. Audio Player

### Purpose
Enable users to instantly preview recommended tracks without leaving the app or creating external accounts.

### Key Capabilities
- Play/pause controls
- Next/previous track navigation
- Progress bar with seek
- Volume control with mute
- Now playing display (artwork, title, artist)
- Auto-advance to next track
- Queue management
- Persistent player bar

### User Value
Users can quickly sample tracks (30s previews) to decide what they like, creating a seamless discovery experience.

### Success Metric
Users listen to average of 5+ tracks per session.

### Dependencies
- Recommendation Engine (provides track queue)
- Deezer API (preview URLs)

---

## 4. User Preferences & Authentication

### Purpose
Enable personalization and data persistence across sessions while maintaining privacy and user control.

### Key Capabilities
- Anonymous usage (no account needed to start)
- Email/password authentication
- User profile (display name, avatar)
- Favorite genres selection
- Saved/favorited tracks
- Listening history tracking
- Privacy controls (export data, delete account)

### User Value
Users can save their favorites, preferences improve recommendations, and they feel in control of their data.

### Success Metric
30% of anonymous users create accounts within 7 days.

### Dependencies
- Supabase Auth
- Supabase Database
- Audio Player (triggers listening history)
- Recommendation Engine (uses preferences)

---

## Feature Relationships

```
┌─────────────────────┐
│  Mood Input         │
│  Interface          │
└──────────┬──────────┘
           │
           ↓
┌─────────────────────┐
│  Recommendation     │◄─────── User Preferences
│  Engine             │         (personalization)
└──────────┬──────────┘
           │
           ↓
┌─────────────────────┐
│  Audio Player       │────────► Listening History
│  (Queue)            │          (tracking)
└─────────────────────┘
```

---

## User Journey (Complete MVP Flow)

### First-Time User (Anonymous)

```
1. Land on homepage
   ↓
2. See "Discover Music" CTA
   ↓
3. Click → Go to /discover
   ↓
4. Select mood (e.g., 😊 Happy)
   ↓
5. Optionally adjust sliders
   ↓
6. Click "Find Music"
   ↓
7. View 20 recommendations (< 2s)
   ↓
8. Click first track → Plays preview
   ↓
9. Enjoy music, skip through queue
   ↓
10. See "Create account to save" prompt
   ↓
11. Continue exploring or sign up
```

### Returning User (Authenticated)

```
1. Land on homepage
   ↓
2. Auto-login (session persists)
   ↓
3. Go to /discover
   ↓
4. See previous mood in history
   ↓
5. Click mood or select new one
   ↓
6. Get personalized recommendations
   ↓
7. Play tracks, save favorites (heart icon)
   ↓
8. View library (/library) to see saved tracks
   ↓
9. Review listening history
   ↓
10. Adjust preferences for better recommendations
```

---

## MVP Scope

### Phase 1 Priorities (Must Have for Launch)

**Mood Input**:
- ✅ Emoji selector
- ✅ Two sliders (energy, valence)
- ✅ Find Music button
- ✅ Responsive design

**Recommendations**:
- ✅ Mood mapping
- ✅ Deezer search
- ✅ Basic scoring
- ✅ Return 20 tracks
- ✅ Error handling

**Audio Player**:
- ✅ Play/pause/next/previous
- ✅ Progress bar
- ✅ Volume control
- ✅ Now playing display
- ✅ Auto-advance
- ✅ Persistent player bar

**User/Auth**:
- ✅ Anonymous usage
- ✅ Email/password auth
- ✅ Basic profile
- ✅ Saved tracks
- ✅ Listening history

---

### Phase 2 Enhancements (Post-MVP)

**Mood Input**:
- Mood history
- Context selector (time, activity)
- Quick re-selection
- Animations

**Recommendations**:
- Last.fm enrichment
- Full personalization
- Refresh recommendations
- Similar tracks
- Caching

**Audio Player**:
- Seek functionality
- Queue display
- Keyboard shortcuts
- Repeat modes
- Mobile expanded player

**User/Auth**:
- Google OAuth
- Password reset
- Email verification
- Advanced preferences
- Data export/deletion

---

### Out of Scope (Future)

- Full-length playback (requires Spotify/Deezer Premium integration)
- Machine Learning recommendation model
- Social features (sharing, following, collaborative playlists)
- Playlist creation and management
- Mobile native apps
- Offline playback
- Podcast recommendations
- Lyrics display
- Desktop app

---

## Technical Implementation Plan

### Development Sequence

**Week 1-2: Foundation**
- ✅ Project setup (Next.js + Supabase)
- ✅ Database schema implementation
- ✅ Authentication setup
- ✅ Basic UI scaffolding (layout, routing)

**Week 3-4: Core Features**
- Mood Input Interface
  - UI components
  - State management
  - Integration with recommendation API
- Recommendation Engine
  - Deezer API integration
  - Mood mapping logic
  - Scoring algorithm
  - API routes

**Week 5-6: Player & Persistence**
- Audio Player
  - Audio element control
  - Player UI components
  - Queue management
  - State persistence
- User Preferences
  - Profile UI
  - Saved tracks
  - Listening history
  - Preferences storage

**Week 7: Integration & Testing**
- E2E testing
- Bug fixes
- Performance optimization
- Mobile responsiveness

**Week 8: Polish & Launch Prep**
- UI/UX refinements
- Error handling improvements
- Documentation
- Deployment setup

---

## Success Criteria (MVP Launch)

### Functionality
- [ ] All 4 core features implemented
- [ ] Anonymous and authenticated flows work
- [ ] Mobile responsive
- [ ] Works in all modern browsers

### Performance
- [ ] Page load < 2s
- [ ] Recommendation generation < 2s
- [ ] Audio playback < 500ms

### Quality
- [ ] No critical bugs
- [ ] 80%+ recommendation relevance
- [ ] 90%+ playback reliability

### User Experience
- [ ] Clear, intuitive UI
- [ ] Helpful error messages
- [ ] Smooth animations
- [ ] Accessible (keyboard navigation, screen reader)

---

## Metrics to Track (Post-Launch)

### Engagement
- Daily active users (DAU)
- Average session duration
- Tracks played per session
- Return rate (7-day, 30-day)

### Feature Usage
- Mood selections (distribution)
- Slider adjustments (frequency)
- Recommendation acceptance rate
- Track saves per user
- History views

### Performance
- Page load times (p50, p95)
- Recommendation generation time
- Audio load time
- Error rates

### Growth
- New signups per day
- Anonymous to authenticated conversion
- User retention curve
- Referral source attribution

---

## Risk Mitigation

### Technical Risks

**Risk**: Deezer API downtime or rate limiting
- **Mitigation**: Fallback to cache, graceful error messages, monitor API status

**Risk**: Slow recommendation generation
- **Mitigation**: Parallel API calls, caching, pagination if needed

**Risk**: Audio playback issues in certain browsers
- **Mitigation**: Extensive browser testing, fallback player, clear error messages

### User Experience Risks

**Risk**: Users find recommendations irrelevant
- **Mitigation**: Iterate on mood mapping, collect feedback, A/B test algorithms

**Risk**: Users confused by mood selection
- **Mitigation**: Clear instructions, tooltips, examples, user testing

**Risk**: Anonymous users don't convert to accounts
- **Mitigation**: Show clear value of account, non-intrusive prompts, easy signup

---

## Post-MVP Roadmap

### Phase 2 (Months 2-3)
- Enhanced personalization (ML model)
- Last.fm integration
- Social features (sharing)
- Playlist creation

### Phase 3 (Months 4-6)
- Spotify/Apple Music integration (full playback)
- Mobile apps (React Native)
- Advanced analytics dashboard
- Mood journaling

### Phase 4 (Months 7-12)
- Collaborative playlists
- AI chat interface
- Voice mood input
- Podcast recommendations

---

## Open Questions

1. **Pricing Model**: Will MVP stay free? Freemium model later?
   - **For discussion**: Keep MVP 100% free, consider premium features in Phase 2

2. **Music Licensing**: Are Deezer previews sufficient long-term?
   - **For discussion**: Yes for MVP, full integration in Phase 2

3. **Target Audience**: Who are we optimizing for?
   - **For discussion**: Music enthusiasts aged 18-35, mood-aware listeners

4. **Growth Strategy**: Organic or paid acquisition?
   - **For discussion**: Organic initially (SEO, social), evaluate paid in Phase 2

---

## Related Documents

### Specifications
- [Mood Input Interface](../../openspec/changes/mood-input-interface.md)
- [Music Recommendation Engine](../../openspec/changes/music-recommendation-engine.md)
- [Audio Player](../../openspec/changes/audio-player.md)
- [User Preferences](../../openspec/changes/user-preferences.md)

### Architecture
- [Tech Stack](../architecture/tech-stack.md)
- [System Design](../architecture/system-design.md)
- [Data Models](../architecture/data-models.md)

### Planning
- [Initial Vision](./001-initial-vision.md)
- [Development Workflow](../guides/development-workflow.md)

---

**Next Steps**:
1. ✅ Specifications complete
2. **Next**: Create technical plans for each feature (`/plan`)
3. **Next**: Set up development environment
4. **Next**: Begin implementation

**Last Updated**: 2025-10-21
**Version**: 1.0
