import React, { useState } from 'react';
import { Columns, X, Check, ArrowRight, Sparkles, BookOpen, Layers } from 'lucide-react';
import { StoryVersion, VersionComparisonResult } from '../../types';
import { api } from '../../services/api';

interface CompareVersionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  versions: StoryVersion[];
  initialVersionA?: StoryVersion;
  initialVersionB?: StoryVersion;
  onSelectVersion: (version: StoryVersion) => void;
  apiKey?: string;
  isDemoMode?: boolean;
}

export const CompareVersionsModal: React.FC<CompareVersionsModalProps> = ({
  isOpen,
  onClose,
  versions,
  initialVersionA,
  initialVersionB,
  onSelectVersion,
  apiKey,
  isDemoMode,
}) => {
  const [selectedAId, setSelectedAId] = useState<string>(
    initialVersionA?.version_id || (versions[0]?.version_id ?? '')
  );
  const [selectedBId, setSelectedBId] = useState<string>(
    initialVersionB?.version_id || (versions[1]?.version_id ?? versions[0]?.version_id ?? '')
  );

  const [comparison, setComparison] = useState<VersionComparisonResult | null>(null);
  const [isComparing, setIsComparing] = useState(false);
  const [hasCompared, setHasCompared] = useState(false);

  if (!isOpen) return null;

  const verA = versions.find((v) => v.version_id === selectedAId) || versions[0];
  const verB = versions.find((v) => v.version_id === selectedBId) || versions[1] || versions[0];

  const handleRunComparison = async () => {
    if (!verA || !verB) return;
    setIsComparing(true);
    try {
      const res = await api.compareVersions({
        version_a: verA,
        version_b: verB,
        api_key: apiKey,
        demo_mode: isDemoMode,
      });
      setComparison(res);
      setHasCompared(true);
    } catch (err) {
      console.error('Comparison error:', err);
    } finally {
      setIsComparing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-4xl rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-8 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
              <Columns className="w-5 h-5 text-purple-400" />
            </span>
            <div>
              <h2 className="font-heading font-extrabold text-xl text-white">
                Compare Story Versions
              </h2>
              <p className="text-xs text-slate-400">
                Contrast narrative paths, character arcs, and resolutions to pick your favorite
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

        {/* Version Pickers */}
        <div className="mt-4 p-4 rounded-2xl bg-slate-950/70 border border-slate-800 flex flex-wrap items-center justify-between gap-4 shrink-0">
          <div className="flex-1 min-w-[240px]">
            <label className="block text-[11px] font-bold text-indigo-400 uppercase tracking-wider mb-1">
              Version A
            </label>
            <select
              value={selectedAId}
              onChange={(e) => {
                setSelectedAId(e.target.value);
                setHasCompared(false);
              }}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {versions.map((v) => (
                <option key={v.version_id} value={v.version_id}>
                  Version {v.version_number}: {v.title} ({v.regeneration_note || 'Generated'})
                </option>
              ))}
            </select>
          </div>

          <div className="flex-1 min-w-[240px]">
            <label className="block text-[11px] font-bold text-purple-400 uppercase tracking-wider mb-1">
              Version B
            </label>
            <select
              value={selectedBId}
              onChange={(e) => {
                setSelectedBId(e.target.value);
                setHasCompared(false);
              }}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              {versions.map((v) => (
                <option key={v.version_id} value={v.version_id}>
                  Version {v.version_number}: {v.title} ({v.regeneration_note || 'Generated'})
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleRunComparison}
            disabled={isComparing || selectedAId === selectedBId}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-glow-indigo transition-all disabled:opacity-50 mt-auto"
          >
            <Sparkles className={`w-3.5 h-3.5 ${isComparing ? 'animate-spin' : ''}`} />
            <span>{isComparing ? 'Analyzing Differences...' : 'Compare Versions'}</span>
          </button>
        </div>

        {selectedAId === selectedBId && (
          <div className="mt-2 text-center text-xs text-amber-400/80">
            Please choose two different versions to compare their differences.
          </div>
        )}

        {/* Comparison Content */}
        <div className="mt-4 overflow-y-auto pr-1 flex-1 space-y-5">
          {/* Side by Side Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Version A Card */}
            {verA && (
              <div className="p-4 rounded-2xl bg-indigo-950/20 border border-indigo-500/30 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-2 border-b border-indigo-500/20 mb-3">
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-500/20 text-indigo-300">
                      Version {verA.version_number}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {verA.story_data.word_count} words
                    </span>
                  </div>
                  <h3 className="font-heading font-extrabold text-base text-white mb-1">
                    {verA.title}
                  </h3>
                  <p className="text-xs text-slate-300 italic mb-3">
                    "{verA.summary || verA.story_data.blueprint.premise}"
                  </p>
                  <div className="text-xs text-slate-400 space-y-1">
                    <div>
                      <strong className="text-slate-300">Cast:</strong>{' '}
                      {verA.story_data.characters.map((c) => c.name).join(', ') || 'Cast defined'}
                    </div>
                    <div>
                      <strong className="text-slate-300">Ending:</strong> {verA.story_data.ending_type}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => {
                    onSelectVersion(verA);
                    onClose();
                  }}
                  className="mt-4 w-full flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-indigo-600/30 hover:bg-indigo-600 text-indigo-200 hover:text-white border border-indigo-500/40 transition-all"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Switch to Version {verA.version_number}</span>
                </button>
              </div>
            )}

            {/* Version B Card */}
            {verB && (
              <div className="p-4 rounded-2xl bg-purple-950/20 border border-purple-500/30 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-2 border-b border-purple-500/20 mb-3">
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-500/20 text-purple-300">
                      Version {verB.version_number}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {verB.story_data.word_count} words
                    </span>
                  </div>
                  <h3 className="font-heading font-extrabold text-base text-white mb-1">
                    {verB.title}
                  </h3>
                  <p className="text-xs text-slate-300 italic mb-3">
                    "{verB.summary || verB.story_data.blueprint.premise}"
                  </p>
                  <div className="text-xs text-slate-400 space-y-1">
                    <div>
                      <strong className="text-slate-300">Cast:</strong>{' '}
                      {verB.story_data.characters.map((c) => c.name).join(', ') || 'Cast defined'}
                    </div>
                    <div>
                      <strong className="text-slate-300">Ending:</strong> {verB.story_data.ending_type}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => {
                    onSelectVersion(verB);
                    onClose();
                  }}
                  className="mt-4 w-full flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-purple-600/30 hover:bg-purple-600 text-purple-200 hover:text-white border border-purple-500/40 transition-all"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Switch to Version {verB.version_number}</span>
                </button>
              </div>
            )}
          </div>

          {/* Detailed Differences (from AI comparison or auto-heuristics) */}
          {comparison ? (
            <div className="space-y-4 pt-2 border-t border-slate-800">
              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800">
                <h4 className="font-bold text-xs uppercase tracking-wider text-amber-400 mb-1 flex items-center gap-2">
                  <Layers className="w-4 h-4" />
                  <span>Plot & Conflict Differences</span>
                </h4>
                <p className="text-xs text-slate-200 leading-relaxed">
                  {comparison.plot_differences}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800">
                <h4 className="font-bold text-xs uppercase tracking-wider text-cyan-400 mb-1 flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  <span>Ending & Resolution Differences</span>
                </h4>
                <p className="text-xs text-slate-200 leading-relaxed">
                  {comparison.ending_differences}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800">
                <h4 className="font-bold text-xs uppercase tracking-wider text-emerald-400 mb-1 flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  <span>Atmosphere, Pacing & Style</span>
                </h4>
                <p className="text-xs text-slate-200 leading-relaxed">
                  {comparison.tone_and_style_differences}
                </p>
              </div>

              {comparison.recommendation && (
                <div className="p-4 rounded-xl bg-indigo-950/40 border border-indigo-500/40">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-indigo-300 mb-1 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span>Editorial Recommendation</span>
                  </h4>
                  <p className="text-xs text-indigo-100 font-medium leading-relaxed">
                    {comparison.recommendation}
                  </p>
                </div>
              )}
            </div>
          ) : (
            !isComparing && (
              <div className="text-center py-6 text-xs text-slate-400">
                Click <strong>"Compare Versions"</strong> to generate an objective AI breakdown of plot twists, character arcs, and narrative divergence.
              </div>
            )
          )}
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-slate-800 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
