from __future__ import annotations

import os
from datetime import datetime, timezone

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel


app = FastAPI(
    title="SIHAG AI STUDIO Backend",
    version="0.1.0",
    description="Backend foundation for SIHAG AI STUDIO.",
)


def get_allowed_origins() -> list[str]:
    local_origins = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]

    configured = os.getenv("CORS_ORIGINS", "")
    configured_origins = [
        origin.strip()
        for origin in configured.split(",")
        if origin.strip()
    ]

    return list(dict.fromkeys(local_origins + configured_origins))


app.add_middleware(
    CORSMiddleware,
    allow_origins=get_allowed_origins(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class HealthResponse(BaseModel):
    status: str
    service: str
    version: str
    utc_time: str


@app.get("/")
def root() -> dict[str, str]:
    return {
        "service": "SIHAG AI STUDIO Backend",
        "status": "running",
    }


@app.get("/health", response_model=HealthResponse)
def health() -> HealthResponse:
    return HealthResponse(
        status="ok",
        service="sihag-ai-studio-ai",
        version="0.1.0",
        utc_time=datetime.now(timezone.utc).isoformat(),
    )


@app.get("/api/ai/capabilities")
def capabilities() -> dict[str, object]:
    return {
        "backend_ready": True,
        "tools": {
            "remove_background": False,
            "generative_fill": False,
            "generative_replace": False,
            "enhance": False,
            "upscale": False,
            "restore_photo": False,
        },
    }
