# Feature Specification: Music Recommendation Engine

## Overview

The Music Recommendation Engine is the core intelligence of Vibe-Song, translating user mood input into personalized music recommendations. It combines mood-to-music mapping, external music APIs, and user preference learning to deliver relevant track suggestions.

## User Need

**Problem**: Users want music that matches their mood, but current solutions either:
- Require specific song/artist knowledge (too precise)
- Provide generic playlists (not personalized)
- Don't understand emotional context (algorithmic but not empathetic)

**Solution**: An intelligent recommendation system that:
- Understands mood → music characteristics mapping
- Learns from user listening patterns
- Delivers diverse yet relevant suggestions
- Balances discovery with familiarity

---

## Requirements

### Functional Requirements

#### ADDED:

**FR-1: Mood-to-Music Mapping**
- System MUST translate mood input (emoji + energy + valence) into music search parameters
- Each mood MUST have predefined mappings:
  - Keywords (happy, sad, energetic, etc.)
  - Genre preferences
  - Last.fm tags
  - Energy range
  - Valence range
- Mappings MUST be configurable (not hardcoded)
- System MUST support all 8 mood emojis

**FR-2: Multi-Source Music Search**
- System MUST search Deezer API based on mood parameters
- System SHOULD enrich results with Last.fm tags
- System MUST return minimum 20 track recommendations
- System MUST handle API failures gracefully (fallback strategies)
- System SHOULD cache API responses (5-10 minutes)

**FR-3: Track Filtering**
- System MUST filter explicit content if user preference is set
- System MUST exclude tracks user has recently played (last 7 days)
- System SHOULD prioritize tracks with mood-matching tags
- System MAY apply additional filters:
  - Language preference
  - Release date (newer vs. classics)
  - Popularity threshold

**FR-4: Scoring and Ranking**
- System MUST score each track based on:
  - Mood match (keyword/tag matching)
  - Popularity (Deezer rank)
  - User preference alignment (if logged in)
  - Recency (boost recent releases)
- System MUST rank tracks by final score (descending)
- Top 20 tracks MUST be returned to user

**FR-5: Personalization (Logged-In Users)**
- System SHOULD boost tracks from user's favorite genres
- System SHOULD boost tracks from artists user has listened to
- System SHOULD learn from user feedback (liked/disliked tracks)
- System SHOULD adapt mood preferences over time
- Anonymous users get generic recommendations (no personalization)

**FR-6: Diversity**
- System MUST ensure variety in recommendations:
  - No more than 3 tracks from same artist
  - Mix of popular and less-known tracks (70/30 split)
  - Multiple genres (if mood allows)
- System SHOULD avoid echo chamber (don't only recommend user's favorites)

**FR-7: Recommendation Refresh**
- Users MUST be able to request new recommendations with same mood
- System SHOULD exclude previously shown tracks in refresh
- System MUST maintain mood context across refreshes
- Limit: 5 refreshes per mood session (prevent API abuse)

**FR-8: Similar Track Recommendations**
- Users SHOULD be able to get "more like this" from a specific track
- System MUST use Last.fm similar tracks API
- System MUST combine with mood context
- Return 10-15 similar tracks

### Non-Functional Requirements

#### ADDED:

**NFR-1: Performance**
- Recommendation generation time < 2 seconds (end-to-end)
- Deezer API response time < 800ms
- Last.fm API response time < 500ms
- Database query time < 200ms (user preferences)
- Total API calls < 5 per recommendation request

**NFR-2: Scalability**
- Handle 100 concurrent recommendation requests
- Cache popular mood recommendations (reduce API calls)
- Queue system for high load (future)
- Rate limiting: 10 recommendations per minute per user

**NFR-3: Reliability**
- 99% uptime for recommendation service
- Graceful degradation if Last.fm is down (use Deezer only)
- Fallback to cached recommendations if APIs fail
- Retry logic with exponential backoff

**NFR-4: Data Quality**
- Minimum 80% recommendation relevance (user satisfaction)
- Track metadata must be complete (title, artist, album, preview URL)
- Mood-tag accuracy > 75%
- Filter out broken preview URLs

