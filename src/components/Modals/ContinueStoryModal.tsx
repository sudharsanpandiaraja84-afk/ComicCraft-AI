import React, { useState } from 'react';
import { Sparkles, X, ArrowRight, BookOpen } from 'lucide-react';

interface ContinueStoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onContinue: (prompt: string, length: string) => void;
  isLoading: boolean;
}

export const ContinueStoryModal: React.FC<ContinueStoryModalProps> = ({
  isOpen,
  onClose,
  onContinue,
  isLoading,
}) => {
  const [continuationPrompt, setContinuationPrompt] = useState(
    'Continue the story with a major plot twist.'
  );
  const [targetLength, setTargetLength] = useState('Medium');

  if (!isOpen) return null;

  const quickPrompts = [
    'Continue the story with a major plot twist.',
    'Continue into the immediate aftermath as the antagonist retaliates.',
    'Fast-forward three days later when an unexpected visitor arrives.',
    'Continue with a dangerous investigation into the underground tunnels.',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 p-6 sm:p-7 shadow-2xl">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
              <BookOpen className="w-5 h-5 text-amber-400" />
            </span>
            <div>
              <h3 className="font-heading font-bold text-lg text-white">
                Continue Story →
              </h3>
              <p className="text-xs text-slate-400">
                Preserves all characters, setting, tone, and continuity.
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
          <div>
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-1.5">
              What should happen next?
            </label>
            <textarea
              rows={3}
              value={continuationPrompt}
              onChange={(e) => setContinuationPrompt(e.target.value)}
              placeholder="e.g. Continue the story with a major plot twist..."
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Quick preset suggestions */}
          <div>
            <span className="text-[11px] font-semibold text-slate-400 block mb-1.5">
              Quick Continuation Prompts:
            </span>
            <div className="space-y-1.5">
              {quickPrompts.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setContinuationPrompt(p)}
                  className="w-full text-left p-2 rounded-lg text-xs bg-slate-950/60 hover:bg-slate-800/80 text-slate-300 border border-slate-800 transition-colors"
                >
                  &rarr; {p}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-1.5">
              Desired Continuation Length:
            </label>
            <div className="grid grid-cols-3 gap-2">
              {['Short (~500 words)', 'Medium (~1000 words)', 'Long (~2000 words)'].map((l) => {
                const val = l.split(' ')[0];
                return (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setTargetLength(val)}
                    className={`p-2 rounded-lg border text-center text-xs font-medium transition-all ${
                      targetLength === val
                        ? 'bg-indigo-600/20 border-indigo-500 text-white'
                        : 'bg-slate-950/50 border-slate-800 text-slate-400'
                    }`}
                  >
                    {l}
                  </button>
                );
              })}
            </div>
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
            disabled={isLoading || !continuationPrompt.trim()}
            onClick={() => onContinue(continuationPrompt, targetLength)}
            className="px-5 py-2.5 rounded-xl font-heading font-bold text-xs bg-indigo-600 hover:bg-indigo-500 text-white shadow-glow-indigo disabled:opacity-50 flex items-center gap-2"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>{isLoading ? 'Continuing Story...' : 'Continue Story →'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
