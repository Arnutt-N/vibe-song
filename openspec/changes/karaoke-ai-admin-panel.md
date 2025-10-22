# Feature Specification: Admin Panel

**Feature**: Admin Panel
**Created**: 2025-10-22
**Status**: Draft
**Priority**: MEDIUM (Phase 3)
**Related**: karaoke-ai-overview.md, karaoke-ai-rag-system.md

---

## Overview

Admin Panel เป็นส่วนจัดการระบบสำหรับ Admin ที่ต้องการควบคุม AI behavior, จัดการฐานข้อมูลเพลง, ดู analytics, และจัดการผู้ใช้

## User Need

**Problem**:
- ต้องการแก้ไข System Prompt ของ AI
- ต้องการเพิ่ม/แก้ไข/ลบข้อมูลเพลง
- ต้องการจัดการหมวดหมู่เพลง
- ต้องการดู analytics (เพลงไหนถูกแนะนำบ่อย)
- ต้องการจัดการผู้ใช้ (ban, role management)

**Solution**:
- Admin Dashboard ที่ครบครัน
- System Prompt Editor
- Document Upload & Management
- Category Manager
- Analytics Dashboard
- User Management

---

## Requirements

### Functional Requirements

#### ADDED:

**FR-ADMIN-1: Authentication & Authorization**

**Roles**:
- **Super Admin**: ทำได้ทุกอย่าง
- **Admin**: ทำได้ทุกอย่างยกเว้น user management
- **Content Manager**: จัดการเพลงและหมวดหมู่เท่านั้น
- **Viewer**: ดู analytics เท่านั้น

**Access Control**:
```typescript
const permissions = {
  super_admin: ['*'],
  admin: ['prompts:*', 'documents:*', 'categories:*', 'analytics:*'],
  content_manager: ['documents:*', 'categories:*', 'analytics:read'],
  viewer: ['analytics:read']
}
```

**Login**:
- MUST use Supabase Auth
- MUST require email/password (no OAuth for admin)
- MUST have 2FA option (optional but recommended)
- MUST log all admin actions

**FR-ADMIN-2: Dashboard Overview**

Main dashboard MUST show:

```
┌─────────────────────────────────────────────────────┐
│  📊 Admin Dashboard                [User ▼] [🔔]   │
├─────────────────────────────────────────────────────┤
│                                                     │
│  ┌─────────────┐  ┌─────────────┐  ┌────────────┐ │
│  │ 📝 Songs    │  │ 💬 Chats    │  │ 👥 Users   │ │
│  │   15,234    │  │   8,542     │  │   1,247    │ │
│  │   +120 ↑    │  │   +45 ↑     │  │   +12 ↑    │ │
│  └─────────────┘  └─────────────┘  └────────────┘ │
│                                                     │
│  ┌─────────────────────────────────────────────┐  │
│  │ 📈 Popular Songs (Last 7 days)              │  │
│  │ 1. เพลง A - 245 recommendations            │  │
│  │ 2. เพลง B - 198 recommendations            │  │
│  │ 3. เพลง C - 176 recommendations            │  │
│  │ ...                                         │  │
│  └─────────────────────────────────────────────┘  │
│                                                     │
│  ┌─────────────────────────────────────────────┐  │
│  │ 📊 Chat Activity (24h)                      │  │
│  │ [Line Chart showing hourly activity]        │  │
│  └─────────────────────────────────────────────┘  │
│                                                     │
│  ┌─────────────────────────────────────────────┐  │
│  │ ⚠️ Alerts & Notifications                   │  │
│  │ • API rate limit reached (GLM 4.6)          │  │
│  │ • Database size > 80% (12.8GB/15GB)         │  │
│  └─────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
```

**Metrics Cards**:
- Total songs (with change indicator)
- Total chats (24h, 7d, 30d)
- Total users (active, inactive)
- API usage (per model)
- Storage usage (database, vector store)

**FR-ADMIN-3: System Prompt Management**