**NFR-5: Security**
- Rate limiting to prevent abuse
- API key security (environment variables)
- User data privacy (no sharing listening history)
- Sanitize all API inputs

---

## User Scenarios

### ADDED:

### Scenario 1: First-Time User Gets Recommendations

**As a** new user who just selected a mood
**I want to** receive relevant music recommendations quickly
**So that** I can start listening immediately

**Steps**:
1. User selects 😊 Happy mood (energy: 7, valence: 8)
2. User clicks "Find Music"
3. System maps mood to search parameters:
   - Keywords: "happy", "upbeat", "cheerful"
   - Genres: "pop", "dance"
   - Energy range: 6-10, Valence range: 7-10
4. System searches Deezer for 50 potential tracks
5. System enriches top 30 with Last.fm tags
6. System filters tracks (no explicit content by default)
7. System scores and ranks tracks
8. System returns top 20 tracks
9. User sees recommendation grid in < 2 seconds

**Expected Outcome**:
- Fast response time
- Tracks match the happy mood
- Mix of popular and discovery tracks
- User feels recommendations are relevant

---

### Scenario 2: Logged-In User Gets Personalized Recommendations

**As a** returning user with listening history
**I want to** get recommendations that consider my preferences
**So that** I discover music I'll actually like

**Steps**:
1. User (logged in) selects 💭 Thoughtful mood
2. System retrieves user preferences:
   - Favorite genres: indie, alternative, folk
   - Favorite artists: Bon Iver, Fleet Foxes
   - Listened artists: 50+ unique artists
3. System generates base recommendations (thoughtful mood)
4. System applies personalization:
   - Boost indie/alternative/folk tracks (+2 score)
   - Boost Bon Iver, Fleet Foxes (+1.5 score)
   - Slightly boost artists user has listened to before (+0.5 score)
5. System re-ranks with personalized scores
6. Top 20 include mix of user preferences + discovery

**Expected Outcome**:
- Recommendations feel "more me"
- Still includes discovery (not just favorites)
- User satisfaction is higher than anonymous recommendations

---

### Scenario 3: User Refreshes Recommendations

**As a** user who wants more variety
**I want to** get new recommendations for the same mood
**So that** I can explore more options

**Steps**:
1. User sees initial 20 recommendations
2. User likes a few tracks but wants more options
3. User clicks "Show More" or "Refresh"
4. System notes already shown track IDs
5. System re-runs recommendation with:
   - Same mood parameters
   - Exclude previously shown tracks
6. New set of 20 tracks appears
7. User can refresh up to 5 times

**Expected Outcome**:
- No duplicate tracks
- Mood consistency maintained
- User discovers more music
- Limited refreshes prevent API abuse

---

### Scenario 4: User Requests Similar Tracks

**As a** user who loves a specific recommendation
**I want to** find more tracks like this one
**So that** I can explore similar music

**Steps**:
1. User is playing/viewing a track
2. User clicks "Similar" or "More like this"
3. System uses Last.fm getSimilar API with track info
4. System receives 30 similar tracks
5. System filters out tracks without Deezer preview
6. System applies current mood context (light filtering)
7. System returns top 10-15 similar tracks

**Expected Outcome**:
- Tracks are genuinely similar
- Still somewhat aligned with mood
- User discovers new artists/songs

---

### Scenario 5: API Failure Graceful Degradation

**As a** user when Last.fm API is down
**I want to** still receive recommendations
**So that** my experience isn't interrupted

**Steps**:
1. User selects mood and clicks "Find Music"
2. System searches Deezer (succeeds)
3. System tries Last.fm enrichment (fails - timeout)
4. System detects failure and logs warning
5. System falls back to Deezer-only recommendations
6. System scores based on Deezer metadata only
7. User receives recommendations (slightly less refined)
8. No error message shown to user

**Expected Outcome**:
- User unaware of backend issue
- Still gets recommendations (slightly lower quality)
- System logs failure for monitoring

---

## Success Criteria

### ADDED:

