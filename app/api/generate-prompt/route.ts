import { NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function POST() {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.error('OpenAI API key is not configured');
      return NextResponse.json({ error: 'OpenAI API key is not configured' }, { status: 500 });
    }

    const openai = new OpenAI({ apiKey });

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",  // You can use gpt-3.5-turbo instead of gpt-4 if you don't have access
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant that generates thoughtful journaling prompts. The prompts should encourage self-reflection and personal growth."
        },
        {
          role: "user",
          content: "Generate a journaling prompt for today that encourages deep introspection and flow state."
        }
      ],
      max_tokens: 50,
      temperature: 0.7,
      n: 1,
    });

    const generatedPrompt = completion.choices[0].message.content;
    return NextResponse.json({ prompt: generatedPrompt || "What's on your mind today?" });
  } catch (error) {
    console.error('Error generating prompt:', error);
    return NextResponse.json({ error: 'Failed to generate prompt' }, { status: 500 });
  }
}