# Feature Specification: RAG System

**Feature**: Retrieval-Augmented Generation (RAG) System
**Created**: 2025-10-22
**Status**: Draft
**Priority**: HIGH (Phase 2 Core)
**Related**: karaoke-ai-overview.md, karaoke-ai-chat-interface.md

---

## Overview

RAG System เป็นระบบที่ช่วยให้ AI สามารถค้นหาและแนะนำเพลงได้แม่นยำ โดยใช้ semantic search บนฐานข้อมูลเพลงหลักหมื่นเพลง ผ่าน embeddings และ vector store (Chroma)

## User Need

**Problem**:
- AI ต้องการข้อมูลเพลงที่ละเอียดและถูกต้อง
- การค้นหาแบบ keyword ไม่เพียงพอ (ต้องเข้าใจความหมาย)
- ต้องการค้นหาเพลงที่ "คล้าย" หรือ "เกี่ยวข้อง" ได้
- ต้องการข้อมูลเพลงใหม่ๆ โดยไม่ต้อง retrain AI

**Solution**:
- Embedding model แปลงข้อมูลเพลงเป็น vectors
- Chroma vector store เก็บ embeddings
- Semantic search หาเพลงที่เกี่ยวข้อง
- RAG pipeline ดึงข้อมูลมาให้ AI ใช้ตอบ

---

## Requirements

### Functional Requirements

#### ADDED:

**FR-RAG-1: Document Structure**

Each song document MUST contain:
```json
{
  "id": "song_001",
  "title": "ชื่อเพลง",
  "artist": "ชื่อศิลปิน",
  "genre": "ลูกทุ่ง",
  "year": 2024,
  "tempo": 120,
  "language": "Thai",
  "dialect": "Isaan",
  "lyrics": "เนื้อเพลง...",
  "description": "คำอธิบายเพลง (optional)",
  "tags": ["เศร้า", "โรแมนติก", "ร้องง่าย"],
  "youtubeUrl": "https://youtube.com/...",
  "spotifyUrl": "https://spotify.com/...",
  "imageUrl": "https://...",
  "difficulty": "Easy",
  "metadata": {
    "added_date": "2024-01-01",
    "popularity_score": 85,
    "karaoke_count": 1250
  }
}
```

**Required fields**:
- id, title, artist, genre
- At least one of: lyrics OR description OR tags

**Optional fields**:
- year, tempo, language, dialect
- youtubeUrl, spotifyUrl, imageUrl
- difficulty, metadata

**FR-RAG-2: Document Loading**

System MUST support multiple input formats:

**CSV Format**:
```csv
id,title,artist,genre,year,tempo,language,lyrics,youtubeUrl,tags
song_001,ชื่อเพลง,ศิลปิน,ลูกทุ่ง,2024,120,Thai,"เนื้อเพลง...",https://...,เศร้า;โรแมนติก
```

**JSON Format**:
```json
{
  "songs": [
    {
      "id": "song_001",
      "title": "...",
      ...
    }
  ]
}
```

**JSON Lines Format** (.jsonl):
```json
{"id": "song_001", "title": "...", ...}
{"id": "song_002", "title": "...", ...}
```

**PDF Format** (optional):
- Extract text from PDF
- Parse structured data
- Auto-detect format

**FR-RAG-3: Embedding Generation**

**Text to Embed**:

Combine multiple fields into searchable text:
```python
embedding_text = f"""
Title: {title}
Artist: {artist}
Genre: {genre}
Language: {language}
Lyrics: {lyrics[:500]}  # first 500 chars
Tags: {', '.join(tags)}
Description: {description}
"""
```

**Embedding Model**:
- MUST be free (no API cost)
- MUST support Thai language
- SHOULD be multilingual
- Recommended: `sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2`
- Alternative: `intfloat/multilingual-e5-large`

**Embedding Dimension**: 384 or 768 (depending on model)

**FR-RAG-4: Vector Store (Chroma)**

