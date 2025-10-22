# Feature Specification: Karaoke AI Chat Agent - Overview

**Created**: 2025-10-22
**Status**: Draft
**Type**: Overview Specification
**Related Specs**:
- Chat Interface (karaoke-ai-chat-interface.md)
- RAG System (karaoke-ai-rag-system.md)
- Admin Panel (karaoke-ai-admin-panel.md)

---

## Overview

Karaoke AI Chat Agent เป็น AI-powered chatbot ที่ช่วยแนะนำเพลงไว้ร้องคาราโอเกะ โดยครอบคลุมเพลงไทยทุกแนวเพลงและเพลงสากลจากทั่วโลก ผ่านการสนทนาแบบธรรมชาติ

## User Need

**Problem**:
- ผู้ใช้ไม่รู้ว่าควรร้องเพลงอะไรในคาราโอเกะ
- ต้องการคำแนะนำเพลงที่ตรงกับความต้องการ (อารมณ์, แนวเพลง, ระดับความยาก)
- ต้องการฟังตัวอย่างและดูวิดีโอก่อนตัดสินใจ
- ต้องการบันทึกและแชร์รายการเพลง

**Solution**:
- AI chatbot ที่สนทนาเพื่อเข้าใจความต้องการ
- ฐานข้อมูลเพลงไทยและสากลหลักหมื่นเพลง
- RAG system สำหรับค้นหาเพลงที่เกี่ยวข้อง
- Integration กับ YouTube สำหรับดูวิดีโอ
- Sharing features สำหรับแชร์รายการเพลง

---

## Requirements

### Functional Requirements

#### ADDED:

**FR-1: Multi-Model AI Chat**
- System MUST support multiple AI models:
  - z.ai GLM 4.6
  - Google Gemini
  - OpenAI GPT-4/4o (optional)
  - Anthropic Claude (optional)
  - Alibaba Qwen3 (optional)
- Users MUST be able to switch between models
- System MUST show which model is currently active
- Each model MUST maintain separate conversation context

**FR-2: Thai Song Coverage**
- System MUST include Thai songs across all genres:
  - ลูกทุ่ง (Country Thai)
  - ลูกกรุง (Thai Pop)
  - สตริง (String/Folk)
  - หมอลำ (Mor Lam/Isaan)
  - เพลงใต้ (Southern Thai)
  - เพลงเพื่อชีวิต (Songs for Life)
  - สามช่า (3 Cha)
- Minimum 10,000 Thai songs
- Metadata: ชื่อเพลง, ศิลปิน, แนว, ปีที่ออก, tempo, ภาษา/สำเนียง
- Lyrics SHOULD be available for 90%+ of songs

**FR-3: International Song Coverage**
- System MUST include international songs:
  - K-pop (Korean)
  - C-pop (Chinese)
  - J-pop (Japanese)
  - Western (US, UK, Europe)
- Minimum 5,000 international songs
- Same metadata requirements as Thai songs

**FR-4: Quick Category Access**
- System MUST provide quick-access buttons for:
  - **Thai Genres**: ลูกทุ่ง, ลูกกรุง, สตริง, หมอลำ, เพลงใต้, เพลงเพื่อชีวิต, สามช่า
  - **International**: K-pop, C-pop, J-pop, Western
  - **Charts**: เพลงฮิตปัจจุบัน, ยอดนิยมในคาราโอเกะ
- Clicking button MUST trigger AI to recommend songs in that category
- Buttons MUST be visible and accessible on all screen sizes

**FR-5: YouTube Integration**
- Each song recommendation MUST include YouTube video link
- System MUST search YouTube for: "[song name] [artist]" or "[song name] [artist] karaoke"
- Links MUST open in new tab
- System SHOULD cache YouTube links to reduce API calls
- Fallback to manual search if auto-link fails

**FR-6: Song Preview**
- Each song recommendation MUST show:
  - Song name
  - Artist name
  - Genre
  - Year
  - Tempo (BPM) if available
  - Language/Dialect
  - [ฟังเพลง] button → YouTube
  - [ดูวิดีโอ] button → YouTube
- Lyrics SHOULD be viewable (expand/collapse)

**FR-7: Chat History**
- System MUST save all conversations for logged-in users
- Users MUST be able to view past conversations
- Users MUST be able to continue previous conversations
- Users MUST be able to delete conversations
- Conversations MUST include timestamp and model used

**FR-8: Authentication**
- System MUST support Supabase Auth
- Login methods:
  - Email/Password
  - Google OAuth
  - (Optional) Line, Facebook
- Anonymous users CAN use basic chat
- Logged-in users GET:
  - Chat history
  - Saved songs
  - Personalized recommendations

**FR-9: Social Sharing**
- Users MUST be able to share song recommendations to:
  - Facebook
  - Line
  - Twitter/X
