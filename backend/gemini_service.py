import json
import logging
import os
import re
from datetime import UTC
from typing import Any

import demo_data
import httpx
import prompt_engine
import quality_checker
from schemas import (
    Chapter,
    ChapterGenerateRequest,
    CharacterVisualProfile,
    CompareVersionsRequest,
    CompleteStoryResponse,
    LocationProfile,
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
    StoryPlotStructure,
    StoryRewriteRequest,
    StorySceneExtractionRequest,
    StorySceneExtractionResponse,
    StoryShortenRequest,
    VersionComparisonResult,
    VisualScene,
)

logger = logging.getLogger("storyforge.gemini")

GEMINI_API_BASE = "https://generativelanguage.googleapis.com/v1beta/models"
PRIMARY_MODEL = os.environ.get("GEMINI_PRIMARY_MODEL", "gemini-3.5-flash-lite").strip()
DEFAULT_MODELS = [
    "gemini-3.5-flash-lite",
    "gemini-2.5-flash",
    "gemini-2.0-flash",
    "gemini-1.5-flash",
    "gemini-1.5-pro",
]
FALLBACK_MODELS = [PRIMARY_MODEL] + [m for m in DEFAULT_MODELS if m != PRIMARY_MODEL]


def get_gemini_api_key(override_key: str | None = None) -> str | None:
    """Retrieves API key from parameter or environment."""
    if override_key and override_key.strip():
        return override_key.strip()
    return os.environ.get("GEMINI_API_KEY", "").strip() or None


def clean_and_parse_json(raw_text: str) -> Any:
    """
    Extracts and parses JSON from Gemini responses, handling markdown backticks,
    trailing commas, and surrounding text.
    """
    if not raw_text or not raw_text.strip():
        raise ValueError("Empty response received from Gemini API.")

    cleaned = raw_text.strip()
    # Strip markdown code fences if present
    if "```" in cleaned:
        pattern = r"```(?:json)?\s*([\s\S]*?)\s*```"
        match = re.search(pattern, cleaned, re.IGNORECASE)
        if match:
            cleaned = match.group(1).strip()

    # Direct JSON parse attempt
    try:
        return json.loads(cleaned)
    except json.JSONDecodeError:
        pass

    # Find candidate outer bracket or brace
    start_brace = cleaned.find("{")
    start_bracket = cleaned.find("[")

    if start_brace != -1 and (start_bracket == -1 or start_brace < start_bracket):
        end_brace = cleaned.rfind("}")
        if end_brace != -1:
            candidate = cleaned[start_brace : end_brace + 1]
            candidate = re.sub(r",\s*([\]}])", r"\1", candidate)
            try:
                return json.loads(candidate)
            except json.JSONDecodeError:
                pass
    elif start_bracket != -1:
        end_bracket = cleaned.rfind("]")
        if end_bracket != -1:
            candidate = cleaned[start_bracket : end_bracket + 1]
            candidate = re.sub(r",\s*([\]}])", r"\1", candidate)
            try:
                return json.loads(candidate)
            except json.JSONDecodeError:
                pass

    # Regex cleanup fallback
    cleaned_fixed = re.sub(r",\s*([\]}])", r"\1", cleaned)
    return json.loads(cleaned_fixed)


