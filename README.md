# ATS Resume Scorer

An AI-powered resume scoring application built with Next.js that evaluates resumes using OpenRouter API and provides actionable feedback.

[![ATS Resume Scorer Demo](public/ATS-Resume-Scorer.gif)](public/ATS-Resume-Scorer.mp4)

## Features

- 📄 Upload PDF or TXT resumes
- 🤖 AI-powered ATS scoring (0-100)
- 📊 Detailed evaluation across 5 key sections
- 🎯 Choose between OpenRouter (cloud) or Ollama (local) models
- 🎨 Beautiful, responsive UI with Tailwind CSS
- ⚡ Fast processing with Next.js 15

### Evaluation Sections

Each resume is evaluated on five critical areas:

1. **Grammar & Writing Quality** - Grammar, spelling, sentence structure, and professional tone
2. **Formatting & Structure** - Layout, visual hierarchy, section organization, and readability
3. **Keyword Alignment** - Industry-relevant keywords and ATS-friendly terminology
4. **Experience Relevance** - Work experience presentation and quantification
5. **Skills Relevance** - Technical and soft skills presentation

**Note**: If the AI cannot analyze a resume properly, sections will show "N/A" with a neutral status instead of fake scores.

## Getting Started

### Prerequisites

- Node.js 18+ installed
- OpenRouter API key ([Get one here](https://openrouter.ai/)) - for cloud models (entered via UI)
- (Optional) Ollama installed ([Get it here](https://ollama.ai/)) - for local models

### Installation

1. Clone the repository or navigate to the project directory

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

**Note**: No `.env` file needed! The app will prompt for your OpenRouter API key when you select an OpenRouter model.

## Usage

1. **Select AI Provider**: Choose between "OpenRouter Models" (cloud) or "Local Models" (Ollama)
2. **Enter API Key** (if using OpenRouter): Click "Enter API Key" button and provide your key
3. **Select Model**: Choose from available models in the dropdown
4. **Upload Resume**: Click the upload area or drag and drop your resume (PDF or TXT format)
5. **Analyze**: Click "Analyze Resume" button
6. **View Results**: See your overall ATS score and detailed section-by-section analysis:
   - Grammar & Writing Quality
   - Formatting & Structure
   - Keyword Alignment
   - Experience Relevance
   - Skills Relevance

## Technology Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **AI Providers**: 
  - OpenRouter API (Cloud)
  - Ollama (Local)
- **PDF Processing**: pdf-parse-fork

## AI Providers

The app supports two AI providers:

### OpenRouter (Cloud Models)
OpenRouter returns these free models (kept in the order shown below):
1. **Trinity Large Preview** (arcee-ai/trinity-large-preview:free)
2. **Step 3.5 Flash** (stepfun/step-3.5-flash:free)
3. **GLM 4.5 Air** (z-ai/glm-4.5-air:free)
4. **DeepSeek R1 0528** (deepseek/deepseek-r1-0528:free)
5. **Nemotron 3 Nano 30B A3B** (nvidia/nemotron-3-nano-30b-a3b:free)
6. **GPT OSS 120B** (openai/gpt-oss-120b:free)
7. **Llama 3.3 70B Instruct** (meta-llama/llama-3.3-70b-instruct:free)
8. **Dolphin Mistral 24B Venice Edition** (cognitivecomputations/dolphin-mistral-24b-venice-edition:free)

**Security Note**: API key is entered via UI modal and it is not stored *anywhere*.

### Ollama (Local Models)
- Automatically detects all installed Ollama models
- No API key required
- Ollama must be running on `http://localhost:11434`
- Install models with: `ollama pull llama2` (or any model)

The app will automatically fetch available models from both providers and preserve the order supplied by the API, so OpenRouter models stay in the sequence listed above.

## License

MIT
