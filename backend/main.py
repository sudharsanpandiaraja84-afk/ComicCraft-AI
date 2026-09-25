import logging
import os
import re
import sys
import urllib.parse
from typing import Any

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles

# Load local .env if available
load_dotenv()

# Add current directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import demo_data
import gemini_service
import image_generation_service
import quality_checker
import story_generator
from schemas import (
    Chapter,
    ChapterGenerateRequest,
    CompareVersionsRequest,
    CompleteStoryResponse,
    GeneratedImageResponse,
    ImageGenerateRequest,
    ImageRegenerateAllRequest,
    ImageRegenerateRequest,
    QualityCheckReport,
    RegenerateStoryRequest,
    SectionEditRequest,
    SectionEditResponse,
    StoryBlueprint,
    StoryCharacter,
    StoryContinueRequest,
    StoryExpandRequest,
    StoryGenerateRequest,
    StoryImproveRequest,
    StoryRewriteRequest,
    StorySceneExtractionRequest,
    StorySceneExtractionResponse,
    StoryShortenRequest,
    VerifyKeyRequest,
    VersionComparisonResult,
)

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger("storyforge.api")

app = FastAPI(
    title="StoryForge AI API",
    description="Turn a Simple Idea Into a Complete Story powered by Google Gemini",
    version="1.0.0",
)

# ---------------------------------------------------------------------------
# Security & Sanitization Helpers
# ---------------------------------------------------------------------------
MAX_REQUEST_BODY_SIZE = 10 * 1024 * 1024  # 10 MB maximum request payload


def sanitize_error_message(error: Any) -> str:
    """
    Sanitizes error messages to prevent leaking API keys, file system paths,
    or internal stack traces to API clients.
    """
    msg = str(error)
    # Redact Google Gemini / Cloud API keys (AIzaSy...)
    msg = re.sub(r"AIzaSy[A-Za-z0-9_-]{33}", "[REDACTED_API_KEY]", msg)
    # Redact generic query params or credentials (key=..., token=..., secret=...)
    msg = re.sub(r"(key=|token=|secret=)[A-Za-z0-9_-]+", r"\1[REDACTED]", msg, flags=re.IGNORECASE)
    # Redact Authorization Bearer tokens
    msg = re.sub(r"(Bearer\s+)[A-Za-z0-9_.-]+", r"\1[REDACTED]", msg, flags=re.IGNORECASE)
    # Redact internal Windows and Unix file paths
    msg = re.sub(r"[A-Za-z]:\\[^:\n\r\t]+", "[INTERNAL_PATH]", msg)
    msg = re.sub(r"/(?:home|Users|root|etc|var|usr|tmp)/[^\s\n\r]+", "[INTERNAL_PATH]", msg)
    # Redact internal Python traceback snippets if any
    if "Traceback (most recent call last):" in msg:
        msg = "An internal processing error occurred."
    return msg


@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    clean_detail = sanitize_error_message(exc.detail) if exc.status_code >= 500 else exc.detail
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": clean_detail},
        headers=getattr(exc, "headers", None),
    )


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled exception during request processing: {exc}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "An internal server error occurred. Please try again later."},
    )


