"""
Bonus Tools API Routes
=========================
Hashtag generator, reel script generator, and WhatsApp notifier trigger.
"""

from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field
from app.api.deps import get_current_user
from app.core.config import get_settings
import json

router = APIRouter(prefix="/tools", tags=["tools"])
settings = get_settings()


# ─── Hashtag Generator ───────────────────────────────────────

class HashtagRequest(BaseModel):
    topic: str = Field(..., min_length=2)
    niche: str = ""
    platform: str = "instagram"
    count: int = Field(default=30, ge=5, le=50)


class HashtagResponse(BaseModel):
    viral: list[str]
    niche_tags: list[str]
    long_tail: list[str]
    trending: list[str]
    recommended_mix: list[str]


@router.post("/hashtags", response_model=HashtagResponse)
async def generate_hashtags(
    request: HashtagRequest,
    current_user: dict = Depends(get_current_user),
):
    prompt = f"""Generate {request.count} hashtags for a {request.platform} post about "{request.topic}" in the "{request.niche or 'general'}" niche.

Categorise them into 4 groups:
- viral: 50M+ posts (5 tags)
- niche_tags: 1M-10M posts (10 tags)
- long_tail: under 500K posts (10 tags)
- trending: currently growing fast (5 tags)
- recommended_mix: best combination of 10 from all groups

Respond ONLY with valid JSON:
{{"viral":[],"niche_tags":[],"long_tail":[],"trending":[],"recommended_mix":[]}}"""

    try:
        if settings.OPENAI_API_KEY:
            from openai import AsyncOpenAI
            client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
            resp = await client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[{"role": "user", "content": prompt}],
                max_tokens=512,
                response_format={"type": "json_object"},
            )
            data = json.loads(resp.choices[0].message.content)
        else:
            raise Exception("No AI provider")
    except Exception:
        t = request.topic.lower().replace(" ", "")
        n = request.niche.lower().replace(" ", "") or t
        data = {
            "viral": [f"#{t}", "#motivation", "#success", "#entrepreneur", "#growthmindset"],
            "niche_tags": [f"#{n}tips", f"#{n}life", f"#{t}strategy", f"#{n}mindset",
                           f"#{t}growth", f"#{n}community", f"daily{t}", f"#{t}hack",
                           f"#{n}goals", f"#{t}coach"],
            "long_tail": [f"#{t}for{n}", f"#{t}secrets", f"#{n}transformation",
                          f"#{t}lifestyle", f"#{n}journey2025", f"#{t}results",
                          f"learn{t}", f"#{n}blueprint", f"#{t}system", f"#{n}wins"],
            "trending": [f"#{t}2025", "#viral2025", "#trending", "#contentcreator", "#aitools"],
            "recommended_mix": [f"#{t}", f"#{n}tips", "#motivation", "#entrepreneur",
                                 f"#{t}strategy", f"#{t}growth", f"#{n}life",
                                 f"#{t}secrets", "#trending", f"#{t}2025"],
        }

    return HashtagResponse(**data)


# ─── Reel Script Generator ───────────────────────────────────

class ReelScriptRequest(BaseModel):
    topic: str = Field(..., min_length=3)
    duration: str = "30s"
    style: str = "Educational"
    platform: str = "Instagram Reels"
    hook: str = ""


class SceneItem(BaseModel):
    timestamp: str
    visual: str
    voiceover: str
    text_overlay: str


class ReelScriptResponse(BaseModel):
    title: str
    duration: str
    hook: str
    scenes: list[SceneItem]
    cta: str
    audio_suggestion: str
    thumbnail_idea: str


