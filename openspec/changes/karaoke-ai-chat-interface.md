# Feature Specification: Chat Interface

**Feature**: Karaoke AI Chat Interface
**Created**: 2025-10-22
**Status**: Draft
**Priority**: HIGH (Phase 1 Core)
**Related**: karaoke-ai-overview.md, karaoke-ai-rag-system.md

---

## Overview

Chat Interface เป็นหัวใจหลักของ Karaoke AI Chat Agent ที่ให้ผู้ใช้สนทนากับ AI เพื่อขอคำแนะนำเพลงคาราโอเกะ ผ่านการสนทนาแบบธรรมชาติ

## User Need

**Problem**:
- ผู้ใช้ต้องการสื่อสารกับ AI แบบธรรมชาติ (conversational)
- ต้องการเห็นประวัติการสนทนา
- ต้องการเข้าถึงฟีเจอร์ได้ง่าย (category buttons)
- ต้องการสลับ AI model ได้
- ต้องการเห็นผลลัพธ์ที่ชัดเจน (song recommendations)

**Solution**:
- Modern chat UI ที่คล้าย ChatGPT, Claude
- Message history with scroll
- Quick action buttons (categories)
- Model selector dropdown
- Rich message format (text, song cards, buttons)

---

## Requirements

### Functional Requirements

#### ADDED:

**FR-CHAT-1: Chat Container**
- Chat interface MUST occupy main screen area
- MUST show conversation history (scrollable)
- MUST auto-scroll to latest message
- MUST support infinite scroll for history (load more)
- MUST show timestamp for each message
- MUST distinguish between user and AI messages (visual difference)

**FR-CHAT-2: Message Input**
- Text input box at bottom (fixed position)
- MUST support multi-line input (up to 5 lines, then scroll)
- MUST have "Send" button
- MUST support Enter key to send (Shift+Enter for new line)
- MUST show character count (optional, if limit exists)
- MUST disable input while AI is responding (loading state)
- MUST show placeholder: "พิมพ์ข้อความหรือเลือกหมวดหมู่เพลง..."

**FR-CHAT-3: Message Types**

**User Messages**:
- Text only
- Right-aligned
- User avatar/initial (if logged in)
- Timestamp

**AI Messages**:
- Text (introduction, questions, explanations)
- Song cards (recommendations)
- Action buttons (categories, quick replies)
- Links (YouTube, external)
- AI model indicator (small badge)
- Timestamp

**FR-CHAT-4: Song Card Format**

Each song recommendation MUST display as a card with:
```
┌─────────────────────────────────────┐
│ [Album Art]  Song Title             │
│              Artist Name             │
│              Genre • Year • Tempo    │
│              Language/Dialect        │
│                                      │
│  [🎵 ฟังเพลง] [📺 ดูวิดีโอ] [❤️]   │
│  [📋 Lyrics]                         │
└─────────────────────────────────────┘
```

**Fields**:
- Album art (100x100px thumbnail)
- Song title (bold, max 2 lines)
- Artist name (normal, max 1 line)
- Metadata: Genre, Year, Tempo (small text)
- Language/Dialect (badge)
- Action buttons:
  - 🎵 ฟังเพลง → Open YouTube audio
  - 📺 ดูวิดีโอ → Open YouTube video
  - ❤️ → Save to favorites (if logged in)
  - 📋 Lyrics → Expand to show lyrics

**FR-CHAT-5: Category Quick Buttons**

MUST show below input box (or in welcome screen):

**Thai Genres** (horizontal scroll):
- [ลูกทุ่ง]
- [ลูกกรุง]
- [สตริง]
- [หมอลำ]
- [เพลงใต้]
- [เพื่อชีวิต]
- [สามช่า]

**International** (horizontal scroll):
- [K-pop]
- [C-pop]
- [J-pop]
- [Western]

**Charts**:
- [เพลงฮิต]
- [ยอดนิยม]

**Behavior**:
- Click button → Send message "แนะนำเพลง[category]"
- AI responds with recommendations
- Buttons always visible (sticky or collapsible)