# ---------------------------------------------------------------------------
# Middlewares
# ---------------------------------------------------------------------------
class RequestSizeLimiterMiddleware:
    """Middleware to enforce maximum request body size (prevents memory exhaustion DoS)."""

    def __init__(self, app_instance: Any, max_size: int = MAX_REQUEST_BODY_SIZE):
        self.app = app_instance
        self.max_size = max_size

    async def __call__(self, scope: Any, receive: Any, send: Any) -> None:
        if scope["type"] != "http":
            await self.app(scope, receive, send)
            return

        headers = dict(scope.get("headers", []))
        content_length = headers.get(b"content-length")
        if content_length:
            try:
                length_val = int(content_length.decode("latin1"))
                if length_val > self.max_size:
                    response = JSONResponse(
                        status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE
                        if not hasattr(status, "HTTP_413_CONTENT_TOO_LARGE")
                        else status.HTTP_413_CONTENT_TOO_LARGE,
                        content={"detail": "Request body exceeds maximum allowed size (10MB)."},
                    )
                    await response(scope, receive, send)
                    return
            except ValueError:
                response = JSONResponse(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    content={"detail": "Invalid Content-Length header."},
                )
                await response(scope, receive, send)
                return

        received_bytes = 0

        async def limited_receive():
            nonlocal received_bytes
            message = await receive()
            if message["type"] == "http.request":
                body = message.get("body", b"")
                received_bytes += len(body)
                if received_bytes > self.max_size:
                    resp = JSONResponse(
                        status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE
                        if not hasattr(status, "HTTP_413_CONTENT_TOO_LARGE")
                        else status.HTTP_413_CONTENT_TOO_LARGE,
                        content={"detail": "Request body exceeds maximum allowed size (10MB)."},
                    )
                    await resp(scope, receive, send)
                    return {"type": "http.disconnect"}
            return message

        await self.app(scope, limited_receive, send)


# GZip Compression Middleware (for responses >= 1000 bytes)
app.add_middleware(GZipMiddleware, minimum_size=1000)

# Request body size limiter middleware (10MB max)
app.add_middleware(RequestSizeLimiterMiddleware, max_size=MAX_REQUEST_BODY_SIZE)

# Configure CORS properly: support ALLOWED_ORIGINS env var (comma-separated),
# ensure credentials are only enabled when origins are specific, not with wildcard '*'
raw_origins = os.environ.get("ALLOWED_ORIGINS", "").strip()
if raw_origins:
    allowed_origins = [orig.strip() for orig in raw_origins.split(",") if orig.strip()]
else:
    allowed_origins = ["*"]

allow_credentials = "*" not in allowed_origins

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=allow_credentials,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=()"

    # Cache-Control headers for static files
    path = request.url.path
    if path.startswith("/assets/"):
        response.headers["Cache-Control"] = "public, max-age=31536000, immutable"
    elif path == "/" or path.endswith("index.html"):
        response.headers["Cache-Control"] = "no-cache"

    return response


@app.get("/api/health")
async def health_check():
    """Health check endpoint indicating API and Gemini configuration status."""
    has_env_key = bool(os.environ.get("GEMINI_API_KEY", "").strip())
    return {
        "status": "online",
        "service": "StoryForge AI",
        "gemini_api_configured": has_env_key,
        "demo_mode_available": True,
        "version": "1.0.0",
    }


@app.get("/api/demo", response_model=CompleteStoryResponse)
async def get_demo_story():
    """Returns the pre-written rich demo story for exploring the application without an API key."""
    return demo_data.get_demo_project()


@app.post("/api/settings/verify-key")
async def verify_key(req: VerifyKeyRequest):
    """Verifies a user-supplied Gemini API key."""
    return await gemini_service.verify_gemini_key(req.api_key)


@app.post("/api/story/analyze")
async def analyze_story(req: StoryGenerateRequest):
    """Analyzes the user's idea and provides thematic and conflict breakdown."""
    try:
        api_key = gemini_service.get_gemini_api_key(req.api_key)
        if req.demo_mode or not api_key:
            return {
                "premise": f"Exploration of {req.genre} narrative based on: {req.story_idea}",
                "potential_conflicts": ["Man vs Secret Knowledge", "Internal Moral Dilemma"],
                "recommended_pacing": "Layered and Suspenseful",
                "key_themes": ["Truth vs Legacy", "Consequences of Discovery"],
            }
        return await gemini_service.analyze_story_idea(req)
    except Exception as e:
        logger.error(f"Analysis error: {e}")
        raise HTTPException(status_code=500, detail=str(e)) from e


