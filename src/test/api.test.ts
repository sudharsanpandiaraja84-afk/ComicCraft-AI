import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { api, ApiError } from '../services/api';

describe('API Client (src/services/api.ts)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('ApiError class', () => {
    it('constructs an ApiError with message and statusCode', () => {
      const err = new ApiError('Not Found', 404);
      expect(err).toBeInstanceOf(Error);
      expect(err).toBeInstanceOf(ApiError);
      expect(err.name).toBe('ApiError');
      expect(err.message).toBe('Not Found');
      expect(err.statusCode).toBe(404);
    });

    it('allows undefined statusCode', () => {
      const err = new ApiError('General error');
      expect(err.name).toBe('ApiError');
      expect(err.message).toBe('General error');
      expect(err.statusCode).toBeUndefined();
    });
  });

  describe('handleResponse and error handling', () => {
    it('extracts detail field from error JSON response', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({
          ok: false,
          status: 400,
          json: vi.fn().mockResolvedValue({ detail: 'Invalid genre provided' }),
        })
      );

      await expect(api.generateStory({} as any)).rejects.toThrow('Invalid genre provided');
    });

    it('extracts message field if detail is missing', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({
          ok: false,
          status: 401,
          json: vi.fn().mockResolvedValue({ message: 'Invalid Gemini API key' }),
        })
      );

      await expect(api.verifyApiKey('invalid-key')).rejects.toThrow('Invalid Gemini API key');
    });

    it('falls back to status code message if response is not JSON', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({
          ok: false,
          status: 502,
          json: vi.fn().mockRejectedValue(new Error('SyntaxError: Unexpected token <')),
        })
      );

      await expect(api.getDemoStory()).rejects.toThrow('Server returned error status 502');
    });

    it('attaches the HTTP statusCode to the thrown ApiError', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({
          ok: false,
          status: 429,
          json: vi.fn().mockResolvedValue({ detail: 'Rate limit exceeded' }),
        })
      );

      try {
        await api.getDemoStory();
        expect.unreachable('Should have thrown ApiError');
      } catch (err) {
        expect(err).toBeInstanceOf(ApiError);
        expect((err as ApiError).statusCode).toBe(429);
        expect((err as ApiError).message).toBe('Rate limit exceeded');
      }
    });
  });

  describe('getHealth', () => {
    it('returns parsed health data on success', async () => {
      const mockHealth = {
        status: 'healthy',
        gemini_api_configured: true,
        demo_mode_available: true,
        version: '1.0.0',
      };
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({
          ok: true,
          json: vi.fn().mockResolvedValue(mockHealth),
        })
      );

      const result = await api.getHealth();
      expect(result).toEqual(mockHealth);
      expect(globalThis.fetch).toHaveBeenCalledWith('/api/health');
    });

    it('returns offline fallback object on network fetch failure', async () => {
      vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Network offline')));

      const result = await api.getHealth();
      expect(result).toEqual({
        status: 'offline',
        gemini_api_configured: false,
        demo_mode_available: true,
      });
    });
  });

  describe('getDemoStory', () => {
    it('fetches /api/demo and parses story payload', async () => {
      const mockStory = { title: 'The Clockwork Mystery', word_count: 500 };
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({
          ok: true,
          json: vi.fn().mockResolvedValue(mockStory),
        })
      );

      const result = await api.getDemoStory();
      expect(result).toEqual(mockStory);
      expect(globalThis.fetch).toHaveBeenCalledWith('/api/demo');
    });
  });

  describe('verifyApiKey', () => {
    it('sends POST request to /api/settings/verify-key with api_key body', async () => {
      const mockResponse = { valid: true, message: 'Key is active' };
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({
          ok: true,
          json: vi.fn().mockResolvedValue(mockResponse),
        })
      );

      const result = await api.verifyApiKey('AIzaSyTestKey123');
      expect(result).toEqual(mockResponse);
      expect(globalThis.fetch).toHaveBeenCalledWith('/api/settings/verify-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ api_key: 'AIzaSyTestKey123' }),
      });
    });
  });

  describe('Story generation and editing methods', () => {
    it('generateStory sends POST to /api/story/generate', async () => {
      const req = {
        story_idea: 'Time traveler detective',
        genre: 'Science Fiction',
        story_length: 'Short' as const,
        tones: ['Mysterious' as const],
        writing_style: 'Cinematic',
        target_audience: 'Young Adults' as const,
        ending_preference: 'Twist Ending' as const,
      };
      const mockRes = { title: 'Chrono Case' };

      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({
          ok: true,
          json: vi.fn().mockResolvedValue(mockRes),
        })
      );

      const res = await api.generateStory(req);
      expect(res).toEqual(mockRes);
      expect(globalThis.fetch).toHaveBeenCalledWith('/api/story/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(req),
      });
    });

    it('analyzeStory sends POST to /api/story/analyze', async () => {
      const req = { story_idea: 'Analysis premise' } as any;
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: vi.fn().mockResolvedValue({ summary: 'good' }) }));

      const res = await api.analyzeStory(req);
      expect(res).toEqual({ summary: 'good' });
      expect(globalThis.fetch).toHaveBeenCalledWith('/api/story/analyze', expect.any(Object));
    });

    it('improveStory sends POST to /api/story/improve', async () => {
      const req = { story: 'Old text', focus_area: 'Plot' as const };
      const mockRes = { improved_story: 'Polished text', improvements_summary: 'Fixed pacing' };

      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: vi.fn().mockResolvedValue(mockRes) }));

      const res = await api.improveStory(req);
      expect(res).toEqual(mockRes);
      expect(globalThis.fetch).toHaveBeenCalledWith('/api/story/improve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(req),
      });
    });

    it('continueStory sends POST to /api/story/continue', async () => {
      const req = { previous_story: 'Once...', continuation_prompt: 'Next morning...' };
      const mockRes = {
        continuation_title: 'Part 2',
        continuation_text: 'The sun rose...',
        transition_summary: 'Seamless continuation',
      };

      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: vi.fn().mockResolvedValue(mockRes) }));

      const res = await api.continueStory(req);
      expect(res).toEqual(mockRes);
      expect(globalThis.fetch).toHaveBeenCalledWith('/api/story/continue', expect.any(Object));
    });

    it('rewriteStory sends POST to /api/story/rewrite', async () => {
      const req = { story: 'Original', new_genre: 'Horror' };
      const mockRes = { rewritten_title: 'Spooky Tale', rewritten_story: 'Dark shadows...', notes: 'Added tension' };

      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: vi.fn().mockResolvedValue(mockRes) }));

      const res = await api.rewriteStory(req);
      expect(res).toEqual(mockRes);
      expect(globalThis.fetch).toHaveBeenCalledWith('/api/story/rewrite', expect.any(Object));
    });

    it('shortenStory sends POST to /api/story/shorten', async () => {
      const req = { story: 'Long text', target_word_count: 200 };
      const mockRes = { shortened_story: 'Brief text', word_count: 195, summary_of_cuts: 'Removed side details' };

      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: vi.fn().mockResolvedValue(mockRes) }));

      const res = await api.shortenStory(req);
      expect(res).toEqual(mockRes);
      expect(globalThis.fetch).toHaveBeenCalledWith('/api/story/shorten', expect.any(Object));
    });

    it('expandStory sends POST to /api/story/expand', async () => {
      const req = { story: 'Short text', expansion_focus: 'World-building' };
      const mockRes = { expanded_story: 'Rich text', word_count: 850, expansion_highlights: 'Expanded kingdom lore' };

      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: vi.fn().mockResolvedValue(mockRes) }));

      const res = await api.expandStory(req);
      expect(res).toEqual(mockRes);
      expect(globalThis.fetch).toHaveBeenCalledWith('/api/story/expand', expect.any(Object));
    });

    it('generateChapter sends POST to /api/story/chapter', async () => {
      const req = {
        story_title: 'Epic',
        previous_context: 'Intro',
        chapter_number: 2,
        chapter_title: 'The Abyss',
        what_should_happen: 'Descent',
        desired_length: 'Medium',
      };
      const mockRes = { chapter_number: 2, title: 'The Abyss', content: 'Descending down...', word_count: 450 };

      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: vi.fn().mockResolvedValue(mockRes) }));

      const res = await api.generateChapter(req);
      expect(res).toEqual(mockRes);
      expect(globalThis.fetch).toHaveBeenCalledWith('/api/story/chapter', expect.any(Object));
    });

    it('checkStoryQuality sends POST to /api/story/check', async () => {
      const req = { story: 'Story narrative text here' };
      const mockRes = { plot_consistency: true, originality_score: 95 };

      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: vi.fn().mockResolvedValue(mockRes) }));

      const res = await api.checkStoryQuality(req);
      expect(res).toEqual(mockRes);
      expect(globalThis.fetch).toHaveBeenCalledWith('/api/story/check', expect.any(Object));
    });

    it('editSection sends POST to /api/story/edit-section', async () => {
      const req = {
        full_story: 'Full story text',
        selected_text: 'selected paragraph',
        action: 'make_dialogue_better' as const,
      };
      const mockRes = {
        original_text: 'selected paragraph',
        replacement_text: 'polished dialogue',
        action: 'make_dialogue_better',
        explanation: 'Enriched character voices',
      };

      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: vi.fn().mockResolvedValue(mockRes) }));

      const res = await api.editSection(req);
      expect(res).toEqual(mockRes);
      expect(globalThis.fetch).toHaveBeenCalledWith('/api/story/edit-section', expect.any(Object));
    });
  });

  describe('Story Regeneration and Versioning', () => {
    it('regenerateStory sends POST to /api/story/regenerate', async () => {
      const req = {
        original_idea: 'Mystery',
        genre: 'Mystery',
        tones: ['Dark'],
        writing_style: 'Literary',
        target_audience: 'Adults',
        story_length: 'Medium',
        ending_preference: 'Twist',
        regeneration_option: 'More suspenseful',
      };
      const mockRes = { title: 'Regenerated Mystery', word_count: 600 };

      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: vi.fn().mockResolvedValue(mockRes) }));

      const res = await api.regenerateStory(req as any);
      expect(res).toEqual(mockRes);
      expect(globalThis.fetch).toHaveBeenCalledWith('/api/story/regenerate', expect.any(Object));
    });

    it('compareVersions sends POST to /api/story/compare', async () => {
      const req = {
        version_a: { version_id: 'v1', version_number: 1, title: 'V1', summary: 'S1', created_at: '', story_data: {} as any },
        version_b: { version_id: 'v2', version_number: 2, title: 'V2', summary: 'S2', created_at: '', story_data: {} as any },
      };
      const mockRes = { version_a_id: 'v1', version_b_id: 'v2', plot_differences: 'Different ending' };

      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: vi.fn().mockResolvedValue(mockRes) }));

      const res = await api.compareVersions(req as any);
      expect(res).toEqual(mockRes);
      expect(globalThis.fetch).toHaveBeenCalledWith('/api/story/compare', expect.any(Object));
    });
  });

  describe('Story Scene Extraction and Images', () => {
    it('extractStoryScenes sends POST to /api/story/scenes', async () => {
      const req = {
        story_title: 'Epic Title',
        story_text: 'Scene narrative text',
        genre: 'Fantasy',
        scope: 'Entire Story',
        target_scene_count: 3,
        visual_style: 'Cinematic',
      };
      const mockRes = { story_title: 'Epic Title', visual_style: 'Cinematic', characters: [], locations: [], scenes: [] };

      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: vi.fn().mockResolvedValue(mockRes) }));

      const res = await api.extractStoryScenes(req);
      expect(res).toEqual(mockRes);
      expect(globalThis.fetch).toHaveBeenCalledWith('/api/story/scenes', expect.any(Object));
    });

    it('getImageStatus returns status on success', async () => {
      const mockStatus = {
        status: 'configured',
        provider: 'imagen',
        supported_styles: ['Cinematic', 'Anime'],
        message: 'Ready',
      };

      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: vi.fn().mockResolvedValue(mockStatus) }));

      const res = await api.getImageStatus();
      expect(res).toEqual(mockStatus);
      expect(globalThis.fetch).toHaveBeenCalledWith('/api/images/status');
    });

    it('getImageStatus returns unconfigured fallback on error', async () => {
      vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Connection refused')));

      const res = await api.getImageStatus();
      expect(res.status).toBe('unconfigured');
      expect(res.provider).toBe('none');
      expect(res.supported_styles).toContain('Cinematic');
    });

    it('generateSceneImage sends POST to /api/images/generate', async () => {
      const req = { scene_id: 's-1', image_prompt: 'A misty clocktower' };
      const mockRes = { scene_id: 's-1', image_url: 'https://img/1.png', status: 'success' };

      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: vi.fn().mockResolvedValue(mockRes) }));

      const res = await api.generateSceneImage(req as any);
      expect(res).toEqual(mockRes);
      expect(globalThis.fetch).toHaveBeenCalledWith('/api/images/generate', expect.any(Object));
    });

    it('regenerateSceneImage sends POST to /api/images/regenerate', async () => {
      const req = { scene_id: 's-1', image_prompt: 'Darker mist' };
      const mockRes = { scene_id: 's-1', image_url: 'https://img/2.png', status: 'success' };

      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: vi.fn().mockResolvedValue(mockRes) }));

      const res = await api.regenerateSceneImage(req as any);
      expect(res).toEqual(mockRes);
      expect(globalThis.fetch).toHaveBeenCalledWith('/api/images/regenerate', expect.any(Object));
    });

    it('regenerateAllImages sends POST to /api/images/regenerate-all', async () => {
      const req = { scenes: [{ scene_id: 's-1' } as any] };
      const mockRes = [{ scene_id: 's-1', image_url: 'https://img/1.png', status: 'success' }];

      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: vi.fn().mockResolvedValue(mockRes) }));

      const res = await api.regenerateAllImages(req as any);
      expect(res).toEqual(mockRes);
      expect(globalThis.fetch).toHaveBeenCalledWith('/api/images/regenerate-all', expect.any(Object));
    });
  });
});