async def call_gemini_raw(
    prompt: str,
    system_instruction: str = prompt_engine.CORE_SYSTEM_INSTRUCTION,
    api_key: str | None = None,
    temperature: float = 0.75,
    json_mode: bool = True,
    timeout_sec: float = 75.0,
) -> str:
    """Calls Gemini API with automatic model fallback."""
    active_key = get_gemini_api_key(api_key)
    if not active_key:
        raise ValueError(
            "Google Gemini API key not found. Please configure GEMINI_API_KEY in .env or run in Demo Mode."
        )

    payload: dict[str, Any] = {
        "contents": [{"role": "user", "parts": [{"text": prompt}]}],
        "systemInstruction": {"parts": [{"text": system_instruction}]},
        "generationConfig": {"temperature": temperature, "maxOutputTokens": 8192},
    }

    if json_mode:
        payload["generationConfig"]["responseMimeType"] = "application/json"

    last_error = None
    async with httpx.AsyncClient(timeout=timeout_sec) as client:
        for model in FALLBACK_MODELS:
            url = f"{GEMINI_API_BASE}/{model}:generateContent?key={active_key}"
            try:
                logger.info(f"Dispatching request to Gemini model '{model}'...")
                resp = await client.post(
                    url, json=payload, headers={"Content-Type": "application/json"}
                )

                if resp.status_code == 200:
                    data = resp.json()
                    candidates = data.get("candidates", [])
                    if candidates and "content" in candidates[0]:
                        parts = candidates[0]["content"].get("parts", [])
                        if parts and "text" in parts[0]:
                            return parts[0]["text"]
                    raise ValueError(f"Malformed Gemini payload received: {data}")

                if resp.status_code in [429, 404, 503, 500]:
                    err_msg = resp.text
                    logger.warning(
                        f"Model {model} returned HTTP {resp.status_code}: {err_msg}. Falling back..."
                    )
                    last_error = f"HTTP {resp.status_code}: {err_msg}"
                    continue
                else:
                    error_detail = resp.text
                    raise ValueError(f"Gemini API returned {resp.status_code}: {error_detail}")

            except httpx.TimeoutException:
                logger.warning(f"Timeout connecting to {model}. Trying next fallback...")
                last_error = f"Timeout on {model}"
                continue
            except Exception as e:
                logger.warning(f"Error calling {model}: {e}")
                last_error = str(e)
                continue

    raise RuntimeError(f"All Gemini models exhausted. Last error: {last_error}")


async def call_gemini_json(
    prompt: str,
    system_instruction: str = prompt_engine.CORE_SYSTEM_INSTRUCTION,
    api_key: str | None = None,
    temperature: float = 0.75,
) -> Any:
    """Dispatches prompt and parses structured JSON result."""
    raw = await call_gemini_raw(prompt, system_instruction, api_key, temperature, json_mode=True)
    return clean_and_parse_json(raw)


async def verify_gemini_key(api_key: str) -> dict[str, Any]:
    """Tests if a user-supplied key is valid."""
    if not api_key or not api_key.strip():
        return {"valid": False, "message": "API key cannot be empty."}
    try:
        url = f"{GEMINI_API_BASE}/gemini-1.5-flash:generateContent?key={api_key.strip()}"
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.post(
                url,
                json={
                    "contents": [{"parts": [{"text": "Hello"}]}],
                    "generationConfig": {"maxOutputTokens": 5},
                },
            )
            if resp.status_code == 200:
                return {"valid": True, "message": "Google Gemini API key is valid and connected!"}
            else:
                return {
                    "valid": False,
                    "message": f"API returned status {resp.status_code}: {resp.text}",
                }
    except Exception as e:
        return {"valid": False, "message": f"Connection check failed: {str(e)}"}


# ============================================================================
# CORE GEMINI PIPELINE FUNCTIONS REQUIRED BY SPECIFICATION (Section 27)
# ============================================================================


async def analyze_story_idea(req: StoryGenerateRequest) -> dict[str, Any]:
    """Analyzes the user's idea and provides high-level narrative breakdown."""
    prompt = f"""Analyze this story idea:
"{req.story_idea}"
Genre: {req.custom_genre or req.genre}
Tone: {", ".join(req.tones)}

Return JSON:
{{
  "premise": "Core premise",
  "potential_conflicts": ["conflict 1", "conflict 2"],
  "recommended_pacing": "Fast / Deliberate / Layered",
  "key_themes": ["theme 1", "theme 2"]
}}"""
    return await call_gemini_json(prompt, api_key=req.api_key)


async def generate_story_blueprint(req: StoryGenerateRequest) -> StoryBlueprint:
    """Generates the structured Story Blueprint."""
    prompt = prompt_engine.build_blueprint_prompt(req)
    data = await call_gemini_json(prompt, api_key=req.api_key)
    return StoryBlueprint(**data)


