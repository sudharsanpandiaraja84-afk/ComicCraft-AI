import uuid

from pydantic import BaseModel, Field

# ============================================================================
# USER INPUT & CREATION SCHEMAS
# ============================================================================


class UserInputCharacter(BaseModel):
    name: str = Field(..., description="Character name")
    age: str | None = Field("", description="Character age")
    role: str | None = Field(
        "Protagonist", description="Role e.g., Protagonist, Mentor, Antagonist"
    )
    personality: str | None = Field("", description="Personality traits")
    gender: str | None = Field("", description="Gender")
    details: str | None = Field("", description="Additional details, quirks or background")


class AdvancedStoryOptions(BaseModel):
    num_characters: str | None = Field("2-3", description="Expected number of main characters")
    setting: str | None = Field("", description="Primary setting or environment")
    time_period: str | None = Field("", description="Time period e.g. Victorian, Modern, 2140")
    location: str | None = Field("", description="Specific location e.g. Boston, New England")
    complexity: str | None = Field("Moderate", description="Simple, Moderate, or Complex")
    dialogue_amount: str | None = Field(
        "Balanced", description="Minimal, Balanced, or Dialogue-Heavy"
    )
    description_level: str | None = Field(
        "Rich & Vivid", description="Concise, Balanced, or Rich & Vivid"
    )
    plot_twist: str | None = Field("", description="Specific plot twist requirement")
    moral: str | None = Field("", description="Moral, theme, or underlying message")


class StoryGenerateRequest(BaseModel):
    story_idea: str = Field(..., description="The user's core story idea")
    genre: str = Field("Mystery", description="Primary genre")
    custom_genre: str | None = Field("", description="Custom genre if selected")
    story_length: str = Field(
        "Medium",
        description="Short (800-1200), Medium (1500-2500), Long (3000-5000), Very Long (5000+)",
    )
    tones: list[str] = Field(
        default_factory=lambda: ["Suspenseful", "Mysterious"], description="Selected tones"
    )
    writing_style: str = Field("Cinematic", description="Writing style")
    custom_style: str | None = Field("", description="Custom writing style instructions")
    target_audience: str = Field(
        "Young Adults", description="Children, Teenagers, Young Adults, Adults, General Audience"
    )
    ending_preference: str = Field(
        "Twist Ending", description="Happy, Sad, Tragic, Open, Twist, Unexpected, AI Decides"
    )
    characters: list[UserInputCharacter] | None = Field(
        default_factory=list, description="Optional user-provided characters"
    )
    advanced_options: AdvancedStoryOptions | None = Field(
        default_factory=AdvancedStoryOptions, description="Advanced options"
    )
    api_key: str | None = Field(None, description="Optional per-request Gemini API key")
    demo_mode: bool = Field(False, description="Run in demo mode with sample pre-computed story")


# ============================================================================
# BLUEPRINT & CHARACTER SCHEMAS
# ============================================================================


class StoryPlotStructure(BaseModel):
    introduction: str = Field(
        ..., description="Setting, characters, initial situation and conflict"
    )
    rising_action: str = Field(
        ..., description="Escalating stakes, obstacles, investigations, suspense"
    )
    climax: str = Field(
        ..., description="The turning point of highest emotional and narrative tension"
    )
    falling_action: str = Field(..., description="Fallout, revelations, consequences")
    resolution: str = Field(..., description="Meaningful conclusion aligned with ending preference")


class StoryBlueprint(BaseModel):
    title: str = Field(..., description="Story title")
    genre: str = Field(..., description="Primary genre")
    premise: str = Field(..., description="Core premise expansion")
    main_conflict: str = Field(..., description="Central conflict or mystery")
    theme: str = Field(..., description="Underlying theme or moral")
    setting: str = Field(..., description="Vivid atmospheric setting description")
    main_characters: list[str] = Field(
        default_factory=list, description="List of key character names"
    )
    character_motivations: str = Field(..., description="Core desires and stakes")
    plot: StoryPlotStructure = Field(..., description="5-act narrative framework")
    ending_type: str = Field(..., description="The ending classification")


