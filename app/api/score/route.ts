import { NextRequest, NextResponse } from 'next/server';
import pdfParse from 'pdf-parse-fork';

function normalizeOpenRouterApiKey(rawApiKey: string): string {
  return rawApiKey.trim().replace(/^Bearer\s+/i, '');
}

function isLikelyOpenRouterApiKey(apiKey: string): boolean {
  return /^sk-or-v1-[A-Za-z0-9._-]+$/.test(apiKey);
}

function isValidAbsoluteHttpUrl(value: string): boolean {
  try {
    const parsed = new URL(value);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const model = formData.get('model') as string || 'openai/gpt-oss-20b:free';
    const provider = formData.get('provider') as string || 'openrouter';
    const rawApiKey = typeof formData.get('apiKey') === 'string' ? formData.get('apiKey') as string : '';

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    let resumeText = '';
    
    if (file.type === 'application/pdf') {
      const data = await pdfParse(buffer);
      resumeText = data.text;
    } else if (file.type === 'text/plain') {
      resumeText = buffer.toString('utf-8');
    } else {
      return NextResponse.json(
        { error: 'Unsupported file type. Please upload PDF or TXT file.' },
        { status: 400 }
      );
    }

    if (!resumeText.trim()) {
      return NextResponse.json(
        { error: 'Could not extract text from the file' },
        { status: 400 }
      );
    }

    // Get current date in dd/mm/yy format
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = String(now.getFullYear()).slice(-2);
    const currentDate = `${day}/${month}/${year}`;

    let aiResponse;

    if (provider === 'ollama') {
      // Use Ollama API
      const response = await fetch('http://localhost:11434/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
        },
        body: JSON.stringify({
          model: model,
          prompt: `Current date: ${currentDate}

You are an expert ATS (Applicant Tracking System) evaluator. Analyze the following resume and provide a comprehensive evaluation.

Evaluate the resume on these 5 sections and provide:
1. An overall ATS score (0-100)
2. Individual scores and feedback for each section:
   - Grammar & Writing Quality (0-100): Evaluate grammar, spelling, sentence structure, and professional tone
   - Formatting & Structure (0-100): Assess layout, visual hierarchy, section organization, and readability
   - Keyword Alignment (0-100): Check for industry-relevant keywords and ATS-friendly terminology
   - Experience Relevance (0-100): Evaluate how well work experience is presented and quantified
   - Skills Relevance (0-100): Assess technical and soft skills presentation and relevance

Return your response in JSON format with this exact structure:
{
  "score": <overall_score>,
  "sections": {
    "grammarWriting": {"score": <score>, "feedback": "<detailed feedback>"},
    "formatting": {"score": <score>, "feedback": "<detailed feedback>"},
    "keywordAlignment": {"score": <score>, "feedback": "<detailed feedback>"},
    "experienceRelevance": {"score": <score>, "feedback": "<detailed feedback>"},
    "skillsRelevance": {"score": <score>, "feedback": "<detailed feedback>"}
  }
}

Resume:
${resumeText}`,
          stream: false,
          format: 'json',
          options: {
            temperature: 0
          }
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Ollama API error:', errorText);
        return NextResponse.json(
          { error: 'Failed to analyze resume with Ollama' },
          { status: 500 }
        );
      }

      aiResponse = await response.json();
      const content = aiResponse.response;

      let result;
      try {
        result = JSON.parse(content);
        
        // Validate structure
        if (!result.sections || !result.score) {
          throw new Error('Invalid response structure');
        }
      } catch {
        // Return null scores to indicate analysis failure
        result = {
          score: null,
          sections: {
            grammarWriting: { score: null, feedback: 'Could not analyze this section. Please try again or use a different AI model.' },
            formatting: { score: null, feedback: 'Could not analyze this section. Please try again or use a different AI model.' },
            keywordAlignment: { score: null, feedback: 'Could not analyze this section. Please try again or use a different AI model.' },
            experienceRelevance: { score: null, feedback: 'Could not analyze this section. Please try again or use a different AI model.' },
            skillsRelevance: { score: null, feedback: 'Could not analyze this section. Please try again or use a different AI model.' }
          }
        };
      }

      return NextResponse.json(result);

    } else {
      // Use OpenRouter API
      const apiKey = normalizeOpenRouterApiKey(rawApiKey);

      if (!apiKey) {
        return NextResponse.json(
          { error: 'OpenRouter API key is required' },
          { status: 400 }
        );
      }

      if (!isLikelyOpenRouterApiKey(apiKey)) {
        return NextResponse.json(
          { error: 'Invalid OpenRouter API key format. It should start with "sk-or-v1-".' },
          { status: 400 }
        );
      }

      const headers: Record<string, string> = {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json; charset=utf-8',
        'X-Title': 'ATS Resume Scorer'
      };

      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
      if (siteUrl && isValidAbsoluteHttpUrl(siteUrl)) {
        headers['HTTP-Referer'] = siteUrl;
      }

      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          model: model,
          messages: [
            {
              role: 'system',
              content: `Current date: ${currentDate}

You are an expert ATS (Applicant Tracking System) evaluator. Analyze resumes and provide comprehensive structured feedback in JSON format.`
            },
            {
              role: 'user',
              content: `Analyze this resume and provide a comprehensive evaluation.

Evaluate the resume on these 5 sections:
1. Grammar & Writing Quality (0-100): Evaluate grammar, spelling, sentence structure, and professional tone
2. Formatting & Structure (0-100): Assess layout, visual hierarchy, section organization, and readability
3. Keyword Alignment (0-100): Check for industry-relevant keywords and ATS-friendly terminology
4. Experience Relevance (0-100): Evaluate how well work experience is presented and quantified
5. Skills Relevance (0-100): Assess technical and soft skills presentation and relevance

Return your response in JSON format with this exact structure:
{
  "score": <overall_score_0_to_100>,
  "sections": {
    "grammarWriting": {"score": <score>, "feedback": "<detailed feedback>"},
    "formatting": {"score": <score>, "feedback": "<detailed feedback>"},
    "keywordAlignment": {"score": <score>, "feedback": "<detailed feedback>"},
    "experienceRelevance": {"score": <score>, "feedback": "<detailed feedback>"},
    "skillsRelevance": {"score": <score>, "feedback": "<detailed feedback>"}
  }
}

Resume:
${resumeText}`
            }
          ],
          temperature: 0,
          max_tokens: 2000
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('OpenRouter API error:', errorText);

        let errorMessage = 'Failed to analyze resume with AI';
        let statusCode = 500;

        try {
          const parsedError = JSON.parse(errorText);
          const upstreamMessage = parsedError?.error?.message;
          const combinedMessage = `${upstreamMessage || ''} ${errorText}`.toLowerCase();

          if (
            response.status === 401 ||
            response.status === 403 ||
            /clerk|auth|authenticate|invalid\s*api\s*key|unauthoriz/.test(combinedMessage)
          ) {
            errorMessage = 'OpenRouter authentication failed. Please verify your API key.';
            statusCode = 401;
          }
        } catch {
          const lowerText = errorText.toLowerCase();
          if (/clerk|auth|authenticate|invalid\s*api\s*key|unauthoriz/.test(lowerText)) {
            errorMessage = 'OpenRouter authentication failed. Please verify your API key.';
            statusCode = 401;
          }
        }

        return NextResponse.json(
          { error: errorMessage },
          { status: statusCode }
        );
      }

      const aiResponse = await response.json();
      const content = aiResponse.choices[0]?.message?.content;

      if (!content) {
        return NextResponse.json(
          { error: 'No response from AI' },
          { status: 500 }
        );
      }

      let result;
      try {
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          result = JSON.parse(jsonMatch[0]);
        } else {
          result = JSON.parse(content);
        }
        
        // Validate structure
        if (!result.sections || !result.score) {
          throw new Error('Invalid response structure');
        }
      } catch {
        // Return null scores to indicate analysis failure
        result = {
          score: null,
          sections: {
            grammarWriting: { score: null, feedback: 'Could not analyze this section. Please try again or use a different AI model.' },
            formatting: { score: null, feedback: 'Could not analyze this section. Please try again or use a different AI model.' },
            keywordAlignment: { score: null, feedback: 'Could not analyze this section. Please try again or use a different AI model.' },
            experienceRelevance: { score: null, feedback: 'Could not analyze this section. Please try again or use a different AI model.' },
            skillsRelevance: { score: null, feedback: 'Could not analyze this section. Please try again or use a different AI model.' }
          }
        };
      }

      return NextResponse.json(result);
    }

  } catch (error) {
    console.error('Error processing resume:', error);
    return NextResponse.json(
      { error: 'Failed to process resume' },
      { status: 500 }
    );
  }
}
