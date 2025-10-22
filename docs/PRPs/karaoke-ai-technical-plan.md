# Technical Implementation Plan: Karaoke AI Chat Agent

**Created**: 2025-10-22
**Status**: Final
**Type**: Technical Implementation Plan
**Related Documents**:
- Initial Vision: `docs/PRPs/karaoke-ai-initial-vision.md`
- Overview Spec: `openspec/changes/karaoke-ai-overview.md`
- Chat Interface Spec: `openspec/changes/karaoke-ai-chat-interface.md`
- RAG System Spec: `openspec/changes/karaoke-ai-rag-system.md`
- Admin Panel Spec: `openspec/changes/karaoke-ai-admin-panel.md`
- System Architecture: `docs/architecture/karaoke-ai-system-architecture.md`

---

## Table of Contents

1. [Development Environment Setup](#development-environment-setup)
2. [Phase 1: Chat + Song Search (Days 1-7)](#phase-1-chat--song-search-days-1-7)
3. [Phase 2: RAG System (Days 8-10)](#phase-2-rag-system-days-8-10)
4. [Phase 3: Admin Panel (Days 11-13)](#phase-3-admin-panel-days-11-13)
5. [Development Patterns](#development-patterns)
6. [Integration Guide](#integration-guide)
7. [Testing Strategy](#testing-strategy)
8. [Deployment Plan](#deployment-plan)

---

## Development Environment Setup

### Prerequisites

**Required Tools**:
```bash
# Node.js 18+ and npm
node --version  # v18.0.0+
npm --version   # v9.0.0+

# Git
git --version

# Code Editor
# VS Code recommended with extensions:
# - ESLint
# - Prettier
# - Tailwind CSS IntelliSense
# - TypeScript and JavaScript Language Features
```

**Required Accounts**:
- GitHub account (for repository)
- Vercel account (for deployment)
- Supabase account (for database + auth)
- z.ai account (API key ready)
- Google AI account (Gemini API key ready)
- YouTube Data API v3 (free tier)

### Step 1: Initialize Next.js Project

```bash
# Create new Next.js 15 project
npx create-next-app@latest karaoke-ai-chat \
  --typescript \
  --tailwind \
  --app \
  --use-npm \
  --import-alias "@/*"

cd karaoke-ai-chat
```

### Step 2: Install Core Dependencies

```bash
# AI & LangChain
npm install langchain @langchain/core @langchain/community
npm install ai @ai-sdk/openai @ai-sdk/google-genai
npm install chromadb

# Database & Auth
npm install @supabase/supabase-js @supabase/auth-helpers-nextjs

# UI Components
npm install @radix-ui/react-dialog @radix-ui/react-dropdown-menu
npm install @radix-ui/react-select @radix-ui/react-tabs
npm install @radix-ui/react-toast @radix-ui/react-tooltip
npm install class-variance-authority clsx tailwind-merge
npm install lucide-react

# State Management
npm install zustand @tanstack/react-query

# Forms & Validation
npm install react-hook-form zod @hookform/resolvers

# Utilities
npm install date-fns nanoid
```

### Step 3: Install Development Dependencies

```bash
npm install -D @types/node @types/react @types/react-dom
npm install -D eslint prettier eslint-config-prettier
npm install -D @testing-library/react @testing-library/jest-dom
npm install -D vitest @vitejs/plugin-react jsdom
```

### Step 4: Setup Environment Variables

Create `.env.local`:
```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# AI Models
ZAI_API_KEY=your_zai_api_key
ZAI_BASE_URL=https://api.z.ai/v1
GOOGLE_GENERATIVE_AI_API_KEY=your_gemini_api_key

# Optional AI Models
OPENAI_API_KEY=your_openai_key
ANTHROPIC_API_KEY=your_anthropic_key

# YouTube
YOUTUBE_API_KEY=your_youtube_api_key

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Step 5: Setup Supabase Project

**Database Tables**:
```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- conversations table
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  model TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  message_count INTEGER DEFAULT 0
);

-- messages table
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content JSONB NOT NULL,
  model TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB
);

-- songs table
CREATE TABLE songs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  external_id TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  artist TEXT NOT NULL,
  genre TEXT NOT NULL,
  year INTEGER,
  tempo INTEGER,
  language TEXT,
  dialect TEXT,
  lyrics TEXT,
  difficulty TEXT CHECK (difficulty IN ('Easy', 'Medium', 'Hard')),
  tags TEXT[],
  metadata JSONB,
  youtube_url TEXT,
  spotify_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- system_prompts table
CREATE TABLE system_prompts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  model TEXT NOT NULL,
  prompt TEXT NOT NULL,
  version INTEGER NOT NULL DEFAULT 1,
  is_active BOOLEAN DEFAULT false,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- analytics_events table
CREATE TABLE analytics_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_type TEXT NOT NULL,
  event_data JSONB,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- admin_logs table
CREATE TABLE admin_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  resource_type TEXT,
  resource_id TEXT,
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_conversations_user_id ON conversations(user_id);
CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_songs_genre ON songs(genre);
CREATE INDEX idx_songs_artist ON songs(artist);
CREATE INDEX idx_analytics_events_type ON analytics_events(event_type);
CREATE INDEX idx_analytics_events_created_at ON analytics_events(created_at);

-- Row Level Security
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE songs ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for conversations
CREATE POLICY "Users can view own conversations"
  ON conversations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own conversations"
  ON conversations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own conversations"
  ON conversations FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own conversations"
  ON conversations FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for messages
CREATE POLICY "Users can view messages in own conversations"
  ON messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = messages.conversation_id
      AND conversations.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create messages in own conversations"
  ON messages FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = messages.conversation_id
      AND conversations.user_id = auth.uid()
    )
  );

-- RLS Policies for songs (read-only for all users)
CREATE POLICY "Anyone can view songs"
  ON songs FOR SELECT
  TO authenticated, anon
  USING (true);

-- RLS Policies for system_prompts (admin only)
CREATE POLICY "Admins can manage system prompts"
  ON system_prompts FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- RLS Policies for analytics_events (write-only for users, read for admins)
CREATE POLICY "Users can create analytics events"
  ON analytics_events FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can view all analytics"
  ON analytics_events FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- RLS Policies for admin_logs (admin read-only)
CREATE POLICY "Admins can view admin logs"
  ON admin_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );
```

### Step 6: Setup Project Structure

```bash
# Create directory structure
mkdir -p src/app/{api,admin}
mkdir -p src/components/{chat,admin,ui}
mkdir -p src/lib/{supabase,langchain,chroma}
mkdir -p src/services
mkdir -p src/store
mkdir -p src/types
mkdir -p src/utils
mkdir -p public/data
```

---

## Phase 1: Chat + Song Search (Days 1-7)

### Day 1-2: Core Infrastructure

#### Task 1.1: Setup Supabase Client

**File**: `src/lib/supabase/client.ts`
```typescript
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { createClient } from '@supabase/supabase-js'

export const createBrowserClient = () => {
  return createClientComponentClient()
}

export const createServerClient = () => {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        persistSession: false,
      },
    }
  )
}
```

**File**: `src/lib/supabase/server.ts`
```typescript
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export const createClient = () => {
  const cookieStore = cookies()
  return createServerComponentClient({ cookies: () => cookieStore })
}
```

#### Task 1.2: Setup TypeScript Types

**File**: `src/types/index.ts`
```typescript
export type AIModel = 'glm-4.6' | 'gemini-2.0' | 'gpt-4o' | 'claude-3.5' | 'qwen3'

