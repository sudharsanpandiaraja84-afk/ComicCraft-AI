import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { LandingPage } from './components/LandingPage';
import { StoryCreationPage } from './components/StoryCreationPage';
import { StoryResultPage } from './components/StoryResultPage';
import { GenerationProgressModal } from './components/GenerationProgressModal';
import { ImproveStoryModal } from './components/Modals/ImproveStoryModal';
import { ContinueStoryModal } from './components/Modals/ContinueStoryModal';
import { RewriteStoryModal } from './components/Modals/RewriteStoryModal';
import { ChapterGenerateModal } from './components/Modals/ChapterGenerateModal';
import { ApiKeyModal } from './components/Modals/ApiKeyModal';

// Feature 1 & 2 Modals
import { RegenerateStoryModal } from './components/Modals/RegenerateStoryModal';
import { CompareVersionsModal } from './components/Modals/CompareVersionsModal';
import { CreateImagesModal } from './components/Modals/CreateImagesModal';
import { EditImagePromptModal } from './components/Modals/EditImagePromptModal';
import { ImageProgressModal, ImageProgressStep } from './components/Modals/ImageProgressModal';

import {
  CompleteStoryResponse,
  StoryGenerateRequest,
  Chapter,
  StoryVersion,
  RegenerationOption,
  SceneScope,
  ImageVisualStyle,
  VisualScene,
  CharacterVisualProfile,
  LocationProfile
} from './types';
import { api } from './services/api';

