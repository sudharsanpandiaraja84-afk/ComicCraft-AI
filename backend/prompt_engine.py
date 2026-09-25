import json
from typing import List, Optional
from schemas import (
    StoryGenerateRequest, StoryBlueprint, StoryCharacter,
    UserInputCharacter, AdvancedStoryOptions
)

# Core System Instruction per requirements
CORE_SYSTEM_INSTRUCTION = """You are an expert fiction writer and story architect.
Your mission is to craft exceptional, immersive, and emotionally resonant stories.
Guidelines you strictly adhere to:
1. Do not merely repeat or paraphrase the user's idea.
2. Expand the idea into an original, coherent narrative with rich depth.
3. Respect the selected genre and tone with deep stylistic fidelity.
4. Maintain unwavering character consistency throughout.
5. Create logical cause-and-effect relationships where decisions drive consequences.
6. Use natural, authentic dialogue with distinct character voices.
7. Create meaningful conflict that tests the characters' values.
8. Provide a satisfying ending based on the user's selected ending type.
9. Write in rich, descriptive prose with varied sentence pacing, scene transitions, and emotional beats. Never output a single unbroken block of text."""

GENRE_INTELLIGENCE_RULES = {
    "Mystery": "Incorporate layered clues, red herrings, distinct suspects, systematic or intuitive investigation, mounting suspense, intellectual deduction, and a stunning yet earned reveal.",
    "Horror": "Cultivate visceral atmosphere, lurking dread, psychological tension, sensory disturbance, uncanny dread, and an escalating tangible threat that isolates the protagonists.",
    "Thriller": "Enforce relentless momentum, ticking clock urgency, life-or-death stakes, immediate physical/psychological peril, betrayals, and unexpected tactical reversals.",
    "Science Fiction": "Integrate speculative technology, plausible futuristic or cosmic concepts, intricate world-building, societal implications, and scientific logic tied to the human condition.",
    "Fantasy": "Evoke wondrous world-building, coherent magical rules or mythical lore, ancient secrets, evocative geography, magical flora/fauna, and high personal or realm-wide stakes.",
    "Romance": "Focus on electric character chemistry, deep emotional vulnerability, conflicting desires or misunderstandings, mutual growth, and a deeply felt emotional payoff.",
    "Adventure": "Emphasize exotic and perilous terrain, arduous journeys, resourcefulness against treacherous odds, physical feats, discovery of forgotten relics or frontiers.",
    "Comedy": "Deploy witty dialogue, comedic timing, situational irony, subversion of expectations, eccentric but relatable personalities, and humorous misunderstandings.",
    "Drama": "Delve into raw human vulnerabilities, moral dilemmas, conflicting loyalties, familial or social pressure, profound internal transformation, and emotional honesty.",
    "Historical": "Ground the narrative in authentic period details, accurate social hierarchies, period-accurate idioms, sensory textures of the era, and genuine historical friction.",
    "Crime": "Examine criminal motives, forensic or street-level procedural details, ethical gray zones, law enforcement vs syndicate dynamics, and high-tension interrogation.",
    "Superhero": "Balance extraordinary abilities with heavy personal burdens, moral accountability, collateral consequences, dual identities, and distinct ideological clashes.",
    "Slice of Life": "Highlight delicate nuances of everyday existence, gentle poignancy, quiet domestic moments, observational beauty, and subtle character revelations.",
    "Psychological": "Explore fractured perceptions, unreliable narration, memory distortion, guilt, paranoia, interior monologues, and shifting mental landscapes.",
    "Action": "Deliver kinetic fight choreography, visceral sensory impacts, dynamic tactical maneuvers, spatial clarity during chaos, and adrenaline-fueled showdowns.",
    "Educational": "Seamlessly weave factual, historical, or scientific principles into an engaging storyline where knowledge becomes the key to solving the narrative problem."
}

LENGTH_GUIDANCE = {
    "Short": "Target approximately 800 to 1,200 words. Keep scenes focused, economical, and punchy.",
    "Medium": "Target approximately 1,500 to 2,500 words. Develop multiple scene transitions, nuanced dialogue, and layered rising action.",
    "Long": "Target approximately 3,000 to 5,000 words. Deliver expansive scenes, subplots, rich character interactions, and meticulous build-up.",
    "Very Long": "Target 5,000+ words (or maximum token capacity). Deliver an epic narrative canvas with rich world-building and multi-phase confrontations."
}

