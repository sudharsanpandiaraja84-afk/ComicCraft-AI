import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { LandingPage } from '../components/LandingPage';

describe('LandingPage Component (src/components/LandingPage.tsx)', () => {
  const defaultProps = {
    onStartWriting: vi.fn(),
    onTryDemo: vi.fn(),
  };

  it('renders hero title, tagline, and subtitle', () => {
    render(<LandingPage {...defaultProps} />);

    // Tagline pill
    expect(screen.getByText('StoryForge AI')).toBeInTheDocument();
    expect(
      screen.getByText('Turn a Simple Idea Into a Complete Story.')
    ).toBeInTheDocument();

    // Hero title
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      /Turn Your Ideas/i
    );
    expect(screen.getByText('Into Stories')).toBeInTheDocument();

    // Subtitle
    expect(
      screen.getByText(
        'Give us a simple idea. Choose your genre. Let AI build the complete story.'
      )
    ).toBeInTheDocument();
  });

  it('triggers onStartWriting when hero Start Writing button is clicked', () => {
    const onStartWriting = vi.fn();
    render(<LandingPage {...defaultProps} onStartWriting={onStartWriting} />);

    const startWritingBtn = screen.getByRole('button', { name: /Start Writing$/i });
    fireEvent.click(startWritingBtn);
    expect(onStartWriting).toHaveBeenCalledTimes(1);
  });

  it('triggers onTryDemo when hero Try Demo button is clicked', () => {
    const onTryDemo = vi.fn();
    render(<LandingPage {...defaultProps} onTryDemo={onTryDemo} />);

    const tryDemoBtn = screen.getByRole('button', { name: /Try Demo/i });
    fireEvent.click(tryDemoBtn);
    expect(onTryDemo).toHaveBeenCalledTimes(1);
  });

  it('triggers onStartWriting when footer Start Writing Now button is clicked', () => {
    const onStartWriting = vi.fn();
    render(<LandingPage {...defaultProps} onStartWriting={onStartWriting} />);

    const footerStartBtn = screen.getByRole('button', { name: /Start Writing Now/i });
    fireEvent.click(footerStartBtn);
    expect(onStartWriting).toHaveBeenCalledTimes(1);
  });

  it('triggers onTryDemo when footer Explore Demo Story button is clicked', () => {
    const onTryDemo = vi.fn();
    render(<LandingPage {...defaultProps} onTryDemo={onTryDemo} />);

    const exploreDemoBtn = screen.getByRole('button', { name: /Explore Demo Story/i });
    fireEvent.click(exploreDemoBtn);
    expect(onTryDemo).toHaveBeenCalledTimes(1);
  });

  it('renders the interactive showcase preview card with details', () => {
    render(<LandingPage {...defaultProps} />);

    expect(
      screen.getByText('StoryForge Interactive Generation')
    ).toBeInTheDocument();
    expect(screen.getByText('AI Quality Passed')).toBeInTheDocument();
    expect(screen.getByText('The Whispering Archives')).toBeInTheDocument();
    expect(screen.getByText(/1,021 words • 6 min read/i)).toBeInTheDocument();
    expect(screen.getByText('Julian Hayes')).toBeInTheDocument();
    expect(screen.getByText('Dr. Eleanor Vance')).toBeInTheDocument();
    expect(screen.getByText('Silas Reed')).toBeInTheDocument();
  });

  it('renders all 6 feature cards', () => {
    render(<LandingPage {...defaultProps} />);

    expect(screen.getByText('AI Story Generation')).toBeInTheDocument();
    expect(screen.getByText('Genre Intelligence')).toBeInTheDocument();
    expect(screen.getByText('Character Development')).toBeInTheDocument();
    expect(screen.getByText('Story Structure')).toBeInTheDocument();
    expect(screen.getByText('Custom Writing Styles')).toBeInTheDocument();
    expect(screen.getByText('Smart Story Expansion')).toBeInTheDocument();
  });

  it('renders the structured 6-step narrative pipeline', () => {
    render(<LandingPage {...defaultProps} />);

    expect(screen.getByText('Structured AI Pipeline')).toBeInTheDocument();
    expect(
      screen.getByText('From Raw Idea to Finished Manuscript')
    ).toBeInTheDocument();

    expect(screen.getByText('Input Analysis')).toBeInTheDocument();
    expect(screen.getByText('Story Blueprint')).toBeInTheDocument();
    expect(screen.getByText('Character Bible')).toBeInTheDocument();
    expect(screen.getByText('Full Story Draft')).toBeInTheDocument();
    expect(screen.getByText('Quality Check')).toBeInTheDocument();
    expect(screen.getByText('Interactive Studio')).toBeInTheDocument();
  });

  it('renders the footer CTA section', () => {
    render(<LandingPage {...defaultProps} />);

    expect(
      screen.getByText('Ready to Forge Your Next Masterpiece?')
    ).toBeInTheDocument();
  });
});
