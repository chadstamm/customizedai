# CustomizedAI Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a single-page wizard app that generates tailored custom instructions for ChatGPT, Claude, Gemini, and Perplexity — mapped exactly to each platform's real settings fields.

**Architecture:** Next.js 16 App Router with React Context state management, Claude API for AI-driven questions and single-pass generation, tabbed results UI mirroring each model's actual settings interface. Follows identical patterns to WriteLikeMe (`~/Desktop/Claude Code Projects/writelikeme/`).

**Tech Stack:** Next.js 16, React 19, TypeScript, Tailwind CSS v4, Framer Motion, @anthropic-ai/sdk, @vercel/analytics

**Design doc:** `docs/plans/2026-02-28-customizedai-design.md`

**Reference project:** `~/Desktop/Claude Code Projects/writelikeme/` — follow its patterns for WizardContext, API routes, streaming, voice input, and component structure.

---

## Task 1: Project Scaffolding

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `next.config.ts`
- Create: `postcss.config.mjs`
- Create: `.gitignore`
- Create: `.env.local`

**Step 1: Initialize Next.js project**

Run inside `~/Desktop/Claude Code Projects/customizedai/`:

```bash
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --no-import-alias --turbopack
```

If the directory already has files, accept overwrite prompts for config files. The `docs/` folder will be preserved.

**Step 2: Install dependencies**

```bash
npm install @anthropic-ai/sdk framer-motion mammoth pdf-parse @vercel/analytics
```

**Step 3: Create `.env.local`**

```
ANTHROPIC_API_KEY=your-key-here
```

**Step 4: Verify dev server starts**

```bash
npm run dev
```

Expected: Server starts on localhost:3000

**Step 5: Commit**

```bash
git add -A && git commit -m "feat: scaffold Next.js project with dependencies"
```

---

## Task 2: Design System (globals.css + layout.tsx)

**Files:**
- Modify: `src/app/globals.css`
- Modify: `src/app/layout.tsx`
- Create: `public/favicon.svg`

**Reference:** `~/Desktop/Claude Code Projects/writelikeme/src/app/globals.css` for pattern, but use CustomizedAI's color palette.

**Step 1: Write globals.css**

Replace `src/app/globals.css` with the CustomizedAI design tokens and component classes. Key tokens:

```css
@import "tailwindcss";

:root {
  --primary: #4F46E5;
  --primary-dark: #4338CA;
  --accent: #06B6D4;
  --accent-dark: #0891B2;
  --bg: #F8FAFC;
  --bg-dark: #0F172A;
  --bg-card: #FFFFFF;
  --ink: #1E293B;
  --ink-light: #334155;
  --muted: #64748B;
  --border: #E2E8F0;
  --border-light: #F1F5F9;
  --success: #10B981;
  --error: #EF4444;

  --background: var(--bg);
  --foreground: var(--ink);
}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --font-sans: var(--font-body);
  --font-serif: var(--font-display);
}
```

Include: button classes (`.btn-primary`, `.btn-secondary`, `.btn-ghost`), textarea styles, progress bar with indigo-to-teal gradient, tab-bar underline style, glassmorphism card class, voice recording pulse animation, scrollbar styling, selection color. Follow the same CSS pattern as WriteLikeMe but with indigo/teal palette.

**Step 2: Write layout.tsx**

Use Playfair Display (serif display) and Inter (sans body). Follow WriteLikeMe's `layout.tsx` pattern for font loading, metadata, and structure. Set title to "CustomizedAI | Custom Instructions for Every AI" and appropriate meta description/OG tags.

**Step 3: Create a simple SVG favicon**

A simple indigo-colored icon.

**Step 4: Verify styles load**

```bash
npm run dev
```

Visit localhost:3000 — should see the new background color and fonts.

**Step 5: Commit**

```bash
git add -A && git commit -m "feat: add design system with indigo/teal palette"
```

---

## Task 3: TypeScript Types

**Files:**
- Create: `src/types/wizard.ts`
- Create: `src/types/models.ts`

**Reference:** `~/Desktop/Claude Code Projects/writelikeme/src/types/wizard.ts`

**Step 1: Write `src/types/models.ts`**

