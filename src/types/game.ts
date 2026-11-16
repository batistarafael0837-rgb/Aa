export type OfficeTrack = "word" | "excel" | "powerpoint";
export type AppScreen = "TITLE_MENU" | "PLAYING" | "SHORTCUTS";

export interface WordBlock {
  id: string;
  role: "title" | "subtitle" | "body" | "list-materials" | "list-steps" | "warning" | "signature";
  text: string;
  bold: boolean;
  italic: boolean;
  underline: boolean;
  align: "left" | "center" | "right" | "justify";
  fontSize: number; // e.g., 12, 14, 16, 20
  fontFamily: "Arial" | "Times New Roman" | "Calibri";
  lineSpacing: 1 | 1.5;
  listType: "none" | "bullet" | "numbered";
  stylePreset: "normal" | "heading1";
  color: string;
  highlightTerm?: string;
  highlightTermItalic?: boolean;
}

export interface WordMissionState {
  selectedBlockId: string;
  blocks: WordBlock[];
}

export interface ExcelCell {
  raw: string;
  bold?: boolean;
  currency?: boolean;
  readOnly?: boolean;
}

export interface ExcelMissionState {
  selectedCell: string; // e.g. "B6"
  cells: Record<string, ExcelCell>;
  showChart: boolean;
  chartTitle?: string;
  chartRange?: { labels: string[]; values: string[] };
}

export type SlideLayout = "cover" | "title-content" | "two-columns" | "image-text";
export type SlideTheme = "light" | "academic-blue" | "nature-green";

export interface SlideItem {
  id: string;
  title: string;
  subtitle?: string;
  body: string;
  layout: SlideLayout;
  isBulleted: boolean;
  notes: string;
  visualTag?: "solar" | "water" | "pollution" | "recycle" | "chart";
}

export interface PowerPointMissionState {
  selectedSlideIndex: number;
  theme: SlideTheme;
  isPresenting: boolean;
  hasPresented?: boolean;
  slides: SlideItem[];
}

export type WorkspaceState =
  | { kind: "word"; data: WordMissionState }
  | { kind: "excel"; data: ExcelMissionState }
  | { kind: "powerpoint"; data: PowerPointMissionState };

export interface MissionObjective {
  id: string;
  label: string;
  check: (state: WorkspaceState) => boolean;
}

export interface MissionDefinition {
  id: string;
  track: OfficeTrack;
  order: number;
  title: string;
  subtitle: string;
  gradeTag: string;
  xpReward: number;
  conceptSummary: string;
  initialPrompt: string;
  createInitialState: () => WorkspaceState;
  objectives: MissionObjective[];
  summarizeForAI: (state: WorkspaceState) => string;
}

export interface TutorMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

export interface ShortcutChallenge {
  id: string;
  app: OfficeTrack;
  situation: string;
  correctKeys: string[]; // e.g. ["Ctrl", "B"] or ["F5"]
  options: Array<{ keys: string[]; label: string }>;
  explanation: string;
}