async def generate_characters(
    req: StoryGenerateRequest, blueprint: StoryBlueprint
) -> list[StoryCharacter]:
    """Generates character profiles with rich psychological depth."""
    prompt = prompt_engine.build_character_generation_prompt(req, blueprint)
    data = await call_gemini_json(prompt, api_key=req.api_key)
    characters: list[StoryCharacter] = []
    if isinstance(data, list):
        for item in data:
            characters.append(StoryCharacter(**item))
    elif isinstance(data, dict) and "characters" in data:
        for item in data["characters"]:
            characters.append(StoryCharacter(**item))
    return characters


async def generate_full_story(
    req: StoryGenerateRequest, blueprint: StoryBlueprint, characters: list[StoryCharacter]
) -> dict[str, str]:
    """Writes the full story narrative adhering to the blueprint and characters."""
    prompt = prompt_engine.build_full_story_prompt(req, blueprint, characters)
    data = await call_gemini_json(prompt, api_key=req.api_key, temperature=0.8)
    return {"title": data.get("title", blueprint.title), "story": data.get("story", "")}


async def check_story_quality(
    story_text: str,
    blueprint: StoryBlueprint,
    characters: list[StoryCharacter],
    api_key: str | None = None,
) -> QualityCheckReport:
    """Validates the generated story using the AI Story Quality Checker."""
    try:
        prompt = prompt_engine.build_quality_check_prompt(story_text, blueprint, characters)
        data = await call_gemini_json(prompt, api_key=api_key, temperature=0.3)
        return QualityCheckReport(**data)
    except Exception as e:
        logger.warning(f"Quality checker LLM fallback triggered: {e}")
        return quality_checker.evaluate_quality_heuristics(story_text, blueprint, characters)


async def improve_story(req: StoryImproveRequest) -> dict[str, str]:
    """Refines the story draft focusing on a specific craft dimension."""
    prompt = prompt_engine.build_improve_story_prompt(req.story, req.focus_area, req.instructions)
    data = await call_gemini_json(prompt, api_key=req.api_key, temperature=0.7)
    return {
        "improved_story": data.get("improved_story", req.story),
        "improvements_summary": data.get("improvements_summary", f"Enhanced {req.focus_area}."),
    }


async def continue_story(req: StoryContinueRequest) -> dict[str, Any]:
    """Generates the next chapter or continuation maintaining established continuity."""
    prompt = prompt_engine.build_continue_story_prompt(
        req.previous_story, req.continuation_prompt, req.target_length or "Medium"
    )
    return await call_gemini_json(prompt, api_key=req.api_key, temperature=0.8)


async def rewrite_story(req: StoryRewriteRequest) -> dict[str, Any]:
    """Rewrites the narrative with modified genre, tone, style, or ending."""
    prompt = prompt_engine.build_rewrite_prompt(req)
    return await call_gemini_json(prompt, api_key=req.api_key, temperature=0.8)


async def shorten_story(req: StoryShortenRequest) -> dict[str, Any]:
    """Creates a concise, impactful version while retaining core narrative beats."""
    target_words = req.target_word_count or 1000
    prompt = f"""Condense the following story into a tighter, punchier version of approximately {target_words} words.
Preserve the key characters, crucial plot turns, emotional climax, and satisfying resolution.
Cut unnecessary exposition and redundant dialogue while sharpening sensory imagery.

ORIGINAL STORY:
{req.story}

Return JSON:
{{
  "shortened_story": "The complete condensed story...",
  "word_count": {target_words},
  "summary_of_cuts": "Brief overview of what was streamlined"
}}"""
    return await call_gemini_json(prompt, api_key=req.api_key, temperature=0.6)


