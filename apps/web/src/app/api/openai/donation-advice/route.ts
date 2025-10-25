import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { query } = await request.json();

    if (!query) {
      return NextResponse.json(
        { error: 'Query is required' },
        { status: 400 }
      );
    }

    // Call OpenAI API to get donation advice
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are a fundraising expert specializing in hackathon and tech event fundraising. Provide practical, actionable advice for increasing donations. Focus on strategies that work for tech events, hackathons, and innovation competitions. Keep responses concise (under 150 words) and include specific actionable steps.'
          },
          {
            role: 'user',
            content: query
          }
        ],
        max_tokens: 200,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', response.status, errorText);
      throw new Error(`OpenAI API failed: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const advice = data.choices[0]?.message?.content || 'Sorry, I could not provide donation advice at this time.';
    
    console.log(`💡 OpenAI Donation Advice Query: "${query}" -> "${advice}"`);
    
    return NextResponse.json({ 
      answer: advice,
      query: query 
    });

  } catch (error) {
    console.error('Error with OpenAI donation advice query:', error);
    return NextResponse.json(
      { error: 'Failed to get donation advice' },
      { status: 500 }
    );
  }
}