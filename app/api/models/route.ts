import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const models = [];

    // Add OpenRouter models
    models.push({
      id: 'arcee-ai/trinity-large-preview:free',
      name: 'Trinity Large Preview',
      provider: 'openrouter'
    });

    models.push({
      id: 'stepfun/step-3.5-flash:free',
      name: 'Step 3.5 Flash',
      provider: 'openrouter'
    });

    models.push({
      id: 'z-ai/glm-4.5-air:free',
      name: 'GLM 4.5 Air',
      provider: 'openrouter'
    });

    models.push({
      id: 'deepseek/deepseek-r1-0528:free',
      name: 'DeepSeek R1 0528',
      provider: 'openrouter'
    });

    models.push({
      id: 'nvidia/nemotron-3-nano-30b-a3b:free',
      name: 'Nemotron 3 Nano 30B A3B',
      provider: 'openrouter'
    });

    models.push({
      id: 'openai/gpt-oss-120b:free',
      name: 'ChatGPT OSS 120B',
      provider: 'openrouter'
    });

    models.push({
      id: 'meta-llama/llama-3.3-70b-instruct:free',
      name: 'Llama 3.3 70B Instruct',
      provider: 'openrouter'
    });

    models.push({
      id: 'cognitivecomputations/dolphin-mistral-24b-venice-edition:free',
      name: 'Dolphin Mistral 24B Venice Edition',
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
              name: model.name,
              provider: 'ollama'
            });
          });
        }
      }
    } catch (ollamaError) {
      console.log('Ollama not available:', ollamaError);
    }

    return NextResponse.json({ models });
  } catch (error) {
    console.error('Error fetching models:', error);
    return NextResponse.json(
      { 
        models: [
          { id: 'arcee-ai/trinity-large-preview:free', name: 'Trinity Large Preview', provider: 'openrouter' },
          { id: 'stepfun/step-3.5-flash:free', name: 'Step 3.5 Flash', provider: 'openrouter' },
          { id: 'z-ai/glm-4.5-air:free', name: 'GLM 4.5 Air', provider: 'openrouter' },
          { id: 'deepseek/deepseek-r1-0528:free', name: 'DeepSeek R1 0528', provider: 'openrouter' },
          { id: 'nvidia/nemotron-3-nano-30b-a3b:free', name: 'Nemotron 3 Nano 30B A3B', provider: 'openrouter' },
          { id: 'openai/gpt-oss-120b:free', name: 'GPT OSS 120B', provider: 'openrouter' },
          { id: 'meta-llama/llama-3.3-70b-instruct:free', name: 'Llama 3.3 70B Instruct', provider: 'openrouter' },
          { id: 'cognitivecomputations/dolphin-mistral-24b-venice-edition:free', name: 'Dolphin Mistral 24B Venice Edition', provider: 'openrouter' }
        ]
      },
      { status: 200 }
    );
  }
}
