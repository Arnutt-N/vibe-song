# Feature Specification: Audio Player

## Overview

The Audio Player is the core playback component of Vibe-Song, enabling users to listen to music recommendations. For MVP, it plays 30-second preview clips from Deezer, with controls for play/pause, seek, volume, and queue management.

## User Need

**Problem**: Users want to quickly sample recommended tracks to decide what they like, without leaving the app or creating external accounts.

**Solution**: An integrated audio player that:
- Plays 30-second previews instantly
- Provides standard playback controls
- Manages a queue of recommendations
- Tracks listening activity for personalization

---

## Requirements

### Functional Requirements

#### ADDED:

**FR-1: Basic Playback Controls**
- Users MUST be able to play a track by clicking on it
- Users MUST be able to pause/resume playback
- Users MUST be able to skip to next track in queue
- Users MUST be able to skip to previous track in queue
- Users MUST see visual feedback of playing state
- Playback MUST auto-pause when switching tracks

**FR-2: Progress and Seeking**
- Users MUST see current playback time and total duration
- Users MUST see a visual progress bar
- Users SHOULD be able to seek to any point in the preview
- Progress bar MUST update in real-time (smooth animation)
- Remaining time SHOULD be displayed

**FR-3: Volume Control**
- Users MUST be able to adjust volume (0-100%)
- Users MUST be able to mute/unmute audio
- Volume level MUST persist across tracks
- Volume control SHOULD be visually intuitive (slider)
- Keyboard shortcuts (↑/↓ arrows) SHOULD control volume

**FR-4: Queue Management**
- Recommendations MUST automatically form a queue
- Users MUST see the current queue
- Users SHOULD be able to see what's playing next
- Users MAY be able to reorder queue items (drag-and-drop)
- Users MAY be able to remove tracks from queue
- Queue SHOULD persist during session

**FR-5: Now Playing Display**
- Users MUST see currently playing track information:
  - Track title
  - Artist name
  - Album name
  - Album artwork
- Display MUST be visible at all times (persistent player bar)
- Display SHOULD show large artwork when expanded

**FR-6: Auto-Play and Auto-Advance**
- When preview ends (30s), player MUST auto-advance to next track
- Users SHOULD be able to toggle auto-advance on/off
- When queue ends, player SHOULD stop (not loop by default)
- Users MAY enable queue repeat

**FR-7: Keyboard Shortcuts**
- Space bar: Play/Pause
- Arrow Right: Next track
- Arrow Left: Previous track
- Arrow Up: Volume up
- Arrow Down: Volume down
- M: Mute/Unmute
- Shortcuts MUST be documented (help tooltip)

**FR-8: Player Persistence**
- Player MUST remain visible while navigating app
- Player state (playing, volume, queue) MUST persist across page navigation
- Player position MUST persist if user navigates away and returns
- Closing player SHOULD clear queue

**FR-9: Track Actions**
- Users SHOULD be able to save/favorite a track
- Users SHOULD be able to get "similar tracks" from player
- Users MAY be able to share track (future)
- Actions SHOULD be accessible from player UI

**FR-10: Preview Limitation Indicator**
- Users MUST know they're hearing a preview (not full track)
- UI SHOULD indicate "30s preview"
- UI MAY suggest full playback options (Spotify, Deezer app)

### Non-Functional Requirements

#### ADDED:

**NFR-1: Performance**
- Audio load time < 500ms
- Playback start latency < 200ms after click
- Smooth progress bar animation (60fps)
- No stuttering or buffering (30s preview is small)

**NFR-2: Responsiveness**
- Player works on mobile, tablet, desktop
- Mobile: Compact player bar with expandable full screen
- Desktop: Persistent bottom bar
- Touch-friendly controls (44x44px minimum)

**NFR-3: Browser Compatibility**
- Works in all modern browsers (Chrome, Firefox, Safari, Edge)
- Uses HTML5 Audio API
- No Flash or proprietary plugins required

**NFR-4: Accessibility**
- Keyboard navigation support
- Screen reader compatible (ARIA labels)
- High contrast mode support
- Visual focus indicators

**NFR-5: Audio Quality**
- Preview quality: As provided by Deezer (typically 128kbps)
- No audio processing/modification
- Volume normalization (prevent sudden loud tracks)

