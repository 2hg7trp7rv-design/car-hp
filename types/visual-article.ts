export interface TagItem { label: string; accent?: boolean }
export interface IndexItem { number: string; title: string; href: string }
export interface SystemCardItem { number: string; title: string; description: string; icon: 'Wind' | 'CircleDot' | 'Zap' | string }
export interface MechanismItem { label: string; title: string; description: string; diagramImage?: string; caption?: string; diagramAlt?: string; diagramCaption?: string; afterBodyIndex?: number }
export interface RiskItem { title: string; description: string }
export interface CheckItem { title: string; description: string }
export interface JunaBubbleData { name?: string; text: string; badge?: string }
export interface ChapterBodyParagraph { text: string; lead?: boolean }
export interface ChapterData { id: string; number: string; title: string; titleAccentParts: number[]; description: string; junaComments: JunaBubbleData[]; body?: ChapterBodyParagraph[]; systems?: SystemCardItem[]; mechanisms?: MechanismItem[]; risks?: RiskItem[]; checks?: CheckItem[] }
export interface ProcessChapterData { id: string; number: string; title: string; titleAccentParts: number[]; description: string; juna: JunaBubbleData; body?: ChapterBodyParagraph[] }
export interface CheckSectionData { label: string; title: string; titleAccent: boolean; description: string; tags: string[] }
export interface StepItem { number: number; title: string; description: string }
export interface EditorNoteData { text: string[]; accentParts: number[]; attribution: string }
export interface FinalSummaryItem { num: string; title: string; desc: string }
export interface FinalSummaryData { label: string; subLabel: string; title: string; titleAccentParts: number[]; items: FinalSummaryItem[] }
export interface VisualArticleData { meta: { title: string; description: string; columnLabel: string; columnSubLabel: string; lessonNumber: string; tags: TagItem[] }; junaIntro: JunaBubbleData; indexItems: IndexItem[]; chapters: ChapterData[]; checkSection: CheckSectionData; checkJuna?: JunaBubbleData; processChapter: ProcessChapterData; steps: StepItem[]; editorNote: EditorNoteData; finalSummary: FinalSummaryData; finalJuna: JunaBubbleData }
