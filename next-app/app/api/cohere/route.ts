import { NextRequest, NextResponse } from 'next/server';
import { cohere } from '@/lib/cohere/client';

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json();

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    const response = await cohere.generate({
      model: 'command',
      prompt: `Generate a short, descriptive title (maximum 4-5 words) for a shopping conversation that starts with this user message: "${message}"\n\nTitle:`,
      maxTokens: 20,
      temperature: 0.7,
    });

    const title = response.generations[0]?.text?.trim() || null;
    
    return NextResponse.json({ title });
  } catch (error) {
    console.error('Cohere API error:', error);
    return NextResponse.json(
      { error: 'Failed to generate title' },
      { status: 500 }
    );
  }
}