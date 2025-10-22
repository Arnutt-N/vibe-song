# Karaoke AI Chat Agent - Initial Vision

**Project Name**: Karaoke AI Chat Agent
**Created**: 2025-10-22
**Status**: Specification Phase
**Timeline**: 2 weeks for full MVP

---

## Executive Summary

Karaoke AI Chat Agent เป็นแชทบอท AI ที่ช่วยแนะนำเพลงไว้ร้องคาราโอเกะ โดยเน้นเพลงไทยทุกแนวเพลง พร้อมรองรับเพลงสากลจากทั่วโลก ผ่านการสนทนาแบบธรรมชาติกับ AI

ผู้ใช้สามารถ:
- สนทนากับ AI เพื่อขอคำแนะนำเพลง
- เลือกหมวดหมู่เพลงด้วยปุ่มด่วน
- ฟังตัวอย่างเพลงและดูวิดีโอบน YouTube
- เลือก AI model ที่ต้องการใช้
- แชร์รายการเพลงที่แนะนำไปยัง Social Media

---

## Vision & Goals

### Vision Statement
> "ทำให้การเลือกเพลงร้องคาราโอเกะเป็นเรื่องง่าย สนุก และตรงใจผ่านการสนทนากับ AI ที่เข้าใจความต้องการของคุณ"

### Primary Goals

1. **ครอบคลุมเพลงไทยทุกแนว**
   - รองรับเพลงไทยหลักหมื่นเพลง
   - ครอบคลุมทุกยุคทุกสมัย
   - ทุกแนวเพลง: ลูกทุ่ง, ลูกกรุง, สตริง, หมอลำ, เพลงใต้, เพลงเพื่อชีวิต, สามช่า

2. **รองรับเพลงสากลครบทุกภูมิภาค**
   - เอเชีย: K-pop, C-pop, J-pop
   - ตะวันตก: US, UK, Europe

3. **AI ที่ฉลาดและเข้าใจบริบท**
   - เข้าใจความต้องการผู้ใช้
   - แนะนำเพลงตรงตามจังหวะและสำเนียง
   - เรียนรู้จากประวัติการใช้งาน

4. **ประสบการณ์ใช้งานที่ดี**
   - Chat interface ที่ใช้งานง่าย
   - รวดเร็ว responsive
   - แชร์ผลลัพธ์ได้ง่าย

---

## Target Users

### Primary Users (คนที่ไปร้องคาราโอเกะ)

**นักร้องมือใหม่**:
- ต้องการเพลงร้องง่าย
- ไม่แน่ใจว่าควรร้องเพลงอะไร
- ต้องการคำแนะนำจาก AI

**นักร้องมืออาชีพ/กึ่งมืออาชีพ**:
- มีรสนิยมเพลงเฉพาะ
- ต้องการหาเพลงใหม่ๆ ในแนวที่ชอบ
- ต้องการข้อมูลเพลงละเอียด (tempo, ย่านเสียง)

**กลุ่มเพื่อน/ครอบครัว**:
- ต้องการเพลงที่ร้องพร้อมกันได้
- ต้องการเพลงหลากหลายแนว
- ต้องการเพลงฮิตและคุ้นหู

### Secondary Users (Admin/Content Manager)

**Content Manager**:
- จัดการฐานข้อมูลเพลง
- อัพเดทข้อมูลเพลงใหม่
- จัดการหมวดหมู่

**System Admin**:
- ตั้งค่า AI behavior
- ดู analytics
- จัดการผู้ใช้

---

## Core User Needs

### 1. การค้นหาเพลง

**ปัญหา**: ผู้ใช้ไม่รู้ว่าควรร้องเพลงอะไร

**Solution**:
- AI ถามคำถามเพื่อทำความเข้าใจความต้องการ
- แนะนำเพลงตามอารมณ์, แนวเพลง, ศิลปิน
- ให้ข้อมูลเพลงครบถ้วน (tempo, ความยาก, ภาษา)

### 2. การเข้าถึงข้อมูลเพลง

**ปัญหา**: ต้องการฟังเพลงก่อนตัดสินใจ

**Solution**:
- ลิงก์ YouTube สำหรับดูวิดีโอ
- ข้อมูล metadata (ศิลปิน, ปี, แนว)
- เนื้อเพลง (lyrics)

### 3. การจัดการรายการเพลง

**ปัญหา**: ต้องการบันทึกและแชร์รายการเพลง

**Solution**:
- บันทึกประวัติการสนทนา
- แชร์รายการเพลงไป Social Media
- Export รายการเพลง