class StoryCharacter(BaseModel):
    name: str = Field(..., description="Character full name")
    age: str = Field(..., description="Age or age bracket")
    role: str = Field(..., description="Protagonist, Antagonist, Ally, Mentor, etc.")
    personality: str = Field(..., description="Personality archetype and traits")
    gender: str | None = Field("", description="Gender")
    background: str = Field(..., description="Backstory and origin")
    motivation: str = Field(..., description="Deep personal drive")
    goal: str = Field(..., description="Immediate objective in the story")
    fear: str = Field(..., description="Primary fear or vulnerability")
    strength: str = Field(..., description="Core capability or talent")
    weakness: str = Field(..., description="Fatal flaw or limitation")
    relationships: str = Field(..., description="Dynamics with other characters")
    character_arc: str = Field(..., description="Internal journey and transformation")


# ============================================================================
# QUALITY CHECK SCHEMAS
# ============================================================================


class QualityCheckReport(BaseModel):
    plot_consistency: bool = Field(True, description="✓ Plot consistency check")
    character_consistency: bool = Field(True, description="✓ Character consistency check")
    genre_alignment: bool = Field(True, description="✓ Genre alignment check")
    story_structure: bool = Field(True, description="✓ Story structure check")
    plot_coherence_score: int = Field(95, description="Coherence score (0-100)")
    character_consistency_score: int = Field(94, description="Character score (0-100)")
    genre_fidelity_score: int = Field(96, description="Genre fidelity score (0-100)")
    pacing_score: int = Field(92, description="Pacing score (0-100)")
    dialogue_score: int = Field(90, description="Dialogue naturalness score (0-100)")
    originality_score: int = Field(94, description="Originality score (0-100)")
    strengths: list[str] = Field(default_factory=list, description="Narrative strengths")
    critique: str = Field("", description="Analytical critique")
    improvements_made: list[str] = Field(
        default_factory=list, description="Optimizations applied to the draft"
    )


# ============================================================================
# CHAPTER & COMPLETE STORY SCHEMAS
# ============================================================================


class Chapter(BaseModel):
    chapter_number: int = Field(..., description="Chapter sequence number")
    title: str = Field(..., description="Chapter title")
    content: str = Field(..., description="Chapter narrative text")
    word_count: int = Field(0, description="Word count for this chapter")
    summary: str | None = Field("", description="Brief chapter summary")


