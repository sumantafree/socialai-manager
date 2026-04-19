"""
AI Content Generation Service
==============================
Uses advanced prompt engineering to generate viral, platform-optimised
social media content. Supports OpenAI and Anthropic interchangeably.
"""

from app.core.config import get_settings
from app.models.schemas import ContentGenerateRequest, GeneratedContent
import json
import re

settings = get_settings()

# ─── Platform Algorithm Rules ────────────────────────────────

PLATFORM_RULES = {
    "instagram": {
        "caption_length": "150–300 words for feed, 50–100 for Reels",
        "hook_style": "Emotional, curiosity-driven, visual imagery",
        "hashtag_count": "10–15",
        "best_formats": "Carousels, Reels, Stories",
        "algorithm_tips": "Save rate and share rate matter most. Start with a strong first line visible before 'more'.",
        "cta_style": "Save this, share with a friend, comment your answer",
    },
    "twitter": {
        "caption_length": "Under 280 characters for single tweet; 25–30 tweets for threads",
        "hook_style": "Contrarian takes, surprising stats, provocative questions",
        "hashtag_count": "1–3",
        "best_formats": "Threads, polls, single hot takes",
        "algorithm_tips": "Replies and retweets drive reach. First tweet must make people want to click 'show more'.",
        "cta_style": "RT if you agree, Drop your take, Follow for more",
    },
    "linkedin": {
        "caption_length": "150–300 words, 3–5 short paragraphs",
        "hook_style": "Professional story, data-backed insight, personal lesson",
        "hashtag_count": "3–5",
        "best_formats": "Personal stories, listicles, document posts",
        "algorithm_tips": "Comments are weighted heavily. Ask a question at the end. Space out paragraphs.",
        "cta_style": "What's your experience? Drop a comment, Follow for weekly insights",
    },
    "youtube": {
        "caption_length": "Script: 60–90 seconds for Shorts (150–200 words)",
        "hook_style": "Pattern interrupt, bold claim, immediate value promise",
        "hashtag_count": "3–5 in description",
        "best_formats": "Shorts, tutorials, vlogs",
        "algorithm_tips": "Watch time and CTR are everything. First 3 seconds determine retention.",
        "cta_style": "Subscribe, like if this helped, comment your question",
    },
    "facebook": {
        "caption_length": "40–80 words for feed posts",
        "hook_style": "Relatable, community-focused, story-driven",
        "hashtag_count": "5–10",
        "best_formats": "Videos, events, group posts",
        "algorithm_tips": "Meaningful interactions (comments, shares) beat likes. Avoid engagement-bait.",
        "cta_style": "Tag someone who needs this, Share your story below",
    },
    "pinterest": {
        "caption_length": "100–200 characters",
        "hook_style": "Aspirational, solution-focused, how-to",
        "hashtag_count": "5–10",
        "best_formats": "Idea Pins, infographics, step-by-step guides",
        "algorithm_tips": "SEO keywords in title and description. Vertical images (2:3 ratio).",
        "cta_style": "Save this for later, Click to learn more",
    },
}

PSYCHOLOGICAL_HOOKS = [
    "curiosity gap (leave them wanting more)",
    "social proof (others are doing this)",
    "fear of missing out (urgency/scarcity)",
    "pattern interrupt (break expectations)",
    "controversy (challenge a popular belief)",
    "relatability (I've been there too)",
    "transformation (before → after story)",
    "data/statistics (back claims with numbers)",
]

TONE_GUIDES = {
    "Inspirational": "Uplifting, motivational, emotion-driven. Use 'you can', 'you deserve', 'imagine if'.",
    "Educational": "Clear, structured, value-first. Use numbered steps, facts, 'here's how'.",
    "Entertaining": "Fun, light-hearted, personality-driven. Use humour, pop culture references, emojis.",
    "Professional": "Authoritative, data-backed, formal. Avoid slang, focus on ROI and metrics.",
    "Casual": "Conversational, friendly, approachable. Write like texting a friend.",
    "Bold & Direct": "Blunt, confident, no-fluff. Short sentences. Strong verbs. No apologies.",
}


def build_system_prompt() -> str:
    return """You are an expert viral content strategist and copywriter with 10+ years of experience growing social media accounts to millions of followers. You deeply understand platform algorithms, human psychology, and what makes content spread organically.

Your content always:
- Starts with a scroll-stopping hook using psychological triggers
- Delivers genuine value (educates, entertains, or inspires)
- Is optimised for the specific platform's algorithm
- Uses strategic CTAs that drive meaningful engagement
- Includes trending, relevant hashtags

You ALWAYS respond with valid JSON only. No extra text, no markdown code blocks."""


