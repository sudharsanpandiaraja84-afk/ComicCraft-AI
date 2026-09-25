import React from 'react';
import { Palette, CheckCircle2, Loader2, Circle } from 'lucide-react';

export interface ImageProgressStep {
  label: string;
  status: 'completed' | 'current' | 'pending';
}

interface ImageProgressModalProps {
  isOpen: boolean;
  steps: ImageProgressStep[];
  overallProgress: string;
  totalScenes: number;
}

export const ImageProgressModal: React.FC<ImageProgressModalProps> = ({
  isOpen,
  steps,
  overallProgress,
  totalScenes,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-8 shadow-2xl">
        {/* Header */}
        <div className="text-center pb-6 border-b border-slate-800">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-pink-500/20 to-indigo-500/20 border border-pink-500/30 flex items-center justify-center mb-3 shadow-inner">
            <Palette className="w-7 h-7 text-pink-400 animate-pulse" />
          </div>
          <h2 className="font-heading font-extrabold text-xl text-white">
            Creating your visual story...
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {overallProgress || `Synthesizing ${totalScenes} scenes with character consistency`}
          </p>
        </div>

        {/* Steps List */}
        <div className="mt-6 space-y-3 max-h-72 overflow-y-auto pr-1">
          {steps.map((step, idx) => (
            <div
              key={idx}
              className={`flex items-center gap-3 p-2.5 rounded-xl transition-all ${
                step.status === 'completed'
                  ? 'bg-emerald-950/20 text-emerald-300 border border-emerald-500/20'
                  : step.status === 'current'
                  ? 'bg-indigo-950/40 text-indigo-200 border border-indigo-500/40 ring-1 ring-indigo-500/30'
                  : 'text-slate-500'
              }`}
            >
              {step.status === 'completed' && (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              )}
              {step.status === 'current' && (
                <Loader2 className="w-4 h-4 text-amber-400 animate-spin shrink-0" />
              )}
              {step.status === 'pending' && (
                <Circle className="w-4 h-4 text-slate-600 shrink-0" />
              )}
              <span className="text-xs font-medium">{step.label}</span>
            </div>
          ))}
        </div>

        <div className="mt-6 text-center text-[11px] text-slate-500">
          Generating character visual profiles, camera angles, and rendering scenes...
        </div>
      </div>
    </div>
  );
};
