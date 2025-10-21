# Feature Specification: Mood Input Interface

## Overview

The Mood Input Interface is the core entry point for Vibe-Song, allowing users to express their current emotional state and energy level. This interface translates user input into parameters that drive music recommendations.

## User Need

**Problem**: Users struggle to describe what kind of music they want to hear at any given moment. Traditional search requires knowing specific songs, artists, or genres, which doesn't align with how people naturally think about music ("I want something happy" vs "I want pop music").

**Solution**: A simple, intuitive interface where users express their mood using emojis and fine-tune with energy/valence sliders.

---

## Requirements

### Functional Requirements

#### ADDED:

**FR-1: Emoji Mood Selection**
- Users MUST be able to select their mood using emoji buttons
- Supported moods:
  - 😊 Happy/Cheerful
  - 😢 Sad/Melancholic
  - 😌 Calm/Relaxed
  - 🔥 Energetic/Hype
  - 💭 Thoughtful/Introspective
  - 😴 Sleepy/Dreamy
  - 💪 Workout/Motivated
  - 🎉 Party/Celebration
- Only ONE emoji can be selected at a time
- Selected emoji MUST be visually highlighted
- Selection MUST persist during the session

**FR-2: Energy Level Slider**
- Users MUST be able to adjust energy level from 1 (low) to 10 (high)
- Default value: 5 (medium)
- Slider MUST show current value
- Changes MUST update in real-time
- Visual feedback (color gradient from calm to intense)

**FR-3: Mood Valence Slider**
- Users MUST be able to adjust mood valence from 1 (negative) to 10 (positive)
- Default value: 5 (neutral)
- Slider MUST show current value
- Changes MUST update in real-time
- Visual feedback (color gradient from dark to bright)

**FR-4: Preset Mood Combinations**
- System SHOULD auto-adjust sliders when emoji is selected
- Each emoji has default energy and valence values
- User CAN override defaults with manual slider adjustments
- Overrides SHOULD be remembered for that emoji

**FR-5: Mood Context**
- System MAY ask for optional context (time of day, activity)
- Context options:
  - Time: Morning, Afternoon, Evening, Night (auto-detected)
  - Activity: Work, Workout, Relax, Commute, Party, Sleep (optional)
- Context is NOT required but enhances recommendations

**FR-6: Find Music Button**
- Prominent "Find Music" or "Discover" button
- Button MUST be disabled if no mood selected
- Button shows loading state during recommendation fetch
- Click triggers recommendation generation

**FR-7: Quick Mood History**
- Show last 3 selected moods (if user is logged in)
- Allow quick re-selection of previous mood
- Each history item shows emoji + timestamp

### Non-Functional Requirements

#### ADDED:

**NFR-1: Performance**
- Mood selection response time < 100ms
- Slider updates render at 60fps
- Page load time < 2s

**NFR-2: Accessibility**
- Keyboard navigation support (Tab, Arrow keys, Enter)
- Screen reader compatible (ARIA labels)
- Color contrast ratio ≥ 4.5:1
- Touch targets ≥ 44x44px (mobile)

**NFR-3: Responsiveness**
- Works on mobile (320px+), tablet, desktop
- Layout adapts to screen size
- Touch-friendly on mobile
- Mouse-friendly on desktop

**NFR-4: Visual Design**
- Clean, minimalist interface
- Emoji buttons: large and clear
- Smooth animations (< 300ms)
- Dark mode support

**NFR-5: Browser Compatibility**
- Modern browsers (Chrome, Firefox, Safari, Edge)
- Last 2 versions
- No IE11 support needed

---

## User Scenarios

### ADDED:

### Scenario 1: First-Time User Selects Mood

**As a** new user visiting Vibe-Song for the first time
**I want to** quickly express my current mood
**So that** I can discover music that matches how I'm feeling

**Steps**:
1. User lands on homepage/discover page
2. User sees emoji mood selector with clear labels
3. User reads brief instruction: "How are you feeling?"
4. User clicks 😊 Happy emoji
5. Sliders auto-adjust to happy defaults (energy: 7, valence: 8)
6. "Find Music" button becomes active and highlighted
7. User can optionally adjust sliders
8. User clicks "Find Music"

**Expected Outcome**:
- User understands interface immediately
- Selection feels natural and quick
- No confusion or hesitation
- Ready to see recommendations

