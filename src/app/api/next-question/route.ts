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

  let prompt = `You are helping a user create custom instructions for their AI assistants. Your job is to ask ONE question at a time to understand their preferences.

The user has selected these AI models: ${selectedModels.join(', ')}

Here are the fields we need to fill for each model:
${modelFieldDescriptions}
`;

  if (writingCodex) {
    prompt += `\nThe user has provided their Writing Codex (their writing style/voice). You can reference this — don't ask questions that are already clearly answered by it.\n\nWriting Codex:\n${writingCodex}\n`;
  }

  if (personalConstitution) {
    prompt += `\nThe user has provided their Personal Constitution (their values and principles). You can reference this — don't ask questions that are already clearly answered by it.\n\nPersonal Constitution:\n${personalConstitution}\n`;
  }

  prompt += `
Ask questions that help generate content for ALL the selected models' fields. Cover these topics roughly in this order:
1. Role & identity — Who are you? What do you do professionally?
2. AI use cases — What do you primarily use AI for? (writing, coding, research, brainstorming, etc.)
3. Communication style — Do you prefer formal or casual responses? Verbose or concise?
4. Format preferences — Do you prefer bullet points, paragraphs, headers? Do you want examples?
5. Personality/tone — Do you want AI to be warm, direct, humorous, no-nonsense?
6. Pet peeves — What do you NOT want AI to do? (e.g., be too verbose, use emojis, hedge everything)
7. Domain context — Any jargon, technical level, or industry-specific needs?
8. Model-specific preferences — If ChatGPT is selected, ask about emoji and formatting preferences. If Claude is selected, ask about their preferred level of detail.

Guidelines:
- Ask ONE question per response
- Keep questions conversational and easy to answer
- Prefer textarea questions, but use multiselect when offering a clear set of options
- For multiselect, provide 4-8 clear options
- Include a brief "subtext" that helps the user understand why you're asking
- After 8-12 questions (depending on how much context was already provided via codex/constitution), set isComplete to true
- If codex AND constitution are provided, you can be done in 6-8 questions since much context is already known
- NEVER ask more than 15 questions total

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
      model: 'claude-sonnet-4-5-20250514',
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
