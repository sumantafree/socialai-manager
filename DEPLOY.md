# 🚀 SocialAI Manager — Complete Deployment Guide

**Stack:** Vercel (frontend) + Render (backend API + workers) + Supabase (database + auth) + cPanel (custom domain)

---

## 📋 What You Need Before Starting

| Service | Purpose | Cost | Link |
|---------|---------|------|------|
| GitHub | Code hosting | Free | github.com |
| Supabase | Database + Auth | Free tier | supabase.com |
| Render | FastAPI backend + workers | Free tier | render.com |
| Vercel | Next.js frontend | Free tier | vercel.com |
| cPanel | Custom domain DNS | Your hosting | Your server |
| Google AI Studio | Gemini API key | Pay-per-use (~free) | aistudio.google.com |

---

## STEP 1 — Push Code to GitHub

1. Go to **github.com** → Click **"New repository"**
2. Name it `socialai-manager` → Set to **Private** → Click **Create repository**
3. Open a terminal in `G:/Ai-assitent/socialai-manager` and run:

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/socialai-manager.git
git push -u origin main
```

---

## STEP 2 — Set Up Supabase

### 2a. Create Project
1. Go to **supabase.com** → Sign in → **New Project**
2. Choose a name (e.g. `socialai-prod`), enter a strong DB password, pick region closest to you
3. Wait ~2 minutes for the project to start

### 2b. Run Database Migrations
1. In Supabase dashboard → click **SQL Editor** in the left menu → **New Query**
2. Copy + paste the contents of `supabase/migrations/001_initial.sql` → click **Run**
3. Create another new query → paste `supabase/migrations/002_admin.sql` → click **Run**

### 2c. Copy Your Credentials
Go to **Project Settings → API** and save:
- **Project URL** → used as `SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_URL`
- **anon / public key** → used as `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **service_role key** (keep this secret!) → used as `SUPABASE_SERVICE_ROLE_KEY`

### 2d. Configure Auth Redirect URL
1. Go to **Authentication → URL Configuration**
2. Set **Site URL** to: `https://app.yourdomain.com` (your final domain)
3. Under **Redirect URLs**, add: `https://app.yourdomain.com/auth/callback`

### 2e. Enable Email Auth
1. Go to **Authentication → Providers → Email**
2. Make sure **Enable Email Provider** is ON

---

## STEP 3 — Get Your Gemini API Key

1. Go to **aistudio.google.com**
2. Click **"Get API key"** → **Create API key in new project**
3. Copy the key (starts with `AIza...`)
4. This is your `GEMINI_API_KEY`

> Gemini 1.5 Flash costs ~$0.075 per 1 million tokens — very cheap for most usage.

---

## STEP 4 — Deploy Backend to Render

### 4a. Connect GitHub to Render
1. Go to **render.com** → Sign up/Sign in
2. Click **New → Blueprint**
3. Click **Connect GitHub** → select your `socialai-manager` repository
4. Render will detect `render.yaml` and show you 4 services to create:
   - `socialai-api` (Web Service — FastAPI)
   - `socialai-worker` (Background Worker — Celery)
   - `socialai-beat` (Background Worker — Celery Beat)
   - `socialai-redis` (Redis)

### 4b. Fill In Environment Variables
When prompted, fill in the env vars for **`socialai-api`**:

| Variable | Value |
|----------|-------|
| `SUPABASE_URL` | Your Supabase project URL |
| `SUPABASE_ANON_KEY` | Your Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Your Supabase service role key |
| `GEMINI_API_KEY` | Your Gemini API key (`AIza...`) |
| `AI_PROVIDER` | `gemini` |
| `AI_MODEL_GEMINI` | `gemini-1.5-flash` |
| `ADMIN_SECRET_KEY` | Any strong random string (you'll use this to make yourself admin) |
| `BACKEND_CORS_ORIGINS` | `https://app.yourdomain.com,https://your-app.vercel.app` |
| `STRIPE_SECRET_KEY` | From Stripe dashboard (use test key first: `sk_test_...`) |
| `STRIPE_WEBHOOK_SECRET` | Set this after Step 7 below |

For **`socialai-worker`**, add: `GEMINI_API_KEY`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`
(Redis URL is auto-linked from `socialai-redis`)

### 4c. Apply the Blueprint
Click **"Apply"** → Wait 5–10 minutes for all services to build and start.

### 4d. Test the Backend
Open: `https://socialai-api.onrender.com/health`
You should see: `{"status": "ok", "service": "SocialAI Manager", "env": "production"}`

---

## STEP 5 — Deploy Frontend to Vercel

### 5a. Import from GitHub
1. Go to **vercel.com** → Sign in with GitHub
2. Click **"Add New Project"** → select `socialai-manager`
3. Set **Root Directory** → click **Edit** → type `frontend` → click **Continue**
4. Framework: **Next.js** (auto-detected)

### 5b. Set Environment Variables
Before clicking Deploy, expand **Environment Variables** and add:

| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon key |
| `NEXT_PUBLIC_BACKEND_URL` | `https://socialai-api.onrender.com` |

### 5c. Deploy
Click **"Deploy"** → Wait 2–3 minutes.

Your live app will be at: `https://socialai-manager-xyz.vercel.app`

---

## STEP 6 — Connect Your Custom Domain via cPanel

You want the app accessible at e.g. `app.yourdomain.com`.

### 6a. Add the Domain in Vercel
1. Vercel → your project → **Settings → Domains**
2. Click **"Add"** → type `app.yourdomain.com` → **Add**
3. Vercel will show you a CNAME record to create:
   ```
   Type:  CNAME
   Name:  app
   Value: cname.vercel-dns.com
   ```

### 6b. Add the CNAME in cPanel
1. Log in to **cPanel** → find **Zone Editor** (or DNS Zone Editor)
2. Click **Manage** next to your domain
3. Click **+ Add Record** → choose **CNAME**
   - **Name:** `app`
   - **Record:** `cname.vercel-dns.com`
4. Click **Add Record** → **Save**
5. Wait 5–30 minutes for DNS to propagate worldwide

### 6c. Verify SSL
Vercel automatically issues a free SSL certificate once DNS is confirmed.
After propagation: `https://app.yourdomain.com` → your app ✅

### 6d. Optional: Custom Domain for Backend API
If you also want `api.yourdomain.com` for the backend:
1. Render → `socialai-api` → **Settings → Custom Domains** → Add `api.yourdomain.com`
2. Render shows a CNAME value → add the same way in cPanel (`api` → Render's value)

---

## STEP 7 — Set Up Stripe Webhooks

1. Go to **dashboard.stripe.com** → **Developers → Webhooks**
2. Click **"+ Add endpoint"**
3. **Endpoint URL:** `https://socialai-api.onrender.com/api/admin/stripe/webhook`
4. **Events to listen to** — select these:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
5. Click **"Add endpoint"**
6. Click the webhook → copy the **Signing secret** (starts with `whsec_...`)
7. Go to Render → `socialai-api` → **Environment** → set `STRIPE_WEBHOOK_SECRET` to that value
8. Render auto-redeploys

---

## STEP 8 — Create Your Admin Account

### 8a. Register in the App
1. Open `https://app.yourdomain.com` → click **Sign Up**
2. Register with your email address

### 8b. Promote Yourself to Superadmin

**Option A — via SQL (easiest):**
1. Supabase dashboard → **SQL Editor** → New Query
2. Run:
   ```sql
   UPDATE users SET role = 'superadmin' WHERE email = 'youremail@example.com';
   ```

**Option B — via the Admin Settings page:**
1. Open `https://app.yourdomain.com/admin/settings`
2. Enter your email + the value of `ADMIN_SECRET_KEY` you set in Render
3. Click **"Promote to Superadmin"**

### 8c. Access the Admin Panel
Go to: `https://app.yourdomain.com/admin/dashboard`
You'll see the full admin panel with KPIs, user management, analytics, billing, audit logs, and error tracking.

---

## STEP 9 — Update CORS After Setting Your Domain

Once your custom domain is live, update `BACKEND_CORS_ORIGINS` in Render:

1. Render → `socialai-api` → **Environment**
2. Set `BACKEND_CORS_ORIGINS` to:
   ```
   https://app.yourdomain.com,https://socialai-manager-xyz.vercel.app
   ```
3. Click **Save Changes** (auto-redeploys)

---

## STEP 10 — Auto-Deploy with GitHub Actions (Optional)

Every `git push` to `main` will automatically deploy frontend + backend.

### Get Your Tokens

**Render deploy hook:**
1. Render → `socialai-api` → **Settings → Deploy Hooks** → Create hook → copy URL

**Vercel tokens:**
1. Vercel → **Account Settings → Tokens** → Create → copy token
2. Vercel → your project → **Settings → General** → copy **Project ID**
3. Vercel → **Settings → General** → copy **Team ID** (if using a team)

### Add GitHub Secrets
Go to your GitHub repo → **Settings → Secrets and variables → Actions** → Add:

| Secret | Value |
|--------|-------|
| `RENDER_DEPLOY_HOOK_URL` | Render deploy hook URL |
| `VERCEL_TOKEN` | Vercel API token |
| `VERCEL_ORG_ID` | Vercel Team/Org ID |
| `VERCEL_PROJECT_ID` | Vercel Project ID |

Now `.github/workflows/deploy.yml` handles everything automatically on every push.

---

## 🔑 Environment Variables — Full Reference

### Backend (Render `socialai-api`)
```env
APP_ENV=production
DEBUG=false
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJh...
SUPABASE_SERVICE_ROLE_KEY=eyJh...
AI_PROVIDER=gemini
AI_MODEL_GEMINI=gemini-1.5-flash
GEMINI_API_KEY=AIza...
ADMIN_SECRET_KEY=your-strong-random-secret
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRO_PRICE_ID=price_...
STRIPE_AGENCY_PRICE_ID=price_...
BACKEND_CORS_ORIGINS=https://app.yourdomain.com,https://your-app.vercel.app
```

### Frontend (Vercel)
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJh...
NEXT_PUBLIC_BACKEND_URL=https://socialai-api.onrender.com
```

---

## 🧪 Run Locally

```bash
# Terminal 1 — Backend
cd G:/Ai-assitent/socialai-manager/backend
pip install -r requirements.txt
cp .env.example .env        # Fill in GEMINI_API_KEY, SUPABASE_*, etc.
uvicorn app.main:app --reload --port 8000

# Terminal 2 — Frontend
cd G:/Ai-assitent/socialai-manager/frontend
npm install
# Create .env.local with NEXT_PUBLIC_* vars
npm run dev

# Open http://localhost:3000
# Admin panel: http://localhost:3000/admin/dashboard
```

---

## ❓ Common Issues & Fixes

| Problem | Fix |
|---------|-----|
| CORS error in browser | Add your frontend URL to `BACKEND_CORS_ORIGINS` in Render |
| Admin panel shows "Unauthorized" | Run the SQL to set your role to `superadmin` in Supabase |
| Gemini returns errors | Check `GEMINI_API_KEY` is set correctly and Google AI Studio billing is active |
| Render service is slow to respond | Free tier sleeps after 15 min idle — upgrade to Starter ($7/mo) or use UptimeRobot to ping |
| Supabase auth redirect fails | Add `https://app.yourdomain.com/auth/callback` to Supabase Redirect URLs |
| Stripe webhook 400 error | Check `STRIPE_WEBHOOK_SECRET` matches the one in Stripe dashboard |
| `npm install` fails on Vercel | Make sure Root Directory is set to `frontend` in Vercel project settings |
| DNS not propagating | Wait up to 48h max — usually 5–30 min. Use [whatsmydns.net](https://whatsmydns.net) to check |

---

## 💰 Free Tier Summary

| Service | Free Limit | Notes |
|---------|-----------|-------|
| Supabase | 500MB DB, 50K MAU | Plenty for thousands of users |
| Render Web | 750 hrs/month | Sleeps after 15 min idle |
| Render Worker | 750 hrs/month | Same sleep behavior |
| Vercel | 100GB bandwidth/month | More than enough |
| Gemini API | Very generous free quota | ~$0.075 per 1M tokens after quota |

> **Pro tip:** Use [UptimeRobot](https://uptimerobot.com) (free) to ping `https://socialai-api.onrender.com/health` every 14 minutes to prevent the Render free tier from sleeping.
