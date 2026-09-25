import math
import logging
from typing import Optional
from datetime import datetime
from schemas import (
    StoryGenerateRequest, CompleteStoryResponse, Chapter
)
import gemini_service
import demo_data
import quality_checker

logger = logging.getLogger("storyforge.generator")

def calculate_reading_time(word_count: int) -> str:
    """Calculates approximate reading time based on standard 220 wpm."""
    minutes = max(1, math.ceil(word_count / 220))
    return f"{minutes} min read"

async def run_story_generation_pipeline(req: StoryGenerateRequest) -> CompleteStoryResponse:
    """
    Executes the multi-stage AI Story Generation Pipeline:
    USER INPUT -> INPUT ANALYSIS -> STORY BLUEPRINT -> CHARACTER DEVELOPMENT 
    -> FULL STORY GENERATION -> QUALITY CHECK -> FINAL STORY.
    """
    api_key = gemini_service.get_gemini_api_key(req.api_key)
    
    # Fallback to Demo Mode if requested or if no API key is provided
    if req.demo_mode or not api_key:
        logger.info("Operating in Demo Mode (either explicitly requested or no API key present).")
        demo = demo_data.get_demo_project()
        
        # If user provided a custom idea, adapt the demo structure slightly so it acknowledges their input
        if req.story_idea and "student discovers" not in req.story_idea.lower():
            demo.title = f"Chronicles of {req.genre}: The Untold Path"
            demo.genre = req.custom_genre or req.genre
            demo.tones = req.tones
            demo.writing_style = req.custom_style or req.writing_style
            demo.target_audience = req.target_audience
            demo.blueprint.title = demo.title
            demo.blueprint.genre = demo.genre
            demo.blueprint.premise = f"Expanded from idea: '{req.story_idea}' in {demo.genre} genre."
        return demo

    logger.info(f"Stage 1 & 2: Generating Story Blueprint for idea: '{req.story_idea[:50]}...'")
    blueprint = await gemini_service.generate_story_blueprint(req)

    logger.info("Stage 3: Developing Character Bible...")
    characters = await gemini_service.generate_characters(req, blueprint)

    logger.info("Stage 4: Writing Full Story Narrative...")
    story_result = await gemini_service.generate_full_story(req, blueprint, characters)
    story_text = story_result.get("story", "")
    story_title = story_result.get("title", blueprint.title)

    logger.info("Stage 5: Conducting AI Story Quality Check...")
    quality_report = await gemini_service.check_story_quality(
        story_text=story_text,
        blueprint=blueprint,
        characters=characters,
        api_key=api_key
    )

    word_count = len(story_text.split())
    reading_time = calculate_reading_time(word_count)

    first_chapter = Chapter(
        chapter_number=1,
        title="Chapter 1: The Inciting Threshold",
        content=story_text,
        word_count=word_count,
        summary=blueprint.plot.introduction
    )

    response = CompleteStoryResponse(
        title=story_title,
        genre=blueprint.genre,
        tones=req.tones,
        writing_style=req.custom_style or req.writing_style,
        target_audience=req.target_audience,
        ending_type=blueprint.ending_type,
        story=story_text,
        word_count=word_count,
        reading_time=reading_time,
        blueprint=blueprint,
        characters=characters,
        quality_check=quality_report,
        chapters=[first_chapter],
        is_demo=False,
        created_at=datetime.utcnow().strftime("%B %d, %Y")
    )

    return response
