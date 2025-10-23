# Testing Guide

คู่มือทดสอบ Data Collection Scripts ก่อนเก็บข้อมูลจริง

---

## ⚡ Quick Test (5 นาที)

### 1. ติดตั้ง Dependencies

```bash
cd scripts/data-collection
npm install
```

### 2. สร้างไฟล์ .env

```bash
# คัดลอก template
cp .env.example .env

# แก้ไข .env ใส่ API keys ของคุณ
nano .env  # หรือ vim, code, etc.
```

### 3. รันทดสอบ

```bash
npm test
```

---

## 🔑 วิธีสมัคร API Keys (ฟรี!)

### Spotify API (~3 นาที)

1. ไปที่ https://developer.spotify.com/dashboard
2. Login ด้วย Spotify account (สมัครฟรีถ้ายังไม่มี)
3. คลิก **"Create app"**
4. กรอกข้อมูล:
   ```
   App name: Karaoke AI Data Collection
   App description: Collecting song metadata for karaoke app
   Redirect URI: http://localhost
   Which API/SDKs: Web API
   ```
5. คลิก **"Save"**
6. คลิก **"Settings"**
7. คัดลอก:
   - **Client ID** → ใส่ใน `SPOTIFY_CLIENT_ID`
   - **Client Secret** (คลิก "View client secret") → ใส่ใน `SPOTIFY_CLIENT_SECRET`

### YouTube Data API v3 (~5 นาที)

1. ไปที่ https://console.cloud.google.com
2. สร้าง Project ใหม่:
   - คลิก dropdown ด้านบน → **"NEW PROJECT"**
   - Project name: `Karaoke AI`
   - คลิก **"CREATE"**
3. Enable YouTube Data API:
   - ไปที่ **"APIs & Services"** → **"Library"**
   - ค้นหา: `YouTube Data API v3`
   - คลิก → **"ENABLE"**
4. สร้าง API Key:
   - ไปที่ **"APIs & Services"** → **"Credentials"**
   - คลิก **"CREATE CREDENTIALS"** → **"API key"**
   - คัดลอก API key → ใส่ใน `YOUTUBE_API_KEY`
5. (Optional) จำกัด API key:
   - คลิก **"Edit API key"**
   - API restrictions → เลือก **"YouTube Data API v3"**
   - คลิก **"Save"**

---

## 📝 ตัวอย่างไฟล์ .env

```bash
# Spotify API
SPOTIFY_CLIENT_ID=abc123def456ghi789jkl012mno345pq
SPOTIFY_CLIENT_SECRET=rst678uvw901xyz234abc567def890ghi

# YouTube API
YOUTUBE_API_KEY=AIzaSyAaBbCcDdEeFfGgHhIiJjKkLlMmNnOoPpQq
```

---

## 🧪 การทดสอบ

### Test Script จะทำอะไรบ้าง

```
✓ ทดสอบ Spotify API
  - เก็บ 10 เพลงไทย (ลูกทุ่ง)
  - เก็บ 10 เพลงสากล (K-pop)

✓ ทดสอบ YouTube API
  - หา YouTube links สำหรับ 5 เพลงแรก
  - (ประหยัด quota ในการทดสอบ)

✓ Validate ข้อมูล
  - ตรวจสอบ schema
  - หา duplicates
  - ตรวจสอบ YouTube URL format

✓ Export ตัวอย่าง
  - Export 10 เพลงเป็น CSV
```

### Expected Output

```
=============================================================
🧪 TESTING DATA COLLECTION
=============================================================

✓ Configuration validated

Initializing collectors...
✓ Collectors ready

📀 TEST 1: Collecting 10 Thai songs (ลูกทุ่ง)...
✓ Found 10 Thai songs

🌍 TEST 2: Collecting 10 International songs...
✓ Found 10 International songs

Total collected: 20 songs
✓ Saved: data/test/spotify-raw.json

🎥 TEST 3: Searching YouTube links (first 5 songs)...
✓ Found YouTube links: 4/5
✓ Saved: data/test/with-youtube.json

✓ TEST 4: Validating data...
============================================================
VALIDATION REPORT
============================================================

Statistics:
  Total songs: 20
  Valid: 20 (100.0%)
  Invalid: 0 (0.0%)
  ...

✅ ALL TESTS PASSED!
=============================================================

Test Results:
  ✓ Spotify API: Working (20 songs)
  ✓ YouTube API: Working (4/5 found)
  ✓ Validation: Passed
  ✓ Export: Working
```

