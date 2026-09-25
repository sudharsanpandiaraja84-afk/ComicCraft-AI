import React, { useState } from 'react';
import { Sparkles, X, Sliders, Check } from 'lucide-react';

interface ImproveStoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImprove: (focusArea: 'Plot' | 'Characters' | 'Dialogue' | 'Descriptions' | 'Pacing' | 'All', instructions: string) => void;
  isLoading: boolean;
}

export const ImproveStoryModal: React.FC<ImproveStoryModalProps> = ({
  isOpen,
  onClose,
  onImprove,
  isLoading,
}) => {
  const [focusArea, setFocusArea] = useState<'Plot' | 'Characters' | 'Dialogue' | 'Descriptions' | 'Pacing' | 'All'>('Pacing');
  const [instructions, setInstructions] = useState('');

  if (!isOpen) return null;

  const focusOptions: { id: 'Plot' | 'Characters' | 'Dialogue' | 'Descriptions' | 'Pacing' | 'All'; label: string; desc: string }[] = [
    { id: 'Plot', label: 'Plot & Conflict', desc: 'Sharpen cause-and-effect stakes and suspense build-up' },
    { id: 'Characters', label: 'Characters', desc: 'Heighten emotional depth, motivations, and vulnerability' },
    { id: 'Dialogue', label: 'Dialogue & Subtext', desc: 'Make conversations punchier, distinctive, and authentic' },
    { id: 'Descriptions', label: 'Sensory Descriptions', desc: 'Deepen textures, scents, lighting, and atmosphere' },
    { id: 'Pacing', label: 'Narrative Pacing', desc: 'Tighten scene momentum and amplify high-stakes moments' },
    { id: 'All', label: 'Comprehensive Polish', desc: 'Holistic polish across all storytelling dimensions' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 p-6 sm:p-7 shadow-2xl">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <Sparkles className="w-5 h-5 text-amber-400" />
            </span>
            <div>
              <h3 className="font-heading font-bold text-lg text-white">
                Improve Story with AI
              </h3>
              <p className="text-xs text-slate-400">
                Direct Gemini to elevate specific dimensions of your story draft.
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
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-2">
              Select Improvement Focus Area:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {focusOptions.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setFocusArea(opt.id)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    focusArea === opt.id
                      ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-sm'
                      : 'bg-slate-950/50 border-slate-800 hover:border-slate-700 text-slate-300'
                  }`}
                >
                  <div className="font-semibold text-xs flex items-center justify-between">
                    <span>{opt.label}</span>
                    {focusArea === opt.id && <Check className="w-3.5 h-3.5 text-indigo-400" />}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">{opt.desc}</div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-1.5">
              Specific Instructions (Optional):
            </label>
            <textarea
              rows={3}
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="e.g., Make the confrontation between the protagonist and villain more tense and emotionally charged..."
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
            onClick={() => onImprove(focusArea, instructions)}
            className="px-5 py-2.5 rounded-xl font-heading font-bold text-xs bg-indigo-600 hover:bg-indigo-500 text-white shadow-glow-indigo disabled:opacity-50 flex items-center gap-2"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>{isLoading ? 'Improving Story...' : 'Apply Improvements'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