def build_blueprint_prompt(req: StoryGenerateRequest) -> str:
    """Prompt for generating the comprehensive Story Blueprint."""
    genre_guidance = GENRE_INTELLIGENCE_RULES.get(req.genre, f"Embrace the unique conventions and tone of {req.genre}.")
    if req.custom_genre:
        genre_guidance = f"Tailor the narrative to the custom genre: {req.custom_genre}."

    char_info = "AI will design all suitable original characters."
    if req.characters:
        char_lines = []
        for c in req.characters:
            char_lines.append(f"- Name: {c.name} | Role: {c.role} | Age: {c.age} | Personality: {c.personality} | Gender: {c.gender} | Details: {c.details}")
        char_info = "User-Provided Characters to feature:\n" + "\n".join(char_lines)

    adv = req.advanced_options or AdvancedStoryOptions()
    adv_context = f"""
Advanced Parameters:
- Number of characters: {adv.num_characters}
- Setting / Environment: {adv.setting or 'To be established organically'}
- Time Period: {adv.time_period or 'Contemporary'}
- Location: {adv.location or 'Organically suited to the premise'}
- Story Complexity: {adv.complexity}
- Dialogue Amount: {adv.dialogue_amount}
- Description Level: {adv.description_level}
- Plot Twist Preference: {adv.plot_twist or 'AI craft a surprising twist'}
- Central Moral / Message: {adv.moral or 'Organically emergent'}
"""

    prompt = f"""Analyze the user's short story idea and create a structured STORY BLUEPRINT in valid JSON.

USER IDEA:
"{req.story_idea}"

PARAMETERS:
- Primary Genre: {req.custom_genre or req.genre}
- Genre Intelligence: {genre_guidance}
- Tone(s): {", ".join(req.tones)}
- Writing Style: {req.custom_style or req.writing_style}
- Target Audience: {req.target_audience}
- Story Length Target: {req.story_length} ({LENGTH_GUIDANCE.get(req.story_length, '1500-2500 words')})
- Ending Type Required: {req.ending_preference}
- Characters:
{char_info}
{adv_context}

Return a valid JSON object matching this exact structure:
{{
  "title": "Creative and captivating title",
  "genre": "{req.custom_genre or req.genre}",
  "premise": "A 2-3 sentence intelligent expansion of the user's idea",
  "main_conflict": "The core external and internal conflict",
  "theme": "The deeper thematic resonance or moral question",
  "setting": "Atmospheric, vivid description of the primary world and mood",
  "main_characters": ["Character Name 1", "Character Name 2"],
  "character_motivations": "Clear explanation of character desires and opposing goals",
  "plot": {{
    "introduction": "How the setting, character, and initial catalyst are introduced",
    "rising_action": "The escalating sequence of obstacles, discoveries, and tension",
    "climax": "The pivotal confrontation or decision of maximum emotional intensity",
    "falling_action": "The immediate aftermath and reckoning",
    "resolution": "The final state of the world and characters satisfying the '{req.ending_preference}'"
  }},
  "ending_type": "{req.ending_preference}"
}}

Respond ONLY with valid JSON. No conversational fluff or markdown outside the code block."""
    return prompt

