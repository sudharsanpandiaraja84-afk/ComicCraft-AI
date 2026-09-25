import React from 'react';
import {
  Sparkles,
  ArrowRight,
  BookOpen,
  Feather,
  Cpu,
  Palette,
  ShieldCheck,
  Compass,
  Layers,
  CheckCircle2,
  Zap,
  Users,
  GitBranch,
  Wand2
} from 'lucide-react';

interface LandingPageProps {
  onStartWriting: () => void;
  onTryDemo: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onStartWriting,
  onTryDemo,
}) => {
  return (
    <div className="relative min-h-[calc(100vh-65px)] overflow-hidden">
      {/* Ambient Lighting Gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-b from-indigo-600/20 via-purple-600/10 to-transparent blur-[120px] pointer-events-none -z-10" />
      <div className="absolute top-1/3 -left-48 w-96 h-96 bg-amber-500/10 rounded-full blur-[100px] pointer-events-none -z-10" />
      <div className="absolute bottom-10 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none -z-10" />

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 sm:pt-24 pb-16 text-center">
        {/* Tagline Announcement Pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-slate-700/80 text-xs font-medium text-slate-300 mb-8 shadow-sm backdrop-blur-sm">
          <span className="flex h-2 w-2 rounded-full bg-amber-400 animate-ping" />
          <span className="text-amber-300 font-semibold">StoryForge AI</span>
          <span className="text-slate-500">&bull;</span>
          <span>Turn a Simple Idea Into a Complete Story.</span>
        </div>

        {/* Hero Title */}
        <h1 className="font-heading font-extrabold text-4xl sm:text-6xl lg:text-7xl tracking-tight text-white max-w-4xl mx-auto leading-[1.12]">
          Turn Your Ideas <br />
          <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-amber-300 bg-clip-text text-transparent">
            Into Stories
          </span>
        </h1>

        {/* Subtitle */}
        <p className="mt-6 text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed">
          Give us a simple idea. Choose your genre. Let AI build the complete story.
        </p>

        {/* CTA Buttons */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <button
            onClick={onStartWriting}
            className="flex items-center gap-2.5 px-8 py-3.5 rounded-xl font-heading font-bold text-base bg-indigo-600 hover:bg-indigo-500 text-white shadow-glow-indigo transition-all transform hover:-translate-y-0.5"
          >
            <Feather className="w-5 h-5 text-amber-300" />
            <span>Start Writing</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </button>

          <button
            onClick={onTryDemo}
            className="flex items-center gap-2 px-7 py-3.5 rounded-xl font-heading font-semibold text-base bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700 hover:border-slate-600 transition-all shadow-sm"
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Try Demo</span>
          </button>
        </div>

        {/* Example Showcase Card */}
        <div className="mt-16 max-w-4xl mx-auto text-left">
          <div className="relative rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-xl p-6 sm:p-8 shadow-2xl">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-5 border-b border-slate-800/80">
              <div className="flex items-center gap-3">
                <span className="w-3 h-3 rounded-full bg-rose-500/80" />
                <span className="w-3 h-3 rounded-full bg-amber-500/80" />
                <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
                <span className="ml-2 text-xs font-mono text-slate-400">StoryForge Interactive Generation</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Mystery
                </span>
                <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> AI Quality Passed
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mt-6">
              {/* Input side */}
              <div className="md:col-span-4 bg-slate-950/70 p-4 rounded-xl border border-slate-800/80">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">User Idea</div>
                <p className="text-xs text-slate-200 font-medium italic">
                  "A college student discovers a mysterious room inside his college."
                </p>
                <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] space-y-1 text-slate-400">
                  <div><strong>Genre:</strong> Mystery</div>
                  <div><strong>Tone:</strong> Suspenseful, Atmospheric</div>
                  <div><strong>Ending:</strong> Twist Ending</div>
                </div>
              </div>

              {/* Output side */}
              <div className="md:col-span-8 bg-slate-950/70 p-5 rounded-xl border border-slate-800/80">
                <div className="flex items-center justify-between mb-2">
                  <div className="font-cinzel text-base font-bold text-amber-300">The Whispering Archives</div>
                  <span className="text-[11px] text-slate-400">1,021 words &bull; 6 min read</span>
                </div>
                <p className="font-story text-xs text-slate-300 leading-relaxed line-clamp-4">
                  The subterranean level of St. Jude College’s Carlyle Memorial Library was where dust went to die.
                  Where the solid mahogany casing met the stone foundation, the shadow lay just a fraction of an inch too deep.
                  Julian pressed the carved serpent's emerald eye, and with a hiss of suspended counterweights, a century-old threshold swung open...
                </p>
                <div className="mt-4 flex flex-wrap items-center gap-2 pt-3 border-t border-slate-800">
                  <span className="text-[11px] text-slate-400">Characters generated:</span>
                  <span className="text-[11px] px-2 py-0.5 bg-slate-800 rounded text-slate-200">Julian Hayes</span>
                  <span className="text-[11px] px-2 py-0.5 bg-slate-800 rounded text-slate-200">Dr. Eleanor Vance</span>
                  <span className="text-[11px] px-2 py-0.5 bg-slate-800 rounded text-slate-200">Silas Reed</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Cards Section (Section 3 of User Prompt) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-slate-800/60">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="font-heading font-extrabold text-3xl sm:text-4xl text-white">
            Architected for Narrative Excellence
          </h2>
          <p className="mt-4 text-slate-400 text-base">
            StoryForge AI doesn't just autocomplete sentences. It analyzes your premise, constructs a 5-act narrative framework, develops three-dimensional characters, and polishes the prose to perfection.
          </p>
        </div>

        {/* 6 Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* 1. AI Story Generation */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 hover:border-indigo-500/40 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-5 group-hover:scale-110 transition-transform">
              <Feather className="w-6 h-6" />
            </div>
            <h3 className="font-heading font-bold text-lg text-white mb-2">
              AI Story Generation
            </h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Converts brief premises into full, detailed, cohesive narratives with rich dialogue, authentic scene transitions, and satisfying resolutions.
            </p>
          </div>

          {/* 2. Genre Intelligence */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 hover:border-purple-500/40 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-5 group-hover:scale-110 transition-transform">
              <Compass className="w-6 h-6" />
            </div>
            <h3 className="font-heading font-bold text-lg text-white mb-2">
              Genre Intelligence
            </h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Deeply infuses your narrative with 16 distinct genre conventions—from intricate clues in Mystery and visceral dread in Horror to high fantasy world-building.
            </p>
          </div>

          {/* 3. Character Development */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 hover:border-amber-500/40 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-5 group-hover:scale-110 transition-transform">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="font-heading font-bold text-lg text-white mb-2">
              Character Development
            </h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Automatically builds nuanced Character Bibles complete with psychological goals, deep-rooted fears, fatal flaws, relationships, and transformative arcs.
            </p>
          </div>

          {/* 4. Story Structure */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 hover:border-cyan-500/40 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-5 group-hover:scale-110 transition-transform">
              <Layers className="w-6 h-6" />
            </div>
            <h3 className="font-heading font-bold text-lg text-white mb-2">
              Story Structure
            </h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Executes classic narrative architecture: Introduction, Rising Action, Climax, Falling Action, and Resolution tailored to your ending preference.
            </p>
          </div>

          {/* 5. Custom Writing Styles */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 hover:border-rose-500/40 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 mb-5 group-hover:scale-110 transition-transform">
              <Palette className="w-6 h-6" />
            </div>
            <h3 className="font-heading font-bold text-lg text-white mb-2">
              Custom Writing Styles
            </h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Select from Cinematic, Literary, Descriptive, Conversational, or specify custom prose styles like Victorian Gothic or Cyberpunk cadence.
            </p>
          </div>

          {/* 6. Smart Story Expansion */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 hover:border-emerald-500/40 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-5 group-hover:scale-110 transition-transform">
              <GitBranch className="w-6 h-6" />
            </div>
            <h3 className="font-heading font-bold text-lg text-white mb-2">
              Smart Story Expansion
            </h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Continue your story into multi-chapter sagas, generate follow-up plot twists, rewrite tone, or improve targeted paragraphs without restarting.
            </p>
          </div>
        </div>
      </section>

      {/* 5-Step Pipeline Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-slate-800/60">
        <div className="text-center mb-12">
          <span className="text-xs uppercase tracking-wider font-semibold text-amber-400">Structured AI Pipeline</span>
          <h2 className="font-heading font-bold text-2xl sm:text-3xl text-white mt-1">
            From Raw Idea to Finished Manuscript
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-6 gap-3 text-center">
          {[
            { step: '01', title: 'Input Analysis', desc: 'Premise & conflict evaluation' },
            { step: '02', title: 'Story Blueprint', desc: '5-act narrative framework' },
            { step: '03', title: 'Character Bible', desc: 'Motivations & arcs' },
            { step: '04', title: 'Full Story Draft', desc: 'Vivid dialogue & scenes' },
            { step: '05', title: 'Quality Check', desc: 'Editorial validation' },
            { step: '06', title: 'Interactive Studio', desc: 'Read, edit, continue' },
          ].map((item, idx) => (
            <div key={idx} className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl">
              <div className="text-indigo-400 font-mono text-xs font-bold mb-1">{item.step}</div>
              <div className="font-heading font-semibold text-xs sm:text-sm text-slate-200">{item.title}</div>
              <div className="text-[11px] text-slate-400 mt-1">{item.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer CTA */}
      <section className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-b from-indigo-900/30 to-slate-900 border border-indigo-500/20">
          <h3 className="font-heading font-extrabold text-2xl sm:text-3xl text-white">
            Ready to Forge Your Next Masterpiece?
          </h3>
          <p className="mt-3 text-slate-300 text-sm max-w-lg mx-auto">
            Input your premise, pick your genre, and watch your story unfold in seconds.
          </p>
          <div className="mt-6 flex justify-center gap-4">
            <button
              onClick={onStartWriting}
              className="px-6 py-3 rounded-xl font-heading font-bold text-sm bg-indigo-600 hover:bg-indigo-500 text-white shadow-glow-indigo transition-all"
            >
              Start Writing Now
            </button>
            <button
              onClick={onTryDemo}
              className="px-6 py-3 rounded-xl font-heading font-semibold text-sm bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all"
            >
              Explore Demo Story
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