**Features**:
```
┌─────────────────────────────────────────────────────┐
│  ⚙️ System Prompts                                  │
├─────────────────────────────────────────────────────┤
│                                                     │
│  Model: [GLM 4.6 ▼]                                │
│                                                     │
│  ┌───────────────────────────────────────────────┐ │
│  │ System Prompt:                                │ │
│  │                                               │ │
│  │ [Text Editor with syntax highlighting]       │ │
│  │                                               │ │
│  │ You are a karaoke song recommendation AI...  │ │
│  │ ...                                           │ │
│  └───────────────────────────────────────────────┘ │
│                                                     │
│  Variables:                                         │
│  • {{USER_NAME}} - User's display name             │
│  • {{GENRE}} - Extracted genre from query          │
│  • {{MOOD}} - Extracted mood                       │
│  • {{RETRIEVED_SONGS}} - RAG results               │
│                                                     │
│  [💾 Save] [🔄 Reset to Default] [👁️ Preview]      │
│                                                     │
│  Version History:                                   │
│  • v3 - 2025-10-22 14:30 (Current)                 │
│  • v2 - 2025-10-20 10:15 [Restore]                 │
│  • v1 - 2025-10-18 09:00 [Restore]                 │
└─────────────────────────────────────────────────────┘
```

**Requirements**:
- MUST support separate prompts for each AI model
- MUST support template variables
- MUST have version history (auto-save every edit)
- MUST have restore functionality
- MUST have preview/test mode
- MUST validate prompt length (max 4000 chars)
- SHOULD have syntax highlighting
- SHOULD have example prompts library

**FR-ADMIN-4: Document Upload & Management**

**Upload Interface**:
```
┌─────────────────────────────────────────────────────┐
│  📄 Document Management                             │
├─────────────────────────────────────────────────────┤
│                                                     │
│  Upload New Songs:                                  │
│                                                     │
│  ┌───────────────────────────────────────────────┐ │
│  │  Drag & Drop files here                       │ │
│  │  or [Browse Files]                            │ │
│  │                                               │ │
│  │  Supported: CSV, JSON, JSONL, PDF            │ │
│  │  Max size: 10MB per file                     │ │
│  └───────────────────────────────────────────────┘ │
│                                                     │
│  [Upload Template] [View Format Guide]              │
│                                                     │
│  Recent Uploads:                                    │
│  ┌───────────────────────────────────────────────┐ │
│  │ songs_2024.csv - 150 songs - ✅ Success       │ │
│  │ 2025-10-22 14:25                              │ │
│  │                                               │ │
│  │ k-pop_hits.json - 85 songs - ✅ Success       │ │
│  │ 2025-10-20 10:15                              │ │
│  │                                               │ │
│  │ thai_classics.csv - 200 songs - ⚠️ 5 errors   │ │
│  │ 2025-10-19 16:30 [View Errors]                │ │
│  └───────────────────────────────────────────────┘ │
│                                                     │
│  [View All Uploads]                                 │
└─────────────────────────────────────────────────────┘
```

**Features**:
- MUST support drag & drop
- MUST validate files before upload
- MUST show progress bar during upload
- MUST show validation errors clearly
- MUST support batch upload (multiple files)
- MUST log all uploads with timestamp and user
- SHOULD auto-detect file format
- SHOULD provide downloadable templates

**Upload Flow**:
1. User selects/drops file
2. Client validates format
3. Upload to server
4. Server validates data
5. Show validation results (success/errors)
6. User confirms upload
7. Server processes:
   - Generate embeddings
   - Add to vector store
   - Update database
8. Show completion status

**FR-ADMIN-5: Song Database Management**

**Song List View**:
```
┌─────────────────────────────────────────────────────────────────┐
│  🎵 Song Database                          [+ Add Song]          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  [Search: ______________________] [Genre: All ▼] [Year: All ▼] │
│                                                                 │
│  Total: 15,234 songs | Showing: 1-50                           │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │ ID       Title         Artist     Genre   Year  Actions │  │
│  ├─────────────────────────────────────────────────────────┤  │
│  │ song_001 เพลง A       ศิลปิน A   ลูกทุ่ง 2024  [Edit][Del]│
│  │ song_002 เพลง B       ศิลปิน B   ลูกกรุง 2023  [Edit][Del]│
│  │ song_003 เพลง C       ศิลปิน C   K-pop   2024  [Edit][Del]│
│  │ ...                                                      │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                                 │
│  [< Previous] [1] [2] [3] ... [305] [Next >]                  │
│                                                                 │
│  Bulk Actions:                                                  │
│  [☐ Select All] [Delete Selected] [Export Selected]            │
└─────────────────────────────────────────────────────────────────┘
```