**FR-CHAT-6: Model Selector**

MUST have model selector in header:
```
[GLM 4.6 ▼]  [New Chat] [⚙️]
```

**Dropdown options**:
- ✅ GLM 4.6 (z.ai) - Available
- ✅ Gemini 2.0 (Google) - Available
- ⚪ GPT-4o (OpenAI) - Need API key
- ⚪ Claude 3.5 (Anthropic) - Need API key
- ⚪ Qwen3 (Alibaba) - Need API key

**Behavior**:
- Switch model → Show warning "Switching model will start new conversation"
- Confirm → Create new conversation with new model
- Show current model in all AI messages (small badge)

**FR-CHAT-7: Chat History (Sidebar)**

MUST have collapsible sidebar showing:
```
┌──────────────────┐
│ 📝 Chat History  │
│ ───────────────  │
│ Today            │
│  • เพลงลูกทุ่ง   │
│  • เพลง K-pop    │
│ Yesterday        │
│  • เพลงโรแมนติก  │
│ Last 7 days      │
│  • ...           │
└──────────────────┘
```

**Features**:
- Group by date (Today, Yesterday, Last 7 days, etc.)
- Show first message or title
- Click to load conversation
- Delete button (hover to show)
- Search conversations
- Filter by model

**FR-CHAT-8: Welcome Screen**

When no conversation or new chat:

```
┌────────────────────────────────────────┐
│                                        │
│           🎤 Karaoke AI                │
│                                        │
│   ยินดีต้อนรับสู่ Karaoke AI Chat!     │
│   ฉันพร้อมช่วยแนะนำเพลงสำหรับคุณ     │
│                                        │
│   ลองถามฉันเช่น:                       │
│   • "หาเพลงลูกทุ่งเศร้าๆ"             │
│   • "เพลง K-pop ฮิตปีนี้"             │
│   • "เพลงร้องง่ายสำหรับมือใหม่"       │
│                                        │
│   หรือเลือกหมวดหมู่ด่วน:              │
│   [ลูกทุ่ง] [ลูกกรุง] [K-pop] ...    │
└────────────────────────────────────────┘
```

**FR-CHAT-9: Loading States**

**While AI is thinking**:
- Show typing indicator (3 animated dots)
- Show "กำลังคิด..." or "กำลังค้นหาเพลง..."
- Disable input
- Show cancel button (optional)

**While loading history**:
- Show skeleton screens for messages
- Show "กำลังโหลด..."

**FR-CHAT-10: Error Handling**

**Network Error**:
```
┌─────────────────────────────────┐
│ ⚠️ ไม่สามารถเชื่อมต่อได้       │
│ กรุณาตรวจสอบการเชื่อมต่อ       │
│                                 │
│ [ลองอีกครั้ง]                  │
└─────────────────────────────────┘
```

**AI Error**:
```
┌─────────────────────────────────┐
│ ❌ เกิดข้อผิดพลาดจาก AI        │
│ กรุณาลองใหม่อีกครั้ง           │
│                                 │
│ [เริ่มใหม่] [เปลี่ยน Model]    │
└─────────────────────────────────┘
```

**API Rate Limit**:
```
┌─────────────────────────────────┐
│ ⏳ API ใช้งานเกินโควต้า         │
│ กรุณารอสักครู่แล้วลองใหม่       │
│                                 │
│ [เปลี่ยน Model]                 │
└─────────────────────────────────┘
```

**FR-CHAT-11: Responsive Design**

**Desktop** (≥1024px):
- 3-column layout: Sidebar (250px) | Chat (flex) | Right panel (300px, optional)
- Full keyboard shortcuts
- Hover effects

**Tablet** (768px - 1023px):
- 2-column: Collapsible sidebar | Chat
- Touch-friendly buttons
- Swipe to open sidebar

**Mobile** (≤767px):
- Single column: Chat only
- Hamburger menu for sidebar
- Bottom sheet for settings
- Larger touch targets (48x48px min)

