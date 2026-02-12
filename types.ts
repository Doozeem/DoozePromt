export interface AnalysisResult {
  prompt: string;
  confidence?: string;
}

export enum AppState {
  IDLE = 'IDLE',
  ANALYZING = 'ANALYZING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}

export interface VideoMetadata {
  name: string;
  size: number;
  type: string;
  url: string;
}

export enum PromptStyle {
  DESCRIPTIVE = 'DESCRIPTIVE',
  MIDJOURNEY = 'MIDJOURNEY',
  RUNWAY = 'RUNWAY',
  STABLE_DIFFUSION = 'STABLE_DIFFUSION',
  JSON = 'JSON'
}

export interface HistoryItem {
  id: string;
  timestamp: number;
  videoName: string;
  prompt: string;
  style: PromptStyle;
}

export interface PromptBreakdown {
  subject: string;
  action: string;
  environment: string;
  lighting: string;
  camera: string;
}

export interface TimelineItem {
  id: number;
  time: string;
  title: string;
  content: string;
}