---

### Scenario 2: User Fine-Tunes Mood with Sliders

**As a** user who wants more control
**I want to** adjust energy and mood beyond the emoji preset
**So that** I can get more personalized recommendations

**Steps**:
1. User selects 😌 Calm emoji
2. Sliders set to calm defaults (energy: 3, valence: 6)
3. User thinks: "I want calm but more uplifting"
4. User drags mood valence slider from 6 → 8
5. Visual feedback shows change (brighter colors)
6. Current values displayed clearly
7. System remembers this adjustment for 😌

**Expected Outcome**:
- Slider adjustment is smooth and responsive
- Visual feedback is immediate
- User feels in control
- Recommendation will reflect the fine-tuning

---

### Scenario 3: Quick Re-Selection from History

**As a** returning user
**I want to** quickly select a mood I used recently
**So that** I don't have to set everything up again

**Steps**:
1. User logs in and goes to discover page
2. User sees mood history: [😊 2 hours ago] [💭 Yesterday] [😌 2 days ago]
3. User clicks on "😊 2 hours ago"
4. Emoji and sliders restore to previous values
5. User clicks "Find Music"

**Expected Outcome**:
- Instant mood restoration
- No need to remember previous settings
- Faster workflow for repeat usage

---

### Scenario 4: Mobile User on Commute

**As a** mobile user on my commute
**I want to** quickly find music with one hand
**So that** I can discover music while standing in a crowded train

**Steps**:
1. User opens app on phone (holding phone in one hand)
2. Large emoji buttons are easy to tap
3. User taps 💭 Thoughtful with thumb
4. Sliders are visible but user doesn't adjust (defaults are fine)
5. User taps large "Find Music" button
6. Recommendations load quickly

**Expected Outcome**:
- One-handed operation is easy
- No frustration with small touch targets
- Quick workflow for mobile context

---

### Scenario 5: Accessibility - Keyboard Navigation

**As a** user who prefers keyboard navigation
**I want to** select mood and find music without using a mouse
**So that** I can use the app efficiently

**Steps**:
1. User tabs to emoji selector
2. Arrow keys navigate between emojis
3. Enter selects emoji
4. Tab moves to energy slider
5. Arrow keys adjust slider
6. Tab moves to valence slider
7. Arrow keys adjust slider
8. Tab to "Find Music" button
9. Enter triggers search

**Expected Outcome**:
- Fully functional with keyboard only
- Focus indicators are clear
- Navigation is logical and predictable

---

## Success Criteria

### ADDED:

1. **Usability**: 90% of first-time users can select a mood and generate recommendations within 30 seconds without instructions

2. **Engagement**: Users adjust sliders in at least 30% of sessions (indicating they find value in fine-tuning)

3. **Performance**: Mood selection to recommendation generation < 3 seconds (including API calls)

4. **Accessibility**: Passes WCAG 2.1 AA compliance

5. **Mobile**: Touch targets meet minimum size requirements, no zoom needed

6. **Conversion**: 80% of users who select a mood proceed to click "Find Music"

7. **Retention**: 40% of returning users utilize mood history feature

---

## Out of Scope

### ADDED:

- Text-based mood input (future enhancement)
- Voice input for mood selection
- Multiple simultaneous mood selection (e.g., "happy AND energetic")
- Mood playlist creation without recommendation
- Social sharing of mood state
- Mood journaling features
- Custom emoji upload
- More than 8 preset moods (keep it simple for MVP)

---

## Dependencies

### ADDED:

1. **Design System**: shadcn/ui components (Button, Slider, Card)
2. **State Management**: Zustand store for mood state
3. **Icons**: Emoji rendering (native or emoji library)
4. **Responsive Design**: Tailwind CSS breakpoints
5. **Recommendation API**: Must be ready to accept mood input

---

## Technical Considerations

### ADDED:

**State Structure**:
```typescript
interface MoodState {
  selectedEmoji: string | null
  energyLevel: number
  moodValence: number
  context?: {
    timeOfDay: string
    activity?: string
  }
  history: MoodSelection[]
}
```

**Component Structure**:
```
MoodInputInterface
├── EmojiSelector
│   └── EmojiButton (x8)
├── SliderControls
│   ├── EnergySlider
│   └── ValenceSlider
├── ContextSelector (optional)
└── FindMusicButton
```

