import React, { useState } from 'react';
import { Palette, X, Sparkles, Layers, Sliders, CheckCircle2 } from 'lucide-react';
import { ImageVisualStyle, SceneScope } from '../../types';

interface CreateImagesModalProps {
  isOpen: boolean;
  onClose: () => void;
  storyTitle: string;
  hasChapters: boolean;
  onStartImageGeneration: (scope: SceneScope, sceneCount: number, visualStyle: ImageVisualStyle) => void;
  isLoading: boolean;
}

export const CreateImagesModal: React.FC<CreateImagesModalProps> = ({
  isOpen,
  onClose,
  storyTitle,
  hasChapters,
  onStartImageGeneration,
  isLoading,
}) => {
  const [scope, setScope] = useState<SceneScope>('Entire Story');
  const [sceneCountPreset, setSceneCountPreset] = useState<number | 'custom'>(5);
  const [customSceneCount, setCustomSceneCount] = useState<number>(6);
  const [visualStyle, setVisualStyle] = useState<ImageVisualStyle>('Cinematic');

  if (!isOpen) return null;

  const visualStyles: { id: ImageVisualStyle; label: string; desc: string }[] = [
    { id: 'Cinematic', label: 'Cinematic', desc: 'Dramatic lighting, anamorphic lens depth, filmic textures' },
    { id: 'Anime', label: 'Anime', desc: 'Vibrant cel-shaded animation aesthetic with dynamic angles' },
    { id: 'Manga', label: 'Manga', desc: 'High-contrast black & white ink illustration with screentones' },
    { id: 'Western Comic', label: 'Western Comic', desc: 'Bold ink lines, graphic shading, superhero comic color palette' },
    { id: 'Digital Art', label: 'Digital Art', desc: 'Rich concept art, atmospheric brushwork, painterly finish' },
    { id: 'Semi-realistic', label: 'Semi-realistic', desc: 'Grounded human anatomy with expressive stylized realism' },
    { id: 'Realistic', label: 'Realistic', desc: 'Photographic fidelity, natural lighting and authentic textures' },
    { id: 'Watercolor', label: 'Watercolor', desc: 'Soft pastel washes, expressive paper bleeds, artistic mood' },
    { id: '3D Animation', label: '3D Animation', desc: 'Stylized Pixar/DreamWorks character rendering with soft lighting' },
    { id: 'Fantasy', label: 'Fantasy', desc: 'Mythic ethereal glow, arcane radiance and grand landscapes' },
    { id: 'Noir', label: 'Noir', desc: 'Moody black & white shadows, venetian blind cuts, high contrast' },
    { id: 'Cyberpunk', label: 'Cyberpunk', desc: 'Neon cyan/magenta rim lights, rain-slicked chrome, dark cityscapes' },
  ];

  const effectiveSceneCount = sceneCountPreset === 'custom' ? customSceneCount : sceneCountPreset;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onStartImageGeneration(scope, effectiveSceneCount, visualStyle);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-8 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-pink-500/10 border border-pink-500/20 text-pink-400">
              <Palette className="w-5 h-5 text-pink-400" />
            </span>
            <div>
              <h2 className="font-heading font-extrabold text-xl text-white">
                Transform Story into Visual Scenes
              </h2>
              <p className="text-xs text-slate-400">
                AI extracts characters, locations, and key narrative beats to craft consistent imagery
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-5 overflow-y-auto pr-1 flex-1">
          {/* Pipeline Banner */}
          <div className="p-3.5 rounded-2xl bg-indigo-950/30 border border-indigo-500/30 text-xs text-indigo-200">
            <div className="font-bold text-[11px] text-indigo-300 uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Multi-Phase Visual Pipeline</span>
            </div>
            <div className="text-[11px] text-slate-400 leading-relaxed">
              Story Analysis &rarr; Scene Extraction &rarr; Character Consistency Profile &rarr; Location Profile &rarr; Image Prompts &rarr; Render
            </div>
          </div>

          {/* Scope Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              Story Scope
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(['Entire Story', 'Selected Chapter', 'Selected Scene', 'Selected Paragraph'] as SceneScope[]).map((sc) => (
                <button
                  type="button"
                  key={sc}
                  onClick={() => setScope(sc)}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all text-center ${
                    scope === sc
                      ? 'bg-pink-600/20 border-pink-500 text-pink-200 ring-1 ring-pink-500'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {sc}
                </button>
              ))}
            </div>
          </div>

          {/* Scene Count */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center justify-between">
              <span>Scene Count</span>
              <span className="text-[11px] font-normal text-slate-400">Default: 5 Scenes</span>
            </label>
            <div className="grid grid-cols-5 gap-2">
              {[3, 5, 8, 10].map((num) => (
                <button
                  type="button"
                  key={num}
                  onClick={() => setSceneCountPreset(num)}
                  className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                    sceneCountPreset === num
                      ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm'
                      : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:text-white'
                  }`}
                >
                  {num} Scenes
                </button>
              ))}
              <button
                type="button"
                onClick={() => setSceneCountPreset('custom')}
                className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                  sceneCountPreset === 'custom'
                    ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm'
                    : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:text-white'
                }`}
              >
                Custom
              </button>
            </div>

            {sceneCountPreset === 'custom' && (
              <div className="mt-2.5 flex items-center gap-3">
                <input
                  type="range"
                  min="2"
                  max="12"
                  value={customSceneCount}
                  onChange={(e) => setCustomSceneCount(parseInt(e.target.value))}
                  className="flex-1 accent-indigo-500"
                />
                <span className="text-xs font-bold text-indigo-400 w-16 text-right">
                  {customSceneCount} scenes
                </span>
              </div>
            )}
          </div>

          {/* Visual Style Selector (12 Styles) */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              Image Visual Style ({visualStyles.length} Styles)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-56 overflow-y-auto pr-1">
              {visualStyles.map((st) => (
                <button
                  type="button"
                  key={st.id}
                  onClick={() => setVisualStyle(st.id)}
                  className={`p-2.5 rounded-xl text-left border transition-all flex flex-col justify-between ${
                    visualStyle === st.id
                      ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-sm ring-1 ring-indigo-500'
                      : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-800/60 hover:text-white'
                  }`}
                >
                  <div className="font-bold text-xs flex items-center justify-between">
                    <span>{st.label}</span>
                    {visualStyle === st.id && (
                      <span className="w-2 h-2 rounded-full bg-pink-400" />
                    )}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1 line-clamp-2">
                    {st.desc}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Footer */}
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
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-pink-600 to-indigo-600 hover:from-pink-500 hover:to-indigo-500 text-white shadow-glow-indigo transition-all disabled:opacity-50"
            >
              <Palette className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span>{isLoading ? 'Creating Visual Story...' : `Generate ${effectiveSceneCount} Scenes`}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
