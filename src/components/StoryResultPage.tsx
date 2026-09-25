import React, { useState } from 'react';
import {
  Sparkles,
  BookOpen,
  Layers,
  Users,
  ShieldCheck,
  Edit3,
  Copy,
  Download,
  RefreshCw,
  ArrowRight,
  Minimize2,
  Maximize2,
  FileText,
  Printer,
  Check,
  Sliders,
  Type,
  Sun,
  Moon,
  Clock,
  CheckCircle2,
  AlertCircle,
  Plus,
  Send,
  Wand2,
  Palette,
  Columns,
  Eye,
  Trash2,
  Image as ImageIcon,
  ExternalLink,
  Film
} from 'lucide-react';
import {
  CompleteStoryResponse,
  ViewTab,
  Chapter,
  StoryVersion,
  VisualScene,
  CharacterVisualProfile,
  LocationProfile,
  ImageVisualStyle
} from '../types';
import { exportStoryTxt, exportStoryPdf, exportStoryJson, exportVisualStoryPdf, downloadSceneImage } from '../utils/export';

interface StoryResultPageProps {
  story: CompleteStoryResponse;
  onRegenerate: () => void;
  onOpenImproveModal: () => void;
  onOpenContinueModal: () => void;
  onOpenRewriteModal: () => void;
  onShorten: () => void;
  onExpand: () => void;
  onOpenChapterModal: () => void;
  onEditSection: (selectedText: string, action: 'regenerate' | 'improve_paragraph' | 'make_dialogue_better' | 'make_description_more_detailed' | 'change_tone', toneGuidance?: string) => Promise<string>;
  onUpdateStoryContent: (newContent: string) => void;
  isActionLoading: boolean;
  actionLoadingMessage: string;

  // Feature 1: Story Versions
  versions: StoryVersion[];
  onSelectVersion: (version: StoryVersion) => void;
  onDeleteVersion: (versionId: string) => void;
  onOpenCompareModal: (versionA?: StoryVersion, versionB?: StoryVersion) => void;

  // Feature 2: Story to Image
  onOpenCreateImagesModal: () => void;
  scenes: VisualScene[];
  characterProfiles: CharacterVisualProfile[];
  locationProfiles: LocationProfile[];
  activeVisualStyle: ImageVisualStyle;
  onRegenerateIndividualScene: (sceneId: string) => void;
  onOpenEditPromptModal: (scene: VisualScene) => void;
  onRegenerateAllScenes: () => void;
  isImagesLoading: boolean;
}