def build_character_generation_prompt(req: StoryGenerateRequest, blueprint: StoryBlueprint) -> str:
    """Prompt for generating the detailed Character Bible."""
    user_char_details = ""
    if req.characters:
        user_char_details = "Ensure you faithfully integrate the user's specified characters:\n" + "\n".join(
            [f"- {c.name} ({c.role}): {c.personality}, {c.details}" for c in req.characters]
        )

    prompt = f"""Generate a detailed Character Bible for the story '{blueprint.title}'.

STORY PREMISE:
{blueprint.premise}

GENRE & TONE:
{blueprint.genre} | {", ".join(req.tones)}

TARGET AUDIENCE:
{req.target_audience}

KEY CHARACTERS TO DEVELOP:
{", ".join(blueprint.main_characters)}
{user_char_details}

For each character, generate a psychologically nuanced profile. Ensure internal consistency, distinct voices, clear flaws, and compelling motivations.

Return a JSON array of character objects with this schema:
[
  {{
    "name": "Full Name",
    "age": "Age or Age Range",
    "role": "Main Protagonist / Antagonist / Ally / Mentor / Catalyst",
    "personality": "Dominant personality traits and quirks",
    "gender": "Gender",
    "background": "Formative backstory and origins",
    "motivation": "Core emotional or practical driver",
    "goal": "Immediate concrete objective in this story",
    "fear": "Deepest fear or emotional vulnerability",
    "strength": "Key virtue, talent, or skill",
    "weakness": "Critical flaw or blind spot",
    "relationships": "Dynamics with other characters in the story",
    "character_arc": "How the character evolves from beginning to ending"
  }}
]

Respond ONLY with a valid JSON array."""
    return prompt

def build_full_story_prompt(
    req: StoryGenerateRequest,
    blueprint: StoryBlueprint,
    characters: List[StoryCharacter]
) -> str:
    """Prompt for writing the complete narrative."""
    genre_rules = GENRE_INTELLIGENCE_RULES.get(req.genre, "")
    if req.custom_genre:
        genre_rules += f" Maintain complete immersion in {req.custom_genre}."

    char_summary = "\n".join([
        f"- **{c.name}** ({c.role}): {c.personality}. Goal: {c.goal}. Arc: {c.character_arc}"
        for c in characters
    ])

    style_instruction = req.custom_style if req.custom_style else f"Adopt a {req.writing_style} writing style."
    length_instruction = LENGTH_GUIDANCE.get(req.story_length, "Target approximately 1,500 to 2,500 words.")

    prompt = f"""You are ready to write the complete, full story for:
"{blueprint.title}"

PRIMARY GENRE: {blueprint.genre}
GENRE SPECIFIC CRAFT: {genre_rules}
TONES: {", ".join(req.tones)}
WRITING STYLE: {style_instruction}
TARGET AUDIENCE: {req.target_audience} (Adapt vocabulary, complexity, and thematic sensitivity accordingly)
TARGET LENGTH: {length_instruction}
ENDING TYPE: {blueprint.ending_type}

STORY BLUEPRINT:
- Premise: {blueprint.premise}
- Main Conflict: {blueprint.main_conflict}
- Theme: {blueprint.theme}
- Setting: {blueprint.setting}
- Plot Progression:
  * Introduction: {blueprint.plot.introduction}
  * Rising Action: {blueprint.plot.rising_action}
  * Climax: {blueprint.plot.climax}
  * Falling Action: {blueprint.plot.falling_action}
  * Resolution: {blueprint.plot.resolution}

CHARACTER ROSTER:
{char_summary}

WRITING EXECUTION RULES:
1. Write in natural paragraphs separated by double newlines.
2. Incorporate vibrant dialogue with character-specific voices, subtext, and body language.
3. Establish strong sensory descriptions (scents, temperatures, sounds, textures).
4. Never rush the climax; build authentic suspense and emotional stakes.
5. Fulfill the {blueprint.ending_type} with deep emotional satisfaction and lingering impact.
6. Do NOT write meta-commentary, chapter outlines, or disclaimers. Start directly with the narrative.

Output your response as JSON in this format:
{{
  "title": "{blueprint.title}",
  "story": "Complete narrative text with paragraphs and dialogue..."
}}
"""
    return prompt