```typescript
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
  navigationPath?: string; // e.g., "Settings → Personalization → Custom Instructions"
}

export interface ModelOutput {
  modelId: AIModelId;
  fields: { fieldId: string; value: string }[];
}

export interface GenerationResult {
  chatgpt?: {
    nickname: string;
    occupation: string;
    knowAboutYou: string;
    howToRespond: string;
    personality: string;
    personalityReasoning: string;
    warm: 'More' | 'Default' | 'Less';
    enthusiastic: 'More' | 'Default' | 'Less';
    headersAndLists: 'More' | 'Default' | 'Less';
    emoji: 'More' | 'Default' | 'Less';
    characteristicsReasoning: string;
  };
  claude?: {
    profilePreferences: string;
    recommendedStyle: string;
    styleReasoning: string;
    customStyleGuidance?: string;
  };
  gemini?: {
    instructions: string;
  };
  perplexity?: {
    bio: string;
    preferredLanguage: string;
  };
}
```

**Step 2: Write `src/types/wizard.ts`**

Adapt WriteLikeMe's types. Key changes:
- Add `selectedModels: AIModelId[]` to `WizardState`
- Add `writingCodex: string | null` and `personalConstitution: string | null`
- Replace `generatedCodex: string | null` with `generationResult: GenerationResult | null`
- Remove `writingSamples` / `analyzedSamples` (not needed — we have codex/constitution instead)
- Keep `answers`, `analyzedInsights`, `currentStep`, `isGenerating`, `generationPhase`, `error`

```typescript
import { AIModelId, GenerationResult } from './models';

export interface WizardAnswer {
  questionId: string;
  question: string;
  answer: string;
  timestamp: number;
}

export interface AnalyzedInsight {
  questionId: string;
  insight: string;
  status: 'pending' | 'analyzing' | 'complete' | 'error';
}

export type GenerationPhase = 'idle' | 'waiting-for-insights' | 'generating' | 'streaming';

export interface WizardState {
  currentStep: number;
  selectedModels: AIModelId[];
  writingCodex: string | null;
  personalConstitution: string | null;
  answers: WizardAnswer[];
  analyzedInsights: AnalyzedInsight[];
  isComplete: boolean;
  isGenerating: boolean;
  generationPhase: GenerationPhase;
  generationResult: GenerationResult | null;
  streamedText: string | null;
  error: string | null;
}
```

**Step 3: Commit**

```bash
git add -A && git commit -m "feat: add TypeScript types for wizard and model specs"
```

---

## Task 4: Model Field Specifications Data

**Files:**
- Create: `src/data/models.ts`

**Step 1: Write `src/data/models.ts`**

This file defines the 4 supported AI models and their exact custom instruction field specifications. This data drives both the generation prompt and the results UI.

```typescript
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
```

**Step 2: Commit**

```bash
git add -A && git commit -m "feat: add model field specifications data"
```

---

## Task 5: Wizard State Management (WizardContext)

**Files:**
- Create: `src/context/WizardContext.tsx`

**Reference:** `~/Desktop/Claude Code Projects/writelikeme/src/context/WizardContext.tsx` — follow the exact same reducer + context + hook pattern.

**Step 1: Write WizardContext.tsx**

Adapt WriteLikeMe's WizardContext with these changes:
- State shape uses `WizardState` from our types (selectedModels, writingCodex, personalConstitution, generationResult, streamedText)
- Actions include: `TOGGLE_MODEL`, `SET_WRITING_CODEX`, `SET_PERSONAL_CONSTITUTION`, `SAVE_ANSWER`, `SET_INSIGHT`, `START_GENERATING`, `SET_GENERATION_PHASE`, `APPEND_STREAMED_TEXT`, `GENERATION_SUCCESS` (payload is `GenerationResult`), `GENERATION_ERROR`, `SET_STEP`, `NEXT_STEP`, `PREV_STEP`, `RESTORE_STATE`, `RESET`
- `TOGGLE_MODEL` adds or removes a model from `selectedModels[]`
- `GENERATION_SUCCESS` parses the accumulated `streamedText` as JSON into `GenerationResult`
- Keep the same localStorage persistence pattern (key: `customizedai-wizard-state`)
- Keep the same `analyzeAnswerInBackground` fire-and-forget pattern
- Keep the same `waitForPendingInsights` + `performStreamingGeneration` pattern
- The `buildGenerationBody` should include `selectedModels`, `writingCodex`, `personalConstitution`, `answers`, and `analyzedInsights`
- Keep `hasSavedProgress`, `resumeProgress`, `clearSavedProgress`
- `canProceed`: Step 1 (model selection) requires at least 1 model selected. Step 2 (foundation) is always skippable. Question steps are always skippable (AI-driven, no required fields).
- Expose `totalQuestionCount` (starts at 0, updated as AI generates questions)