**Validation**:
- Emoji must be selected before enabling "Find Music"
- Slider values must be 1-10 (inclusive)
- History limited to last 10 selections

---

## Open Questions

### ADDED:

1. **Emoji Set**: Should we support emoji skin tones or stick with default yellow?
   - **Recommendation**: Default yellow for simplicity in MVP

2. **Slider Step**: Should sliders increment by 1 or allow decimal values (0.5)?
   - **Recommendation**: Integer values (1-10) for simplicity

3. **Auto-Submit**: Should selecting an emoji auto-trigger recommendations without clicking button?
   - **Recommendation**: Require button click to allow slider adjustment

4. **Mood Presets**: Should we provide named presets like "Morning Motivation" or "Evening Wind Down"?
   - **Recommendation**: Not for MVP, but good for Phase 2

5. **Animations**: How much animation is too much? (emoji bounce, slider color changes)
   - **Recommendation**: Subtle animations only, test with users

---

## Design Mockup Requirements

### ADDED:

**Desktop Layout**:
- Centered card (max-width: 600px)
- Emoji grid: 4x2 or 2x4
- Sliders: horizontal, full width
- Button: centered, prominent

**Mobile Layout**:
- Full-width card
- Emoji grid: 4x2 (2 rows)
- Sliders: full width, larger touch targets
- Button: full-width, fixed at bottom (optional)

**States to Design**:
- Default (no selection)
- Emoji selected
- Slider adjustment in progress
- Loading state (button)
- Error state (if API fails)

---

## Testing Checklist

### ADDED:

**Unit Tests**:
- [ ] Emoji selection updates state correctly
- [ ] Slider changes update state correctly
- [ ] Button disabled when no emoji selected
- [ ] Button enabled when emoji selected
- [ ] Default values applied on emoji selection
- [ ] Custom slider values override defaults

**Integration Tests**:
- [ ] Emoji selection + Find Music triggers API call
- [ ] Mood history persists correctly (logged in users)
- [ ] Context auto-detection works (time of day)

**E2E Tests**:
- [ ] Complete flow: Select emoji → Adjust sliders → Find Music → See recommendations
- [ ] Keyboard navigation works end-to-end
- [ ] Mobile touch interaction works

**Accessibility Tests**:
- [ ] Screen reader announces emoji selection
- [ ] Slider values announced on change
- [ ] Focus indicators visible
- [ ] Color contrast meets WCAG AA

**Visual Tests**:
- [ ] Responsive on mobile (320px, 375px, 414px)
- [ ] Responsive on tablet (768px, 1024px)
- [ ] Responsive on desktop (1280px, 1920px)
- [ ] Dark mode looks good
- [ ] Light mode looks good

---

## Implementation Priority

### Phase 1 (MVP - Must Have):
1. ✅ Emoji selector (8 moods)
2. ✅ Energy slider
3. ✅ Valence slider
4. ✅ Find Music button
5. ✅ Basic responsive layout
6. ✅ State management

### Phase 2 (Post-MVP - Should Have):
- Mood history (logged in users)
- Context selector (time/activity)
- Preset mood combinations memory
- Animations and transitions
- Advanced accessibility features

### Phase 3 (Future - Nice to Have):
- Text mood input
- Voice input
- Custom emoji
- Mood presets
- Social sharing

---

## Metrics to Track

### ADDED:

**Usage Metrics**:
- Most selected emojis
- Average slider adjustment frequency
- Average session time on mood input page
- Conversion rate (mood selection → Find Music click)

**Engagement Metrics**:
- Repeat emoji selections
- Slider vs. preset usage ratio
- History feature usage (if implemented)

**Performance Metrics**:
- Mood input page load time
- Interaction response time
- Slider performance (fps)

---

## Related Documents

- [Initial Vision](../PRPs/001-initial-vision.md)
- [Tech Stack](../architecture/tech-stack.md)
- [System Design](../architecture/system-design.md)
- [Data Models](../architecture/data-models.md)

---

**Status**: Draft - Ready for Review
**Created**: 2025-10-21
**Version**: 1.0
**Next Step**: Review → Approve → Create Technical Plan (`/plan mood-input-interface`)
