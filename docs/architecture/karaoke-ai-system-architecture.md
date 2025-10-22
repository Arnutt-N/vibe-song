# Karaoke AI Chat Agent - System Architecture

**Document**: System Architecture Design
**Created**: 2025-10-22
**Version**: 1.0
**Status**: Draft

---

## Overview

This document describes the complete system architecture for Karaoke AI Chat Agent, including components, data flow, technology stack, and deployment architecture.

---

## System Context Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         External Services                        │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐       │
│  │ z.ai GLM │  │ Google   │  │ YouTube  │  │ Supabase │       │
│  │ 4.6 API  │  │ Gemini   │  │ Data API │  │ Cloud    │       │
│  └─────┬────┘  └─────┬────┘  └─────┬────┘  └─────┬────┘       │
└────────┼─────────────┼─────────────┼─────────────┼─────────────┘
         │             │             │             │
         │             │             │             │
┌────────┼─────────────┼─────────────┼─────────────┼─────────────┐
│        │             │             │             │             │
│   ┌────▼──────────────▼──────────────▼──────────────▼──────┐  │
│   │          Karaoke AI Chat Agent (Vercel)                │  │
│   │                                                         │  │
│   │  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐ │  │
│   │  │  Next.js 15  │  │  LangChain.js│  │   Chroma    │ │  │
│   │  │  Frontend    │  │  + LangGraph │  │ Vector Store│ │  │
│   │  └──────────────┘  └──────────────┘  └─────────────┘ │  │
│   │                                                         │  │
│   │  User Interface                                        │  │
│   │  - Chat Interface                                       │  │
│   │  - Admin Panel                                          │  │
│   └─────────────────────────────────────────────────────────┘  │
│                                                                 │
│                        Karaoke AI System                        │
└─────────────────────────────────────────────────────────────────┘
         │
         │  (Users access via browser)
         │
    ┌────▼────┐
    │ End     │
    │ Users   │
    └─────────┘
```

---

## High-Level Architecture

```
┌──────────────────────────────────────────────────────────────────────┐
│                          Presentation Layer                           │
│  ┌────────────────────────────┐  ┌────────────────────────────────┐ │
│  │     User Chat Interface    │  │      Admin Panel              │ │
│  │  - Chat UI                 │  │  - Dashboard                   │ │
│  │  - Song Cards              │  │  - Prompt Editor               │ │
│  │  - Category Buttons        │  │  - Document Upload             │ │
│  │  - Model Selector          │  │  - Analytics                   │ │
│  │  - History Sidebar         │  │  - User Management             │ │
│  └────────────┬───────────────┘  └────────────┬───────────────────┘ │
└───────────────┼──────────────────────────────┼──────────────────────┘
                │                              │
                │         Next.js 15            │
                │       React Components        │
                │                              │
┌───────────────┼──────────────────────────────┼──────────────────────┐
│               │     Application Layer        │                       │
│               │                              │                       │
│  ┌────────────▼──────────────┐  ┌───────────▼──────────────────┐  │
│  │   Chat API Routes         │  │   Admin API Routes           │  │
│  │  /api/chat/send           │  │  /api/admin/prompts          │  │
│  │  /api/chat/history        │  │  /api/admin/documents        │  │
│  │  /api/chat/conversation   │  │  /api/admin/analytics        │  │
│  └────────────┬──────────────┘  └───────────┬──────────────────┘  │
│               │                              │                       │
│  ┌────────────▼──────────────────────────────▼──────────────────┐  │
│  │                  Business Logic Layer                         │  │
│  │                                                                │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌───────────────────┐  │  │
│  │  │  Chat        │  │  RAG         │  │  Admin            │  │  │
│  │  │  Service     │  │  Service     │  │  Service          │  │  │
│  │  └──────┬───────┘  └──────┬───────┘  └─────────┬─────────┘  │  │
│  └─────────┼──────────────────┼────────────────────┼────────────┘  │
└────────────┼──────────────────┼────────────────────┼───────────────┘
             │                  │                    │