The generation flow:
1. `generateInstructions()` dispatches `START_GENERATING` + `NEXT_STEP`
2. Waits for pending insights
3. Calls `/api/generate` with streaming
4. Accumulates text into `streamedText`
5. On stream end, parses JSON from `streamedText` and dispatches `GENERATION_SUCCESS` with parsed `GenerationResult`
6. If JSON parse fails, dispatches `GENERATION_ERROR`

**Step 2: Verify it compiles**

```bash
npx tsc --noEmit
```

Expected: No type errors

**Step 3: Commit**

```bash
git add -A && git commit -m "feat: add WizardContext state management"
```

---

## Task 6: Wizard Orchestrator + Entry Point

**Files:**
- Create: `src/components/wizard/Wizard.tsx`
- Modify: `src/app/page.tsx`

**Reference:** `~/Desktop/Claude Code Projects/writelikeme/src/components/wizard/Wizard.tsx`

**Step 1: Write Wizard.tsx**

Follow WriteLikeMe's Wizard.tsx pattern:
- Import all step components (IntroStep, ModelSelectionStep, FoundationStep, QuestionStep, GeneratingStep, ResultsStep)
- Render step based on `state.currentStep`:
  - 0 = IntroStep
  - 1 = ModelSelectionStep
  - 2 = FoundationStep
  - 3 to N = QuestionStep (AI-driven questions)
  - N+1 = GeneratingStep
  - N+2 = ResultsStep
- AnimatePresence with mode="wait" for transitions
- Resume banner when `hasSavedProgress` (same pattern as WriteLikeMe)
- Decorative background elements: gradient mesh (indigo→teal, low opacity radial gradients), NO grain texture
- Footer with "Powered by Chad Stamm & TMC Digital Media" + "Donate" link

For now, create placeholder components for each step that just display the step name. We'll implement them in subsequent tasks.

**Step 2: Write page.tsx**

```typescript
'use client';

import { WizardProvider } from '@/context/WizardContext';
import { Wizard } from '@/components/wizard/Wizard';

export default function Home() {
  return (
    <WizardProvider>
      <Wizard />
    </WizardProvider>
  );
}
```

**Step 3: Verify app loads**

```bash
npm run dev
```

Visit localhost:3000. Should see IntroStep placeholder.

**Step 4: Commit**

```bash
git add -A && git commit -m "feat: add wizard orchestrator and entry point"
```

---

## Task 7: Landing Page (IntroStep)

**Files:**
- Create: `src/components/wizard/IntroStep.tsx`

**Reference:** `~/Desktop/Claude Code Projects/writelikeme/src/components/wizard/IntroStep.tsx` for layout pattern. Use `~/Desktop/Claude Code Projects/we-the-me/src/components/wizard/IntroStep.tsx` for the dark hero pattern.

**Step 1: Write IntroStep.tsx**