### 4. ความยืดหยุ่นในการใช้ AI

**ปัญหา**: AI แต่ละตัวมีจุดแข็งต่างกัน

**Solution**:
- รองรับหลาย AI models (GLM 4.6, Gemini, OpenAI, Anthropic, Qwen3)
- ให้ผู้ใช้เลือกได้ว่าจะใช้ model ไหน
- แสดงความแตกต่างของแต่ละ model

---

## Key Features (MVP Scope)

### Phase 1: Chat + Song Search (Core MVP)

**Must Have**:
1. ✅ Chat UI with AI (Prompt-kit-UI + Shadcn/UI)
2. ✅ Multi-model support (GLM 4.6, Gemini)
3. ✅ Song database (รายชื่อเพลง + metadata)
4. ✅ Category quick buttons
5. ✅ YouTube video links
6. ✅ Authentication (Supabase Auth)
7. ✅ Chat history

**Nice to Have**:
- Spotify preview links
- Lyrics display in chat
- Song difficulty rating

### Phase 2: RAG System

**Must Have**:
1. ✅ Document loader (CSV/JSON)
2. ✅ Free embedding model
3. ✅ Chroma vector store
4. ✅ RAG-enhanced recommendations
5. ✅ Semantic search

**Nice to Have**:
- PDF document support
- Real-time indexing
- Advanced filtering

### Phase 3: Admin Panel

**Must Have**:
1. ✅ System prompt editor
2. ✅ Document upload (CSV, JSON, PDF)
3. ✅ Category management
4. ✅ Analytics dashboard
5. ✅ User management

**Nice to Have**:
- Batch operations
- Import/Export configurations
- Advanced analytics (charts)

### Phase 4: Advanced Features

**Must Have**:
1. ✅ Social sharing (Facebook, Line, Twitter)
2. ✅ MCP integration (fastMCP)
3. ✅ Model switching UI

**Nice to Have**:
- Playlist generation
- Voice input
- Mobile app

---

## Success Criteria

### User Metrics

**Adoption**:
- 100+ registered users in first month
- 1,000+ chat messages per week
- 50+ daily active users

**Engagement**:
- Average 5+ messages per conversation
- 70%+ users return within 7 days
- 30%+ conversations lead to YouTube clicks

**Satisfaction**:
- 4.5+ stars rating
- 80%+ users find recommended songs helpful
- <2% error rate in song recommendations

### Technical Metrics

**Performance**:
- Chat response time < 2 seconds
- Page load time < 3 seconds
- 99.5%+ uptime

**Data Quality**:
- 10,000+ Thai songs indexed
- 5,000+ International songs indexed
- 95%+ songs have valid YouTube links
- 90%+ songs have lyrics

**AI Quality**:
- 85%+ recommendation relevance
- <5% hallucination rate
- Multi-language support (TH, EN)

---

## Non-Goals (Out of Scope for MVP)

### Phase 1-3 Out of Scope

❌ **Music Streaming**
- เราไม่ได้สร้าง music player
- ใช้ YouTube links แทน

❌ **Karaoke Video Creation**
- ไม่สร้างวิดีโอคาราโอเกะ
- ให้ link ไปหาบน YouTube

❌ **Social Network Features**
- ไม่มี follow, like, comment
- แค่ basic sharing

❌ **Mobile App**
- MVP เป็น web-based เท่านั้น
- Mobile-responsive web

❌ **Real-time Collaboration**
- ไม่มี multi-user playlist editing
- Individual user experience

❌ **Payment/Subscription**
- Free service
- ไม่มี premium features

❌ **Voice Recognition**
- Text-based chat only
- ไม่มี voice input (ในขั้นนี้)

---

## User Journey

### Journey 1: นักร้องมือใหม่หาเพลงร้องง่าย

**User**: เด็กหญิง 22 ปี ไปร้องคาราโอเกะกับเพื่อน ครั้งแรก ไม่รู้ว่าควรร้องเพลงอะไร

**Steps**:
1. เข้าเว็บ → Sign up ด้วย Google
2. เห็นหน้า Chat + ปุ่มหมวดหมู่
3. พิมพ์: "อยากหาเพลงร้องง่ายๆ ค่ะ"
4. AI ตอบ: "เพลงแนวไหนที่ชอบคะ? ลูกทุ่ง ลูกกรุง หรือเพลงสากล?"
5. User คลิกปุ่ม "ลูกกรุง"
6. AI แนะนำ 5 เพลง พร้อมปุ่ม [ฟังเพลง] [ดูวิดีโอ]
7. User คลิกดูวิดีโอ → เปิด YouTube
8. User พอใจ → คลิก "แชร์" → ส่งไปกลุ่ม Line