**Collection Structure**:
```python
collection = chroma_client.create_collection(
    name="karaoke_songs",
    metadata={
        "description": "Karaoke song database",
        "embedding_model": "paraphrase-multilingual-MiniLM-L12-v2",
        "dimension": 384
    }
)
```

**Document Format in Chroma**:
```python
collection.add(
    ids=["song_001"],
    embeddings=[[0.1, 0.2, ...]],  # 384-dim vector
    documents=["full song text"],
    metadatas=[{
        "title": "ชื่อเพลง",
        "artist": "ศิลปิน",
        "genre": "ลูกทุ่ง",
        "year": 2024,
        ...
    }]
)
```

**Storage Options**:
- **Local**: Persist to disk (./chroma_data/)
- **Hosted**: Chroma Cloud (optional, for production)
- **Alternative**: Supabase pgvector (if needed)

**FR-RAG-5: Search Strategies**

**1. Semantic Search** (primary):
```python
results = collection.query(
    query_texts=["เพลงเศร้าๆ ของคาราบาว"],
    n_results=10,
    where={"genre": "ลูกทุ่ง"}  # optional filter
)
```

**2. Hybrid Search** (semantic + keyword):
```python
# Semantic search
semantic_results = collection.query(
    query_texts=[query],
    n_results=20
)

# Keyword filter
keyword_results = filter_by_keywords(
    semantic_results,
    keywords=["คาราบาว"]
)

# Combine and re-rank
final_results = rerank(semantic_results, keyword_results)
```

**3. Filtered Search** (metadata filters):
```python
results = collection.query(
    query_texts=[query],
    n_results=10,
    where={
        "genre": {"$in": ["ลูกทุ่ง", "ลูกกรุง"]},
        "year": {"$gte": 2020},
        "language": "Thai"
    }
)
```

**4. Multi-query Search** (for complex queries):
```python
# Query: "เพลงเศร้าๆ ร้องง่าย"
queries = [
    "เพลงเศร้า โศกเศร้า เสียใจ",
    "เพลงร้องง่าย ทำนองง่าย",
    "เพลงช้าๆ เพลงเบาๆ"
]

results_list = [
    collection.query(query_texts=[q], n_results=10)
    for q in queries
]

# Combine and deduplicate
final_results = deduplicate(results_list)
```

**FR-RAG-6: Retrieval Logic**

**Standard Flow**:
1. User query: "หาเพลงลูกทุ่งเศร้าๆ"
2. AI extracts intent:
   - Genre: ลูกทุ่ง
   - Mood: เศร้า
   - Other: None
3. Build search params:
   ```python
   {
       "query": "เพลงเศร้า โศกเศร้า เสียใจ อกหัก",
       "filters": {"genre": "ลูกทุ่ง"},
       "limit": 10
   }
   ```
4. Execute vector search
5. Get top 10 results
6. Return to AI with context

**Context Format for AI**:
```
<relevant_songs>
1. "ชื่อเพลง" - ศิลปิน (ลูกทุ่ง, 2023)
   Tags: เศร้า, โรแมนติก

2. "อีกเพลง" - อีกศิลปิน (ลูกทุ่ง, 2024)
   Tags: อกหัก, เศร้า

... (8 more)
</relevant_songs>

Based on the above songs, recommend the 5 most suitable songs for the user.
```

**FR-RAG-7: Re-ranking**

After retrieval, re-rank results by:

1. **Relevance Score** (from Chroma): 40%
2. **Popularity Score** (from metadata): 30%
3. **Recency** (newer songs preferred): 20%
4. **Exact Matches** (title/artist matches query): 10%

```python
def calculate_final_score(result):
    relevance = result['distance']  # lower is better
    popularity = result['metadata']['popularity_score'] / 100
    recency = (current_year - result['metadata']['year']) / 10
    exact_match = 1.0 if query.lower() in result['title'].lower() else 0.0

    final_score = (
        (1 - relevance) * 0.4 +  # invert distance
        popularity * 0.3 +
        (1 - recency) * 0.2 +  # invert recency
        exact_match * 0.1
    )

    return final_score
```

