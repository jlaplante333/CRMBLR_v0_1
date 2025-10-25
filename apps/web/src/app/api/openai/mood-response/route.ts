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

    // Check for sensitive content and provide appropriate empathetic response
    const sensitiveKeywords = ['hurt myself', 'hurt myself', 'suicide', 'kill myself', 'end it all', 'not worth it'];
    const isSensitive = sensitiveKeywords.some(keyword => query.toLowerCase().includes(keyword));
    
    if (isSensitive) {
      const empatheticResponse = "I'm really sorry you're feeling this way. You are valued and important, and there are people who care about you. Please know that you don't have to go through this alone. Is there someone you trust that you could talk to? I'm here to listen and support you.";
      
      console.log(`💝 Sensitive Mood Response: "${query}" -> "${empatheticResponse}"`);
      
      return NextResponse.json({ 
        answer: empatheticResponse,
        query: query 
      });
    }

    // Check for common mood keywords and provide empathetic responses
    const moodKeywords = {
      'sad': "I'm really sorry you're feeling this way. It's okay to feel sad sometimes. Can you tell me more about what's been going on? I'm here to listen and support you.",
      'angry': "I understand you're feeling angry, and that's completely valid. Sometimes it helps to talk about what's bothering you. What's been on your mind?",
      'frustrated': "I'm sorry you're feeling frustrated. That can be really tough to deal with. Is there something specific that's been bothering you? I'm here to listen.",
      'overwhelmed': "I'm sorry you're feeling overwhelmed. That can be really difficult. Take a deep breath - you're doing your best. What's been weighing on you?",
      'stressed': "I'm sorry you're feeling stressed. That can be really draining. Is there anything specific that's been causing you stress? I'm here to support you.",
      'anxious': "I'm sorry you're feeling anxious. That can be really uncomfortable. Take a moment to breathe. What's been making you feel this way?",
      'lonely': "I'm sorry you're feeling lonely. That can be really hard. You're not alone in this - I'm here to listen and support you. What's been on your mind?",
      'happy': "That's wonderful to hear! I'm so glad you're feeling happy. What's been making you feel this way? I'd love to share in your joy!",
      'excited': "That's fantastic! I'm excited for you! What's got you feeling this way? I'd love to hear about it!",
      'grateful': "That's beautiful! Gratitude is such a wonderful feeling. What are you grateful for? I'd love to hear about it!"
    };

    // Check if the query contains any mood keywords
    const detectedMood = Object.keys(moodKeywords).find(mood => 
      query.toLowerCase().includes(mood) || 
      query.toLowerCase().includes(`feeling ${mood}`) ||
      query.toLowerCase().includes(`i'm ${mood}`) ||
      query.toLowerCase().includes(`i am ${mood}`)
    );

    if (detectedMood) {
      const empatheticResponse = moodKeywords[detectedMood as keyof typeof moodKeywords];
      
      console.log(`💝 Mood Response (${detectedMood}): "${query}" -> "${empatheticResponse}"`);
      
      return NextResponse.json({ 
        answer: empatheticResponse,
        query: query 
      });
    }

    // Call OpenAI API to provide empathetic mood responses
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
            content: 'You are a warm, caring AI friend created at the Tokyo Voice AI Hackathon. When someone shares their feelings, respond with genuine empathy and understanding. Acknowledge their emotions, offer gentle comfort, and ask how you can help. Be supportive and encouraging. Keep responses conversational, warm, and under 150 words. Focus on being a supportive friend who listens and cares. Always respond with empathy and understanding, never suggest professional help unless specifically asked.'
          },
          {
            role: 'user',
            content: query
          }
        ],
        max_tokens: 200,
        temperature: 0.8,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', response.status, errorText);
      throw new Error(`OpenAI API failed: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const answer = data.choices[0]?.message?.content || 'I\'m here to listen and support you. How can I help you feel better?';
    
    console.log(`💝 OpenAI Mood Response: "${query}" -> "${answer}"`);
    
    return NextResponse.json({ 
      answer: answer,
      query: query 
    });

  } catch (error) {
    console.error('Error with OpenAI mood response query:', error);
    return NextResponse.json(
      { error: 'Failed to provide mood response' },
      { status: 500 }
    );
  }
}