┌────────────┼──────────────────┼────────────────────┼───────────────┐
│            │   Integration    │ Layer              │               │
│            │                  │                    │               │
│  ┌─────────▼─────────┐  ┌────▼────────────┐  ┌────▼────────────┐ │
│  │  AI Orchestration │  │  Vector Search  │  │  Data Access    │ │
│  │  - LangChain.js   │  │  - Chroma       │  │  - Supabase SDK │ │
│  │  - LangGraph      │  │  - Embeddings   │  │  - CRUD Ops     │ │
│  │  - Model Routing  │  │  - Similarity   │  │                 │ │
│  └─────────┬─────────┘  └────┬────────────┘  └────┬────────────┘ │
└────────────┼──────────────────┼────────────────────┼───────────────┘
             │                  │                    │
┌────────────┼──────────────────┼────────────────────┼───────────────┐
│            │   Data Layer     │                    │               │
│            │                  │                    │               │
│  ┌─────────▼─────────┐  ┌────▼────────────┐  ┌────▼────────────┐ │
│  │  External AI APIs │  │  Vector Store   │  │  Supabase       │ │
│  │  - z.ai (GLM 4.6) │  │  - Chroma DB    │  │  - PostgreSQL   │ │
│  │  - Google Gemini  │  │  - Embeddings   │  │  - Auth         │ │
│  │  - OpenAI         │  │  - Collections  │  │  - Storage      │ │
│  │  - Anthropic      │  │                 │  │                 │ │
│  └───────────────────┘  └─────────────────┘  └─────────────────┘ │
└──────────────────────────────────────────────────────────────────────┘
```

---

## Component Architecture

### Frontend Architecture (Next.js 15)

```
src/
├── app/                      # Next.js 15 App Router
│   ├── (chat)/              # Chat routes
│   │   ├── page.tsx         # Main chat page
│   │   └── layout.tsx       # Chat layout
│   ├── admin/               # Admin routes
│   │   ├── page.tsx         # Dashboard
│   │   ├── prompts/         # Prompt management
│   │   ├── documents/       # Document upload
│   │   ├── songs/           # Song management
│   │   ├── categories/      # Category management
│   │   ├── analytics/       # Analytics
│   │   ├── users/           # User management
│   │   └── settings/        # Settings
│   ├── api/                 # API Routes
│   │   ├── chat/            # Chat endpoints
│   │   │   ├── send/route.ts
│   │   │   └── history/route.ts
│   │   ├── rag/             # RAG endpoints
│   │   │   ├── search/route.ts
│   │   │   └── index/route.ts
│   │   └── admin/           # Admin endpoints
│   │       ├── prompts/route.ts
│   │       ├── documents/route.ts
│   │       └── analytics/route.ts
│   ├── layout.tsx           # Root layout
│   └── globals.css          # Global styles
│
├── components/              # React components
│   ├── chat/               # Chat components
│   │   ├── chat-container.tsx
│   │   ├── message-list.tsx
│   │   ├── message-input.tsx
│   │   ├── song-card.tsx
│   │   └── category-buttons.tsx
│   ├── admin/              # Admin components
│   │   ├── dashboard.tsx
│   │   ├── stats-card.tsx
│   │   ├── data-table.tsx
│   │   └── file-upload.tsx
│   ├── ui/                 # UI primitives (Shadcn)
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   └── ...
│   └── layout/             # Layout components
│       ├── header.tsx
│       └── sidebar.tsx
│
├── lib/                    # Utilities
│   ├── supabase/          # Supabase client
│   │   ├── client.ts
│   │   └── server.ts
│   ├── langchain/         # LangChain setup
│   │   ├── chains.ts
│   │   └── agents.ts
│   ├── chroma/            # Chroma client
│   │   └── client.ts
│   └── utils.ts           # Utilities
│
├── services/              # Business logic
│   ├── chat-service.ts
│   ├── rag-service.ts
│   ├── admin-service.ts
│   └── song-service.ts
│
├── store/                 # State management (Zustand)
│   ├── chat-store.ts
│   ├── history-store.ts
│   ├── ui-store.ts
│   └── admin-store.ts
│
└── types/                 # TypeScript types
    ├── chat.ts
    ├── song.ts
    ├── rag.ts
    └── admin.ts