**FR-RAG-8: Caching**

**Query Cache**:
```python
# Cache common queries
cache = {
    "เพลงฮิต": [song_ids],  # TTL: 1 hour
    "ลูกทุ่ง": [song_ids],  # TTL: 6 hours
    ...
}
```

**Embedding Cache**:
```python
# Cache user queries embeddings
query_embeddings_cache = {
    "หาเพลงเศร้าๆ": [0.1, 0.2, ...],  # TTL: 24 hours
}
```

**Benefits**:
- Reduce embedding API calls
- Faster response time
- Lower cost

**FR-RAG-9: Incremental Indexing**

**Add New Songs**:
```python
def add_songs(new_songs):
    for song in new_songs:
        # Generate embedding
        embedding = embedding_model.encode(song['text'])

        # Add to Chroma
        collection.add(
            ids=[song['id']],
            embeddings=[embedding],
            documents=[song['text']],
            metadatas=[song['metadata']]
        )
```

**Update Existing Songs**:
```python
def update_song(song_id, updated_data):
    # Get existing
    existing = collection.get(ids=[song_id])

    # Update metadata
    collection.update(
        ids=[song_id],
        metadatas=[updated_data['metadata']]
    )

    # If text changed, regenerate embedding
    if updated_data['text'] != existing['documents'][0]:
        new_embedding = embedding_model.encode(updated_data['text'])
        collection.update(
            ids=[song_id],
            embeddings=[new_embedding],
            documents=[updated_data['text']]
        )
```

**Delete Songs**:
```python
def delete_song(song_id):
    collection.delete(ids=[song_id])
```

**FR-RAG-10: Data Validation**

Before indexing, validate:

```python
def validate_song_data(song):
    errors = []

    # Required fields
    if not song.get('id'):
        errors.append("Missing 'id'")
    if not song.get('title'):
        errors.append("Missing 'title'")
    if not song.get('artist'):
        errors.append("Missing 'artist'")
    if not song.get('genre'):
        errors.append("Missing 'genre'")

    # At least one searchable field
    if not any([
        song.get('lyrics'),
        song.get('description'),
        song.get('tags')
    ]):
        errors.append("Must have lyrics, description, or tags")

    # Data types
    if song.get('year') and not isinstance(song['year'], int):
        errors.append("'year' must be integer")
    if song.get('tempo') and not isinstance(song['tempo'], (int, float)):
        errors.append("'tempo' must be number")

    # URL validation
    if song.get('youtubeUrl') and not is_valid_url(song['youtubeUrl']):
        errors.append("Invalid YouTube URL")

    return errors
```

---

### Non-Functional Requirements

#### ADDED:

**NFR-RAG-1: Performance**
- Embedding generation: < 100ms per song
- Vector search: < 500ms for 10,000 songs
- Vector search: < 1s for 50,000 songs
- Batch indexing: > 100 songs/second
- Query cache hit rate: > 70%

**NFR-RAG-2: Scalability**
- Support 10,000+ songs (Phase 1)
- Support 50,000+ songs (Phase 2)
- Support 100,000+ songs (Phase 3)
- Horizontal scaling (multiple Chroma instances)

**NFR-RAG-3: Accuracy**
- Search relevance: > 85% (user feedback)
- Top-5 accuracy: > 90% (correct genre/mood)
- Hallucination rate: < 5%

**NFR-RAG-4: Reliability**
- Chroma uptime: 99.9%+
- Graceful degradation (fallback to keyword search)
- Automatic retry on failure (max 3 attempts)
- Data backup (daily)

**NFR-RAG-5: Maintainability**
- Clear data pipeline
- Easy to add/update songs
- Version control for embeddings
- Monitoring and logging

---

## Data Pipeline

### ADDED:

```
┌─────────────────────────────────────────────────────────┐
│                   Data Sources                          │
│  • CSV files                                            │
│  • JSON files                                           │
│  • Admin uploads                                        │
│  • Web scraping (optional)                              │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│              Data Validation & Cleaning                 │
│  • Check required fields                                │
│  • Validate data types                                  │
│  • Clean text (remove special chars)                    │
│  • Normalize language/genre                             │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│            Document Preparation                         │
│  • Combine fields into embedding_text                   │
│  • Extract metadata                                     │
│  • Generate unique IDs                                  │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│            Embedding Generation                         │
│  • Load embedding model                                 │
│  • Generate vectors (384-dim or 768-dim)                │
│  • Batch processing (100 songs/batch)                   │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│         Chroma Vector Store                             │
│  • Add to collection                                    │
│  • Create indexes                                       │
│  • Persist to disk                                      │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│              Verification                               │
│  • Test search queries                                  │
│  • Check retrieval quality                              │
│  • Measure performance                                  │
└─────────────────────────────────────────────────────────┘
```

---

## Search Flow

### ADDED:

```
User Query: "หาเพลงลูกทุ่งเศร้าๆ ร้องง่าย"
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│           AI Intent Extraction                          │
│  • Genre: ลูกทุ่ง                                       │
│  • Mood: เศร้า                                          │
│  • Difficulty: Easy                                     │
│  • Expanded query: "เพลงเศร้า โศกเศร้า อกหัก"          │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│            Check Query Cache                            │
│  • Hash: query + filters                                │
│  • If hit → return cached results                       │
│  • If miss → continue                                   │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│          Generate Query Embedding                       │
│  • Embed expanded query                                 │
│  • Dimension: 384                                       │
│  • Time: ~50ms                                          │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│         Vector Search (Chroma)                          │
│  • Similarity search                                    │
│  • Filters: genre=ลูกทุ่ง, difficulty=Easy              │
│  • Top N: 20 results                                    │
│  • Time: ~300ms                                         │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│              Re-ranking                                 │
│  • Calculate final scores                               │
│  • Sort by score                                        │
│  • Top 10 results                                       │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│           Format for AI Context                         │
│  • Create <relevant_songs> block                        │
│  • Include metadata                                     │
│  • Send to LLM                                          │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│          AI Generates Response                          │
│  • Uses retrieved songs as context                      │
│  • Selects best 5 songs                                 │
│  • Explains recommendations                             │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
              User receives recommendations
```

---

## User Scenarios

### ADDED:

### Scenario 1: Semantic Search ใช้งานได้ดี

**Pre-conditions**:
- Vector store มี 10,000+ เพลง
- Embedding model loaded

**Steps**:
1. User: "หาเพลงสตริงโรแมนติก"
2. AI extracts: genre=สตริง, mood=โรแมนติก
3. Expand query: "เพลงโรแมนติก รัก หวาน แฟน"
4. Generate embedding → vector search
5. Retrieve 10 songs (สตริง + tags:โรแมนติก)
6. AI picks best 5
7. Show to user with song cards

**Expected Outcome**:
- ✅ Search < 500ms
- ✅ All results are สตริง genre
- ✅ All results have romantic theme
- ✅ User satisfied (relevant recommendations)

### Scenario 2: Complex Query

**Pre-conditions**: Same as above

**Steps**:
1. User: "เพลงหมอลำใหม่ๆ ปี 2024 จังหวะเร็ว ร้องง่าย"
2. AI extracts:
   - Genre: หมอลำ
   - Year: 2024
   - Tempo: High (>120 BPM)
   - Difficulty: Easy
3. Multi-criteria search:
   ```python
   filters = {
       "genre": "หมอลำ",
       "year": {"$gte": 2024},
       "tempo": {"$gte": 120},
       "difficulty": "Easy"
   }
   ```
4. Vector search with filters
5. Get 5 results (all match criteria)
6. Show to user

**Expected Outcome**:
- ✅ All songs หมอลำ
- ✅ All songs year ≥ 2024
- ✅ All songs tempo ≥ 120
- ✅ All songs difficulty = Easy
- ✅ Relevant and useful

### Scenario 3: No Results Found

**Pre-conditions**: Same

