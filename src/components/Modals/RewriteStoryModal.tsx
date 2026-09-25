import React, { useState } from 'react';
import { Sparkles, X, RefreshCw } from 'lucide-react';
import { StoryGenre, StoryTone, WritingStyle, StoryEnding } from '../../types';

interface RewriteStoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentGenre: string;
  currentTone: string[];
  currentStyle: string;
  currentEnding: string;
  onRewrite: (newGenre: string, newTone: string, newStyle: string, newEnding: string, instructions: string) => void;
  isLoading: boolean;
}

export const RewriteStoryModal: React.FC<RewriteStoryModalProps> = ({
  isOpen,
  onClose,
  currentGenre,
  currentTone,
  currentStyle,
  currentEnding,
  onRewrite,
  isLoading,
}) => {
  const [newGenre, setNewGenre] = useState(currentGenre);
  const [newTone, setNewTone] = useState(currentTone[0] || 'Suspenseful');
  const [newStyle, setNewStyle] = useState(currentStyle);
  const [newEnding, setNewEnding] = useState(currentEnding);
  const [instructions, setInstructions] = useState('');

  if (!isOpen) return null;

  const genres: StoryGenre[] = [
    'Mystery', 'Fantasy', 'Science Fiction', 'Horror', 'Thriller',
    'Romance', 'Adventure', 'Comedy', 'Drama', 'Historical',
    'Crime', 'Superhero', 'Slice of Life', 'Psychological', 'Action', 'Educational'
  ];

  const tones: StoryTone[] = [
    'Suspenseful', 'Dark', 'Emotional', 'Funny', 'Romantic',
    'Inspirational', 'Serious', 'Lighthearted', 'Dramatic', 'Epic', 'Scary'
  ];

  const styles: WritingStyle[] = [
    'Cinematic', 'Literary', 'Descriptive', 'Conversational',
    'Fast-paced', 'Detailed', 'Simple', 'Professional', "Children's storytelling"
  ];

  const endings: StoryEnding[] = [
    'Twist Ending', 'Happy Ending', 'Unexpected Ending', 'Open Ending',
    'Sad Ending', 'Tragic Ending', 'AI Decides'
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 p-6 sm:p-7 shadow-2xl">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
              <RefreshCw className="w-5 h-5" />
            </span>
            <div>
              <h3 className="font-heading font-bold text-lg text-white">
                Rewrite Story
              </h3>
              <p className="text-xs text-slate-400">
                Transform the narrative with a new genre, tone, style, or ending.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">
                New Genre:
              </label>
              <select
                value={newGenre}
                onChange={(e) => setNewGenre(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-white"
              >
                {genres.map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">
                New Tone:
              </label>
              <select
                value={newTone}
                onChange={(e) => setNewTone(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-white"
              >
                {tones.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">
                Writing Style:
              </label>
              <select
                value={newStyle}
                onChange={(e) => setNewStyle(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-white"
              >
                {styles.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">
                Ending Type:
              </label>
              <select
                value={newEnding}
                onChange={(e) => setNewEnding(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-white"
              >
                {endings.map((ed) => (
                  <option key={ed} value={ed}>{ed}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1.5">
              Specific Rewrite Instructions (Optional):
            </label>
            <textarea
              rows={2}
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="e.g. Infuse more gothic atmospheric terror and shift focus to the hidden room's ancient curse..."
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={isLoading}
            onClick={() => onRewrite(newGenre, newTone, newStyle, newEnding, instructions)}
            className="px-5 py-2.5 rounded-xl font-heading font-bold text-xs bg-indigo-600 hover:bg-indigo-500 text-white shadow-glow-indigo disabled:opacity-50 flex items-center gap-2"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>{isLoading ? 'Rewriting Story...' : 'Rewrite Story'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