export interface Message {
  id: string
  conversationId: string
  role: 'user' | 'assistant'
  content: MessageContent
  model?: AIModel
  timestamp: Date
  metadata?: {
    tokens?: number
    latency?: number
    error?: string
  }
}

export interface MessageContent {
  type: 'text' | 'song-list' | 'category-select'
  text?: string
  songs?: SongRecommendation[]
  categories?: string[]
}

export interface SongRecommendation {
  id: string
  title: string
  artist: string
  genre: string
  year?: number
  tempo?: number
  language: string
  dialect?: string
  difficulty?: 'Easy' | 'Medium' | 'Hard'
  tags: string[]
  youtubeUrl?: string
  spotifyUrl?: string
  relevanceScore?: number
  reason?: string
}

export interface Conversation {
  id: string
  userId: string
  title: string
  model: AIModel
  createdAt: Date
  updatedAt: Date
  messageCount: number
}

export interface ChatState {
  currentConversationId: string | null
  messages: Message[]
  isLoading: boolean
  error: Error | null
  currentModel: AIModel
}
```

#### Task 1.3: Setup Chat Store (Zustand)

**File**: `src/store/chat-store.ts`
```typescript
import { create } from 'zustand'
import { AIModel, Message, MessageContent } from '@/types'

interface ChatState {
  // State
  currentConversationId: string | null
  messages: Message[]
  isLoading: boolean
  error: Error | null
  currentModel: AIModel