```

### Backend Architecture (API Routes + Services)

```
API Routes (Next.js Route Handlers)
    │
    ├─ Chat API
    │   ├─ POST /api/chat/send
    │   │   └─> ChatService.sendMessage()
    │   │       ├─> RAGService.search()  (retrieve context)
    │   │       ├─> LangChainService.chat()  (generate response)
    │   │       └─> SupabaseService.saveMessage()
    │   │
    │   ├─ GET /api/chat/history
    │   │   └─> ChatService.getHistory()
    │   │       └─> SupabaseService.fetchConversations()
    │   │
    │   └─ GET /api/chat/conversation/:id
    │       └─> ChatService.getConversation()
    │           └─> SupabaseService.fetchMessages()
    │
    ├─ RAG API
    │   ├─ POST /api/rag/search
    │   │   └─> RAGService.search()
    │   │       ├─> EmbeddingService.embed()
    │   │       ├─> ChromaService.query()
    │   │       └─> RerankService.rerank()
    │   │
    │   └─ POST /api/rag/index
    │       └─> RAGService.indexDocuments()
    │           ├─> DataValidationService.validate()
    │           ├─> EmbeddingService.batchEmbed()
    │           └─> ChromaService.add()
    │
    └─ Admin API
        ├─ PUT /api/admin/prompts/:model
        │   └─> AdminService.updatePrompt()
        │       └─> SupabaseService.savePrompt()
        │
        ├─ POST /api/admin/documents/upload
        │   └─> AdminService.uploadDocuments()
        │       └─> RAGService.indexDocuments()
        │
        └─ GET /api/admin/analytics
            └─> AdminService.getAnalytics()
                └─> SupabaseService.queryAnalytics()
```

---

## Data Flow

### Chat Flow

```
1. User Input
   │
   ▼
2. Frontend (Chat UI)
   - User types message
   - Clicks Send
   │
   ▼
3. API Route (/api/chat/send)
   - Receive message
   - Validate input
   │
   ▼
4. Chat Service
   - Extract intent (genre, mood, etc.)
   - Check cache
   │
   ▼
5. RAG Service (if needed)
   - Generate query embedding
   - Search Chroma vector store
   - Retrieve top 10 songs
   - Rerank results
   │
   ▼
6. LangChain Service
   - Prepare prompt with context
   - Route to selected AI model (GLM 4.6 / Gemini / etc.)
   - Stream response
   │
   ▼
7. Response Processing
   - Parse AI response
   - Extract song recommendations
   - Fetch YouTube links (if not cached)
   - Format response
   │
   ▼
8. Save to Database (Supabase)
   - Save user message
   - Save AI response
   - Save recommended songs (for analytics)
   │
   ▼
9. Return to Frontend
   - Send formatted response
   │
   ▼
10. Frontend Renders
    - Display AI message
    - Render song cards
    - Show action buttons
```

### RAG Indexing Flow

```
1. Admin Upload
   │
   ▼
2. Document Upload API
   - Receive file (CSV/JSON/PDF)
   - Validate format
   │
   ▼
3. Data Validation
   - Check required fields
   - Validate data types
   - Check duplicates
   │
   ▼
4. Document Processing
   - Parse file
   - Extract songs
   - Clean data
   │
   ▼
5. Embedding Generation
   - Prepare text (title + artist + lyrics + tags)
   - Batch process (100 songs/batch)
   - Generate 384-dim vectors
   │
   ▼
6. Chroma Indexing
   - Add to collection
   - Create metadata
   - Build HNSW index
   │
   ▼
7. Database Update
   - Save songs to Supabase
   - Update counters
   - Log action
   │
   ▼
8. Response
   - Return success/error summary
   - Show indexed count