---

## User Scenarios

### ADDED:

### Scenario 1: First Track Playback

**As a** user who just received recommendations
**I want to** start listening to the first track
**So that** I can sample the music quickly

**Steps**:
1. User sees 20 track recommendations in a grid
2. User clicks on first track card
3. Player bar appears at bottom of screen
4. Track artwork, title, artist display
5. 30s preview starts playing immediately
6. Progress bar shows playback progress
7. Play button changes to Pause button
8. After 30s, next track auto-plays

**Expected Outcome**:
- Instant playback (< 500ms load)
- Clear visual feedback
- User knows what's playing
- Smooth auto-advance

---

### Scenario 2: Queue Navigation

**As a** user listening to recommendations
**I want to** skip tracks I don't like
**So that** I can find music faster

**Steps**:
1. Track 3 is currently playing
2. User doesn't like it after 5 seconds
3. User clicks "Next" button (or presses →)
4. Current track fades out
5. Track 4 starts playing immediately
6. Progress bar resets to 0
7. Now Playing updates to Track 4 info

**Expected Outcome**:
- Instant skip (< 200ms)
- No awkward silence
- Queue advances correctly

---

### Scenario 3: Volume Adjustment

**As a** user in a quiet environment
**I want to** lower the volume
**So that** I don't disturb others

**Steps**:
1. Track is playing at default volume (70%)
2. User hovers over volume icon
3. Volume slider appears
4. User drags slider to 30%
5. Audio volume adjusts in real-time
6. Volume level persists to next track
7. User can mute with one click on icon

**Expected Outcome**:
- Smooth volume transition
- Volume persists
- Easy mute toggle

---

### Scenario 4: Mobile Expandable Player

**As a** mobile user
**I want to** see full player controls
**So that** I can manage playback easily

**Steps**:
1. User is on mobile device
2. Compact player bar shows at bottom (track info + play/pause)
3. User swipes up on player bar
4. Player expands to full screen
5. Shows large artwork, full controls, queue
6. User can control all playback features
7. User swipes down to minimize

**Expected Outcome**:
- Smooth expansion animation
- All controls accessible
- Easy to dismiss

---

### Scenario 5: Keyboard Control Power User

**As a** desktop power user
**I want to** control playback with keyboard
**So that** I can listen without using mouse

**Steps**:
1. User is browsing recommendations
2. User presses Space to play first track
3. User presses → to skip tracks quickly
4. User presses ↑ to increase volume
5. User presses M to mute during phone call
6. All controls respond instantly

**Expected Outcome**:
- All keyboard shortcuts work
- No conflicts with page navigation
- Fast, efficient control

---

### Scenario 6: Save Favorite Track

**As a** user who loves a track
**I want to** save it to my library
**So that** I can find it later

**Steps**:
1. Track is playing in player
2. User clicks heart/save icon in player
3. Icon fills with color (visual feedback)
4. Track saved to user's library (Supabase)
5. Toast notification: "Track saved"
6. User can access saved tracks from library page

**Expected Outcome**:
- Instant visual feedback
- Track persisted in database
- User feels confident it's saved

---

## Success Criteria

### ADDED:

1. **Playback Reliability**: 99% of tracks play successfully without errors

2. **Performance**: Average load time < 500ms, playback start < 200ms

3. **Engagement**: Users listen to average 5+ tracks per session

4. **Control Usage**: 40% of users use skip/next controls

5. **Volume**: 20% of users adjust volume from default

6. **Queue Completion**: 30% of users listen to at least 10 tracks in queue

7. **Mobile**: Player works flawlessly on mobile (verified in testing)

---

## Out of Scope

### ADDED:

- Full-length track playback (requires Spotify/Deezer integration)
- Offline playback
- Download capability
- Equalizer/audio effects
- Lyrics display
- Crossfade between tracks
- Gapless playback
- Visualizers/spectrum analyzer
- AirPlay/Chromecast support
- Background playback in mobile browsers (PWA feature)
- Playlist creation from player (separate feature)

---

## Dependencies

### ADDED:

