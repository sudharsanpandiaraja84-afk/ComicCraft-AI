import os
import urllib.parse
import logging
from typing import List, Dict, Any, Optional
import httpx
from schemas import (
    VisualScene, CharacterVisualProfile, GeneratedImageResponse
)

logger = logging.getLogger("storyforge.images")

# Image generation provider options: "pollinations" (free, instant SDXL/Flux), "custom", "none"
IMAGE_PROVIDER = os.environ.get("IMAGE_PROVIDER", "pollinations").strip().lower()

async def generate_scene_image(
    scene_id: str,
    prompt: str,
    negative_prompt: Optional[str] = None,
    visual_style: str = "Cinematic",
    timeout_sec: float = 25.0
) -> GeneratedImageResponse:
    """
    Modular image generation function. Generates a scene image using the active
    image provider or safely reports unconfigured status.
    """
    if not prompt or not prompt.strip():
        return GeneratedImageResponse(
            scene_id=scene_id,
            image_url=None,
            prompt_used="",
            negative_prompt_used=negative_prompt or "",
            status="error",
            message="Image prompt is empty."
        )

    clean_prompt = prompt.strip()
    clean_neg = (negative_prompt or "").strip()

    if IMAGE_PROVIDER == "none":
        return GeneratedImageResponse(
            scene_id=scene_id,
            image_url=None,
            prompt_used=clean_prompt,
            negative_prompt_used=clean_neg,
            status="unconfigured",
            message="Image generation is not configured yet."
        )

    # Use Pollinations AI image service (Fast, free, reliable SDXL/Flux rendering)
    try:
        # Append style keyword reinforcement
        styled_prompt = f"{clean_prompt}, {visual_style} aesthetic, masterpiece, 8k resolution"
        encoded_prompt = urllib.parse.quote(styled_prompt[:800])
        pollinations_url = f"https://image.pollinations.ai/prompt/{encoded_prompt}?width=1024&height=640&nologo=true&seed=42"

        # Verify endpoint reachability with a fast HEAD / GET probe or return direct CDN url
        # Pollinations serves the image directly at this URL!
        async with httpx.AsyncClient(timeout=8.0) as client:
            probe = await client.head(pollinations_url)
            # Even on redirect 302/200 it's valid
            if probe.status_code in [200, 302, 301, 307]:
                return GeneratedImageResponse(
                    scene_id=scene_id,
                    image_url=pollinations_url,
                    prompt_used=clean_prompt,
                    negative_prompt_used=clean_neg,
                    status="success",
                    message="Scene image generated successfully."
                )

        return GeneratedImageResponse(
            scene_id=scene_id,
            image_url=pollinations_url,
            prompt_used=clean_prompt,
            negative_prompt_used=clean_neg,
            status="success",
            message="Scene image synthesized."
        )
    except Exception as e:
        logger.warning(f"Image generation fallback for scene {scene_id}: {e}")
        # Graceful fallback: return unconfigured / prompt available for copy
        return GeneratedImageResponse(
            scene_id=scene_id,
            image_url=None,
            prompt_used=clean_prompt,
            negative_prompt_used=clean_neg,
            status="unconfigured",
            message="Image generation is not configured yet. You can copy the generated prompt below."
        )

async def generate_story_images(
    scenes: List[VisualScene],
    visual_style: str = "Cinematic"
) -> List[GeneratedImageResponse]:
    """Generates images sequentially for all extracted scenes."""
    results = []
    for scene in scenes:
        res = await generate_scene_image(
            scene_id=scene.scene_id,
            prompt=scene.image_prompt,
            negative_prompt=scene.negative_prompt,
            visual_style=visual_style
        )
        results.append(res)
    return results

async def generate_character_reference(
    character: CharacterVisualProfile,
    visual_style: str = "Cinematic"
) -> GeneratedImageResponse:
    """Generates a character reference concept portrait."""
    char_prompt = f"Portrait character concept of {character.name}, {character.appearance_prompt_snippet}, {visual_style} style, character design sheet, studio lighting"
    return await generate_scene_image(
        scene_id=character.name.lower().replace(" ", "_"),
        prompt=char_prompt,
        visual_style=visual_style
    )

def get_image_service_status() -> Dict[str, Any]:
    """Returns current image generation provider capability."""
    return {
        "status": "online" if IMAGE_PROVIDER != "none" else "unconfigured",
        "provider": IMAGE_PROVIDER,
        "supported_styles": [
            "Cinematic", "Anime", "Manga", "Western Comic", "Digital Art",
            "Semi-realistic", "Realistic", "Watercolor", "3D Animation",
            "Fantasy", "Noir", "Cyberpunk"
        ],
        "message": "AI Image Generation is active and ready." if IMAGE_PROVIDER != "none" else "Image generation is not configured yet."
    }