**FR-CHAT-12: Keyboard Shortcuts**

- **Enter**: Send message
- **Shift+Enter**: New line
- **Ctrl+K** / **Cmd+K**: Focus search (sidebar)
- **Ctrl+N** / **Cmd+N**: New chat
- **Ctrl+/** / **Cmd+/**: Show shortcuts
- **Esc**: Close modals/dropdowns

**FR-CHAT-13: Accessibility**

- MUST support screen readers (ARIA labels)
- MUST have keyboard navigation
- MUST have focus indicators
- MUST have color contrast ratio ≥ 4.5:1
- MUST support font scaling (up to 200%)
- MUST have alt text for images

---

### Non-Functional Requirements

#### ADDED:

**NFR-CHAT-1: Performance**
- Message render time < 100ms
- Scroll performance 60fps
- Chat history load < 1s
- Infinite scroll load < 500ms
- Image lazy loading (below fold)

**NFR-CHAT-2: UI/UX Quality**
- Smooth animations (200-300ms)
- No layout shift (CLS < 0.1)
- Responsive immediately (<100ms feedback)
- Clear visual hierarchy
- Consistent design system

**NFR-CHAT-3: Data Management**
- Auto-save every message
- Optimistic UI updates
- Cache recent conversations
- Sync across devices (if logged in)

**NFR-CHAT-4: Reliability**
- Graceful error handling
- Automatic retry (max 3 attempts)
- Offline support (view history)
- Data persistence (IndexedDB + Supabase)

---

## User Scenarios

### ADDED:

### Scenario 1: ผู้ใช้ใหม่เข้ามาครั้งแรก

**Pre-conditions**:
- User ไม่เคย login
- ไม่มี chat history

**Steps**:
1. User เข้า website
2. เห็น Welcome screen พร้อม:
   - Logo + greeting message
   - Example prompts (3-4 ตัวอย่าง)
   - Category buttons
3. User อ่านตัวอย่าง
4. User คลิกปุ่ม [ลูกทุ่ง]
5. Message ถูกส่งไป: "แนะนำเพลงลูกทุ่ง"
6. AI แสดง typing indicator
7. AI ตอบ: "มีเพลงลูกทุ่งแนะนำดังนี้ครับ:" + 5 song cards
8. User คลิก [ดูวิดีโอ] เพลงแรก
9. YouTube เปิดในแท็บใหม่

**Expected Outcome**:
- ✅ Welcome screen ชัดเจน เข้าใจง่าย
- ✅ Category button ทำงานได้
- ✅ AI response ภายใน 2 วินาที
- ✅ Song cards แสดงครบ
- ✅ YouTube link ทำงาน

### Scenario 2: ผู้ใช้สนทนาถาม-ตอบหลายรอบ

**Pre-conditions**:
- User อยู่ในหน้า chat
- มีประวัติการสนทนาอยู่แล้ว

**Steps**:
1. User พิมพ์: "หาเพลงเศร้าๆ ร้องง่าย"
2. AI ตอบ: "เพลงแนวไหนที่ชอบครับ?" + category buttons
3. User คลิก [ลูกกรุง]
4. AI แนะนำ 5 เพลง
5. User: "ของศิลปินคนอื่นมีไหม"
6. AI: "มีครับ" + แนะนำ 5 เพลงใหม่ (ศิลปินอื่น)
7. User พอใจ → ไม่ต้องถามต่อ
8. Conversation auto-saved

**Expected Outcome**:
- ✅ Context ต่อเนื่อง (AI จำการสนทนา)
- ✅ AI เข้าใจ intent
- ✅ แต่ละ response ภายใน 2s
- ✅ Auto-save ทำงาน

### Scenario 3: ผู้ใช้สลับ Model

**Pre-conditions**:
- User กำลังคุยกับ GLM 4.6
- มี conversation อยู่

**Steps**:
1. User คลิก Model selector → เลือก "Gemini 2.0"
2. Dialog แสดง: "⚠️ การเปลี่ยน model จะเริ่ม conversation ใหม่"
3. User คลิก [ยืนยัน]
4. Conversation ปัจจุบันถูก save
5. หน้า chat clear
6. Model ใหม่พร้อมใช้ (แสดง "Gemini 2.0" badge)
7. User เริ่มคุยใหม่

**Expected Outcome**:
- ✅ Warning ชัดเจน
- ✅ Conversation เก่าไม่หาย (อยู่ใน history)
- ✅ Model ใหม่ทำงานได้
- ✅ Model indicator แสดงถูกต้อง

### Scenario 4: ผู้ใช้เปิด Chat History

**Pre-conditions**:
- User logged in
- มี 10+ conversations

**Steps**:
1. User คลิก Sidebar toggle (หรือ hamburger menu บน mobile)
2. Sidebar slide in แสดง chat history
3. Conversations grouped by date (Today, Yesterday, etc.)
4. User scroll ดู history
5. User คลิก conversation จาก 3 วันที่แล้ว
6. Chat load conversation นั้น
7. User เห็นประวัติการสนทนาครบ
8. User สามารถคุยต่อได้

**Expected Outcome**:
- ✅ Sidebar animation smooth
- ✅ History load < 1s
- ✅ Conversation restore ครบ
- ✅ สามารถ continue conversation

### Scenario 5: Network Error Recovery

**Pre-conditions**:
- User กำลังคุยอยู่
- Network ขาด

**Steps**:
1. User ส่งข้อความ
2. Message ส่งไม่ได้ (network error)
3. แสดง error message: "ไม่สามารถเชื่อมต่อได้"
4. แสดงปุ่ม [ลองอีกครั้ง]
5. User คลิก [ลองอีกครั้ง]
6. Network กลับมา
7. Message ส่งสำเร็จ
8. AI ตอบปกติ

**Expected Outcome**:
- ✅ Error message ชัดเจน
- ✅ Retry ทำงานได้
- ✅ ไม่มี message สูญหาย
- ✅ UX ไม่กระตุก

---

## UI Components Breakdown

### ADDED:

#### 1. ChatContainer Component
```typescript
<ChatContainer>
  - Header (model selector, new chat, settings)
  - MessageList (scrollable)
  - InputArea (text box + buttons)
  - CategoryButtons (quick actions)
</ChatContainer>
```

**Props**:
- `conversationId`: string | null
- `currentModel`: AIModel
- `onModelChange`: (model) => void
- `onNewChat`: () => void

**State**:
- `messages`: Message[]
- `isLoading`: boolean
- `error`: Error | null

#### 2. MessageList Component
```typescript
<MessageList>
  {messages.map(msg => (
    msg.role === 'user'
      ? <UserMessage {...msg} />
      : <AIMessage {...msg} />
  ))}
  {isLoading && <TypingIndicator />}
</MessageList>
```

**Features**:
- Auto-scroll to bottom
- Infinite scroll (load older messages)
- Message grouping by date

#### 3. UserMessage Component
```typescript
<UserMessage>
  <MessageBubble align="right">
    <Avatar /> {/* if logged in */}
    <MessageContent>
      {text}
    </MessageContent>
    <Timestamp />
  </MessageBubble>