def build_quality_check_prompt(
    story_text: str,
    blueprint: StoryBlueprint,
    characters: List[StoryCharacter]
) -> str:
    """Prompt to analyze story quality across plot, character, genre, and structure."""
    prompt = f"""Act as a senior literary editor and analyze the following story draft.

TITLE: {blueprint.title}
GENRE: {blueprint.genre}
ENDING TYPE: {blueprint.ending_type}

STORY TEXT (sample / full):
{story_text[:4000]}

Analyze the story across these dimensions:
1. Plot coherence and causal logic
2. Character consistency and motivation
3. Genre fidelity and atmospheric execution
4. Narrative structure and pacing
5. Dialogue quality and naturalness
6. Originality and avoidance of stale clichés
7. Ending satisfaction

Return a valid JSON object matching this schema:
{{
  "plot_consistency": true,
  "character_consistency": true,
  "genre_alignment": true,
  "story_structure": true,
  "plot_coherence_score": 95,
  "character_consistency_score": 94,
  "genre_fidelity_score": 96,
  "pacing_score": 92,
  "dialogue_score": 90,
  "originality_score": 93,
  "strengths": [
    "Specific craft strength 1",
    "Specific craft strength 2",
    "Specific craft strength 3"
  ],
  "critique": "A brief constructive editorial assessment of the narrative",
  "improvements_made": [
    "Polished dialogue naturalness in pivotal confrontation",
    "Deepened sensory descriptions in the opening scene"
  ]
}}

Respond ONLY with valid JSON."""
    return prompt

def build_improve_story_prompt(
    story_text: str,
    focus_area: str,
    instructions: Optional[str] = ""
) -> str:
    """Prompt for improving specific dimensions of the story."""
    prompt = f"""You are an award-winning fiction editor.
Improve the following story, focusing specifically on: **{focus_area}**.

USER INSTRUCTIONS:
{instructions or f"Elevate the overall quality, pacing, and impact with primary focus on {focus_area}."}

ORIGINAL STORY:
{story_text}

Rules:
- Preserve the core characters, setting, and plot sequence.
- If focusing on Dialogue: punch up subtext, voice distinction, and realism.
- If focusing on Descriptions: introduce evocative sensory textures and atmospheric depth.
- If focusing on Pacing: tighten lulls and amplify high-stakes moments.
- If focusing on Characters: heighten emotional stakes, vulnerabilities, and internal conflict.
- Return the full improved story in well-spaced paragraphs.

Return JSON:
{{
  "improved_story": "The complete refined story text...",
  "improvements_summary": "Summary of specific edits and enhancements made"
}}"""
    return prompt

def build_continue_story_prompt(
    previous_story: str,
    continuation_prompt: str,
    target_length: str = "Medium"
) -> str:
    """Prompt for continuing the story seamlessly."""
    prompt = f"""Continue the story seamlessly from where it left off.

PREVIOUS STORY CONTEXT:
{previous_story[-3500:]}

CONTINUATION INSTRUCTION:
"{continuation_prompt}"

TARGET LENGTH: {target_length}

Rules:
1. Maintain unbroken continuity of characters, setting, established facts, relationships, and writing style.
2. Pick up organically from the closing beats or immediate chronological aftermath.
3. Integrate the user's continuation prompt with compelling narrative momentum.
4. Use rich paragraphs and engaging dialogue.

Return JSON:
{{
  "continuation_title": "Continuation Chapter / Episode Title",
  "continuation_text": "The continuation narrative text...",
  "transition_summary": "Brief note on how the continuation links to previous events"
}}"""
    return prompt

def build_chapter_prompt(
    previous_context: str,
    chapter_number: int,
    chapter_title: str,
    what_should_happen: str,
    desired_length: str,
    genre: str,
    tone: str,
    style: str
) -> str:
    """Prompt for generating a specific chapter maintaining continuity."""
    prompt = f"""Write Chapter {chapter_number}: '{chapter_title}' for an ongoing {genre} novel.

PREVIOUS STORY SUMMARY / CONTEXT:
{previous_context[-3500:]}

CHAPTER GOAL & EVENTS:
"{what_should_happen}"

GENRE & TONE:
{genre} | Tone: {tone} | Style: {style}
LENGTH TARGET: {desired_length}

Requirements:
- Seamlessly transition from preceding events.
- Deliver a dedicated chapter arc with an engaging opening, progression of events, and a hook or resonant closing beat.
- Format with clear paragraphs and vivid dialogue.

Return JSON:
{{
  "chapter_number": {chapter_number},
  "title": "{chapter_title}",
  "content": "Full chapter narrative...",
  "summary": "Brief summary of key events that occurred in this chapter"
}}"""
    return prompt

