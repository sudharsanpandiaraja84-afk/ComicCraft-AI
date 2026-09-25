from unittest.mock import AsyncMock, patch


class TestHealthAndDemoEndpoints:
    """Tests for basic health and demo endpoints."""

    def test_health_check(self, client):
        response = client.get("/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "online"
        assert data["service"] == "StoryForge AI"
        assert "gemini_api_configured" in data
        assert data["demo_mode_available"] is True
        assert data["version"] == "1.0.0"

    def test_security_headers_present(self, client):
        response = client.get("/api/health")
        assert response.headers.get("x-content-type-options") == "nosniff"
        assert response.headers.get("x-frame-options") == "DENY"
        assert response.headers.get("referrer-policy") == "strict-origin-when-cross-origin"

    def test_get_demo_story(self, client):
        response = client.get("/api/demo")
        assert response.status_code == 200
        data = response.json()
        assert "title" in data
        assert "blueprint" in data
        assert "characters" in data
        assert "chapters" in data
        assert len(data["chapters"]) > 0


class TestSettingsEndpoints:
    """Tests for settings and API key verification endpoints."""

    def test_verify_key_empty(self, client):
        response = client.post("/api/settings/verify-key", json={"api_key": ""})
        assert response.status_code == 200
        data = response.json()
        assert data["valid"] is False
        assert "empty" in data["message"].lower()

    def test_verify_key_mock_valid(self, client):
        mock_result = {"valid": True, "message": "Google Gemini API key is valid and connected!"}
        with patch(
            "gemini_service.verify_gemini_key", new_callable=AsyncMock, return_value=mock_result
        ):
            response = client.post("/api/settings/verify-key", json={"api_key": "valid-key-xyz"})
            assert response.status_code == 200
            data = response.json()
            assert data["valid"] is True


class TestStoryGenerateEndpoints:
    """Tests for story generation and idea analysis endpoints."""

    def test_generate_story_empty_idea_returns_400(self, client):
        response = client.post("/api/story/generate", json={"story_idea": ""})
        assert response.status_code == 400
        assert "story idea" in response.json()["detail"].lower()

    def test_generate_story_whitespace_idea_returns_400(self, client):
        response = client.post("/api/story/generate", json={"story_idea": "    \n   "})
        assert response.status_code == 400
        assert "story idea" in response.json()["detail"].lower()

    def test_generate_story_demo_mode(self, client, sample_generate_request):
        req_data = sample_generate_request.model_dump()
        req_data["demo_mode"] = True
        response = client.post("/api/story/generate", json=req_data)
        assert response.status_code == 200
        data = response.json()
        assert "title" in data
        assert "blueprint" in data
        assert "chapters" in data

    def test_analyze_story_demo_mode(self, client, sample_generate_request):
        req_data = sample_generate_request.model_dump()
        req_data["demo_mode"] = True
        response = client.post("/api/story/analyze", json=req_data)
        assert response.status_code == 200
        data = response.json()
        assert "premise" in data
        assert "potential_conflicts" in data
        assert "recommended_pacing" in data
        assert "key_themes" in data

    def test_analyze_story_with_mock_gemini(self, client, sample_generate_request):
        mock_analysis = {
            "premise": "Mock premise",
            "potential_conflicts": ["A vs B"],
            "recommended_pacing": "Fast",
            "key_themes": ["Hope"],
        }
        with (
            patch("gemini_service.get_gemini_api_key", return_value="fake-api-key"),
            patch(
                "gemini_service.analyze_story_idea",
                new_callable=AsyncMock,
                return_value=mock_analysis,
            ),
        ):
            req_data = sample_generate_request.model_dump()
            req_data["demo_mode"] = False
            response = client.post("/api/story/analyze", json=req_data)
            assert response.status_code == 200
            assert response.json()["premise"] == "Mock premise"


class TestStoryRefinementEndpoints:
    """Tests for improve, continue, rewrite, shorten, expand, chapter, section-edit."""

    def test_improve_story_demo_mode(self, client):
        payload = {
            "story": "The spaceship drifted slowly toward the unknown portal.",
            "focus_area": "Dialogue",
            "instructions": "Add banter",
            "demo_mode": True,
        }
        response = client.post("/api/story/improve", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert "improved_story" in data
        assert "improvements_summary" in data

    def test_continue_story_demo_mode(self, client):
        payload = {
            "previous_story": "They reached the end of the corridor.",
            "continuation_prompt": "A hidden door appears.",
            "target_length": "Short",
            "demo_mode": True,
        }
        response = client.post("/api/story/continue", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert "continuation_title" in data
        assert "continuation_text" in data
        assert "transition_summary" in data

    def test_rewrite_story_demo_mode(self, client):
        payload = {
            "story": "It was a dark and rainy night in the city.",
            "original_genre": "Mystery",
            "new_genre": "Cyberpunk Noir",
            "new_tone": "Gritty",
            "demo_mode": True,
        }
        response = client.post("/api/story/rewrite", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert "rewritten_title" in data
        assert "rewritten_story" in data
        assert "notes" in data

    def test_shorten_story_demo_mode(self, client):
        words = ["word" for _ in range(100)]
        payload = {
            "story": " ".join(words),
            "target_word_count": 20,
            "demo_mode": True,
        }
        response = client.post("/api/story/shorten", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert "shortened_story" in data
        assert data["word_count"] <= 20
        assert "summary_of_cuts" in data

    def test_expand_story_demo_mode(self, client):
        payload = {
            "story": "She looked out the window at the distant city lights.",
            "target_word_count": 500,
            "demo_mode": True,
        }
        response = client.post("/api/story/expand", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert "expanded_story" in data
        assert "expansion_highlights" in data

    def test_generate_chapter_demo_mode(self, client):
        payload = {
            "previous_context": "Chapter 1 completed.",
            "chapter_number": 1,
            "chapter_title": "Arrival",
            "what_should_happen": "Arrive at the destination.",
            "demo_mode": True,
        }
        response = client.post("/api/story/chapter", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert "chapter_number" in data
        assert "title" in data
        assert "content" in data

    def test_generate_chapter_higher_number(self, client):
        payload = {
            "previous_context": "Previous events...",
            "chapter_number": 99,
            "chapter_title": "The Far Horizon",
            "what_should_happen": "Final showdown",
            "demo_mode": True,
        }
        response = client.post("/api/story/chapter", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert data["chapter_number"] == 99
        assert data["title"] == "The Far Horizon"

    def test_edit_section_demo_mode(self, client):
        payload = {
            "selected_text": "He looked at the machine in silence.",
            "full_story": "He looked at the machine in silence. It was broken.",
            "action": "improve_paragraph",
            "demo_mode": True,
        }
        response = client.post("/api/story/edit-section", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert "original_text" in data
        assert "replacement_text" in data
        assert "explanation" in data


class TestQualityCheckAndComparisonEndpoints:
    """Tests for /api/story/check, /api/story/regenerate, /api/story/compare."""

    def test_check_story_quality_heuristic_fallback(
        self, client, sample_blueprint, sample_characters, monkeypatch
    ):
        monkeypatch.setattr("gemini_service.get_gemini_api_key", lambda _: None)
        payload = {
            "story": 'Dr. Lyra Mercer observed the console. "We have received the transmission."',
            "blueprint": sample_blueprint.model_dump(),
            "characters": [c.model_dump() for c in sample_characters],
            "api_key": None,
        }
        response = client.post("/api/story/check", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert data["plot_consistency"] is True
        assert "plot_coherence_score" in data
        assert "character_consistency_score" in data

    def test_regenerate_story_endpoint(self, client):
        payload = {
            "original_idea": "Subterranean civilization discovered beneath ice",
            "genre": "Science Fiction",
            "regeneration_option": "Alternative Twist Ending",
            "custom_instruction": "Introduce ancient machine gods",
            "demo_mode": True,
        }
        response = client.post("/api/story/regenerate", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert "title" in data
        assert "blueprint" in data
        assert "chapters" in data

    def test_compare_story_versions_endpoint(self, client, sample_story_response):
        story_payload = sample_story_response.model_dump()
        payload = {
            "version_a": {
                "title": "Version Alpha",
                "summary": "Alpha summary",
                "story_data": story_payload,
            },
            "version_b": {
                "title": "Version Beta",
                "summary": "Beta summary",
                "story_data": story_payload,
            },
        }
        response = client.post("/api/story/compare", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert "summary_a" in data
        assert "summary_b" in data
        assert "plot_differences" in data
        assert "recommendation" in data


class TestStoryToScenesAndImageEndpoints:
    """Tests for /api/story/scenes, /api/story/image-prompts, and /api/images/*."""

    def test_extract_scenes_endpoint(self, client):
        payload = {
            "story_title": "The Frozen Signal",
            "story_text": "The radio array echoed across the Antarctic plateau.",
            "genre": "Science Fiction",
            "visual_style": "Cinematic",
            "target_scene_count": 3,
        }
        response = client.post("/api/story/scenes", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert "story_title" in data
        assert "scenes" in data
        assert len(data["scenes"]) > 0

    def test_image_prompts_endpoint(self, client):
        payload = {
            "story_title": "Echoes of Eternity",
            "story_text": "Deep in the cavern, crystal pillars resonated.",
            "genre": "Fantasy",
            "visual_style": "Anime",
            "target_scene_count": 2,
        }
        response = client.post("/api/story/image-prompts", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert "scenes" in data

    def test_get_images_status(self, client):
        response = client.get("/api/images/status")
        assert response.status_code == 200
        data = response.json()
        assert "status" in data
        assert "provider" in data
        assert "supported_styles" in data

    def test_generate_image_endpoint_valid(self, client):
        payload = {
            "scene_id": "scene_1",
            "image_prompt": "An astronomer standing before a glowing array",
            "visual_style": "Cinematic",
        }
        response = client.post("/api/images/generate", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert data["scene_id"] == "scene_1"
        assert data["status"] in ["success", "unconfigured", "error"]

    def test_generate_image_endpoint_empty_prompt(self, client):
        payload = {
            "scene_id": "scene_1",
            "image_prompt": "",
        }
        response = client.post("/api/images/generate", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "error"
        assert "empty" in data["message"].lower()

    def test_regenerate_image_endpoint(self, client):
        payload = {
            "scene_id": "scene_1",
            "image_prompt": "An astronomer standing before a glowing array",
            "custom_guidance": "Add falling snow and neon violet reflections",
            "visual_style": "Noir",
        }
        response = client.post("/api/images/regenerate", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert data["scene_id"] == "scene_1"
        assert data["status"] in ["success", "unconfigured", "error"]

    def test_regenerate_all_images_endpoint(self, client):
        payload = {
            "scenes": [
                {
                    "scene_id": "s1",
                    "scene_number": 1,
                    "title": "Scene 1",
                    "description": "Opening moment",
                    "action": "Observing stars",
                    "image_prompt": "Astronomer on the ridge",
                    "negative_prompt": "blurry, low quality",
                },
                {
                    "scene_id": "s2",
                    "scene_number": 2,
                    "title": "Scene 2",
                    "description": "Signal arrival",
                    "action": "Entering coordinates",
                    "image_prompt": "Glowing screens in the terminal",
                    "negative_prompt": "blurry, low quality",
                },
            ],
            "visual_style": "Cinematic",
        }
        response = client.post("/api/images/regenerate-all", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) == 2
        assert data[0]["scene_id"] == "s1"
        assert data[1]["scene_id"] == "s2"


class TestInvalidEndpoints:
    """Tests for routing errors and 404 responses."""

    def test_get_nonexistent_api_endpoint_returns_404(self, client):
        response = client.get("/api/nonexistent-route")
        assert response.status_code == 404
        assert "not found" in response.json()["detail"].lower()

    def test_post_nonexistent_api_endpoint_returns_404_or_405(self, client):
        response = client.post("/api/nonexistent-route", json={"foo": "bar"})
        assert response.status_code in (404, 405)
