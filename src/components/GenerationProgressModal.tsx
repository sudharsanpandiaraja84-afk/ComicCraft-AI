import React, { useEffect, useState } from 'react';
import {
  Sparkles,
  BookOpen,
  Users,
  Layers,
  Feather,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';

interface GenerationProgressModalProps {
  isOpen: boolean;
}

export const GenerationProgressModal: React.FC<GenerationProgressModalProps> = ({ isOpen }) => {
  const steps = [
    { title: 'Understanding your idea...', icon: <BookOpen className="w-4 h-4 text-indigo-400" />, desc: 'Analyzing premise, stakes & thematic conflicts' },
    { title: 'Building characters...', icon: <Users className="w-4 h-4 text-purple-400" />, desc: 'Architecting motivations, fatal flaws & arcs' },
    { title: 'Developing the plot...', icon: <Layers className="w-4 h-4 text-cyan-400" />, desc: 'Formulating 5-act structure and climax beats' },
    { title: 'Writing your story...', icon: <Feather className="w-4 h-4 text-amber-400" />, desc: 'Crafting descriptive prose, dialogue & transitions' },
    { title: 'Checking story quality...', icon: <ShieldCheck className="w-4 h-4 text-emerald-400" />, desc: 'Validating plot logic & character fidelity' },
    { title: 'Finalizing your story...', icon: <Sparkles className="w-4 h-4 text-yellow-400" />, desc: 'Formatting reading layout and metrics' },
  ];

  const [activeStepIndex, setActiveStepIndex] = useState(0);

  useEffect(() => {
    if (!isOpen) {
      setActiveStepIndex(0);
      return;
    }

    // Step progression animation
    const interval = setInterval(() => {
      setActiveStepIndex((prev) => {
        if (prev < steps.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, 2800);

    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 p-7 shadow-2xl overflow-hidden">
        {/* Top ambient glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-amber-500 blur-sm" />

        {/* Modal Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-amber-500 p-0.5 mx-auto mb-3 shadow-glow-indigo">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-amber-400 animate-spin-slow" />
            </div>
          </div>
          <h3 className="font-heading font-extrabold text-xl text-white">
            StoryForge AI Engine
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Transforming your premise through the multi-stage narrative pipeline...
          </p>
        </div>

        {/* Pipeline Step List */}
        <div className="space-y-3 my-6">
          {steps.map((step, idx) => {
            const isCompleted = idx < activeStepIndex;
            const isCurrent = idx === activeStepIndex;

            return (
              <div
                key={idx}
                className={`flex items-center gap-3.5 p-3 rounded-xl border transition-all ${
                  isCurrent
                    ? 'bg-indigo-600/15 border-indigo-500 shadow-sm'
                    : isCompleted
                    ? 'bg-slate-950/40 border-slate-800/80 text-slate-400'
                    : 'bg-transparent border-transparent opacity-40'
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold transition-all ${
                    isCompleted
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                      : isCurrent
                      ? 'bg-indigo-600 text-white animate-pulse'
                      : 'bg-slate-800 text-slate-500'
                  }`}
                >
                  {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                </div>

                <div className="flex-1">
                  <div
                    className={`font-heading font-semibold text-xs sm:text-sm ${
                      isCurrent ? 'text-white font-bold' : isCompleted ? 'text-slate-300' : 'text-slate-500'
                    }`}
                  >
                    {step.title}
                  </div>
                  {isCurrent && (
                    <div className="text-[11px] text-indigo-300 mt-0.5 animate-fadeIn">
                      {step.desc}
                    </div>
                  )}
                </div>

                {isCurrent && (
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                )}
              </div>
            );
          })}
        </div>

        {/* Bottom progress note */}
        <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
          <span>Google Gemini Story Pipeline</span>
          <span className="font-mono text-indigo-400 font-semibold">
            {Math.round(((activeStepIndex + 1) / steps.length) * 100)}% Complete
          </span>
        </div>
      </div>
    </div>
  );
};
