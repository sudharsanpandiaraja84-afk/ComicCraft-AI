export type StoryGenre =
  | 'Fantasy'
  | 'Mystery'
  | 'Thriller'
  | 'Horror'
  | 'Romance'
  | 'Science Fiction'
  | 'Adventure'
  | 'Comedy'
  | 'Drama'
  | 'Historical'
  | 'Crime'
  | 'Superhero'
  | 'Slice of Life'
  | 'Psychological'
  | 'Action'
  | 'Educational'
  | 'Custom Genre';

export type StoryLength = 'Short' | 'Medium' | 'Long' | 'Very Long';

export type StoryTone =
  | 'Emotional'
  | 'Dark'
  | 'Funny'
  | 'Suspenseful'
  | 'Romantic'
  | 'Inspirational'
  | 'Serious'
  | 'Lighthearted'
  | 'Dramatic'
  | 'Mysterious'
  | 'Epic'
  | 'Scary';

export type WritingStyle =
  | 'Simple'
  | 'Cinematic'
  | 'Descriptive'
  | 'Literary'
  | 'Conversational'
  | 'Fast-paced'
  | 'Detailed'
  | 'Professional'
  | "Children's storytelling"
  | 'Custom Style';

export type TargetAudience =
  | 'Children'
  | 'Teenagers'
  | 'Young Adults'
  | 'Adults'
  | 'General Audience';

export type StoryEnding =
  | 'Happy Ending'
  | 'Sad Ending'
  | 'Tragic Ending'
  | 'Open Ending'
  | 'Twist Ending'
  | 'Unexpected Ending'
  | 'AI Decides';

export interface UserInputCharacter {
  name: string;
  age?: string;
  role?: string;
  personality?: string;
  gender?: string;
  details?: string;
}

export interface AdvancedStoryOptions {
  num_characters?: string;
  setting?: string;
  time_period?: string;
  location?: string;
  complexity?: string;
  dialogue_amount?: string;
  description_level?: string;
  plot_twist?: string;
  moral?: string;
}

export interface StoryGenerateRequest {
  story_idea: string;
  genre: StoryGenre | string;
  custom_genre?: string;
  story_length: StoryLength;
  tones: StoryTone[];
  writing_style: WritingStyle | string;
  custom_style?: string;
  target_audience: TargetAudience;
  ending_preference: StoryEnding;
  characters?: UserInputCharacter[];
  advanced_options?: AdvancedStoryOptions;
  api_key?: string;
  demo_mode?: boolean;
}

export interface StoryPlotStructure {
  introduction: string;
  rising_action: string;
  climax: string;
  falling_action: string;
  resolution: string;
}

export interface StoryBlueprint {
  title: string;
  genre: string;
  premise: string;
  main_conflict: string;
  theme: string;
  setting: string;
  main_characters: string[];
  character_motivations: string;
  plot: StoryPlotStructure;
  ending_type: string;
}

export interface StoryCharacter {
  name: string;
  age: string;
  role: string;
  personality: string;
  gender?: string;
  background: string;
  motivation: string;
  goal: string;
  fear: string;
  strength: string;
  weakness: string;
  relationships: string;
  character_arc: string;
}

export interface QualityCheckReport {
  plot_consistency: boolean;
  character_consistency: boolean;
  genre_alignment: boolean;
  story_structure: boolean;
  plot_coherence_score: number;
  character_consistency_score: number;
  genre_fidelity_score: number;
  pacing_score: number;
  dialogue_score: number;
  originality_score: number;
  strengths: string[];
  critique: string;
  improvements_made: string[];
}

export interface Chapter {
  chapter_number: number;
  title: string;
  content: string;
  word_count: number;
  summary?: string;
}

export interface CompleteStoryResponse {
  id: string;
  title: string;
  genre: string;
  tones: string[];
  writing_style: string;
  target_audience: string;
  ending_type: string;
  story: string;
  word_count: number;
  reading_time: string;
  blueprint: StoryBlueprint;
  characters: StoryCharacter[];
  quality_check: QualityCheckReport;
  chapters: Chapter[];
  is_demo: boolean;
  created_at: string;
}

export interface StoryImproveRequest {
  story: string;
  focus_area: 'Plot' | 'Characters' | 'Dialogue' | 'Descriptions' | 'Pacing' | 'All';
  instructions?: string;
  api_key?: string;
  demo_mode?: boolean;
}

export interface StoryContinueRequest {
  previous_story: string;
  continuation_prompt: string;
  target_length?: string;
  api_key?: string;
  demo_mode?: boolean;
}

export interface StoryRewriteRequest {
  story: string;
  original_genre?: string;
  new_genre?: string;
  new_tone?: string;
  new_style?: string;
  new_ending?: string;
  instructions?: string;
  api_key?: string;
  demo_mode?: boolean;
}

export interface StoryShortenRequest {
  story: string;
  target_word_count?: number;
  api_key?: string;
  demo_mode?: boolean;
}

export interface StoryExpandRequest {
  story: string;
  expansion_focus?: string;
  target_word_count?: number;
  api_key?: string;
  demo_mode?: boolean;
}

export interface ChapterGenerateRequest {
  story_id?: string;
  story_title: string;
  previous_context: string;
  chapter_number: number;
  chapter_title: string;
  what_should_happen: string;
  desired_length: string;
  genre?: string;
  tone?: string;
  style?: string;
  api_key?: string;
  demo_mode?: boolean;
}