@app.post("/api/story/generate", response_model=CompleteStoryResponse)
async def generate_story(req: StoryGenerateRequest):
    """Executes the complete multi-step story generation pipeline."""
    try:
        if not req.story_idea or not req.story_idea.strip():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Please enter a story idea before generating.",
            )
        return await story_generator.run_story_generation_pipeline(req)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Story generation failed: {e}", exc_info=True)
        # Fallback to demo mode if API key issues occurred
        if "API key" in str(e) or "quota" in str(e).lower() or req.demo_mode:
            logger.info("Falling back to demo mode due to API constraints.")
            return demo_data.get_demo_project()
        raise HTTPException(status_code=500, detail=f"Story generation error: {str(e)}") from e


@app.post("/api/story/improve")
async def improve_story_endpoint(req: StoryImproveRequest):
    """Improves specific craft dimensions (Plot, Characters, Dialogue, Descriptions, Pacing)."""
    try:
        api_key = gemini_service.get_gemini_api_key(req.api_key)
        if req.demo_mode or not api_key:
            return {
                "improved_story": req.story,
                "improvements_summary": f"Polished {req.focus_area} with enhanced subtext and tighter transitions (Demo preview).",
            }
        return await gemini_service.improve_story(req)
    except Exception as e:
        logger.error(f"Improvement error: {e}")
        raise HTTPException(status_code=500, detail=str(e)) from e


@app.post("/api/story/continue")
async def continue_story_endpoint(req: StoryContinueRequest):
    """Continues the story preserving characters, setting, and writing style."""
    try:
        api_key = gemini_service.get_gemini_api_key(req.api_key)
        if req.demo_mode or not api_key:
            demo_p = demo_data.get_demo_project()
            if len(demo_p.chapters) > 1:
                return {
                    "continuation_title": demo_p.chapters[1].title,
                    "continuation_text": demo_p.chapters[1].content,
                    "transition_summary": demo_p.chapters[1].summary,
                }
            return {
                "continuation_title": "Chapter 2: The Unseen Repercussions",
                "continuation_text": "The echo of footsteps lingered in the cavernous hallway...",
                "transition_summary": "Picks up directly from the climax.",
            }
        return await gemini_service.continue_story(req)
    except Exception as e:
        logger.error(f"Continue story error: {e}")
        raise HTTPException(status_code=500, detail=str(e)) from e


@app.post("/api/story/rewrite")
async def rewrite_story_endpoint(req: StoryRewriteRequest):
    """Rewrites the narrative with new genre, tone, style, or ending."""
    try:
        api_key = gemini_service.get_gemini_api_key(req.api_key)
        if req.demo_mode or not api_key:
            return {
                "rewritten_title": "The Whispering Archives: Reimagined",
                "rewritten_story": req.story,
                "notes": f"Reimagined through the lens of {req.new_genre or 'new direction'} (Demo preview).",
            }
        return await gemini_service.rewrite_story(req)
    except Exception as e:
        logger.error(f"Rewrite error: {e}")
        raise HTTPException(status_code=500, detail=str(e)) from e


@app.post("/api/story/shorten")
async def shorten_story_endpoint(req: StoryShortenRequest):
    """Generates a concise version retaining narrative impact."""
    try:
        api_key = gemini_service.get_gemini_api_key(req.api_key)
        if req.demo_mode or not api_key:
            words = req.story.split()
            shortened = " ".join(words[: min(len(words), req.target_word_count or 600)])
            return {
                "shortened_story": shortened,
                "word_count": len(shortened.split()),
                "summary_of_cuts": "Streamlined exposition and concentrated on core dialogue.",
            }
        return await gemini_service.shorten_story(req)
    except Exception as e:
        logger.error(f"Shorten error: {e}")
        raise HTTPException(status_code=500, detail=str(e)) from e