**Outcome**: ✅ หาเพลงเจอภายใน 2 นาที

### Journey 2: นักร้องมืออาชีพหาเพลงใหม่

**User**: ชาย 35 ปี ร้องเพลงเก่ง ชอบลูกทุ่งอีสาน ต้องการเพลงใหม่ๆ

**Steps**:
1. เข้าเว็บ → Login (เคยใช้)
2. พิมพ์: "หาเพลงลูกทุ่งอีสานใหม่ๆ ให้หน่อย จังหวะเร็ว"
3. AI ใช้ RAG ค้นหา → แนะนำ 10 เพลง ปี 2023-2025
4. แสดง metadata: tempo, ศิลปิน, ปี
5. User เลือก 3 เพลง → บันทึกใน history
6. ครั้งต่อไป AI จำความชอบได้

**Outcome**: ✅ ได้เพลงใหม่ตรงใจ, AI เรียนรู้ preference

### Journey 3: กลุ่มเพื่อนหาเพลงร้องพร้อมกัน

**User**: กลุ่มเพื่อน 5 คน อายุ 25-30 ต้องการเพลงฮิตที่ร้องง่าย

**Steps**:
1. คนหนึ่งเปิดเว็บ
2. คลิกปุ่ม "เพลงฮิต"
3. AI แสดง Chart ปัจจุบัน + ยอดนิยมในคาราโอเกะ
4. เลือกเพลงจาก list
5. แชร์ list ไปกลุ่ม

**Outcome**: ✅ หาเพลงเร็ว, ทุกคนเห็น list

### Journey 4: Admin จัดการข้อมูลเพลง

**User**: Admin ต้องการเพิ่มเพลงใหม่ 100 เพลง

**Steps**:
1. Login เข้า Admin Panel
2. ไปที่ "Document Upload"
3. Upload CSV file (100 เพลง + metadata + lyrics)
4. ระบบ auto-index ด้วย embeddings
5. เพิ่มเข้า Chroma vector store
6. ตรวจสอบใน "Analytics" ว่าเพลงถูก index แล้ว

**Outcome**: ✅ เพิ่มข้อมูลเสร็จภายใน 5 นาที

---

## Technical Constraints

### Budget
- **Hosting**: Vercel Free tier
- **Database**: Supabase Free tier
- **AI APIs**: Free tier + มี API keys (GLM 4.6, Gemini)
- **Total Cost**: $0/month (MVP)

### Performance
- **Chat response**: < 2 seconds
- **Page load**: < 3 seconds
- **Vector search**: < 1 second
- **Support**: 100 concurrent users

### Data Limits
- **Songs**: 10,000+ Thai, 5,000+ International
- **Vector storage**: Chroma (unlimited locally, or hosted)
- **Chat history**: 1,000 messages per user
- **Document size**: 10MB per file upload

### Browser Support
- Chrome, Firefox, Safari, Edge (latest 2 versions)
- Mobile browsers (iOS Safari, Android Chrome)

---

## Dependencies

### External Services

**Required**:
- ✅ Supabase (Database + Auth)
- ✅ Vercel (Hosting)
- ✅ z.ai API (GLM 4.6) - มี API key
- ✅ Google AI API (Gemini) - มี API key
- ✅ YouTube Data API v3 (ฟรี, 10,000 units/day)

**Optional**:
- ⚪ OpenAI API (gpt-4o, gpt-4o-mini)
- ⚪ Anthropic API (Claude 3.5)
- ⚪ Alibaba Cloud (Qwen3)
- ⚪ Spotify API (preview links)

### Data Sources

**Song Data** (ต้องหา):
- Thai song database (CSV/JSON)
  - Sources: เว็บเพลงไทย, Joox, BEC-Tero
- International song database
  - Sources: Spotify charts, Billboard, MusicBrainz
- Lyrics database
  - Sources: Genius, AZLyrics, Thai lyrics sites

**YouTube Links**:
- YouTube Data API v3
- Search by song name + artist

---

## Risks & Mitigation

### Technical Risks

**Risk 1: Free tier limitations**
- Vercel: 100GB bandwidth/month
- Supabase: 500MB database, 2GB storage
- **Mitigation**: Monitor usage, optimize queries, upgrade if needed

**Risk 2: AI API rate limits**
- z.ai: Unknown limits
- Gemini: 15 RPM (free tier)
- **Mitigation**: Implement caching, fallback to other models

