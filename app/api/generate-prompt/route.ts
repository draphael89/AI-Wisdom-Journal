import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Use server-side environment variable
});

export async function POST() {
  try {
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
    return NextResponse.json({ prompt: "Reflect on a recent experience that challenged you. What did you learn from it?" }, { status: 500 });
  }
}