- Share format:
  - Title: "แนะนำเพลงจาก Karaoke AI"
  - Song list with links
  - Link back to app
- Users CAN copy share link
- Users CAN export as text/image

---

### Non-Functional Requirements

#### ADDED:

**NFR-1: Performance**
- Chat response time < 2 seconds (p95)
- Page load time < 3 seconds
- Vector search < 1 second
- Support 100 concurrent users
- API timeout: 30 seconds max

**NFR-2: Scalability**
- Handle 10,000+ songs (Phase 1)
- Handle 50,000+ songs (Phase 2+)
- Support 1,000+ users
- Chat history: 1,000 messages per user

**NFR-3: Reliability**
- 99.5%+ uptime
- Error rate < 2%
- Graceful degradation when AI API fails
- Automatic retry for failed requests

**NFR-4: Usability**
- Mobile-responsive (320px+)
- Keyboard navigation support
- Screen reader compatible
- Thai and English UI support
- Clear error messages

**NFR-5: Security**
- Supabase RLS for data protection
- API keys stored in environment variables
- Rate limiting on API endpoints
- Input sanitization
- No sensitive data in logs

**NFR-6: Data Quality**
- 95%+ songs have valid YouTube links
- 90%+ songs have lyrics
- 100% songs have basic metadata
- Regular data validation

---

## User Scenarios

### ADDED:

### Scenario 1: นักร้องมือใหม่หาเพลงร้องง่าย

**As a**: นักร้องมือใหม่
**I want to**: หาเพลงที่ร้องง่ายสำหรับคาราโอเกะ
**So that**: ไม่อายเพื่อนและสนุกกับการร้อง

**Pre-conditions**:
- User เข้าเว็บครั้งแรก
- ยังไม่ได้ login

**Steps**:
1. User เข้าหน้าแรก
2. เห็น Chat interface พร้อม welcome message
3. พิมพ์: "หาเพลงร้องง่ายๆ หน่อย"
4. AI ตอบ: "เพลงแนวไหนที่ชอบครับ? มีให้เลือก:"
   - Shows category buttons
5. User คลิก "ลูกกรุง"
6. AI แนะนำ 5 เพลง พร้อม [ฟังเพลง] [ดูวิดีโอ]
7. User คลิก [ดูวิดีโอ] เพลงแรก
8. YouTube เปิดในแท็บใหม่

**Expected Outcome**:
- ✅ User ได้รับคำแนะนำภายใน 10 วินาที
- ✅ เพลงที่แนะนำมีความยากระดับ Easy
- ✅ YouTube link ทำงาน
- ✅ User พอใจและใช้ต่อ

**Post-conditions**:
- Conversation saved (if user logs in later)
- Analytics recorded

---

### Scenario 2: นักร้องมืออาชีพค้นหาเพลงเฉพาะแนว

**As a**: นักร้องมืออาชีพ
**I want to**: หาเพลงหมอลำใหม่ๆ จังหวะเร็ว
**So that**: เพิ่มเพลงใหม่ในรายการ

**Pre-conditions**:
- User logged in
- มี chat history

**Steps**:
1. User พิมพ์: "หาเพลงหมอลำใหม่ๆ ปี 2024-2025 จังหวะเร็ว"
2. AI ใช้ RAG search หาเพลงที่ตรงเงื่อนไข:
   - Genre: หมอลำ
   - Year: 2024-2025
   - Tempo: High (120+ BPM)
3. AI แนะนำ 10 เพลง พร้อม metadata:
   - ชื่อเพลง, ศิลปิน
   - ปี, tempo (BPM)
   - ภาษา/สำเนียง (อีสาน)
4. User เลือก 3 เพลง → คลิกฟัง
5. User พอใจ → บันทึกใน history

**Expected Outcome**:
- ✅ AI ค้นหาได้แม่นยำ (semantic search)
- ✅ แสดง metadata ที่ละเอียด
- ✅ ผลลัพธ์เรียงตามความเกี่ยวข้อง
- ✅ User พบเพลงที่ต้องการ

---

### Scenario 3: กลุ่มเพื่อนหาเพลงฮิต

**As a**: กลุ่มเพื่อน
**I want to**: หาเพลงฮิตที่ร้องง่ายและคุ้นหู
**So that**: ทุกคนสามารถร่วมร้องได้

**Pre-conditions**:
- User อาจ login หรือไม่ก็ได้

**Steps**:
1. User คลิกปุ่ม "เพลงฮิต"
2. AI แสดง:
   - Chart ปัจจุบัน (10 เพลง)
   - ยอดนิยมในคาราโอเกะ (10 เพลง)