**Features**:
- MUST support search (by title, artist, lyrics)
- MUST support filtering (genre, year, language)
- MUST support sorting (by title, date added, popularity)
- MUST support pagination (50 items per page)
- MUST support bulk operations (delete, export, update)
- SHOULD support inline editing
- SHOULD highlight songs with missing data (no YouTube link, no lyrics)

**Edit Song Modal**:
```
┌─────────────────────────────────────────────┐
│  ✏️ Edit Song                        [✕]   │
├─────────────────────────────────────────────┤
│                                             │
│  Title: [_____________________________]     │
│  Artist: [____________________________]     │
│  Genre: [ลูกทุ่ง ▼]                        │
│  Year: [2024]                               │
│  Tempo: [120] BPM                           │
│  Language: [Thai ▼]                         │
│  Dialect: [Isaan ▼] (optional)              │
│  Difficulty: [Easy ▼]                       │
│                                             │
│  YouTube URL: [_______________________]     │
│  Spotify URL: [_______________________]     │
│  Image URL: [_________________________]     │
│                                             │
│  Lyrics:                                    │
│  ┌─────────────────────────────────────┐   │
│  │ [Multi-line text area]              │   │
│  │                                     │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  Tags: [เศร้า] [โรแมนติก] [+ Add]          │
│                                             │
│  [💾 Save] [Cancel]                         │
└─────────────────────────────────────────────┘
```

**FR-ADMIN-6: Category Management**

```
┌─────────────────────────────────────────────────────┐
│  🏷️ Category Management                   [+ Add]    │
├─────────────────────────────────────────────────────┤
│                                                     │
│  Thai Genres:                                       │
│  ┌───────────────────────────────────────────────┐ │
│  │ ลูกทุ่ง       (3,245 songs)  [Edit] [Delete] │ │
│  │ ลูกกรุง       (2,890 songs)  [Edit] [Delete] │ │
│  │ สตริง         (1,567 songs)  [Edit] [Delete] │ │
│  │ หมอลำ         (1,234 songs)  [Edit] [Delete] │ │
│  │ เพลงใต้       (892 songs)    [Edit] [Delete] │ │
│  │ เพื่อชีวิต    (765 songs)    [Edit] [Delete] │ │
│  │ สามช่า        (423 songs)    [Edit] [Delete] │ │
│  └───────────────────────────────────────────────┘ │
│                                                     │
│  International:                                     │
│  ┌───────────────────────────────────────────────┐ │
│  │ K-pop         (2,134 songs)  [Edit] [Delete] │ │
│  │ C-pop         (1,456 songs)  [Edit] [Delete] │ │
│  │ J-pop         (987 songs)    [Edit] [Delete] │ │
│  │ Western       (1,823 songs)  [Edit] [Delete] │ │
│  └───────────────────────────────────────────────┘ │
│                                                     │
│  Custom Categories:                                 │
│  ┌───────────────────────────────────────────────┐ │
│  │ เพลงฮิต 2024  (150 songs)   [Edit] [Delete] │ │
│  │ คาราโอเกะยอดนิยม (500 songs) [Edit] [Delete] │ │
│  └───────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────┘
```

**Features**:
- MUST show song count per category
- MUST support adding/editing/deleting categories
- MUST validate category name (unique, no special chars)
- MUST update category quick buttons in chat UI automatically
- SHOULD support category hierarchy (parent/child)
- SHOULD support assigning songs to multiple categories

**Edit Category Modal**:
```
┌─────────────────────────────────────────────┐
│  ✏️ Edit Category                    [✕]   │
├─────────────────────────────────────────────┤
│                                             │
│  Name (Thai): [ลูกทุ่ง]                    │
│  Name (English): [Luk Thung]               │
│  Description:                               │
│  [Thai country music...]                    │
│                                             │
│  Icon: [🎵] [Change]                        │
│  Color: [#FF5733] [Pick]                    │
│                                             │
│  Display Order: [1]                         │
│  Visible in UI: [☑]                         │
│                                             │
│  [💾 Save] [Cancel]                         │
└─────────────────────────────────────────────┘
```

**FR-ADMIN-7: Analytics Dashboard**