export const App: React.FC = () => {
  // Navigation View
  const [currentView, setCurrentView] = useState<'landing' | 'create' | 'result'>('landing');

  // Main Story State
  const [story, setStory] = useState<CompleteStoryResponse | null>(null);
  const [lastRequest, setLastRequest] = useState<StoryGenerateRequest | null>(null);

  // Feature 1: Story Versions (Session / LocalStorage caching)
  const [versions, setVersions] = useState<StoryVersion[]>(() => {
    try {
      const saved = sessionStorage.getItem('storyforge_versions');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Feature 2: Visual Story State (Scenes, Consistency Profiles, Active Style)
  const [scenes, setScenes] = useState<VisualScene[]>([]);
  const [characterProfiles, setCharacterProfiles] = useState<CharacterVisualProfile[]>([]);
  const [locationProfiles, setLocationProfiles] = useState<LocationProfile[]>([]);
  const [activeVisualStyle, setActiveVisualStyle] = useState<ImageVisualStyle>('Cinematic');

  // Generation & Pipeline Progress
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  // Secondary Action Loading
  const [isActionLoading, setIsActionLoading] = useState<boolean>(false);
  const [actionLoadingMessage, setActionLoadingMessage] = useState<string>('');

  // Feature 2: Image Generation Loading & Progress
  const [isImagesLoading, setIsImagesLoading] = useState<boolean>(false);
  const [isImageProgressModalOpen, setIsImageProgressModalOpen] = useState(false);
  const [imageProgressSteps, setImageProgressSteps] = useState<ImageProgressStep[]>([]);
  const [imageProgressStatus, setImageProgressStatus] = useState<string>('');

  // Modals
  const [isImproveModalOpen, setIsImproveModalOpen] = useState(false);
  const [isContinueModalOpen, setIsContinueModalOpen] = useState(false);
  const [isRewriteModalOpen, setIsRewriteModalOpen] = useState(false);
  const [isChapterModalOpen, setIsChapterModalOpen] = useState(false);
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);

  // Feature 1 Modals
  const [isRegenerateModalOpen, setIsRegenerateModalOpen] = useState(false);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);
  const [compareInitialA, setCompareInitialA] = useState<StoryVersion | undefined>(undefined);
  const [compareInitialB, setCompareInitialB] = useState<StoryVersion | undefined>(undefined);

  // Feature 2 Modals
  const [isCreateImagesModalOpen, setIsCreateImagesModalOpen] = useState(false);
  const [isEditPromptModalOpen, setIsEditPromptModalOpen] = useState(false);
  const [selectedSceneForPromptEdit, setSelectedSceneForPromptEdit] = useState<VisualScene | null>(null);

  // API Key & Demo Mode
  const [apiKey, setApiKey] = useState<string>(
    () => localStorage.getItem('storyforge_gemini_key') || ''
  );
  const [hasEnvKey, setHasEnvKey] = useState<boolean>(false);
  const [isDemoMode, setIsDemoMode] = useState<boolean>(false);

  // Initial Health Check
  useEffect(() => {
    api.getHealth().then((health) => {
      setHasEnvKey(health.gemini_api_configured);
      if (!health.gemini_api_configured && !apiKey) {
        setIsDemoMode(true);
      }
    });
  }, [apiKey]);

  // Persist versions to session storage
  useEffect(() => {
    try {
      sessionStorage.setItem('storyforge_versions', JSON.stringify(versions));
    } catch (e) {
      console.warn('Could not cache versions:', e);
    }
  }, [versions]);

  const hasConfiguredKey = Boolean(apiKey || hasEnvKey);

  const handleSaveApiKey = (key: string) => {
    setApiKey(key);
    if (key) {
      localStorage.setItem('storyforge_gemini_key', key);
      setIsDemoMode(false);
    } else {
      localStorage.removeItem('storyforge_gemini_key');
      if (!hasEnvKey) setIsDemoMode(true);
    }
  };

  const handleToggleDemoMode = () => {
    setIsDemoMode((prev) => !prev);
  };

  // Helper to register a new version
  const recordStoryVersion = (storyData: CompleteStoryResponse, note: string = 'Initial generation') => {
    setVersions((prev) => {
      const nextNum = prev.length + 1;
      const newVersion: StoryVersion = {
        version_id: storyData.id || `ver_${Date.now()}`,
        version_number: nextNum,
        title: storyData.title,
        summary: storyData.blueprint.premise,
        regeneration_note: note,
        story_data: storyData,
        created_at: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      return [...prev, newVersion];
    });
  };

  // Load Demo Story
  const handleLoadDemo = async () => {
    setIsGenerating(true);
    try {
      const demoStory = await api.getDemoStory();
      setStory(demoStory);
      setScenes([]);
      // Initialize Version 1
      const initialVer: StoryVersion = {
        version_id: demoStory.id,
        version_number: 1,
        title: demoStory.title,
        summary: demoStory.blueprint.premise,
        regeneration_note: 'Initial generation',
        story_data: demoStory,
        created_at: 'Initial demo edition',
      };
      setVersions([initialVer]);
      setCurrentView('result');
    } catch (err) {
      console.error('Failed to load demo story:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  // Generate Story
  const handleGenerate = async (req: StoryGenerateRequest) => {
    setIsGenerating(true);
    setLastRequest(req);

    const payload: StoryGenerateRequest = {
      ...req,
      api_key: apiKey || undefined,
      demo_mode: isDemoMode || !hasConfiguredKey,
    };

    try {
      const result = await api.generateStory(payload);
      setStory(result);
      setScenes([]);

      // Initialize Version 1
      const v1: StoryVersion = {
        version_id: result.id,
        version_number: 1,
        title: result.title,
        summary: result.blueprint.premise,
        regeneration_note: 'Initial generation',
        story_data: result,
        created_at: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setVersions([v1]);
      setCurrentView('result');
    } catch (err: any) {
      console.error('Generation error:', err);
      const demo = await api.getDemoStory();
      setStory(demo);
      setScenes([]);
      const vDemo: StoryVersion = {
        version_id: demo.id,
        version_number: 1,
        title: demo.title,
        summary: demo.blueprint.premise,
        regeneration_note: 'Demo baseline',
        story_data: demo,
        created_at: 'Demo',
      };
      setVersions([vDemo]);
      setCurrentView('result');
    } finally {
      setIsGenerating(false);
    }
  };

  // ============================================================================
  // FEATURE 1 HANDLERS: REGENERATE STORY & VERSION CONTROL
  // ============================================================================

  // Open the "Generate Another Version" dialog
  const handleOpenRegenerateModal = () => {
    setIsRegenerateModalOpen(true);
  };

  // Execute Story Regeneration with options and Gemini prompt
  const handleExecuteRegeneration = async (
    regenerationOption: RegenerationOption,
    customInstruction: string
  ) => {
    if (!story) return;
    setIsActionLoading(true);
    setActionLoadingMessage(`Generating new version (${regenerationOption})...`);
    setIsRegenerateModalOpen(false);

    try {
      const res = await api.regenerateStory({
        story_id: story.id,
        original_idea: lastRequest?.story_idea || story.blueprint.premise,
        genre: story.genre,
        tones: story.tones,
        writing_style: story.writing_style,
        target_audience: story.target_audience,
        story_length: lastRequest?.story_length || 'Medium',
        ending_preference: story.ending_type,
        characters: lastRequest?.characters,
        advanced_options: lastRequest?.advanced_options,
        previous_story_title: story.title,
        previous_story_summary: story.blueprint.premise,
        regeneration_option: regenerationOption,
        custom_instruction: customInstruction,
        api_key: apiKey || undefined,
        demo_mode: isDemoMode || !hasConfiguredKey,
      });

      // Update story to new regenerated version
      setStory(res);
      // Clear previous story scenes for the new narrative
      setScenes([]);

      // Record in version history
      recordStoryVersion(res, `${regenerationOption}${customInstruction ? `: "${customInstruction}"` : ''}`);
    } catch (err) {
      console.error('Regeneration error:', err);
    } finally {
      setIsActionLoading(false);
      setActionLoadingMessage('');
    }
  };

  // Switch to another version
  const handleSwitchVersion = (version: StoryVersion) => {
    setStory(version.story_data);
    setScenes([]);
  };

  // Delete a version from history
  const handleDeleteVersion = (versionId: string) => {
    setVersions((prev) => prev.filter((v) => v.version_id !== versionId));
  };

  // Open compare versions modal
  const handleOpenCompareModal = (vA?: StoryVersion, vB?: StoryVersion) => {
    setCompareInitialA(vA);
    setCompareInitialB(vB);
    setIsCompareModalOpen(true);
  };

  // ============================================================================
  // FEATURE 2 HANDLERS: STORY TO IMAGE
  // ============================================================================

  const handleOpenCreateImagesModal = () => {
    setIsCreateImagesModalOpen(true);
  };

  // Multi-phase visual story creation pipeline
  const handleStartImageGeneration = async (
    scope: SceneScope,
    targetSceneCount: number,
    visualStyle: ImageVisualStyle
  ) => {
    if (!story) return;
    setIsCreateImagesModalOpen(false);
    setIsImagesLoading(true);
    setActiveVisualStyle(visualStyle);
    setIsImageProgressModalOpen(true);

    const initialSteps: ImageProgressStep[] = [
      { label: 'Analyzing story', status: 'current' },
      { label: 'Identifying characters & locations', status: 'pending' },
      { label: 'Extracting key visual scenes', status: 'pending' },
      { label: `Synthesizing ${targetSceneCount} scene prompts`, status: 'pending' },
      ...Array.from({ length: targetSceneCount }, (_, i) => ({
        label: `Rendering scene ${i + 1}`,
        status: 'pending' as const,
      })),
      { label: 'Finalizing visual story', status: 'pending' },
    ];

    setImageProgressSteps(initialSteps);
    setImageProgressStatus('Analyzing story narrative with Gemini...');

    try {
      // Stage 1 & 2 & 3: Story Analysis, Character & Location Profiles, Scene Prompts
      const extraction = await api.extractStoryScenes({
        story_id: story.id,
        story_title: story.title,
        story_text: story.story,
        genre: story.genre,
        scope,
        target_scene_count: targetSceneCount,
        visual_style: visualStyle,
        api_key: apiKey || undefined,
        demo_mode: isDemoMode || !hasConfiguredKey,
      });

      setCharacterProfiles(extraction.characters);
      setLocationProfiles(extraction.locations);

      // Update progress steps after analysis
      setImageProgressSteps((prev) =>
        prev.map((step, idx) => {
          if (idx <= 3) return { ...step, status: 'completed' };
          if (idx === 4) return { ...step, status: 'current' };
          return step;
        })
      );

      const createdScenes: VisualScene[] = [];
      const extractedList = extraction.scenes;

      // Stage 4: Sequential Image Generation
      for (let i = 0; i < extractedList.length; i++) {
        const currentScene = extractedList[i];
        setImageProgressStatus(`Creating image for Scene ${i + 1}: ${currentScene.title}...`);

        setImageProgressSteps((prev) =>
          prev.map((step, idx) => {
            const sceneStepIdx = 4 + i;
            if (idx < sceneStepIdx) return { ...step, status: 'completed' };
            if (idx === sceneStepIdx) return { ...step, status: 'current' };
            return step;
          })
        );

        try {
          const imgRes = await api.generateSceneImage({
            scene_id: currentScene.scene_id,
            image_prompt: currentScene.image_prompt,
            negative_prompt: currentScene.negative_prompt,
            visual_style: visualStyle,
            api_key: apiKey || undefined,
            demo_mode: isDemoMode || !hasConfiguredKey,
          });

          createdScenes.push({
            ...currentScene,
            image_url: imgRes.image_url,
            is_generating: false,
            generation_error: imgRes.status === 'error' ? imgRes.message : null,
          });
        } catch (sceneErr: any) {
          console.error(`Scene ${i + 1} generation failed:`, sceneErr);
          createdScenes.push({
            ...currentScene,
            image_url: null,
            is_generating: false,
            generation_error: `Scene ${i + 1} could not be generated. Try again.`,
          });
        }
      }

      // Finalize
      setImageProgressSteps((prev) =>
        prev.map((step) => ({ ...step, status: 'completed' }))
      );
      setImageProgressStatus('Finalizing visual storybook...');

      setScenes(createdScenes);
    } catch (err) {
      console.error('Visual story creation failed:', err);
    } finally {
      setIsImagesLoading(false);
      setTimeout(() => {
        setIsImageProgressModalOpen(false);
      }, 1000);
    }
  };

  // Regenerate single individual scene
  const handleRegenerateIndividualScene = async (sceneId: string) => {
    const sceneIdx = scenes.findIndex((s) => s.scene_id === sceneId);
    if (sceneIdx === -1) return;

    const targetScene = scenes[sceneIdx];
    // Set loading indicator on this scene
    const updated = [...scenes];
    updated[sceneIdx] = { ...targetScene, is_generating: true, generation_error: null };
    setScenes(updated);

    try {
      const res = await api.regenerateSceneImage({
        scene_id: targetScene.scene_id,
        image_prompt: targetScene.image_prompt,
        negative_prompt: targetScene.negative_prompt,
        visual_style: targetScene.visual_style || activeVisualStyle,
        api_key: apiKey || undefined,
        demo_mode: isDemoMode || !hasConfiguredKey,
      });

      setScenes((prev) =>
        prev.map((s) =>
          s.scene_id === sceneId
            ? {
                ...s,
                image_url: res.image_url || s.image_url,
                is_generating: false,
                generation_error: res.status === 'error' ? res.message : null,
              }
            : s
        )
      );
    } catch (err: any) {
      console.error('Individual scene regeneration error:', err);
      setScenes((prev) =>
        prev.map((s) =>
          s.scene_id === sceneId
            ? {
                ...s,
                is_generating: false,
                generation_error: `Scene ${s.scene_number} could not be generated. Try again.`,
              }
            : s
        )
      );
    }
  };

  // Open edit prompt modal
  const handleOpenEditPromptModal = (scene: VisualScene) => {
    setSelectedSceneForPromptEdit(scene);
    setIsEditPromptModalOpen(true);
  };

  // Regenerate with manually edited prompt
  const handleRegenerateSceneWithPrompt = async (
    sceneId: string,
    updatedPrompt: string,
    customGuidance: string
  ) => {
    setIsEditPromptModalOpen(false);
    const targetScene = scenes.find((s) => s.scene_id === sceneId);
    if (!targetScene) return;

    setScenes((prev) =>
      prev.map((s) =>
        s.scene_id === sceneId
          ? { ...s, image_prompt: updatedPrompt, is_generating: true, generation_error: null }
          : s
      )
    );

    try {
      const res = await api.regenerateSceneImage({
        scene_id: sceneId,
        image_prompt: updatedPrompt,
        custom_guidance: customGuidance,
        negative_prompt: targetScene.negative_prompt,
        visual_style: targetScene.visual_style || activeVisualStyle,
        api_key: apiKey || undefined,
        demo_mode: isDemoMode || !hasConfiguredKey,
      });

      setScenes((prev) =>
        prev.map((s) =>
          s.scene_id === sceneId
            ? {
                ...s,
                image_prompt: updatedPrompt,
                image_url: res.image_url || s.image_url,
                is_generating: false,
                generation_error: res.status === 'error' ? res.message : null,
              }
            : s
        )
      );
    } catch (err: any) {
      console.error('Edit prompt regeneration error:', err);
      setScenes((prev) =>
        prev.map((s) =>
          s.scene_id === sceneId
            ? { ...s, is_generating: false, generation_error: 'Could not regenerate with edited prompt.' }
            : s
        )
      );
    }
  };

  // Regenerate all scenes while keeping character profiles and locations
  const handleRegenerateAllScenes = async () => {
    if (scenes.length === 0) return;
    setIsImagesLoading(true);
    setIsImageProgressModalOpen(true);

    const steps: ImageProgressStep[] = scenes.map((s, idx) => ({
      label: `Re-rendering scene ${idx + 1}: ${s.title}`,
      status: idx === 0 ? 'current' : 'pending',
    }));
    setImageProgressSteps(steps);
    setImageProgressStatus(`Regenerating all ${scenes.length} scenes in ${activeVisualStyle} style...`);

    const reRendered: VisualScene[] = [];

    for (let i = 0; i < scenes.length; i++) {
      const sc = scenes[i];
      setImageProgressSteps((prev) =>
        prev.map((st, idx) => {
          if (idx < i) return { ...st, status: 'completed' };
          if (idx === i) return { ...st, status: 'current' };
          return st;
        })
      );

      try {
        const res = await api.regenerateSceneImage({
          scene_id: sc.scene_id,
          image_prompt: sc.image_prompt,
          negative_prompt: sc.negative_prompt,
          visual_style: sc.visual_style || activeVisualStyle,
          api_key: apiKey || undefined,
          demo_mode: isDemoMode || !hasConfiguredKey,
        });
        reRendered.push({
          ...sc,
          image_url: res.image_url,
          is_generating: false,
          generation_error: res.status === 'error' ? res.message : null,
        });
      } catch (err: any) {
        reRendered.push({
          ...sc,
          is_generating: false,
          generation_error: `Scene ${sc.scene_number} could not be generated. Try again.`,
        });
      }
    }

    setImageProgressSteps((prev) => prev.map((s) => ({ ...s, status: 'completed' })));
    setScenes(reRendered);
    setIsImagesLoading(false);
    setTimeout(() => setIsImageProgressModalOpen(false), 800);
  };

  // ============================================================================
  // EXISTING STORY MODAL HANDLERS
  // ============================================================================

  // Improve Story
  const handleImprove = async (
    focusArea: 'Plot' | 'Characters' | 'Dialogue' | 'Descriptions' | 'Pacing' | 'All',
    instructions: string
  ) => {
    if (!story) return;
    setIsActionLoading(true);
    setActionLoadingMessage(`Polishing ${focusArea} with Gemini...`);
    try {
      const res = await api.improveStory({
        story: story.story,
        focus_area: focusArea,
        instructions,
        api_key: apiKey || undefined,
        demo_mode: isDemoMode || !hasConfiguredKey,
      });

      const updatedWords = res.improved_story.split(/\s+/).filter(Boolean).length;
      const updatedStory = {
        ...story,
        story: res.improved_story,
        word_count: updatedWords,
      };
      setStory(updatedStory);
      setIsImproveModalOpen(false);
    } catch (err) {
      console.error('Improve error:', err);
    } finally {
      setIsActionLoading(false);
      setActionLoadingMessage('');
    }
  };

  // Continue Story
  const handleContinue = async (continuationPrompt: string, targetLength: string) => {
    if (!story) return;
    setIsActionLoading(true);
    setActionLoadingMessage('Generating next narrative continuation...');
    try {
      const res = await api.continueStory({
        previous_story: story.story,
        continuation_prompt: continuationPrompt,
        target_length: targetLength,
        api_key: apiKey || undefined,
        demo_mode: isDemoMode || !hasConfiguredKey,
      });

      const newChapterNumber = (story.chapters?.length || 1) + 1;
      const newChapter: Chapter = {
        chapter_number: newChapterNumber,
        title: res.continuation_title || `Chapter ${newChapterNumber}: Continuation`,
        content: res.continuation_text,
        word_count: res.continuation_text.split(/\s+/).filter(Boolean).length,
        summary: res.transition_summary,
      };

      const updatedChapters = story.chapters ? [...story.chapters, newChapter] : [newChapter];
      const combinedStory = `${story.story}\n\n---\n\n### ${newChapter.title}\n\n${newChapter.content}`;

      setStory({
        ...story,
        story: combinedStory,
        chapters: updatedChapters,
        word_count: story.word_count + newChapter.word_count,
      });
      setIsContinueModalOpen(false);
    } catch (err) {
      console.error('Continue error:', err);
    } finally {
      setIsActionLoading(false);
      setActionLoadingMessage('');
    }
  };

  // Rewrite Story
  const handleRewrite = async (
    newGenre: string,
    newTone: string,
    newStyle: string,
    newEnding: string,
    instructions: string
  ) => {
    if (!story) return;
    setIsActionLoading(true);
    setActionLoadingMessage(`Rewriting story into ${newGenre}...`);
    try {
      const res = await api.rewriteStory({
        story: story.story,
        original_genre: story.genre,
        new_genre: newGenre,
        new_tone: newTone,
        new_style: newStyle,
        new_ending: newEnding,
        instructions,
        api_key: apiKey || undefined,
        demo_mode: isDemoMode || !hasConfiguredKey,
      });

      const updatedWords = res.rewritten_story.split(/\s+/).filter(Boolean).length;
      const rewrittenStory = {
        ...story,
        title: res.rewritten_title || story.title,
        genre: newGenre,
        tones: [newTone],
        writing_style: newStyle,
        ending_type: newEnding,
        story: res.rewritten_story,
        word_count: updatedWords,
      };
      setStory(rewrittenStory);
      setIsRewriteModalOpen(false);
    } catch (err) {
      console.error('Rewrite error:', err);
    } finally {
      setIsActionLoading(false);
      setActionLoadingMessage('');
    }
  };

  // Shorten Story
  const handleShorten = async () => {
    if (!story) return;
    setIsActionLoading(true);
    setActionLoadingMessage('Condensing narrative for punchy pacing...');
    try {
      const res = await api.shortenStory({
        story: story.story,
        target_word_count: Math.round(story.word_count * 0.7),
        api_key: apiKey || undefined,
        demo_mode: isDemoMode || !hasConfiguredKey,
      });

      setStory({
        ...story,
        story: res.shortened_story,
        word_count: res.word_count || res.shortened_story.split(/\s+/).filter(Boolean).length,
      });
    } catch (err) {
      console.error('Shorten error:', err);
    } finally {
      setIsActionLoading(false);
      setActionLoadingMessage('');
    }
  };

  // Expand Story
  const handleExpand = async () => {
    if (!story) return;
    setIsActionLoading(true);
    setActionLoadingMessage('Enriching scenes, dialogue, and atmosphere...');
    try {
      const res = await api.expandStory({
        story: story.story,
        target_word_count: Math.round(story.word_count * 1.4),
        api_key: apiKey || undefined,
        demo_mode: isDemoMode || !hasConfiguredKey,
      });

      setStory({
        ...story,
        story: res.expanded_story,
        word_count: res.word_count || res.expanded_story.split(/\s+/).filter(Boolean).length,
      });
    } catch (err) {
      console.error('Expand error:', err);
    } finally {
      setIsActionLoading(false);
      setActionLoadingMessage('');
    }
  };

  // Generate Chapter
  const handleGenerateChapter = async (
    chapterNumber: number,
    title: string,
    whatShouldHappen: string,
    desiredLength: string
  ) => {
    if (!story) return;
    setIsActionLoading(true);
    setActionLoadingMessage(`Drafting ${title}...`);
    try {
      const newChapter = await api.generateChapter({
        story_id: story.id,
        story_title: story.title,
        previous_context: story.story,
        chapter_number: chapterNumber,
        chapter_title: title,
        what_should_happen: whatShouldHappen,
        desired_length: desiredLength,
        genre: story.genre,
        tone: story.tones[0],
        style: story.writing_style,
        api_key: apiKey || undefined,
        demo_mode: isDemoMode || !hasConfiguredKey,
      });

      const updatedChapters = story.chapters ? [...story.chapters, newChapter] : [newChapter];
      setStory({
        ...story,
        chapters: updatedChapters,
        word_count: story.word_count + newChapter.word_count,
      });
      setIsChapterModalOpen(false);
    } catch (err) {
      console.error('Chapter error:', err);
    } finally {
      setIsActionLoading(false);
      setActionLoadingMessage('');
    }
  };

  // In-place Section Edit
  const handleEditSection = async (
    selectedText: string,
    action: 'regenerate' | 'improve_paragraph' | 'make_dialogue_better' | 'make_description_more_detailed' | 'change_tone',
    toneGuidance?: string
  ): Promise<string> => {
    if (!story) return selectedText;
    try {
      const res = await api.editSection({
        full_story: story.story,
        selected_text: selectedText,
        action,
        tone_guidance: toneGuidance,
        api_key: apiKey || undefined,
        demo_mode: isDemoMode || !hasConfiguredKey,
      });
      return res.replacement_text;
    } catch (err) {
      console.error('Section edit error:', err);
      return selectedText;
    }
  };

  const handleUpdateStoryContent = (newContent: string) => {
    if (!story) return;
    setStory({
      ...story,
      story: newContent,
      word_count: newContent.split(/\s+/).filter(Boolean).length,
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col forge-grid-bg">
      {/* Navigation */}
      <Navbar
        currentView={currentView}
        onNavigate={(view) => setCurrentView(view)}
        hasStory={Boolean(story)}
        hasApiKey={hasConfiguredKey}
        isDemoMode={isDemoMode}
        onOpenApiKeyModal={() => setIsApiKeyModalOpen(true)}
        onLoadDemo={handleLoadDemo}
      />

      {/* Main Views */}
      <main className="flex-1">
        {currentView === 'landing' && (
          <LandingPage
            onStartWriting={() => setCurrentView('create')}
            onTryDemo={handleLoadDemo}
          />
        )}

        {currentView === 'create' && (
          <StoryCreationPage
            onGenerate={handleGenerate}
            isGenerating={isGenerating}
            onLoadDemo={handleLoadDemo}
            isDemoMode={isDemoMode}
          />
        )}

        {currentView === 'result' && story && (
          <StoryResultPage
            story={story}
            onRegenerate={handleOpenRegenerateModal}
            onOpenImproveModal={() => setIsImproveModalOpen(true)}
            onOpenContinueModal={() => setIsContinueModalOpen(true)}
            onOpenRewriteModal={() => setIsRewriteModalOpen(true)}
            onShorten={handleShorten}
            onExpand={handleExpand}
            onOpenChapterModal={() => setIsChapterModalOpen(true)}
            onEditSection={handleEditSection}
            onUpdateStoryContent={handleUpdateStoryContent}
            isActionLoading={isActionLoading}
            actionLoadingMessage={actionLoadingMessage}

            // Feature 1: Story Versions
            versions={versions}
            onSelectVersion={handleSwitchVersion}
            onDeleteVersion={handleDeleteVersion}
            onOpenCompareModal={handleOpenCompareModal}

            // Feature 2: Story to Image
            onOpenCreateImagesModal={handleOpenCreateImagesModal}
            scenes={scenes}
            characterProfiles={characterProfiles}
            locationProfiles={locationProfiles}
            activeVisualStyle={activeVisualStyle}
            onRegenerateIndividualScene={handleRegenerateIndividualScene}
            onOpenEditPromptModal={handleOpenEditPromptModal}
            onRegenerateAllScenes={handleRegenerateAllScenes}
            isImagesLoading={isImagesLoading}
          />
        )}
      </main>

      {/* Initial Generation Pipeline Progress Modal */}
      <GenerationProgressModal isOpen={isGenerating} />

      {/* Feature 1: Regenerate Story Modal */}
      <RegenerateStoryModal
        isOpen={isRegenerateModalOpen}
        onClose={() => setIsRegenerateModalOpen(false)}
        originalIdea={lastRequest?.story_idea || story?.blueprint.premise || ''}
        genre={story?.genre || 'Mystery'}
        onRegenerate={handleExecuteRegeneration}
        isLoading={isActionLoading}
      />

      {/* Feature 1: Compare Versions Modal */}
      <CompareVersionsModal
        isOpen={isCompareModalOpen}
        onClose={() => setIsCompareModalOpen(false)}
        versions={versions}
        initialVersionA={compareInitialA}
        initialVersionB={compareInitialB}
        onSelectVersion={handleSwitchVersion}
        apiKey={apiKey}
        isDemoMode={isDemoMode || !hasConfiguredKey}
      />

      {/* Feature 2: Create Images Modal */}
      <CreateImagesModal
        isOpen={isCreateImagesModalOpen}
        onClose={() => setIsCreateImagesModalOpen(false)}
        storyTitle={story?.title || 'Untitled Story'}
        hasChapters={Boolean(story?.chapters && story.chapters.length > 1)}
        onStartImageGeneration={handleStartImageGeneration}
        isLoading={isImagesLoading}
      />

      {/* Feature 2: Edit Image Prompt Modal */}
      <EditImagePromptModal
        isOpen={isEditPromptModalOpen}
        onClose={() => setIsEditPromptModalOpen(false)}
        scene={selectedSceneForPromptEdit}
        onRegenerateWithPrompt={handleRegenerateSceneWithPrompt}
        isLoading={isImagesLoading}
      />

      {/* Feature 2: Image Generation Live Progress Modal */}
      <ImageProgressModal
        isOpen={isImageProgressModalOpen}
        steps={imageProgressSteps}
        overallProgress={imageProgressStatus}
        totalScenes={scenes.length || 5}
      />

      {/* Existing Feature Modals */}
      <ImproveStoryModal
        isOpen={isImproveModalOpen}
        onClose={() => setIsImproveModalOpen(false)}
        onImprove={handleImprove}
        isLoading={isActionLoading}
      />

      <ContinueStoryModal
        isOpen={isContinueModalOpen}
        onClose={() => setIsContinueModalOpen(false)}
        onContinue={handleContinue}
        isLoading={isActionLoading}
      />

      <RewriteStoryModal
        isOpen={isRewriteModalOpen}
        onClose={() => setIsRewriteModalOpen(false)}
        currentGenre={story?.genre || 'Mystery'}
        currentTone={story?.tones || ['Suspenseful']}
        currentStyle={story?.writing_style || 'Cinematic'}
        currentEnding={story?.ending_type || 'Twist Ending'}
        onRewrite={handleRewrite}
        isLoading={isActionLoading}
      />

      <ChapterGenerateModal
        isOpen={isChapterModalOpen}
        onClose={() => setIsChapterModalOpen(false)}
        nextChapterNumber={(story?.chapters?.length || 1) + 1}
        onGenerateChapter={handleGenerateChapter}
        isLoading={isActionLoading}
      />

      <ApiKeyModal
        isOpen={isApiKeyModalOpen}
        onClose={() => setIsApiKeyModalOpen(false)}
        apiKey={apiKey}
        onSaveApiKey={handleSaveApiKey}
        isDemoMode={isDemoMode}
        onToggleDemoMode={handleToggleDemoMode}
      />
    </div>
  );
};

export default App;
