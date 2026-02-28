import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { AIModelId } from '@/types/models';
import { WizardAnswer, AnalyzedInsight } from '@/types/wizard';
import { AI_MODELS, MODEL_FIELDS } from '@/data/models';

export const maxDuration = 300; // 5 minutes

const client = new Anthropic();

interface GenerateRequest {
  selectedModels: AIModelId[];
  answers: WizardAnswer[];
  analyzedInsights: AnalyzedInsight[];
  writingCodex: string | null;
  personalConstitution: string | null;
}

function buildSystemPrompt(selectedModels: AIModelId[]): string {
  let prompt = `You are generating personalized custom instructions for AI platforms. Based on everything the user has shared about themselves, generate content for each of the following platforms.

IMPORTANT: Return ONLY valid JSON. No markdown, no code fences, no explanation. Just the JSON object.

The JSON must match this exact schema:
{`;

  // Build the schema example dynamically
  const schemaLines: string[] = [];
  for (const modelId of selectedModels) {
    const model = AI_MODELS.find(m => m.id === modelId);
    if (!model) continue;

    const fields = MODEL_FIELDS[modelId];
    const fieldLines = fields.map(f => {
      if (f.id === 'personality') return `    "${f.id}": "string"`;
      if (f.type === 'three-way') return `    "${f.id}": "More | Default | Less"`;
      if (f.type === 'dropdown') return `    "${f.id}": "string"`;
      return `    "${f.id}": "string"`;
    });

    // Add reasoning fields for ChatGPT
    if (modelId === 'chatgpt') {
      fieldLines.push(`    "personalityReasoning": "string"`);
      fieldLines.push(`    "characteristicsReasoning": "string"`);
    }

    // Add reasoning and custom style fields for Claude
    if (modelId === 'claude') {
      fieldLines.push(`    "styleReasoning": "string"`);
      fieldLines.push(`    "customStyleGuidance": "string (optional)"`);
    }

    schemaLines.push(`  "${modelId}": {\n${fieldLines.join(',\n')}\n  }`);
  }

  prompt += `\n${schemaLines.join(',\n')}\n}`;

  // Add detailed field descriptions per model
  for (const modelId of selectedModels) {
    const model = AI_MODELS.find(m => m.id === modelId);
    if (!model) continue;

    prompt += `\n\n`;

    if (modelId === 'chatgpt') {
      prompt += `## ChatGPT Fields:
- "nickname": A short name or nickname for the user (string)
- "occupation": Their job title/role (string)
- "knowAboutYou": What ChatGPT should know about the user. MAX 1500 CHARACTERS. Include their role, expertise, interests, communication preferences, and key context. (string)
- "howToRespond": How ChatGPT should respond. MAX 1500 CHARACTERS. Include tone, format preferences, level of detail, and specific behavioral instructions. (string)
- "personality": One of: "Default", "Professional", "Friendly", "Candid", "Quirky", "Efficient", "Nerdy", "Cynical" — pick the best match based on user preferences (string)
- "personalityReasoning": Brief explanation of why this personality was chosen (string)
- "warm": "More", "Default", or "Less" — based on how warm/friendly they want responses (string)
- "enthusiastic": "More", "Default", or "Less" — based on energy level preference (string)
- "headersAndLists": "More", "Default", or "Less" — based on formatting preferences (string)
- "emoji": "More", "Default", or "Less" — based on emoji preferences (string)
- "characteristicsReasoning": Brief explanation of characteristic choices (string)`;
    }

    if (modelId === 'claude') {
      prompt += `## Claude Fields:
- "profilePreferences": A comprehensive text for Claude's Profile Preferences. Include who the user is, what they do, how they want Claude to communicate, their preferences for detail/format, and any standing instructions. Be thorough — this is a single freeform text area. (string)
- "recommendedStyle": One of: "Normal", "Concise", "Explanatory", "Formal" — best match for user (string)
- "styleReasoning": Brief explanation of why this style was chosen (string)
- "customStyleGuidance": If none of the presets perfectly fit, provide specific guidance for creating a custom style in Claude (string, optional)`;
    }

    if (modelId === 'gemini') {
      prompt += `## Gemini Fields:
- "instructions": A comprehensive text for Gemini's "Instructions for Gemini" field. Include standing instructions about communication style, format preferences, tone, and any specific rules to always follow. (string)`;
    }

    if (modelId === 'perplexity') {
      prompt += `## Perplexity Fields:
- "bio": A comprehensive bio for Perplexity's AI Profile. Include role, interests, values, preferred communication style, goals, and format preferences. (string)
- "preferredLanguage": Preferred response language, typically "English" unless user indicates otherwise (string)`;
    }
  }

  prompt += `

Guidelines:
- Make each model's content feel native to that platform's style
- ChatGPT's two textareas (knowAboutYou and howToRespond) must each be UNDER 1500 characters
- Be specific and actionable, not generic
- Use the user's actual words and examples from their answers where possible
- If they provided a writing codex, incorporate their voice preferences
- If they provided a personal constitution, reflect their values and principles
- Don't repeat the same content verbatim across models — tailor for each`;

  return prompt;
}