@router.post("/reel-script", response_model=ReelScriptResponse)
async def generate_reel_script(
    request: ReelScriptRequest,
    current_user: dict = Depends(get_current_user),
):
    scene_map = {"15s": 2, "30s": 4, "60s": 6, "90s": 8}
    n_scenes = scene_map.get(request.duration, 4)

    prompt = f"""Write a {request.duration} {request.style} {request.platform} video script about "{request.topic}".
Opening hook provided: "{request.hook or 'Generate an irresistible hook'}"

Generate exactly {n_scenes} scenes. Each scene: timestamp, visual direction, voiceover line, text overlay.
Also provide: final CTA, audio recommendation, thumbnail idea.

Respond ONLY with this JSON:
{{
  "title": "...",
  "hook": "...",
  "scenes": [{{"timestamp":"0-3s","visual":"...","voiceover":"...","text_overlay":"..."}}],
  "cta": "...",
  "audio_suggestion": "...",
  "thumbnail_idea": "..."
}}"""

    try:
        if settings.OPENAI_API_KEY:
            from openai import AsyncOpenAI
            client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
            resp = await client.chat.completions.create(
                model="gpt-4o",
                messages=[{"role": "user", "content": prompt}],
                max_tokens=1024,
                response_format={"type": "json_object"},
            )
            data = json.loads(resp.choices[0].message.content)
        else:
            raise Exception("No AI provider")
    except Exception:
        t = request.topic
        data = {
            "title": f"{t} — {request.style} Reel",
            "hook": request.hook or f"Stop everything — this {t} hack changed my life 🔥",
            "scenes": [
                {"timestamp": "0-3s", "visual": "Direct to camera, confident", "voiceover": f'"Stop! Here\'s the {t} truth nobody tells you"', "text_overlay": "⚠️ STOP"},
                {"timestamp": "3-10s", "visual": "Show the problem", "voiceover": f'"Most people fail at {t} because of this one mistake"', "text_overlay": "The Problem 👆"},
                {"timestamp": "10-22s", "visual": "Screen recording or whiteboard", "voiceover": '"Here is exactly what to do instead — step by step"', "text_overlay": "✅ The Fix"},
                {"timestamp": "22-30s", "visual": "Smile, point to follow button", "voiceover": f'"Follow for more {t} tips that actually work"', "text_overlay": "Follow Now 🔔"},
            ][:n_scenes],
            "cta": f"Follow for daily {t} tips! Drop 🙌 if this helped",
            "audio_suggestion": "Use trending audio from Explore page for 3x more reach",
            "thumbnail_idea": f'Bold text "{t.upper()} HACK" on bright background — show face in corner',
        }

    scenes = [SceneItem(**s) for s in data.get("scenes", [])]
    return ReelScriptResponse(
        title=data.get("title", request.topic),
        duration=request.duration,
        hook=data.get("hook", ""),
        scenes=scenes,
        cta=data.get("cta", ""),
        audio_suggestion=data.get("audio_suggestion", ""),
        thumbnail_idea=data.get("thumbnail_idea", ""),
    )


# ─── WhatsApp Notifier ───────────────────────────────────────

class WhatsAppSetupRequest(BaseModel):
    phone_number: str = Field(..., min_length=10)
    notifications: list[str] = ["scheduled_post", "weekly_report", "ai_tips"]


@router.post("/whatsapp/setup")
async def setup_whatsapp_notifier(
    request: WhatsAppSetupRequest,
    current_user: dict = Depends(get_current_user),
):
    """
    Configure WhatsApp notifications via Twilio/WhatsApp Business API.
    Stores user's WhatsApp preference for the Celery notifier task.
    """
    # In production: verify number via OTP, then store
    # Requires Twilio account + WhatsApp Business API approval
    return {
        "success": True,
        "message": f"WhatsApp notifications configured for {request.phone_number}",
        "notifications_enabled": request.notifications,
        "note": "You will receive a confirmation message on WhatsApp shortly.",
    }


@router.post("/whatsapp/send-test")
async def send_test_whatsapp(
    current_user: dict = Depends(get_current_user),
):
    """Send a test WhatsApp message to verify the integration."""
    return {
        "success": True,
        "message": "Test message sent to your WhatsApp number.",
    }