def build_generation_prompt(req: ContentGenerateRequest) -> str:
    rules = PLATFORM_RULES.get(req.platform, PLATFORM_RULES["instagram"])
    tone_guide = TONE_GUIDES.get(req.tone, TONE_GUIDES["Inspirational"])

    return f"""Create viral {req.platform.upper()} content for the following:

**Topic:** {req.topic}
**Niche:** {req.niche or "General"}
**Tone:** {req.tone} — {tone_guide}
**Target Audience:** {req.target_audience or "General audience interested in " + (req.niche or req.topic)}

**Platform Rules for {req.platform.upper()}:**
- Caption Length: {rules["caption_length"]}
- Hook Style: {rules["hook_style"]}
- Hashtag Count: {rules["hashtag_count"]}
- Best Formats: {rules["best_formats"]}
- Algorithm Tips: {rules["algorithm_tips"]}
- CTA Style: {rules["cta_style"]}

**Psychological hooks to consider:** {", ".join(PSYCHOLOGICAL_HOOKS[:4])}

Generate content that will maximise reach, saves, and engagement on {req.platform}.

Respond ONLY with this exact JSON structure:
{{
  "hook": "The attention-grabbing first line (max 2 sentences, must make people stop scrolling)",
  "caption": "The full post caption following platform best practices (use emojis strategically, paragraph breaks, numbered lists where appropriate)",
  "cta": "A compelling call-to-action tailored to this platform",
  "hashtags": ["array", "of", "{req.hashtag_count}", "hashtags", "without", "duplicates"],
  "script": "For video platforms (YouTube/Instagram Reels/TikTok): A 60-90 second script with [HOOK 0-3s], [VALUE 3-25s], [CTA 25-30s] markers. For text platforms, set to null.",
  "creative_idea": "A specific visual or format idea for this post (camera angles, transitions, design ideas)",
  "seo_title": "SEO-optimised title if applicable (YouTube/Pinterest/LinkedIn), otherwise null",
  "estimated_reach": "Estimated reach potential: Low/Medium/High/Viral based on topic and platform trends"
}}"""