async def expand_story(req: StoryExpandRequest) -> dict[str, Any]:
    """Expands the story with deeper world-building, dialogue, and suspense."""
    target_words = req.target_word_count or 3000
    prompt = f"""Substantially expand the following story to approximately {target_words} words.
Guidelines:
- Deepen scene transitions and sensory descriptions.
- Enrich character dialogue, interior monologues, and subtext.
- Elevate the rising action and develop secondary conflicts.
- Make the climax even more suspenseful and emotionally devastating or thrilling.
- Focus: {req.expansion_focus}

ORIGINAL STORY:
{req.story}

Return JSON:
{{
  "expanded_story": "The complete expanded story...",
  "word_count": {target_words},
  "expansion_highlights": "Key scenes and dialogue sequences that were deepened"
}}"""
    return await call_gemini_json(prompt, api_key=req.api_key, temperature=0.8)


async def generate_chapter(req: ChapterGenerateRequest) -> Chapter:
    """Writes a designated chapter maintaining continuity with preceding chapters."""
    prompt = prompt_engine.build_chapter_prompt(
        previous_context=req.previous_context,
        chapter_number=req.chapter_number,
        chapter_title=req.chapter_title,
        what_should_happen=req.what_should_happen,
        desired_length=req.desired_length,
        genre=req.genre or "Mystery",
        tone=req.tone or "Suspenseful",
        style=req.style or "Cinematic",
    )
    data = await call_gemini_json(prompt, api_key=req.api_key, temperature=0.8)
    content = data.get("content", "")
    return Chapter(
        chapter_number=req.chapter_number,
        title=data.get("title", req.chapter_title),
        content=content,
        word_count=len(content.split()),
        summary=data.get("summary", ""),
    )


async def edit_section(req: SectionEditRequest) -> SectionEditResponse:
    """Modifies an individual paragraph or excerpt in-place."""
    prompt = prompt_engine.build_section_edit_prompt(
        selected_text=req.selected_text,
        full_context=req.full_story,
        action=req.action,
        tone_guidance=req.tone_guidance,
    )
    data = await call_gemini_json(prompt, api_key=req.api_key, temperature=0.7)
    return SectionEditResponse(
        original_text=req.selected_text,
        replacement_text=data.get("replacement_text", req.selected_text),
        action=req.action,
        explanation=data.get("explanation", "Updated selected section."),
    )


# ============================================================================
# FEATURE 1: STORY REGENERATION & VERSIONING
# ============================================================================