export const StoryResultPage: React.FC<StoryResultPageProps> = ({
  story,
  onRegenerate,
  onOpenImproveModal,
  onOpenContinueModal,
  onOpenRewriteModal,
  onShorten,
  onExpand,
  onOpenChapterModal,
  onEditSection,
  onUpdateStoryContent,
  isActionLoading,
  actionLoadingMessage,
  versions,
  onSelectVersion,
  onDeleteVersion,
  onOpenCompareModal,
  onOpenCreateImagesModal,
  scenes,
  characterProfiles,
  locationProfiles,
  activeVisualStyle,
  onRegenerateIndividualScene,
  onOpenEditPromptModal,
  onRegenerateAllScenes,
  isImagesLoading,
}) => {
  // Navigation tabs
  const [activeTab, setActiveTab] = useState<ViewTab>('read');

  // Reader Customization State
  const [fontSize, setFontSize] = useState<'sm' | 'base' | 'lg' | 'xl'>('base');
  const [readerTheme, setReaderTheme] = useState<'dark' | 'sepia' | 'paper' | 'midnight'>('dark');
  const [fontFamily, setFontFamily] = useState<'serif' | 'sans' | 'cinzel'>('serif');

  // Feedback states
  const [copied, setCopied] = useState(false);
  const [copiedPromptSceneId, setCopiedPromptSceneId] = useState<string | null>(null);
  const [isConfirmingRegenAll, setIsConfirmingRegenAll] = useState(false);

  // Active Chapter (for multi-chapter views)
  const [selectedChapterIndex, setSelectedChapterIndex] = useState(0);

  // Inline Editor State
  const [editableText, setEditableText] = useState(story.story);
  const [isSaved, setIsSaved] = useState(true);

  // Text selection popover state
  const [selectedText, setSelectedText] = useState('');
  const [selectionActionLoading, setSelectionActionLoading] = useState(false);

  // Character profiles collapsible state
  const [showVisualProfiles, setShowVisualProfiles] = useState(false);

  // Handle Copy Story
  const handleCopyStory = () => {
    const fullText = story.chapters && story.chapters.length > 0
      ? story.chapters.map((c) => `### ${c.title}\n\n${c.content}`).join('\n\n---\n\n')
      : story.story;

    navigator.clipboard.writeText(`${story.title}\n\n${fullText}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleCopyPrompt = (sceneId: string, prompt: string) => {
    navigator.clipboard.writeText(prompt);
    setCopiedPromptSceneId(sceneId);
    setTimeout(() => setCopiedPromptSceneId(null), 2000);
  };

  // Font size classes
  const fontSizeClass = {
    sm: 'text-sm leading-relaxed',
    base: 'text-base leading-loose',
    lg: 'text-lg leading-loose',
    xl: 'text-xl leading-loose',
  }[fontSize];

  // Font family classes
  const fontFamilyClass = {
    serif: 'font-story',
    sans: 'font-sans',
    cinzel: 'font-cinzel',
  }[fontFamily];

  // Reader theme classes
  const themeClass = {
    dark: 'reader-theme-dark bg-[#0b0f19] text-slate-200 border-slate-800',
    sepia: 'reader-theme-sepia bg-[#fbf0d9] text-[#382d1f] border-[#e2d5ba]',
    paper: 'reader-theme-paper bg-[#f7f7f8] text-[#1a1e27] border-slate-300',
    midnight: 'reader-theme-midnight bg-[#030712] text-slate-300 border-slate-900',
  }[readerTheme];

  // Text selection listener for quick action bar
  const handleTextSelection = () => {
    const selection = window.getSelection();
    if (selection && selection.toString().trim().length > 5) {
      setSelectedText(selection.toString().trim());
    }
  };

  // Execute quick section edit
  const handleApplySectionEdit = async (
    action: 'regenerate' | 'improve_paragraph' | 'make_dialogue_better' | 'make_description_more_detailed' | 'change_tone'
  ) => {
    if (!selectedText) return;
    setSelectionActionLoading(true);
    try {
      const replacement = await onEditSection(selectedText, action);
      if (replacement) {
        const updated = editableText.replace(selectedText, replacement);
        setEditableText(updated);
        onUpdateStoryContent(updated);
        setSelectedText('');
      }
    } finally {
      setSelectionActionLoading(false);
    }
  };

  const handleSaveEditor = () => {
    onUpdateStoryContent(editableText);
    setIsSaved(true);
  };

  const currentDisplayContent = story.chapters && story.chapters.length > 0 && selectedChapterIndex < story.chapters.length
    ? story.chapters[selectedChapterIndex].content
    : story.story;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-32">
      {/* Top Banner: Title, Genre, Tone, Word count, Reading time */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-md mb-8">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-800/80">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                {story.genre}
              </span>
              {story.tones.map((t) => (
                <span
                  key={t}
                  className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-800 text-slate-300 border border-slate-700"
                >
                  {t}
                </span>
              ))}
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-purple-500/20 text-purple-300 border border-purple-500/30">
                Style: {story.writing_style}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-amber-500/20 text-amber-300 border border-amber-500/30">
                {story.ending_type}
              </span>
              {story.is_demo && (
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/30 text-amber-300 border border-amber-400">
                  Demo Mode
                </span>
              )}
            </div>

            <h1 className="font-heading font-extrabold text-2xl sm:text-4xl text-white tracking-tight">
              {story.title}
            </h1>
          </div>

          {/* Metrics Pills */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>{story.reading_time}</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300">
              <FileText className="w-3.5 h-3.5 text-indigo-400" />
              <span>{story.word_count} words</span>
            </div>
          </div>
        </div>

        {/* =================================================================== */}
        {/* TOP ACTION BAR REQUIRED BY SPEC: [Edit] [Improve] [Continue] [🔄 Regenerate Story] [🎨 Create Images] */}
        {/* =================================================================== */}
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            {/* Edit */}
            <button
              onClick={() => setActiveTab('editor')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors ${
                activeTab === 'editor'
                  ? 'bg-indigo-600 text-white border-indigo-500'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
              }`}
              title="Open the inline story editor"
            >
              <Edit3 className="w-3.5 h-3.5 text-slate-300" />
              <span>Edit</span>
            </button>

            {/* Improve Story */}
            <button
              onClick={onOpenImproveModal}
              disabled={isActionLoading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 transition-colors disabled:opacity-50"
              title="Improve plot, characters, dialogue, descriptions, or pacing"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Improve</span>
            </button>

            {/* Continue Story */}
            <button
              onClick={onOpenContinueModal}
              disabled={isActionLoading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/40 transition-colors disabled:opacity-50"
              title="Continue narrative with a plot twist or next event"
            >
              <ArrowRight className="w-3.5 h-3.5 text-purple-400" />
              <span>Continue &rarr;</span>
            </button>

            {/* FEATURE 1: Highly Visible 🔄 Regenerate Story */}
            <button
              onClick={onRegenerate}
              disabled={isActionLoading}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white shadow-glow-indigo transition-all disabled:opacity-50"
              title="Generate a genuinely new version with different plot progression"
            >
              <RefreshCw className="w-3.5 h-3.5 text-amber-300" />
              <span>🔄 Regenerate Story</span>
            </button>

            {/* FEATURE 2: Major Button 🎨 Create Images */}
            <button
              onClick={onOpenCreateImagesModal}
              disabled={isImagesLoading}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white shadow-lg shadow-pink-500/20 transition-all disabled:opacity-50"
              title="Transform story into visual scenes with character consistency"
            >
              <Palette className="w-3.5 h-3.5 text-pink-200" />
              <span>🎨 Create Images</span>
            </button>

            {/* Story Versions Quick Nav */}
            <button
              onClick={() => setActiveTab('versions')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors ${
                activeTab === 'versions'
                  ? 'bg-purple-600 text-white border-purple-500'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
              }`}
              title="View all saved story versions and compare them"
            >
              <Columns className="w-3.5 h-3.5 text-purple-400" />
              <span>Versions ({versions.length})</span>
            </button>

            {/* Rewrite */}
            <button
              onClick={onOpenRewriteModal}
              disabled={isActionLoading}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700/80 transition-colors disabled:opacity-50"
              title="Rewrite with altered genre, tone, style, or ending"
            >
              <Sliders className="w-3.5 h-3.5 text-cyan-400" />
              <span>Rewrite</span>
            </button>

            {/* Shorten */}
            <button
              onClick={onShorten}
              disabled={isActionLoading}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700/80 transition-colors disabled:opacity-50"
              title="Create a concise, tighter version"
            >
              <Minimize2 className="w-3.5 h-3.5 text-amber-400" />
              <span>Shorten</span>
            </button>

            {/* Expand */}
            <button
              onClick={onExpand}
              disabled={isActionLoading}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700/80 transition-colors disabled:opacity-50"
              title="Enrich scenes, dialogue, and atmospheric world-building"
            >
              <Maximize2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Expand</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            {/* Copy Story */}
            <button
              onClick={handleCopyStory}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
                copied
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
              }`}
              title="Copy complete story text to clipboard"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy'}</span>
            </button>

            {/* Download TXT */}
            <button
              onClick={() => exportStoryTxt(story)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
              title="Download manuscript text file"
            >
              <Download className="w-3.5 h-3.5 text-indigo-400" />
              <span>TXT</span>
            </button>

            {/* Download PDF */}
            <button
              onClick={() => exportStoryPdf(story)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-glow-indigo transition-all"
              title="Open print-formatted PDF book layout"
            >
              <Printer className="w-3.5 h-3.5 text-amber-300" />
              <span>PDF</span>
            </button>
          </div>
        </div>

        {/* Loading status bar if action in flight */}
        {isActionLoading && (
          <div className="mt-4 p-3 rounded-xl bg-indigo-950/40 border border-indigo-500/30 flex items-center gap-3 text-xs text-indigo-300 animate-pulse">
            <Sparkles className="w-4 h-4 text-amber-400 animate-spin-slow" />
            <span>{actionLoadingMessage || 'Applying AI transformation...'}</span>
          </div>
        )}
      </div>

      {/* =================================================================== */}
      {/* WORKSPACE NAVIGATION TABS */}
      {/* =================================================================== */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3 mb-6">
        <div className="flex flex-wrap items-center gap-2">
          {[
            { id: 'read' as ViewTab, label: 'Story Reader', icon: <BookOpen className="w-4 h-4" /> },
            { id: 'images' as ViewTab, label: `Your Story in Images (${scenes.length})`, icon: <Palette className="w-4 h-4 text-pink-400" /> },
            { id: 'visual-story' as ViewTab, label: 'Visual Storybook', icon: <Film className="w-4 h-4 text-cyan-400" /> },
            { id: 'storyboard' as ViewTab, label: 'Storyboard View', icon: <ImageIcon className="w-4 h-4 text-amber-400" /> },
            { id: 'versions' as ViewTab, label: `Story Versions (${versions.length})`, icon: <Columns className="w-4 h-4 text-purple-400" /> },
            { id: 'blueprint' as ViewTab, label: 'Story Blueprint', icon: <Layers className="w-4 h-4" /> },
            { id: 'characters' as ViewTab, label: 'Character Bible', icon: <Users className="w-4 h-4" /> },
            { id: 'quality' as ViewTab, label: 'AI Quality Check', icon: <ShieldCheck className="w-4 h-4" /> },
            { id: 'chapters' as ViewTab, label: `Chapters (${story.chapters?.length || 1})`, icon: <BookOpen className="w-4 h-4 text-amber-400" /> },
            { id: 'editor' as ViewTab, label: 'Story Editor', icon: <Edit3 className="w-4 h-4" /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === tab.id
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-slate-800'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Reader Customization (when Reader tab active) */}
        {activeTab === 'read' && (
          <div className="flex items-center gap-3 bg-slate-900/90 border border-slate-800 px-3 py-1.5 rounded-xl text-xs">
            {/* Font Family */}
            <div className="flex items-center gap-1 border-r border-slate-800 pr-2">
              <button
                onClick={() => setFontFamily('serif')}
                className={`px-2 py-0.5 rounded text-[11px] font-story ${fontFamily === 'serif' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}
              >
                Serif
              </button>
              <button
                onClick={() => setFontFamily('sans')}
                className={`px-2 py-0.5 rounded text-[11px] font-sans ${fontFamily === 'sans' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}
              >
                Sans
              </button>
            </div>

            {/* Font Size */}
            <div className="flex items-center gap-1 border-r border-slate-800 pr-2">
              <button
                onClick={() => setFontSize('sm')}
                className={`px-2 py-0.5 rounded text-[11px] ${fontSize === 'sm' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}
              >
                A-
              </button>
              <button
                onClick={() => setFontSize('base')}
                className={`px-2 py-0.5 rounded text-[11px] ${fontSize === 'base' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}
              >
                A
              </button>
              <button
                onClick={() => setFontSize('lg')}
                className={`px-2 py-0.5 rounded text-[11px] ${fontSize === 'lg' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}
              >
                A+
              </button>
            </div>

            {/* Theme */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => setReaderTheme('dark')}
                className={`w-5 h-5 rounded-full bg-[#0b0f19] border ${readerTheme === 'dark' ? 'ring-2 ring-indigo-500 border-white' : 'border-slate-700'}`}
                title="Dark theme"
              />
              <button
                onClick={() => setReaderTheme('sepia')}
                className={`w-5 h-5 rounded-full bg-[#fbf0d9] border ${readerTheme === 'sepia' ? 'ring-2 ring-indigo-500 border-amber-800' : 'border-slate-400'}`}
                title="Sepia theme"
              />
              <button
                onClick={() => setReaderTheme('paper')}
                className={`w-5 h-5 rounded-full bg-[#f7f7f8] border ${readerTheme === 'paper' ? 'ring-2 ring-indigo-500 border-slate-800' : 'border-slate-400'}`}
                title="Clean paper theme"
              />
              <button
                onClick={() => setReaderTheme('midnight')}
                className={`w-5 h-5 rounded-full bg-[#030712] border ${readerTheme === 'midnight' ? 'ring-2 ring-indigo-500 border-blue-400' : 'border-slate-700'}`}
                title="Midnight theme"
              />
            </div>
          </div>
        )}
      </div>

      {/* =================================================================== */}
      {/* TAB 1: STORY READER VIEW */}
      {/* =================================================================== */}
      {activeTab === 'read' && (
        <div className="relative">
          {/* Floating Context Toolbar for selected text */}
          {selectedText && (
            <div className="sticky top-20 z-30 mb-4 p-3 rounded-2xl bg-indigo-950/95 border border-indigo-500/40 shadow-2xl backdrop-blur-xl flex flex-wrap items-center justify-between gap-3 animate-fadeIn">
              <div className="flex items-center gap-2 max-w-sm truncate text-xs text-indigo-200">
                <Wand2 className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="truncate">
                  Selected: "{selectedText.slice(0, 50)}..."
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  disabled={selectionActionLoading}
                  onClick={() => handleApplySectionEdit('improve_paragraph')}
                  className="px-2.5 py-1 rounded-lg text-xs font-medium bg-indigo-600 hover:bg-indigo-500 text-white"
                >
                  Improve Paragraph
                </button>
                <button
                  disabled={selectionActionLoading}
                  onClick={() => handleApplySectionEdit('make_dialogue_better')}
                  className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
                >
                  Make Dialogue Better
                </button>
                <button
                  disabled={selectionActionLoading}
                  onClick={() => handleApplySectionEdit('make_description_more_detailed')}
                  className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
                >
                  Vivid Descriptions
                </button>
                <button
                  disabled={selectionActionLoading}
                  onClick={() => handleApplySectionEdit('regenerate')}
                  className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
                >
                  Regenerate
                </button>
                <button
                  onClick={() => setSelectedText('')}
                  className="px-2 py-1 text-xs text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              </div>
            </div>
          )}

          {/* Reading Layout Box */}
          <div
            onMouseUp={handleTextSelection}
            className={`rounded-3xl border p-8 sm:p-14 shadow-2xl transition-all ${themeClass} ${fontFamilyClass}`}
          >
            {/* Story Header in Reader */}
            <div className="text-center max-w-2xl mx-auto mb-12 pb-8 border-b border-current/15">
              <span className="text-xs uppercase tracking-widest opacity-60 font-sans block mb-2">
                A {story.genre} Narrative
              </span>
              <h1 className="font-heading font-extrabold text-3xl sm:text-5xl tracking-tight mb-4">
                {story.title}
              </h1>
              <p className="italic text-sm sm:text-base opacity-75 max-w-lg mx-auto">
                {story.blueprint.premise}
              </p>
            </div>

            {/* Story Paragraphs */}
            <div className={`max-w-3xl mx-auto space-y-6 ${fontSizeClass}`}>
              {currentDisplayContent.split('\n\n').map((para, idx) => {
                const cleanPara = para.trim();
                if (!cleanPara) return null;
                const isFirst = idx === 0;

                return (
                  <p
                    key={idx}
                    className={`leading-relaxed ${isFirst ? 'story-dropcap' : ''}`}
                  >
                    {cleanPara}
                  </p>
                );
              })}
            </div>

            {/* End Mark */}
            <div className="text-center mt-16 pt-8 border-t border-current/10 opacity-50 font-sans text-xs">
              &bull; &bull; &bull;
              <div className="mt-1">The End ({story.ending_type})</div>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* FEATURE 2: TAB — YOUR STORY IN IMAGES (Gallery View) */}
      {/* =================================================================== */}
      {activeTab === 'images' && (
        <div className="space-y-6">
          {scenes.length === 0 ? (
            <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-12 text-center max-w-2xl mx-auto">
              <div className="w-16 h-16 mx-auto rounded-3xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center mb-4">
                <Palette className="w-8 h-8 text-pink-400" />
              </div>
              <h2 className="font-heading font-extrabold text-2xl text-white mb-2">
                Your Story Has Not Been Visualized Yet
              </h2>
              <p className="text-xs text-slate-400 max-w-md mx-auto mb-6">
                Transform your narrative into structured visual moments with consistent character profiles and location styling.
              </p>
              <button
                onClick={onOpenCreateImagesModal}
                className="px-6 py-3 rounded-2xl text-xs font-bold bg-gradient-to-r from-pink-600 to-indigo-600 hover:from-pink-500 hover:to-indigo-500 text-white shadow-glow-indigo transition-all"
              >
                🎨 Create Images for Story
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Gallery Header Bar */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-7 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-pink-500/20 text-pink-300 border border-pink-500/30">
                      Visual Style: {activeVisualStyle}
                    </span>
                    <span className="text-xs text-slate-400">
                      {scenes.length} Chronological Scenes
                    </span>
                  </div>
                  <h2 className="font-heading font-extrabold text-xl text-white">
                    Your Story in Images
                  </h2>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => setShowVisualProfiles(!showVisualProfiles)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
                  >
                    <Users className="w-3.5 h-3.5 text-indigo-400" />
                    <span>{showVisualProfiles ? 'Hide Profiles' : 'Character & Location Anchors'}</span>
                  </button>

                  <button
                    onClick={() => setIsConfirmingRegenAll(true)}
                    disabled={isImagesLoading}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors disabled:opacity-50"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
                    <span>Regenerate All</span>
                  </button>

                  <button
                    onClick={() => exportVisualStoryPdf(story, scenes)}
                    className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-glow-indigo transition-all"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Export Visual Story PDF</span>
                  </button>
                </div>
              </div>

              {/* Character & Location Consistency Profiles Viewer (Collapsible) */}
              {showVisualProfiles && (
                <div className="bg-slate-900/90 border border-indigo-500/30 rounded-3xl p-6 space-y-5 animate-fadeIn">
                  <div>
                    <h3 className="font-heading font-bold text-xs uppercase tracking-wider text-pink-400 mb-2 flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      <span>Character Consistency Visual Profiles ({characterProfiles.length})</span>
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {characterProfiles.map((cp, idx) => (
                        <div key={idx} className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 text-xs">
                          <div className="font-bold text-white text-sm mb-1">{cp.name}</div>
                          <p className="text-slate-400 text-[11px] leading-relaxed mb-2">
                            <strong>Anchor Appearance:</strong> {cp.clothing || cp.face_description}
                          </p>
                          <div className="p-2 rounded bg-slate-900 border border-slate-800 text-[10px] text-indigo-300 font-mono">
                            {cp.appearance_prompt_snippet}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {locationProfiles.length > 0 && (
                    <div className="pt-4 border-t border-slate-800">
                      <h3 className="font-heading font-bold text-xs uppercase tracking-wider text-cyan-400 mb-2 flex items-center gap-2">
                        <Layers className="w-4 h-4" />
                        <span>Consistent Location Anchors ({locationProfiles.length})</span>
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {locationProfiles.map((lp, idx) => (
                          <div key={idx} className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 text-xs">
                            <div className="font-bold text-white mb-1">{lp.name}</div>
                            <p className="text-slate-400 text-[11px] leading-relaxed mb-2">
                              {lp.architecture} &bull; {lp.lighting}
                            </p>
                            <div className="p-2 rounded bg-slate-900 border border-slate-800 text-[10px] text-cyan-300 font-mono">
                              {lp.location_prompt_snippet}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Responsive Image Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {scenes.map((scene) => (
                  <div
                    key={scene.scene_id}
                    className="bg-slate-900/80 border border-slate-800 rounded-3xl overflow-hidden flex flex-col justify-between hover:border-slate-700 transition-all shadow-xl group"
                  >
                    <div>
                      {/* Image Frame */}
                      <div className="relative aspect-[16/10] bg-slate-950 overflow-hidden flex items-center justify-center">
                        {scene.image_url ? (
                          <img
                            src={scene.image_url}
                            alt={scene.title}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        ) : (
                          <div className="p-6 text-center text-xs text-slate-400 flex flex-col items-center justify-center">
                            <AlertCircle className="w-8 h-8 text-amber-400 mb-2" />
                            <div className="font-semibold text-slate-200 mb-1">
                              Image generation is not configured yet.
                            </div>
                            <p className="text-[11px] text-slate-500 line-clamp-3 mb-3">
                              {scene.image_prompt}
                            </p>
                            <button
                              onClick={() => handleCopyPrompt(scene.scene_id, scene.image_prompt)}
                              className="px-3 py-1 rounded-lg text-xs font-semibold bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-600 hover:text-white transition-all flex items-center gap-1.5"
                            >
                              {copiedPromptSceneId === scene.scene_id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                              <span>{copiedPromptSceneId === scene.scene_id ? 'Copied!' : 'Copy Image Prompt'}</span>
                            </button>
                          </div>
                        )}

                        {/* Scene Badge */}
                        <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-slate-950/80 backdrop-blur-md border border-slate-700 text-xs font-bold text-white">
                          Scene {scene.scene_number}
                        </div>
                      </div>

                      {/* Scene Text & Context */}
                      <div className="p-5 space-y-3">
                        <div>
                          <h3 className="font-heading font-bold text-base text-white">
                            {scene.title}
                          </h3>
                          <div className="text-[11px] text-indigo-400 font-medium mt-0.5">
                            {scene.location_name} {scene.characters_involved.length > 0 ? `• ${scene.characters_involved.join(', ')}` : ''}
                          </div>
                        </div>

                        <p className="text-xs text-slate-300 leading-relaxed">
                          {scene.description}
                        </p>

                        {scene.story_excerpt && (
                          <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 text-[11px] text-slate-400 italic">
                            "{scene.story_excerpt}"
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Scene Card Actions */}
                    <div className="p-4 pt-0 border-t border-slate-800/80 mt-3 flex items-center justify-between gap-1 text-xs">
                      {/* Regenerate Image */}
                      <button
                        onClick={() => onRegenerateIndividualScene(scene.scene_id)}
                        disabled={isImagesLoading}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                        title="Regenerate only this scene keeping character and location consistency"
                      >
                        <RefreshCw className="w-3 h-3 text-indigo-400" />
                        <span>Regenerate</span>
                      </button>

                      {/* Edit Prompt */}
                      <button
                        onClick={() => onOpenEditPromptModal(scene)}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                        title="Manually modify image prompt for this scene"
                      >
                        <Edit3 className="w-3 h-3 text-amber-400" />
                        <span>Edit Prompt</span>
                      </button>

                      {/* Copy Prompt */}
                      <button
                        onClick={() => handleCopyPrompt(scene.scene_id, scene.image_prompt)}
                        className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                        title="Copy synthesized prompt"
                      >
                        {copiedPromptSceneId === scene.scene_id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      </button>

                      {/* Download */}
                      {scene.image_url && (
                        <button
                          onClick={() => downloadSceneImage(scene.image_url!, scene.scene_number, scene.title)}
                          className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                          title="Download high-resolution image"
                        >
                          <Download className="w-3 h-3 text-cyan-400" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* =================================================================== */}
      {/* FEATURE 2: TAB — VISUAL STORYBOOK (Reading Mode with Images) */}
      {/* =================================================================== */}
      {activeTab === 'visual-story' && (
        <div className="space-y-8 max-w-4xl mx-auto">
          {scenes.length === 0 ? (
            <div className="text-center py-16 bg-slate-900/80 border border-slate-800 rounded-3xl p-8">
              <Film className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <h3 className="font-heading font-bold text-lg text-white mb-2">No Visual Storybook Available</h3>
              <p className="text-xs text-slate-400 mb-6">Create images for this story to unlock the illustrated visual storybook mode.</p>
              <button
                onClick={onOpenCreateImagesModal}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-pink-600 hover:bg-pink-500 text-white"
              >
                🎨 Create Images
              </button>
            </div>
          ) : (
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-8 sm:p-14 shadow-2xl space-y-14">
              {/* Header */}
              <div className="text-center pb-8 border-b border-slate-800">
                <span className="text-xs font-bold uppercase tracking-widest text-indigo-400 mb-2 block">
                  Illustrated Visual Storybook
                </span>
                <h1 className="font-heading font-extrabold text-3xl sm:text-5xl text-white tracking-tight mb-3">
                  {story.title}
                </h1>
                <p className="text-slate-300 italic text-sm max-w-lg mx-auto">
                  {story.blueprint.premise}
                </p>
              </div>

              {/* Sequential Scenes */}
              {scenes.map((scene, idx) => (
                <div key={scene.scene_id} className="space-y-6 pb-12 border-b border-slate-800/80 last:border-b-0">
                  {/* Scene Image */}
                  {scene.image_url ? (
                    <div className="rounded-2xl overflow-hidden border border-slate-800 shadow-2xl bg-slate-950 aspect-[16/9]">
                      <img
                        src={scene.image_url}
                        alt={scene.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="p-8 rounded-2xl bg-slate-950 border border-slate-800 text-center text-xs text-slate-400">
                      <div className="font-bold text-slate-300 mb-1">Scene {idx + 1}: {scene.title}</div>
                      <p className="text-[11px] text-slate-500 italic max-w-md mx-auto">{scene.description}</p>
                    </div>
                  )}

                  {/* Scene Narrative Information */}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-indigo-500/20 text-indigo-300">
                        Scene {scene.scene_number}
                      </span>
                      <h2 className="font-heading font-extrabold text-xl sm:text-2xl text-white">
                        {scene.title}
                      </h2>
                    </div>

                    <p className="text-xs text-amber-300/90 font-medium mb-3">
                      {scene.description}
                    </p>

                    {scene.story_excerpt && (
                      <p className="font-story text-base text-slate-200 leading-relaxed pl-4 border-l-2 border-indigo-500">
                        {scene.story_excerpt}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* =================================================================== */}
      {/* FEATURE 2: TAB — STORYBOARD VIEW */}
      {/* =================================================================== */}
      {activeTab === 'storyboard' && (
        <div className="space-y-6">
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="font-heading font-extrabold text-xl text-white">
                  Visual Storyboard Progression
                </h2>
                <p className="text-xs text-slate-400">
                  Sequential timeline of all narrative camera shots and key visual moments
                </p>
              </div>

              {scenes.length > 0 && (
                <button
                  onClick={() => exportVisualStoryPdf(story, scenes)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Download Storyboard PDF</span>
                </button>
              )}
            </div>

            {scenes.length === 0 ? (
              <div className="text-center py-12 text-xs text-slate-400">
                Click "Create Images" to generate the storyboard.
              </div>
            ) : (
              <div className="space-y-4">
                {scenes.map((sc, idx) => (
                  <div
                    key={sc.scene_id}
                    className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 flex flex-col md:flex-row items-center gap-6"
                  >
                    {/* Thumbnail */}
                    <div className="w-full md:w-64 aspect-[16/10] rounded-xl overflow-hidden bg-slate-900 shrink-0 border border-slate-800">
                      {sc.image_url ? (
                        <img src={sc.image_url} alt={sc.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[11px] text-slate-500">
                          Scene {sc.scene_number}
                        </div>
                      )}
                    </div>

                    {/* Breakdown */}
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-indigo-600/30 text-indigo-300 font-mono font-bold text-xs flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <h3 className="font-heading font-bold text-base text-white">
                          {sc.title}
                        </h3>
                      </div>

                      <p className="text-xs text-slate-300">{sc.description}</p>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-[11px] text-slate-400">
                        <div>
                          <strong className="text-slate-300 block">Angle:</strong>
                          {sc.camera_angle}
                        </div>
                        <div>
                          <strong className="text-slate-300 block">Lighting:</strong>
                          {sc.lighting}
                        </div>
                        <div>
                          <strong className="text-slate-300 block">Location:</strong>
                          {sc.location_name}
                        </div>
                        <div>
                          <strong className="text-slate-300 block">Mood:</strong>
                          {sc.mood}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* FEATURE 1: TAB — STORY VERSIONS & COMPARISON */}
      {/* =================================================================== */}
      {activeTab === 'versions' && (
        <div className="space-y-6">
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="font-heading font-extrabold text-xl text-white">
                  Story Versions ({versions.length})
                </h2>
                <p className="text-xs text-slate-400">
                  Switch between alternative narrative interpretations or compare their differences
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => onOpenCompareModal()}
                  disabled={versions.length < 2}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white shadow-sm transition-all disabled:opacity-50"
                  title={versions.length < 2 ? 'Generate at least two versions to compare' : 'Compare two versions'}
                >
                  <Columns className="w-3.5 h-3.5" />
                  <span>Compare Versions</span>
                </button>

                <button
                  onClick={onRegenerate}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-glow-indigo transition-all"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>🔄 Generate Another Version</span>
                </button>
              </div>
            </div>

            {/* Versions List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {versions.map((ver) => {
                const isCurrentActive = ver.title === story.title;

                return (
                  <div
                    key={ver.version_id}
                    className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                      isCurrentActive
                        ? 'bg-indigo-950/30 border-indigo-500/60 ring-1 ring-indigo-500'
                        : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
                        <div className="flex items-center gap-2">
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                            isCurrentActive ? 'bg-indigo-500 text-white' : 'bg-slate-800 text-slate-300'
                          }`}>
                            Version {ver.version_number}
                          </span>
                          {isCurrentActive && (
                            <span className="text-[11px] font-semibold text-emerald-400">
                              Active Story
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-slate-500">
                          {ver.created_at || 'Saved in session'}
                        </span>
                      </div>

                      <h3 className="font-heading font-extrabold text-base text-white mb-1">
                        {ver.title}
                      </h3>

                      <p className="text-xs text-slate-300 leading-relaxed mb-3">
                        "{ver.summary || ver.story_data.blueprint.premise}"
                      </p>

                      <div className="text-[11px] text-slate-400 space-y-1">
                        <div>
                          <strong className="text-slate-300">Regeneration Note:</strong> {ver.regeneration_note || 'Initial generation'}
                        </div>
                        <div>
                          <strong className="text-slate-300">Words:</strong> {ver.story_data.word_count} words
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-slate-800/80 mt-4 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onSelectVersion(ver)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                            isCurrentActive
                              ? 'bg-slate-800 text-slate-400 cursor-default'
                              : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                          }`}
                          disabled={isCurrentActive}
                        >
                          {isCurrentActive ? 'Active Version' : 'Restore / Switch'}
                        </button>

                        <button
                          onClick={() => onOpenCompareModal(ver)}
                          className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
                        >
                          Compare
                        </button>
                      </div>

                      {versions.length > 1 && (
                        <button
                          onClick={() => onDeleteVersion(ver.version_id)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-950/30 transition-colors"
                          title="Delete version"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* TAB 2: STORY BLUEPRINT VIEW */}
      {/* =================================================================== */}
      {activeTab === 'blueprint' && (
        <div className="space-y-6">
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8">
            <h2 className="font-heading font-extrabold text-xl text-white mb-2 flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-400" />
              <span>Story Blueprint & Structural Architecture</span>
            </h2>
            <p className="text-xs text-slate-400 mb-6">
              The internal narrative blueprint developed by Gemini before prose generation.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Core Premise
                </div>
                <p className="text-sm text-slate-200 leading-relaxed">
                  {story.blueprint.premise}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Central Conflict & Stakes
                </div>
                <p className="text-sm text-slate-200 leading-relaxed">
                  {story.blueprint.main_conflict}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Atmospheric Setting
                </div>
                <p className="text-sm text-slate-200 leading-relaxed">
                  {story.blueprint.setting}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Thematic Resonance & Moral
                </div>
                <p className="text-sm text-slate-200 leading-relaxed">
                  {story.blueprint.theme}
                </p>
              </div>
            </div>

            {/* 5-Act Narrative Arc */}
            <div className="mt-8">
              <h3 className="font-heading font-bold text-base text-slate-200 mb-4">
                5-Act Narrative Arc
              </h3>
              <div className="space-y-3">
                {[
                  { act: 'Act 1: Introduction', desc: story.blueprint.plot.introduction, color: 'text-indigo-400' },
                  { act: 'Act 2: Rising Action', desc: story.blueprint.plot.rising_action, color: 'text-purple-400' },
                  { act: 'Act 3: Climax', desc: story.blueprint.plot.climax, color: 'text-amber-400 font-bold' },
                  { act: 'Act 4: Falling Action', desc: story.blueprint.plot.falling_action, color: 'text-cyan-400' },
                  { act: 'Act 5: Resolution', desc: story.blueprint.plot.resolution, color: 'text-emerald-400' },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-start gap-4"
                  >
                    <span className="w-6 h-6 rounded-lg bg-slate-800 text-xs font-mono font-bold flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <div>
                      <div className={`font-heading font-bold text-xs uppercase tracking-wider ${item.color}`}>
                        {item.act}
                      </div>
                      <p className="text-xs sm:text-sm text-slate-300 mt-1 leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* TAB 3: CHARACTER BIBLE VIEW */}
      {/* =================================================================== */}
      {activeTab === 'characters' && (
        <div className="space-y-6">
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8">
            <h2 className="font-heading font-extrabold text-xl text-white mb-2 flex items-center gap-2">
              <Users className="w-5 h-5 text-purple-400" />
              <span>Character Bible ({story.characters.length} Profiles)</span>
            </h2>
            <p className="text-xs text-slate-400 mb-6">
              Psychological profiles ensuring consistency of voices, motivations, and transformation.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {story.characters.map((c, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl bg-slate-950/80 border border-slate-800 p-5 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-800 mb-3">
                      <div>
                        <h3 className="font-heading font-bold text-base text-white">
                          {c.name}
                        </h3>
                        <span className="text-xs text-indigo-400 font-semibold">
                          {c.role} {c.age ? `• Age ${c.age}` : ''}
                        </span>
                      </div>
                      <span className="w-8 h-8 rounded-xl bg-slate-800 flex items-center justify-center text-sm font-bold text-amber-400">
                        {c.name.charAt(0)}
                      </span>
                    </div>

                    <div className="space-y-2 text-xs text-slate-300">
                      <div>
                        <strong className="text-slate-400">Personality:</strong> {c.personality}
                      </div>
                      <div>
                        <strong className="text-slate-400">Motivation:</strong> {c.motivation}
                      </div>
                      <div>
                        <strong className="text-slate-400">Immediate Goal:</strong> {c.goal}
                      </div>
                      <div>
                        <strong className="text-slate-400">Deepest Fear:</strong> {c.fear}
                      </div>
                      <div>
                        <strong className="text-slate-400">Strength:</strong> {c.strength}
                      </div>
                      <div>
                        <strong className="text-slate-400">Fatal Weakness:</strong> {c.weakness}
                      </div>
                      {c.relationships && (
                        <div>
                          <strong className="text-slate-400">Relationships:</strong> {c.relationships}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-400">
                    <strong className="text-slate-300 block mb-0.5">Character Arc:</strong>
                    {c.character_arc}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* TAB 4: AI STORY QUALITY CHECK VIEW */}
      {/* =================================================================== */}
      {activeTab === 'quality' && (
        <div className="space-y-6">
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8">
            <h2 className="font-heading font-extrabold text-xl text-white mb-2 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <span>AI Story Quality Check</span>
            </h2>
            <p className="text-xs text-slate-400 mb-6">
              Multi-dimensional analysis validating narrative coherence, character motivation, and genre execution.
            </p>

            <div className="p-6 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 mb-8">
              <div className="font-heading font-extrabold text-base text-emerald-300 mb-4 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span>AI Story Quality Check</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="flex items-center gap-2 font-semibold text-sm text-emerald-200">
                  <span className="text-emerald-400 font-bold">✓</span>
                  <span>Plot consistency</span>
                </div>
                <div className="flex items-center gap-2 font-semibold text-sm text-emerald-200">
                  <span className="text-emerald-400 font-bold">✓</span>
                  <span>Character consistency</span>
                </div>
                <div className="flex items-center gap-2 font-semibold text-sm text-emerald-200">
                  <span className="text-emerald-400 font-bold">✓</span>
                  <span>Genre alignment</span>
                </div>
                <div className="flex items-center gap-2 font-semibold text-sm text-emerald-200">
                  <span className="text-emerald-400 font-bold">✓</span>
                  <span>Story structure</span>
                </div>
              </div>
            </div>

            {/* Detailed Craft Scores */}
            <h3 className="font-heading font-bold text-sm text-slate-300 uppercase tracking-wider mb-3">
              Craft Dimension Metrics
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
              {[
                { label: 'Plot Coherence', score: story.quality_check.plot_coherence_score },
                { label: 'Character Depth', score: story.quality_check.character_consistency_score },
                { label: 'Genre Fidelity', score: story.quality_check.genre_fidelity_score },
                { label: 'Pacing', score: story.quality_check.pacing_score },
                { label: 'Dialogue', score: story.quality_check.dialogue_score },
                { label: 'Originality', score: story.quality_check.originality_score },
              ].map((m, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 text-center">
                  <div className="text-2xl font-heading font-extrabold text-amber-400">
                    {m.score}%
                  </div>
                  <div className="text-xs text-slate-400 mt-1 font-medium">{m.label}</div>
                </div>
              ))}
            </div>

            {/* Strengths & Editorial Critique */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800">
                <h4 className="font-bold text-sm text-slate-200 mb-3 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>Key Narrative Strengths</span>
                </h4>
                <ul className="space-y-2 text-xs text-slate-300">
                  {story.quality_check.strengths.map((str, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-emerald-400 font-bold">&bull;</span>
                      <span>{str}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800">
                <h4 className="font-bold text-sm text-slate-200 mb-3 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-indigo-400" />
                  <span>Editorial Critique & Optimizations</span>
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed mb-3">
                  {story.quality_check.critique}
                </p>
                {story.quality_check.improvements_made && story.quality_check.improvements_made.length > 0 && (
                  <div className="pt-3 border-t border-slate-800">
                    <span className="text-[11px] font-bold text-slate-400 block mb-1">
                      Automated Polish Applied:
                    </span>
                    <ul className="text-xs text-indigo-300 space-y-1">
                      {story.quality_check.improvements_made.map((imp, idx) => (
                        <li key={idx}>✓ {imp}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* TAB 5: CHAPTERS VIEW */}
      {/* =================================================================== */}
      {activeTab === 'chapters' && (
        <div className="space-y-6">
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="font-heading font-extrabold text-xl text-white">
                  Story Chapters ({story.chapters?.length || 1})
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Manage multi-chapter progression and generate subsequent chapters.
                </p>
              </div>

              <button
                onClick={onOpenChapterModal}
                disabled={isActionLoading}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-glow-indigo transition-all disabled:opacity-50"
              >
                <Plus className="w-4 h-4" />
                <span>Generate Next Chapter</span>
              </button>
            </div>

            {/* Chapter Selection Pills */}
            <div className="flex flex-wrap gap-2 mb-6">
              {(story.chapters || []).map((ch, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedChapterIndex(idx)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                    selectedChapterIndex === idx
                      ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  Chapter {ch.chapter_number}: {ch.title}
                </button>
              ))}
            </div>

            {/* Active Chapter Content */}
            {story.chapters && story.chapters[selectedChapterIndex] && (
              <div className="p-6 sm:p-8 rounded-2xl bg-slate-950/80 border border-slate-800">
                <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
                  <div>
                    <h3 className="font-heading font-bold text-lg text-amber-300">
                      {story.chapters[selectedChapterIndex].title}
                    </h3>
                    {story.chapters[selectedChapterIndex].summary && (
                      <p className="text-xs text-slate-400 mt-1">
                        {story.chapters[selectedChapterIndex].summary}
                      </p>
                    )}
                  </div>
                  <span className="text-xs text-slate-500">
                    {story.chapters[selectedChapterIndex].word_count} words
                  </span>
                </div>

                <div className="font-story text-sm text-slate-200 leading-loose space-y-4">
                  {story.chapters[selectedChapterIndex].content.split('\n\n').map((p, idx) => (
                    <p key={idx}>{p.trim()}</p>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* TAB 6: STORY EDITOR */}
      {/* =================================================================== */}
      {activeTab === 'editor' && (
        <div className="space-y-6">
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
              <div>
                <h2 className="font-heading font-extrabold text-xl text-white">
                  Story Editor
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Directly edit the manuscript or select any paragraph to refine it with Gemini in-place.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleSaveEditor}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-glow-indigo transition-all"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Save Changes</span>
                </button>
              </div>
            </div>

            <textarea
              rows={20}
              value={editableText}
              onChange={(e) => {
                setEditableText(e.target.value);
                setIsSaved(false);
              }}
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-6 text-sm text-slate-100 font-story leading-relaxed focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />

            <div className="mt-4 flex items-center justify-between text-xs text-slate-400">
              <span>{editableText.split(/\s+/).filter(Boolean).length} total words</span>
              <span>{isSaved ? 'All changes saved' : 'Unsaved modifications'}</span>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Regenerate All Images */}
      {isConfirmingRegenAll && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl">
            <h3 className="font-heading font-extrabold text-lg text-white mb-2">
              Regenerate All {scenes.length} Scenes?
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed mb-6">
              This will re-render all scenes in your story while preserving the exact character consistency profiles, locations, and <strong>{activeVisualStyle}</strong> visual style.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setIsConfirmingRegenAll(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setIsConfirmingRegenAll(false);
                  onRegenerateAllScenes();
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-500 text-white shadow-sm"
              >
                Yes, Regenerate All
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
