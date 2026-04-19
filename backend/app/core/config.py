from pydantic_settings import BaseSettings
from functools import lru_cache
from typing import Literal, Union
from pydantic import field_validator


class Settings(BaseSettings):
    # App
    APP_NAME: str = "SocialAI Manager"
    APP_ENV: Literal["development", "production"] = "development"
    APP_SECRET_KEY: str = "change-me"
    DEBUG: bool = True

    # CORS
    BACKEND_CORS_ORIGINS: Union[list[str], str] = ["http://localhost:3000"]

    @field_validator("BACKEND_CORS_ORIGINS", mode="before")
    @classmethod
    def parse_cors(cls, v):
        if isinstance(v, str):
            # Handle "*" or comma-separated values like "https://a.com,https://b.com"
            v = v.strip()
            if v == "*":
                return ["*"]
            return [origin.strip() for origin in v.split(",") if origin.strip()]
        return v

    # Supabase
    SUPABASE_URL: str = ""
    SUPABASE_SERVICE_ROLE_KEY: str = ""
    SUPABASE_ANON_KEY: str = ""

    # AI — set AI_PROVIDER=gemini to use Google Gemini
    OPENAI_API_KEY: str = ""
    ANTHROPIC_API_KEY: str = ""
    GEMINI_API_KEY: str = ""
    AI_PROVIDER: Literal["openai", "anthropic", "gemini"] = "gemini"
    AI_MODEL_OPENAI: str = "gpt-4o"
    AI_MODEL_ANTHROPIC: str = "claude-sonnet-4-6"
    AI_MODEL_GEMINI: str = "gemini-1.5-flash"

    # Admin
    ADMIN_SECRET_KEY: str = "change-me-admin-key"  # used for seeding first admin

    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"

    # Social Media
    INSTAGRAM_APP_ID: str = ""
    INSTAGRAM_APP_SECRET: str = ""
    TWITTER_API_KEY: str = ""
    TWITTER_API_SECRET: str = ""
    TWITTER_BEARER_TOKEN: str = ""
    LINKEDIN_CLIENT_ID: str = ""
    LINKEDIN_CLIENT_SECRET: str = ""
    YOUTUBE_CLIENT_ID: str = ""
    YOUTUBE_CLIENT_SECRET: str = ""
    FACEBOOK_APP_ID: str = ""
    FACEBOOK_APP_SECRET: str = ""

    # Stripe
    STRIPE_SECRET_KEY: str = ""
    STRIPE_WEBHOOK_SECRET: str = ""
    STRIPE_PRO_PRICE_ID: str = ""
    STRIPE_AGENCY_PRICE_ID: str = ""

    # Twilio (WhatsApp)
    TWILIO_ACCOUNT_SID: str = ""
    TWILIO_AUTH_TOKEN: str = ""
    TWILIO_WHATSAPP_FROM: str = ""  # e.g. +14155238886

    model_config = {"env_file": ".env", "extra": "ignore"}


@lru_cache
def get_settings() -> Settings:
    return Settings()