@app.post("/api/story/expand")
async def expand_story_endpoint(req: StoryExpandRequest):
    """Expands narrative depth, scene descriptions, and dialogue."""
    try:
        api_key = gemini_service.get_gemini_api_key(req.api_key)
        if req.demo_mode or not api_key:
            return {
                "expanded_story": req.story
                + "\n\nEvery shadow in the library seemed to lean inward, whispering of ancient treaties and long-forgotten bargains made beneath the granite foundations.",
                "word_count": len(req.story.split()) + 30,
                "expansion_highlights": "Deepened atmospheric resonance and sensory descriptions.",
            }
        return await gemini_service.expand_story(req)
    except Exception as e:
        logger.error(f"Expand error: {e}")
        raise HTTPException(status_code=500, detail=str(e)) from e


@app.post("/api/story/chapter", response_model=Chapter)
async def generate_chapter_endpoint(req: ChapterGenerateRequest):
    """Generates a structured chapter adhering to story continuity."""
    try:
        api_key = gemini_service.get_gemini_api_key(req.api_key)
        if req.demo_mode or not api_key:
            demo_p = demo_data.get_demo_project()
            if len(demo_p.chapters) >= req.chapter_number:
                return demo_p.chapters[req.chapter_number - 1]
            return Chapter(
                chapter_number=req.chapter_number,
                title=req.chapter_title,
                content="The heavy oak doors clicked shut behind them as the cold morning air broke over the campus...",
                word_count=250,
                summary=f"Continuation focused on: {req.what_should_happen}",
            )
        return await gemini_service.generate_chapter(req)
    except Exception as e:
        logger.error(f"Chapter error: {e}")
        raise HTTPException(status_code=500, detail=str(e)) from e


@app.post("/api/story/check", response_model=QualityCheckReport)
async def check_story_quality_endpoint(req: dict[str, Any]):
    """Analyzes and validates narrative quality."""
    story_text = req.get("story", "")
    blueprint_data = req.get("blueprint", {})
    characters_data = req.get("characters", [])
    api_key = gemini_service.get_gemini_api_key(req.get("api_key"))

    try:
        blueprint = (
            StoryBlueprint(**blueprint_data)
            if blueprint_data
            else demo_data.get_demo_project().blueprint
        )
        characters = (
            [StoryCharacter(**c) for c in characters_data]
            if characters_data
            else demo_data.get_demo_project().characters
        )

        if not api_key:
            return quality_checker.evaluate_quality_heuristics(story_text, blueprint, characters)
        return await gemini_service.check_story_quality(story_text, blueprint, characters, api_key)
    except Exception as e:
        logger.warning(f"Quality check fallback: {e}")
        demo_p = demo_data.get_demo_project()
        return demo_p.quality_check


@app.post("/api/story/edit-section", response_model=SectionEditResponse)
async def edit_section_endpoint(req: SectionEditRequest):
    """Modifies an individual paragraph or excerpt in-place."""
    try:
        api_key = gemini_service.get_gemini_api_key(req.api_key)
        if req.demo_mode or not api_key:
            return SectionEditResponse(
                original_text=req.selected_text,
                replacement_text=f"{req.selected_text.strip()} (Refined with heightened sensory cadence)",
                action=req.action,
                explanation="Punched up sentence structure and atmospheric detail.",
            )
        return await gemini_service.edit_section(req)
    except Exception as e:
        logger.error(f"Section edit error: {e}")
        raise HTTPException(status_code=500, detail=str(e)) from e


# ============================================================================
# FEATURE 1 ENDPOINTS: REGENERATE STORY & VERSION COMPARISON
# ============================================================================


@app.post("/api/story/regenerate", response_model=CompleteStoryResponse)
async def regenerate_story_endpoint(req: RegenerateStoryRequest):
    """
    Generates a genuinely new narrative version from the original idea,
    faithfully executing the user's selected genre, tone, and regeneration mode.
    """
    try:
        return await gemini_service.regenerate_story(req)
    except Exception as e:
        logger.error(f"Story regeneration error: {e}", exc_info=True)
        # Fallback to demo regenerated version
        return demo_data.get_demo_regenerated_story(
            req.regeneration_option, req.custom_instruction or ""
        )