</UserMessage>
```

#### 4. AIMessage Component
```typescript
<AIMessage>
  <MessageBubble align="left">
    <AIAvatar model={model} />
    <MessageContent>
      {type === 'text' && <TextContent />}
      {type === 'songs' && <SongGrid songs={songs} />}
      {type === 'buttons' && <ActionButtons />}
    </MessageContent>
    <ModelBadge model={model} />
    <Timestamp />
  </MessageBubble>
</AIMessage>
```

#### 5. SongCard Component
```typescript
<SongCard>
  <AlbumArt src={song.imageUrl} />
  <SongInfo>
    <Title>{song.title}</Title>
    <Artist>{song.artist}</Artist>
    <Metadata>
      {song.genre} • {song.year} • {song.tempo} BPM
    </Metadata>
    <LanguageBadge>{song.language}</LanguageBadge>
  </SongInfo>
  <Actions>
    <Button icon="🎵" onClick={playAudio}>ฟังเพลง</Button>
    <Button icon="📺" onClick={watchVideo}>ดูวิดีโอ</Button>
    <IconButton icon="❤️" onClick={saveSong} />
  </Actions>
  <LyricsToggle onClick={toggleLyrics} />
  {showLyrics && <LyricsPanel>{song.lyrics}</LyricsPanel>}
