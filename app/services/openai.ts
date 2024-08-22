// Smart logging function for development
const log = (message: string, data?: any) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[OpenAI Service] ${message}`, data || '');
    }
  };
  
  // Retry mechanism for API calls
  async function retryWithExponentialBackoff<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    baseDelay: number = 1000
  ): Promise<T> {
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await operation();
      } catch (error) {
        if (i === maxRetries - 1) throw error;
        const delay = baseDelay * Math.pow(2, i);
        log(`Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    throw new Error('Max retries reached');
  }
  
  // Function to generate a single prompt
  export async function generatePrompt(): Promise<string> {
    try {
      const response = await fetch('/api/generate-prompt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      return data.prompt || "What's on your mind today?";
    } catch (error) {
      console.error('Error generating prompt:', error);
      // Fallback to a default prompt if there's an error
      return "Reflect on a recent experience that challenged you. What did you learn from it?";
    }
  }
  
  // Function to generate multiple prompts (for future use)
  export async function generateMultiplePrompts(count: number = 5): Promise<string[]> {
    return retryWithExponentialBackoff(async () => {
      try {
        const response = await fetch('/api/generate-multiple-prompts', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ count }),
        });
        const data = await response.json();
        const generatedPrompts = data.prompts || [];
        log(`Generated ${generatedPrompts.length} prompts`);
        return generatedPrompts.length > 0 ? generatedPrompts : ["What's on your mind today?"];
      } catch (error) {
        console.error('Error generating multiple prompts:', error);
        return ["What's on your mind today?"];
      }
    });
  }