  // Actions
  sendMessage: (text: string) => Promise<void>
  sendCategory: (category: string) => Promise<void>
  switchModel: (model: AIModel) => Promise<void>
  loadConversation: (id: string) => Promise<void>
  createNewConversation: () => Promise<void>
  clearError: () => void
}

export const useChatStore = create<ChatState>((set, get) => ({
  // Initial State
  currentConversationId: null,
  messages: [],
  isLoading: false,
  error: null,
  currentModel: 'glm-4.6',

  // Send text message
  sendMessage: async (text: string) => {
    set({ isLoading: true, error: null })

    try {
      const { currentConversationId, currentModel, messages } = get()

      // Add user message optimistically
      const userMessage: Message = {
        id: `temp-${Date.now()}`,
        conversationId: currentConversationId || '',
        role: 'user',
        content: { type: 'text', text },
        timestamp: new Date(),
      }

      set({ messages: [...messages, userMessage] })

      // Call API
      const response = await fetch('/api/chat/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId: currentConversationId,
          message: text,
          model: currentModel,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to send message')
      }

      const data = await response.json()

      // Update with server response
      set({
        currentConversationId: data.conversationId,
        messages: data.messages,
        isLoading: false,
      })
    } catch (error) {
      set({ error: error as Error, isLoading: false })
    }
  },

  // Send category button click
  sendCategory: async (category: string) => {
    await get().sendMessage(`แนะนำเพลง${category}ให้หน่อย`)
  },

  // Switch AI model
  switchModel: async (model: AIModel) => {
    set({ currentModel: model })
  },

  // Load existing conversation
  loadConversation: async (id: string) => {
    set({ isLoading: true, error: null })

    try {
      const response = await fetch(`/api/chat/history?conversationId=${id}`)

      if (!response.ok) {
        throw new Error('Failed to load conversation')
      }

      const data = await response.json()

      set({
        currentConversationId: id,
        messages: data.messages,
        currentModel: data.model,
        isLoading: false,
      })
    } catch (error) {
      set({ error: error as Error, isLoading: false })
    }
  },

  // Create new conversation
  createNewConversation: async () => {
    set({
      currentConversationId: null,
      messages: [],
      error: null,
    })
  },

  // Clear error
  clearError: () => set({ error: null }),
}))
```

### Day 3-4: Chat Interface Components

#### Task 3.1: Message Component

**File**: `src/components/chat/message.tsx`
```typescript
import { Message as MessageType } from '@/types'
import { SongCard } from './song-card'
import { CategoryButtons } from './category-buttons'

interface MessageProps {
  message: MessageType
}

export function Message({ message }: MessageProps) {
  const isUser = message.role === 'user'

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div
        className={`max-w-[80%] rounded-lg p-4 ${
          isUser
            ? 'bg-blue-600 text-white'
            : 'bg-gray-100 text-gray-900'
        }`}
      >
        {/* Text content */}
        {message.content.text && (
          <p className="whitespace-pre-wrap">{message.content.text}</p>
        )}

        {/* Song recommendations */}
        {message.content.songs && message.content.songs.length > 0 && (
          <div className="mt-3 space-y-2">
            {message.content.songs.map((song) => (
              <SongCard key={song.id} song={song} />
            ))}
          </div>
        )}

        {/* Category buttons */}
        {message.content.categories && (
          <CategoryButtons categories={message.content.categories} />
        )}

        {/* Timestamp */}
        <p className="text-xs opacity-70 mt-2">
          {new Date(message.timestamp).toLocaleTimeString('th-TH')}
        </p>
      </div>
    </div>
  )
}
```

#### Task 3.2: Song Card Component

**File**: `src/components/chat/song-card.tsx`
```typescript
import { SongRecommendation } from '@/types'
import { Music, Video, Heart } from 'lucide-react'

interface SongCardProps {
  song: SongRecommendation
}

