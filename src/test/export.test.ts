import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  downloadFile,
  exportStoryTxt,
  exportStoryJson,
  exportStoryPdf,
  downloadAsTxt,
  downloadAsJson,
  downloadAsPdf,
  exportVisualStoryPdf,
  downloadSceneImage,
} from '../utils/export';
import { CompleteStoryResponse, VisualScene } from '../types';

const mockStory: CompleteStoryResponse = {
  id: 'story-123',
  title: 'The Clockwork Mystery',
  genre: 'Mystery',
  tones: ['Suspenseful', 'Dark'],
  writing_style: 'Literary',
  target_audience: 'Young Adults',
  ending_type: 'Twist Ending',
  story: 'Once upon a time in a shadowy city...',
  word_count: 550,
  reading_time: '3 min',
  blueprint: {
    title: 'The Clockwork Mystery',
    genre: 'Mystery',
    premise: 'A detective investigates a ticking mystery.',
    main_conflict: 'Time is running out to defuse the ancient clock.',
    theme: 'Redemption and vigilance',
    setting: 'Neo-Victorian Metropolis',
    main_characters: ['Detective Vance'],
    character_motivations: 'Solve the case before midnight',
    plot: {
      introduction: 'Intro scene',
      rising_action: 'Clues discovered',
      climax: 'Tower confrontation',
      falling_action: 'Clock disabled',
      resolution: 'Peace restored',
    },
    ending_type: 'Twist Ending',
  },
  characters: [
    {
      name: 'Detective Vance',
      age: '38',
      role: 'Protagonist',
      personality: 'Sharp, cynical',
      background: 'Veteran investigator',
      motivation: 'Truth',
      goal: 'Find the thief',
      fear: 'Failure',
      strength: 'Keen observation',
      weakness: 'Stubborn',
      relationships: 'Works alone',
      character_arc: 'Learns to trust partners',
    },
  ],
  quality_check: {
    plot_consistency: true,
    character_consistency: true,
    genre_alignment: true,
    story_structure: true,
    plot_coherence_score: 95,
    character_consistency_score: 92,
    genre_fidelity_score: 98,
    pacing_score: 90,
    dialogue_score: 88,
    originality_score: 94,
    strengths: ['Great atmosphere', 'Compelling hook'],
    critique: 'Tight pacing with excellent tension.',
    improvements_made: ['Polished dialogue'],
  },
  chapters: [
    {
      chapter_number: 1,
      title: 'Chapter 1: The Midnight Call',
      content: 'The phone rang at 12:01 AM.',
      word_count: 250,
    },
    {
      chapter_number: 2,
      title: 'Chapter 2: Gears in the Mist',
      content: 'Steam hissed through the iron cobblestones.',
      word_count: 300,
    },
  ],
  is_demo: false,
  created_at: '2026-09-25T12:00:00Z',
};