```
┌─────────────────────────────────────────────────────────────┐
│  📊 Analytics                    [Last 7 days ▼] [Export]   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Overview:                                                  │
│  ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌──────────┐  │
│  │ 8,542     │ │ 15,234    │ │ 4.2       │ │ 2,134    │  │
│  │ Chats     │ │ Messages  │ │ Avg/Chat  │ │ Songs    │  │
│  │ +12% ↑    │ │ +8% ↑     │ │ +5% ↑     │ │ Rec'd    │  │
│  └───────────┘ └───────────┘ └───────────┘ └──────────┘  │
│                                                             │
│  Top Recommended Songs:                                     │
│  ┌───────────────────────────────────────────────────────┐ │
│  │ Rank Song           Artist      Genre    Count Share │ │
│  ├───────────────────────────────────────────────────────┤ │
│  │ 1    เพลง A        ศิลปิน A    ลูกทุ่ง  245   11.5% │ │
│  │ 2    เพลง B        ศิลปิน B    ลูกกรุง  198    9.3% │ │
│  │ 3    เพลง C        ศิลปิน C    K-pop    176    8.2% │ │
│  │ ...                                                   │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
│  Popular Genres:                                            │
│  ┌───────────────────────────────────────────────────────┐ │
│  │ [Bar Chart]                                           │ │
│  │ ลูกทุ่ง  ████████████████ 35%                        │ │
│  │ ลูกกรุง  ████████████ 25%                            │ │
│  │ K-pop    ████████ 18%                                │ │
│  │ สตริง    █████ 12%                                   │ │
│  │ Others   ████ 10%                                    │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
│  Chat Activity:                                             │
│  ┌───────────────────────────────────────────────────────┐ │
│  │ [Line Chart - Hourly/Daily activity]                 │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
│  Model Usage:                                               │
│  ┌───────────────────────────────────────────────────────┐ │
│  │ GLM 4.6:   5,234 chats (61%)  [Pie Chart]            │ │
│  │ Gemini:    3,308 chats (39%)                         │ │
│  └───────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

**Metrics**:
- Total chats (with time range filter)
- Total messages
- Average messages per chat
- Total songs recommended
- Top 20 recommended songs
- Popular genres (distribution)
- Chat activity over time (line chart)
- Model usage (pie chart)
- User growth (line chart)
- Error rate (per model, per day)
- API usage (per model)
- Response time (p50, p95, p99)

**FR-ADMIN-8: User Management**

```
┌─────────────────────────────────────────────────────────────┐
│  👥 User Management                        [+ Invite]        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  [Search: _________________] [Role: All ▼] [Status: All ▼] │
│                                                             │
│  Total: 1,247 users | Active: 892 | Banned: 5              │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Email            Name      Role   Status  Actions   │   │
│  ├─────────────────────────────────────────────────────┤   │
│  │ user@example.com User A    User   Active  [Edit][Ban]   │
│  │ admin@example.com Admin B  Admin  Active  [Edit]    │   │
│  │ banned@ex.com    User C    User   Banned [Unban]    │   │
│  │ ...                                                  │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  Admin Users:                                               │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ super@admin.com  Super Admin  Super Admin           │   │
│  │ admin@admin.com  Admin A      Admin                 │   │
│  │ content@admin.com Content Mgr Content Manager       │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

**Features**:
- MUST list all users with pagination
- MUST support search (by email, name)
- MUST support filtering (by role, status)
- MUST support user actions:
  - View details
  - Edit role (for super admin only)
  - Ban/Unban
  - Delete account
  - View activity log
- MUST show admin users separately
- MUST log all user management actions

**User Details Modal**:
```
┌─────────────────────────────────────────────┐
│  👤 User Details                     [✕]   │
├─────────────────────────────────────────────┤
│                                             │
│  Email: user@example.com                    │
│  Name: User A                               │
│  Role: User                                 │
│  Status: Active                             │
│  Joined: 2025-10-15                         │
│                                             │
│  Activity:                                  │
│  • Total chats: 45                          │
│  • Total messages: 234                      │
│  • Last active: 2025-10-22 14:30            │
│                                             │
│  Recent Activity:                           │
│  • 2025-10-22 14:30 - Chat created          │
│  • 2025-10-22 14:25 - Switched to Gemini    │
│  • 2025-10-22 14:20 - 5 messages sent       │
│                                             │
│  [🚫 Ban User] [🗑️ Delete Account]          │
└─────────────────────────────────────────────┘
```

**FR-ADMIN-9: Settings & Configuration**