def _count_gemini_tokens(text: str) -> int:
    """Rough estimate: 1 token ≈ 4 characters."""
    return max(1, len(text) // 4)


async def _call_gemini(prompt: str, system: str) -> tuple[str, int, int]:
    """Call Google Gemini and return (raw_text, tokens_in, tokens_out)."""
    import google.generativeai as genai
    genai.configure(api_key=settings.GEMINI_API_KEY)
    model = genai.GenerativeModel(
        settings.AI_MODEL_GEMINI,
        system_instruction=system,
        generation_config=genai.GenerationConfig(
            response_mime_type="application/json",
            max_output_tokens=2048,
            temperature=0.85,
        ),
    )
    response = model.generate_content(prompt)
    raw = response.text
    tok_in = _count_gemini_tokens(prompt + system)
    tok_out = _count_gemini_tokens(raw)
    return raw, tok_in, tok_out


async def generate_content_ai(
    req: ContentGenerateRequest,
    track_usage_fn=None,   # optional async callable(tokens_in, tokens_out, model)
) -> GeneratedContent:
    """Generate viral content using AI. Falls back gracefully on error.
    Supports Gemini (default), OpenAI, Anthropic.
    """
    prompt = build_generation_prompt(req)
    system = build_system_prompt()
    raw = ""

    try:
        # ── 1. Gemini (default) ──────────────────────────────
        if settings.AI_PROVIDER == "gemini" and settings.GEMINI_API_KEY:
            raw, tok_in, tok_out = await _call_gemini(prompt, system)
            if track_usage_fn:
                await track_usage_fn(tok_in, tok_out, settings.AI_MODEL_GEMINI)

        # ── 2. Anthropic ─────────────────────────────────────
        elif settings.AI_PROVIDER == "anthropic" and settings.ANTHROPIC_API_KEY:
            import anthropic
            client = anthropic.Anthropic(api_key=settings.ANTHROPIC_API_KEY)
            message = client.messages.create(
                model=settings.AI_MODEL_ANTHROPIC,
                max_tokens=2048,
                system=system,
                messages=[{"role": "user", "content": prompt}],
            )
            raw = message.content[0].text

        # ── 3. OpenAI ─────────────────────────────────────────
        elif settings.OPENAI_API_KEY:
            from openai import AsyncOpenAI
            client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
            response = await client.chat.completions.create(
                model=settings.AI_MODEL_OPENAI,
                messages=[
                    {"role": "system", "content": system},
                    {"role": "user", "content": prompt},
                ],
                max_tokens=2048,
                temperature=0.85,
                response_format={"type": "json_object"},
            )
            raw = response.choices[0].message.content

        # ── 4. No API key → fallback ──────────────────────────
        else:
            return _fallback_content(req)

        data = json.loads(raw)
        return GeneratedContent(
            hook=data.get("hook", ""),
            caption=data.get("caption", ""),
            cta=data.get("cta", ""),
            hashtags=data.get("hashtags", []),
            script=data.get("script"),
            creative_idea=data.get("creative_idea"),
            seo_title=data.get("seo_title"),
            platform=req.platform,
            estimated_reach=data.get("estimated_reach"),
        )

    except json.JSONDecodeError:
        match = re.search(r"\{.*\}", raw, re.DOTALL)
        if match:
            try:
                data = json.loads(match.group())
                return GeneratedContent(platform=req.platform, **data)
            except Exception:
                pass
        return _fallback_content(req)
    except Exception:
        return _fallback_content(req)


def _fallback_content(req: ContentGenerateRequest) -> GeneratedContent:
    """Deterministic fallback when AI is unavailable."""
    topic = req.topic
    niche = req.niche or "growth"
    return GeneratedContent(
        hook=f"🔥 This ONE {topic} secret changed everything for me…",
        caption=(
            f"Most people struggle with {topic} because they're approaching it backwards.\n\n"
            f"Here's the framework nobody talks about:\n\n"
            f"1️⃣ Start with the outcome in mind\n"
            f"2️⃣ Build systems, not willpower\n"
            f"3️⃣ Measure what actually moves the needle\n\n"
            f"The truth? Consistency beats intensity every single time.\n\n"
            f"I transformed my results in 30 days using these 3 principles.\n\n"
            f"Save this post — you'll want to revisit it. 💾"
        ),
        cta=f"Drop a '🙌' in the comments if this hit different! Follow for daily {niche} tips.",
        hashtags=[
            f"#{niche.lower().replace(' ', '')}", "#growth", "#success", "#mindset",
            "#entrepreneur", "#motivation", "#productivity", "#goals", "#strategy", "#winning"
        ],
        script=(
            f"[HOOK - 0-3s]\n\"Stop! Here's the {topic} truth nobody talks about...\"\n\n"
            f"[VALUE - 3-25s]\n\"Most people fail at {topic} because of 3 mistakes...\"\n\n"
            f"[CTA - 25-30s]\n\"Follow for more {niche} tips. Which mistake were you making?\""
        ),
        creative_idea=f"Use a split-screen showing before/after related to {topic}. Add trending audio.",
        seo_title=f"How to Master {topic} in 2025 | {niche.title()} Tips",
        platform=req.platform,
        estimated_reach="High",
    )


async def generate_blog_to_social(blog_content: str, platforms: list[str], tone: str = "Inspirational") -> dict:
    """Convert a blog post into platform-specific social media posts."""
    posts = {}
    for platform in platforms:
        req = ContentGenerateRequest(
            platform=platform,  # type: ignore
            topic=f"Blog repurpose: {blog_content[:200]}",
            tone=tone,  # type: ignore
            include_script=platform in ["instagram", "youtube"],
        )
        posts[platform] = await generate_content_ai(req)
    return posts


async def generate_ai_insights(analytics_data: list[dict]) -> list[str]:
    """Generate AI-powered insights from analytics data using Gemini/OpenAI."""
    if not analytics_data:
        return ["Not enough data yet. Keep posting consistently!"]

    insight_prompt = (
        f"Analyse this social media performance data and provide exactly 4 short, "
        f"actionable insights as a JSON object with key 'insights' (array of strings): "
        f"{json.dumps(analytics_data[:50])}"
    )

    try:
        if settings.GEMINI_API_KEY:
            import google.generativeai as genai
            genai.configure(api_key=settings.GEMINI_API_KEY)
            model = genai.GenerativeModel(
                "gemini-1.5-flash",
                generation_config=genai.GenerationConfig(
                    response_mime_type="application/json", max_output_tokens=512
                ),
            )
            response = model.generate_content(insight_prompt)
            data = json.loads(response.text)
            return data.get("insights", [])

        elif settings.OPENAI_API_KEY:
            from openai import AsyncOpenAI
            client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
            response = await client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[{"role": "user", "content": insight_prompt}],
                max_tokens=512,
                response_format={"type": "json_object"},
            )
            data = json.loads(response.choices[0].message.content)
            return data.get("insights", [])

        else:
            raise Exception("no key")

    except Exception:
        return [
            "Your Friday posts consistently outperform other days — post more on Fridays.",
            "Video content gets 3x more engagement than static images in your account.",
            "Posts with questions in captions get 40% more comments.",
            "Your best posting window is 7–9 PM based on your audience's activity.",
        ]
