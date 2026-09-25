import prompt_engine
from schemas import (
    AdvancedStoryOptions,
    StoryGenerateRequest,
    StoryRewriteRequest,
)


class TestPromptEngineConstants:
    """Tests for constants defined in prompt_engine."""

    def test_core_system_instruction(self):
        assert isinstance(prompt_engine.CORE_SYSTEM_INSTRUCTION, str)
        assert "expert fiction writer" in prompt_engine.CORE_SYSTEM_INSTRUCTION.lower()
        assert "Do not merely repeat" in prompt_engine.CORE_SYSTEM_INSTRUCTION

    def test_genre_intelligence_rules(self):
        genres = [
            "Mystery",
            "Horror",
            "Thriller",
            "Science Fiction",
            "Fantasy",
            "Romance",
            "Adventure",
            "Comedy",
            "Drama",
            "Historical",
            "Crime",
            "Superhero",
            "Slice of Life",
            "Psychological",
            "Action",
            "Educational",
        ]
        for genre in genres:
            assert genre in prompt_engine.GENRE_INTELLIGENCE_RULES
            assert len(prompt_engine.GENRE_INTELLIGENCE_RULES[genre]) > 20

    def test_length_guidance(self):
        lengths = ["Short", "Medium", "Long", "Very Long"]
        for length in lengths:
            assert length in prompt_engine.LENGTH_GUIDANCE
            assert "words" in prompt_engine.LENGTH_GUIDANCE[length]

    def test_style_negative_prompts(self):
        styles = ["Cinematic", "Anime", "Manga", "Noir", "Cyberpunk", "Watercolor"]
        for style in styles:
            assert style in prompt_engine.STYLE_NEGATIVE_PROMPTS
            assert "watermark" in prompt_engine.STYLE_NEGATIVE_PROMPTS[style]


class TestBuildBlueprintPrompt:
    """Tests for build_blueprint_prompt."""

    def test_build_blueprint_prompt_standard(self, sample_generate_request):
        prompt = prompt_engine.build_blueprint_prompt(sample_generate_request)
        assert isinstance(prompt, str)
        assert sample_generate_request.story_idea in prompt
        assert sample_generate_request.genre in prompt
        assert sample_generate_request.ending_preference in prompt
        assert "Dr. Lyra Mercer" in prompt
        assert "STORY BLUEPRINT" in prompt

    def test_build_blueprint_prompt_custom_genre(self):
        req = StoryGenerateRequest(
            story_idea="Solar sails over Jupiter",
            genre="Other",
            custom_genre="Solarpunk Hard Sci-Fi",
        )
        prompt = prompt_engine.build_blueprint_prompt(req)
        assert "Solarpunk Hard Sci-Fi" in prompt
        assert "Tailor the narrative to the custom genre" in prompt

    def test_build_blueprint_prompt_no_characters(self):
        req = StoryGenerateRequest(
            story_idea="An abandoned station on Pluto",
            genre="Science Fiction",
            characters=[],
        )
        prompt = prompt_engine.build_blueprint_prompt(req)
        assert "AI will design all suitable original characters." in prompt

    def test_build_blueprint_prompt_advanced_options(self):
        req = StoryGenerateRequest(
            story_idea="A clockmaker who can rewind seconds",
            genre="Fantasy",
            advanced_options=AdvancedStoryOptions(
                num_characters="4-5",
                setting="Victorian Clock Tower",
                plot_twist="The clockmaker is already dead",
                moral="Time cannot be bargained with",
            ),
        )
        prompt = prompt_engine.build_blueprint_prompt(req)
        assert "Victorian Clock Tower" in prompt
        assert "The clockmaker is already dead" in prompt
        assert "Time cannot be bargained with" in prompt


