# ATS Resume Scorer

An AI-powered resume scoring application built with Next.js that evaluates resumes using OpenRouter API and provides actionable feedback.

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

### API Key Management

- **OpenRouter**: Enter your API key when prompted (stored only in browser memory)
- **Security**: API key is never saved to disk; it is sent to this app's server API route for forwarding to OpenRouter
- **Update**: Click "Update API Key" button in the header to change your key
- **Privacy**: Key is cleared when you close the browser tab

### Model Providers

**OpenRouter (Cloud)**
- Requires API key configuration (entered in UI modal)
- No local installation needed
- Available models:
  - **Gemini 2.0 Flash** - Google's latest fast model
  - **GPT OSS 20B** - Large model with comprehensive analysis
  - **Grok 4.1 Fast** - Fast model from xAI

**Ollama (Local)**
- Requires Ollama to be installed and running
- Models run on your local machine
- All your installed Ollama models will appear automatically
- More privacy, no API costs
- To install Ollama models: `ollama pull <model-name>`

## Technology Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **AI Providers**: 
  - OpenRouter API (Cloud)
  - Ollama (Local)
- **PDF Processing**: pdf-parse-fork

## API Configuration

The app supports two AI providers:

### OpenRouter (Cloud Models)
- Three free models available:
  - **Gemini 2.0 Flash** - Google's latest fast model
  - **GPT OSS 20B** - Large model with comprehensive analysis  
  - **Grok 4.1 Fast** - Fast model from xAI
- API key entered via UI modal (not stored permanently)
- Key stored in browser memory only
- All free tier models

### Ollama (Local Models)
- Automatically detects all installed Ollama models
- No API key required
- Ollama must be running on `http://localhost:11434`
- Install models with: `ollama pull llama2` (or any model)

The app will automatically fetch available models from both providers and display them sorted alphabetically in the UI.

## Security & Privacy

- **No Environment Files**: API keys are not stored in `.env` files
- **Frontend Memory Only**: API key stored in React state (memory only)
- **No Server Storage**: Keys are never saved to disk or database
- **Temporary**: Key cleared when browser tab is closed
- **Server Route Forwarding**: API key is posted to this app's `/api/score` route and forwarded to OpenRouter for the request

## License

MIT