def build_section_edit_prompt(
    selected_text: str,
    full_context: str,
    action: str,
    tone_guidance: Optional[str] = ""
) -> str:
    """Prompt for editing a specific sentence or paragraph in-place."""
    action_instructions = {
        "regenerate": "Provide an alternate, creative rewording of the selected section.",
        "improve_paragraph": "Elevate sentence flow, cadence, vocabulary, and emotional resonance.",
        "make_dialogue_better": "Make dialogue sharper, more authentic, characterful, and packed with subtext.",
        "make_description_more_detailed": "Add vivid sensory imagery, atmosphere, and environmental detail.",
        "change_tone": f"Adjust tone to match guidance: {tone_guidance or 'more dramatic and intense'}."
    }

    instruction = action_instructions.get(action, "Improve this excerpt.")

    prompt = f"""You are an inline story editor.
Modify ONLY the selected text excerpt according to the instruction, ensuring it blends seamlessly with the surrounding narrative.

SURROUNDING STORY CONTEXT:
{full_context[:1500]} ... [SELECTED TEXT HERE] ... {full_context[-1500:]}

SELECTED TEXT TO MODIFY:
"{selected_text}"

INSTRUCTION:
{instruction}
{f"Tone guidance: {tone_guidance}" if tone_guidance else ""}

Rules:
- Return ONLY the replacement text for the selected excerpt.
- Do NOT rewrite the rest of the story.
- Maintain character voice and tense consistency.

Return JSON:
{{
  "replacement_text": "Refined replacement text only...",
  "explanation": "Brief explanation of how the excerpt was improved"
}}"""
    return prompt

# ============================================================================
# FEATURE 1: STORY REGENERATION PROMPTS
# ============================================================================

def build_regenerate_story_prompt(
    original_idea: str,
    genre: str,
    tones: List[str],
    writing_style: str,
    target_audience: str,
    story_length: str,
    ending_preference: str,
    previous_title: str,
    previous_summary: str,
    regeneration_option: str,
    custom_instruction: str = ""
) -> str:
    """
    Constructs prompt for regenerating a substantially different story version.
    Explicitly instructs Gemini not to copy paragraphs, scenes, or plot progression.
    """
    genre_rules = GENRE_INTELLIGENCE_RULES.get(genre, f"Honor the conventions of {genre}.")
    length_instruction = LENGTH_GUIDANCE.get(story_length, "Target approximately 1,500 to 2,500 words.")

    prompt = f"""You are tasked with generating a BRAND NEW, SUBSTANTIALLY DIFFERENT narrative version of the following story premise.

CORE STORY PREMISE:
"{original_idea}"

GENRE: {genre}
GENRE INTELLIGENCE: {genre_rules}
TONES: {", ".join(tones)}
WRITING STYLE: {writing_style}
TARGET AUDIENCE: {target_audience}
LENGTH TARGET: {story_length} ({length_instruction})
ENDING TYPE: {ending_preference}

PREVIOUS VERSION TO AVOID DUPLICATING:
- Previous Title: "{previous_title}"
- Previous Story Summary: {previous_summary or 'A classic interpretation of the premise.'}

REGENERATION ANGLE:
Mode: {regeneration_option}
{f"Custom User Guidance: {custom_instruction}" if custom_instruction else ""}

CRITICAL REGENERATION DIRECTIVE:
Generate a substantially different story from the previous version. Do not copy paragraphs, scenes, dialogue, character events or plot progression from the previous version unless necessary for continuity. Create a genuinely fresh narrative interpretation of the premise with distinctive characters, an alternative mystery/conflict, and a unique dramatic escalation.

Return JSON:
{{
  "title": "Fresh, distinct, compelling title",
  "genre": "{genre}",
  "premise": "How this version innovatively develops the core idea differently",
  "main_conflict": "New central conflict and stakes",
  "theme": "Thematic question explored in this interpretation",
  "setting": "Atmospheric, vivid description of the setting",
  "main_characters": [
    {{
      "name": "Full Name",
      "age": "Age",
      "role": "Role in story",
      "personality": "Personality traits",
      "background": "Backstory",
      "motivation": "Core desire",
      "goal": "Immediate objective",
      "fear": "Primary vulnerability",
      "strength": "Key virtue or talent",
      "weakness": "Critical flaw",
      "relationships": "Dynamic with others",
      "character_arc": "Internal transformation"
    }}
  ],
  "plot": {{
    "introduction": "New inciting hook",
    "rising_action": "Fresh sequence of discoveries and obstacles",
    "climax": "Unpredictable, emotionally charged turning point",
    "falling_action": "Consequences and reckoning",
    "resolution": "Resolution fulfilling '{ending_preference}'"
  }},
  "story": "The complete full narrative written in natural paragraphs with rich dialogue, scene transitions, and pacing...",
  "regeneration_summary": "1-2 sentences highlighting how this version diverges from the previous version"
}}

Respond ONLY with valid JSON."""
    return prompt