</SongCard>
```

#### 6. InputArea Component
```typescript
<InputArea>
  <TextArea
    placeholder="พิมพ์ข้อความหรือเลือกหมวดหมู่เพลง..."
    value={input}
    onChange={handleChange}
    onKeyDown={handleKeyDown}
    disabled={isLoading}
    maxRows={5}
  />
  <SendButton
    onClick={handleSend}
    disabled={!input.trim() || isLoading}
  />
</InputArea>
```

**Features**:
- Auto-resize (up to 5 lines)
- Character count (if limit)
- Loading state

#### 7. CategoryButtons Component
```typescript
<CategoryButtons>
  <ScrollableContainer horizontal>
    <ButtonGroup label="เพลงไทย">
      {thaiGenres.map(genre => (
        <CategoryButton
          key={genre}
          onClick={() => sendCategory(genre)}
        >
          {genre}
        </CategoryButton>
      ))}
    </ButtonGroup>

    <ButtonGroup label="เพลงสากล">
      {intlGenres.map(genre => (
        <CategoryButton
          key={genre}
          onClick={() => sendCategory(genre)}
        >
          {genre}
        </CategoryButton>
      ))}
    </ButtonGroup>

    <ButtonGroup label="ชาร์ต">
      <CategoryButton onClick={() => sendCategory('hits')}>
        เพลงฮิต
      </CategoryButton>
      <CategoryButton onClick={() => sendCategory('popular')}>
        ยอดนิยม
      </CategoryButton>
    </ButtonGroup>
  </ScrollableContainer>
</CategoryButtons>
```

#### 8. Sidebar Component (Chat History)
```typescript
<Sidebar isOpen={isSidebarOpen}>
  <SidebarHeader>
    <Title>📝 Chat History</Title>
    <SearchBox />
  </SidebarHeader>

  <ConversationList>
    {groupedConversations.map(group => (
      <ConversationGroup key={group.label}>
        <GroupLabel>{group.label}</GroupLabel>
        {group.conversations.map(conv => (
          <ConversationItem
            key={conv.id}
            conversation={conv}
            isActive={conv.id === activeConvId}
            onClick={() => loadConversation(conv.id)}
            onDelete={() => deleteConversation(conv.id)}
          />
        ))}
      </ConversationGroup>
    ))}
  </ConversationList>

  <SidebarFooter>
    <Button onClick={createNewChat}>+ New Chat</Button>
  </SidebarFooter>
</Sidebar>
```

#### 9. ModelSelector Component
```typescript
<ModelSelector>
  <Dropdown
    value={currentModel}
    onChange={handleModelChange}
  >
    <Option value="glm-4" available>
      GLM 4.6 (z.ai)
    </Option>
    <Option value="gemini-2" available>
      Gemini 2.0 (Google)
    </Option>
    <Option value="gpt-4o" disabled>
      GPT-4o (OpenAI) - Need Key
    </Option>
    <Option value="claude-3.5" disabled>
      Claude 3.5 (Anthropic) - Need Key
    </Option>
    <Option value="qwen3" disabled>
      Qwen3 (Alibaba) - Need Key
    </Option>
  </Dropdown>
</ModelSelector>
```

---

## Data Models

### ADDED:

#### Message Interface
```typescript
interface Message {
  id: string
  conversationId: string
  role: 'user' | 'assistant'
  content: MessageContent
  model?: AIModel // for assistant messages
  timestamp: Date
  metadata?: {
    tokens?: number
    latency?: number
    error?: string
  }
}