1. **Relevance**: 80% of users rate recommendations as "relevant" or "very relevant" to their mood

2. **Performance**: 95% of recommendation requests complete in < 2 seconds

3. **Engagement**: Users listen to at least 3 tracks from recommendations in 60% of sessions

4. **Discovery**: 40% of recommended tracks are new to the user (not in listening history)

5. **Personalization**: Logged-in users report 20% higher satisfaction than anonymous users

6. **Diversity**: Recommendations include average of 5+ unique artists per mood session

7. **Refresh Usage**: 30% of users refresh recommendations at least once

---

## Out of Scope

### ADDED:

- Machine Learning model training (Phase 1 uses rule-based + API recommendations)
- Collaborative filtering ("users like you also enjoyed...")
- Real-time trending analysis
- Multi-user recommendation (group playlists)
- Podcast recommendations
- Video/YouTube integration
- Spotify/Apple Music direct integration (using Deezer only for MVP)
- Advanced audio analysis (tempo, key, etc.) - using Last.fm tags only
- Custom algorithm training per user

---

## Dependencies

### ADDED:

1. **Deezer API**: Primary music source
   - Search endpoint
   - Track details endpoint
   - Genre endpoint

2. **Last.fm API**: Metadata enrichment
   - Track info with tags
   - Similar tracks
   - Top tracks by tag

3. **Supabase Database**:
   - User preferences table
   - Listening history table
   - Cached recommendations (future)

4. **Mood Mapping Config**: JSON/TypeScript configuration file

5. **Mood Input Interface**: Must provide mood data structure

---

## Technical Considerations

### ADDED:

**API Request Flow**:
```
1. Receive mood input
2. Map mood → search parameters
3. Parallel API calls:
   - Deezer search
   - User preferences (if logged in)
4. Get top N results from Deezer
5. Enrich with Last.fm tags (parallel batch)
6. Score and rank
7. Return top 20
```

**Scoring Algorithm**:
```typescript
function scoreTrack(track, mood, userPrefs?) {
  let score = 0

  // Base score from popularity
  score += track.rank / 1000000

  // Mood matching
  const moodTags = MOOD_MAP[mood.emoji].lastfmTags
  const matchingTags = track.tags.filter(tag => moodTags.includes(tag))
  score += matchingTags.length * 0.5

  // Personalization (if logged in)
  if (userPrefs) {
    if (userPrefs.favoriteGenres.includes(track.genre)) score += 2
    if (userPrefs.favoriteArtists.includes(track.artist.id)) score += 1.5
    if (userPrefs.listenedArtists.includes(track.artist.id)) score += 0.5
  }

  // Recency boost
  const age = daysSince(track.releaseDate)
  if (age < 90) score += 0.5

  return score
}
```

**Caching Strategy**:
```typescript
// Cache key structure
const cacheKey = `rec:${mood.emoji}:${energyLevel}:${moodValence}`

// Cache for 5 minutes (generic recommendations)
// No cache for personalized (user-specific)
```

**Error Handling**:
```typescript
try {
  const deezerResults = await searchDeezer(params)
  let enrichedResults = deezerResults

  try {
    enrichedResults = await enrichWithLastfm(deezerResults)
  } catch (lastfmError) {
    // Log error but continue with Deezer-only results
    logger.warn('Last.fm enrichment failed', lastfmError)
  }

  return scoreAndRank(enrichedResults)
} catch (deezerError) {
  // Try cache fallback
  const cached = await getCachedRecommendations(cacheKey)
  if (cached) return cached

  throw new Error('Unable to generate recommendations')
}
```

---

## Open Questions

### ADDED:

1. **Cache Duration**: How long should we cache mood recommendations?
   - **Recommendation**: 5 minutes for generic, no cache for personalized

2. **Diversity vs. Relevance**: What's the right balance?
   - **Recommendation**: 70% high-relevance, 30% discovery

3. **Explicit Content**: Default filter on or off?
   - **Recommendation**: Default OFF (show explicit), let users toggle in settings

4. **Mood Mixing**: Should we ever blend two moods?
   - **Recommendation**: Not for MVP, single mood only