```

---

## Technology Stack

### Frontend

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Framework | Next.js 15 | React framework with App Router |
| UI Library | React 18+ | Component-based UI |
| Styling | Tailwind CSS | Utility-first CSS |
| Components | Shadcn/UI + Prompt-kit-UI | Pre-built components |
| Icons | Lucide React | Icon library |
| State Management | Zustand | Client state |
| Server State | TanStack Query | API caching |
| Forms | React Hook Form + Zod | Form handling & validation |
| Charts | Recharts | Analytics visualization |

### Backend

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Runtime | Node.js 20+ | JavaScript runtime |
| API | Next.js API Routes | RESTful endpoints |
| AI Framework | LangChain.js | AI orchestration |
| Workflow | LangGraph | Complex AI workflows |
| Validation | Zod | Schema validation |

### AI Models

| Model | Provider | Use Case | Status |
|-------|----------|----------|--------|
| GLM 4.6 | z.ai | Primary chat model | ✅ Have key |
| Gemini 2.0 | Google | Alternative chat model | ✅ Have key |
| GPT-4o | OpenAI | Optional (premium) | ⚪ Optional |
| Claude 3.5 | Anthropic | Optional (premium) | ⚪ Optional |
| Qwen3 | Alibaba | Optional | ⚪ Optional |

### Data Storage

| Component | Technology | Purpose |
|-----------|-----------|---------|
| Database | Supabase (PostgreSQL) | Relational data |
| Auth | Supabase Auth | Authentication |
| File Storage | Supabase Storage | Document uploads |
| Vector Store | Chroma | Embeddings & similarity search |
| Cache | Vercel KV (optional) | Query caching |

### Embeddings & Search

| Component | Technology | Purpose |
|-----------|-----------|---------|
| Embedding Model | sentence-transformers | Text to vector (free) |
| Model Name | multilingual-MiniLM-L12-v2 | Thai + English support |
| Vector DB | Chroma | Semantic search |
| Search Algorithm | HNSW + Cosine similarity | Fast approximate search |

### DevOps & Deployment

| Component | Technology | Purpose |
|-----------|-----------|---------|
| Hosting | Vercel (Free tier) | App deployment |
| CI/CD | Vercel Git Integration | Auto-deploy |
| Monitoring | Vercel Analytics | Performance monitoring |
| Logging | Vercel Logs | Error tracking |
| Database | Supabase (Free tier) | Cloud PostgreSQL |

---

## Database Schema

### Supabase Tables

#### conversations
```sql
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  model TEXT NOT NULL,  -- 'glm-4', 'gemini-2', etc.
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  message_count INTEGER DEFAULT 0
);

CREATE INDEX idx_conversations_user_id ON conversations(user_id);
CREATE INDEX idx_conversations_created_at ON conversations(created_at DESC);
```

#### messages
```sql
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content JSONB NOT NULL,  -- {type, text, songs, buttons, etc.}
  model TEXT,  -- for assistant messages
  created_at TIMESTAMP DEFAULT NOW(),
  metadata JSONB  -- {tokens, latency, error, etc.}
);

CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_messages_created_at ON messages(created_at DESC);
```

#### songs
```sql
CREATE TABLE songs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  external_id TEXT UNIQUE NOT NULL,  -- e.g., "song_001"
  title TEXT NOT NULL,
  artist TEXT NOT NULL,
  genre TEXT NOT NULL,
  year INTEGER,
  tempo INTEGER,
  language TEXT,
  dialect TEXT,
  image_url TEXT,
  youtube_url TEXT,
  spotify_url TEXT,
  lyrics TEXT,
  difficulty TEXT CHECK (difficulty IN ('Easy', 'Medium', 'Hard')),
  tags TEXT[],
  metadata JSONB,  -- {popularity_score, karaoke_count, etc.}
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_songs_genre ON songs(genre);
CREATE INDEX idx_songs_year ON songs(year);
CREATE INDEX idx_songs_language ON songs(language);
CREATE INDEX idx_songs_external_id ON songs(external_id);
```

#### system_prompts
```sql
CREATE TABLE system_prompts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  model TEXT NOT NULL,
  prompt TEXT NOT NULL,
  version INTEGER NOT NULL DEFAULT 1,
  is_active BOOLEAN DEFAULT FALSE,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_system_prompts_model ON system_prompts(model);