**IMPORTANT:** Before writing this component, invoke the `frontend-design` skill to generate a distinctive, production-grade design. Pass it:
- The color palette (indigo #4F46E5, teal #06B6D4, navy #0F172A)
- The typography (Playfair Display serif + Inter sans)
- That this is a sibling to WriteLikeMe and WeTheMe
- The content structure below

Content structure:
1. **Hero section** (dark navy background with indigo→teal gradient mesh):
   - Large serif headline — something bold like "Every AI Should Know You"
   - Subheadline — "Create perfect custom instructions for ChatGPT, Claude, Gemini, and Perplexity — tailored to each platform's exact settings."
   - Primary CTA button: "Build My Instructions"
   - Model logos/icons displayed subtly

2. **How It Works section** (light background):
   - 3 steps with large dramatic numbers (same pattern as WriteLikeMe):
     1. "Select Your AIs" — Choose which models you use
     2. "Answer a Few Questions" — AI-driven conversation about your preferences
     3. "Get Your Instructions" — Copy-paste ready for each platform

3. **Why This Matters section** (brief):
   - Brief copy about why generic AI responses aren't good enough
   - Could use StoryBrand messaging later

4. **Bottom CTA** — repeat of "Build My Instructions" button

Use Framer Motion for staggered animations on hero text reveal and feature cards.

**Step 2: Verify**

```bash
npm run dev
```

Visit localhost:3000 — should see the full landing page.

**Step 3: Commit**

```bash
git add -A && git commit -m "feat: add landing page with hero and how-it-works"
```

---

## Task 8: Model Selection Step

**Files:**
- Create: `src/components/wizard/ModelSelectionStep.tsx`

**Step 1: Write ModelSelectionStep.tsx**

**IMPORTANT:** Invoke `frontend-design` skill for this component.

Design:
- Headline: "Which AIs do you use?" (serif, large)
- Subtext: "Select one or more. We'll create custom instructions for each."
- 4 branded cards in a 2x2 grid (responsive: 1 col on mobile):
  - Each card shows: model icon/logo placeholder, model name, company name, brief description of what fields it has
  - Glassmorphism effect: `backdrop-blur-xl bg-white/70 border border-white/20`
  - Checkbox indicator (top-right corner) — indigo check when selected
  - Card border glows with the model's brand color when selected
  - Subtle scale animation on hover
- "Continue" button (disabled until at least 1 selected)
- Uses `useWizard()` to read `state.selectedModels` and dispatch `TOGGLE_MODEL`

**Step 2: Verify**

Navigate to step 1 in the wizard, check model selection works.

**Step 3: Commit**

```bash
git add -A && git commit -m "feat: add model selection step with branded cards"
```

---

## Task 9: Foundation Step (Codex/Constitution Upload)

**Files:**
- Create: `src/components/wizard/FoundationStep.tsx`

**Step 1: Write FoundationStep.tsx**

**IMPORTANT:** Invoke `frontend-design` skill for this component.

Design:
- Headline: "Share Your Foundation" (serif)
- Subtext: "If you have a Writing Codex or Personal Constitution, paste or upload them. They'll make your instructions even better."
- Two side-by-side cards (stacked on mobile):

  **Writing Codex card:**
  - Icon/illustration placeholder
  - "Writing Codex"
  - Textarea to paste (or drag-and-drop file area)
  - "Don't have one?" link → opens WriteLikeMe in new tab
  - Uses `dispatch({ type: 'SET_WRITING_CODEX', payload: text })`

  **Personal Constitution card:**
  - Icon/illustration placeholder
  - "Personal Constitution"
  - Textarea to paste (or drag-and-drop file area)
  - "Don't have one?" link → opens WeTheMe in new tab
  - Uses `dispatch({ type: 'SET_PERSONAL_CONSTITUTION', payload: text })`

- File upload support: accept `.txt`, `.md`, `.pdf`, `.docx` — call `/api/parse-file` to extract text
- "Continue" button (always enabled — both fields are optional)
- "Skip" button in muted style

**Step 2: Write file parsing API route**

Create `src/app/api/parse-file/route.ts` — copy directly from WriteLikeMe's implementation at `~/Desktop/Claude Code Projects/writelikeme/src/app/api/parse-file/route.ts`. No changes needed — same PDF/DOCX parsing logic.

**Step 3: Verify upload works**

Test with a .txt file and a .pdf file.

**Step 4: Commit**

```bash
git add -A && git commit -m "feat: add foundation step with codex/constitution upload"
```

---

## Task 10: Voice Input Hook

**Files:**
- Create: `src/hooks/useVoiceInput.ts`

**Step 1: Copy from WriteLikeMe**

Copy `~/Desktop/Claude Code Projects/writelikeme/src/hooks/useVoiceInput.ts` directly. No changes needed — same Web Speech API wrapper.

**Step 2: Commit**

```bash
git add -A && git commit -m "feat: add voice input hook"
```

---

## Task 11: API Route — Analyze Answer (Background)

**Files:**
- Create: `src/app/api/analyze-answer/route.ts`

**Step 1: Write analyze-answer route**

Adapt WriteLikeMe's `analyze-answer/route.ts`. Same pattern: POST handler, Haiku model, returns concise insight. Adjust the system prompt to focus on extracting AI usage preferences and communication style rather than writing voice patterns.

System prompt should instruct Haiku to extract:
- Communication preferences
- AI usage patterns
- Personality traits relevant to AI customization
- Format and structure preferences

**Step 2: Commit**

```bash
git add -A && git commit -m "feat: add background answer analysis API route"
```

---

## Task 12: API Route — Next Question (AI-Driven)

**Files:**
- Create: `src/app/api/next-question/route.ts`

**Step 1: Write next-question route**

This is new — WriteLikeMe uses pre-defined questions, but CustomizedAI uses AI-driven questions.

POST handler that accepts:
```json
{
  "selectedModels": ["chatgpt", "claude"],
  "writingCodex": "...",
  "personalConstitution": "...",
  "previousAnswers": [{ "question": "...", "answer": "..." }],
  "analyzedInsights": [{ "questionId": "...", "insight": "..." }],
  "questionCount": 5,
  "maxQuestions": 12
}
```

Uses Claude Sonnet to generate the next question. System prompt should:
- Explain that we're building custom instructions for specific AI models
- List the selected models and their field specs (from `MODEL_FIELDS`)
- Provide the codex/constitution as context (if present)
- List all previous Q&A pairs
- Instruct Claude to ask ONE question at a time
- Cover these topics in roughly this order:
  1. Role & identity (who are you, what do you do)
  2. AI use cases (what do you use AI for)
  3. Communication style (formal/casual, verbose/concise, etc.)
  4. Format preferences (bullets vs paragraphs, headers, examples)
  5. Personality/tone preferences (warm, direct, humorous, etc.)
  6. Pet peeves (things you DON'T want AI to do)
  7. Domain-specific context (industry jargon, technical level)
  8. Model-specific preferences (if they selected ChatGPT, ask about emoji preferences, etc.)
- Return JSON: `{ "question": "...", "subtext": "...", "inputType": "textarea" | "multiselect", "options": [...], "isComplete": false }`
- Set `isComplete: true` when enough information has been gathered (typically 8-12 questions)
- If codex/constitution provided, skip questions that are already answered by those documents

**Step 2: Verify the route returns a question**

Test with curl or a simple fetch.

**Step 3: Commit**

```bash
git add -A && git commit -m "feat: add AI-driven next-question API route"
```

---

## Task 13: Question Step (AI-Driven)

**Files:**
- Create: `src/components/wizard/QuestionStep.tsx`

**Reference:** `~/Desktop/Claude Code Projects/writelikeme/src/components/wizard/QuestionStep.tsx`

**Step 1: Write QuestionStep.tsx**

**IMPORTANT:** Invoke `frontend-design` skill for this component.

This is the most complex step. It manages a conversation loop:

1. On mount (or when step changes), call `/api/next-question` to get the next question
2. Display the question with appropriate input (textarea with voice input, or multiselect)
3. User answers and clicks "Next"
4. Save answer → trigger background analysis → call `/api/next-question` again
5. If `isComplete: true`, transition to generation

Key UI elements:
- Question displayed in large serif italic (same `.question-dramatic` pattern as WriteLikeMe)
- Subtext below in muted body font
- Textarea input with voice recording button (use `useVoiceInput` hook)
- Multiselect grid when `inputType === 'multiselect'`
- Progress indicator: "Question X" with a progress bar. Since total is dynamic, show a smooth progress bar that fills based on AI's estimate.
- Back button, Skip button, Next button
- Loading state while fetching next question (subtle spinner)
- Framer Motion transitions between questions (slide left/right)

State management:
- Track `currentQuestionData` (the AI-generated question) in local component state
- Track `isLoadingQuestion` boolean
- On "Next": save answer, set loading, fetch next question, animate transition
- On "Back": go to previous step (re-show previous answer)
- Keep answered questions in WizardContext so "Back" works

**Step 2: Verify question flow works**

Navigate through model selection → foundation → should see first AI-generated question.

**Step 3: Commit**

```bash
git add -A && git commit -m "feat: add AI-driven question step"
```

---

## Task 14: API Route — Generate (Single-Pass)

**Files:**
- Create: `src/app/api/generate/route.ts`

**Reference:** `~/Desktop/Claude Code Projects/writelikeme/src/app/api/generate/route.ts` for streaming pattern.

**Step 1: Write generate route**

POST handler that accepts the full wizard data and returns streaming JSON.

The system prompt is critical. It must:
1. Explain the task: generate custom instructions for specific AI models
2. Include the EXACT field specifications for each selected model (from MODEL_FIELDS data)
3. Include character limits where known (ChatGPT: 1,500 per textarea)
4. Include dropdown options where applicable
5. Instruct Claude to return valid JSON matching the `GenerationResult` type
6. Provide the user's codex, constitution, answers, and insights as context

The user prompt should synthesize all collected data:
```
Based on everything I've shared, generate my custom instructions for: [selected models]

My answers:
[formatted Q&A pairs with insights where available]

My Writing Codex:
[if provided]

My Personal Constitution:
[if provided]
```

Key implementation details:
- Use `client.messages.stream()` — same streaming pattern as WriteLikeMe
- Model: `claude-sonnet-4-5-20250514` (good balance of quality and speed for structured output)
- Set `max_tokens: 8000` (JSON output for 4 models can be large)
- Return as `text/plain` stream — the client accumulates and parses as JSON on completion
- Include explicit JSON schema in the prompt so Claude returns well-structured output

**Step 2: Verify the route streams**

Test with curl:
```bash
curl -X POST http://localhost:3000/api/generate \
  -H "Content-Type: application/json" \
  -d '{"selectedModels":["chatgpt"],"answers":[{"questionId":"q1","question":"What do you do?","answer":"I am a software engineer"}],"analyzedInsights":[],"writingCodex":null,"personalConstitution":null}'
```

Expected: Streaming JSON response

**Step 3: Commit**

```bash
git add -A && git commit -m "feat: add single-pass generation API route with streaming"
```

---

## Task 15: Generating Step

**Files:**
- Create: `src/components/wizard/GeneratingStep.tsx`

**Reference:** `~/Desktop/Claude Code Projects/writelikeme/src/components/wizard/GeneratingStep.tsx` for loading/streaming pattern.

**Step 1: Write GeneratingStep.tsx**

**IMPORTANT:** Invoke `frontend-design` skill for this component.

Three states:

**Waiting for insights:**
- Animated icon (e.g., brain/sparkles)
- "Analyzing your preferences..."
- Rotating status messages every 3 seconds:
  - "Understanding your communication style..."
  - "Mapping your preferences to each platform..."
  - "Crafting personalized instructions..."
- Subtle shimmer animation

**Generating/Streaming:**
- "Building your custom instructions..."
- Show streaming JSON as raw text (or a simplified preview showing which model is being generated)
- Pulsing progress indicator

**Error:**
- Error message display
- "Try Again" button calling `retryGeneration()`

On success (generation complete + JSON parsed), automatically transition to ResultsStep.

**Step 2: Verify generation flow**

Complete the wizard end-to-end, verify the generating screen displays.

**Step 3: Commit**

```bash
git add -A && git commit -m "feat: add generating step with streaming UI"
```

---

## Task 16: Results Step (Tabbed Model Output)

**Files:**
- Create: `src/components/wizard/ResultsStep.tsx`
- Create: `src/components/results/ModelTab.tsx`
- Create: `src/components/results/FieldDisplay.tsx`
- Create: `src/components/results/CopyButton.tsx`

**Step 1: Write CopyButton.tsx**

Small utility component:
- Shows clipboard icon + "Copy"
- On click: copies text to clipboard, shows "Copied!" for 2 seconds
- Framer Motion scale animation on click

**Step 2: Write FieldDisplay.tsx**

**IMPORTANT:** Invoke `frontend-design` skill for this component.

Renders a single field from the generation result, adapting to field type:

- **textarea**: Shows the generated text in a styled read-only area with character count (if charLimit exists) and copy button. Shows `navigationPath` as helper text below.
- **text**: Shows the generated value in a styled text field with copy button and navigation path.
- **dropdown**: Shows the recommended selection highlighted in a visual dropdown mockup (all options shown, recommended one has indigo highlight). Shows reasoning text below. Shows navigation path.
- **three-way**: Shows More / Default / Less as three pills, recommended one highlighted in indigo. Shows helpText and navigation path.

**Step 3: Write ModelTab.tsx**

Receives a `modelId` and the corresponding section of `GenerationResult`. Renders:
- Model name + company as header
- All fields using FieldDisplay, in order from MODEL_FIELDS
- "Copy All for [Model]" button at the bottom — copies all fields formatted as labeled text

For ChatGPT, also group the characteristics (Warm, Enthusiastic, Headers & Lists, Emoji) under a "Characteristics" subheading with the reasoning text.

For Claude, if there's `customStyleGuidance`, show it in a special "Custom Style" section with instructions on how to create one.

**Step 4: Write ResultsStep.tsx**

**IMPORTANT:** Invoke `frontend-design` skill for this component.

Layout:
- Success header: "Your Custom Instructions Are Ready" (large serif)
- Subtext: "Copy each section into the corresponding platform's settings."
- **Tab bar**: One tab per selected model. Tab shows model name + small colored dot matching model's brand color. Active tab has indigo underline.
- **Tab content**: Renders the appropriate ModelTab
- **Start Over** button at the bottom (calls `reset()`)
- Framer Motion tab content transitions

The tab bar should be sticky/fixed at the top of the results section so users can switch models while scrolling.

**Step 5: Verify full flow**

Complete the entire wizard end-to-end. Verify:
- Results show the correct tabs for selected models
- Each field displays correctly
- Copy buttons work
- Character counts show for ChatGPT fields
- Navigation paths display

**Step 6: Commit**

```bash
git add -A && git commit -m "feat: add tabbed results step with model-specific field displays"
```

---

## Task 17: Image Generation for Model Cards and Hero

**Files:**
- Modify: `public/` (add generated images)
- Modify: `src/components/wizard/IntroStep.tsx` (add images)
- Modify: `src/components/wizard/ModelSelectionStep.tsx` (add images)

**Step 1: Generate hero illustration**

**IMPORTANT:** Invoke the `nano-banana-pro` skill to generate:
- A hero illustration or abstract graphic for the landing page (tech-forward, indigo/teal palette)
- Model card icons or illustrations (if brand logos can't be used, create abstract representations)

**Step 2: Integrate images**

Add generated images to the appropriate components.

**Step 3: Commit**

```bash
git add -A && git commit -m "feat: add generated illustrations for hero and model cards"
```

---

## Task 18: StoryBrand Messaging Pass

**Files:**
- Modify: `src/components/wizard/IntroStep.tsx`

**Step 1: Apply StoryBrand messaging**

**IMPORTANT:** Invoke the `story-brand` skill to:
- Refine the hero headline and subheadline
- Write the "Why This Matters" section copy
- Ensure the landing page positions the USER as the hero and CustomizedAI as the guide
- Create clear PEACE SoundBytes for the value proposition

**Step 2: Update IntroStep with refined copy**

**Step 3: Commit**

```bash
git add -A && git commit -m "feat: apply StoryBrand messaging to landing page"
```

---

## Task 19: Polish and Final Touches

**Files:**
- Various component modifications

**Step 1: Add responsive design checks**

Test all components at mobile (375px), tablet (768px), and desktop (1280px) widths. Fix any layout issues.

**Step 2: Add loading states**

Ensure all API calls have appropriate loading indicators.

**Step 3: Add error boundaries**

Wrap the Wizard component in a React error boundary.

**Step 4: Test full flow end-to-end**

1. Load landing page
2. Click "Build My Instructions"
3. Select ChatGPT + Claude
4. Skip foundation (or paste test text)
5. Answer 3-4 AI-generated questions
6. Wait for generation
7. Verify results tabs for ChatGPT and Claude
8. Copy a field
9. Start over

**Step 5: Commit**

```bash
git add -A && git commit -m "feat: polish responsive design, loading states, error handling"
```

---

## Task 20: Deploy to Vercel

**Files:**
- Create: `vercel.json` (if needed for config)

**Step 1: Create GitHub repo**

```bash
gh repo create customizedai --public --source=. --push
```

**Step 2: Deploy with Vercel**

Invoke the `vercel:setup` and `vercel:deploy` skills to:
- Link the project to Vercel
- Set the `ANTHROPIC_API_KEY` environment variable
- Deploy

**Step 3: Verify production deploy**

Visit the deployed URL and run through the full flow.

**Step 4: Commit any deployment config**

```bash
git add -A && git commit -m "chore: add Vercel deployment config"
```