function buildUserPrompt(data: GenerateRequest): string {
  const { selectedModels, answers, analyzedInsights, writingCodex, personalConstitution } = data;
  const completedInsights = (analyzedInsights || []).filter(i => i.status === 'complete');

  let prompt = `Based on everything I've shared, generate my custom instructions.\n\n`;
  prompt += `Selected models: ${selectedModels.map(id => {
    const model = AI_MODELS.find(m => m.id === id);
    return model ? model.name : id;
  }).join(', ')}\n\n`;

  prompt += `My answers:\n`;
  for (const answer of answers) {
    const insight = completedInsights.find(i => i.questionId === answer.questionId);
    prompt += `Q: ${answer.question}\n`;
    if (insight) {
      prompt += `A: ${insight.insight}\n\n`;
    } else {
      prompt += `A: ${answer.answer}\n\n`;
    }
  }

  if (writingCodex) {
    const truncated = writingCodex.length > 4000
      ? writingCodex.slice(0, 4000) + '\n[... truncated]'
      : writingCodex;
    prompt += `\nMy Writing Codex:\n${truncated}\n`;
  }

  if (personalConstitution) {
    const truncated = personalConstitution.length > 4000
      ? personalConstitution.slice(0, 4000) + '\n[... truncated]'
      : personalConstitution;
    prompt += `\nMy Personal Constitution:\n${truncated}\n`;
  }

  return prompt;
}

export async function POST(request: NextRequest) {
  try {
    const data: GenerateRequest = await request.json();

    // Validate the request
    if (!data.selectedModels || data.selectedModels.length === 0) {
      return NextResponse.json(
        { error: 'No models selected' },
        { status: 400 }
      );
    }

    if (!data.answers || data.answers.length === 0) {
      return NextResponse.json(
        { error: 'No answers provided' },
        { status: 400 }
      );
    }

    const systemPrompt = buildSystemPrompt(data.selectedModels);
    const userPrompt = buildUserPrompt(data);

    // Stream the Anthropic response directly to the client
    const stream = client.messages.stream({
      model: 'claude-sonnet-4-5-20250514',
      max_tokens: 8000,
      messages: [{ role: 'user', content: userPrompt }],
      system: systemPrompt,
    });

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const event of stream) {
            if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
              controller.enqueue(encoder.encode(event.delta.text));
            }
          }
          controller.close();
        } catch (error) {
          console.error('Stream error:', error);
          controller.error(error);
        }
      },
    });

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
        'Transfer-Encoding': 'chunked',
      },
    });
  } catch (error) {
    console.error('Error generating custom instructions:', error);

    if (error instanceof Anthropic.APIError) {
      return NextResponse.json(
        { error: `API Error: ${error.message}` },
        { status: error.status || 500 }
      );
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate custom instructions' },
      { status: 500 }
    );
  }
}
