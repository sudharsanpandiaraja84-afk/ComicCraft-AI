import {
  StoryGenerateRequest,
  CompleteStoryResponse,
  StoryImproveRequest,
  StoryContinueRequest,
  StoryRewriteRequest,
  StoryShortenRequest,
  StoryExpandRequest,
  ChapterGenerateRequest,
  Chapter,
  SectionEditRequest,
  SectionEditResponse,
  QualityCheckReport,
  RegenerateStoryRequest,
  CompareVersionsRequest,
  VersionComparisonResult,
  StorySceneExtractionRequest,
  StorySceneExtractionResponse,
  ImageGenerateRequest,
  ImageRegenerateRequest,
  ImageRegenerateAllRequest,
  GeneratedImageResponse
} from '../types';

const API_BASE = '/api';

export class ApiError extends Error {
  statusCode?: number;
  constructor(message: string, statusCode?: number) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
  }
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let errorDetail = 'Unknown API error';
    try {
      const errJson = await res.json();
      errorDetail = errJson.detail || errJson.message || errorDetail;
    } catch {
      errorDetail = `Server returned error status ${res.status}`;
    }
    throw new ApiError(errorDetail, res.status);
  }
  return res.json() as Promise<T>;
}

export const api = {
  async getHealth(): Promise<{ status: string; gemini_api_configured: boolean; demo_mode_available: boolean; version?: string }> {
    try {
      const res = await fetch(`${API_BASE}/health`);
      return await handleResponse(res);
    } catch {
      return { status: 'offline', gemini_api_configured: false, demo_mode_available: true };
    }
  },

  async getDemoStory(): Promise<CompleteStoryResponse> {
    const res = await fetch(`${API_BASE}/demo`);
    return await handleResponse<CompleteStoryResponse>(res);
  },

  async verifyApiKey(apiKey: string): Promise<{ valid: boolean; message: string }> {
    const res = await fetch(`${API_BASE}/settings/verify-key`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ api_key: apiKey }),
    });
    return await handleResponse(res);
  },

  async generateStory(req: StoryGenerateRequest): Promise<CompleteStoryResponse> {
    const res = await fetch(`${API_BASE}/story/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req),
    });
    return await handleResponse<CompleteStoryResponse>(res);
  },

  async analyzeStory(req: StoryGenerateRequest): Promise<any> {
    const res = await fetch(`${API_BASE}/story/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req),
    });
    return await handleResponse(res);
  },

  async improveStory(req: StoryImproveRequest): Promise<{ improved_story: string; improvements_summary: string }> {
    const res = await fetch(`${API_BASE}/story/improve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req),
    });
    return await handleResponse<{ improved_story: string; improvements_summary: string }>(res);
  },

  async continueStory(req: StoryContinueRequest): Promise<{ continuation_title: string; continuation_text: string; transition_summary: string }> {
    const res = await fetch(`${API_BASE}/story/continue`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req),
    });
    return await handleResponse<{ continuation_title: string; continuation_text: string; transition_summary: string }>(res);
  },

  async rewriteStory(req: StoryRewriteRequest): Promise<{ rewritten_title: string; rewritten_story: string; notes: string }> {
    const res = await fetch(`${API_BASE}/story/rewrite`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req),
    });
    return await handleResponse<{ rewritten_title: string; rewritten_story: string; notes: string }>(res);
  },

  async shortenStory(req: StoryShortenRequest): Promise<{ shortened_story: string; word_count: number; summary_of_cuts: string }> {
    const res = await fetch(`${API_BASE}/story/shorten`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req),
    });
    return await handleResponse<{ shortened_story: string; word_count: number; summary_of_cuts: string }>(res);
  },

  async expandStory(req: StoryExpandRequest): Promise<{ expanded_story: string; word_count: number; expansion_highlights: string }> {
    const res = await fetch(`${API_BASE}/story/expand`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req),
    });
    return await handleResponse<{ expanded_story: string; word_count: number; expansion_highlights: string }>(res);
  },

  async generateChapter(req: ChapterGenerateRequest): Promise<Chapter> {
    const res = await fetch(`${API_BASE}/story/chapter`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req),
    });
    return await handleResponse<Chapter>(res);
  },

  async checkStoryQuality(payload: { story: string; blueprint?: any; characters?: any; api_key?: string }): Promise<QualityCheckReport> {
    const res = await fetch(`${API_BASE}/story/check`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return await handleResponse<QualityCheckReport>(res);
  },

  async editSection(req: SectionEditRequest): Promise<SectionEditResponse> {
    const res = await fetch(`${API_BASE}/story/edit-section`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req),
    });
    return await handleResponse<SectionEditResponse>(res);
  },

  // Feature 1: Regenerate Story
  async regenerateStory(req: RegenerateStoryRequest): Promise<CompleteStoryResponse> {
    const res = await fetch(`${API_BASE}/story/regenerate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req),
    });
    return await handleResponse<CompleteStoryResponse>(res);
  },

  // Feature 1: Compare Versions
  async compareVersions(req: CompareVersionsRequest): Promise<VersionComparisonResult> {
    const res = await fetch(`${API_BASE}/story/compare`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req),
    });
    return await handleResponse<VersionComparisonResult>(res);
  },

  // Feature 2: Story Scenes Extraction & Character Profiles
  async extractStoryScenes(req: StorySceneExtractionRequest): Promise<StorySceneExtractionResponse> {
    const res = await fetch(`${API_BASE}/story/scenes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req),
    });
    return await handleResponse<StorySceneExtractionResponse>(res);
  },

  // Feature 2: Image Generation Status
  async getImageStatus(): Promise<{ status: string; provider: string; supported_styles: string[]; message: string }> {
    try {
      const res = await fetch(`${API_BASE}/images/status`);
      return await handleResponse(res);
    } catch {
      return {
        status: 'unconfigured',
        provider: 'none',
        supported_styles: ['Cinematic', 'Anime', 'Manga', 'Digital Art', 'Realistic', 'Fantasy', 'Cyberpunk'],
        message: 'Image generation is not configured yet.'
      };
    }
  },

  // Feature 2: Generate Scene Image
  async generateSceneImage(req: ImageGenerateRequest): Promise<GeneratedImageResponse> {
    const res = await fetch(`${API_BASE}/images/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req),
    });
    return await handleResponse<GeneratedImageResponse>(res);
  },

  // Feature 2: Regenerate Individual Scene Image
  async regenerateSceneImage(req: ImageRegenerateRequest): Promise<GeneratedImageResponse> {
    const res = await fetch(`${API_BASE}/images/regenerate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req),
    });
    return await handleResponse<GeneratedImageResponse>(res);
  },

  // Feature 2: Regenerate All Scene Images
  async regenerateAllImages(req: ImageRegenerateAllRequest): Promise<GeneratedImageResponse[]> {
    const res = await fetch(`${API_BASE}/images/regenerate-all`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req),
    });
    return await handleResponse<GeneratedImageResponse[]>(res);
  }
};
