import { AIModel, AIModelId, ModelFieldSpec } from '@/types/models';

export const AI_MODELS: AIModel[] = [
  {
    id: 'chatgpt',
    name: 'ChatGPT',
    company: 'OpenAI',
    color: '#10A37F',
    description: 'Custom Instructions, Personality & Characteristics',
  },
  {
    id: 'claude',
    name: 'Claude',
    company: 'Anthropic',
    color: '#D4A574',
    description: 'Profile Preferences & Style Selection',
  },
  {
    id: 'gemini',
    name: 'Gemini',
    company: 'Google',
    color: '#4285F4',
    description: 'Instructions for Gemini',
  },
  {
    id: 'perplexity',
    name: 'Perplexity',
    company: 'Perplexity AI',
    color: '#20808D',
    description: 'AI Profile & Response Language',
  },
];

export const MODEL_FIELDS: Record<AIModelId, ModelFieldSpec[]> = {
  chatgpt: [
    {
      id: 'nickname',
      label: 'Nickname',
      type: 'text',
      placeholder: 'How ChatGPT should address you',
      navigationPath: 'Profile icon → Personalization → Nickname',
    },
    {
      id: 'occupation',
      label: 'Occupation',
      type: 'text',
      placeholder: 'Your job or profession',
      navigationPath: 'Profile icon → Personalization → Occupation',
    },
    {
      id: 'knowAboutYou',
      label: 'What would you like ChatGPT to know about you?',
      type: 'textarea',
      charLimit: 1500,
      placeholder: 'Your role, interests, context...',
      navigationPath: 'Profile icon → Personalization → Custom Instructions',
    },
    {
      id: 'howToRespond',
      label: 'How would you like ChatGPT to respond?',
      type: 'textarea',
      charLimit: 1500,
      placeholder: 'Tone, format, style preferences...',
      navigationPath: 'Profile icon → Personalization → Custom Instructions',
    },
    {
      id: 'personality',
      label: 'Base Style and Tone',
      type: 'dropdown',
      options: ['Default', 'Professional', 'Friendly', 'Candid', 'Quirky', 'Efficient', 'Nerdy', 'Cynical'],
      navigationPath: 'Profile icon → Personalization → Personality',
    },
    {
      id: 'warm',
      label: 'Warm',
      type: 'three-way',
      options: ['More', 'Default', 'Less'],
      helpText: 'How sincere, kind, and friendly the tone sounds',
      navigationPath: 'Profile icon → Personalization → Characteristics',
    },
    {
      id: 'enthusiastic',
      label: 'Enthusiastic',
      type: 'three-way',
      options: ['More', 'Default', 'Less'],
      helpText: 'Level of enthusiasm and energy in responses',
      navigationPath: 'Profile icon → Personalization → Characteristics',
    },
    {
      id: 'headersAndLists',
      label: 'Headers & Lists',
      type: 'three-way',
      options: ['More', 'Default', 'Less'],
      helpText: 'Use of markdown formatting (headers, lists, tables)',
      navigationPath: 'Profile icon → Personalization → Characteristics',
    },
    {
      id: 'emoji',
      label: 'Emoji',
      type: 'three-way',
      options: ['More', 'Default', 'Less'],
      helpText: 'Frequency of emoji use in responses',
      navigationPath: 'Profile icon → Personalization → Characteristics',
    },
  ],
  claude: [
    {
      id: 'profilePreferences',
      label: 'Profile Preferences',
      type: 'textarea',
      placeholder: 'Who you are, what you do, how you want Claude to behave...',
      navigationPath: 'Initials (bottom-left) → Settings → Profile',
    },
    {
      id: 'recommendedStyle',
      label: 'Recommended Style',
      type: 'dropdown',
      options: ['Normal', 'Concise', 'Explanatory', 'Formal'],
      helpText: 'Or create a Custom Style with the guidance below',
      navigationPath: 'Style selector (bottom of chat input)',
    },
  ],
  gemini: [
    {
      id: 'instructions',
      label: 'Instructions for Gemini',
      type: 'textarea',
      placeholder: 'Standing instructions applied to every chat...',
      navigationPath: 'Settings & help → Personal Intelligence → Instructions for Gemini',
    },
  ],
  perplexity: [
    {
      id: 'bio',
      label: 'Bio',
      type: 'textarea',
      placeholder: 'Tell Perplexity about yourself...',
      navigationPath: 'Account icon → Settings → Profile → Bio',
    },
    {
      id: 'preferredLanguage',
      label: 'Preferred Response Language',
      type: 'dropdown',
      options: ['English', 'Spanish', 'French', 'German', 'Portuguese', 'Italian', 'Dutch', 'Japanese', 'Korean', 'Chinese (Simplified)', 'Chinese (Traditional)', 'Arabic', 'Hindi', 'Russian'],
      navigationPath: 'Account icon → Settings → Profile → Preferred response language',
    },
  ],
};

export function getModelById(id: AIModelId): AIModel {
  return AI_MODELS.find(m => m.id === id)!;
}
