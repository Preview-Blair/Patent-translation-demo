export enum AppView {
  UPLOAD = 'UPLOAD',
  WORKSPACE = 'WORKSPACE',
  GLOSSARY = 'GLOSSARY',
}

export interface GlossaryTerm {
  id: string;
  source: string;
  target: string;
  context?: string;
  category?: 'technical' | 'legal' | 'general';
  addedAt: string;
}

export interface FlaggedTerm {
  term: string;
  suggestion: string;
  reason: string;
  startIndex: number; // Simulated position for demo purposes or actual logic
}

export interface TranslationSegment {
  id: string;
  sourceText: string;
  translatedText: string;
  uncertaintyScore: number; // 0 to 1
  flaggedTerms: FlaggedTerm[];
}

export interface TranslationDocument {
  id: string;
  filename: string;
  uploadDate: string;
  segments: TranslationSegment[];
  status: 'processing' | 'ready' | 'error';
  targetLanguage: string;
}

export interface TranslationRequestConfig {
  targetLanguage: string;
  glossary: GlossaryTerm[];
}