class CompleteStoryResponse(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str = Field(..., description="Story title")
    genre: str = Field(..., description="Story genre")
    tones: list[str] = Field(default_factory=list, description="Story tones")
    writing_style: str = Field(..., description="Writing style")
    target_audience: str = Field(..., description="Target audience")
    ending_type: str = Field(..., description="Ending type")
    story: str = Field(..., description="Full story narrative text")
    word_count: int = Field(0, description="Total word count")
    reading_time: str = Field("5 min read", description="Estimated reading time")
    blueprint: StoryBlueprint = Field(..., description="Story blueprint and structure")
    characters: list[StoryCharacter] = Field(default_factory=list, description="Character Bible")
    quality_check: QualityCheckReport = Field(
        default_factory=QualityCheckReport, description="AI Quality Check"
    )
    chapters: list[Chapter] = Field(default_factory=list, description="Story chapters")
    is_demo: bool = Field(False, description="Whether this is sample demo content")
    created_at: str = Field("", description="Creation timestamp")


# ============================================================================
# ACTION & REWRITE REQUEST SCHEMAS
# ============================================================================


class StoryImproveRequest(BaseModel):
    story_id: str | None = None
    story: str = Field(..., description="The current story text")
    focus_area: str = Field(
        "Pacing", description="Plot, Characters, Dialogue, Descriptions, Pacing, or All"
    )
    instructions: str | None = Field("", description="Optional user guidance for improvement")
    api_key: str | None = None
    demo_mode: bool = False


class StoryContinueRequest(BaseModel):
    story_id: str | None = None
    previous_story: str = Field(..., description="Existing story narrative")
    blueprint: StoryBlueprint | None = None
    characters: list[StoryCharacter] | None = Field(default_factory=list)
    continuation_prompt: str = Field(
        "Continue the story with a major plot twist.", description="Continuation guidance"
    )
    target_length: str | None = Field("Medium", description="Desired length of new continuation")
    api_key: str | None = None
    demo_mode: bool = False


class StoryRewriteRequest(BaseModel):
    story: str = Field(..., description="Existing story text")
    original_genre: str | None = "Mystery"
    new_genre: str | None = None
    new_tone: str | None = None
    new_style: str | None = None
    new_ending: str | None = None
    instructions: str | None = ""
    api_key: str | None = None
    demo_mode: bool = False


class StoryShortenRequest(BaseModel):
    story: str = Field(..., description="Existing story text")
    target_word_count: int | None = Field(1000, description="Target word count")
    api_key: str | None = None
    demo_mode: bool = False


class StoryExpandRequest(BaseModel):
    story: str = Field(..., description="Existing story text")
    expansion_focus: str | None = Field(
        "Expand scenes, deepen character interactions and add vivid atmosphere.",
        description="Guidance",
    )
    target_word_count: int | None = Field(3000, description="Target word count")
    api_key: str | None = None
    demo_mode: bool = False


class ChapterGenerateRequest(BaseModel):
    story_id: str | None = None
    story_title: str = Field("Untitled Story")
    previous_context: str = Field(..., description="Summary or text of previous chapters")
    chapter_number: int = Field(2, description="Chapter number")
    chapter_title: str = Field("The Hidden Chamber", description="Chapter title")
    what_should_happen: str = Field(..., description="Key plot events for this chapter")
    desired_length: str = Field("Medium", description="Short, Medium, or Long")
    characters: list[StoryCharacter] | None = Field(default_factory=list)
    genre: str | None = "Mystery"
    tone: str | None = "Suspenseful"
    style: str | None = "Cinematic"
    api_key: str | None = None
    demo_mode: bool = False


class SectionEditRequest(BaseModel):
    full_story: str = Field(..., description="Full story text")
    selected_text: str = Field(..., description="Specific text snippet to modify")
    surrounding_context: str | None = Field("", description="Preceding or surrounding text")
    action: str = Field(
        "improve_paragraph",
        description="regenerate, improve_paragraph, make_dialogue_better, make_description_more_detailed, change_tone",
    )
    tone_guidance: str | None = Field("", description="Specific instructions or tone preference")
    api_key: str | None = None
    demo_mode: bool = False


class SectionEditResponse(BaseModel):
    original_text: str
    replacement_text: str
    action: str
    explanation: str


class VerifyKeyRequest(BaseModel):
    api_key: str


# ============================================================================
# FEATURE 1: STORY REGENERATION & VERSIONING SCHEMAS
# ============================================================================


class RegenerateStoryRequest(BaseModel):
    story_id: str | None = None
    original_idea: str = Field(..., description="Original user story idea")
    genre: str = Field("Mystery", description="Selected genre")
    tones: list[str] = Field(default_factory=lambda: ["Suspenseful"], description="Selected tones")
    writing_style: str = Field("Cinematic", description="Writing style")
    target_audience: str = Field("Young Adults", description="Target audience")
    story_length: str = Field("Medium", description="Length target")
    ending_preference: str = Field("Twist Ending", description="Ending preference")
    characters: list[UserInputCharacter] | None = Field(default_factory=list)
    advanced_options: AdvancedStoryOptions | None = None
    previous_story_title: str | None = Field("", description="Previous version title")
    previous_story_summary: str | None = Field(
        "", description="Previous version synopsis / plot summary"
    )
    regeneration_option: str = Field(
        "Same idea, different story", description="Selected regeneration mode"
    )
    custom_instruction: str | None = Field("", description="User custom regeneration instruction")
    api_key: str | None = None
    demo_mode: bool = False


class StoryVersion(BaseModel):
    version_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    version_number: int = Field(1, description="Version index 1, 2, 3...")
    title: str = Field(..., description="Story title")
    summary: str = Field("", description="Concise synopsis of this version")
    regeneration_note: str | None = Field(
        "Initial generation", description="Mode or instructions used"
    )
    story_data: CompleteStoryResponse = Field(..., description="Full story payload")
    created_at: str = Field("", description="Timestamp")


class CompareVersionsRequest(BaseModel):
    version_a: StoryVersion
    version_b: StoryVersion
    api_key: str | None = None
    demo_mode: bool = False


class VersionComparisonResult(BaseModel):
    version_a_id: str
    version_b_id: str
    title_a: str
    title_b: str
    summary_a: str
    summary_b: str
    characters_a: list[str]
    characters_b: list[str]
    plot_differences: str
    ending_differences: str
    tone_and_style_differences: str
    recommendation: str


# ============================================================================
# FEATURE 2: STORY TO IMAGE SCHEMAS
# ============================================================================


class CharacterVisualProfile(BaseModel):
    name: str
    age: str | None = ""
    gender: str | None = ""
    face_description: str = Field("", description="Facial structure, expression tendencies")
    skin_tone: str = Field("", description="Skin tone")
    hair: str = Field("", description="Hair color, texture")
    hairstyle: str = Field("", description="Specific hair styling")
    eye_color: str = Field("", description="Eye color")
    body_type: str = Field("", description="Build, height, posture")
    clothing: str = Field("", description="Distinctive clothing items and colors")
    accessories: str = Field("", description="Backpack, jewelry, glasses, etc.")
    distinctive_features: str = Field("", description="Scars, birthmarks, tattoos, signet rings")
    appearance_prompt_snippet: str = Field(
        ..., description="Compact visual snippet to reuse consistently in image prompts"
    )


class LocationProfile(BaseModel):
    location_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str = Field(..., description="Location name")
    architecture: str = Field("", description="Architectural style, era")
    environment: str = Field("", description="Surroundings, indoor/outdoor details")
    time_period: str = Field("", description="Time period aesthetic")
    color_palette: str = Field("", description="Primary dominant color tones")
    lighting: str = Field("", description="Lighting sources and ambiance")
    important_objects: list[str] = Field(default_factory=list, description="Key focal objects")
    location_prompt_snippet: str = Field(
        ..., description="Compact location snippet to reuse in image prompts"
    )


class VisualScene(BaseModel):
    scene_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    scene_number: int = Field(..., description="1-indexed sequence")
    title: str = Field(..., description="Scene headline title")
    description: str = Field(..., description="Short scene narrative description")
    story_excerpt: str | None = Field("", description="Corresponding story paragraph or dialogue")
    characters_involved: list[str] = Field(default_factory=list)
    location_name: str = Field("", description="Primary location")
    action: str = Field(..., description="Primary dynamic action occurring")
    facial_expression: str = Field("", description="Character expressions")
    body_language: str = Field("", description="Poses and gestures")
    camera_angle: str = Field("Cinematic wide-angle shot", description="Camera angle and distance")
    composition: str = Field(
        "Rule of thirds, dramatic focal point", description="Visual composition"
    )
    lighting: str = Field("Dramatic ambient lighting", description="Lighting conditions")
    time_of_day: str = Field("Night", description="Time of day")
    visual_style: str = Field("Cinematic", description="Visual aesthetic style")
    mood: str = Field("Suspenseful", description="Atmospheric mood")
    image_prompt: str = Field(
        ..., description="Full synthesized prompt for the image generation model"
    )
    negative_prompt: str = Field(..., description="Negative prompt customized for style")
    image_url: str | None = Field(None, description="Generated image URL or data URI")
    is_generating: bool = Field(False, description="Whether currently being generated")
    generation_error: str | None = Field(None, description="Error message if generation failed")


class StorySceneExtractionRequest(BaseModel):
    story_id: str | None = None
    story_title: str
    story_text: str
    genre: str = "Mystery"
    scope: str = Field(
        "Entire Story",
        description="Entire Story, Selected Chapter, Selected Scene, Selected Paragraph",
    )
    target_scene_count: int = Field(5, description="3, 5, 8, 10 or custom")
    visual_style: str = Field(
        "Cinematic", description="Cinematic, Anime, Manga, Digital Art, Realistic, etc."
    )
    api_key: str | None = None
    demo_mode: bool = False


class StorySceneExtractionResponse(BaseModel):
    story_title: str
    visual_style: str
    characters: list[CharacterVisualProfile] = Field(default_factory=list)
    locations: list[LocationProfile] = Field(default_factory=list)
    scenes: list[VisualScene] = Field(default_factory=list)


class ImageGenerateRequest(BaseModel):
    scene_id: str
    image_prompt: str
    negative_prompt: str | None = None
    visual_style: str | None = "Cinematic"
    api_key: str | None = None
    demo_mode: bool = False


class ImageRegenerateRequest(BaseModel):
    scene_id: str
    image_prompt: str
    negative_prompt: str | None = None
    custom_guidance: str | None = ""
    visual_style: str | None = "Cinematic"
    api_key: str | None = None
    demo_mode: bool = False


class ImageRegenerateAllRequest(BaseModel):
    scenes: list[VisualScene]
    visual_style: str | None = "Cinematic"
    api_key: str | None = None
    demo_mode: bool = False


class GeneratedImageResponse(BaseModel):
    scene_id: str
    image_url: str | None = None
    prompt_used: str
    negative_prompt_used: str
    status: str = "success"  # "success", "unconfigured", "error"
    message: str | None = None