describe('Export Utilities (src/utils/export.ts)', () => {
  let createdBlobUrl = 'blob:http://localhost/test-blob';
  let createdElements: HTMLAnchorElement[] = [];

  beforeEach(() => {
    createdElements = [];
    vi.stubGlobal('URL', {
      createObjectURL: vi.fn(() => createdBlobUrl),
      revokeObjectURL: vi.fn(),
    });

    const originalCreateElement = document.createElement.bind(document);
    vi.spyOn(document, 'createElement').mockImplementation((tagName: string) => {
      const el = originalCreateElement(tagName);
      if (tagName.toLowerCase() === 'a') {
        vi.spyOn(el as HTMLAnchorElement, 'click').mockImplementation(() => {});
        createdElements.push(el as HTMLAnchorElement);
      }
      return el;
    });

    vi.spyOn(document.body, 'appendChild');
    vi.spyOn(document.body, 'removeChild');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('downloadFile', () => {
    it('creates an anchor, triggers download, appends, and cleans up DOM and object URL', () => {
      downloadFile('test_story.txt', 'Sample story content', 'text/plain');

      expect(URL.createObjectURL).toHaveBeenCalledTimes(1);
      expect(createdElements.length).toBe(1);

      const anchor = createdElements[0];
      expect(anchor.download).toBe('test_story.txt');
      expect(anchor.href).toBe(createdBlobUrl);
      expect(anchor.click).toHaveBeenCalledTimes(1);
      expect(document.body.appendChild).toHaveBeenCalledWith(anchor);
      expect(document.body.removeChild).toHaveBeenCalledWith(anchor);
      expect(URL.revokeObjectURL).toHaveBeenCalledWith(createdBlobUrl);
    });
  });

  describe('downloadAsTxt and exportStoryTxt', () => {
    it('aliases downloadAsTxt to exportStoryTxt', () => {
      expect(downloadAsTxt).toBe(exportStoryTxt);
    });

    it('formats chapters and downloads .txt file with sanitized name', () => {
      exportStoryTxt(mockStory);

      expect(URL.createObjectURL).toHaveBeenCalledTimes(1);
      const anchor = createdElements[0];
      expect(anchor.download).toBe('the_clockwork_mystery_story.txt');
      expect(anchor.click).toHaveBeenCalled();
    });

    it('handles stories without separate chapters by outputting the single narrative', () => {
      const singleStory: CompleteStoryResponse = {
        ...mockStory,
        chapters: [],
        story: 'A single complete narrative without chapter breaks.',
      };
      downloadAsTxt(singleStory);

      expect(URL.createObjectURL).toHaveBeenCalledTimes(1);
      const anchor = createdElements[0];
      expect(anchor.download).toBe('the_clockwork_mystery_story.txt');
    });
  });

  describe('downloadAsJson and exportStoryJson', () => {
    it('aliases downloadAsJson to exportStoryJson', () => {
      expect(downloadAsJson).toBe(exportStoryJson);
    });

    it('downloads the complete story object as JSON', () => {
      downloadAsJson(mockStory);

      expect(URL.createObjectURL).toHaveBeenCalledTimes(1);
      const anchor = createdElements[0];
      expect(anchor.download).toBe('the_clockwork_mystery_storyforge.json');
      expect(anchor.click).toHaveBeenCalled();
    });
  });

  describe('downloadAsPdf and exportStoryPdf', () => {
    it('aliases downloadAsPdf to exportStoryPdf', () => {
      expect(downloadAsPdf).toBe(exportStoryPdf);
    });

    it('opens a print window, writes HTML, and closes document stream', () => {
      const mockDocument = {
        write: vi.fn(),
        close: vi.fn(),
      };
      const mockPrintWindow = {
        document: mockDocument,
      } as unknown as Window;

      vi.spyOn(window, 'open').mockReturnValue(mockPrintWindow);

      downloadAsPdf(mockStory);

      expect(window.open).toHaveBeenCalledWith('', '_blank', 'width=950,height=800');
      expect(mockDocument.write).toHaveBeenCalledTimes(1);
      expect(mockDocument.close).toHaveBeenCalledTimes(1);

      const htmlContent = mockDocument.write.mock.calls[0][0];
      expect(htmlContent).toContain('The Clockwork Mystery');
      expect(htmlContent).toContain('Detective Vance');
      expect(htmlContent).toContain('Chapter 1: The Midnight Call');
    });

    it('alerts user when popup window is blocked by browser', () => {
      vi.spyOn(window, 'open').mockReturnValue(null);
      const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});

      exportStoryPdf(mockStory);

      expect(alertSpy).toHaveBeenCalledWith('Please allow popups to preview and save the StoryForge PDF manuscript.');
    });

    it('renders single narrative text if no chapters exist', () => {
      const mockDocument = {
        write: vi.fn(),
        close: vi.fn(),
      };
      vi.spyOn(window, 'open').mockReturnValue({ document: mockDocument } as unknown as Window);

      const singleStory = { ...mockStory, chapters: [], story: 'Paragraph 1\n\nParagraph 2' };
      exportStoryPdf(singleStory);

      const htmlContent = mockDocument.write.mock.calls[0][0];
      expect(htmlContent).toContain('<p>Paragraph 1</p>');
      expect(htmlContent).toContain('<p>Paragraph 2</p>');
    });
  });

  describe('exportVisualStoryPdf', () => {
    it('opens popup and writes visual scene blocks into HTML', () => {
      const mockDocument = {
        write: vi.fn(),
        close: vi.fn(),
      };
      vi.spyOn(window, 'open').mockReturnValue({ document: mockDocument } as unknown as Window);

      const mockScenes: VisualScene[] = [
        {
          scene_id: 'sc-1',
          scene_number: 1,
          title: 'The Ticking Tower',
          description: 'A towering clock in dense fog.',
          image_prompt: 'Moody steampunk clock tower at dusk',
          negative_prompt: 'low quality',
          characters_involved: ['Detective Vance'],
          location_name: 'Clocktower Square',
          action: 'Inspecting the base',
          camera_angle: 'Low angle',
          composition: 'Centric',
          lighting: 'Golden hour mist',
          time_of_day: 'Dusk',
          visual_style: 'Cinematic',
          mood: 'Tense',
          image_url: 'https://example.com/clock.png',
        },
      ];

      exportVisualStoryPdf(mockStory, mockScenes);

      expect(window.open).toHaveBeenCalledWith('', '_blank', 'width=1000,height=900');
      expect(mockDocument.write).toHaveBeenCalledTimes(1);
      const html = mockDocument.write.mock.calls[0][0];
      expect(html).toContain('The Ticking Tower');
      expect(html).toContain('Clocktower Square');
      expect(html).toContain('https://example.com/clock.png');
    });

    it('handles blocked popup for visual storybook', () => {
      vi.spyOn(window, 'open').mockReturnValue(null);
      const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});

      exportVisualStoryPdf(mockStory, []);

      expect(alertSpy).toHaveBeenCalledWith('Please allow popups to export the Visual Storybook PDF.');
    });
  });

  describe('downloadSceneImage', () => {
    it('fetches image, creates blob, and triggers download', async () => {
      const mockBlob = new Blob(['fake image data'], { type: 'image/png' });
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
        blob: vi.fn().mockResolvedValue(mockBlob),
      }));

      await downloadSceneImage('https://example.com/image.png', 1, 'Dramatic Climax');

      expect(globalThis.fetch).toHaveBeenCalledWith('https://example.com/image.png');
      expect(URL.createObjectURL).toHaveBeenCalledWith(mockBlob);
      expect(createdElements[0].download).toBe('scene_1_dramatic_climax.png');
    });

    it('falls back to window.open if fetch fails', async () => {
      vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Network error')));
      const openSpy = vi.spyOn(window, 'open').mockReturnValue(null);
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      await downloadSceneImage('https://example.com/fail.png', 2, 'Failed Scene');

      expect(consoleErrorSpy).toHaveBeenCalled();
      expect(openSpy).toHaveBeenCalledWith('https://example.com/fail.png', '_blank');
    });
  });
});
