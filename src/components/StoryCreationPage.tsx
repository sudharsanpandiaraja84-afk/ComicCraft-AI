import React, { useState } from 'react';
import {
  Sparkles,
  ChevronDown,
  ChevronUp,
  Plus,
  Trash2,
  HelpCircle,
  Wand2,
  BookOpen,
  Compass,
  Ghost,
  Heart,
  Rocket,
  Skull,
  Shield,
  Smile,
  Film,
  Award,
  Search,
  Zap,
  Activity,
  UserCheck,
  Sliders,
  AlertCircle
} from 'lucide-react';
import {
  StoryGenre,
  StoryLength,
  StoryTone,
  WritingStyle,
  TargetAudience,
  StoryEnding,
  UserInputCharacter,
  AdvancedStoryOptions,
  StoryGenerateRequest
} from '../types';

interface StoryCreationPageProps {
  onGenerate: (req: StoryGenerateRequest) => void;
  isGenerating: boolean;
  onLoadDemo: () => void;
  isDemoMode: boolean;
}

export const StoryCreationPage: React.FC<StoryCreationPageProps> = ({
  onGenerate,
  isGenerating,
  onLoadDemo,
  isDemoMode,
}) => {
  // 1. Core Idea
  const [storyIdea, setStoryIdea] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // 2. Genre Selection (16 genres + Custom)
  const [selectedGenre, setSelectedGenre] = useState<StoryGenre>('Mystery');
  const [customGenre, setCustomGenre] = useState('');

  // 3. Story Length
  const [storyLength, setStoryLength] = useState<StoryLength>('Medium');

  // 4. Story Tone (Multi-select)
  const [selectedTones, setSelectedTones] = useState<StoryTone[]>(['Suspenseful', 'Mysterious']);

  // 5. Writing Style
  const [writingStyle, setWritingStyle] = useState<WritingStyle>('Cinematic');
  const [customStyle, setCustomStyle] = useState('');

  // 6. Target Audience
  const [targetAudience, setTargetAudience] = useState<TargetAudience>('Young Adults');

  // 7. Ending Preference
  const [endingPreference, setEndingPreference] = useState<StoryEnding>('Twist Ending');

  // 8. Optional Characters
  const [characters, setCharacters] = useState<UserInputCharacter[]>([]);
  const [showAddCharForm, setShowAddCharForm] = useState(false);
  const [newChar, setNewChar] = useState<UserInputCharacter>({
    name: '',
    age: '',
    role: 'Protagonist',
    personality: '',
    gender: '',
    details: '',
  });

  // 9. Advanced Story Controls (Collapsible)
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [advancedOptions, setAdvancedOptions] = useState<AdvancedStoryOptions>({
    num_characters: '2-3',
    setting: '',
    time_period: '',
    location: '',
    complexity: 'Moderate',
    dialogue_amount: 'Balanced',
    description_level: 'Rich & Vivid',
    plot_twist: '',
    moral: '',
  });

  // Quick Inspiration Presets
  const inspirationPrompts = [
    {
      title: 'College Library Mystery',
      genre: 'Mystery' as StoryGenre,
      text: 'A young student discovers that his college library contains a book that predicts the future.',
      tones: ['Suspenseful', 'Mysterious'] as StoryTone[],
      style: 'Cinematic' as WritingStyle,
    },
    {
      title: 'Deep Space Relay',
      genre: 'Science Fiction' as StoryGenre,
      text: 'A lonely technician stationed on an isolated Kuiper Belt relay intercepts an encrypted transmission originating from Earth—sent 200 years from now.',
      tones: ['Epic', 'Dark'] as StoryTone[],
      style: 'Detailed' as WritingStyle,
    },
    {
      title: 'Clockwork Heist',
      genre: 'Fantasy' as StoryGenre,
      text: 'An orphaned street thief is hired by an eccentric alchemist to steal the beating brass heart of the city clocktower before midnight.',
      tones: ['Fast-paced', 'Suspenseful'] as any,
      style: 'Descriptive' as WritingStyle,
    },
    {
      title: 'Forgotten Memories Cafe',
      genre: 'Slice of Life' as StoryGenre,
      text: 'A quiet barista in rainy Seattle serves specialty teas that temporarily return people’s sweetest forgotten childhood memories.',
      tones: ['Emotional', 'Inspirational'] as StoryTone[],
      style: 'Conversational' as WritingStyle,
    },
  ];

  // Genre definitions with icons
  const genresList: { genre: StoryGenre; label: string; icon: React.ReactNode; desc: string }[] = [
    { genre: 'Mystery', label: 'Mystery', icon: <Search className="w-4 h-4 text-amber-400" />, desc: 'Clues, deduction & shocking reveals' },
    { genre: 'Fantasy', label: 'Fantasy', icon: <Wand2 className="w-4 h-4 text-purple-400" />, desc: 'Magic, mythical worlds & lore' },
    { genre: 'Science Fiction', label: 'Sci-Fi', icon: <Rocket className="w-4 h-4 text-cyan-400" />, desc: 'Futuristic concepts & technology' },
    { genre: 'Horror', label: 'Horror', icon: <Skull className="w-4 h-4 text-rose-400" />, desc: 'Dread, tension & atmospheric terror' },
    { genre: 'Thriller', label: 'Thriller', icon: <Zap className="w-4 h-4 text-yellow-400" />, desc: 'High stakes, danger & ticking clock' },
    { genre: 'Romance', label: 'Romance', icon: <Heart className="w-4 h-4 text-pink-400" />, desc: 'Electric chemistry & emotional depth' },
    { genre: 'Adventure', label: 'Adventure', icon: <Compass className="w-4 h-4 text-emerald-400" />, desc: 'Perilous quests & discovery' },
    { genre: 'Comedy', label: 'Comedy', icon: <Smile className="w-4 h-4 text-amber-300" />, desc: 'Humour, wit & playful twists' },
    { genre: 'Drama', label: 'Drama', icon: <Activity className="w-4 h-4 text-indigo-400" />, desc: 'Deep moral conflict & human truth' },
    { genre: 'Historical', label: 'Historical', icon: <BookOpen className="w-4 h-4 text-amber-500" />, desc: 'Authentic eras & period friction' },
    { genre: 'Crime', label: 'Crime', icon: <Shield className="w-4 h-4 text-slate-400" />, desc: 'Detectives, heists & investigations' },
    { genre: 'Superhero', label: 'Superhero', icon: <Award className="w-4 h-4 text-red-400" />, desc: 'Powers, burdens & moral crusades' },
    { genre: 'Slice of Life', label: 'Slice of Life', icon: <Heart className="w-4 h-4 text-teal-400" />, desc: 'Quiet moments & human warmth' },
    { genre: 'Psychological', label: 'Psychological', icon: <Ghost className="w-4 h-4 text-violet-400" />, desc: 'Mind games & internal dilemmas' },
    { genre: 'Action', label: 'Action', icon: <Film className="w-4 h-4 text-orange-400" />, desc: 'Kinetic battles & intense momentum' },
    { genre: 'Educational', label: 'Educational', icon: <BookOpen className="w-4 h-4 text-blue-400" />, desc: 'Fascinating knowledge-driven tale' },
    { genre: 'Custom Genre', label: 'Custom Genre', icon: <Sliders className="w-4 h-4 text-emerald-300" />, desc: 'Specify your own custom genre' },
  ];

  // Story length options
  const lengthOptions: { length: StoryLength; label: string; words: string; desc: string }[] = [
    { length: 'Short', label: 'Short', words: '800–1,200 words', desc: 'Fast, focused, economical narrative' },
    { length: 'Medium', label: 'Medium', words: '1,500–2,500 words', desc: 'Balanced scenes, dialogue & rising action' },
    { length: 'Long', label: 'Long', words: '3,000–5,000 words', desc: 'Rich world-building, subplots & depth' },
    { length: 'Very Long', label: 'Very Long', words: '5,000+ words', desc: 'Expansive epic canvas & multi-phase climaxes' },
  ];

  // Tones list
  const tonesList: StoryTone[] = [
    'Suspenseful', 'Mysterious', 'Emotional', 'Dark', 'Funny',
    'Romantic', 'Inspirational', 'Serious', 'Lighthearted',
    'Dramatic', 'Epic', 'Scary'
  ];

  // Writing Styles list
  const stylesList: { style: WritingStyle; label: string; desc: string }[] = [
    { style: 'Cinematic', label: 'Cinematic', desc: 'Dynamic visual framing and pacing' },
    { style: 'Literary', label: 'Literary', desc: 'Artful prose, metaphors and lyrical cadence' },
    { style: 'Descriptive', label: 'Descriptive', desc: 'Vivid sensory world-building' },
    { style: 'Conversational', label: 'Conversational', desc: 'Accessible, character-driven voice' },
    { style: 'Fast-paced', label: 'Fast-Paced', desc: 'Rapid kinetic momentum' },
    { style: 'Detailed', label: 'Detailed', desc: 'Intricate world and psychological nuances' },
    { style: 'Simple', label: 'Simple', desc: 'Clean, direct, uncluttered prose' },
    { style: 'Professional', label: 'Professional', desc: 'Authoritative and polished execution' },
    { style: "Children's storytelling", label: "Children's", desc: 'Imaginative, warm and age-suited' },
    { style: 'Custom Style', label: 'Custom Style', desc: 'Your custom stylistic instructions' },
  ];

  // Audiences list
  const audienceList: TargetAudience[] = [
    'Young Adults', 'Adults', 'Teenagers', 'Children', 'General Audience'
  ];

  // Endings list
  const endingOptions: { ending: StoryEnding; label: string; desc: string }[] = [
    { ending: 'Twist Ending', label: 'Twist Ending', desc: 'A stunning yet earned revelation' },
    { ending: 'Happy Ending', label: 'Happy Ending', desc: 'Uplifting and emotionally rewarding' },
    { ending: 'Unexpected Ending', label: 'Unexpected Ending', desc: 'Subverts expectations creatively' },
    { ending: 'Open Ending', label: 'Open Ending', desc: 'Lingering questions and thought-provoking' },
    { ending: 'Sad Ending', label: 'Sad Ending', desc: 'Poignant, reflective, and touching' },
    { ending: 'Tragic Ending', label: 'Tragic Ending', desc: 'Inevitable fateful reckoning' },
    { ending: 'AI Decides', label: 'AI Decides', desc: 'Let the narrative flow organically' },
  ];

  // Tone toggle
  const toggleTone = (tone: StoryTone) => {
    if (selectedTones.includes(tone)) {
      if (selectedTones.length > 1) {
        setSelectedTones(selectedTones.filter((t) => t !== tone));
      }
    } else {
      setSelectedTones([...selectedTones, tone]);
    }
  };

  // Add character
  const handleAddCharacter = () => {
    if (!newChar.name.trim()) return;
    setCharacters([...characters, newChar]);
    setNewChar({
      name: '',
      age: '',
      role: 'Protagonist',
      personality: '',
      gender: '',
      details: '',
    });
    setShowAddCharForm(false);
  };

  const handleRemoveCharacter = (index: number) => {
    setCharacters(characters.filter((_, i) => i !== index));
  };

  // Apply inspiration preset
  const applyPreset = (preset: typeof inspirationPrompts[0]) => {
    setStoryIdea(preset.text);
    setSelectedGenre(preset.genre);
    setSelectedTones(preset.tones);
    setWritingStyle(preset.style);
    setErrorMsg('');
  };

  // Validation & Submit
  const handleGenerate = () => {
    if (!storyIdea.trim()) {
      setErrorMsg('Please enter a story idea before generating.');
      const el = document.getElementById('story-idea-input');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
      return;
    }
    setErrorMsg('');

    const payload: StoryGenerateRequest = {
      story_idea: storyIdea.trim(),
      genre: selectedGenre,
      custom_genre: selectedGenre === 'Custom Genre' ? customGenre.trim() : undefined,
      story_length: storyLength,
      tones: selectedTones,
      writing_style: writingStyle,
      custom_style: writingStyle === 'Custom Style' ? customStyle.trim() : undefined,
      target_audience: targetAudience,
      ending_preference: endingPreference,
      characters: characters.length > 0 ? characters : undefined,
      advanced_options: advancedOptions,
      demo_mode: isDemoMode,
    };

    onGenerate(payload);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pb-28">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-white">
              Create Your Story
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Enter your concept, pick your genre, and customize your storytelling settings.
            </p>
          </div>
          <button
            onClick={onLoadDemo}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-amber-300 border border-slate-700 hover:border-slate-600 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Load Sample Mystery
          </button>
        </div>
      </div>

      {/* Main Creation Card */}
      <div className="space-y-8">
        {/* ================================================================= */}
        {/* 1. STORY IDEA SECTION */}
        {/* ================================================================= */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 sm:p-7 shadow-xl">
          <div className="flex items-center justify-between mb-3">
            <label
              htmlFor="story-idea-input"
              className="font-heading font-bold text-base text-slate-200 flex items-center gap-2"
            >
              <span>1. Story Idea</span>
              <span className="text-rose-400 text-xs">*Required</span>
            </label>
            <span className="text-xs text-slate-400">
              {storyIdea.length} characters
            </span>
          </div>

          <textarea
            id="story-idea-input"
            rows={4}
            value={storyIdea}
            onChange={(e) => {
              setStoryIdea(e.target.value);
              if (errorMsg) setErrorMsg('');
            }}
            placeholder="Enter your short story idea... (Example: A young student discovers that his college library contains a book that predicts the future.)"
            className={`w-full rounded-xl bg-slate-950/80 border p-4 text-sm sm:text-base text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-sans leading-relaxed ${
              errorMsg ? 'border-rose-500/80 ring-1 ring-rose-500/50' : 'border-slate-800'
            }`}
          />

          {errorMsg && (
            <div className="mt-2 text-xs text-rose-400 flex items-center gap-1.5 font-medium">
              <AlertCircle className="w-4 h-4" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Quick Idea Presets */}
          <div className="mt-4 pt-4 border-t border-slate-800/80">
            <span className="text-xs font-semibold text-slate-400 block mb-2">
              Need inspiration? Pick a prompt to quick-start:
            </span>
            <div className="flex flex-wrap gap-2">
              {inspirationPrompts.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => applyPreset(p)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 hover:text-white border border-slate-700/80 transition-colors flex items-center gap-1.5"
                >
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  <span>{p.title}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ================================================================= */}
        {/* 2. GENRE SELECTION (16 Genres + Custom) */}
        {/* ================================================================= */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 sm:p-7 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-heading font-bold text-base text-slate-200">
                2. Select Primary Genre
              </h2>
              <p className="text-xs text-slate-400">
                Choose the genre that will govern narrative pacing, atmosphere, and tropes.
              </p>
            </div>
            <span className="text-xs font-semibold text-indigo-400">
              Selected: {selectedGenre}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5">
            {genresList.map((g) => {
              const isSelected = selectedGenre === g.genre;
              return (
                <button
                  key={g.genre}
                  type="button"
                  onClick={() => setSelectedGenre(g.genre)}
                  className={`p-3 rounded-xl border text-left transition-all relative flex flex-col justify-between ${
                    isSelected
                      ? 'bg-indigo-600/20 border-indigo-500 shadow-glow-indigo text-white'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-300 hover:bg-slate-800/50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="p-1 rounded-lg bg-slate-900/80 border border-slate-800">
                      {g.icon}
                    </span>
                    {isSelected && (
                      <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
                    )}
                  </div>
                  <div>
                    <div className="font-heading font-bold text-xs sm:text-sm">
                      {g.label}
                    </div>
                    <div className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">
                      {g.desc}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Custom Genre Input */}
          {selectedGenre === 'Custom Genre' && (
            <div className="mt-4 p-4 rounded-xl bg-slate-950/80 border border-indigo-500/40">
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Enter Your Custom Genre:
              </label>
              <input
                type="text"
                value={customGenre}
                onChange={(e) => setCustomGenre(e.target.value)}
                placeholder="e.g., Cyberpunk Solarpunk Noir, Cozy Supernatural Comedy..."
                className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3.5 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          )}
        </div>

        {/* ================================================================= */}
        {/* 3. STORY SETTINGS: Length, Tones, Style, Audience, Ending */}
        {/* ================================================================= */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 sm:p-7 shadow-xl space-y-7">
          <h2 className="font-heading font-bold text-base text-slate-200 border-b border-slate-800 pb-3">
            3. Story Customization Settings
          </h2>

          {/* A. Story Length */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Story Length Target
              </label>
              <span className="text-xs text-indigo-400 font-semibold">
                {lengthOptions.find((l) => l.length === storyLength)?.words}
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {lengthOptions.map((opt) => (
                <button
                  key={opt.length}
                  type="button"
                  onClick={() => setStoryLength(opt.length)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    storyLength === opt.length
                      ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-sm'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-300'
                  }`}
                >
                  <div className="font-bold text-xs sm:text-sm">{opt.label}</div>
                  <div className="text-[11px] text-amber-300 font-medium">{opt.words}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">{opt.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* B. Story Tone (Multi-select) */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Story Tone (Select Multiple)
              </label>
              <span className="text-xs text-slate-400">
                {selectedTones.length} selected
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {tonesList.map((tone) => {
                const isSelected = selectedTones.includes(tone);
                return (
                  <button
                    key={tone}
                    type="button"
                    onClick={() => toggleTone(tone)}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                      isSelected
                        ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm'
                        : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white'
                    }`}
                  >
                    {isSelected ? '✓ ' : ''}{tone}
                  </button>
                );
              })}
            </div>
          </div>

          {/* C. Writing Style */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Writing Style
              </label>
              <span className="text-xs text-slate-400">
                {stylesList.find((s) => s.style === writingStyle)?.desc}
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
              {stylesList.map((s) => (
                <button
                  key={s.style}
                  type="button"
                  onClick={() => setWritingStyle(s.style)}
                  className={`p-2.5 rounded-xl border text-center transition-all ${
                    writingStyle === s.style
                      ? 'bg-indigo-600/20 border-indigo-500 text-white'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-300'
                  }`}
                >
                  <div className="font-semibold text-xs">{s.label}</div>
                </button>
              ))}
            </div>

            {writingStyle === 'Custom Style' && (
              <div className="mt-3 p-3.5 rounded-xl bg-slate-950/80 border border-indigo-500/40">
                <input
                  type="text"
                  value={customStyle}
                  onChange={(e) => setCustomStyle(e.target.value)}
                  placeholder="Describe your writing style (e.g., Victorian gothic prose with rhythmic cadence...)"
                  className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3.5 py-2 text-xs sm:text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            )}
          </div>

          {/* D. Target Audience & Ending */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
            {/* Target Audience */}
            <div>
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-2">
                Target Audience
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {audienceList.map((aud) => (
                  <button
                    key={aud}
                    type="button"
                    onClick={() => setTargetAudience(aud)}
                    className={`p-2 rounded-lg border text-center text-xs font-medium transition-all ${
                      targetAudience === aud
                        ? 'bg-indigo-600/20 border-indigo-500 text-white'
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-300'
                    }`}
                  >
                    {aud}
                  </button>
                ))}
              </div>
            </div>

            {/* Story Ending */}
            <div>
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-2">
                Ending Preference
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-2 gap-2">
                {endingOptions.map((e) => (
                  <button
                    key={e.ending}
                    type="button"
                    onClick={() => setEndingPreference(e.ending)}
                    className={`p-2 rounded-lg border text-left transition-all ${
                      endingPreference === e.ending
                        ? 'bg-indigo-600/20 border-indigo-500 text-white'
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-300'
                    }`}
                  >
                    <div className="text-xs font-semibold">{e.label}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ================================================================= */}
        {/* 4. OPTIONAL CHARACTER SETTINGS */}
        {/* ================================================================= */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 sm:p-7 shadow-xl">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h2 className="font-heading font-bold text-base text-slate-200">
                4. Characters (Optional)
              </h2>
              <p className="text-xs text-slate-400">
                Define your own characters or leave blank—Gemini will automatically create suitable characters.
              </p>
            </div>
            {!showAddCharForm && (
              <button
                type="button"
                onClick={() => setShowAddCharForm(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Character
              </button>
            )}
          </div>

          {/* List of existing characters */}
          {characters.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
              {characters.map((c, idx) => (
                <div
                  key={idx}
                  className="bg-slate-950/70 border border-slate-800 rounded-xl p-3.5 flex items-start justify-between gap-3"
                >
                  <div>
                    <div className="font-bold text-sm text-slate-200 flex items-center gap-2">
                      <span>{c.name}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-400 font-normal">
                        {c.role} {c.age ? `• ${c.age}` : ''}
                      </span>
                    </div>
                    {c.personality && (
                      <p className="text-xs text-slate-400 mt-1">
                        <strong>Personality:</strong> {c.personality}
                      </p>
                    )}
                    {c.details && (
                      <p className="text-xs text-slate-400 mt-0.5">
                        {c.details}
                      </p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveCharacter(idx)}
                    className="text-slate-500 hover:text-rose-400 p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Add Character Form */}
          {showAddCharForm && (
            <div className="mt-4 p-4 rounded-xl bg-slate-950/80 border border-indigo-500/30 space-y-3">
              <div className="font-semibold text-xs text-slate-300">New Character Details</div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Name *</label>
                  <input
                    type="text"
                    value={newChar.name}
                    onChange={(e) => setNewChar({ ...newChar, name: e.target.value })}
                    placeholder="e.g. Arun"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Age</label>
                  <input
                    type="text"
                    value={newChar.age}
                    onChange={(e) => setNewChar({ ...newChar, age: e.target.value })}
                    placeholder="e.g. 20"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Role</label>
                  <input
                    type="text"
                    value={newChar.role}
                    onChange={(e) => setNewChar({ ...newChar, role: e.target.value })}
                    placeholder="e.g. Main protagonist"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Personality</label>
                  <input
                    type="text"
                    value={newChar.personality}
                    onChange={(e) => setNewChar({ ...newChar, personality: e.target.value })}
                    placeholder="e.g. Curious, brave, analytical"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Gender / Details</label>
                  <input
                    type="text"
                    value={newChar.details}
                    onChange={(e) => setNewChar({ ...newChar, details: e.target.value })}
                    placeholder="e.g. Carries an antique pocket watch"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddCharForm(false)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleAddCharacter}
                  disabled={!newChar.name.trim()}
                  className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white"
                >
                  Save Character
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ================================================================= */}
        {/* 5. ADVANCED STORY CONTROLS (Collapsible Section 12) */}
        {/* ================================================================= */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 sm:p-7 shadow-xl">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="w-full flex items-center justify-between text-left"
          >
            <div>
              <h2 className="font-heading font-bold text-base text-slate-200 flex items-center gap-2">
                <Sliders className="w-4 h-4 text-indigo-400" />
                <span>Advanced Story Controls</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Optional fine-tuning for setting, time period, complexity, dialogue ratio, and twists.
              </p>
            </div>
            {showAdvanced ? (
              <ChevronUp className="w-5 h-5 text-slate-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-slate-400" />
            )}
          </button>

          {showAdvanced && (
            <div className="mt-6 pt-6 border-t border-slate-800 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Setting / Environment
                  </label>
                  <input
                    type="text"
                    value={advancedOptions.setting || ''}
                    onChange={(e) => setAdvancedOptions({ ...advancedOptions, setting: e.target.value })}
                    placeholder="e.g. Subterranean university archives"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Time Period
                  </label>
                  <input
                    type="text"
                    value={advancedOptions.time_period || ''}
                    onChange={(e) => setAdvancedOptions({ ...advancedOptions, time_period: e.target.value })}
                    placeholder="e.g. Autumn 1928, Modern Day, 2140"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    value={advancedOptions.location || ''}
                    onChange={(e) => setAdvancedOptions({ ...advancedOptions, location: e.target.value })}
                    placeholder="e.g. Coastal Massachusetts"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Story Complexity
                  </label>
                  <select
                    value={advancedOptions.complexity}
                    onChange={(e) => setAdvancedOptions({ ...advancedOptions, complexity: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                  >
                    <option value="Simple">Simple & Linear</option>
                    <option value="Moderate">Moderate (Layered)</option>
                    <option value="Complex">Complex & Multi-Threaded</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Dialogue Amount
                  </label>
                  <select
                    value={advancedOptions.dialogue_amount}
                    onChange={(e) => setAdvancedOptions({ ...advancedOptions, dialogue_amount: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                  >
                    <option value="Minimal">Minimal (Atmospheric Narration)</option>
                    <option value="Balanced">Balanced (Standard Fiction)</option>
                    <option value="Dialogue-Heavy">Dialogue-Heavy (Banter & Interrogations)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Description Level
                  </label>
                  <select
                    value={advancedOptions.description_level}
                    onChange={(e) => setAdvancedOptions({ ...advancedOptions, description_level: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                  >
                    <option value="Concise">Concise & Action-Driven</option>
                    <option value="Balanced">Balanced</option>
                    <option value="Rich & Vivid">Rich, Sensory & Vivid</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Plot Twist Requirement (Optional)
                  </label>
                  <input
                    type="text"
                    value={advancedOptions.plot_twist || ''}
                    onChange={(e) => setAdvancedOptions({ ...advancedOptions, plot_twist: e.target.value })}
                    placeholder="e.g. The mentor was the actual culprit all along"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Moral / Message (Optional)
                  </label>
                  <input
                    type="text"
                    value={advancedOptions.moral || ''}
                    onChange={(e) => setAdvancedOptions({ ...advancedOptions, moral: e.target.value })}
                    placeholder="e.g. Knowledge comes with irreversible responsibility"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ================================================================= */}
        {/* 6. GENERATE STORY BUTTON (Section 13) */}
        {/* ================================================================= */}
        <div className="pt-4">
          <button
            type="button"
            onClick={handleGenerate}
            disabled={isGenerating}
            className="w-full py-4 px-8 rounded-2xl font-heading font-extrabold text-base sm:text-lg bg-gradient-to-r from-indigo-600 via-purple-600 to-amber-500 hover:from-indigo-500 hover:via-purple-500 hover:to-amber-400 text-white shadow-glow-indigo transition-all transform hover:-translate-y-0.5 disabled:opacity-50 flex items-center justify-center gap-3 cursor-pointer"
          >
            <Sparkles className="w-5 h-5 text-amber-300 animate-spin-slow" />
            <span>✨ Generate My Story</span>
          </button>
          <p className="text-center text-xs text-slate-500 mt-2.5">
            StoryForge AI will construct your Blueprint, develop characters, and draft your complete narrative.
          </p>
        </div>
      </div>
    </div>
  );
};
