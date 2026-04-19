-- =============================================================
-- SocialAI Manager — Seed / Demo Data
-- Run AFTER migrations. Uses a test UUID — replace as needed.
-- =============================================================

-- Demo user (replace uuid with a real auth.users id in your project)
INSERT INTO public.users (id, email, full_name, plan, posts_this_month)
VALUES (
    '00000000-0000-0000-0000-000000000001'::uuid,
    'demo@socialai.app',
    'Demo User',
    'pro',
    3
) ON CONFLICT (id) DO NOTHING;

-- Demo posts
INSERT INTO public.posts (user_id, platform, content, status, scheduled_at, published_at)
VALUES
(
    '00000000-0000-0000-0000-000000000001',
    'instagram',
    '5 morning habits that will change your life 🌅

Most people start their day scrolling social media. Here''s what high performers do instead:

1️⃣ No phone for the first 30 minutes
2️⃣ Move your body (even 10 minutes counts)
3️⃣ Write 3 things you''re grateful for
4️⃣ Set your 3 priorities for the day
5️⃣ Cold water splash to wake up your nervous system

The secret? Compound consistency over time.

Save this post for your morning routine reset! 💾

#productivity #morningroutine #habits #success #mindset',
    'published',
    NOW() - INTERVAL '2 days',
    NOW() - INTERVAL '2 days'
),
(
    '00000000-0000-0000-0000-000000000001',
    'twitter',
    'Hot take: Your consistency > Your talent.

I know people 10x less "talented" who are 10x more successful.

The difference? They show up every single day.

What habit have you built that changed everything? 👇',
    'published',
    NOW() - INTERVAL '1 day',
    NOW() - INTERVAL '1 day'
),
(
    '00000000-0000-0000-0000-000000000001',
    'linkedin',
    'I''ve interviewed 200+ founders. The ones who failed all had one thing in common.

They optimised for funding, not customers.

The ones who succeeded? They talked to users every day.

What''s the most counterintuitive business lesson you''ve learned?',
    'scheduled',
    NOW() + INTERVAL '1 day',
    NULL
);

-- Demo analytics for published posts
WITH demo_posts AS (
    SELECT id FROM public.posts
    WHERE user_id = '00000000-0000-0000-0000-000000000001'
    AND status = 'published'
)
INSERT INTO public.analytics (post_id, likes, comments, shares, reach, impressions, engagement_rate)
SELECT
    id,
    floor(random() * 2000 + 500)::int,
    floor(random() * 200 + 50)::int,
    floor(random() * 300 + 100)::int,
    floor(random() * 15000 + 5000)::int,
    floor(random() * 20000 + 8000)::int,
    round((random() * 8 + 3)::numeric, 2)
FROM demo_posts
ON CONFLICT (post_id) DO NOTHING;