5. **Feedback Loop**: How do we learn from user feedback?
   - **Recommendation**: Track likes/dislikes, adjust in Phase 2

6. **Cold Start**: What do we recommend for brand new users with no history?
   - **Recommendation**: Generic mood-based recommendations (work fine)

---

## API Integration Details

### ADDED:

**Deezer API**:
```typescript
// Search by mood keywords
GET /search?q=${keywords}&limit=50

// Get track details
GET /track/${trackId}

// Search by genre
GET /genre/${genreId}/artists
```

**Last.fm API**:
```typescript
// Get track tags
GET /?method=track.getInfo
  &api_key=${key}
  &artist=${artist}
  &track=${track}

// Get similar tracks
GET /?method=track.getSimilar
  &api_key=${key}
  &artist=${artist}
  &track=${track}
  &limit=30

// Get top tracks by tag
GET /?method=tag.getTopTracks
  &api_key=${key}
  &tag=${tag}
  &limit=20
```

---

## Testing Checklist

### ADDED:

**Unit Tests**:
- [ ] Mood mapping returns correct parameters
- [ ] Scoring algorithm calculates correctly
- [ ] Filtering removes excluded tracks
- [ ] Ranking orders by score descending
- [ ] Personalization boosts correct tracks

**Integration Tests**:
- [ ] Deezer API search returns results
- [ ] Last.fm API enrichment works
- [ ] Database queries fetch user preferences correctly
- [ ] Cache stores and retrieves recommendations

**E2E Tests**:
- [ ] Full flow: Mood input → API calls → Recommendations displayed
- [ ] Refresh recommendations works
- [ ] Similar tracks works
- [ ] Logged-in personalization works
- [ ] Anonymous recommendations work

**Error Handling Tests**:
- [ ] Deezer API failure handled gracefully
- [ ] Last.fm API failure doesn't break flow
- [ ] Database connection failure handled
- [ ] Invalid mood input rejected
- [ ] Rate limiting works

**Performance Tests**:
- [ ] Recommendation generation < 2s (p95)
- [ ] Handles 100 concurrent requests
- [ ] Cache hit rate > 40% (generic moods)
- [ ] API call count < 5 per request

---

## Monitoring & Metrics

### ADDED:

**Performance Metrics**:
- Recommendation generation time (p50, p95, p99)
- Deezer API response time
- Last.fm API response time
- Database query time
- Cache hit rate

**Quality Metrics**:
- User satisfaction rating (1-5 stars)
- Track click-through rate
- Average tracks listened per session
- Refresh frequency

**Usage Metrics**:
- Most requested moods
- Personalized vs. anonymous ratio
- Similar track usage
- API error rate

**Business Metrics**:
- Daily active users using recommendations
- Recommendation-to-listen conversion rate
- User retention (7-day, 30-day)

---

## Implementation Priority

### Phase 1 (MVP - Must Have):
1. ✅ Mood-to-music mapping (8 moods)
2. ✅ Deezer API integration
3. ✅ Basic scoring and ranking
4. ✅ Return top 20 recommendations
5. ✅ Error handling and fallbacks
6. ✅ Basic filtering (explicit content)

### Phase 2 (Post-MVP - Should Have):
- Last.fm tag enrichment
- User personalization (logged-in)
- Refresh recommendations
- Similar tracks feature
- Caching layer
- Advanced filtering

### Phase 3 (Future - Nice to Have):
- Machine Learning model
- Collaborative filtering
- Real-time trending
- Advanced audio analysis
- Multi-source music APIs

---

## Related Documents

- [Mood Input Interface](./mood-input-interface.md)
- [Data Models](../architecture/data-models.md) - Mood mapping, user preferences
- [System Design](../architecture/system-design.md) - Recommendation engine architecture
- [Tech Stack](../architecture/tech-stack.md) - API integration details

---

**Status**: Draft - Ready for Review
**Created**: 2025-10-21
**Version**: 1.0
**Next Step**: Review → Approve → Create Technical Plan (`/plan music-recommendation-engine`)
