# MyCustomAI — Design Document

## Overview

MyCustomAI is a free, single-page wizard app that generates tailored custom instructions for multiple AI platforms. Users select which AI models they use, optionally provide their writing codex and/or personal constitution, answer an AI-driven series of questions, and receive output mapped exactly to each model's custom instruction fields.

**Name:** MyCustomAI
**Business Model:** Free (no email gate, no paywall)
**Persistence:** One-shot (localStorage for session recovery only)
**Deployment:** Vercel

---

## Tech Stack

- **Next.js 16** (App Router, React 19) — consistent with WriteLikeMe and WeTheMe
- **TypeScript**
- **Tailwind CSS v4**
- **Framer Motion** — page transitions, animations
- **@anthropic-ai/sdk** — Claude API for wizard questions + generation
- **@vercel/analytics** — usage tracking
- **LocalStorage** — session recovery

---

## Supported Models (Launch)

1. **ChatGPT** (OpenAI)
2. **Claude** (Anthropic)
3. **Gemini** (Google)
4. **Perplexity**

---

## App Flow

### Step 0: Landing / Intro
- Bold hero section with dark navy (#0F172A) background
- Headline: communicates the value prop in one sentence
- How-it-works section (3 steps)
- CTA button starts the wizard
- Resume banner if saved progress exists in localStorage

### Step 1: Model Selection
- Branded cards for each AI model (logo/icon + name)
- Checkbox selection — at least one required
- Cards use soft glassmorphism effect

### Step 2: Your Foundation (Optional)
- Two paste/upload areas:
  - **Writing Codex** — paste text or upload file
    - Link: "Don't have one? Create yours at WriteLikeMe"
  - **Personal Constitution** — paste text or upload file
    - Link: "Don't have one? Create yours at WeTheMe"
- Both optional — skip button available

### Steps 3–N: AI-Driven Wizard
- One question at a time
- Claude analyzes previous answers to generate smart follow-ups
- Topics covered:
  - Identity (role, industry, expertise level)
  - Communication style (tone, formality, verbosity preferences)
  - AI use cases (writing, coding, research, brainstorming, etc.)
  - Format preferences (structure, examples, detail level)
  - Pet peeves (things you don't want AI to do)
  - Model-specific preferences (based on selected models)
- Progress bar + phase indicators
- Voice input support (Web Speech API)
- Background analysis of each answer (fire-and-forget)

### Step N+1: Generation
- Streaming generation screen
- Single Claude API call returns structured JSON with all selected models' fields
- Animated loading state with rotating status messages

### Step N+2: Results (Tabbed)
- Tab per selected model
- Each tab mirrors that model's actual settings interface
- Per-field copy buttons + "Copy All for [Model]" button
- Helper text showing exact navigation path in each platform's UI

---

## Model Field Specifications

### ChatGPT (OpenAI)
| Field | Type | Limit | Output |
|-------|------|-------|--------|
| Nickname | Text input | — | Generated name |
| Occupation | Text input | — | Generated occupation |
| "What should ChatGPT know about you?" | Textarea | 1,500 chars | Generated text with char count |
| "How should ChatGPT respond?" | Textarea | 1,500 chars | Generated text with char count |
| Base Style and Tone | Dropdown | 8 options | Recommended selection + reasoning |
| Warm | 3-way (More/Default/Less) | — | Recommended setting |
| Enthusiastic | 3-way (More/Default/Less) | — | Recommended setting |
| Headers & Lists | 3-way (More/Default/Less) | — | Recommended setting |
| Emoji | 3-way (More/Default/Less) | — | Recommended setting |

**ChatGPT Personality Options:** Default, Professional, Friendly, Candid, Quirky, Efficient, Nerdy, Cynical

### Claude (Anthropic)
| Field | Type | Limit | Output |
|-------|------|-------|--------|
| Profile Preferences | Textarea | Undocumented | Generated text |
| Recommended Style | Selection | 4 presets + custom | Recommended preset + custom style guidance |

**Claude Style Presets:** Normal, Concise, Explanatory, Formal

### Gemini (Google)
| Field | Type | Limit | Output |
|-------|------|-------|--------|
| Instructions for Gemini | Textarea | Undocumented | Generated text |

### Perplexity
| Field | Type | Limit | Output |
|-------|------|-------|--------|
| Bio | Textarea | Undocumented | Generated text |
| Preferred Response Language | Dropdown | — | Recommended selection |

---

## Generation Architecture

**Approach: Single-Pass Generation**

One Claude API call after the wizard completes. The prompt includes:
- All wizard answers + any uploaded codex/constitution
- Background analysis insights
- Structured specification of each selected model's fields (types, limits, options)
- Instructions to return structured JSON mapping to each model's fields

The response is streamed and parsed into the tabbed results UI.

---

## Design Language

### Color Palette
| Token | Value | Usage |
|-------|-------|-------|
| --primary | #4F46E5 (deep indigo) | CTAs, active states, primary accent |
| --accent | #06B6D4 (electric teal) | Secondary accent, gradients |
| --bg | #F8FAFC (cool near-white) | Page background |
| --bg-dark | #0F172A (deep navy) | Hero, dark sections |
| --ink | #1E293B (slate) | Body text |
| --muted | #64748B (light slate) | Secondary text, placeholders |

### Typography
- **Display:** Playfair Display (bold serif) — editorial family connection
- **Body:** Inter or DM Sans — clean, modern
- Fluid sizing via `clamp()` for headlines

### Visual Accents
- Gradient mesh in hero (indigo → teal, low opacity)
- No grain texture (differentiates from WriteLikeMe/WeTheMe)
- Glassmorphism on model selection cards
- Framer Motion transitions between wizard steps

### Component Patterns
- Rounded-xl cards with subtle shadows
- Filled indigo primary buttons, outlined secondary
- Clean input borders with indigo focus rings
- Progress bar: indigo-to-teal gradient fill
- Tab bar: underline-style active indicator in indigo

---

## Cross-Promotion

- Step 2 (Foundation) includes links to:
  - WriteLikeMe (https://writelikeme.vercel.app or similar) for codex creation
  - WeTheMe (https://we-the-me.vercel.app) for constitution creation

---

## State Management

- **WizardContext** (React Context + useReducer) — consistent with sibling apps
- **useWizard()** custom hook for component access
- **localStorage** key: `mycustomai-wizard-state`
- Persisted: answers, selected models, uploaded content, current step
- Not persisted: generation state, streaming content (unless complete)

---

## API Routes

| Route | Purpose |
|-------|---------|
| `/api/analyze-answer` | Background analysis of wizard answers (Haiku) |
| `/api/generate` | Streaming generation of all model outputs (Sonnet/Opus) |
| `/api/next-question` | AI-driven next question generation |
| `/api/parse-file` | Server-side file parsing (PDF/DOCX) |

---

## Key Decisions

- **Free, no email gate** — purest user experience
- **One-shot flow** — no accounts, no saved profiles
- **Single-pass generation** — one API call for all models
- **AI-driven questions** — Claude generates follow-ups based on answers
- **Field-accurate output** — results mirror each platform's actual UI fields
- **Big 4 at launch** — Claude, ChatGPT, Gemini, Perplexity
