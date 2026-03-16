import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { AIModelId } from '@/types/models';
import { MODEL_FIELDS } from '@/data/models';

const client = new Anthropic();

interface NextQuestionRequest {
  selectedModels: AIModelId[];
  writingCodex: string | null;
  personalConstitution: string | null;
  previousAnswers: { question: string; answer: string }[];
  questionCount: number;
}

interface NextQuestionResponse {
  success: boolean;
  data?: {
    question: string;
    subtext?: string;
    inputType: 'textarea' | 'multiselect';
    options?: string[];
    isComplete: boolean;
  };
  error?: string;
}

function buildSystemPrompt(
  selectedModels: AIModelId[],
  writingCodex: string | null,
  personalConstitution: string | null,
): string {
  const modelFieldDescriptions = selectedModels
    .map((modelId) => {
      const fields = MODEL_FIELDS[modelId];
      if (!fields) return '';
      const fieldList = fields
        .map((f) => `  - ${f.label}: ${f.helpText || f.placeholder || f.type}`)
        .join('\n');
      return `${modelId}:\n${fieldList}`;
    })
    .filter(Boolean)
    .join('\n\n');

  let prompt = `You are helping a user create custom instructions for their AI assistants. Your job is to ask ONE question at a time to understand their preferences deeply — especially how they want AI to interact with them.

The user has selected these AI models: ${selectedModels.join(', ')}

Here are the fields we need to fill for each model:
${modelFieldDescriptions}

IMPORTANT — QUESTION ORDER:
You MUST follow this exact sequence. Do NOT skip ahead or reorder.

Question 1: Ask for their name and what they do for a living (profession/role). This MUST be the first question every time.

Question 2: What they primarily use AI for — work tasks, writing, coding, research, brainstorming, creative projects, etc. Ask them to be specific about their main use cases.

Question 3: Communication style — How do they want AI to talk to them? Formal vs casual, verbose vs concise, warm vs direct? Do they prefer a conversational partner or a task executor?

Question 4: AI interaction behavior — This is critical. Do they want AI to:
  - Challenge their thinking and push back on weak ideas?
  - Be honest even when it's uncomfortable, or more agreeable/supportive?
  - Point out blind spots and flag when they might be rationalizing?
  - Offer perspectives they haven't considered?
  Frame this as: "How do you want AI to work WITH you — as a yes-man, a collaborator, or a challenger?"

Question 5: Question behavior and workflow — How should AI handle uncertainty and complex tasks?
  - Should it ask clarifying questions before assuming, or just go?
  - One question at a time, or multiple at once?
  - Should it check in on unfinished threads?
  - Should it break complex tasks into steps and guide through them one at a time?

Question 6: Tone by context — Do they shift tone depending on what they're working on? For example:
  - Professional work = direct, precise, collaborative
  - Creative work = reflective, exploratory, emotionally nuanced
  - Personal/casual = conversational, candid, grounded
  Ask if they have distinct "modes" and what those look like.

Question 7: Format and structure preferences — bullet points vs paragraphs, headers, how much structure? Do they want a suggested next step or action item at the end of responses? Do they want responses to end with follow-up questions?

Question 8: Pet peeves — What do they absolutely NOT want AI to do? Examples: generic filler, over-explaining, corporate jargon, being a yes-man, hedging everything, unnecessary caveats, repeating what they already said.

Question 9: Domain context — Jargon, technical level, industry-specific knowledge they expect AI to have or learn.

Question 10+: Model-specific preferences based on their selected platforms — dig into anything unique to the platforms they chose.
`;

  if (writingCodex) {
    prompt += `\nThe user has provided their Writing Codex (their writing style/voice). You can reference this — don't ask questions that are already clearly answered by it.\n\nWriting Codex:\n${writingCodex}\n`;
  }

  if (personalConstitution) {
    prompt += `\nThe user has provided their Personal Constitution (their values and principles). You can reference this — don't ask questions that are already clearly answered by it.\n\nPersonal Constitution:\n${personalConstitution}\n`;
  }

  prompt += `
Guidelines:
- Ask ONE question per response
- KEEP QUESTIONS SHORT. Maximum 1-2 sentences. No lead-in paragraphs, no preamble, no "Great, now let me ask about..." — just ask the question directly.
- Bad: "Based on what you've shared about your work, it sounds like you have a lot of different contexts. I'm curious about how you'd want AI to adjust its tone depending on what you're working on. Do you have different modes?"
- Good: "Do you shift tone depending on context — like professional vs. creative vs. personal? What does each mode look like for you?"
- Put any context or explanation in the "subtext" field, NOT in the question itself
- Prefer textarea questions, but use multiselect when offering a clear set of options
- For multiselect, provide 4-8 clear options
- The subtext should be brief (1 sentence) explaining why this matters for their custom instructions
- The MOST IMPORTANT questions are 4-6 (interaction behavior, question handling, contextual tone) — these produce the most valuable custom instructions. Don't rush through them.
- After 10-12 questions (depending on how much context was already provided via codex/constitution), set isComplete to true
- If codex AND constitution are provided, you can be done in 7-9 questions since much context is already known
- NEVER ask more than 15 questions total
- Don't ask questions that are already clearly answered by the codex or constitution

Return ONLY valid JSON matching this schema:
{
  "question": "Your question here",
  "subtext": "Brief context about why this matters",
  "inputType": "textarea" or "multiselect",
  "options": ["only", "for", "multiselect"],
  "isComplete": false
}`;

  return prompt;
}

function buildUserPrompt(
  previousAnswers: { question: string; answer: string }[],
  questionCount: number,
): string {
  if (questionCount === 0) {
    return 'Start the conversation. Ask the first question.';
  }

  const qaHistory = previousAnswers
    .map((qa, i) => `Q${i + 1}: ${qa.question}\nA${i + 1}: ${qa.answer}`)
    .join('\n\n');

  return `Previous questions and answers:\n${qaHistory}\n\nAsk the next question. We've asked ${questionCount} questions so far.`;
}

function parseAIResponse(text: string): NextQuestionResponse['data'] | null {
  // Strip markdown code fences if present
  let cleaned = text.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.slice(7);
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.slice(3);
  }
  if (cleaned.endsWith('```')) {
    cleaned = cleaned.slice(0, -3);
  }
  cleaned = cleaned.trim();

  try {
    const parsed = JSON.parse(cleaned);
    // Validate required fields
    if (!parsed.question || !parsed.inputType) {
      return null;
    }
    return {
      question: parsed.question,
      subtext: parsed.subtext || undefined,
      inputType: parsed.inputType,
      options: parsed.options || undefined,
      isComplete: Boolean(parsed.isComplete),
    };
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest): Promise<NextResponse<NextQuestionResponse>> {
  try {
    const body: NextQuestionRequest = await request.json();
    const {
      selectedModels,
      writingCodex,
      personalConstitution,
      previousAnswers,
      questionCount,
    } = body;

    if (!selectedModels || selectedModels.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No models selected' },
        { status: 400 },
      );
    }

    const systemPrompt = buildSystemPrompt(selectedModels, writingCodex, personalConstitution);
    const userPrompt = buildUserPrompt(previousAnswers || [], questionCount || 0);

    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: userPrompt,
        },
      ],
    });

    const text = response.content[0].type === 'text' ? response.content[0].text : '';
    const data = parseAIResponse(text);

    if (!data) {
      console.error('Failed to parse AI response:', text);
      return NextResponse.json(
        { success: false, error: 'Failed to generate question' },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Next question error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate question' },
      { status: 500 },
    );
  }
}
