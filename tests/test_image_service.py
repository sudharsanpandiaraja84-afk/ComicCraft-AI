from unittest.mock import AsyncMock, patch

import image_generation_service
import pytest
from schemas import CharacterVisualProfile, GeneratedImageResponse, VisualScene


class TestImageServiceStatus:
    """Unit tests for get_image_service_status."""

    def test_status_when_active(self, monkeypatch):
        monkeypatch.setattr(image_generation_service, "IMAGE_PROVIDER", "pollinations")
        status = image_generation_service.get_image_service_status()
        assert status["status"] == "online"
        assert status["provider"] == "pollinations"
        assert "Cinematic" in status["supported_styles"]
        assert "ready" in status["message"].lower()

    def test_status_when_none(self, monkeypatch):
        monkeypatch.setattr(image_generation_service, "IMAGE_PROVIDER", "none")
        status = image_generation_service.get_image_service_status()
        assert status["status"] == "unconfigured"
        assert status["provider"] == "none"
        assert "not configured" in status["message"].lower()


class TestGenerateSceneImage:
    """Unit tests for generate_scene_image."""

    @pytest.mark.asyncio
    async def test_empty_prompt_returns_error(self):
        resp = await image_generation_service.generate_scene_image(scene_id="scene_1", prompt="")
        assert isinstance(resp, GeneratedImageResponse)
        assert resp.status == "error"
        assert "empty" in resp.message.lower()
        assert resp.image_url is None

    @pytest.mark.asyncio
    async def test_whitespace_prompt_returns_error(self):
        resp = await image_generation_service.generate_scene_image(
            scene_id="scene_1", prompt="   \n   "
        )
        assert resp.status == "error"
        assert "empty" in resp.message.lower()

    @pytest.mark.asyncio
    async def test_provider_none_returns_unconfigured(self, monkeypatch):
        monkeypatch.setattr(image_generation_service, "IMAGE_PROVIDER", "none")
        resp = await image_generation_service.generate_scene_image(
            scene_id="scene_1", prompt="A desolate mountain outpost at dusk"
        )
        assert resp.status == "unconfigured"
        assert resp.image_url is None
        assert "not configured" in resp.message.lower()

    @pytest.mark.asyncio
    async def test_successful_generation_with_pollinations(self, monkeypatch):
        monkeypatch.setattr(image_generation_service, "IMAGE_PROVIDER", "pollinations")
        mock_response = AsyncMock()
        mock_response.status_code = 200

        with patch("httpx.AsyncClient.head", return_value=mock_response):
            resp = await image_generation_service.generate_scene_image(
                scene_id="scene_1",
                prompt="A solitary radio dish under the starry sky",
                negative_prompt="blurry, distorted",
                visual_style="Cinematic",
            )
            assert resp.status == "success"
            assert resp.image_url is not None
            assert "pollinations.ai" in resp.image_url
            assert resp.prompt_used == "A solitary radio dish under the starry sky"
            assert resp.negative_prompt_used == "blurry, distorted"

    @pytest.mark.asyncio
    async def test_generation_redirect_probe(self, monkeypatch):
        monkeypatch.setattr(image_generation_service, "IMAGE_PROVIDER", "pollinations")
        mock_response = AsyncMock()
        mock_response.status_code = 302

        with patch("httpx.AsyncClient.head", return_value=mock_response):
            resp = await image_generation_service.generate_scene_image(
                scene_id="scene_2",
                prompt="A glowing ancient artifact",
                visual_style="Anime",
            )
            assert resp.status == "success"
            assert resp.image_url is not None

    @pytest.mark.asyncio
    async def test_exception_fallback_returns_unconfigured_with_prompt_preserved(self, monkeypatch):
        monkeypatch.setattr(image_generation_service, "IMAGE_PROVIDER", "pollinations")

        with patch("httpx.AsyncClient.head", side_effect=Exception("Network failure")):
            resp = await image_generation_service.generate_scene_image(
                scene_id="scene_fail",
                prompt="Futuristic city with flying vehicles",
            )
            assert resp.status == "unconfigured"
            assert resp.prompt_used == "Futuristic city with flying vehicles"
            assert "not configured" in resp.message.lower()


class TestGenerateStoryImages:
    """Unit tests for generate_story_images."""

    @pytest.mark.asyncio
    async def test_generate_story_images_empty_list(self):
        results = await image_generation_service.generate_story_images([])
        assert results == []

    @pytest.mark.asyncio
    async def test_generate_story_images_multiple(self, monkeypatch):
        monkeypatch.setattr(image_generation_service, "IMAGE_PROVIDER", "pollinations")
        mock_response = AsyncMock()
        mock_response.status_code = 200

        scenes = [
            VisualScene(
                scene_id="s1",
                scene_number=1,
                title="Scene 1",
                description="Opening scene",
                story_excerpt="It began at dawn.",
                action="Standing on the ridge",
                image_prompt="A misty sunrise over the observatory.",
                negative_prompt="blurry, distorted",
            ),
            VisualScene(
                scene_id="s2",
                scene_number=2,
                title="Scene 2",
                description="Closing scene",
                story_excerpt="The signal ceased.",
                action="Looking at blank screen",
                image_prompt="Empty console screens in the dark.",
                negative_prompt="blurry, distorted",
            ),
        ]

        with patch("httpx.AsyncClient.head", return_value=mock_response):
            results = await image_generation_service.generate_story_images(
                scenes, visual_style="Noir"
            )
            assert len(results) == 2
            assert results[0].scene_id == "s1"
            assert results[1].scene_id == "s2"
            assert all(r.status == "success" for r in results)


class TestGenerateCharacterReference:
    """Unit tests for generate_character_reference."""

    @pytest.mark.asyncio
    async def test_generate_character_reference(self, monkeypatch):
        monkeypatch.setattr(image_generation_service, "IMAGE_PROVIDER", "pollinations")
        mock_response = AsyncMock()
        mock_response.status_code = 200

        char = CharacterVisualProfile(
            name="Lyra Mercer",
            appearance_prompt_snippet="woman with brown hair and silver lab coat",
        )

        with patch("httpx.AsyncClient.head", return_value=mock_response):
            resp = await image_generation_service.generate_character_reference(
                character=char, visual_style="Digital Art"
            )
            assert resp.scene_id == "lyra_mercer"
            assert resp.status == "success"
            assert "pollinations.ai" in resp.image_url