@app.post("/api/story/compare", response_model=VersionComparisonResult)
async def compare_story_versions_endpoint(req: CompareVersionsRequest):
    """Contrasts two narrative versions highlighting plot, character, and ending divergence."""
    try:
        return await gemini_service.compare_story_versions(req)
    except Exception as e:
        logger.error(f"Version comparison error: {e}")
        return demo_data.get_demo_version_comparison(req.version_a.title, req.version_b.title)


# ============================================================================
# FEATURE 2 ENDPOINTS: STORY TO SCENE & IMAGE GENERATION
# ============================================================================


@app.post("/api/story/scenes", response_model=StorySceneExtractionResponse)
async def extract_scenes_endpoint(req: StorySceneExtractionRequest):
    """
    Converts full story or chapter into structured visual scenes, character visual profiles,
    and location profiles with synthesized image prompts.
    """
    try:
        return await gemini_service.extract_story_scenes(req)
    except Exception as e:
        logger.error(f"Story scene extraction error: {e}")
        demo_dict = demo_data.get_demo_story_scenes(
            req.visual_style or "Cinematic", req.target_scene_count or 5
        )
        return StorySceneExtractionResponse(
            story_title=demo_dict["story_title"],
            visual_style=demo_dict["visual_style"],
            characters=demo_dict["characters"],
            locations=demo_dict["locations"],
            scenes=demo_dict["scenes"],
        )


@app.post("/api/story/image-prompts")
async def generate_image_prompts_endpoint(req: StorySceneExtractionRequest):
    """Synthesizes or updates visual prompts for scenes."""
    return await extract_scenes_endpoint(req)


@app.get("/api/images/status")
async def get_image_status_endpoint():
    """Checks the status and capabilities of the image generation service."""
    return image_generation_service.get_image_service_status()


@app.post("/api/images/generate", response_model=GeneratedImageResponse)
async def generate_image_endpoint(req: ImageGenerateRequest):
    """Generates an image for a specific visual scene."""
    try:
        return await image_generation_service.generate_scene_image(
            scene_id=req.scene_id,
            prompt=req.image_prompt,
            negative_prompt=req.negative_prompt,
            visual_style=req.visual_style or "Cinematic",
        )
    except Exception as e:
        logger.error(f"Image generation error: {e}")
        return GeneratedImageResponse(
            scene_id=req.scene_id,
            image_url=None,
            prompt_used=req.image_prompt,
            negative_prompt_used=req.negative_prompt or "",
            status="error",
            message=f"Image generation error: {sanitize_error_message(str(e))}",
        )


@app.post("/api/images/regenerate", response_model=GeneratedImageResponse)
async def regenerate_image_endpoint(req: ImageRegenerateRequest):
    """Regenerates an image for a single scene with optional custom guidance."""
    try:
        final_prompt = req.image_prompt
        if req.custom_guidance and req.custom_guidance.strip():
            final_prompt = f"{req.image_prompt}, {req.custom_guidance.strip()}"
        return await image_generation_service.generate_scene_image(
            scene_id=req.scene_id,
            prompt=final_prompt,
            negative_prompt=req.negative_prompt,
            visual_style=req.visual_style or "Cinematic",
        )
    except Exception as e:
        logger.error(f"Image regeneration error: {e}")
        return GeneratedImageResponse(
            scene_id=req.scene_id,
            image_url=None,
            prompt_used=req.image_prompt,
            negative_prompt_used=req.negative_prompt or "",
            status="error",
            message=f"Regeneration error: {sanitize_error_message(str(e))}",
        )


@app.post("/api/images/regenerate-all", response_model=list[GeneratedImageResponse])
async def regenerate_all_images_endpoint(req: ImageRegenerateAllRequest):
    """Regenerates all scene images sequentially while maintaining consistent characters and style."""
    try:
        return await image_generation_service.generate_story_images(
            scenes=req.scenes, visual_style=req.visual_style or "Cinematic"
        )
    except Exception as e:
        logger.error(f"Regenerate all images error: {e}")
        return [
            GeneratedImageResponse(
                scene_id=s.scene_id,
                image_url=None,
                prompt_used=s.image_prompt,
                negative_prompt_used=s.negative_prompt,
                status="error",
                message=f"Batch error: {sanitize_error_message(str(e))}",
            )
            for s in req.scenes
        ]


