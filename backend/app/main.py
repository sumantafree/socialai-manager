"""
SocialAI Manager — FastAPI Backend
====================================
Run with: uvicorn app.main:app --reload --port 8000
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
import logging

from app.core.config import get_settings
from app.api.routes.content import router as content_router, blog_router
from app.api.routes.posts import router as posts_router, schedule_router
from app.api.routes.analytics import router as analytics_router
from app.api.routes.accounts import router as accounts_router, connect_router
from app.api.routes.trends import router as trends_router
from app.api.routes.competitor import router as competitor_router
from app.api.routes.tools import router as tools_router
from app.api.routes.admin import router as admin_router

settings = get_settings()
logger = logging.getLogger(__name__)

logging.basicConfig(level=logging.INFO if settings.DEBUG else logging.WARNING)


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info(f"🚀 {settings.APP_NAME} starting in {settings.APP_ENV} mode")
    yield
    logger.info("Shutting down…")


app = FastAPI(
    title=settings.APP_NAME,
    description="AI-powered Social Media Management Platform API",
    version="1.0.0",
    docs_url="/docs" if settings.DEBUG else None,
    redoc_url="/redoc" if settings.DEBUG else None,
    lifespan=lifespan,
)

# ─── CORS ─────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Routes ───────────────────────────────────────────────────
app.include_router(content_router)
app.include_router(blog_router)
app.include_router(posts_router)
app.include_router(schedule_router)
app.include_router(analytics_router)
app.include_router(accounts_router)
app.include_router(connect_router)
app.include_router(trends_router)
app.include_router(competitor_router)
app.include_router(tools_router)
app.include_router(admin_router)


# ─── Health ───────────────────────────────────────────────────
@app.get("/health", tags=["system"])
async def health():
    return {"status": "ok", "service": settings.APP_NAME, "env": settings.APP_ENV}


@app.get("/", tags=["system"])
async def root():
    return {"message": f"Welcome to {settings.APP_NAME} API. See /docs for documentation."}


# ─── Global Error Handler ─────────────────────────────────────
@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    logger.error(f"Unhandled error: {exc}", exc_info=True)
    return JSONResponse(status_code=500, content={"detail": "Internal server error"})
