import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI(process.env.OPENAI_API_KEY ? undefined : {
  apiKey: 'YOUR_FALLBACK_API_KEY', // Replace with a fallback key or remove this line
});

export async function POST() {
  try {
    if (!openai.apiKey) {
      throw new Error('OpenAI API key is not configured');
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
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