import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const models = [];

    // Add OpenRouter models
    models.push({
      id: 'openai/gpt-oss-20b:free',
      name: 'GPT OSS 20B (OpenRouter)',
      provider: 'openrouter'
    });
    
    models.push({
      id: 'google/gemini-2.0-flash-exp:free',
      name: 'Gemini 2.0 Flash (OpenRouter)',
      provider: 'openrouter'
    });
    
    models.push({
      id: 'x-ai/grok-4.1-fast:free',
      name: 'Grok 4.1 Fast (OpenRouter)',
      provider: 'openrouter'
    });

    // Fetch Ollama models
    try {
      const ollamaResponse = await fetch('http://localhost:11434/api/tags', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (ollamaResponse.ok) {
        const ollamaData = await ollamaResponse.json();
        
        if (ollamaData.models && Array.isArray(ollamaData.models)) {
          ollamaData.models.forEach((model: any) => {
            models.push({
              id: model.name,
              name: `${model.name} (Ollama)`,
              provider: 'ollama'
            });
          });
        }
      }
    } catch (ollamaError) {
      console.log('Ollama not available:', ollamaError);
    }

    // Sort models by name
    models.sort((a, b) => a.name.localeCompare(b.name));

    return NextResponse.json({ models });
  } catch (error) {
    console.error('Error fetching models:', error);
    return NextResponse.json(
      { 
        models: [
          { id: 'openai/gpt-oss-20b:free', name: 'GPT OSS 20B (OpenRouter)', provider: 'openrouter' },
          { id: 'google/gemini-2.0-flash-exp:free', name: 'Gemini 2.0 Flash (OpenRouter)', provider: 'openrouter' },
          { id: 'x-ai/grok-4.1-fast:free', name: 'Grok 4.1 Fast (OpenRouter)', provider: 'openrouter' }
        ]
      },
      { status: 200 }
    );
  }
}