type MessageContent =
  | TextContent
  | SongContent
  | ButtonContent
  | ErrorContent

interface TextContent {
  type: 'text'
  text: string
}

interface SongContent {
  type: 'songs'
  songs: Song[]
  intro?: string // optional intro text
}

interface ButtonContent {
  type: 'buttons'
  text: string
  buttons: Button[]
}

interface ErrorContent {
  type: 'error'
  error: string
  retryable: boolean
}
```

#### Conversation Interface
```typescript
interface Conversation {
  id: string
  userId?: string // null for anonymous
  title: string // auto-generated from first message
  model: AIModel
  createdAt: Date
  updatedAt: Date
  messageCount: number
  preview: string // first 50 chars of first user message
}
```

#### Song Interface
```typescript
interface Song {
  id: string
  title: string
  artist: string
  genre: string
  year: number
  tempo?: number // BPM
  language: string // 'Thai', 'English', 'Korean', etc.
  dialect?: string // 'Isaan', 'Southern', etc.
  imageUrl: string
  youtubeUrl?: string
  spotifyUrl?: string
  lyrics?: string
  difficulty?: 'Easy' | 'Medium' | 'Hard'
}
```

---

## State Management

### ADDED:

Using **Zustand** for client state:

#### ChatStore
```typescript
interface ChatState {
  // Current conversation
  currentConversationId: string | null
  messages: Message[]
  isLoading: boolean
  error: Error | null

  // Model
  currentModel: AIModel

  // Actions
  sendMessage: (text: string) => Promise<void>
  sendCategory: (category: string) => Promise<void>
  switchModel: (model: AIModel) => Promise<void>
  loadConversation: (id: string) => Promise<void>
  createNewConversation: () => void
  deleteConversation: (id: string) => Promise<void>
  clearError: () => void
}
```

#### HistoryStore
```typescript
interface HistoryState {
  conversations: Conversation[]
  isLoading: boolean

  // Actions
  fetchConversations: () => Promise<void>
  searchConversations: (query: string) => Conversation[]
  deleteConversation: (id: string) => Promise<void>
}
```

#### UIStore
```typescript
interface UIState {
  isSidebarOpen: boolean
  isModelSelectorOpen: boolean
  theme: 'light' | 'dark'

  // Actions
  toggleSidebar: () => void
  openModelSelector: () => void
  closeModelSelector: () => void
  setTheme: (theme: 'light' | 'dark') => void
}
```

---

## API Integration

### ADDED:

#### Chat API Endpoints

**POST /api/chat/send**
```typescript
Request:
{
  conversationId?: string
  model: AIModel
  message: string
  context?: {
    previousMessages: Message[]
  }
}

Response:
{
  messageId: string
  content: MessageContent
  model: AIModel
  tokens: number
  latency: number
}

Errors:
- 400: Invalid request
- 429: Rate limit exceeded
- 500: AI API error
- 503: Service unavailable
```

**GET /api/chat/history**
```typescript
Request:
Query params:
- userId?: string
- limit?: number (default: 50)
- offset?: number
- model?: AIModel

Response:
{
  conversations: Conversation[]
  total: number
}
```

**GET /api/chat/conversation/:id**
```typescript
Response:
{
  conversation: Conversation
  messages: Message[]
}
```

**DELETE /api/chat/conversation/:id**
```typescript
Response:
{
  success: boolean
}
```

---

## Performance Considerations

### ADDED:

**Optimizations**:

1. **Message Virtualization**
   - Only render visible messages
   - Use react-window or react-virtuoso
   - Lazy load images

2. **Debouncing**
   - Typing indicator: 500ms debounce
   - Search: 300ms debounce
   - Auto-save: 1s debounce

3. **Caching**
   - Cache recent conversations (IndexedDB)
   - Cache song data
   - Cache YouTube thumbnails

4. **Code Splitting**
   - Lazy load Sidebar
   - Lazy load Model Selector
   - Lazy load Settings

5. **Optimistic Updates**
   - Show user message immediately
   - Show typing indicator immediately
   - Rollback on error

---

## Accessibility (a11y)

### ADDED:

**ARIA Labels**:
```html
<div role="log" aria-live="polite" aria-label="Chat messages">
  <!-- Messages -->
