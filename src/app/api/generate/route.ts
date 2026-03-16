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
  storyBank: string | null;
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
- "knowAboutYou": For "More about you" field. MAX 1500 CHARACTERS. Include their role, expertise, interests, communication preferences, and key context about who they are. (string)
- "personality": One of: "Default" (Preset style and tone), "Professional" (Polished and precise), "Friendly" (Warm and chatty), "Candid" (Direct and encouraging), "Quirky" (Playful and imaginative), "Efficient" (Concise and plain), "Nerdy" (Exploratory and enthusiastic), "Cynical" (Critical and sarcastic) — pick the best match for "Base style and tone" (string)
- "personalityReasoning": Brief explanation of why this style was chosen (string)
- "warm": "More", "Default", or "Less" — based on how warm/friendly they want responses (string)
- "enthusiastic": "More", "Default", or "Less" — based on energy level preference (string)
- "headersAndLists": "More", "Default", or "Less" — based on formatting preferences (string)
- "emoji": "More", "Default", or "Less" — based on emoji preferences (string)
- "characteristicsReasoning": Brief explanation of characteristic choices (string)
- "customInstructions": For "Custom instructions" field. MAX 1500 CHARACTERS. Include tone, format preferences, level of detail, behavioral instructions, and how ChatGPT should respond. (string)`;
    }

    if (modelId === 'claude') {
      prompt += `## Claude Fields:
- "fullName": The user's full name (string)
- "callYou": What Claude should call them — typically their first name or nickname (string)
- "workDescription": One of: "Product management", "Engineering", "Human resources", "Finance", "Marketing", "Sales", "Operations", "Data science", "Design", "Legal", "Other" — best match for their work (string)
- "personalPreferences": Comprehensive text for "What personal preferences should Claude consider in responses?" Include who they are, what they do, how they want Claude to communicate, preferences for detail/format, standing instructions, tone by context, and behavioral rules. Be thorough. (string)
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
- "occupation": Their job title/role for the "Your occupation" field (string)
- "customInstructions": For the "Custom instructions" field. Include preferences, interests, communication style, and how Perplexity should respond. (string)
- "responseLength": "More", "Default", or "Less" — how long responses should be (string)
- "headersAndLists": "Lists", "Default", or "Paragraphs" — Lists = prefer bulleted lists, Default = mix of paragraphs and lists, Paragraphs = prefer paragraph format (string)`;
    }
  }

  prompt += `

Guidelines:
- Make each model's content feel native to that platform's style
- ChatGPT's two textareas (knowAboutYou and customInstructions) must each be UNDER 1500 characters
- Be specific and actionable, not generic
- Use the user's actual words and examples from their answers where possible
- If they provided a writing codex, incorporate their voice preferences
- If they provided a personal constitution, reflect their values and principles
- If they provided a story bank, weave in their personal narratives and experiences to make instructions feel grounded in lived experience
- Don't repeat the same content verbatim across models — tailor for each

CRITICAL — OUTPUT QUALITY:
The generated custom instructions must be structured around INTERACTION BEHAVIORS, not just surface preferences. Each instruction should be a clear, named directive the user can scan and understand.

For textarea fields (Claude's personalPreferences, ChatGPT's customInstructions, Gemini's instructions, Perplexity's customInstructions), structure the output as behavioral rules with clear labels. Example format:

"One Step at a Time:
Guide me through complex ideas or workflows in sequential order. Handle one decision or deliverable before suggesting the next.

Ask Before You Assume:
If anything is unclear, ask a precise clarifying question before drafting. Don't guess or fill in blanks.

Balance Insight with Action:
Pair every piece of strategy or creativity with a concrete next step or option. Help me move forward, not just think."

Each behavioral rule should:
- Have a short, memorable label (2-5 words)
- Include 1-2 sentences explaining the behavior
- Be derived from what the user actually said in their answers
- Cover interaction style, tone preferences, format expectations, and pet peeves

Do NOT generate generic instructions like "Be helpful and clear." Every instruction should feel personal and specific to THIS user.

If the user wants AI to challenge them, include explicit instructions about pushback, honesty, and flagging weak thinking.
If the user wants questions one at a time, include that as a behavioral rule.
If the user has contextual tone shifts, map those out explicitly.`;

  return prompt;
}

function buildUserPrompt(data: GenerateRequest): string {
  const { selectedModels, answers, analyzedInsights, writingCodex, personalConstitution, storyBank } = data;
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

  if (storyBank) {
    const truncated = storyBank.length > 4000
      ? storyBank.slice(0, 4000) + '\n[... truncated]'
      : storyBank;
    prompt += `\nMy Story Bank:\n${truncated}\n`;
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
      model: 'claude-opus-4-6',
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