def build_compare_versions_prompt(
    version_a_title: str,
    version_a_summary: str,
    version_a_story: str,
    version_b_title: str,
    version_b_summary: str,
    version_b_story: str
) -> str:
    """Prompt to analytically compare two story versions."""
    prompt = f"""Compare these two distinct story versions based on the same premise and provide an objective editorial breakdown.

VERSION A:
Title: {version_a_title}
Summary: {version_a_summary}
Sample excerpt: {version_a_story[:1200]}

VERSION B:
Title: {version_b_title}
Summary: {version_b_summary}
Sample excerpt: {version_b_story[:1200]}

Provide a structured comparison highlighting narrative divergence, character dynamics, pacing, and ending impact to help the reader choose.

Return JSON:
{{
  "summary_a": "1-2 sentence core premise summary of Version A",
  "summary_b": "1-2 sentence core premise summary of Version B",
  "characters_a": ["Character 1", "Character 2"],
  "characters_b": ["Character 1", "Character 2"],
  "plot_differences": "Detailed contrast of how the central mystery/conflict and rising action differ between both versions",
  "ending_differences": "Contrast of the climaxes and resolutions",
  "tone_and_style_differences": "Contrast in atmospheric mood, pacing, and sensory prose texture",
  "recommendation": "Which version is recommended for what reader preference (e.g. choose Version A for psychological suspense, Version B for fast-paced action)"
}}

Respond ONLY with valid JSON."""
    return prompt

# ============================================================================
# FEATURE 2: STORY TO IMAGE SCENE & PROFILE PROMPTS
# ============================================================================

STYLE_NEGATIVE_PROMPTS = {
    "Cinematic": "blurry, low quality, distorted face, extra fingers, malformed hands, duplicate character, inconsistent clothing, incorrect anatomy, watermark, text, logo, deformed eyes, cartoonish, 3d render, plastic skin",
    "Anime": "photorealistic, western comic, blurry, distorted face, extra fingers, malformed hands, text, watermark, bad line art, noisy, 3d render",
    "Manga": "colored, photorealistic, blurry, distorted face, extra fingers, malformed hands, text, watermark, messy screen tones",
    "Western Comic": "photorealistic, blurry, distorted face, extra fingers, malformed hands, watermark, text, anime style",
    "Digital Art": "blurry, low resolution, bad anatomy, deformed hands, missing fingers, extra limbs, watermark, text, signature",
    "Semi-realistic": "extreme anime, cartoonish, distorted anatomy, extra fingers, malformed face, blurry, text, watermark",
    "Realistic": "cartoon, anime, 3d render, doll, plastic skin, distorted anatomy, extra limbs, watermark, text, bad lighting",
    "Watercolor": "photorealistic, sharp digital 3d, extra fingers, malformed face, watermark, text, blurry mess",
    "3D Animation": "photorealistic photograph, 2d sketch, extra limbs, deformed face, watermark, text",
    "Fantasy": "modern technology, cars, airplanes, bad anatomy, extra fingers, malformed hands, text, watermark",
    "Noir": "bright cheerful pastel colors, cartoon, bad anatomy, extra fingers, watermark, text, modern neon",
    "Cyberpunk": "medieval elements, bad anatomy, extra fingers, malformed hands, watermark, text, low detail"
}

