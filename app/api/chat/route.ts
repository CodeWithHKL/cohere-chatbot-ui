import { CohereClientV2 } from 'cohere-ai';
import { NextResponse } from 'next/server';

export const maxDuration = 30;

const MAX_HISTORY = 10;

export async function POST(req: Request) {
  // Set MAINTENANCE_MODE=true in Vercel env vars (then redeploy) to disable the API.
  if (process.env.MAINTENANCE_MODE === 'true') {
    return NextResponse.json(
      { reply: "The chatbot is under maintenance. Please check back soon." },
      { status: 503 }
    );
  }

  const apiKey = process.env.COHERE_API_KEY;
  if (!apiKey) {
    console.error('COHERE_API_KEY is not set');
    return NextResponse.json(
      { reply: "The chatbot is not configured correctly. Please try again later." },
      { status: 500 }
    );
  }

  try {
    const body = await req.json().catch(() => null);
    const message = body?.message;

    if (typeof message !== 'string' || !message.trim() || message.length > 400) {
      return NextResponse.json(
        { reply: "Please enter a message of up to 400 characters." },
        { status: 400 }
      );
    }

    // Sanitize client-supplied history: only user/assistant turns, capped in count and length
    const rawHistory: unknown = body?.history;
    const history = (Array.isArray(rawHistory) ? rawHistory : [])
      .filter(
        (m): m is { role: 'user' | 'assistant'; content: string } =>
          !!m &&
          (m.role === 'user' || m.role === 'assistant') &&
          typeof m.content === 'string'
      )
      .slice(-MAX_HISTORY)
      .map(m => ({ role: m.role, content: m.content.slice(0, 1000) }));

    const cohere = new CohereClientV2({ token: apiKey });

    const response = await cohere.chat({
      model: 'command-r7b-12-2024',
      messages: [
        {
          role: 'system',
          content: "You are a chatbot for Universiti Tenaga Nasional (UNITEN), Malaysia; answer only UNITEN-related questions, and if unsure or out of scope, say you don’t know and do not fabricate information. UNITEN is a private universiti owned by TNB Tenaga Nasional Berhad. Keep answers under 150 words, concise and complete; for lists, give at most 5 short items and never leave a sentence or list unfinished."
        },
        ...history,
        { role: 'user', content: message },
      ],
      temperature: 0.7,
      maxTokens: 400, // headroom so replies are not cut mid-sentence; the prompt keeps them short
    });

    // Safer extraction: Find the first content block that is a text type
    const content = response.message.content;
    let botReply = "I couldn't generate a reply. Please try again.";

    if (Array.isArray(content) && content.length > 0) {
      const textBlock = content.find(block => block.type === 'text');
      if (textBlock && 'text' in textBlock) {
        botReply = textBlock.text;
      }
    }

    return NextResponse.json({ reply: botReply });
  } catch (error) {
    console.error('Cohere API Error:', error);
    return NextResponse.json({ reply: "Something went wrong while contacting the AI. Please try again." }, { status: 500 });
  }
}
