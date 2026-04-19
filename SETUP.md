# SocialAI Manager — Complete Setup Guide

## Project Structure

```
socialai-manager/
├── frontend/                   # Next.js 14 App
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/          # Login page (Google + email)
│   │   │   └── register/       # Registration page
│   │   ├── (dashboard)/
│   │   │   ├── layout.tsx      # Protected dashboard shell
│   │   │   ├── dashboard/      # Main stats + charts
│   │   │   ├── content-studio/ # AI content generator
│   │   │   ├── calendar/       # Post scheduler (drag-drop)
│   │   │   ├── analytics/      # Performance dashboards
│   │   │   ├── trends/         # Trending topics & hashtags
│   │   │   └── settings/       # Account & plan management
│   │   ├── auth/callback/      # Supabase OAuth callback
│   │   ├── layout.tsx
│   │   └── page.tsx            # Landing page
│   ├── components/
│   │   ├── Sidebar.tsx
│   │   ├── Header.tsx
│   │   └── ui/toaster.tsx
│   ├── lib/
│   │   ├── supabase/client.ts
│   │   ├── supabase/server.ts
│   │   └── api.ts
│   └── middleware.ts
│
├── backend/                    # FastAPI Python
│   ├── app/
│   │   ├── main.py             # FastAPI app entry
│   │   ├── core/
│   │   │   ├── config.py       # Settings (Pydantic)
│   │   │   └── security.py     # JWT helpers
│   │   ├── models/
│   │   │   └── schemas.py      # Pydantic models
│   │   ├── api/
│   │   │   ├── deps.py         # Auth dependencies
│   │   │   └── routes/
│   │   │       ├── content.py  # POST /generate-content
│   │   │       ├── posts.py    # CRUD + schedule
│   │   │       ├── analytics.py
│   │   │       ├── accounts.py # Social OAuth
│   │   │       └── trends.py
│   │   └── services/
│   │       ├── ai_service.py   # OpenAI/Anthropic prompt engine
│   │       ├── analytics_service.py
│   │       └── social/
│   │           ├── base.py     # Abstract base
│   │           ├── instagram.py
│   │           ├── twitter.py
│   │           ├── linkedin.py
│   │           ├── youtube.py
│   │           └── manager.py  # Platform registry
│   ├── workers/
│   │   ├── celery_app.py       # Celery config + beat schedule
│   │   └── tasks.py            # Async jobs
│   └── requirements.txt
│
├── supabase/
│   ├── migrations/001_initial.sql  # Full DB schema + RLS
│   └── seed.sql                    # Demo data
│
├── chrome-extension/           # Browser extension
│   ├── manifest.json
│   ├── popup.html
│   ├── popup.js
│   ├── background.js
│   └── content.js
│
├── docker-compose.yml          # Full stack (API+Worker+Redis)
└── .env.example
```

---

## 1. Supabase Setup

1. Create a project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run:
   ```
   supabase/migrations/001_initial.sql
   ```
3. (Optional) Run `supabase/seed.sql` for demo data
4. Go to **Authentication → Providers** and enable **Google**
5. Copy your Project URL and keys to `.env`

---

## 2. Frontend (Next.js)

```bash
cd frontend
cp ../.env.example .env.local
# Fill in NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, NEXT_PUBLIC_API_URL

npm install
npm run dev
```

Opens at http://localhost:3000

---

## 3. Backend (FastAPI)

```bash
cd backend
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# Fill in all API keys

uvicorn app.main:app --reload --port 8000
```

API docs at http://localhost:8000/docs

---

## 4. Redis + Celery Workers

**Option A — Docker (recommended):**
```bash
docker-compose up -d redis worker beat
```

**Option B — Manual:**
```bash
# Terminal 1: Redis
redis-server

# Terminal 2: Celery Worker
cd backend
celery -A workers.celery_app worker --loglevel=info

# Terminal 3: Celery Beat (scheduler)
cd backend
celery -A workers.celery_app beat --loglevel=info

# Optional — Flower dashboard (monitoring)
celery -A workers.celery_app flower --port=5555
# Open http://localhost:5555
```

---

## 5. Full Stack via Docker

```bash
# From project root
cp .env.example .env   # Fill in your keys

docker-compose up --build
```

Services:
- Frontend: http://localhost:3000
- API: http://localhost:8000/docs
- Flower: http://localhost:5555

---

## 6. Chrome Extension

1. Open Chrome → `chrome://extensions/`
2. Enable **Developer Mode**
3. Click **Load Unpacked** → select `chrome-extension/` folder
4. Pin the extension to toolbar

---

## 7. Deploy to Production

### Frontend → Vercel
```bash
cd frontend
npx vercel --prod
# Set env vars in Vercel dashboard
```

### Backend → Railway
1. Connect your GitHub repo at [railway.app](https://railway.app)
2. Set `Dockerfile` path to `backend/Dockerfile`
3. Add all env vars in Railway dashboard
4. Deploy — Railway auto-provisions Redis

### Backend → Render
1. New Web Service → connect repo
2. Root Directory: `backend`
3. Build Command: `pip install -r requirements.txt`
4. Start Command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

---

## 8. API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/generate-content` | AI content generation |
| POST | `/schedule-post` | Schedule a post |
| GET | `/posts` | List user posts |
| PATCH | `/posts/{id}` | Update post |
| DELETE | `/posts/{id}` | Delete post |
| GET | `/analytics` | Analytics summary |
| GET | `/trends` | Trending topics & hashtags |
| GET | `/accounts` | Connected social accounts |
| POST | `/connect-account` | OAuth account connection |
| POST | `/convert-blog` | Blog → Social converter |
| GET | `/health` | Health check |

---

## 9. Plan Limits

| Feature | Free | Pro (₹999) | Agency (₹2,999) |
|---------|------|-----------|----------------|
| AI Posts/month | 5 | Unlimited | Unlimited |
| Social Accounts | 1 | 5 | Unlimited |
| Auto-scheduling | ❌ | ✅ | ✅ |
| Analytics | Basic | Advanced | Advanced |
| Team members | 1 | 1 | 10 |
| White-label | ❌ | ❌ | ✅ |

---

## 10. Environment Variables Reference

See `.env.example` in the root for all required variables.

**Minimum to run locally:**
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `OPENAI_API_KEY` (or `ANTHROPIC_API_KEY`)
- `REDIS_URL`