**Steps**:
1. User: "หาเพลงแจ๊สเกาหลี" (very specific, rare)
2. AI searches
3. Get 0 results (no Jazz + Korean songs)
4. AI detects empty results
5. AI suggests alternatives:
   - "ไม่พบเพลงแจ๊สเกาหลี แต่มีเพลง K-pop ช้าๆ ที่อาจชอบ"
6. Fallback search: K-pop + slow tempo
7. Show 5 alternatives

**Expected Outcome**:
- ✅ Graceful fallback
- ✅ Clear explanation
- ✅ Useful alternatives
- ✅ User not frustrated

### Scenario 4: Admin Adds New Songs

**Pre-conditions**:
- Admin logged in
- Has CSV file (100 new songs)

**Steps**:
1. Admin uploads CSV
2. System validates data
3. System generates embeddings (batch)
4. System adds to Chroma
5. System shows progress: "50/100... 100/100 Done!"
6. System shows summary: "100 songs added successfully"
7. New songs immediately searchable

**Expected Outcome**:
- ✅ Upload < 30 seconds
- ✅ Validation catches errors
- ✅ Embeddings generated correctly
- ✅ Songs searchable immediately
- ✅ No downtime

---

## API Design

### ADDED:

#### Search API

**POST /api/rag/search**
```typescript
Request:
{
  query: string
  filters?: {
    genre?: string | string[]
    year?: { min?: number, max?: number }
    language?: string
    difficulty?: 'Easy' | 'Medium' | 'Hard'
    tempo?: { min?: number, max?: number }
  }
  limit?: number  // default: 10
  rerank?: boolean  // default: true
}

Response:
{
  results: [
    {
      id: string
      title: string
      artist: string
      genre: string
      year: number
      score: number  // relevance score
      metadata: {...}
    }
  ]
  total: number
  query_time_ms: number
}
```

#### Index API

**POST /api/rag/index**
```typescript
Request:
{
  songs: Song[]
  batch_size?: number  // default: 100
}

Response:
{
  success: boolean
  indexed: number
  failed: number
  errors: string[]
}
```

#### Update API

**PUT /api/rag/update/:id**
```typescript
Request:
{
  song: Partial<Song>
}

Response:
{
  success: boolean
  updated: Song
}
```

#### Delete API

**DELETE /api/rag/delete/:id**
```typescript
Response:
{
  success: boolean
}
```

---

## Implementation Details

### ADDED:

#### Embedding Model Setup

```python
from sentence_transformers import SentenceTransformer

# Load model (first time will download)
model = SentenceTransformer('paraphrase-multilingual-MiniLM-L12-v2')

# Generate embedding
text = "เพลงเศร้าๆ ของคาราบาว"
embedding = model.encode(text)  # returns 384-dim vector

# Batch processing (faster)
texts = ["text1", "text2", ...]
embeddings = model.encode(texts, batch_size=32)
```

#### Chroma Setup

```python
import chromadb
from chromadb.config import Settings

# Initialize client
client = chromadb.Client(Settings(
    chroma_db_impl="duckdb+parquet",
    persist_directory="./chroma_data/"
))

# Create collection
collection = client.create_collection(
    name="karaoke_songs",
    metadata={"hnsw:space": "cosine"}  # use cosine similarity
)

# Add documents
collection.add(
    ids=["song_001", "song_002"],
    embeddings=[[...], [...]],
    documents=["text1", "text2"],
    metadatas=[{...}, {...}]
)

# Search
results = collection.query(
    query_embeddings=[[...]],  # your query embedding
    n_results=10,
    where={"genre": "ลูกทุ่ง"}
)
```

#### LangChain Integration