def build_scene_extraction_prompt(
    story_title: str,
    story_text: str,
    genre: str,
    visual_style: str = "Cinematic",
    scope: str = "Entire Story",
    target_scene_count: int = 5
) -> str:
    """
    Extracts key sequential visual scenes, locked character visual profiles,
    and location profiles from the story narrative.
    """
    negative_prompt_default = STYLE_NEGATIVE_PROMPTS.get(
        visual_style,
        "blurry, low quality, distorted face, extra fingers, malformed hands, duplicate character, inconsistent clothing, watermark, text, logo"
    )

    prompt = f"""You are a master film art director and story visualizer.
Analyze the following story and convert it into a sequence of exactly {target_scene_count} key visual scenes.

STORY TITLE: {story_title}
GENRE: {genre}
VISUAL ART STYLE: {visual_style}
SCOPE: {scope}

STORY NARRATIVE:
{story_text}

YOUR MISSION:
1. Extract Character Visual Profiles for every primary character. Maintain absolute visual consistency: age, face structure, skin tone, hair, clothing, accessories, and a compact reusable prompt snippet.
2. Extract Location Profiles for main settings (architecture, lighting, color palette, key objects, and reusable prompt snippet).
3. Identify exactly {target_scene_count} most visually dramatic, cinematic narrative moments (do NOT make an image for every paragraph—select the key pivotal scenes in chronological sequence).
4. For each scene, construct a synthesized, highly detailed image prompt combining:
   [Character appearance snippet] + [Location snippet] + [Specific action & pose] + [Facial expression] + [Camera angle & framing] + [Lighting & atmosphere] + [Visual style keywords: {visual_style}].
5. Provide a negative prompt customized for {visual_style}.

Return JSON:
{{
  "story_title": "{story_title}",
  "visual_style": "{visual_style}",
  "characters": [
    {{
      "name": "Character Name",
      "age": "20",
      "gender": "Male",
      "face_description": "sharp jawline, intense focused gaze",
      "skin_tone": "warm olive",
      "hair": "black wavy hair",
      "hairstyle": "slightly tousled",
      "eye_color": "dark brown",
      "body_type": "lean athletic build",
      "clothing": "dark charcoal wool coat, slate grey sweater, dark denim trousers",
      "accessories": "silver signet ring with coiled serpent crest, leather messenger bag",
      "distinctive_features": "faint silver scar along right temple",
      "appearance_prompt_snippet": "young man, 20 years old, warm olive skin, dark brown eyes, tousled black wavy hair, wearing dark charcoal wool coat, slate grey sweater, silver signet ring"
    }}
  ],
  "locations": [
    {{
      "name": "Location Name",
      "architecture": "Gothic Revival Romanesque granite arches",
      "environment": "towering mahogany bookshelves, subterranean vaults",
      "time_period": "late autumn evening",
      "color_palette": "deep umber, aged parchment gold, shadow charcoal",
      "lighting": "dim amber lantern glow and cold blue moonlight filtering through high clerestory windows",
      "important_objects": ["carved mahogany bookcase latch", "brass astrolabe", "antique vellum ledger"],
      "location_prompt_snippet": "inside subterranean Gothic college library vaults, towering dark mahogany bookcases, high granite arches, dust motes in dim amber lantern light"
    }}
  ],
  "scenes": [
    {{
      "scene_number": 1,
      "title": "Scene Headline Title",
      "description": "2-sentence vivid narrative description of the visual moment",
      "story_excerpt": "Direct sentence or quote from the story corresponding to this scene",
      "characters_involved": ["Character Name"],
      "location_name": "Location Name",
      "action": "What the character is physically doing",
      "facial_expression": "Expression on face",
      "body_language": "Physical posture and tension",
      "camera_angle": "Wide-angle low angle shot / Close-up / Over-the-shoulder shot",
      "composition": "Rule of thirds, dramatic leading lines toward secret door",
      "lighting": "Dramatic chiaroscuro lighting, warm flashlight beam cutting through cold shadows",
      "time_of_day": "Midnight",
      "visual_style": "{visual_style}",
      "mood": "Intense suspense and breathless discovery",
      "image_prompt": "Synthesized complete prompt combining character snippet, location snippet, specific action, camera framing, lighting, mood, and {visual_style} aesthetics...",
      "negative_prompt": "{negative_prompt_default}"
    }}
  ]
}}

Respond ONLY with valid JSON."""
    return prompt