class TestBuildCharacterGenerationPrompt:
    """Tests for build_character_generation_prompt and its alias build_characters_prompt."""

    def test_build_character_generation_prompt(self, sample_generate_request, sample_blueprint):
        prompt = prompt_engine.build_character_generation_prompt(
            sample_generate_request, sample_blueprint
        )
        assert sample_blueprint.title in prompt
        assert sample_blueprint.premise in prompt
        assert "Character Bible" in prompt
        assert "Dr. Lyra Mercer" in prompt

    def test_build_characters_prompt_alias(self, sample_generate_request, sample_blueprint):
        p1 = prompt_engine.build_characters_prompt(sample_generate_request, sample_blueprint)
        p2 = prompt_engine.build_character_generation_prompt(
            sample_generate_request, sample_blueprint
        )
        assert p1 == p2

    def test_build_character_generation_prompt_without_user_characters(self, sample_blueprint):
        req = StoryGenerateRequest(
            story_idea="A silent submarine at the Mariana Trench",
            genre="Thriller",
            characters=[],
        )
        prompt = prompt_engine.build_character_generation_prompt(req, sample_blueprint)
        assert sample_blueprint.title in prompt
        assert "Ensure you faithfully integrate the user's specified characters:" not in prompt


class TestBuildFullStoryPrompt:
    """Tests for build_full_story_prompt."""

    def test_build_full_story_prompt(
        self, sample_generate_request, sample_blueprint, sample_characters
    ):
        prompt = prompt_engine.build_full_story_prompt(
            sample_generate_request, sample_blueprint, sample_characters
        )
        assert sample_blueprint.title in prompt
        assert sample_blueprint.premise in prompt
        assert sample_blueprint.plot.climax in prompt
        assert "Dr. Lyra Mercer" in prompt
        assert "Director Vance Holt" in prompt
        assert sample_blueprint.ending_type in prompt
        assert "WRITING EXECUTION RULES:" in prompt

    def test_build_full_story_prompt_custom_genre_and_style(
        self, sample_blueprint, sample_characters
    ):
        req = StoryGenerateRequest(
            story_idea="Gothic space mystery",
            genre="Science Fiction",
            custom_genre="Gothic Cyberpunk",
            writing_style="Other",
            custom_style="Poetic stream of consciousness",
        )
        prompt = prompt_engine.build_full_story_prompt(req, sample_blueprint, sample_characters)
        assert "Gothic Cyberpunk" in prompt
        assert "Poetic stream of consciousness" in prompt


class TestBuildQualityCheckPrompt:
    """Tests for build_quality_check_prompt."""

    def test_build_quality_check_prompt(self, sample_blueprint, sample_characters):
        story_text = "A long narrative about stars and radio astronomy..." * 20
        prompt = prompt_engine.build_quality_check_prompt(
            story_text, sample_blueprint, sample_characters
        )
        assert sample_blueprint.title in prompt
        assert sample_blueprint.genre in prompt
        assert "senior literary editor" in prompt
        assert "plot_coherence_score" in prompt


class TestBuildImproveStoryPrompt:
    """Tests for build_improve_story_prompt."""

    def test_build_improve_story_prompt_with_instructions(self):
        story = "The detective entered the dark room. He found a key."
        prompt = prompt_engine.build_improve_story_prompt(
            story, focus_area="Dialogue", instructions="Add snappy banter"
        )
        assert "Dialogue" in prompt
        assert "Add snappy banter" in prompt
        assert story in prompt

    def test_build_improve_story_prompt_default_instructions(self):
        story = "The detective entered the dark room."
        prompt = prompt_engine.build_improve_story_prompt(story, focus_area="Descriptions")
        assert "Descriptions" in prompt
        assert "Elevate the overall quality" in prompt


class TestBuildContinueStoryPrompt:
    """Tests for build_continue_story_prompt and alias build_continue_prompt."""

    def test_build_continue_story_prompt(self):
        previous = "The door swung open to reveal the vault."
        prompt = prompt_engine.build_continue_story_prompt(
            previous, continuation_prompt="The vault is not empty", target_length="Long"
        )
        assert previous in prompt
        assert "The vault is not empty" in prompt
        assert "Long" in prompt
        assert "continuation_title" in prompt

    def test_build_continue_prompt_alias(self):
        p1 = prompt_engine.build_continue_prompt("Context", "Continue here")
        p2 = prompt_engine.build_continue_story_prompt("Context", "Continue here")
        assert p1 == p2


class TestBuildChapterPrompt:
    """Tests for build_chapter_prompt."""

    def test_build_chapter_prompt(self):
        prompt = prompt_engine.build_chapter_prompt(
            previous_context="They escaped the citadel.",
            chapter_number=3,
            chapter_title="The Whispering Pines",
            what_should_happen="They encounter a nomadic tribe",
            desired_length="1500 words",
            genre="Fantasy",
            tone="Mysterious",
            style="Descriptive",
        )
        assert "Chapter 3: 'The Whispering Pines'" in prompt
        assert "They encounter a nomadic tribe" in prompt
        assert "Fantasy" in prompt
        assert "Mysterious" in prompt
        assert "Descriptive" in prompt


