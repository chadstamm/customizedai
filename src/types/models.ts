export type AIModelId = 'chatgpt' | 'claude' | 'gemini' | 'perplexity';

export interface AIModel {
  id: AIModelId;
  name: string;
  company: string;
  color: string;
  description: string;
}

export interface ModelFieldSpec {
  id: string;
  label: string;
  type: 'textarea' | 'text' | 'dropdown' | 'three-way';
  charLimit?: number;
  options?: string[];
  placeholder?: string;
  helpText?: string;
  navigationPath?: string;
}

export interface GenerationResult {
  chatgpt?: {
    nickname: string;
    occupation: string;
    knowAboutYou: string;
    personality: string;
    personalityReasoning: string;
    warm: 'More' | 'Default' | 'Less';
    enthusiastic: 'More' | 'Default' | 'Less';
    headersAndLists: 'More' | 'Default' | 'Less';
    emoji: 'More' | 'Default' | 'Less';
    characteristicsReasoning: string;
    customInstructions: string;
  };
  claude?: {
    fullName: string;
    callYou: string;
    workDescription: string;
    personalPreferences: string;
    recommendedStyle: string;
    styleReasoning: string;
    customStyleGuidance?: string;
  };
  gemini?: {
    instructions: string;
  };
  perplexity?: {
    occupation: string;
    customInstructions: string;
    responseLength: 'More' | 'Default' | 'Less';
    headersAndLists: 'More' | 'Default' | 'Less';
  };
}