```
┌─────────────────────────────────────────────────────┐
│  ⚙️ Settings                                         │
├─────────────────────────────────────────────────────┤
│                                                     │
│  General:                                           │
│  • Site Name: [Karaoke AI Chat Agent]              │
│  • Site URL: [https://karaoke-ai.vercel.app]       │
│  • Default Language: [Thai ▼]                       │
│                                                     │
│  API Configuration:                                 │
│  • GLM 4.6 API Key: [••••••••••••] [Show] [Test]   │
│  • Gemini API Key: [••••••••••••] [Show] [Test]    │
│  • OpenAI API Key: [Not Set] [Add]                 │
│  • Anthropic API Key: [Not Set] [Add]              │
│                                                     │
│  Rate Limits:                                       │
│  • Messages per user (per hour): [60]              │
│  • Max conversation length: [100] messages         │
│  • Max songs per recommendation: [10]              │
│                                                     │
│  Features:                                          │
│  • Enable social sharing: [☑]                       │
│  • Enable lyrics display: [☑]                       │
│  • Enable anonymous users: [☑]                      │
│  • Enable model switching: [☑]                      │
│                                                     │
│  Vector Store:                                      │
│  • Type: [Chroma ▼]                                │
│  • Path: [./chroma_data/]                          │
│  • Collection: [karaoke_songs]                      │
│  • Total vectors: [15,234]                          │
│  • Last indexed: [2025-10-22 14:30]                │
│  • [Rebuild Index] [Clear Cache]                   │
│                                                     │
│  [💾 Save Settings]                                 │
└─────────────────────────────────────────────────────┘
```

**FR-ADMIN-10: Activity Logs**

```
┌─────────────────────────────────────────────────────────────┐
│  📋 Activity Logs                  [Last 24h ▼] [Export]    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  [Filter: All Actions ▼] [User: All ▼]                     │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Time       User           Action              Details│   │
│  ├─────────────────────────────────────────────────────┤   │
│  │ 14:30:25   admin@a.com    Updated prompt     GLM 4.6│   │
│  │ 14:25:10   content@a.com  Uploaded songs     150    │   │
│  │ 14:20:45   admin@a.com    Deleted song       song_123│  │
│  │ 14:15:30   admin@a.com    Banned user        user@e.com│
│  │ ...                                                  │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  [< Previous] [1] [2] [3] ... [Next >]                     │
└─────────────────────────────────────────────────────────────┘
```

**Logged Actions**:
- Prompt updates
- Document uploads
- Song CRUD operations
- Category changes
- User management actions
- Settings changes
- API key additions/removals

---

### Non-Functional Requirements

#### ADDED:

**NFR-ADMIN-1: Performance**
- Dashboard load: < 2s
- Analytics query: < 1s
- Document upload: < 5s for 100 songs
- Bulk operations: Progress indicator for >10 items

**NFR-ADMIN-2: Security**
- All endpoints protected (authentication required)
- Role-based access control enforced
- API keys encrypted at rest
- Activity logging for audit trail
- Auto-logout after 30 minutes inactive

**NFR-ADMIN-3: Usability**
- Intuitive navigation
- Clear error messages
- Undo functionality (where possible)
- Keyboard shortcuts
- Responsive (desktop-first, mobile-compatible)

**NFR-ADMIN-4: Reliability**
- Auto-save drafts (prompts, edits)
- Confirmation dialogs for destructive actions
- Graceful error handling
- Data validation before submission

---

## User Scenarios

### ADDED:

### Scenario 1: Admin Updates System Prompt

**Steps**:
1. Admin logs in
2. Navigates to System Prompts
3. Selects GLM 4.6 model
4. Edits prompt in text editor
5. Clicks Preview to test
6. Satisfied → Clicks Save
7. System auto-versions prompt (v4)
8. New prompt active immediately

**Expected Outcome**:
- ✅ Prompt saved successfully
- ✅ Version created automatically
- ✅ All new chats use new prompt
- ✅ Existing chats unaffected

### Scenario 2: Content Manager Uploads Songs

**Steps**:
1. Content Manager logs in
2. Goes to Document Upload
3. Drags CSV file (200 songs)
4. System validates format → Shows preview
5. Content Manager reviews → Clicks Confirm
6. Progress bar: "Processing 50/200..."
7. Completed: "✅ 195 songs added, ❌ 5 errors"
8. Content Manager clicks View Errors
9. Sees error details (missing YouTube URLs)
10. Fixes CSV → Re-uploads 5 songs
11. Success!

**Expected Outcome**:
- ✅ 200 songs indexed
- ✅ Searchable immediately
- ✅ Clear error messages
- ✅ Easy to fix errors

