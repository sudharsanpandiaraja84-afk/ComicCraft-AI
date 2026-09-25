import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { Navbar } from '../components/Navbar';

describe('Navbar Component (src/components/Navbar.tsx)', () => {
  const defaultProps = {
    currentView: 'landing' as const,
    onNavigate: vi.fn(),
    hasStory: false,
    hasApiKey: false,
    isDemoMode: false,
    onOpenApiKeyModal: vi.fn(),
    onLoadDemo: vi.fn(),
  };

  it('renders branding title and tagline', () => {
    render(<Navbar {...defaultProps} />);

    expect(screen.getByText(/StoryForge/i)).toBeInTheDocument();
    expect(screen.getByText('AI')).toBeInTheDocument();
    expect(screen.getByText('Gemini Pro')).toBeInTheDocument();
    expect(
      screen.getByText('Turn a Simple Idea Into a Complete Story.')
    ).toBeInTheDocument();
  });

  it('navigates to landing when brand is clicked', () => {
    const onNavigate = vi.fn();
    render(<Navbar {...defaultProps} onNavigate={onNavigate} />);

    const brand = screen.getByText(/StoryForge/i).closest('div[class*="cursor-pointer"]');
    expect(brand).toBeTruthy();
    fireEvent.click(brand!);
    expect(onNavigate).toHaveBeenCalledWith('landing');
  });

  it('shows demo badge only when isDemoMode is true', () => {
    const { rerender } = render(<Navbar {...defaultProps} isDemoMode={false} />);
    expect(screen.queryByText('Demo Mode')).not.toBeInTheDocument();

    rerender(<Navbar {...defaultProps} isDemoMode={true} />);
    expect(screen.getByText('Demo Mode')).toBeInTheDocument();
  });

  it('shows Story Reader link only when hasStory is true', () => {
    const { rerender } = render(<Navbar {...defaultProps} hasStory={false} />);
    expect(screen.queryByText('Story Reader')).not.toBeInTheDocument();

    rerender(<Navbar {...defaultProps} hasStory={true} />);
    expect(screen.getByText('Story Reader')).toBeInTheDocument();
  });

  it('handles navigation clicks for Home, Create Story, and Story Reader', () => {
    const onNavigate = vi.fn();
    render(<Navbar {...defaultProps} onNavigate={onNavigate} hasStory={true} />);

    fireEvent.click(screen.getByText('Home'));
    expect(onNavigate).toHaveBeenCalledWith('landing');

    fireEvent.click(screen.getByText('Create Story'));
    expect(onNavigate).toHaveBeenCalledWith('create');

    fireEvent.click(screen.getByText('Story Reader'));
    expect(onNavigate).toHaveBeenCalledWith('result');
  });

  it('highlights the active navigation link based on currentView', () => {
    const { rerender } = render(<Navbar {...defaultProps} currentView="landing" />);
    const homeBtn = screen.getByRole('button', { name: /^Home$/i });
    expect(homeBtn).toHaveClass('bg-indigo-600');

    rerender(<Navbar {...defaultProps} currentView="create" />);
    const createBtn = screen.getByRole('button', { name: /Create Story/i });
    expect(createBtn).toHaveClass('bg-indigo-600');

    rerender(<Navbar {...defaultProps} currentView="result" hasStory={true} />);
    const resultBtn = screen.getByRole('button', { name: /Story Reader/i });
    expect(resultBtn).toHaveClass('bg-indigo-600');
  });

  it('triggers onLoadDemo when Try Demo button is clicked', () => {
    const onLoadDemo = vi.fn();
    render(<Navbar {...defaultProps} onLoadDemo={onLoadDemo} />);

    const demoBtn = screen.getByTitle('Load sample pre-computed mystery story');
    fireEvent.click(demoBtn);
    expect(onLoadDemo).toHaveBeenCalledTimes(1);
  });

  it('triggers onNavigate("create") when Start Writing button is clicked', () => {
    const onNavigate = vi.fn();
    render(<Navbar {...defaultProps} onNavigate={onNavigate} />);

    const startBtn = screen.getByText('Start Writing');
    fireEvent.click(startBtn);
    expect(onNavigate).toHaveBeenCalledWith('create');
  });

  it('shows API Key Setup indicator and handles click when API key is missing', () => {
    const onOpenApiKeyModal = vi.fn();
    render(
      <Navbar
        {...defaultProps}
        hasApiKey={false}
        onOpenApiKeyModal={onOpenApiKeyModal}
      />
    );

    const apiKeyBtn = screen.getByTitle('Configure your Google Gemini API Key');
    expect(screen.getByText('API Key Setup')).toBeInTheDocument();
    expect(apiKeyBtn).toHaveClass('text-amber-300');

    fireEvent.click(apiKeyBtn);
    expect(onOpenApiKeyModal).toHaveBeenCalledTimes(1);
  });

  it('shows Gemini Connected indicator with emerald styling when API key is present', () => {
    render(<Navbar {...defaultProps} hasApiKey={true} />);

    const apiKeyBtn = screen.getByTitle('Configure your Google Gemini API Key');
    expect(screen.getByText('Gemini Connected')).toBeInTheDocument();
    expect(apiKeyBtn).toHaveClass('text-emerald-300');
  });
});