export interface SectionEditRequest {
  full_story: string;
  selected_text: string;
  action: 'regenerate' | 'improve_paragraph' | 'make_dialogue_better' | 'make_description_more_detailed' | 'change_tone';
  tone_guidance?: string;
  api_key?: string;
  demo_mode?: boolean;
}

export interface SectionEditResponse {
  original_text: string;
  replacement_text: string;
  action: string;
  explanation: string;
}

export type ViewTab =
  | 'read'
  | 'blueprint'
  | 'characters'
  | 'quality'
  | 'chapters'
  | 'editor'
  | 'versions'
  | 'images'
  | 'visual-story'
  | 'storyboard';

// ============================================================================
// FEATURE 1: STORY REGENERATION & VERSIONING
// ============================================================================

export type RegenerationOption =
  | 'Same idea, different story'
  | 'More suspenseful'
  | 'More emotional'
  | 'More detailed'
  | 'More creative'
  | 'Different plot twist'
  | 'Different ending'
  | 'Completely fresh interpretation';

export interface RegenerateStoryRequest {
  story_id?: string;
  original_idea: string;
  genre: string;
  tones: string[];
  writing_style: string;
  target_audience: string;
  story_length: string;
  ending_preference: string;
  characters?: UserInputCharacter[];
  advanced_options?: AdvancedStoryOptions;
  previous_story_title?: string;
  previous_story_summary?: string;
  regeneration_option: RegenerationOption | string;
  custom_instruction?: string;
  api_key?: string;
  demo_mode?: boolean;
}

export interface StoryVersion {
  version_id: string;
  version_number: number;
  title: string;
  summary: string;
  regeneration_note?: string;
  story_data: CompleteStoryResponse;
  created_at: string;
}

export interface CompareVersionsRequest {
  version_a: StoryVersion;
  version_b: StoryVersion;
  api_key?: string;
  demo_mode?: boolean;
}

export interface VersionComparisonResult {
  version_a_id: string;
  version_b_id: string;
  title_a: string;
  title_b: string;
  summary_a: string;
  summary_b: string;
  characters_a: string[];
  characters_b: string[];
  plot_differences: string;
  ending_differences: string;
  tone_and_style_differences: string;
  recommendation: string;
}

// ============================================================================
// FEATURE 2: STORY TO IMAGE
// ============================================================================

export type ImageVisualStyle =
  | 'Cinematic'
  | 'Anime'
  | 'Manga'
  | 'Western Comic'
  | 'Digital Art'
  | 'Semi-realistic'
  | 'Realistic'
  | 'Watercolor'
  | '3D Animation'
  | 'Fantasy'
  | 'Noir'
  | 'Cyberpunk';

export type SceneScope =
  | 'Entire Story'
  | 'Selected Chapter'
  | 'Selected Scene'
  | 'Selected Paragraph';

export interface CharacterVisualProfile {
  name: string;
  age?: string;
  gender?: string;
  face_description: string;
  skin_tone: string;
  hair: string;
  hairstyle: string;
  eye_color: string;
  body_type: string;
  clothing: string;
  accessories: string;
  distinctive_features: string;
  appearance_prompt_snippet: string;
}

export interface LocationProfile {
  location_id?: string;
  name: string;
  architecture: string;
  environment: string;
  time_period: string;
  color_palette: string;
  lighting: string;
  important_objects: string[];
  location_prompt_snippet: string;
}

export interface VisualScene {
  scene_id: string;
  scene_number: number;
  title: string;
  description: string;
  story_excerpt?: string;
  characters_involved: string[];
  location_name: string;
  action: string;
  facial_expression?: string;
  body_language?: string;
  camera_angle: string;
  composition: string;
  lighting: string;
  time_of_day: string;
  visual_style: string;
  mood: string;
  image_prompt: string;
  negative_prompt: string;
  image_url?: string | null;
  is_generating?: boolean;
  generation_error?: string | null;
}

export interface StorySceneExtractionRequest {
  story_id?: string;
  story_title: string;
  story_text: string;
  genre: string;
  scope: SceneScope | string;
  target_scene_count: number;
  visual_style: ImageVisualStyle | string;
  api_key?: string;
  demo_mode?: boolean;
}

export interface StorySceneExtractionResponse {
  story_title: string;
  visual_style: string;
  characters: CharacterVisualProfile[];
  locations: LocationProfile[];
  scenes: VisualScene[];
}

export interface ImageGenerateRequest {
  scene_id: string;
  image_prompt: string;
  negative_prompt?: string;
  visual_style?: string;
  api_key?: string;
  demo_mode?: boolean;
}

export interface ImageRegenerateRequest {
  scene_id: string;
  image_prompt: string;
  negative_prompt?: string;
  custom_guidance?: string;
  visual_style?: string;
  api_key?: string;
  demo_mode?: boolean;
}

export interface ImageRegenerateAllRequest {
  scenes: VisualScene[];
  visual_style?: string;
  api_key?: string;
  demo_mode?: boolean;
}

export interface GeneratedImageResponse {
  scene_id: string;
  image_url?: string | null;
  prompt_used: string;
  negative_prompt_used: string;
  status: 'success' | 'unconfigured' | 'error';
  message?: string;
}