export function SongCard({ song }: SongCardProps) {
  const openYouTube = () => {
    if (song.youtubeUrl) {
      window.open(song.youtubeUrl, '_blank')
    }
  }

  return (
    <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-200">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900">{song.title}</h3>
          <p className="text-sm text-gray-600">{song.artist}</p>
          <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
            <span>{song.genre}</span>
            {song.year && <span>• {song.year}</span>}
            {song.tempo && <span>• {song.tempo} BPM</span>}
            {song.difficulty && (
              <span
                className={`px-2 py-0.5 rounded ${
                  song.difficulty === 'Easy'
                    ? 'bg-green-100 text-green-700'
                    : song.difficulty === 'Medium'
                    ? 'bg-yellow-100 text-yellow-700'
                    : 'bg-red-100 text-red-700'
                }`}
              >
                {song.difficulty}
              </span>
            )}
          </div>
          {song.tags && song.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {song.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 mt-3">
        <button
          onClick={openYouTube}
          className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
        >
          <Music className="w-4 h-4" />
          ฟังเพลง
        </button>
        <button
          onClick={openYouTube}
          className="flex items-center gap-1 px-3 py-1.5 bg-red-600 text-white rounded text-sm hover:bg-red-700"
        >
          <Video className="w-4 h-4" />
          ดูวิดีโอ
        </button>
        <button className="ml-auto p-1.5 hover:bg-gray-100 rounded">
          <Heart className="w-4 h-4 text-gray-400" />
        </button>
      </div>
    </div>
  )
}
```

#### Task 3.3: Category Buttons Component

**File**: `src/components/chat/category-buttons.tsx`
```typescript
import { useChatStore } from '@/store/chat-store'

const CATEGORIES = {
  thai: ['ลูกทุ่ง', 'ลูกกรุง', 'สตริง', 'หมอลำ', 'เพลงใต้', 'เพื่อชีวิต', 'สามช่า'],
  international: ['K-pop', 'C-pop', 'J-pop', 'Western'],
  charts: ['เพลงฮิต', 'ยอดนิยมในคาราโอเกะ'],
}

export function CategoryButtons() {
  const sendCategory = useChatStore((state) => state.sendCategory)

  return (
    <div className="space-y-4">
      <div>
        <h4 className="text-sm font-semibold mb-2">เพลงไทย</h4>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.thai.map((cat) => (
            <button
              key={cat}
              onClick={() => sendCategory(cat)}
              className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 text-sm"
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h4 className="text-sm font-semibold mb-2">เพลงสากล</h4>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.international.map((cat) => (
            <button
              key={cat}
              onClick={() => sendCategory(cat)}
              className="px-3 py-1.5 bg-purple-100 text-purple-700 rounded hover:bg-purple-200 text-sm"
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h4 className="text-sm font-semibold mb-2">ชาร์ต</h4>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.charts.map((cat) => (
            <button
              key={cat}
              onClick={() => sendCategory(cat)}
              className="px-3 py-1.5 bg-green-100 text-green-700 rounded hover:bg-green-200 text-sm"
            >
              {cat}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
```

#### Task 3.4: Chat Container

**File**: `src/components/chat/chat-container.tsx`
```typescript
'use client'

import { useEffect, useRef } from 'react'
import { useChatStore } from '@/store/chat-store'
import { Message } from './message'
import { ChatInput } from './chat-input'
import { ModelSelector } from './model-selector'
import { CategoryButtons } from './category-buttons'

export function ChatContainer() {
  const { messages, isLoading, error } = useChatStore()
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  return (
    <div className="flex flex-col h-screen max-w-4xl mx-auto">
      {/* Header */}
      <div className="border-b p-4 flex items-center justify-between">
        <h1 className="text-xl font-bold">Karaoke AI Chat</h1>
        <ModelSelector />
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full">
            <h2 className="text-2xl font-bold mb-4">
              สวัสดีครับ! 🎤
            </h2>
            <p className="text-gray-600 mb-6 text-center">
              ผมจะช่วยแนะนำเพลงไว้ร้องคาราโอเกะให้คุณครับ
              <br />
              ลองเลือกแนวเพลงที่ชอบได้เลย!
            </p>
            <CategoryButtons />
          </div>
        ) : (
          <>
            {messages.map((msg) => (
              <Message key={msg.id} message={msg} />
            ))}
            {isLoading && (
              <div className="flex justify-start mb-4">
                <div className="bg-gray-100 rounded-lg p-4">
                  <div className="flex gap-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100" />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200" />
                  </div>
                </div>
              </div>
            )}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Error */}
      {error && (
        <div className="px-4 py-2 bg-red-100 text-red-700 text-sm">
          เกิดข้อผิดพลาด: {error.message}
        </div>
      )}

      {/* Input */}
      <ChatInput />
    </div>
  )
}
```

### Day 5-6: API Routes & LangChain Integration

#### Task 5.1: Chat API Route

**File**: `src/app/api/chat/send/route.ts`
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { ChatService } from '@/services/chat-service'
import { AIModel } from '@/types'

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient()

    // Get user session
    const {
      data: { session },
    } = await supabase.auth.getSession()

    // Get request body
    const { conversationId, message, model } = await request.json()

    // Create or get conversation
    let finalConversationId = conversationId

    if (!finalConversationId) {
      // Create new conversation
      const { data: conversation, error } = await supabase
        .from('conversations')
        .insert({
          user_id: session?.user?.id || null,
          title: message.substring(0, 50),
          model: model || 'glm-4.6',
          message_count: 0,
        })
        .select()
        .single()

      if (error) throw error
      finalConversationId = conversation.id
    }

    // Save user message
    const { error: userMsgError } = await supabase
      .from('messages')
      .insert({
        conversation_id: finalConversationId,
        role: 'user',
        content: { type: 'text', text: message },
      })

    if (userMsgError) throw userMsgError

    // Generate AI response
    const chatService = new ChatService(model as AIModel)
    const response = await chatService.generateResponse(message, finalConversationId)

    // Save assistant message
    const { error: assistantMsgError } = await supabase
      .from('messages')
      .insert({
        conversation_id: finalConversationId,
        role: 'assistant',
        content: response.content,
        model: model,
        metadata: {
          tokens: response.tokens,
          latency: response.latency,
        },
      })

    if (assistantMsgError) throw assistantMsgError

    // Update conversation message count
    await supabase
      .from('conversations')
      .update({
        message_count: supabase.raw('message_count + 2'),
        updated_at: new Date().toISOString(),
      })
      .eq('id', finalConversationId)

    // Fetch all messages
    const { data: messages } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', finalConversationId)
      .order('created_at', { ascending: true })

    return NextResponse.json({
      conversationId: finalConversationId,
      messages,
    })
  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json(
      { error: 'Failed to process message' },
      { status: 500 }
    )
  }
}
```

#### Task 5.2: Chat Service with LangChain

**File**: `src/services/chat-service.ts`
```typescript
import { ChatOpenAI } from '@langchain/openai'
import { ChatGoogleGenerativeAI } from '@langchain/google-genai'
import { AIMessage, HumanMessage, SystemMessage } from '@langchain/core/messages'
import { AIModel, MessageContent } from '@/types'
import { RAGService } from './rag-service'

export class ChatService {
  private model: any
  private ragService: RAGService

  constructor(modelType: AIModel) {
    this.ragService = new RAGService()

    switch (modelType) {
      case 'glm-4.6':
        this.model = new ChatOpenAI({
          openAIApiKey: process.env.ZAI_API_KEY,
          configuration: {
            baseURL: process.env.ZAI_BASE_URL,
          },
          modelName: 'glm-4',
          temperature: 0.7,
        })
        break

      case 'gemini-2.0':
        this.model = new ChatGoogleGenerativeAI({
          apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
          modelName: 'gemini-2.0-flash-exp',
          temperature: 0.7,
        })
        break

      default:
        throw new Error(`Unsupported model: ${modelType}`)
    }
  }

  async generateResponse(
    userMessage: string,
    conversationId: string
  ): Promise<{
    content: MessageContent
    tokens?: number
    latency: number
  }> {
    const startTime = Date.now()

    try {
      // Detect if user is asking for song recommendations
      const isSongQuery = this.detectSongQuery(userMessage)

      if (isSongQuery) {
        // Use RAG to find relevant songs
        const songs = await this.ragService.searchSongs(userMessage, 5)

        // Generate response with songs
        const messages = [
          new SystemMessage(this.getSystemPrompt()),
          new HumanMessage(userMessage),
        ]

        const response = await this.model.invoke(messages)

        return {
          content: {
            type: 'song-list',
            text: response.content,
            songs,
          },
          latency: Date.now() - startTime,
        }
      } else {
        // Regular chat response
        const messages = [
          new SystemMessage(this.getSystemPrompt()),
          new HumanMessage(userMessage),
        ]

        const response = await this.model.invoke(messages)

        // Check if we should show category buttons
        const showCategories = this.shouldShowCategories(userMessage)

        return {
          content: {
            type: showCategories ? 'category-select' : 'text',
            text: response.content,
            categories: showCategories ? this.getCategories() : undefined,
          },
          latency: Date.now() - startTime,
        }
      }
    } catch (error) {
      console.error('Chat service error:', error)
      throw error
    }
  }

  private detectSongQuery(message: string): boolean {
    const keywords = [
      'แนะนำเพลง',
      'เพลง',
      'ร้อง',
      'คาราโอเกะ',
      'ลูกทุ่ง',
      'ลูกกรุง',
      'สตริง',
      'หมอลำ',
      'k-pop',
      'c-pop',
      'j-pop',
    ]
    return keywords.some((keyword) => message.toLowerCase().includes(keyword))
  }

  private shouldShowCategories(message: string): boolean {
    const triggers = ['สวัสดี', 'hello', 'hi', 'เริ่ม', 'ช่วย']
    return triggers.some((trigger) => message.toLowerCase().includes(trigger))
  }

  private getCategories(): string[] {
    return [
      'ลูกทุ่ง',
      'ลูกกรุง',
      'สตริง',
      'หมอลำ',
      'K-pop',
      'J-pop',
      'เพลงฮิต',
    ]
  }

  private getSystemPrompt(): string {
    return `คุณคือ Karaoke AI ผู้ช่วยแนะนำเพลงไว้ร้องคาราโอเกะ

บทบาทของคุณ:
- แนะนำเพลงที่เหมาะสมตามความต้องการของผู้ใช้
- ให้คำอธิบายว่าทำไมเพลงนี้เหมาะสม
- พูดคุยแบบเป็นกันเอง เป็นมิตร
- ใช้ภาษาไทยเป็นหลัก
- แนะนำทั้งเพลงไทยและเพลงสากล

แนวทางการแนะนำ:
- ถามเพิ่มเติมเพื่อเข้าใจความต้องการ
- พิจารณาระดับความยาก (ง่าย/ปานกลาง/ยาก)
- พิจารณาอารมณ์ของเพลง (เศร้า/สนุก/โรแมนติก)
- แนะนำ 3-5 เพลงต่อครั้ง`
  }
}
```

### Day 7: Mock Data & Testing

#### Task 7.1: Create Mock Song Data

**File**: `public/data/mock-songs.json`
```json
[
  {
    "id": "song_001",
    "title": "กระทบไหล่",
    "artist": "เก่ง ธชย",
    "genre": "ลูกกรุง",
    "year": 2019,
    "tempo": 90,
    "language": "Thai",
    "difficulty": "Easy",
    "tags": ["โรแมนติก", "ร้องง่าย", "ฮิต"],
    "youtubeUrl": "https://www.youtube.com/watch?v=...",
    "lyrics": "กระทบไหล่ที่ผ่านมา..."
  },
  {
    "id": "song_002",
    "title": "จุดเริ่มต้น",
    "artist": "Lipta",
    "genre": "ลูกกรุง",
    "year": 2020,
    "tempo": 120,
    "language": "Thai",
    "difficulty": "Medium",
    "tags": ["เศร้า", "ทำนองสวย"],
    "youtubeUrl": "https://www.youtube.com/watch?v=..."
  }
]
```

---

## Phase 2: RAG System (Days 8-10)

### Day 8: Chroma Setup & Document Loaders

#### Task 8.1: Setup Chroma Client

**File**: `src/lib/chroma/client.ts`
```typescript
import { ChromaClient } from 'chromadb'

let client: ChromaClient | null = null

export async function getChromaClient(): Promise<ChromaClient> {
  if (!client) {
    client = new ChromaClient({
      path: process.env.CHROMA_URL || 'http://localhost:8000',
    })
  }
  return client
}

export async function getOrCreateCollection(name: string = 'karaoke_songs') {
  const client = await getChromaClient()

  try {
    return await client.getOrCreateCollection({
      name,
      metadata: { 'hnsw:space': 'cosine' },
    })
  } catch (error) {
    console.error('Error creating collection:', error)
    throw error
  }
}
```

#### Task 8.2: Document Loader Service

**File**: `src/services/document-loader.ts`
```typescript
import { SongRecommendation } from '@/types'
import { SentenceTransformer } from '@/lib/embeddings'
import { getOrCreateCollection } from '@/lib/chroma/client'

export class DocumentLoader {
  private embedder: SentenceTransformer

  constructor() {
    this.embedder = new SentenceTransformer()
  }

  async loadSongsFromJSON(filePath: string): Promise<number> {
    try {
      const songs = await this.readJSONFile(filePath)
      return await this.indexSongs(songs)
    } catch (error) {
      console.error('Error loading songs:', error)
      throw error
    }
  }

  async indexSongs(songs: SongRecommendation[]): Promise<number> {
    const collection = await getOrCreateCollection()

    const documents = []
    const embeddings = []
    const metadatas = []
    const ids = []

    for (const song of songs) {
      // Create embedding text
      const embeddingText = this.createEmbeddingText(song)

      // Generate embedding
      const embedding = await this.embedder.encode(embeddingText)

      documents.push(embeddingText)
      embeddings.push(embedding)
      metadatas.push({
        title: song.title,
        artist: song.artist,
        genre: song.genre,
        year: song.year || 0,
        language: song.language,
        difficulty: song.difficulty || 'Medium',
        tags: song.tags.join(','),
        youtubeUrl: song.youtubeUrl || '',
      })
      ids.push(song.id)
    }

    // Add to collection
    await collection.add({
      ids,
      documents,
      embeddings,
      metadatas,
    })

    return songs.length
  }

  private createEmbeddingText(song: SongRecommendation): string {
    return `Title: ${song.title}
Artist: ${song.artist}
Genre: ${song.genre}
Language: ${song.language}
Tags: ${song.tags.join(', ')}
${song.lyrics ? `Lyrics: ${song.lyrics.substring(0, 500)}` : ''}`
  }

  private async readJSONFile(filePath: string): Promise<SongRecommendation[]> {
    // Implementation depends on environment (Node.js vs Browser)
    const fs = await import('fs/promises')
    const content = await fs.readFile(filePath, 'utf-8')
    return JSON.parse(content)
  }
}
```

### Day 9-10: RAG Service Implementation

**File**: `src/services/rag-service.ts`
```typescript
import { SongRecommendation } from '@/types'
import { getOrCreateCollection } from '@/lib/chroma/client'
import { SentenceTransformer } from '@/lib/embeddings'
import { createServerClient } from '@/lib/supabase/server'

export class RAGService {
  private embedder: SentenceTransformer

  constructor() {
    this.embedder = new SentenceTransformer()
  }

  async searchSongs(
    query: string,
    limit: number = 10,
    filters?: {
      genre?: string
      year?: { min?: number; max?: number }
      language?: string
      difficulty?: string
    }
  ): Promise<SongRecommendation[]> {
    try {
      // Generate query embedding
      const queryEmbedding = await this.embedder.encode(query)

      // Get collection
      const collection = await getOrCreateCollection()

      // Build where filter
      const where: any = {}
      if (filters?.genre) where.genre = filters.genre
      if (filters?.language) where.language = filters.language
      if (filters?.difficulty) where.difficulty = filters.difficulty
      if (filters?.year) {
        if (filters.year.min) where.year = { $gte: filters.year.min }
        if (filters.year.max) where.year = { ...where.year, $lte: filters.year.max }
      }

      // Search
      const results = await collection.query({
        queryEmbeddings: [queryEmbedding],
        nResults: limit * 2, // Get more for re-ranking
        where: Object.keys(where).length > 0 ? where : undefined,
      })

      // Convert to SongRecommendation
      const songs: SongRecommendation[] = []

      if (results.metadatas && results.metadatas[0]) {
        for (let i = 0; i < results.metadatas[0].length; i++) {
          const metadata = results.metadatas[0][i]
          const distance = results.distances?.[0]?.[i] || 0

          songs.push({
            id: results.ids[0][i],
            title: metadata.title as string,
            artist: metadata.artist as string,
            genre: metadata.genre as string,
            year: metadata.year as number,
            language: metadata.language as string,
            difficulty: metadata.difficulty as any,
            tags: (metadata.tags as string).split(','),
            youtubeUrl: metadata.youtubeUrl as string,
            relevanceScore: 1 - distance,
          })
        }
      }

      // Re-rank and limit
      const reranked = this.rerank(songs, query)
      return reranked.slice(0, limit)
    } catch (error) {
      console.error('RAG search error:', error)
      throw error
    }
  }

  private rerank(songs: SongRecommendation[], query: string): SongRecommendation[] {
    const currentYear = new Date().getFullYear()

    return songs
      .map((song) => {
        const relevance = song.relevanceScore || 0
        const popularity = this.estimatePopularity(song) / 100
        const recency = song.year ? 1 - (currentYear - song.year) / 50 : 0
        const exactMatch = this.hasExactMatch(song, query) ? 1 : 0

        const finalScore =
          relevance * 0.4 +
          popularity * 0.3 +
          recency * 0.2 +
          exactMatch * 0.1

        return { ...song, relevanceScore: finalScore }
      })
      .sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0))
  }

  private estimatePopularity(song: SongRecommendation): number {
    // Simple heuristic based on tags and year
    let score = 50

    if (song.tags.includes('ฮิต')) score += 30
    if (song.tags.includes('ยอดนิยม')) score += 20
    if (song.year && song.year >= 2020) score += 20

    return Math.min(score, 100)
  }

  private hasExactMatch(song: SongRecommendation, query: string): boolean {
    const lowerQuery = query.toLowerCase()
    return (
      song.title.toLowerCase().includes(lowerQuery) ||
      song.artist.toLowerCase().includes(lowerQuery)
    )
  }
}
```

---

## Phase 3: Admin Panel (Days 11-13)

### Overview
- Dashboard with analytics
- System prompt management
- Document upload (CSV/JSON)
- Song management (CRUD)
- Analytics visualization

### Implementation Guide
Follow detailed specifications in `openspec/changes/karaoke-ai-admin-panel.md`

---

## Development Patterns

### API Route Pattern
```typescript
// src/app/api/[resource]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient()
    // ... implementation
    return NextResponse.json({ data })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
```

### Service Pattern
```typescript
// src/services/[name]-service.ts
export class ServiceName {
  private dependency: Dependency

  constructor(config?: Config) {
    this.dependency = new Dependency(config)
  }

  async method(): Promise<Result> {
    // Implementation
  }
}
```

### Component Pattern
```typescript
// src/components/[name].tsx
'use client'

import { useState } from 'react'

interface Props {
  // Props
}

export function ComponentName({ ...props }: Props) {
  const [state, setState] = useState()

  return (
    <div>
      {/* JSX */}
    </div>
  )
}
```

---

## Integration Guide

### LangChain.js Integration
```typescript
import { ChatOpenAI } from '@langchain/openai'
import { ChatPromptTemplate } from '@langchain/core/prompts'

const model = new ChatOpenAI({
  openAIApiKey: process.env.API_KEY,
  modelName: 'gpt-4',
})

const prompt = ChatPromptTemplate.fromMessages([
  ['system', 'You are a helpful assistant'],
  ['human', '{input}'],
])

const chain = prompt.pipe(model)
const result = await chain.invoke({ input: 'Hello' })
```

### Supabase Integration
```typescript
import { createServerClient } from '@/lib/supabase/server'

const supabase = createServerClient()

// Query
const { data, error } = await supabase
  .from('table')
  .select('*')
  .eq('column', 'value')

// Insert
const { error } = await supabase
  .from('table')
  .insert({ column: 'value' })
```

---

## Testing Strategy

### Unit Tests
```typescript
// __tests__/services/chat-service.test.ts
import { describe, it, expect } from 'vitest'
import { ChatService } from '@/services/chat-service'

describe('ChatService', () => {
  it('should detect song query', () => {
    const service = new ChatService('glm-4.6')
    expect(service.detectSongQuery('แนะนำเพลง')).toBe(true)
  })
})
```

### Integration Tests
- Test API routes with mock Supabase
- Test RAG search with mock Chroma
- Test chat flow end-to-end

---

## Deployment Plan

### Step 1: Setup Vercel Project
```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

### Step 2: Configure Environment Variables
Add all `.env.local` variables to Vercel dashboard

### Step 3: Setup Supabase Production
- Create production project
- Run migrations
- Update environment variables

### Step 4: Monitor & Scale
- Setup Vercel Analytics
- Configure error tracking (Sentry)
- Monitor Supabase usage

---

**Document Version**: 1.0
**Created**: 2025-10-22
**Status**: Final