1. **Deezer API**: Preview URLs for tracks
2. **Browser Audio API**: HTML5 `<audio>` element
3. **State Management**: Zustand for player state
4. **UI Components**: shadcn/ui (Slider, Button)
5. **Icons**: Play, Pause, Next, Previous, Volume, Heart icons
6. **Recommendation Engine**: Provides track queue
7. **Supabase**: Save favorites, track listening history

---

## Technical Considerations

### ADDED:

**Player State Structure**:
```typescript
interface PlayerState {
  // Current playback
  currentTrack: DeezerTrack | null
  isPlaying: boolean
  currentTime: number // seconds
  duration: number // seconds (30s for previews)
  volume: number // 0-100
  isMuted: boolean

  // Queue
  queue: DeezerTrack[]
  queueIndex: number // current track in queue

  // Settings
  autoAdvance: boolean
  repeat: 'none' | 'one' | 'all'

  // Actions
  play: () => void
  pause: () => void
  togglePlay: () => void
  next: () => void
  previous: () => void
  seek: (time: number) => void
  setVolume: (volume: number) => void
  toggleMute: () => void
  addToQueue: (track: DeezerTrack) => void
  removeFromQueue: (index: number) => void
  setQueue: (tracks: DeezerTrack[]) => void
  saveTrack: () => void
}
```

**Component Structure**:
```
AudioPlayer
├── PlayerBar (persistent bottom bar)
│   ├── NowPlayingDisplay
│   │   ├── TrackArtwork (thumbnail)
│   │   ├── TrackInfo (title, artist)
│   │   └── TrackActions (save, similar)
│   ├── PlaybackControls
│   │   ├── PreviousButton
│   │   ├── PlayPauseButton
│   │   └── NextButton
│   ├── ProgressBar
│   │   ├── CurrentTime
│   │   ├── Seeker (slider)
│   │   └── Duration
│   └── VolumeControl
│       ├── VolumeButton (with mute)
│       └── VolumeSlider
├── ExpandedPlayer (mobile/modal)
│   ├── LargeArtwork
│   ├── TrackInfo
│   ├── ProgressBar
│   ├── PlaybackControls
│   ├── VolumeControl
│   └── QueueDisplay
└── AudioElement (hidden <audio> tag)
```

**Audio Element Management**:
```typescript
const audioRef = useRef<HTMLAudioElement>(null)

// Load track
audioRef.current.src = track.preview
audioRef.current.load()

// Play/Pause
audioRef.current.play()
audioRef.current.pause()

// Seek
audioRef.current.currentTime = seekTime

// Volume
audioRef.current.volume = volume / 100

// Event listeners
audioRef.current.addEventListener('timeupdate', handleTimeUpdate)
audioRef.current.addEventListener('ended', handleTrackEnd)
audioRef.current.addEventListener('error', handleError)
```

**Keyboard Shortcuts Implementation**:
```typescript
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    // Ignore if user is typing in input
    if (e.target instanceof HTMLInputElement) return

    switch (e.code) {
      case 'Space':
        e.preventDefault()
        togglePlay()
        break
      case 'ArrowRight':
        next()
        break
      case 'ArrowLeft':
        previous()
        break
      case 'ArrowUp':
        setVolume(Math.min(volume + 10, 100))
        break
      case 'ArrowDown':
        setVolume(Math.max(volume - 10, 0))
        break
      case 'KeyM':
        toggleMute()
        break
    }
  }

  document.addEventListener('keydown', handleKeyDown)
  return () => document.removeEventListener('keydown', handleKeyDown)
}, [volume, isPlaying])
```

---

## Open Questions

### ADDED:

1. **Default Volume**: What should default volume be?
   - **Recommendation**: 70% (not too loud, not too quiet)

2. **Auto-Advance**: Default on or off?
   - **Recommendation**: ON by default, with toggle option

3. **Queue Limit**: How many tracks in queue?
   - **Recommendation**: All recommendations (20), user can add more

4. **Seek Granularity**: How precise should seeking be?
   - **Recommendation**: 1-second increments (sufficient for 30s)

5. **Repeat Mode**: Include repeat functionality in MVP?
   - **Recommendation**: Yes, but simple (repeat all or none)

6. **Queue Persistence**: Save queue across sessions?
   - **Recommendation**: No for MVP, session-only

---

## Design Specifications

### ADDED:

**Desktop Player Bar** (Bottom of screen):
- Height: 80px
- Background: Semi-transparent dark (glassmorphism)
- Layout: [Artwork 60x60] [Track Info] [Controls] [Progress] [Volume]
- Z-index: High (always on top)

**Mobile Player Bar** (Bottom of screen):
- Height: 64px (collapsed)
- Height: 100vh (expanded)
- Swipe up to expand
- Layout: [Artwork 48x48] [Track Info] [Play/Pause]

**Controls**:
- Buttons: 40x40px (desktop), 48x48px (mobile)
- Play/Pause: Primary button (larger, highlighted)
- Icons: Lucide or Heroicons
- Colors: Brand colors (purple/pink gradient)

**Progress Bar**:
- Height: 4px (inactive), 8px (hover)
- Seeker handle: 16x16px circle
- Colors: Gray (inactive), Gradient (progress), White (handle)

**Volume Slider**:
- Vertical popup on hover (desktop)
- Horizontal in expanded player (mobile)
- Range: 0-100

---

## Testing Checklist

### ADDED:

**Unit Tests**:
- [ ] Play/pause toggles correctly
- [ ] Next/previous navigates queue
- [ ] Seek updates currentTime
- [ ] Volume updates correctly
- [ ] Mute/unmute works
- [ ] Auto-advance triggers on track end
- [ ] Queue management (add, remove, reorder)

**Integration Tests**:
- [ ] Audio element loads preview URL
- [ ] Playback state syncs with Zustand store
- [ ] Listening history saved to Supabase
- [ ] Save track saves to database

**E2E Tests**:
- [ ] Click track → plays audio
- [ ] Click pause → audio pauses
- [ ] Click next → advances to next track
- [ ] Adjust volume → audio volume changes
- [ ] Seek → audio jumps to position
- [ ] Auto-advance → next track plays after 30s

**Accessibility Tests**:
- [ ] Keyboard shortcuts work
- [ ] Screen reader announces track changes
- [ ] Focus visible on controls
- [ ] ARIA labels present

**Browser Tests**:
- [ ] Works in Chrome
- [ ] Works in Firefox
- [ ] Works in Safari
- [ ] Works in Edge
- [ ] Works on iOS Safari
- [ ] Works on Android Chrome

**Performance Tests**:
- [ ] Audio loads in < 500ms
- [ ] Playback starts in < 200ms
- [ ] Progress bar animates smoothly (60fps)
- [ ] No memory leaks on long sessions

---

## Implementation Priority

### Phase 1 (MVP - Must Have):
1. ✅ Basic play/pause
2. ✅ Next/previous track
3. ✅ Progress bar with time
4. ✅ Volume control
5. ✅ Now playing display
6. ✅ Auto-advance
7. ✅ Persistent player bar

### Phase 2 (Post-MVP - Should Have):
- Seek functionality
- Queue display and management
- Keyboard shortcuts
- Save/favorite from player
- Similar tracks from player
- Repeat modes
- Mobile expanded player

### Phase 3 (Future - Nice to Have):
- Crossfade
- Equalizer
- Lyrics
- Visualizer
- Playlist creation
- Share functionality

---

## Analytics & Metrics

### ADDED:

**Player Usage**:
- Tracks played per session (average, median)
- Play/pause frequency
- Skip frequency (tracks skipped before completion)
- Average listen duration per track
- Volume adjustment frequency

**Queue Behavior**:
- Queue completion rate
- Average queue length
- Tracks added to queue
- Tracks removed from queue

**Feature Usage**:
- Keyboard shortcuts usage
- Volume control usage
- Repeat mode usage
- Save/favorite from player

**Performance**:
- Audio load time (p50, p95, p99)
- Playback error rate
- Browser compatibility issues

---

## Related Documents

- [Music Recommendation Engine](./music-recommendation-engine.md) - Provides queue
- [User Preferences](./user-preferences.md) - Save/favorite functionality
- [Tech Stack](../architecture/tech-stack.md) - Audio implementation details
- [System Design](../architecture/system-design.md) - Player architecture

---

**Status**: Draft - Ready for Review
**Created**: 2025-10-21
**Version**: 1.0
**Next Step**: Review → Approve → Create Technical Plan (`/plan audio-player`)
