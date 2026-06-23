// ============================================================
// Visual Article - Type Definitions
// Next.js / TypeScript strict mode compatible
// ============================================================

export type CharacterId = 'juna' | 'rina';

export type InfoBoxType = 'point' | 'check' | 'caution';

export interface HeroSection {
  lessonNumber: string;
  title: string;
  description: string;
  readTime: string;
  difficulty: string;
  category: string;
  characterImages: {
    left: string;
    center: string;
    right: string;
  };
}

export interface ChatMessage {
  type: 'chat';
  character: CharacterId;
  text: string;
}

export interface BodyParagraph {
  type: 'paragraph';
  text: string;
}

export interface BodyHeading {
  type: 'heading';
  level: 3 | 4;
  text: string;
  accentColor?: string;
}

export interface Illustration {
  type: 'illustration';
  src: string;
  alt: string;
  caption: string;
}

export interface SystemCardData {
  type: 'systemCard';
  number: string;
  title: string;
  paragraphs: string[];
  color: string;
  barColor: string;
  iconName: string;
}

export interface InfoBoxData {
  type: 'infoBox';
  boxType: InfoBoxType;
  title?: string;
  content: InfoBoxContent[];
}

export type InfoBoxContent =
  | { kind: 'paragraph'; text: string }
  | { kind: 'list'; items: string[] };

export interface DataTableData {
  type: 'table';
  headers: string[];
  rows: string[][];
}

export interface CheckListData {
  type: 'checkList';
  title: string;
  color: string;
  items: string[];
}

export interface NumberedListData {
  type: 'numberedList';
  title: string;
  color: string;
  items: string[];
}

export interface StepFlowData {
  type: 'stepFlow';
  src: string;
  alt: string;
  caption: string;
}

export interface SummaryCardData {
  type: 'summary';
  title: string;
  paragraphs: string[];
}

export interface SpacerData {
  type: 'spacer';
  size: 'sm' | 'md' | 'lg';
}

export type ArticleBlock =
  | ChatMessage
  | BodyParagraph
  | BodyHeading
  | Illustration
  | SystemCardData
  | InfoBoxData
  | DataTableData
  | CheckListData
  | NumberedListData
  | StepFlowData
  | SummaryCardData
  | SpacerData;

export interface ArticleSection {
  id: string;
  sectionNumber: string;
  title: string;
  subtitle: string;
  accentColor: string;
  blocks: ArticleBlock[];
}

export interface ArticleFooter {
  text: string;
}

export interface VisualArticleData {
  slug: string;
  hero: HeroSection;
  sections: ArticleSection[];
  closingBlocks: ArticleBlock[];
}