class TestBuildSectionEditPrompt:
    """Tests for build_section_edit_prompt."""

    def test_actions(self):
        actions = [
            "regenerate",
            "improve_paragraph",
            "make_dialogue_better",
            "make_description_more_detailed",
            "change_tone",
            "unknown_action",
        ]
        context = "Full context sentence here."
        selected = "Section to edit."
        for action in actions:
            prompt = prompt_engine.build_section_edit_prompt(
                selected_text=selected,
                full_context=context,
                action=action,
                tone_guidance="Darker and more grim",
            )
            assert selected in prompt
            assert "replacement_text" in prompt
            if action == "change_tone":
                assert "Darker and more grim" in prompt


class TestBuildRegenerateStoryPrompt:
    """Tests for build_regenerate_story_prompt."""

    def test_build_regenerate_story_prompt(self):
        prompt = prompt_engine.build_regenerate_story_prompt(
            original_idea="An astronaut trapped in an ancient orbital temple.",
            genre="Science Fiction",
            tones=["Suspenseful", "Mystical"],
            writing_style="Atmospheric",
            target_audience="General Adult",
            story_length="Medium",
            ending_preference="Bittersweet",
            previous_title="Temple in the Sky",
            previous_summary="The astronaut repaired the beacon and escaped.",
            regeneration_option="Alternative Twist Ending",
            custom_instruction="Focus on the temple's sentient AI guardian.",
        )
        assert "orbital temple" in prompt
        assert "Temple in the Sky" in prompt
        assert "Alternative Twist Ending" in prompt
        assert "sentient AI guardian" in prompt
        assert "CRITICAL REGENERATION DIRECTIVE:" in prompt


class TestBuildCompareVersionsPrompt:
    """Tests for build_compare_versions_prompt."""

    def test_build_compare_versions_prompt(self):
        prompt = prompt_engine.build_compare_versions_prompt(
            version_a_title="Version A",
            version_a_summary="Summary A",
            version_a_story="Story A full text...",
            version_b_title="Version B",
            version_b_summary="Summary B",
            version_b_story="Story B full text...",
        )
        assert "Version A" in prompt
        assert "Version B" in prompt
        assert "Summary A" in prompt
        assert "Summary B" in prompt
        assert "plot_differences" in prompt
        assert "recommendation" in prompt


class TestBuildSceneExtractionPrompt:
    """Tests for build_scene_extraction_prompt."""

    def test_build_scene_extraction_prompt(self):
        prompt = prompt_engine.build_scene_extraction_prompt(
            story_title="The Lost Satellite",
            story_text="She walked toward the dish in silence.",
            genre="Mystery",
            visual_style="Anime",
            scope="Entire Story",
            target_scene_count=4,
        )
        assert "The Lost Satellite" in prompt
        assert "exactly 4 key visual scenes" in prompt
        assert "Anime" in prompt
        assert "visual_style" in prompt
        assert "image_prompt" in prompt


class TestBuildRewritePrompt:
    """Tests for build_rewrite_prompt."""

    def test_build_rewrite_prompt_with_all_options(self):
        req = StoryRewriteRequest(
            story="The detective walked into the abandoned room.",
            original_genre="Mystery",
            new_genre="Cyberpunk Noir",
            new_tone="Gritty",
            new_style="Punchy Hardboiled",
            new_ending="Tragic",
            instructions="Add neon rain and neural cybernetics.",
        )
        prompt = prompt_engine.build_rewrite_prompt(req)
        assert "Cyberpunk Noir" in prompt
        assert "Gritty" in prompt
        assert "Punchy Hardboiled" in prompt
        assert "Tragic" in prompt
        assert "neon rain and neural cybernetics" in prompt
        assert "The detective walked into the abandoned room." in prompt

    def test_build_rewrite_prompt_defaults(self):
        req = StoryRewriteRequest(
            story="The original story text here.",
            original_genre="Horror",
        )
        prompt = prompt_engine.build_rewrite_prompt(req)
        assert "Horror" in prompt
        assert "Preserve" in prompt
        assert "The original story text here." in prompt