CREATE INDEX idx_system_prompts_is_active ON system_prompts(is_active);
```

#### analytics_events
```sql
CREATE TABLE analytics_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_type TEXT NOT NULL,  -- 'song_recommended', 'song_clicked', etc.
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  song_id UUID REFERENCES songs(id) ON DELETE SET NULL,
  conversation_id UUID REFERENCES conversations(id) ON DELETE SET NULL,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_analytics_event_type ON analytics_events(event_type);
CREATE INDEX idx_analytics_created_at ON analytics_events(created_at DESC);
```

#### admin_logs
```sql
CREATE TABLE admin_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id TEXT,
  details JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_admin_logs_user_id ON admin_logs(user_id);
CREATE INDEX idx_admin_logs_created_at ON admin_logs(created_at DESC);
```

### Row Level Security (RLS) Policies

```sql
-- conversations: users can only see their own
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own conversations"
  ON conversations FOR SELECT
  USING (auth.uid() = user_id);

-- messages: users can only see their own
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own messages"
  ON messages FOR SELECT
  USING (
    conversation_id IN (
      SELECT id FROM conversations WHERE user_id = auth.uid()
    )
  );

-- songs: public read, admin write
ALTER TABLE songs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view songs"
  ON songs FOR SELECT
  USING (true);
CREATE POLICY "Admins can modify songs"
  ON songs FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid()
      AND raw_user_meta_data->>'role' IN ('admin', 'super_admin')
    )
  );

-- admin tables: admin only
ALTER TABLE system_prompts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins only"
  ON system_prompts FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid()
      AND raw_user_meta_data->>'role' IN ('admin', 'super_admin')
    )
  );
