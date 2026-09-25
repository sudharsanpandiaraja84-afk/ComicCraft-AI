import React, { useState } from 'react';
import { Edit3, X, RefreshCw, Copy, Check } from 'lucide-react';
import { VisualScene } from '../../types';

interface EditImagePromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  scene: VisualScene | null;
  onRegenerateWithPrompt: (sceneId: string, updatedPrompt: string, customGuidance: string) => void;
  isLoading: boolean;
}

export const EditImagePromptModal: React.FC<EditImagePromptModalProps> = ({
  isOpen,
  onClose,
  scene,
  onRegenerateWithPrompt,
  isLoading,
}) => {
  if (!isOpen || !scene) return null;

  const [promptText, setPromptText] = useState(scene.image_prompt);
  const [customGuidance, setCustomGuidance] = useState('');
  const [copied, setCopied] = useState(false);

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(promptText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onRegenerateWithPrompt(scene.scene_id, promptText.trim(), customGuidance.trim());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-xl rounded-2xl bg-slate-900 border border-slate-800 p-6 sm:p-7 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <Edit3 className="w-5 h-5 text-amber-400" />
            </span>
            <div>
              <h2 className="font-heading font-extrabold text-base text-white">
                Edit Prompt — Scene {scene.scene_number}: {scene.title}
              </h2>
              <p className="text-xs text-slate-400">
                Modify the image generation prompt to fine-tune visual details
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Full Image Prompt
              </label>
              <button
                type="button"
                onClick={handleCopyPrompt}
                className="flex items-center gap-1 text-[11px] text-indigo-400 hover:text-indigo-300 font-semibold"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy Prompt'}</span>
              </button>
            </div>
            <textarea
              rows={5}
              value={promptText}
              onChange={(e) => setPromptText(e.target.value)}
              className="w-full rounded-xl bg-slate-950 border border-slate-800 p-3 text-xs text-white leading-relaxed focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
              Additional Guidance / Tweaks
            </label>
            <input
              type="text"
              value={customGuidance}
              onChange={(e) => setCustomGuidance(e.target.value)}
              placeholder="e.g. running toward the doorway, holding mysterious glowing ledger"
              className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Negative prompt read-only */}
          {scene.negative_prompt && (
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 text-[11px] text-slate-400">
              <strong className="text-slate-300 block mb-0.5">Style Negative Prompt:</strong>
              {scene.negative_prompt}
            </div>
          )}

          {/* Actions */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
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
              <span>{isLoading ? 'Regenerating Image...' : 'Regenerate This Scene'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