```python
from langchain.vectorstores import Chroma
from langchain.embeddings import HuggingFaceEmbeddings
from langchain.chains import RetrievalQA

# Setup embeddings
embeddings = HuggingFaceEmbeddings(
    model_name="paraphrase-multilingual-MiniLM-L12-v2"
)

# Setup vector store
vectorstore = Chroma(
    persist_directory="./chroma_data/",
    embedding_function=embeddings,
    collection_name="karaoke_songs"
)

# Create retriever
retriever = vectorstore.as_retriever(
    search_type="similarity",
    search_kwargs={"k": 10}
)

# Use in chain
qa_chain = RetrievalQA.from_chain_type(
    llm=your_llm,
    retriever=retriever,
    return_source_documents=True
)

# Query
result = qa_chain("หาเพลงลูกทุ่งเศร้าๆ")
```

---

## Performance Optimization

### ADDED:

**1. Batch Processing**
```python
# Bad: One by one
for song in songs:
    embedding = model.encode(song['text'])
    collection.add(...)

# Good: Batch
batch_size = 100
for i in range(0, len(songs), batch_size):
    batch = songs[i:i+batch_size]
    texts = [s['text'] for s in batch]
    embeddings = model.encode(texts, batch_size=32)
    collection.add(...)
```

**2. Caching**
```python
from functools import lru_cache

@lru_cache(maxsize=1000)
def get_query_embedding(query: str):
    return model.encode(query)
```

**3. Async Processing**
```python
import asyncio

async def search_async(query):
    # Non-blocking search
    loop = asyncio.get_event_loop()
    embedding = await loop.run_in_executor(
        None, model.encode, query
    )
    results = await loop.run_in_executor(
        None, collection.query, embedding
    )
    return results
```

**4. Index Optimization**
```python
# HNSW parameters for Chroma
collection = client.create_collection(
    name="karaoke_songs",
    metadata={
        "hnsw:space": "cosine",
        "hnsw:construction_ef": 200,  # higher = better accuracy, slower build
        "hnsw:search_ef": 50,  # higher = better accuracy, slower search
        "hnsw:M": 16  # number of connections
    }
)
```

---

## Monitoring & Logging

### ADDED:

**Metrics to Track**:
- Query latency (p50, p95, p99)
- Cache hit rate
- Embedding generation time
- Vector store size
- Search accuracy (user feedback)
- Error rate

**Logging**:
```python
import logging

logger = logging.getLogger(__name__)

# Log search
logger.info(f"Search query: {query}, filters: {filters}, results: {len(results)}, time: {elapsed_ms}ms")

# Log indexing
logger.info(f"Indexed {count} songs in {elapsed}s")

# Log errors
logger.error(f"Search failed: {error}", exc_info=True)
```

---

## Success Criteria

### ADDED:

**Search Quality**:
- ✅ Top-5 relevance > 90%
- ✅ Genre accuracy > 95%
- ✅ Mood accuracy > 85%
- ✅ User satisfaction > 4.5/5

**Performance**:
- ✅ Search latency < 500ms (p95)
- ✅ Indexing speed > 100 songs/sec
- ✅ Cache hit rate > 70%

**Scale**:
- ✅ 10,000 songs (Phase 1)
- ✅ 50,000 songs (Phase 2)
- ✅ 100,000 songs (Phase 3)

**Reliability**:
- ✅ Uptime > 99.9%
- ✅ Error rate < 1%
- ✅ Data loss = 0

---

## Dependencies

### ADDED:

**Python Libraries**:
- `sentence-transformers` (embedding model)
- `chromadb` (vector store)
- `langchain` (RAG framework)
- `pandas` (data processing)
- `numpy` (numerical operations)

**Optional**:
- `faiss-cpu` (alternative vector store)
- `pinecone-client` (cloud vector store)
- `PyPDF2` (PDF parsing)

**Infrastructure**:
- Disk space: ~1GB per 10,000 songs
- RAM: 2GB+ for embedding model
- CPU: Multi-core for batch processing

---

## Next Steps

1. ✅ Review RAG System spec
2. 🔄 Create Admin Panel spec
3. 🔄 Create Architecture Design
4. 🔄 Create Technical Implementation Plan
5. 🔄 Start Phase 2 Development

---

**Document Version**: 1.0
**Created**: 2025-10-22
**Status**: Draft - Pending Review
