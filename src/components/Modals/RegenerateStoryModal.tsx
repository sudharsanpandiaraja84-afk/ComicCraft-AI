import React, { useState } from 'react';
import { RefreshCw, X, Sparkles, Wand2 } from 'lucide-react';
import { RegenerationOption } from '../../types';

interface RegenerateStoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  originalIdea: string;
  genre: string;
  onRegenerate: (option: RegenerationOption, customInstruction: string) => void;
  isLoading: boolean;
}

export const RegenerateStoryModal: React.FC<RegenerateStoryModalProps> = ({
  isOpen,
  onClose,
  originalIdea,
  genre,
  onRegenerate,
  isLoading,
}) => {
  const [selectedOption, setSelectedOption] = useState<RegenerationOption>('Same idea, different story');
  const [customInstruction, setCustomInstruction] = useState('');

  if (!isOpen) return null;

  const regenerationOptions: { id: RegenerationOption; label: string; desc: string }[] = [
    {
      id: 'Same idea, different story',
      label: 'Same idea, different story',
      desc: 'Keep the premise, but create an entirely distinct narrative arc and discovery.'
    },
    {
      id: 'More suspenseful',
      label: 'More suspenseful',
      desc: 'Heighten peril, ticking-clock tension, and psychological dread.'
    },
    {
      id: 'More emotional',
      label: 'More emotional',
      desc: 'Deepen character vulnerability, internal stakes, and poignant moments.'
    },
    {
      id: 'More detailed',
      label: 'More detailed',
      desc: 'Richer atmospheric world-building, sensory textures, and dialogue depth.'
    },
    {
      id: 'More creative',
      label: 'More creative',
      desc: 'Unconventional narrative devices, surprising twists, and surreal flair.'
    },
    {
      id: 'Different plot twist',
      label: 'Different plot twist',
      desc: 'Subvert expectations with an unpredictable revelation or betrayal.'
    },
    {
      id: 'Different ending',
      label: 'Different ending',
      desc: 'Take the climax and resolution in an unexpected, satisfying new direction.'
    },
    {
      id: 'Completely fresh interpretation',
      label: 'Completely fresh interpretation',
      desc: 'Re-imagine the premise with alternative protagonists and conflict.'
    }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onRegenerate(selectedOption, customInstruction.trim());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-xl rounded-2xl bg-slate-900 border border-slate-800 p-6 sm:p-7 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <RefreshCw className="w-5 h-5 text-indigo-400" />
            </span>
            <div>
              <h2 className="font-heading font-extrabold text-lg text-white">
                Generate Another Version
              </h2>
              <p className="text-xs text-slate-400">
                Craft a brand new interpretation without copying previous scenes or characters
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-4 overflow-y-auto pr-1 flex-1">
          {/* Premise reminder */}
          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="font-semibold text-slate-300">Original Idea & Genre:</span>
              <span className="px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-500/30 text-[11px] font-bold">
                {genre}
              </span>
            </div>
            <p className="text-slate-200 italic line-clamp-2">
              "{originalIdea}"
            </p>
          </div>

          {/* Regeneration Mode Options */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              Select Creative Direction
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {regenerationOptions.map((opt) => (
                <button
                  type="button"
                  key={opt.id}
                  onClick={() => setSelectedOption(opt.id)}
                  className={`p-3 rounded-xl text-left border transition-all flex flex-col justify-between ${
                    selectedOption === opt.id
                      ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-sm ring-1 ring-indigo-500'
                      : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-800/60 hover:text-white'
                  }`}
                >
                  <div className="font-semibold text-xs flex items-center justify-between">
                    <span>{opt.label}</span>
                    {selectedOption === opt.id && (
                      <span className="w-2 h-2 rounded-full bg-indigo-400" />
                    )}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                    {opt.desc}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Custom Instruction */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1 flex items-center justify-between">
              <span>Custom Instruction (Optional)</span>
              <span className="text-[11px] font-normal text-slate-500">Gemini specific guidance</span>
            </label>
            <textarea
              rows={3}
              value={customInstruction}
              onChange={(e) => setCustomInstruction(e.target.value)}
              placeholder="e.g. Make the main character discover that the mystery is connected to his grandfather, or reveal a hidden student organization."
              className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-glow-indigo transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>{isLoading ? 'Generating New Version...' : 'Generate New Version'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
