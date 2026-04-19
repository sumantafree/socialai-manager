-- ============================================================
-- SocialAI Manager — Admin & Billing Tables
-- Run this AFTER 001_initial.sql
-- ============================================================

-- ─── Role & Status columns on users ─────────────────────────
ALTER TABLE users ADD COLUMN IF NOT EXISTS role        TEXT    DEFAULT 'user';
ALTER TABLE users ADD COLUMN IF NOT EXISTS blocked     BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS credits     INT     DEFAULT 100;
ALTER TABLE users ADD COLUMN IF NOT EXISTS credits_used INT    DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT;

-- ─── User Activity Log ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS user_activity (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID        REFERENCES users(id) ON DELETE CASCADE,
  action     TEXT        NOT NULL,
  metadata   JSONB       DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_user_activity_user ON user_activity(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_ts   ON user_activity(created_at DESC);

-- ─── API Usage Tracking ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS api_usage (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID        REFERENCES users(id) ON DELETE CASCADE,
  endpoint      TEXT        NOT NULL,
  method        TEXT        DEFAULT 'GET',
  response_time INT         DEFAULT 0,     -- milliseconds
  status_code   INT         DEFAULT 200,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_api_usage_user ON api_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_api_usage_ts   ON api_usage(created_at DESC);

-- ─── AI Usage & Billing ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS ai_usage (
  id            UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID           REFERENCES users(id) ON DELETE CASCADE,
  model         TEXT           DEFAULT 'gemini-1.5-flash',
  tokens_in     INT            DEFAULT 0,
  tokens_out    INT            DEFAULT 0,
  total_tokens  INT            DEFAULT 0,
  cost_usd      DECIMAL(10,6)  DEFAULT 0,
  cost_inr      DECIMAL(10,2)  DEFAULT 0,
  endpoint      TEXT,
  created_at    TIMESTAMPTZ    DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_ai_usage_user ON ai_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_usage_ts   ON ai_usage(created_at DESC);

-- ─── Admin Audit Logs ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS audit_logs (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id    UUID        REFERENCES users(id) ON DELETE SET NULL,
  action      TEXT        NOT NULL,
  target_user UUID        REFERENCES users(id) ON DELETE SET NULL,
  metadata    JSONB       DEFAULT '{}',
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_audit_logs_admin ON audit_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_ts    ON audit_logs(created_at DESC);

-- ─── Error Logs ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS error_logs (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID        REFERENCES users(id) ON DELETE SET NULL,
  endpoint   TEXT,
  message    TEXT,
  stack      TEXT,
  severity   TEXT        DEFAULT 'error',  -- error | warning | info
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_error_logs_ts ON error_logs(created_at DESC);

-- ─── RLS Policies (admin tables are service-role only) ───────
ALTER TABLE user_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_usage      ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_usage       ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs     ENABLE ROW LEVEL SECURITY;
ALTER TABLE error_logs     ENABLE ROW LEVEL SECURITY;

-- Users can view their own AI usage (for billing page)
CREATE POLICY "users_view_own_ai_usage" ON ai_usage
  FOR SELECT USING (auth.uid() = user_id);

-- Service role bypasses all policies (for backend workers)
CREATE POLICY "service_role_all_user_activity" ON user_activity
  FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role_all_api_usage" ON api_usage
  FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role_all_ai_usage" ON ai_usage
  FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role_all_audit_logs" ON audit_logs
  FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role_all_error_logs" ON error_logs
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ─── Helper: Daily DAU Stats (for analytics chart) ───────────
CREATE OR REPLACE FUNCTION daily_user_stats(days INT DEFAULT 30)
RETURNS TABLE(date DATE, dau BIGINT, new_users BIGINT, api_calls BIGINT)
LANGUAGE sql STABLE
AS $$
  SELECT
    d::date,
    COUNT(DISTINCT ua.user_id)                    AS dau,
    COUNT(DISTINCT CASE WHEN u.created_at::date = d::date THEN u.id END) AS new_users,
    COUNT(au.id)                                   AS api_calls
  FROM generate_series(NOW() - (days || ' days')::interval, NOW(), '1 day') d
  LEFT JOIN user_activity ua ON ua.created_at::date = d::date
  LEFT JOIN users         u  ON u.created_at::date  = d::date
  LEFT JOIN api_usage     au ON au.created_at::date = d::date
  GROUP BY d
  ORDER BY d;
$$;

-- ─── Helper: Revenue stats per day ───────────────────────────
CREATE OR REPLACE FUNCTION daily_revenue_stats(days INT DEFAULT 30)
RETURNS TABLE(date DATE, cost_inr NUMERIC, tokens BIGINT)
LANGUAGE sql STABLE
AS $$
  SELECT
    d::date,
    COALESCE(SUM(a.cost_inr), 0) AS cost_inr,
    COALESCE(SUM(a.total_tokens), 0) AS tokens
  FROM generate_series(NOW() - (days || ' days')::interval, NOW(), '1 day') d
  LEFT JOIN ai_usage a ON a.created_at::date = d::date
  GROUP BY d
  ORDER BY d;
$$;

-- Seed: promote yourself to admin (replace with your real user ID)
-- UPDATE users SET role = 'superadmin' WHERE email = 'youremail@example.com';
