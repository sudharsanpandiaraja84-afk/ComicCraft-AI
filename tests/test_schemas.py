import uuid

import pytest
from pydantic import ValidationError
from schemas import (
    AdvancedStoryOptions,
    Chapter,
    ChapterGenerateRequest,
    CharacterVisualProfile,
    CompareVersionsRequest,
    CompleteStoryResponse,
    GeneratedImageResponse,
    ImageGenerateRequest,
    ImageRegenerateAllRequest,
    ImageRegenerateRequest,
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
    StoryVersion,
    UserInputCharacter,
    VerifyKeyRequest,
    VersionComparisonResult,
    VisualScene,
)


class TestUserInputCharacter:
    def test_default_values(self):
        char = UserInputCharacter(name="Arthur")
        assert char.name == "Arthur"
        assert char.age == ""
        assert char.role == "Protagonist"
        assert char.personality == ""
        assert char.gender == ""
        assert char.details == ""

    def test_custom_values(self):
        char = UserInputCharacter(
            name="Morgana",
            age="45",
            role="Antagonist",
            personality="Cunning, ambitious",
            gender="Female",
            details="Former sorceress royal advisor",
        )
        assert char.name == "Morgana"
        assert char.role == "Antagonist"
        assert char.gender == "Female"

    def test_missing_name_raises(self):
        with pytest.raises(ValidationError):
            UserInputCharacter()  # type: ignore


class TestAdvancedStoryOptions:
    def test_default_values(self):
        opts = AdvancedStoryOptions()
        assert opts.num_characters == "2-3"
        assert opts.setting == ""
        assert opts.time_period == ""
        assert opts.location == ""
        assert opts.complexity == "Moderate"
        assert opts.dialogue_amount == "Balanced"
        assert opts.description_level == "Rich & Vivid"
        assert opts.plot_twist == ""
        assert opts.moral == ""

    def test_custom_values(self):
        opts = AdvancedStoryOptions(
            num_characters="4+",
            setting="Cybernetic Metropolis",
            time_period="2140",
            location="Neo-Tokyo Sector 7",
            complexity="Complex",
            dialogue_amount="Dialogue-Heavy",
            description_level="Concise",
            plot_twist="The AI handler was human all along",
            moral="Technology amplifies human frailties",
        )
        assert opts.num_characters == "4+"
        assert opts.time_period == "2140"
        assert opts.complexity == "Complex"


class TestStoryGenerateRequest:
    def test_default_values(self):
        req = StoryGenerateRequest(story_idea="A clockmaker finds a gear that turns backward.")
        assert req.story_idea == "A clockmaker finds a gear that turns backward."
        assert req.genre == "Mystery"
        assert req.custom_genre == ""
        assert req.story_length == "Medium"
        assert req.tones == ["Suspenseful", "Mysterious"]
        assert req.writing_style == "Cinematic"
        assert req.custom_style == ""
        assert req.target_audience == "Young Adults"
        assert req.ending_preference == "Twist Ending"
        assert req.characters == []
        assert isinstance(req.advanced_options, AdvancedStoryOptions)
        assert req.api_key is None
        assert req.demo_mode is False

    def test_missing_story_idea_raises(self):
        with pytest.raises(ValidationError):
            StoryGenerateRequest()  # type: ignore

    def test_serialization_roundtrip(self):
        req = StoryGenerateRequest(
            story_idea="A detective solves a crime that happened tomorrow.",
            genre="Sci-Fi",
            tones=["Dark", "Noir"],
            demo_mode=True,
        )
        json_data = req.model_dump_json()
        restored = StoryGenerateRequest.model_validate_json(json_data)
        assert restored.story_idea == req.story_idea
        assert restored.tones == ["Dark", "Noir"]
        assert restored.demo_mode is True


class TestStoryPlotStructure:
    def test_valid_creation(self):
        plot = StoryPlotStructure(
            introduction="Intro scene",
            rising_action="Stakes rise",
            climax="Final confrontation",
            falling_action="Fallout",
            resolution="Ending",
        )
        assert plot.introduction == "Intro scene"
        assert plot.climax == "Final confrontation"

    def test_missing_fields_raises(self):
        with pytest.raises(ValidationError):
            StoryPlotStructure(introduction="Intro only")  # type: ignore


class TestStoryBlueprint:
    def test_valid_blueprint(self, sample_blueprint):
        assert sample_blueprint.title == "Echoes of the Dead Star"
        assert sample_blueprint.genre == "Science Fiction"
        assert len(sample_blueprint.main_characters) == 2
        assert sample_blueprint.plot.climax.startswith("The observatory")

    def test_blueprint_dump_and_validate(self, sample_blueprint):
        data = sample_blueprint.model_dump()
        rebuilt = StoryBlueprint.model_validate(data)
        assert rebuilt.title == sample_blueprint.title
        assert rebuilt.plot.resolution == sample_blueprint.plot.resolution