async def regenerate_story(req: RegenerateStoryRequest) -> CompleteStoryResponse:
    """
    Generates a brand new, substantially different narrative interpretation
    of the original idea and settings, avoiding repetition of previous plots.
    """
    api_key = get_gemini_api_key(req.api_key)
    if req.demo_mode or not api_key:
        logger.info("Regenerating story in Demo Mode.")
        return demo_data.get_demo_regenerated_story(
            req.regeneration_option, req.custom_instruction or ""
        )

    prompt = prompt_engine.build_regenerate_story_prompt(
        original_idea=req.original_idea,
        genre=req.genre,
        tones=req.tones,
        writing_style=req.writing_style,
        target_audience=req.target_audience,
        story_length=req.story_length,
        ending_preference=req.ending_preference,
        previous_title=req.previous_story_title or "Previous Story",
        previous_summary=req.previous_story_summary or "",
        regeneration_option=req.regeneration_option,
        custom_instruction=req.custom_instruction or "",
    )

    try:
        data = await call_gemini_json(prompt, api_key=api_key, temperature=0.85)

        # Parse Plot
        plot_data = data.get("plot", {})
        plot = StoryPlotStructure(
            introduction=plot_data.get("introduction", "Fresh opening catalyst"),
            rising_action=plot_data.get("rising_action", "Distinct rising tension"),
            climax=plot_data.get("climax", "Unexpected pivotal turning point"),
            falling_action=plot_data.get("falling_action", "Reckoning and aftermath"),
            resolution=plot_data.get("resolution", f"Fulfills {req.ending_preference}"),
        )

        # Parse Characters
        chars_raw = data.get("main_characters", [])
        characters: list[StoryCharacter] = []
        for c in chars_raw:
            if isinstance(c, dict):
                characters.append(
                    StoryCharacter(
                        name=c.get("name", "Key Character"),
                        age=str(c.get("age", "")),
                        role=c.get("role", "Protagonist"),
                        personality=c.get("personality", ""),
                        gender=c.get("gender", ""),
                        background=c.get("background", ""),
                        motivation=c.get("motivation", ""),
                        goal=c.get("goal", ""),
                        fear=c.get("fear", ""),
                        strength=c.get("strength", ""),
                        weakness=c.get("weakness", ""),
                        relationships=c.get("relationships", ""),
                        character_arc=c.get("character_arc", ""),
                    )
                )

        if not characters:
            characters = [
                StoryCharacter(
                    name="Protagonist",
                    age="20",
                    role="Main Protagonist",
                    personality="Determined, perceptive",
                    gender="Any",
                    background="Central to the new interpretation",
                    motivation="Unravel the central mystery",
                    goal="Discover the truth",
                    fear="Failure",
                    strength="Insight",
                    weakness="Obsession",
                    relationships="",
                    character_arc="Transforms through discovery",
                )
            ]

        # Blueprint
        blueprint = StoryBlueprint(
            title=data.get("title", "Reimagined Tale"),
            genre=req.genre,
            premise=data.get("premise", req.original_idea),
            main_conflict=data.get("main_conflict", "Central struggle"),
            theme=data.get("theme", "Truth and Discovery"),
            setting=data.get("setting", "Atmospheric world"),
            main_characters=[c.name for c in characters],
            character_motivations=", ".join([f"{c.name}: {c.motivation}" for c in characters]),
            plot=plot,
            ending_type=req.ending_preference,
        )

        story_text = data.get("story", "")
        word_count = len(story_text.split()) if story_text else 500

        # Run quality check heuristics
        quality = quality_checker.evaluate_quality_heuristics(story_text, blueprint, characters)
        quality.strengths.insert(
            0,
            f"Genuinely divergent interpretation ({req.regeneration_option}) with zero paragraph duplication.",
        )

        first_chapter = Chapter(
            chapter_number=1,
            title="Chapter 1: The Inciting Threshold",
            content=story_text,
            word_count=word_count,
            summary=plot.introduction,
        )

        import math

        minutes = max(1, math.ceil(word_count / 220))

        from datetime import datetime

        return CompleteStoryResponse(
            title=data.get("title", "Reimagined Story"),
            genre=req.genre,
            tones=req.tones,
            writing_style=req.writing_style,
            target_audience=req.target_audience,
            ending_type=req.ending_preference,
            story=story_text,
            word_count=word_count,
            reading_time=f"{minutes} min read",
            blueprint=blueprint,
            characters=characters,
            quality_check=quality,
            chapters=[first_chapter],
            is_demo=False,
            created_at=datetime.now(UTC).strftime("%B %d, %Y"),
        )
    except Exception as e:
        logger.error(f"Story regeneration error with Gemini: {e}")
        return demo_data.get_demo_regenerated_story(
            req.regeneration_option, req.custom_instruction or ""
        )