3. User เลือกเพลงจาก list
4. User คลิก "แชร์" → เลือก Line
5. สร้าง share message พร้อม song list
6. ส่งไปกลุ่ม Line

**Expected Outcome**:
- ✅ Chart data up-to-date
- ✅ Sharing ทำงานได้
- ✅ เพื่อนๆ เห็น list เดียวกัน

---

### Scenario 4: Admin อัพเดทข้อมูลเพลง

**As a**: Admin
**I want to**: เพิ่มเพลงใหม่ 100 เพลง
**So that**: ระบบมีเพลงใหม่สำหรับ users

**Pre-conditions**:
- Admin logged in
- มี CSV file พร้อม

**Steps**:
1. Admin เข้า Admin Panel
2. ไปที่ "Document Upload"
3. Upload CSV file:
   ```csv
   title,artist,genre,year,tempo,language,youtube_url,lyrics
   เพลงใหม่,ศิลปิน,ลูกทุ่ง,2025,120,Thai,https://...,เนื้อเพลง...
   ```
4. System validate data
5. System create embeddings
6. System add to Chroma vector store
7. Admin ดูใน Analytics: "100 songs indexed"

**Expected Outcome**:
- ✅ Upload สำเร็จ
- ✅ Data ถูก validate
- ✅ Indexing ทำงานอัตโนมัติ
- ✅ Songs พร้อมใช้ทันที

---

## Success Criteria

### ADDED:

**User Experience**:
- ✅ Users find relevant songs in < 30 seconds
- ✅ 85%+ recommended songs are relevant
- ✅ 95%+ YouTube links work
- ✅ Chat response feels natural
- ✅ UI is intuitive (no training needed)

**Technical**:
- ✅ Response time < 2s (95th percentile)
- ✅ Search relevance > 85% (user feedback)
- ✅ Error rate < 2%
- ✅ 15,000+ songs indexed
- ✅ Multi-model switching works smoothly

**Business**:
- ✅ 100+ users in first month
- ✅ 70%+ return rate (7-day)
- ✅ 4.5+ stars rating
- ✅ 30%+ users share recommendations

---

## Out of Scope

### ADDED:

**Phase 1-3 MVP**:
- ❌ Music streaming/playback (use YouTube)
- ❌ Karaoke video creation
- ❌ Voice input
- ❌ Mobile app (web only)
- ❌ Real-time collaboration
- ❌ Payment/Subscription
- ❌ Social network features (follow, like, comment)
- ❌ Playlist auto-generation
- ❌ Song difficulty AI scoring (manual only)

---

## Dependencies

### ADDED:

**External APIs**:
- Supabase (Database + Auth) - Required
- z.ai API (GLM 4.6) - Required, have key
- Google AI API (Gemini) - Required, have key
- YouTube Data API v3 - Required, free tier
- OpenAI API - Optional
- Anthropic API - Optional
- Spotify API - Optional

**Data Sources**:
- Thai song database (need to find/create)
- International song database (can use MusicBrainz, Spotify charts)
- Lyrics (need to scrape/aggregate)

**Libraries**:
- LangChain.js (AI orchestration)
- LangGraph (workflow)
- Next.js 15 (framework)
- Prompt-kit-UI (chat UI)
- Shadcn/UI (components)
- Chroma (vector store)
- fastMCP (MCP integration)

---

## Open Questions

### ADDED:

**Data Acquisition**:
- Q1: จะหาข้อมูลเพลงไทย 10,000 เพลงจากไหน?
  - Option: Web scraping legal sites
  - Option: Partnership กับ content providers
  - Option: Crowdsourcing

- Q2: จะหา lyrics จากไหน?
  - Option: Thai lyrics websites
  - Option: Genius API
  - Option: Manual entry (crowdsource)

**Technical**:
- Q3: Embedding model ที่ support Thai ดีที่สุดคืออะไร?
  - Option: sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2
  - Option: intfloat/multilingual-e5-large
  - Option: OpenAI embeddings (ไม่ฟรี)

- Q4: Chroma จะ host ที่ไหน?
  - Option: Local (in Next.js server)
  - Option: Cloud-hosted Chroma
  - Option: Supabase pgvector instead

**Product**:
- Q5: ควรมี song difficulty rating ไหม?
  - Manual rating by admin?
  - AI-generated (future)?

- Q6: ควรมี vocal range info ไหม?
  - Nice to have แต่ยาก

---

## Next Steps

1. ✅ Review and approve this overview spec
2. 🔄 Create detailed specs for each component:
   - Chat Interface spec
   - RAG System spec
   - Admin Panel spec
3. 🔄 Create Architecture Design
4. 🔄 Create Technical Plan
5. 🔄 Start Implementation

---

**Document Version**: 1.0
**Created**: 2025-10-22
**Status**: Draft