class TestStoryCharacter:
    def test_valid_character(self, sample_characters):
        char = sample_characters[0]
        assert char.name == "Dr. Lyra Mercer"
        assert char.role == "Protagonist"
        assert char.fear != ""
        assert char.strength != ""
        assert char.character_arc != ""

    def test_missing_required_character_field(self):
        with pytest.raises(ValidationError):
            StoryCharacter(name="Incomplete")  # type: ignore


class TestQualityCheckReport:
    def test_default_values(self):
        report = QualityCheckReport()
        assert report.plot_consistency is True
        assert report.character_consistency is True
        assert report.genre_alignment is True
        assert report.story_structure is True
        assert report.plot_coherence_score == 95
        assert report.character_consistency_score == 94
        assert report.genre_fidelity_score == 96
        assert report.pacing_score == 92
        assert report.dialogue_score == 90
        assert report.originality_score == 94
        assert report.strengths == []
        assert report.critique == ""
        assert report.improvements_made == []

    def test_custom_values(self):
        report = QualityCheckReport(
            plot_consistency=False,
            plot_coherence_score=85,
            strengths=["Strong start"],
            critique="Needs tighter climax.",
        )
        assert report.plot_consistency is False
        assert report.plot_coherence_score == 85
        assert report.strengths == ["Strong start"]


class TestChapterAndCompleteStory:
    def test_chapter_creation(self):
        ch = Chapter(chapter_number=1, title="Beginnings", content="Long ago...", word_count=2)
        assert ch.chapter_number == 1
        assert ch.summary == ""

    def test_complete_story_defaults(self, sample_blueprint, sample_characters):
        story = CompleteStoryResponse(
            title="A Tale",
            genre="Fantasy",
            writing_style="Mythic",
            target_audience="Adults",
            ending_type="Bittersweet",
            story="Once upon a time in a realm far away...",
            word_count=8,
            blueprint=sample_blueprint,
            characters=sample_characters,
        )
        # Verify UUID was generated
        uuid_obj = uuid.UUID(story.id)
        assert uuid_obj.version == 4
        assert story.reading_time == "5 min read"
        assert story.is_demo is False
        assert story.chapters == []
        assert isinstance(story.quality_check, QualityCheckReport)

    def test_complete_story_json_roundtrip(self, sample_story_response):
        json_str = sample_story_response.model_dump_json()
        restored = CompleteStoryResponse.model_validate_json(json_str)
        assert restored.title == sample_story_response.title
        assert len(restored.characters) == len(sample_story_response.characters)
        assert len(restored.chapters) == len(sample_story_response.chapters)


class TestActionRequestSchemas:
    def test_story_improve_request(self):
        req = StoryImproveRequest(story="The night was dark.")
        assert req.focus_area == "Pacing"
        assert req.instructions == ""
        assert req.demo_mode is False

    def test_story_continue_request(self):
        req = StoryContinueRequest(previous_story="The carriage stopped.")
        assert req.target_length == "Medium"
        assert "twist" in req.continuation_prompt.lower()

    def test_story_rewrite_request(self):
        req = StoryRewriteRequest(story="It started with rain.", new_genre="Cyberpunk")
        assert req.original_genre == "Mystery"
        assert req.new_genre == "Cyberpunk"

    def test_story_shorten_request(self):
        req = StoryShortenRequest(story="A long story...", target_word_count=500)
        assert req.target_word_count == 500

    def test_story_expand_request(self):
        req = StoryExpandRequest(story="A short story...", target_word_count=2500)
        assert req.target_word_count == 2500

    def test_chapter_generate_request(self):
        req = ChapterGenerateRequest(
            previous_context="They entered the tomb.",
            what_should_happen="They trigger a mechanical trap.",
        )
        assert req.chapter_number == 2
        assert req.chapter_title == "The Hidden Chamber"
        assert req.desired_length == "Medium"

    def test_section_edit_request_and_response(self):
        req = SectionEditRequest(
            full_story="Full text here",
            selected_text="text here",
            action="make_dialogue_better",
        )
        assert req.action == "make_dialogue_better"

        res = SectionEditResponse(
            original_text="text here",
            replacement_text="'Listen closely,' he whispered.",
            action="make_dialogue_better",
            explanation="Replaced with direct speech.",
        )
        assert res.original_text == "text here"
        assert res.replacement_text.startswith("'Listen closely")

    def test_verify_key_request(self):
        req = VerifyKeyRequest(api_key="AIzaSyTest123")
        assert req.api_key == "AIzaSyTest123"