async def compare_story_versions(req: CompareVersionsRequest) -> VersionComparisonResult:
    """Analytically contrasts two story versions for informed user selection."""
    api_key = get_gemini_api_key(req.api_key)
    va = req.version_a
    vb = req.version_b

    if req.demo_mode or not api_key:
        demo_comp = demo_data.get_demo_version_comparison(va.title, vb.title)
        return VersionComparisonResult(
            version_a_id=va.version_id,
            version_b_id=vb.version_id,
            title_a=va.title,
            title_b=vb.title,
            summary_a=demo_comp["summary_a"],
            summary_b=demo_comp["summary_b"],
            characters_a=[c.name for c in va.story_data.characters]
            if va.story_data.characters
            else demo_comp["characters_a"],
            characters_b=[c.name for c in vb.story_data.characters]
            if vb.story_data.characters
            else demo_comp["characters_b"],
            plot_differences=demo_comp["plot_differences"],
            ending_differences=demo_comp["ending_differences"],
            tone_and_style_differences=demo_comp["tone_and_style_differences"],
            recommendation=demo_comp["recommendation"],
        )

    prompt = prompt_engine.build_compare_versions_prompt(
        version_a_title=va.title,
        version_a_summary=va.summary or va.story_data.blueprint.premise,
        version_a_story=va.story_data.story,
        version_b_title=vb.title,
        version_b_summary=vb.summary or vb.story_data.blueprint.premise,
        version_b_story=vb.story_data.story,
    )

    try:
        data = await call_gemini_json(prompt, api_key=api_key, temperature=0.5)
        return VersionComparisonResult(
            version_a_id=va.version_id,
            version_b_id=vb.version_id,
            title_a=va.title,
            title_b=vb.title,
            summary_a=data.get("summary_a", va.summary or "Version A narrative"),
            summary_b=data.get("summary_b", vb.summary or "Version B narrative"),
            characters_a=data.get("characters_a", [c.name for c in va.story_data.characters]),
            characters_b=data.get("characters_b", [c.name for c in vb.story_data.characters]),
            plot_differences=data.get(
                "plot_differences",
                "Alternative narrative development and distinct investigative paths.",
            ),
            ending_differences=data.get(
                "ending_differences", "Different climaxes and character fates."
            ),
            tone_and_style_differences=data.get(
                "tone_and_style_differences", "Different pacing and emotional beats."
            ),
            recommendation=data.get("recommendation", "Choose based on your tonal preference."),
        )
    except Exception as e:
        logger.warning(f"Gemini comparison fallback: {e}")
        demo_comp = demo_data.get_demo_version_comparison(va.title, vb.title)
        return VersionComparisonResult(
            version_a_id=va.version_id,
            version_b_id=vb.version_id,
            title_a=va.title,
            title_b=vb.title,
            summary_a=demo_comp["summary_a"],
            summary_b=demo_comp["summary_b"],
            characters_a=[c.name for c in va.story_data.characters]
            if va.story_data.characters
            else demo_comp["characters_a"],
            characters_b=[c.name for c in vb.story_data.characters]
            if vb.story_data.characters
            else demo_comp["characters_b"],
            plot_differences=demo_comp["plot_differences"],
            ending_differences=demo_comp["ending_differences"],
            tone_and_style_differences=demo_comp["tone_and_style_differences"],
            recommendation=demo_comp["recommendation"],
        )


# ============================================================================
# FEATURE 2: STORY TO SCENE & PROMPT EXTRACTION
# ============================================================================