```

---

## Deployment Architecture

### Vercel Deployment

```
┌─────────────────────────────────────────────────┐
│              Vercel Edge Network                │
│  ┌───────────────────────────────────────────┐ │
│  │         CDN (Static Assets)               │ │
│  │  - JS bundles                             │ │
│  │  - CSS files                              │ │
│  │  - Images                                 │ │
│  └───────────────────────────────────────────┘ │
│                                                 │
│  ┌───────────────────────────────────────────┐ │
│  │      Serverless Functions               │ │
│  │  - API Routes (/api/*)                    │ │
│  │  - SSR Pages                              │ │
│  │  - Edge Middleware                        │ │
│  └───────────────────────────────────────────┘ │
└─────────────────────────────────────────────────┘
         │                    │
         │                    │
         ▼                    ▼
┌──────────────────┐  ┌──────────────────┐
│  Supabase Cloud  │  │  External APIs   │
│  - PostgreSQL    │  │  - z.ai          │
│  - Auth          │  │  - Google Gemini │
│  - Storage       │  │  - YouTube       │
└──────────────────┘  └──────────────────┘
```

### File Storage

```
Vercel:
  /public/          → CDN
  /.next/static/    → CDN

Supabase Storage:
  /documents/       → Uploaded CSVs, JSONs, PDFs
  /images/          → Song album arts (if uploaded)

Chroma:
  ./chroma_data/    → Local (in Vercel serverless function)
  OR
  Chroma Cloud      → Hosted (for production)
```

---

## Security Architecture

### Authentication Flow

```
1. User Sign Up/Login
   │
   ▼
2. Supabase Auth
   - Email/password or OAuth
   - Generate JWT token
   │
   ▼
3. Client stores token
   - localStorage (session)
   - Secure httpOnly cookie (optional)
   │
   ▼
4. API requests include token
   - Authorization: Bearer <token>
   │
   ▼
5. API Route validates token
   - Supabase SDK verifies JWT
   - Extract user_id and role
   │
   ▼
6. Authorize action
   - Check role permissions
   - Check RLS policies
```

### Security Measures

| Layer | Security Measure |
|-------|-----------------|
| Authentication | Supabase Auth (JWT tokens) |
| Authorization | Role-based access control (RBAC) |
| Database | Row Level Security (RLS) |
| API Keys | Environment variables (encrypted) |
| HTTPS | Enforced by Vercel |
| CORS | Restricted origins |
| Rate Limiting | Per-user limits (60 req/hour) |
| Input Validation | Zod schemas |
| XSS Protection | React automatic escaping |
| CSRF Protection | Same-origin policy |

---

## Performance Optimizations

### Frontend

- **Code Splitting**: Dynamic imports for heavy components
- **Image Optimization**: Next.js Image component
- **Caching**: TanStack Query for server state
- **Virtualization**: react-window for long lists
- **Debouncing**: Input delays (300ms)
- **Lazy Loading**: Below-fold content

### Backend

- **Query Caching**: Frequent queries cached (1 hour TTL)
- **Embedding Caching**: User query embeddings cached (24 hours)
- **Connection Pooling**: Supabase connection pool
- **Batch Processing**: Bulk operations (100 items/batch)
- **Async Processing**: Background jobs for indexing

### Database

- **Indexes**: All foreign keys and frequent queries
- **Pagination**: Limit + offset for large result sets
- **Materialized Views**: Pre-computed analytics (optional)

---

## Scalability Considerations

### Horizontal Scaling

| Component | Scaling Strategy |
|-----------|-----------------|
| Vercel Functions | Auto-scales (up to 100 concurrent) |
| Supabase | Auto-scales (Free: 500MB → Pro: 8GB+) |
| Chroma | Single instance (Phase 1) → Hosted (Phase 2+) |

### Vertical Scaling

| Resource | Phase 1 (MVP) | Phase 2 | Phase 3 |
|----------|---------------|---------|---------|
| Songs | 10,000 | 50,000 | 100,000+ |
| Users | 1,000 | 10,000 | 50,000+ |
| Concurrent | 100 | 1,000 | 5,000+ |
| Database | 500MB | 8GB | 32GB+ |

---

## Monitoring & Observability

### Metrics to Track

**Application**:
- Request rate (per endpoint)
- Response time (p50, p95, p99)
- Error rate
- User sessions

**AI**:
- Model usage (per model)
- Average response time
- Token usage
- Error rate (per model)

**RAG**:
- Query latency
- Cache hit rate
- Embedding generation time
- Vector store size

**Database**:
- Query time
- Connection pool usage
- Storage usage
- Row count

### Tools

- **Vercel Analytics**: Performance monitoring
- **Supabase Dashboard**: Database metrics
- **Custom Dashboard**: Admin analytics panel
- **Logs**: Vercel Logs + Supabase Logs

---

## Disaster Recovery

### Backup Strategy

| Component | Backup Frequency | Retention |
|-----------|-----------------|-----------|
| Database | Daily (Supabase automatic) | 7 days |
| Vector Store | Weekly | 30 days |
| System Prompts | On every change | Unlimited (versioned) |
| User Data | Daily | 30 days |

### Recovery Plan

1. **Database Failure**:
   - Supabase automatic failover
   - Restore from backup (< 1 hour)

2. **Vercel Failure**:
   - Redeploy from Git
   - Rollback to previous version

3. **AI API Failure**:
   - Automatic fallback to alternative model
   - Graceful error message to user

4. **Vector Store Failure**:
   - Fallback to keyword search
   - Rebuild from database (< 30 minutes)

---

## Development Workflow

### Git Workflow

```
main (production)
  │
  ├─ develop (staging)
  │   │
  │   ├─ feature/chat-interface
  │   ├─ feature/rag-system
  │   ├─ feature/admin-panel
  │   └─ bugfix/*
  │
  └─ hotfix/* (emergency fixes)
```

### CI/CD Pipeline

```
1. Developer pushes to branch
   │
   ▼
2. GitHub Actions (optional)
   - Run tests
   - Type check
   - Lint
   │
   ▼
3. Vercel Preview Deployment
   - Auto-deploy to preview URL
   - Comment on PR
   │
   ▼
4. Code Review
   - Review changes
   - Test on preview
   │
   ▼
5. Merge to main
   │
   ▼
6. Vercel Production Deployment
   - Auto-deploy to production
   - Run health checks
```

---

## Next Steps

1. ✅ Review Architecture Design
2. 🔄 Create Technical Implementation Plan
3. 🔄 Setup Development Environment
4. 🔄 Start Phase 1 Implementation

---

**Document Version**: 1.0
**Created**: 2025-10-22
**Status**: Draft - Pending Review