# Serve built frontend from dist if available
dist_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "dist"))
if os.path.isdir(dist_dir):
    assets_dir = os.path.join(dist_dir, "assets")
    if os.path.isdir(assets_dir):

        class CachedStaticFiles(StaticFiles):
            """StaticFiles handler that applies aggressive caching headers for assets."""

            async def get_response(self, path: str, scope: Any):
                response = await super().get_response(path, scope)
                if response.status_code < 400:
                    response.headers["Cache-Control"] = "public, max-age=31536000, immutable"
                return response

        app.mount("/assets", CachedStaticFiles(directory=assets_dir), name="assets")

    @app.get("/")
    @app.get("/{full_path:path}")
    async def serve_frontend(full_path: str = ""):
        if (
            full_path.startswith("api")
            or full_path.startswith("docs")
            or full_path.startswith("redoc")
            or full_path == "openapi.json"
        ):
            raise HTTPException(status_code=404, detail="Not Found")

        if not full_path:
            index_file = os.path.join(dist_dir, "index.html")
            if os.path.isfile(index_file):
                return FileResponse(index_file, headers={"Cache-Control": "no-cache"})
            raise HTTPException(status_code=404, detail="Frontend index.html not found")

        # Protect against path traversal (including encoded characters, backslashes, null bytes)
        decoded_path = full_path
        for _ in range(3):
            new_decoded = urllib.parse.unquote(decoded_path)
            if new_decoded == decoded_path:
                break
            decoded_path = new_decoded

        if "\0" in decoded_path or "\0" in full_path:
            raise HTTPException(status_code=400, detail="Invalid path")

        normalized = decoded_path.replace("\\", "/")
        parts = [p for p in normalized.split("/") if p]
        if (
            any(p == ".." for p in parts)
            or os.path.isabs(decoded_path)
            or (len(decoded_path) > 1 and decoded_path[1] == ":")
        ):
            raise HTTPException(status_code=403, detail="Forbidden")

        safe_rel_path = os.path.normpath(decoded_path).lstrip("/\\")
        file_path = os.path.abspath(os.path.join(dist_dir, safe_rel_path))
        try:
            if os.path.commonpath([file_path, dist_dir]) != dist_dir:
                raise HTTPException(status_code=403, detail="Forbidden")
        except ValueError:
            # Different drives or invalid path syntax on Windows
            raise HTTPException(status_code=403, detail="Forbidden") from None

        if full_path and os.path.isfile(file_path):
            headers = {}
            if safe_rel_path.startswith("assets") or full_path.startswith("assets"):
                headers["Cache-Control"] = "public, max-age=31536000, immutable"
            return FileResponse(file_path, headers=headers)

        # If a specific file or system directory was requested and doesn't exist, return 404
        filename = os.path.basename(safe_rel_path)
        system_dirs = {
            "etc",
            "windows",
            "winnt",
            "system32",
            "bin",
            "sbin",
            "usr",
            "var",
            "dev",
            "proc",
        }
        if ("." in filename and not filename.endswith(".html")) or (
            parts and parts[0].lower() in system_dirs
        ):
            raise HTTPException(status_code=404, detail="File Not Found")

        index_file = os.path.join(dist_dir, "index.html")
        if os.path.isfile(index_file):
            return FileResponse(index_file, headers={"Cache-Control": "no-cache"})
        raise HTTPException(status_code=404, detail="Frontend index.html not found")


if __name__ == "__main__":
    import uvicorn

    host = os.environ.get("HOST", "0.0.0.0")
    port = int(os.environ.get("PORT", 8000))
    reload = os.environ.get("ENV", "development").lower() == "development"
    uvicorn.run("main:app", host=host, port=port, reload=reload)
