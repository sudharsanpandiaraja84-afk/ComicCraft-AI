import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { ApiKeyModal } from '../components/Modals/ApiKeyModal';
import { ChapterGenerateModal } from '../components/Modals/ChapterGenerateModal';
import { ContinueStoryModal } from '../components/Modals/ContinueStoryModal';
import { ImproveStoryModal } from '../components/Modals/ImproveStoryModal';
import { RewriteStoryModal } from '../components/Modals/RewriteStoryModal';
import { RegenerateStoryModal } from '../components/Modals/RegenerateStoryModal';
import { api } from '../services/api';

vi.mock('../services/api', () => ({
  api: {
    verifyApiKey: vi.fn(),
  },
}));

describe('Modals Components (src/components/Modals/)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  /* =========================================================================
     1. ApiKeyModal
     ========================================================================= */
  describe('ApiKeyModal', () => {
    const defaultProps = {
      isOpen: true,
      onClose: vi.fn(),
      apiKey: 'test-api-key-123',
      onSaveApiKey: vi.fn(),
      isDemoMode: false,
      onToggleDemoMode: vi.fn(),
    };

    it('returns null when isOpen is false', () => {
      const { container } = render(<ApiKeyModal {...defaultProps} isOpen={false} />);
      expect(container.firstChild).toBeNull();
    });

    it('renders API key setup modal when isOpen is true', () => {
      render(<ApiKeyModal {...defaultProps} />);

      expect(screen.getByText('Google Gemini API Setup')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('AIzaSy...')).toHaveValue('test-api-key-123');
      expect(screen.getByText('Get Free Key in AI Studio')).toBeInTheDocument();
      expect(screen.getByText('Demo Mode')).toBeInTheDocument();
      expect(screen.getByText('Disabled')).toBeInTheDocument();
    });

    it('allows clearing the API key', () => {
      const onSaveApiKey = vi.fn();
      render(<ApiKeyModal {...defaultProps} onSaveApiKey={onSaveApiKey} />);

      const clearBtn = screen.getByRole('button', { name: /Clear Key/i });
      fireEvent.click(clearBtn);

      expect(screen.getByPlaceholderText('AIzaSy...')).toHaveValue('');
      expect(onSaveApiKey).toHaveBeenCalledWith('');
    });

    it('saves updated API key and closes modal', () => {
      const onSaveApiKey = vi.fn();
      const onClose = vi.fn();
      render(
        <ApiKeyModal
          {...defaultProps}
          onSaveApiKey={onSaveApiKey}
          onClose={onClose}
        />
      );

      const input = screen.getByPlaceholderText('AIzaSy...');
      fireEvent.change(input, { target: { value: 'AIzaSyNewKey123' } });

      const saveBtn = screen.getByRole('button', { name: /Save Key/i });
      fireEvent.click(saveBtn);

      expect(onSaveApiKey).toHaveBeenCalledWith('AIzaSyNewKey123');
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('handles successful API key verification via Test Connection', async () => {
      const onSaveApiKey = vi.fn();
      vi.mocked(api.verifyApiKey).mockResolvedValueOnce({
        valid: true,
        message: 'Key verified successfully! Gemini Pro is ready.',
      });

      render(<ApiKeyModal {...defaultProps} onSaveApiKey={onSaveApiKey} />);

      const testBtn = screen.getByRole('button', { name: /Test Connection/i });
      fireEvent.click(testBtn);

      await waitFor(() => {
        expect(
          screen.getByText('Key verified successfully! Gemini Pro is ready.')
        ).toBeInTheDocument();
      });
      expect(onSaveApiKey).toHaveBeenCalledWith('test-api-key-123');
    });

    it('handles failed API key verification via Test Connection', async () => {
      vi.mocked(api.verifyApiKey).mockResolvedValueOnce({
        valid: false,
        message: 'Invalid Gemini API Key.',
      });

      render(<ApiKeyModal {...defaultProps} />);

      const testBtn = screen.getByRole('button', { name: /Test Connection/i });
      fireEvent.click(testBtn);

      await waitFor(() => {
        expect(screen.getByText('Invalid Gemini API Key.')).toBeInTheDocument();
      });
    });

    it('toggles demo mode and closes modal when close button is clicked', () => {
      const onToggleDemoMode = vi.fn();
      const onClose = vi.fn();
      render(
        <ApiKeyModal
          {...defaultProps}
          onToggleDemoMode={onToggleDemoMode}
          onClose={onClose}
        />
      );

      const toggleDemoBtn = screen.getByRole('button', { name: /Disabled/i });
      fireEvent.click(toggleDemoBtn);
      expect(onToggleDemoMode).toHaveBeenCalledTimes(1);

      // Close button with X icon
      const closeButtons = screen.getAllByRole('button');
      const closeIconBtn = closeButtons.find((btn) => btn.querySelector('svg.lucide-x'));
      expect(closeIconBtn).toBeTruthy();
      fireEvent.click(closeIconBtn!);
      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });

  /* =========================================================================
     2. ChapterGenerateModal
     ========================================================================= */
  describe('ChapterGenerateModal', () => {
    const defaultProps = {
      isOpen: true,
      onClose: vi.fn(),
      nextChapterNumber: 2,
      onGenerateChapter: vi.fn(),
      isLoading: false,
    };

    it('returns null when isOpen is false', () => {
      const { container } = render(
        <ChapterGenerateModal {...defaultProps} isOpen={false} />
      );
      expect(container.firstChild).toBeNull();
    });

    it('renders chapter inputs and controls', () => {
      render(<ChapterGenerateModal {...defaultProps} />);

      expect(screen.getByText('Generate Next Chapter')).toBeInTheDocument();
      expect(screen.getByDisplayValue('2')).toBeInTheDocument();
      expect(
        screen.getByDisplayValue('Chapter 2: The Hidden Truth')
      ).toBeInTheDocument();
      expect(
        screen.getByPlaceholderText(/The protagonist deciphers the clockwork mechanism/i)
      ).toBeInTheDocument();
    });

    it('disables submit button when whatShouldHappen is empty', () => {
      render(<ChapterGenerateModal {...defaultProps} />);

      const submitBtn = screen.getByRole('button', { name: /Generate Chapter/i });
      expect(submitBtn).toBeDisabled();
    });

    it('submits chapter request when form is populated', () => {
      const onGenerateChapter = vi.fn();
      render(
        <ChapterGenerateModal
          {...defaultProps}
          onGenerateChapter={onGenerateChapter}
        />
      );

      const textarea = screen.getByPlaceholderText(
        /The protagonist deciphers the clockwork mechanism/i
      );
      fireEvent.change(textarea, {
        target: { value: 'Julian explores the sub-basement vaults.' },
      });

      // Change desired length to Long
      const longBtn = screen.getByRole('button', { name: /Long \(~2000 words\)/i });
      fireEvent.click(longBtn);

      const submitBtn = screen.getByRole('button', { name: /Generate Chapter/i });
      expect(submitBtn).not.toBeDisabled();
      fireEvent.click(submitBtn);

      expect(onGenerateChapter).toHaveBeenCalledWith(
        2,
        'Chapter 2: The Hidden Truth',
        'Julian explores the sub-basement vaults.',
        'Long'
      );
    });

    it('displays loading state when isLoading is true', () => {
      render(<ChapterGenerateModal {...defaultProps} isLoading={true} />);

      expect(screen.getByText('Writing Chapter...')).toBeInTheDocument();
      const submitBtn = screen.getByRole('button', { name: /Writing Chapter\.\.\./i });
      expect(submitBtn).toBeDisabled();
    });

    it('triggers onClose when Cancel is clicked', () => {
      const onClose = vi.fn();
      render(<ChapterGenerateModal {...defaultProps} onClose={onClose} />);

      fireEvent.click(screen.getByRole('button', { name: /Cancel/i }));
      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });

  /* =========================================================================
     3. ContinueStoryModal
     ========================================================================= */
  describe('ContinueStoryModal', () => {
    const defaultProps = {
      isOpen: true,
      onClose: vi.fn(),
      onContinue: vi.fn(),
      isLoading: false,
    };

    it('returns null when isOpen is false', () => {
      const { container } = render(
        <ContinueStoryModal {...defaultProps} isOpen={false} />
      );
      expect(container.firstChild).toBeNull();
    });

    it('renders continue story modal and quick prompt presets', () => {
      render(<ContinueStoryModal {...defaultProps} />);

      expect(
        screen.getByRole('heading', { name: /Continue Story →/i })
      ).toBeInTheDocument();
      expect(
        screen.getByText(/Preserves all characters, setting, tone, and continuity/i)
      ).toBeInTheDocument();

      expect(
        screen.getByRole('button', {
          name: /→ Continue into the immediate aftermath as the antagonist retaliates\./i,
        })
      ).toBeInTheDocument();
    });

    it('updates continuation prompt when quick preset is clicked', () => {
      render(<ContinueStoryModal {...defaultProps} />);

      const quickBtn = screen.getByRole('button', {
        name: /→ Fast-forward three days later when an unexpected visitor arrives\./i,
      });
      fireEvent.click(quickBtn);

      const textarea = screen.getByPlaceholderText(
        /Continue the story with a major plot twist/i
      );
      expect(textarea).toHaveValue(
        'Fast-forward three days later when an unexpected visitor arrives.'
      );
    });

    it('triggers onContinue with prompt and length', () => {
      const onContinue = vi.fn();
      render(<ContinueStoryModal {...defaultProps} onContinue={onContinue} />);

      const shortBtn = screen.getByRole('button', { name: /Short \(~500 words\)/i });
      fireEvent.click(shortBtn);

      const submitBtn = screen.getByRole('button', { name: /^Continue Story →$/i });
      fireEvent.click(submitBtn);

      expect(onContinue).toHaveBeenCalledWith(
        'Continue the story with a major plot twist.',
        'Short'
      );
    });

    it('displays loading state when isLoading is true', () => {
      render(<ContinueStoryModal {...defaultProps} isLoading={true} />);

      expect(screen.getByText('Continuing Story...')).toBeInTheDocument();
      const submitBtn = screen.getByRole('button', { name: /Continuing Story\.\.\./i });
      expect(submitBtn).toBeDisabled();
    });

    it('triggers onClose when Cancel is clicked', () => {
      const onClose = vi.fn();
      render(<ContinueStoryModal {...defaultProps} onClose={onClose} />);

      fireEvent.click(screen.getByRole('button', { name: /Cancel/i }));
      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });

  /* =========================================================================
     4. ImproveStoryModal
     ========================================================================= */
  describe('ImproveStoryModal', () => {
    const defaultProps = {
      isOpen: true,
      onClose: vi.fn(),
      onImprove: vi.fn(),
      isLoading: false,
    };

    it('returns null when isOpen is false', () => {
      const { container } = render(
        <ImproveStoryModal {...defaultProps} isOpen={false} />
      );
      expect(container.firstChild).toBeNull();
    });

    it('renders focus area options and handles selection', () => {
      const onImprove = vi.fn();
      render(<ImproveStoryModal {...defaultProps} onImprove={onImprove} />);

      expect(screen.getByText('Improve Story with AI')).toBeInTheDocument();
      expect(screen.getByText('Plot & Conflict')).toBeInTheDocument();
      expect(screen.getByText('Dialogue & Subtext')).toBeInTheDocument();

      // Click Dialogue focus area
      const dialogueBtn = screen.getByRole('button', { name: /Dialogue & Subtext/i });
      fireEvent.click(dialogueBtn);

      // Add specific instructions
      const textarea = screen.getByPlaceholderText(
        /Make the confrontation between the protagonist and villain/i
      );
      fireEvent.change(textarea, { target: { value: 'Make dialogue sharper.' } });

      const applyBtn = screen.getByRole('button', { name: /Apply Improvements/i });
      fireEvent.click(applyBtn);

      expect(onImprove).toHaveBeenCalledWith('Dialogue', 'Make dialogue sharper.');
    });

    it('displays loading state when isLoading is true', () => {
      render(<ImproveStoryModal {...defaultProps} isLoading={true} />);

      expect(screen.getByText('Improving Story...')).toBeInTheDocument();
      const submitBtn = screen.getByRole('button', { name: /Improving Story\.\.\./i });
      expect(submitBtn).toBeDisabled();
    });

    it('triggers onClose on Cancel', () => {
      const onClose = vi.fn();
      render(<ImproveStoryModal {...defaultProps} onClose={onClose} />);

      fireEvent.click(screen.getByRole('button', { name: /Cancel/i }));
      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });

  /* =========================================================================
     5. RewriteStoryModal
     ========================================================================= */
  describe('RewriteStoryModal', () => {
    const defaultProps = {
      isOpen: true,
      onClose: vi.fn(),
      currentGenre: 'Mystery',
      currentTone: ['Suspenseful'],
      currentStyle: 'Cinematic',
      currentEnding: 'Twist Ending',
      onRewrite: vi.fn(),
      isLoading: false,
    };

    it('returns null when isOpen is false', () => {
      const { container } = render(
        <RewriteStoryModal {...defaultProps} isOpen={false} />
      );
      expect(container.firstChild).toBeNull();
    });

    it('renders selects and handles submitting rewritten parameters', () => {
      const onRewrite = vi.fn();
      render(<RewriteStoryModal {...defaultProps} onRewrite={onRewrite} />);

      expect(screen.getByRole('heading', { name: /Rewrite Story/i })).toBeInTheDocument();

      // Change genre select
      const selects = screen.getAllByRole('combobox');
      expect(selects.length).toBe(4);

      fireEvent.change(selects[0], { target: { value: 'Horror' } });
      fireEvent.change(selects[1], { target: { value: 'Dark' } });
      fireEvent.change(selects[2], { target: { value: 'Literary' } });
      fireEvent.change(selects[3], { target: { value: 'Tragic Ending' } });

      const textarea = screen.getByPlaceholderText(
        /Infuse more gothic atmospheric terror/i
      );
      fireEvent.change(textarea, { target: { value: 'Increase ancient curse elements.' } });

      const rewriteBtn = screen.getByRole('button', { name: /^Rewrite Story$/i });
      fireEvent.click(rewriteBtn);

      expect(onRewrite).toHaveBeenCalledWith(
        'Horror',
        'Dark',
        'Literary',
        'Tragic Ending',
        'Increase ancient curse elements.'
      );
    });

    it('displays loading state when isLoading is true', () => {
      render(<RewriteStoryModal {...defaultProps} isLoading={true} />);

      expect(screen.getByText('Rewriting Story...')).toBeInTheDocument();
      const submitBtn = screen.getByRole('button', { name: /Rewriting Story\.\.\./i });
      expect(submitBtn).toBeDisabled();
    });
  });

  /* =========================================================================
     6. RegenerateStoryModal
     ========================================================================= */
  describe('RegenerateStoryModal', () => {
    const defaultProps = {
      isOpen: true,
      onClose: vi.fn(),
      originalIdea: 'A student discovers a secret room',
      genre: 'Mystery',
      onRegenerate: vi.fn(),
      isLoading: false,
    };

    it('returns null when isOpen is false', () => {
      const { container } = render(
        <RegenerateStoryModal {...defaultProps} isOpen={false} />
      );
      expect(container.firstChild).toBeNull();
    });

    it('renders regeneration options and submits chosen option', () => {
      const onRegenerate = vi.fn();
      render(<RegenerateStoryModal {...defaultProps} onRegenerate={onRegenerate} />);

      expect(
        screen.getByRole('heading', { name: /Generate Another Version/i })
      ).toBeInTheDocument();
      expect(screen.getByText('Same idea, different story')).toBeInTheDocument();

      // Select "More suspenseful"
      const suspensefulBtn = screen.getByRole('button', { name: /More suspenseful/i });
      fireEvent.click(suspensefulBtn);

      // Submit
      const submitBtn = screen.getByRole('button', { name: /Generate New Version/i });
      fireEvent.click(submitBtn);

      expect(onRegenerate).toHaveBeenCalledWith('More suspenseful', '');
    });
  });
});