---

## 📁 ไฟล์ที่สร้างขึ้น

หลังจากรันทดสอบ จะได้ไฟล์:

```
scripts/data-collection/
└── data/
    └── test/
        ├── spotify-raw.json        # 20 เพลงจาก Spotify
        ├── with-youtube.json       # 5 เพลงที่มี YouTube links
        └── export/
            └── sample.csv          # ตัวอย่าง CSV 10 เพลง
```

### ตรวจสอบข้อมูล

```bash
# ดูข้อมูลดิบจาก Spotify
cat data/test/spotify-raw.json | jq '.[0]'

# นับจำนวนเพลง
cat data/test/spotify-raw.json | jq 'length'

# ดู CSV
head -5 data/test/export/sample.csv
```

---

## ❌ Troubleshooting

### Error: "Spotify API authentication failed"

**สาเหตุ:** Client ID หรือ Client Secret ผิด

**แก้ไข:**
1. ตรวจสอบ `.env` file ว่ามี Client ID และ Secret ถูกต้อง
2. ไปที่ Spotify Dashboard → Settings → ดู Client Secret อีกครั้ง
3. ตรวจสอบว่าไม่มีช่องว่างหน้า/หลัง API key

### Error: "YouTube API quota exceeded"

**สาเหตุ:** ใช้ quota เกิน (Free tier: 10,000 units/วัน, search = 100 units)

**แก้ไข:**
1. รอ 24 ชั่วโมง quota จะ reset
2. Test script ใช้แค่ 500 units (5 searches) ปกติไม่เกิน
3. ตรวจสอบว่าไม่มีคนอื่นใช้ API key เดียวกัน

### Error: "YOUTUBE_API_KEY not configured"

**สาเหตุ:** ไม่ได้สร้างไฟล์ `.env` หรือกรอก API key ยังไม่ครบ

**แก้ไข:**
```bash
# ตรวจสอบว่ามีไฟล์ .env
ls -la .env

# ถ้าไม่มี ให้สร้าง
cp .env.example .env

# แก้ไข .env
nano .env
```

### Error: "Network request failed"

**สาเหตุ:** ปัญหา internet หรือ API endpoint ไม่ตอบสนอง

**แก้ไข:**
1. ตรวจสอบ internet connection
2. ลองเข้า https://api.spotify.com และ https://youtube.com
3. ตรวจสอบ firewall/proxy settings

### No songs found / Empty results

**สาเหตุ:** Search query ไม่ตรง หรือ market restriction

**แก้ไข:**
1. ลองเปลี่ยน search query ใน test script
2. ตรวจสอบว่า Spotify account ของคุณอยู่ในประเทศไทย
3. ลองค้นหาเพลงสากลแทน

---

## ✅ หลังจากทดสอบผ่านแล้ว

### ขั้นตอนต่อไป:

1. **รวบรวมข้อมูลเต็ม 200 เพลง:**
   ```bash
   npm run collect -- --preset=mixed-200
   ```

2. **Validate ข้อมูล:**
   ```bash
   npm run validate -- --input=data/mixed-200.json
   ```

3. **Export เป็น CSV:**
   ```bash
   npm run export -- --input=data/mixed-200.json --format=csv
   ```

4. **Import เข้า Supabase:**
   ```sql
   COPY songs FROM '/path/to/songs.csv' DELIMITER ',' CSV HEADER;
   ```

---

## 📊 Quota Limits

### Spotify API
- **Free tier:** Unlimited
- **Rate limit:** ~180 requests/minute
- **Our limit:** 100ms between requests (600/minute max)

### YouTube Data API v3
- **Free tier:** 10,000 units/day
- **Search cost:** 100 units each
- **Test usage:** ~500 units (5 searches)
- **Full collection (200 songs):** ~20,000 units (ใช้ 2 วัน หรือสมัคร project เพิ่ม)

**เคล็ดลับ:** YouTube links ไม่จำเป็นสำหรับการทดสอบ Phase 1 เราสามารถ:
1. เก็บ metadata จาก Spotify ก่อน
2. Add YouTube links ทีหลังเมื่อมี quota
3. หรือใช้ manual curation สำหรับ 200 เพลงแรก

---

**Last Updated:** 2025-10-23
