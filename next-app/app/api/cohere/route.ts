import { NextRequest, NextResponse } from 'next/server';
import { cohere } from '@/lib/cohere/client';

export async function POST(request: NextRequest) {
  try {
    const { message, product, type } = await request.json();

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    let prompt = '';
    let maxTokens = 20;

    if (type === 'description' && product) {
      // Generate product description
      prompt = `Write a compelling, informative description for this product in 2-3 sentences. Focus on key benefits, use cases, and what makes it appealing to potential buyers.

Product: ${product.product_name}
Price: ${product.price_str}
Category: ${product.category}
Site: ${product.site_name}
Rating: ${product.rating}/5
Original Description: ${product.description}

Write an engaging description:`;
      maxTokens = 100;
    } else {
      // Generate chat title (original functionality)
      prompt = `Generate a short, descriptive title (maximum 4-5 words) for a shopping conversation that starts with this user message: "${message}"\n\nTitle:`;
      maxTokens = 20;
    }

    const response = await cohere.generate({
      model: 'command',
      prompt,
      maxTokens,
      temperature: 0.7,
    });

    const result = response.generations[0]?.text?.trim() || null;
    
    if (type === 'description') {
      return NextResponse.json({ description: result });
    } else {
      return NextResponse.json({ title: result });
    }
  } catch (error) {
    console.error('Cohere API error:', error);
    return NextResponse.json(
      { error: 'Failed to generate content' },
      { status: 500 }
    );
  }
}