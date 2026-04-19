-- =============================================================
-- SocialAI Manager — Supabase Database Schema
-- Run in: Supabase Dashboard → SQL Editor
-- =============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================================
-- TABLES
-- =============================================================

-- ─── Users ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.users (
    id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email       TEXT NOT NULL,
    full_name   TEXT,
    plan        TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'agency')),
    posts_this_month  INTEGER NOT NULL DEFAULT 0,
    stripe_customer_id TEXT,
    stripe_subscription_id TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Social Accounts ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.accounts (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    platform        TEXT NOT NULL CHECK (platform IN ('instagram','twitter','linkedin','youtube','facebook','pinterest')),
    handle          TEXT,
    display_name    TEXT,
    followers       INTEGER DEFAULT 0,
    profile_image   TEXT,
    access_token    TEXT NOT NULL,
    refresh_token   TEXT,
    token_secret    TEXT,
    extra_data      JSONB DEFAULT '{}',
    expires_at      TIMESTAMPTZ,
    connected       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, platform)
);

-- ─── Posts ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.posts (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id             UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    account_id          UUID REFERENCES public.accounts(id) ON DELETE SET NULL,
    platform            TEXT NOT NULL,
    content             TEXT NOT NULL,
    media_url           TEXT,
    status              TEXT NOT NULL DEFAULT 'draft'
                        CHECK (status IN ('draft', 'scheduled', 'published', 'failed')),
    scheduled_at        TIMESTAMPTZ,
    published_at        TIMESTAMPTZ,
    platform_post_id    TEXT,
    error               TEXT,
    is_recycled         BOOLEAN DEFAULT FALSE,
    original_post_id    UUID REFERENCES public.posts(id) ON DELETE SET NULL,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Analytics ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.analytics (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id         UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
    likes           INTEGER NOT NULL DEFAULT 0,
    comments        INTEGER NOT NULL DEFAULT 0,
    shares          INTEGER NOT NULL DEFAULT 0,
    reach           INTEGER NOT NULL DEFAULT 0,
    impressions     INTEGER NOT NULL DEFAULT 0,
    saves           INTEGER NOT NULL DEFAULT 0,
    clicks          INTEGER NOT NULL DEFAULT 0,
    engagement_rate DECIMAL(6,2) NOT NULL DEFAULT 0,
    recorded_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(post_id)
);

-- ─── AI Content Library ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.content_library (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id     UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    platform    TEXT NOT NULL,
    topic       TEXT NOT NULL,
    niche       TEXT,
    tone        TEXT,
    hook        TEXT,
    caption     TEXT,
    cta         TEXT,
    hashtags    TEXT[],
    script      TEXT,
    creative_idea TEXT,
    used        BOOLEAN DEFAULT FALSE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Competitor Profiles ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.competitors (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    platform        TEXT NOT NULL,
    handle          TEXT NOT NULL,
    display_name    TEXT,
    followers       INTEGER DEFAULT 0,
    avg_eng_rate    DECIMAL(5,2) DEFAULT 0,
    top_hashtags    TEXT[],
    content_gaps    JSONB DEFAULT '[]',
    last_analysed   TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, platform, handle)
);

-- =============================================================
-- INDEXES
-- =============================================================

CREATE INDEX IF NOT EXISTS idx_posts_user_status ON public.posts(user_id, status);
CREATE INDEX IF NOT EXISTS idx_posts_scheduled ON public.posts(scheduled_at) WHERE status = 'scheduled';
CREATE INDEX IF NOT EXISTS idx_posts_platform ON public.posts(platform);
CREATE INDEX IF NOT EXISTS idx_analytics_post_id ON public.analytics(post_id);
CREATE INDEX IF NOT EXISTS idx_accounts_user ON public.accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_content_library_user ON public.content_library(user_id);

-- =============================================================
-- ROW LEVEL SECURITY
-- =============================================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_library ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.competitors ENABLE ROW LEVEL SECURITY;

-- Users: can only see/edit their own row
CREATE POLICY "users_own" ON public.users
    FOR ALL USING (auth.uid() = id);

-- Accounts: users see only their own
CREATE POLICY "accounts_own" ON public.accounts
    FOR ALL USING (auth.uid() = user_id);

-- Posts: users see only their own
CREATE POLICY "posts_own" ON public.posts
    FOR ALL USING (auth.uid() = user_id);

-- Analytics: users see analytics for their own posts
CREATE POLICY "analytics_own" ON public.analytics
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.posts
            WHERE posts.id = analytics.post_id
            AND posts.user_id = auth.uid()
        )
    );

-- Content library: users see only their own
CREATE POLICY "content_library_own" ON public.content_library
    FOR ALL USING (auth.uid() = user_id);

-- Competitors: users see only their own
CREATE POLICY "competitors_own" ON public.competitors
    FOR ALL USING (auth.uid() = user_id);

-- Service role bypass (for backend/Celery)
CREATE POLICY "service_role_all_users" ON public.users
    FOR ALL TO service_role USING (true);
CREATE POLICY "service_role_all_accounts" ON public.accounts
    FOR ALL TO service_role USING (true);
CREATE POLICY "service_role_all_posts" ON public.posts
    FOR ALL TO service_role USING (true);
CREATE POLICY "service_role_all_analytics" ON public.analytics
    FOR ALL TO service_role USING (true);

-- =============================================================
-- FUNCTIONS & TRIGGERS
-- =============================================================

-- Auto-create user record on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
    INSERT INTO public.users (id, email, full_name)
    VALUES (
        NEW.id,
        NEW.email,
        NEW.raw_user_meta_data->>'full_name'
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

CREATE TRIGGER set_users_updated_at BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();
CREATE TRIGGER set_accounts_updated_at BEFORE UPDATE ON public.accounts
    FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();
CREATE TRIGGER set_posts_updated_at BEFORE UPDATE ON public.posts
    FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();

-- Increment post count helper (called by backend after generation)
CREATE OR REPLACE FUNCTION public.increment_post_count(user_id UUID)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
    UPDATE public.users
    SET posts_this_month = posts_this_month + 1
    WHERE id = user_id;
END;
$$;

-- Reset monthly post counts (run via Supabase cron or pg_cron)
CREATE OR REPLACE FUNCTION public.reset_monthly_post_counts()
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
    UPDATE public.users SET posts_this_month = 0;
END;
$$;
