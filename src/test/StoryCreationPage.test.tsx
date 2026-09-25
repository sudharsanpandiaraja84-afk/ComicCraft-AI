import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { StoryCreationPage } from '../components/StoryCreationPage';

describe('StoryCreationPage Component (src/components/StoryCreationPage.tsx)', () => {
  const defaultProps = {
    onGenerate: vi.fn(),
    isGenerating: false,
    onLoadDemo: vi.fn(),
    isDemoMode: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders page header and main sections', () => {
    render(<StoryCreationPage {...defaultProps} />);

    expect(screen.getByRole('heading', { name: 'Create Your Story' })).toBeInTheDocument();
    expect(screen.getByText(/1\. Story Idea/i)).toBeInTheDocument();
    expect(screen.getByText(/2\. Select Primary Genre/i)).toBeInTheDocument();
    expect(screen.getByText(/3\. Story Customization Settings/i)).toBeInTheDocument();
    expect(screen.getByText(/4\. Characters \(Optional\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Advanced Story Controls/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /✨ Generate My Story/i })).toBeInTheDocument();
  });

  it('handles typing in story idea and updates character counter', () => {
    render(<StoryCreationPage {...defaultProps} />);

    const textarea = screen.getByPlaceholderText(/Enter your short story idea/i);
    expect(screen.getByText('0 characters')).toBeInTheDocument();

    fireEvent.change(textarea, { target: { value: 'A mysterious key found in an old clock.' } });
    expect(textarea).toHaveValue('A mysterious key found in an old clock.');
    expect(screen.getByText(/39 characters/i)).toBeInTheDocument();
  });

  it('shows validation error when attempting to generate with an empty story idea', () => {
    // mock scrollIntoView
    window.HTMLElement.prototype.scrollIntoView = vi.fn();

    render(<StoryCreationPage {...defaultProps} />);

    const submitBtn = screen.getByRole('button', { name: /✨ Generate My Story/i });
    fireEvent.click(submitBtn);

    expect(
      screen.getByText('Please enter a story idea before generating.')
    ).toBeInTheDocument();
    expect(defaultProps.onGenerate).not.toHaveBeenCalled();
  });

  it('fills fields when quick inspiration preset prompt is clicked', () => {
    render(<StoryCreationPage {...defaultProps} />);

    const inspirationBtn = screen.getByRole('button', { name: /Deep Space Relay/i });
    fireEvent.click(inspirationBtn);

    const textarea = screen.getByPlaceholderText(/Enter your short story idea/i);
    expect(textarea).toHaveValue(
      'A lonely technician stationed on an isolated Kuiper Belt relay intercepts an encrypted transmission originating from Earth—sent 200 years from now.'
    );
    expect(screen.getByText(/Selected: Science Fiction/i)).toBeInTheDocument();
  });

  it('allows selecting different genres including custom genre', () => {
    render(<StoryCreationPage {...defaultProps} />);

    expect(screen.getByText(/Selected: Mystery/i)).toBeInTheDocument();

    // Select Fantasy
    const fantasyBtn = screen.getByRole('button', { name: /Fantasy/i });
    fireEvent.click(fantasyBtn);
    expect(screen.getByText(/Selected: Fantasy/i)).toBeInTheDocument();

    // Select Custom Genre
    const customGenreBtn = screen.getByRole('button', { name: /Custom Genre/i });
    fireEvent.click(customGenreBtn);
    expect(screen.getByText(/Selected: Custom Genre/i)).toBeInTheDocument();

    // Custom genre text input should appear
    const customInput = screen.getByPlaceholderText(/e\.g\., Cyberpunk Solarpunk Noir/i);
    expect(customInput).toBeInTheDocument();
    fireEvent.change(customInput, { target: { value: 'Gothic Noir Fantasy' } });
    expect(customInput).toHaveValue('Gothic Noir Fantasy');
  });

  it('allows toggling tone pills and keeps at least one tone active', () => {
    render(<StoryCreationPage {...defaultProps} />);

    // Default tones selected: Suspenseful, Mysterious
    expect(screen.getByText(/2 selected/i)).toBeInTheDocument();

    // Add Dark tone
    const darkBtn = screen.getByRole('button', { name: /^Dark$/i });
    fireEvent.click(darkBtn);
    expect(screen.getByText(/3 selected/i)).toBeInTheDocument();

    // Remove Dark tone
    const darkActiveBtn = screen.getByRole('button', { name: /✓ Dark/i });
    fireEvent.click(darkActiveBtn);
    expect(screen.getByText(/2 selected/i)).toBeInTheDocument();

    // Remove Suspenseful
    const suspensefulBtn = screen.getByRole('button', { name: /✓ Suspenseful/i });
    fireEvent.click(suspensefulBtn);
    expect(screen.getByText(/1 selected/i)).toBeInTheDocument();

    // Trying to remove Mysterious (last remaining tone) should not unselect it
    const mysteriousBtn = screen.getByRole('button', { name: /✓ Mysterious/i });
    fireEvent.click(mysteriousBtn);
    expect(screen.getByText(/1 selected/i)).toBeInTheDocument();
  });

  it('allows selecting length, writing style, audience, and ending preference', () => {
    render(<StoryCreationPage {...defaultProps} />);

    // Length
    const longLengthBtn = screen.getByRole('button', { name: /Long 3,000–5,000 words/i });
    fireEvent.click(longLengthBtn);

    // Style
    const literaryBtn = screen.getByRole('button', { name: /Literary/i });
    fireEvent.click(literaryBtn);

    // Custom Style
    const customStyleBtn = screen.getByRole('button', { name: /Custom Style/i });
    fireEvent.click(customStyleBtn);
    const customStyleInput = screen.getByPlaceholderText(/Describe your writing style/i);
    expect(customStyleInput).toBeInTheDocument();
    fireEvent.change(customStyleInput, { target: { value: 'Poetic Victorian' } });

    // Target Audience
    const audienceBtn = screen.getByRole('button', { name: /^Adults$/i });
    fireEvent.click(audienceBtn);

    // Ending
    const happyEndingBtn = screen.getByRole('button', { name: /Happy Ending/i });
    fireEvent.click(happyEndingBtn);
  });

  it('supports adding and deleting custom characters', () => {
    render(<StoryCreationPage {...defaultProps} />);

    // Click "Add Character"
    const addCharBtn = screen.getByRole('button', { name: /Add Character/i });
    fireEvent.click(addCharBtn);

    expect(screen.getByText('New Character Details')).toBeInTheDocument();

    // Fill character details
    const nameInput = screen.getByPlaceholderText('e.g. Arun');
    const ageInput = screen.getByPlaceholderText('e.g. 20');
    const personalityInput = screen.getByPlaceholderText('e.g. Curious, brave, analytical');
    const detailsInput = screen.getByPlaceholderText('e.g. Carries an antique pocket watch');

    fireEvent.change(nameInput, { target: { value: 'Detective Vance' } });
    fireEvent.change(ageInput, { target: { value: '45' } });
    fireEvent.change(personalityInput, { target: { value: 'Sharp, cynical' } });
    fireEvent.change(detailsInput, { target: { value: 'Wears a trench coat' } });

    // Save character
    const saveBtn = screen.getByRole('button', { name: /Save Character/i });
    fireEvent.click(saveBtn);

    // Check rendered character card
    expect(screen.getByText('Detective Vance')).toBeInTheDocument();
    expect(screen.getByText(/Protagonist • 45/i)).toBeInTheDocument();
    expect(screen.getByText('Sharp, cynical')).toBeInTheDocument();
    expect(screen.getByText('Wears a trench coat')).toBeInTheDocument();

    // Form should be closed
    expect(screen.queryByText('New Character Details')).not.toBeInTheDocument();

    // Delete character
    const trashBtn = screen.getByRole('button', { name: '' }); // Trash icon button
    fireEvent.click(trashBtn);
    expect(screen.queryByText('Detective Vance')).not.toBeInTheDocument();
  });

  it('allows canceling character creation', () => {
    render(<StoryCreationPage {...defaultProps} />);

    const addCharBtn = screen.getByRole('button', { name: /Add Character/i });
    fireEvent.click(addCharBtn);

    const cancelBtn = screen.getByRole('button', { name: /Cancel/i });
    fireEvent.click(cancelBtn);

    expect(screen.queryByText('New Character Details')).not.toBeInTheDocument();
  });

  it('toggles advanced story controls accordion and edits options', () => {
    render(<StoryCreationPage {...defaultProps} />);

    const advancedAccordion = screen.getByRole('button', { name: /Advanced Story Controls/i });

    // Initially collapsed
    expect(screen.queryByText(/Setting \/ Environment/i)).not.toBeInTheDocument();

    // Open accordion
    fireEvent.click(advancedAccordion);
    expect(screen.getByText(/Setting \/ Environment/i)).toBeInTheDocument();

    // Set setting
    const settingInput = screen.getByPlaceholderText(/e\.g\. Subterranean university archives/i);
    fireEvent.change(settingInput, { target: { value: 'Cyberpunk Metropolis' } });
    expect(settingInput).toHaveValue('Cyberpunk Metropolis');

    // Close accordion
    fireEvent.click(advancedAccordion);
    expect(screen.queryByText(/Setting \/ Environment/i)).not.toBeInTheDocument();
  });

  it('submits form with expected payload when valid', () => {
    const onGenerate = vi.fn();
    render(<StoryCreationPage {...defaultProps} onGenerate={onGenerate} />);

    const textarea = screen.getByPlaceholderText(/Enter your short story idea/i);
    fireEvent.change(textarea, { target: { value: 'A forgotten journal reveals an impending eclipse anomaly.' } });

    const submitBtn = screen.getByRole('button', { name: /✨ Generate My Story/i });
    fireEvent.click(submitBtn);

    expect(onGenerate).toHaveBeenCalledTimes(1);
    const payload = onGenerate.mock.calls[0][0];
    expect(payload.story_idea).toBe('A forgotten journal reveals an impending eclipse anomaly.');
    expect(payload.genre).toBe('Mystery');
    expect(payload.story_length).toBe('Medium');
    expect(payload.tones).toEqual(['Suspenseful', 'Mysterious']);
    expect(payload.writing_style).toBe('Cinematic');
    expect(payload.target_audience).toBe('Young Adults');
    expect(payload.ending_preference).toBe('Twist Ending');
    expect(payload.demo_mode).toBe(false);
  });

  it('disables submit button when isGenerating is true', () => {
    render(<StoryCreationPage {...defaultProps} isGenerating={true} />);

    const submitBtn = screen.getByRole('button', { name: /✨ Generate My Story/i });
    expect(submitBtn).toBeDisabled();
  });

  it('triggers onLoadDemo when clicking Load Sample Mystery', () => {
    const onLoadDemo = vi.fn();
    render(<StoryCreationPage {...defaultProps} onLoadDemo={onLoadDemo} />);

    const loadDemoBtn = screen.getByRole('button', { name: /Load Sample Mystery/i });
    fireEvent.click(loadDemoBtn);
    expect(onLoadDemo).toHaveBeenCalledTimes(1);
  });
});