</div>

<textarea
  aria-label="Type your message"
  aria-describedby="input-hint"
/>

<button
  aria-label="Send message"
  aria-disabled={isLoading}
/>
```

**Keyboard Navigation**:
- Tab through all interactive elements
- Arrow keys for scrolling history
- Enter to send, Shift+Enter for new line
- Escape to close dialogs

**Screen Reader Support**:
- Announce new messages
- Announce loading state
- Announce errors
- Describe song cards fully

**Focus Management**:
- Focus input after send
- Focus first message when loading conversation
- Focus close button when modal opens

---

## Testing Requirements

### ADDED:

**Unit Tests**:
- Message rendering (user, AI, songs, errors)
- Input handling (text, enter, shift+enter)
- Category button clicks
- Model switching
- Error states

**Integration Tests**:
- Send message → receive response
- Load conversation history
- Switch models
- Delete conversation
- Search conversations

**E2E Tests**:
- Complete conversation flow
- Category button → recommendations → YouTube
- Model switching → new conversation
- Error recovery

**Performance Tests**:
- Render 100+ messages (target: <1s)
- Scroll performance (target: 60fps)
- Message send latency (target: <2s)

---

## Success Criteria

### ADDED:

**User Experience**:
- ✅ Chat loads in < 1s
- ✅ Message send feels instant (optimistic UI)
- ✅ Smooth scrolling (60fps)
- ✅ Clear visual feedback for all actions
- ✅ Intuitive without tutorial

**Technical**:
- ✅ Message render < 100ms
- ✅ 0 layout shifts (CLS = 0)
- ✅ Accessible (WCAG 2.1 AA)
- ✅ Works on all supported browsers
- ✅ Responsive 320px - 4K

**Business**:
- ✅ 80%+ messages lead to recommendations
- ✅ 5+ messages average per conversation
- ✅ <5% error rate
- ✅ 70%+ users use category buttons

---

## Out of Scope

### ADDED:

**Not in Phase 1**:
- ❌ Voice input
- ❌ Message editing
- ❌ Message reactions (like, dislike)
- ❌ Conversation sharing
- ❌ Export conversation (PDF, text)
- ❌ Rich text formatting (bold, italic)
- ❌ Emoji picker
- ❌ File attachments
- ❌ Group chat
- ❌ Real-time collaboration

---

## Dependencies

### ADDED:

**UI Libraries**:
- Prompt-kit-UI (chat components)
- Shadcn/UI (base components)
- Tailwind CSS (styling)
- Lucide React (icons)

**State Management**:
- Zustand (client state)
- TanStack Query (server state)

**Performance**:
- react-window or react-virtuoso (virtualization)
- intersection-observer (lazy load)

**Utilities**:
- date-fns (date formatting)
- clsx (conditional classes)

---

## Open Questions

### ADDED:

1. **Conversation Titles**:
   - Auto-generate from first message?
   - Let user edit?
   - Use AI to summarize?

2. **Message Limits**:
   - Max messages per conversation?
   - Max conversations per user?
   - Archive old conversations?

3. **Real-time Updates**:
   - Use WebSockets for streaming responses?
   - Or SSE (Server-Sent Events)?
   - Or polling?

4. **Offline Support**:
   - How much should work offline?
   - View history only?
   - Or allow queuing messages?

5. **Theme**:
   - Light mode only?
   - Dark mode?
   - System preference?

---

## Next Steps

1. ✅ Review this specification
2. 🔄 Create RAG System spec
3. 🔄 Create Admin Panel spec
4. 🔄 Create Architecture Design
5. 🔄 Create Technical Implementation Plan
6. 🔄 Start Phase 1 Development

---

**Document Version**: 1.0
**Created**: 2025-10-22
**Status**: Draft - Pending Review