### Scenario 3: Admin Views Analytics

**Steps**:
1. Admin logs in → Dashboard
2. Sees overview metrics
3. Notices "เพลง A" is #1 recommended
4. Clicks Analytics tab
5. Changes date range to "Last 30 days"
6. Sees detailed charts and graphs
7. Exports data as CSV
8. Shares with team

**Expected Outcome**:
- ✅ Data loads < 1s
- ✅ Charts interactive
- ✅ Export works
- ✅ Insights actionable

### Scenario 4: Super Admin Bans Abusive User

**Steps**:
1. Super Admin receives report
2. Goes to User Management
3. Searches for user email
4. Clicks user → View Details
5. Reviews activity log (spam detected)
6. Clicks Ban User
7. Confirmation dialog: "Are you sure?"
8. Confirms → User banned
9. Activity logged

**Expected Outcome**:
- ✅ User cannot login
- ✅ Existing sessions terminated
- ✅ Action logged for audit
- ✅ Can unban later if needed

---

## UI Components

### ADDED:

#### Sidebar Navigation
```typescript
<AdminSidebar>
  <Logo />
  <NavItems>
    <NavItem icon="📊" href="/admin">Dashboard</NavItem>
    <NavItem icon="⚙️" href="/admin/prompts">Prompts</NavItem>
    <NavItem icon="📄" href="/admin/documents">Documents</NavItem>
    <NavItem icon="🎵" href="/admin/songs">Songs</NavItem>
    <NavItem icon="🏷️" href="/admin/categories">Categories</NavItem>
    <NavItem icon="📊" href="/admin/analytics">Analytics</NavItem>
    <NavItem icon="👥" href="/admin/users">Users</NavItem>
    <NavItem icon="⚙️" href="/admin/settings">Settings</NavItem>
    <NavItem icon="📋" href="/admin/logs">Logs</NavItem>
  </NavItems>
  <UserMenu />
</AdminSidebar>
```

#### Stats Card Component
```typescript
<StatsCard
  title="Total Songs"
  value={15234}
  change={+120}
  changeType="increase"
  icon="🎵"
  period="Last 7 days"
/>
```

#### Table Component
```typescript
<DataTable
  columns={columns}
  data={songs}
  searchable
  filterable
  sortable
  pagination
  bulkActions={['delete', 'export']}
  onRowClick={handleRowClick}
/>
```

---

## API Endpoints

### ADDED:

**GET /api/admin/stats**
```typescript
Response: {
  totalSongs: number
  totalChats: number
  totalUsers: number
  activeUsers: number
  ...
}
```

**PUT /api/admin/prompts/:model**
```typescript
Request: {
  prompt: string
}
Response: {
  success: boolean
  version: number
}
```

**POST /api/admin/documents/upload**
```typescript
Request: FormData with file
Response: {
  success: boolean
  indexed: number
  failed: number
  errors: string[]
}
```

**GET /api/admin/analytics**
```typescript
Query: ?startDate=2025-10-15&endDate=2025-10-22
Response: {
  chats: number[]
  topSongs: Song[]
  genreDistribution: {...}
  ...
}
```

---

## Success Criteria

### ADDED:

**Usability**:
- ✅ Admin can update prompt in < 2 minutes
- ✅ Content Manager can upload 100 songs in < 5 minutes
- ✅ Analytics load in < 1 second
- ✅ All actions have clear feedback

**Functionality**:
- ✅ All CRUD operations work
- ✅ Role-based permissions enforced
- ✅ Activity logs capture all actions
- ✅ No data loss

**Performance**:
- ✅ Dashboard load < 2s
- ✅ Analytics query < 1s
- ✅ Document upload < 5s per 100 songs

---

## Dependencies

### ADDED:

**UI Libraries**:
- Shadcn/UI (dashboard components)
- Recharts (charts and graphs)
- React Table (data tables)
- React Dropzone (file upload)

**Utilities**:
- date-fns (date formatting)
- Papa Parse (CSV parsing)
- json2csv (CSV export)

---

## Next Steps

1. ✅ Review Admin Panel spec
2. 🔄 Create Architecture Design
3. 🔄 Create Technical Implementation Plan
4. 🔄 Start Phase 3 Development

---

**Document Version**: 1.0
**Created**: 2025-10-22
**Status**: Draft - Pending Review