**Risk 3: Song data quality**
- ข้อมูลไม่ครบ, YouTube links เสีย
- **Mitigation**: Data validation, admin tools for fixing

**Risk 4: Vector store performance**
- Chroma ช้าเมื่อข้อมูลเยอะ
- **Mitigation**: Index optimization, pagination, caching

### Business Risks

**Risk 1: Copyright issues**
- เนื้อเพลงอาจมี copyright
- **Mitigation**:
  - ใช้ snippets เท่านั้น
  - Link ไป official sources
  - Fair use policy

**Risk 2: Data acquisition**
- หาข้อมูลเพลงไทยยาก
- **Mitigation**:
  - Web scraping (legal sources)
  - Crowdsourcing
  - Partnership กับ content providers

**Risk 3: User adoption**
- ผู้ใช้อาจไม่คุ้นเคยกับ AI chatbot
- **Mitigation**:
  - UI ที่ใช้งานง่าย
  - Onboarding tutorial
  - Example prompts

---

## Timeline & Milestones

### Week 1: Foundation + Phase 1

**Days 1-2**: Specification & Architecture ✅
- Complete specification
- Architecture design
- Technical plan
- Data model design

**Days 3-5**: Phase 1 Development
- Project setup (Next.js 15 + LangChain.js)
- Chat UI (Prompt-kit-UI + Shadcn)
- AI integration (GLM 4.6 + Gemini)
- Mock song database
- Category buttons
- YouTube integration

**Days 6-7**: Phase 1 Testing & Polish
- Manual testing
- Bug fixes
- UI/UX improvements
- Deploy to Vercel

### Week 2: Phase 2 + Phase 3

**Days 8-10**: Phase 2 Development
- Document loader
- Embedding model setup
- Chroma vector store
- RAG pipeline
- Enhanced search

**Days 11-13**: Phase 3 Development
- Admin dashboard layout
- System prompt editor
- Document upload
- Category management
- Analytics dashboard

**Day 14**: Integration & Final Testing
- End-to-end testing
- Performance optimization
- Documentation
- Deployment

---

## Success Metrics (KPIs)

### User Engagement
- **DAU** (Daily Active Users): 50+
- **Messages per session**: 5+
- **Session duration**: 3+ minutes
- **Return rate (7-day)**: 70%+

### Feature Usage
- **Chat usage**: 80%+ users use chat
- **Category buttons**: 60%+ users use
- **YouTube clicks**: 40%+ recommendations clicked
- **Sharing**: 20%+ users share

### Technical Performance
- **Response time**: <2s (95th percentile)
- **Error rate**: <2%
- **Uptime**: 99.5%+
- **Search relevance**: 85%+ (user feedback)

### Content Quality
- **Songs indexed**: 15,000+
- **Valid YouTube links**: 95%+
- **Lyrics coverage**: 90%+
- **Metadata completeness**: 95%+

---

## Next Steps

### Immediate Actions (Today)

1. ✅ **Finalize Specification**
   - Review this document
   - Get user approval
   - Archive to openspec/specs/

2. 🔄 **Create Architecture Design**
   - System architecture
   - Tech stack details
   - Data flow diagrams
   - API design

3. 🔄 **Create Technical Plan**
   - Phase 1 detailed plan
   - Phase 2 detailed plan
   - Phase 3 detailed plan
   - Implementation guide

### Week 1 Actions

4. **Setup Project**
   - Next.js 15 + LangChain.js
   - Supabase setup
   - UI components (Prompt-kit-UI + Shadcn)

5. **Start Phase 1 Development**
   - Chat interface
   - AI integration
   - Song database

---

## Appendix

### Glossary

- **RAG**: Retrieval-Augmented Generation - AI ที่ดึงข้อมูลจาก database มาช่วยตอบ
- **Embedding**: การแปลงข้อความเป็น vector เพื่อค้นหาความหมาย
- **Vector Store**: ฐานข้อมูลสำหรับเก็บ embeddings
- **MCP**: Model Context Protocol - protocol สำหรับ AI agents
- **LangChain**: Framework สำหรับสร้าง AI applications
- **LangGraph**: Extension ของ LangChain สำหรับ complex workflows

### References

- LangChain.js: https://js.langchain.com/
- Next.js 15: https://nextjs.org/
- Supabase: https://supabase.com/
- Prompt-kit-UI: https://promptkit.vercel.app/
- Chroma: https://www.trychroma.com/
- fastMCP: https://github.com/jlowin/fastmcp

---

**Document Version**: 1.0
**Last Updated**: 2025-10-22
**Status**: Draft → Pending Approval
