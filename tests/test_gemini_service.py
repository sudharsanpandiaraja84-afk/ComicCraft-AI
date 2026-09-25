import json
from unittest.mock import AsyncMock, patch

import gemini_service
import pytest


class TestCleanAndParseJson:
    """Tests for clean_and_parse_json helper."""

    def test_parses_clean_json_object(self):
        raw = '{"key": "value", "count": 42}'
        result = gemini_service.clean_and_parse_json(raw)
        assert result == {"key": "value", "count": 42}

    def test_parses_clean_json_array(self):
        raw = '[{"name": "Alice"}, {"name": "Bob"}]'
        result = gemini_service.clean_and_parse_json(raw)
        assert isinstance(result, list)
        assert len(result) == 2
        assert result[0]["name"] == "Alice"

    def test_parses_markdown_fenced_json(self):
        raw = """```json
{
  "title": "A Space Odyssey",
  "rating": 5
}
```"""
        result = gemini_service.clean_and_parse_json(raw)
        assert result["title"] == "A Space Odyssey"
        assert result["rating"] == 5

    def test_parses_markdown_fence_without_language_specifier(self):
        raw = """```
{"status": "ok"}
```"""
        result = gemini_service.clean_and_parse_json(raw)
        assert result == {"status": "ok"}

    def test_parses_json_surrounded_by_commentary(self):
        raw = """Here is the story blueprint you requested:
```json
{
  "title": "Echoes of Eternity"
}
```
I hope you enjoy it!"""
        result = gemini_service.clean_and_parse_json(raw)
        assert result == {"title": "Echoes of Eternity"}

    def test_parses_unfenced_json_embedded_in_text(self):
        raw = """Sure, here is your result:
{"message": "Hello World", "code": 200}
Let me know if you need more."""
        result = gemini_service.clean_and_parse_json(raw)
        assert result == {"message": "Hello World", "code": 200}

    def test_parses_unfenced_array_embedded_in_text(self):
        raw = """Results are: [1, 2, 3, 4] thank you!"""
        result = gemini_service.clean_and_parse_json(raw)
        assert result == [1, 2, 3, 4]

    def test_handles_trailing_commas_in_object(self):
        raw = '{"title": "Test", "count": 10,}'
        result = gemini_service.clean_and_parse_json(raw)
        assert result == {"title": "Test", "count": 10}

    def test_handles_trailing_commas_in_array(self):
        raw = '["apple", "banana", "cherry",]'
        result = gemini_service.clean_and_parse_json(raw)
        assert result == ["apple", "banana", "cherry"]

    def test_handles_nested_trailing_commas(self):
        raw = """{
            "items": ["a", "b",],
            "details": {"key": "val",},
        }"""
        result = gemini_service.clean_and_parse_json(raw)
        assert result == {"items": ["a", "b"], "details": {"key": "val"}}

    def test_raises_value_error_on_empty_string(self):
        with pytest.raises(ValueError, match="Empty response received"):
            gemini_service.clean_and_parse_json("")

    def test_raises_value_error_on_none_or_whitespace(self):
        with pytest.raises(ValueError, match="Empty response received"):
            gemini_service.clean_and_parse_json("   \n\t  ")

    def test_raises_json_decode_error_on_invalid_string(self):
        with pytest.raises(json.JSONDecodeError):
            gemini_service.clean_and_parse_json("This is definitely not JSON { broken")


class TestGetGeminiApiKey:
    """Tests for get_gemini_api_key retrieval."""

    def test_returns_override_key_when_provided(self, monkeypatch):
        monkeypatch.setenv("GEMINI_API_KEY", "env_secret_key")
        result = gemini_service.get_gemini_api_key("override_key_123")
        assert result == "override_key_123"

    def test_strips_whitespace_from_override_key(self):
        result = gemini_service.get_gemini_api_key("  custom_key_padded  ")
        assert result == "custom_key_padded"

    def test_returns_env_key_when_no_override_provided(self, monkeypatch):
        monkeypatch.setenv("GEMINI_API_KEY", "env_api_key_xyz")
        result = gemini_service.get_gemini_api_key(None)
        assert result == "env_api_key_xyz"

    def test_returns_env_key_when_override_is_empty_or_whitespace(self, monkeypatch):
        monkeypatch.setenv("GEMINI_API_KEY", "env_api_key_xyz")
        assert gemini_service.get_gemini_api_key("") == "env_api_key_xyz"
        assert gemini_service.get_gemini_api_key("   ") == "env_api_key_xyz"

    def test_returns_none_when_both_override_and_env_are_empty(self, monkeypatch):
        monkeypatch.delenv("GEMINI_API_KEY", raising=False)
        assert gemini_service.get_gemini_api_key(None) is None
        assert gemini_service.get_gemini_api_key("") is None
        assert gemini_service.get_gemini_api_key("   ") is None


class TestVerifyGeminiKey:
    """Tests for verify_gemini_key function."""

    @pytest.mark.asyncio
    async def test_returns_invalid_when_key_is_empty(self):
        result = await gemini_service.verify_gemini_key("")
        assert result["valid"] is False
        assert "empty" in result["message"].lower()

    @pytest.mark.asyncio
    async def test_returns_invalid_when_key_is_whitespace(self):
        result = await gemini_service.verify_gemini_key("   ")
        assert result["valid"] is False
        assert "empty" in result["message"].lower()

    @pytest.mark.asyncio
    async def test_successful_verification(self):
        mock_response = AsyncMock()
        mock_response.status_code = 200

        with patch("httpx.AsyncClient.post", return_value=mock_response):
            result = await gemini_service.verify_gemini_key("AIzaSyD-valid-mock-key")
            assert result["valid"] is True
            assert "valid" in result["message"].lower() or "connected" in result["message"].lower()

    @pytest.mark.asyncio
    async def test_failed_verification_status_code(self):
        mock_response = AsyncMock()
        mock_response.status_code = 400
        mock_response.text = "API_KEY_INVALID"

        with patch("httpx.AsyncClient.post", return_value=mock_response):
            result = await gemini_service.verify_gemini_key("invalid-key")
            assert result["valid"] is False
            assert "400" in result["message"]