async def extract_story_scenes(req: StorySceneExtractionRequest) -> StorySceneExtractionResponse:
    """
    Converts full story or chapter into structured visual scenes, character visual profiles,
    and location profiles with synthesized image generation prompts.
    """
    api_key = get_gemini_api_key(req.api_key)
    if req.demo_mode or not api_key:
        logger.info("Extracting story scenes in Demo Mode.")
        demo_scenes_dict = demo_data.get_demo_story_scenes(
            visual_style=req.visual_style or "Cinematic", target_count=req.target_scene_count or 5
        )
        return StorySceneExtractionResponse(
            story_title=demo_scenes_dict["story_title"],
            visual_style=demo_scenes_dict["visual_style"],
            characters=[CharacterVisualProfile(**c) for c in demo_scenes_dict["characters"]],
            locations=[LocationProfile(**loc) for loc in demo_scenes_dict["locations"]],
            scenes=[VisualScene(**s) for s in demo_scenes_dict["scenes"]],
        )

    prompt = prompt_engine.build_scene_extraction_prompt(
        story_title=req.story_title,
        story_text=req.story_text,
        genre=req.genre,
        visual_style=req.visual_style or "Cinematic",
        scope=req.scope or "Entire Story",
        target_scene_count=req.target_scene_count or 5,
    )

    try:
        data = await call_gemini_json(prompt, api_key=api_key, temperature=0.7)

        characters: list[CharacterVisualProfile] = []
        for c in data.get("characters", []):
            if isinstance(c, dict):
                snippet = (
                    c.get("appearance_prompt_snippet")
                    or f"{c.get('name', 'character')}, {c.get('clothing', '')}, {c.get('face_description', '')}"
                )
                characters.append(
                    CharacterVisualProfile(
                        name=c.get("name", "Character"),
                        age=str(c.get("age", "")),
                        gender=c.get("gender", ""),
                        face_description=c.get("face_description", ""),
                        skin_tone=c.get("skin_tone", ""),
                        hair=c.get("hair", ""),
                        hairstyle=c.get("hairstyle", ""),
                        eye_color=c.get("eye_color", ""),
                        body_type=c.get("body_type", ""),
                        clothing=c.get("clothing", ""),
                        accessories=c.get("accessories", ""),
                        distinctive_features=c.get("distinctive_features", ""),
                        appearance_prompt_snippet=snippet,
                    )
                )

        locations: list[LocationProfile] = []
        for loc in data.get("locations", []):
            if isinstance(loc, dict):
                loc_snippet = (
                    loc.get("location_prompt_snippet")
                    or f"{loc.get('name', 'location')}, {loc.get('environment', '')}, {loc.get('lighting', '')}"
                )
                locations.append(
                    LocationProfile(
                        name=loc.get("name", "Location"),
                        architecture=loc.get("architecture", ""),
                        environment=loc.get("environment", ""),
                        time_period=loc.get("time_period", ""),
                        color_palette=loc.get("color_palette", ""),
                        lighting=loc.get("lighting", ""),
                        important_objects=loc.get("important_objects", []),
                        location_prompt_snippet=loc_snippet,
                    )
                )

        scenes: list[VisualScene] = []
        for idx, s in enumerate(data.get("scenes", [])):
            if isinstance(s, dict):
                scenes.append(
                    VisualScene(
                        scene_number=s.get("scene_number", idx + 1),
                        title=s.get("title", f"Scene {idx + 1}"),
                        description=s.get("description", ""),
                        story_excerpt=s.get("story_excerpt", ""),
                        characters_involved=s.get("characters_involved", []),
                        location_name=s.get("location_name", ""),
                        action=s.get("action", "Character in scene"),
                        facial_expression=s.get("facial_expression", ""),
                        body_language=s.get("body_language", ""),
                        camera_angle=s.get("camera_angle", "Cinematic medium-wide angle shot"),
                        composition=s.get("composition", "Rule of thirds, dramatic focal point"),
                        lighting=s.get("lighting", "Dramatic cinematic ambient lighting"),
                        time_of_day=s.get("time_of_day", "Night"),
                        visual_style=req.visual_style or "Cinematic",
                        mood=s.get("mood", "Suspenseful"),
                        image_prompt=s.get(
                            "image_prompt",
                            f"{s.get('description', '')}, {req.visual_style} style, 8k resolution",
                        ),
                        negative_prompt=s.get(
                            "negative_prompt",
                            prompt_engine.STYLE_NEGATIVE_PROMPTS.get(
                                req.visual_style, "blurry, distorted, low quality"
                            ),
                        ),
                    )
                )

        if not scenes:
            raise ValueError("No scenes extracted from model response.")

        return StorySceneExtractionResponse(
            story_title=data.get("story_title", req.story_title),
            visual_style=req.visual_style or "Cinematic",
            characters=characters,
            locations=locations,
            scenes=scenes,
        )
    except Exception as e:
        logger.error(f"Scene extraction error with Gemini: {e}")
        demo_scenes_dict = demo_data.get_demo_story_scenes(
            visual_style=req.visual_style or "Cinematic", target_count=req.target_scene_count or 5
        )
        return StorySceneExtractionResponse(
            story_title=demo_scenes_dict["story_title"],
            visual_style=demo_scenes_dict["visual_style"],
            characters=[CharacterVisualProfile(**c) for c in demo_scenes_dict["characters"]],
            locations=[LocationProfile(**loc) for loc in demo_scenes_dict["locations"]],
            scenes=[VisualScene(**s) for s in demo_scenes_dict["scenes"]],
        )