class TestFeature1RegenerationSchemas:
    def test_regenerate_story_request(self):
        req = RegenerateStoryRequest(
            original_idea="A space station goes silent",
            regeneration_option="Different ending",
        )
        assert req.genre == "Mystery"
        assert req.regeneration_option == "Different ending"
        assert req.demo_mode is False

    def test_story_version_and_comparison(self, sample_story_response):
        v1 = StoryVersion(
            version_number=1,
            title="Version One",
            summary="Original draft",
            story_data=sample_story_response,
        )
        assert v1.version_number == 1
        assert uuid.UUID(v1.version_id)

        v2 = StoryVersion(
            version_number=2,
            title="Version Two",
            summary="Alternate ending",
            story_data=sample_story_response,
        )

        comp_req = CompareVersionsRequest(version_a=v1, version_b=v2)
        assert comp_req.version_a.title == "Version One"
        assert comp_req.version_b.title == "Version Two"

        comp_res = VersionComparisonResult(
            version_a_id=v1.version_id,
            version_b_id=v2.version_id,
            title_a=v1.title,
            title_b=v2.title,
            summary_a=v1.summary,
            summary_b=v2.summary,
            characters_a=["Lyra"],
            characters_b=["Lyra", "Tomas"],
            plot_differences="Version B includes satellite sabotage subplot.",
            ending_differences="Version B ends with signal broadcast.",
            tone_and_style_differences="Version B is darker.",
            recommendation="Choose Version B for more suspense.",
        )
        assert comp_res.characters_a == ["Lyra"]
        assert comp_res.recommendation.startswith("Choose Version B")


class TestFeature2ImageSchemas:
    def test_character_visual_profile(self):
        profile = CharacterVisualProfile(
            name="Lyra",
            age="32",
            gender="Female",
            face_description="High cheekbones, intense gaze",
            skin_tone="Olive",
            hair="Dark brown",
            hairstyle="Tied back in a utilitarian bun",
            eye_color="Amber",
            body_type="Lean, athletic",
            clothing="Fleece jacket, thermal trousers",
            accessories="Field notebook, brass caliper",
            distinctive_features="Faint scar across left eyebrow",
            appearance_prompt_snippet="32yo woman, olive skin, amber eyes, dark hair in bun, utilitarian fleece jacket",
        )
        assert profile.name == "Lyra"
        assert profile.appearance_prompt_snippet.startswith("32yo woman")

    def test_location_profile(self):
        loc = LocationProfile(
            name="Atacama Array",
            architecture="Brutalist concrete bunker and radio dishes",
            environment="Arid high plateau under crystalline starry sky",
            time_period="Near future",
            color_palette="Deep cobalt, rusted copper, bone white",
            lighting="Harsh moonlight, red instrument illumination",
            important_objects=["Control console", "Spectrogram plotter"],
            location_prompt_snippet="High-altitude radio observatory plateau, giant dishes against cobalt Milky Way",
        )
        assert loc.name == "Atacama Array"
        assert uuid.UUID(loc.location_id)

    def test_visual_scene(self):
        scene = VisualScene(
            scene_number=1,
            title="The Pulse Arrives",
            description="Lyra watches the waveform spike on the monitor.",
            story_excerpt="The stylus jumped off the paper drum.",
            characters_involved=["Lyra"],
            location_name="Control Room",
            action="Freezing in surprise as anomalous signal peaks",
            facial_expression="Widened eyes, parted lips",
            body_language="Hands suspended over the keyboard",
            camera_angle="Close-up over shoulder",
            composition="Rule of thirds",
            lighting="Green monitor glow in dark room",
            time_of_day="Midnight",
            visual_style="Cinematic",
            mood="Tense, atmospheric",
            image_prompt="Cinematic close-up of female astronomer staring at glowing green monitor displaying pulsating waveforms...",
            negative_prompt="blurry, distorted, extra limbs, cartoonish",
        )
        assert scene.scene_number == 1
        assert scene.is_generating is False
        assert scene.image_url is None

    def test_scene_extraction_schemas(self):
        req = StorySceneExtractionRequest(
            story_title="Echoes",
            story_text="A signal arrived from the star.",
            genre="Sci-Fi",
            target_scene_count=3,
        )
        assert req.scope == "Entire Story"
        assert req.target_scene_count == 3

        resp = StorySceneExtractionResponse(
            story_title=req.story_title,
            visual_style="Cinematic",
            characters=[],
            locations=[],
            scenes=[],
        )
        assert resp.story_title == "Echoes"
        assert resp.scenes == []

    def test_image_generation_schemas(self):
        gen_req = ImageGenerateRequest(scene_id="scene-1", image_prompt="A glowing star.")
        assert gen_req.visual_style == "Cinematic"

        regen_req = ImageRegenerateRequest(
            scene_id="scene-1",
            image_prompt="A glowing star.",
            custom_guidance="Add chromatic aberration",
        )
        assert regen_req.custom_guidance == "Add chromatic aberration"

        all_req = ImageRegenerateAllRequest(scenes=[])
        assert all_req.scenes == []

        res = GeneratedImageResponse(
            scene_id="scene-1",
            image_url="https://image.pollinations.ai/prompt/star",
            prompt_used="A glowing star",
            negative_prompt_used="",
            status="success",
        )
        assert res.status == "success"
        assert res.image_url is not None
