import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

export async function POST(request: NextRequest) {
  try {
    const { question, answer } = await request.json();

    if (!question || !answer) {
      return NextResponse.json({ error: 'Missing question or answer' }, { status: 400 });
    }

    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1000,
      messages: [{
        role: 'user',
        content: `You are analyzing a user's answer to a question about their AI usage preferences and communication style. Extract the key insights about: their personality traits, communication preferences, format preferences, tone preferences, and any specific requirements for AI interactions. Be concise — 3-5 sentences max.

Question: ${question}

Response: ${answer}

Provide the analysis. Respond with ONLY the analysis.`
      }]
    });

    const insight = response.content[0].type === 'text' ? response.content[0].text : '';

    return NextResponse.json({ success: true, insight });
  } catch (error) {
    console.error('Answer analysis error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Analysis failed' },
      { status: 500 }
    );
  }
}
