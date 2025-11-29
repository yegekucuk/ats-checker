'use client';

import { useState, useEffect } from 'react';

interface Result {
  score: number | null;
  sections: {
    grammarWriting: { score: number | null; feedback: string };
    formatting: { score: number | null; feedback: string };
    keywordAlignment: { score: number | null; feedback: string };
    experienceRelevance: { score: number | null; feedback: string };
    skillsRelevance: { score: number | null; feedback: string };
  };
}

interface Model {
  id: string;
  name: string;
  provider: 'openrouter' | 'ollama';
}

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState<string>('');
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [models, setModels] = useState<Model[]>([]);
  const [modelsLoading, setModelsLoading] = useState(true);
  const [apiKey, setApiKey] = useState<string>('');
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [tempApiKey, setTempApiKey] = useState<string>('');
  const [selectedProvider, setSelectedProvider] = useState<'openrouter' | 'ollama'>('openrouter');

  useEffect(() => {
    fetchModels();
  }, []);

  const fetchModels = async () => {
    try {
      const response = await fetch('/api/models');
      const data = await response.json();
      
      if (data.models) {
        const sortedModels = data.models.sort((a: Model, b: Model) => 
          a.name.localeCompare(b.name)
        );
        setModels(sortedModels);
        
        // Set default model based on selected provider
        const providerModels = sortedModels.filter((m: Model) => m.provider === selectedProvider);
        if (providerModels.length > 0) {
          setSelectedModel(providerModels[0].id);
        }
      }
    } catch (err) {
      console.error('Failed to fetch models:', err);
      setModels([
        { id: 'openai/gpt-oss-20b:free', name: 'GPT OSS 20B (OpenRouter)', provider: 'openrouter' },
        { id: 'google/gemini-2.0-flash-exp:free', name: 'Gemini 2.0 Flash (OpenRouter)', provider: 'openrouter' },
        { id: 'x-ai/grok-4.1-fast:free', name: 'Grok 4.1 Fast (OpenRouter)', provider: 'openrouter' }
      ]);
      setSelectedModel('openai/gpt-oss-20b:free');
    } finally {
      setModelsLoading(false);
    }
  };

  // Update selected model when provider changes
  useEffect(() => {
    const providerModels = models.filter(m => m.provider === selectedProvider);
    if (providerModels.length > 0 && !providerModels.find(m => m.id === selectedModel)) {
      setSelectedModel(providerModels[0].id);
    }
  }, [selectedProvider, models]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError('');
      setResult(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file) {
      setError('Please select a file');
      return;
    }

    // Check if OpenRouter model is selected and API key is missing
    const selectedModelData = models.find(m => m.id === selectedModel);
    if (selectedModelData?.provider === 'openrouter' && !apiKey) {
      setShowApiKeyModal(true);
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('model', selectedModel);
      formData.append('provider', selectedModelData?.provider || 'openrouter');
      
      if (selectedModelData?.provider === 'openrouter') {
        formData.append('apiKey', apiKey);
      }

      const response = await fetch('/api/score', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to analyze resume');
      }

      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number | null) => {
    if (score === null || score === 0) return 'text-gray-500';
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreRing = (score: number | null) => {
    if (score === null || score === 0) return 'stroke-gray-400';
    if (score >= 80) return 'stroke-green-600';
    if (score >= 60) return 'stroke-yellow-600';
    return 'stroke-red-600';
  };

  const getScoreDisplay = (score: number | null) => {
    if (score === null || score === 0) return 'N/A';
    return score.toString();
  };

  const handleSaveApiKey = () => {
    if (tempApiKey.trim()) {
      setApiKey(tempApiKey.trim());
      setShowApiKeyModal(false);
      setTempApiKey('');
    }
  };

  const handleCloseModal = () => {
    setShowApiKeyModal(false);
    setTempApiKey('');
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      {/* API Key Modal */}
      {showApiKeyModal && (
        <div className="fixed inset-0 bg-black/80 bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              OpenRouter API Key Required
            </h2>
            <p className="text-gray-600 mb-6">
              This model requires an OpenRouter API key. Your key will only be stored in memory and never saved permanently.
            </p>
            <div className="mb-6">
              <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700 mb-2">
                API Key
              </label>
              <input
                type="password"
                id="apiKey"
                value={tempApiKey}
                onChange={(e) => setTempApiKey(e.target.value)}
                placeholder="sk-or-v1-..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleSaveApiKey();
                  }
                }}
              />
              <p className="mt-2 text-xs text-gray-500">
                Get your API key from{' '}
                <a 
                  href="https://openrouter.ai/keys" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-indigo-600 hover:text-indigo-700 underline"
                >
                  openrouter.ai/keys
                </a>
              </p>
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleCloseModal}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveApiKey}
                disabled={!tempApiKey.trim()}
                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                Save & Continue
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            ATS Resume Scorer
          </h1>
          <p className="text-lg text-gray-600">
            Upload your resume and get an AI-powered ATS score with personalized feedback
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Provider Toggle */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                AI Provider
              </label>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setSelectedProvider('openrouter')}
                  className={`cursor-pointer flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
                    selectedProvider === 'openrouter'
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  OpenRouter Models
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedProvider('ollama')}
                  className={`cursor-pointer flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
                    selectedProvider === 'ollama'
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Local Models
                </button>
              </div>
            </div>

            {/* API Key Status and Button - Only for OpenRouter */}
            {selectedProvider === 'openrouter' && (
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setShowApiKeyModal(true)}
                    className="cursor-pointer px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
                  >
                    {apiKey ? 'Update API Key' : 'Enter API Key'}
                  </button>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-700">
                      OpenRouter API Key:
                    </span>
                    <span className={`text-sm font-semibold ${apiKey ? 'text-green-600' : 'text-red-600'}`}>
                      {apiKey ? 'Provided' : 'Not Provided'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select AI Model
              </label>
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors"
                disabled={modelsLoading}
              >
                {modelsLoading ? (
                  <option>Loading models...</option>
                ) : models.filter(m => m.provider === selectedProvider).length === 0 ? (
                  <option>No {selectedProvider === 'ollama' ? 'Ollama' : 'OpenRouter'} models available</option>
                ) : (
                  models
                    .filter(m => m.provider === selectedProvider)
                    .map((model) => (
                      <option key={model.id} value={model.id}>
                        {model.name}
                      </option>
                    ))
                )}
              </select>
              <p className="mt-1 text-xs text-gray-500">
                {selectedProvider === 'openrouter' 
                  ? 'Cloud-based AI models from OpenRouter'
                  : 'Local AI models running on your machine via Ollama'
                }
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Resume (PDF or TXT)
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-indigo-500 transition-colors">
                <div className="space-y-1 text-center">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    stroke="currentColor"
                    fill="none"
                    viewBox="0 0 48 48"
                    aria-hidden="true"
                  >
                    <path
                      d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <div className="flex text-sm text-gray-600">
                    <label
                      htmlFor="file-upload"
                      className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none"
                    >
                      <span>Upload a file</span>
                      <input
                        id="file-upload"
                        name="file-upload"
                        type="file"
                        className="sr-only"
                        accept=".pdf,.txt"
                        onChange={handleFileChange}
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">PDF or TXT up to 10MB</p>
                </div>
              </div>
              {file && (
                <p className="mt-2 text-sm text-gray-600">
                  Selected: <span className="font-medium">{file.name}</span>
                </p>
              )}
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !file}
              className="cursor-pointer w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Analyzing...' : 'Analyze Resume'}
            </button>
          </form>
        </div>

        {result && (
          <div className="bg-white rounded-2xl shadow-xl p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-center mb-8">
              <div className="relative">
                <svg className="transform -rotate-90 w-32 h-32">
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    className="text-gray-200"
                  />
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 56}`}
                    strokeDashoffset={result.score ? `${2 * Math.PI * 56 * (1 - result.score / 100)}` : `${2 * Math.PI * 56}`}
                    className={getScoreRing(result.score)}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className={`text-4xl font-bold ${getScoreColor(result.score)}`}>
                    {getScoreDisplay(result.score)}
                  </span>
                </div>
              </div>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              Your ATS Score
            </h2>

            <div className="space-y-6">
              {/* Grammar & Writing Quality */}
              <div className="border-l-4 border-indigo-500 pl-4 py-2">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">Grammar & Writing Quality</h3>
                  <span className={`text-xl font-bold ${getScoreColor(result.sections.grammarWriting.score)}`}>
                    {getScoreDisplay(result.sections.grammarWriting.score)}
                  </span>
                </div>
                <p className="text-gray-700">{result.sections.grammarWriting.feedback}</p>
              </div>

              {/* Formatting & Structure */}
              <div className="border-l-4 border-purple-500 pl-4 py-2">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">Formatting & Structure</h3>
                  <span className={`text-xl font-bold ${getScoreColor(result.sections.formatting.score)}`}>
                    {getScoreDisplay(result.sections.formatting.score)}
                  </span>
                </div>
                <p className="text-gray-700">{result.sections.formatting.feedback}</p>
              </div>

              {/* Keyword Alignment */}
              <div className="border-l-4 border-blue-500 pl-4 py-2">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">Keyword Alignment</h3>
                  <span className={`text-xl font-bold ${getScoreColor(result.sections.keywordAlignment.score)}`}>
                    {getScoreDisplay(result.sections.keywordAlignment.score)}
                  </span>
                </div>
                <p className="text-gray-700">{result.sections.keywordAlignment.feedback}</p>
              </div>

              {/* Experience Relevance */}
              <div className="border-l-4 border-green-500 pl-4 py-2">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">Experience Relevance</h3>
                  <span className={`text-xl font-bold ${getScoreColor(result.sections.experienceRelevance.score)}`}>
                    {getScoreDisplay(result.sections.experienceRelevance.score)}
                  </span>
                </div>
                <p className="text-gray-700">{result.sections.experienceRelevance.feedback}</p>
              </div>

              {/* Skills Relevance */}
              <div className="border-l-4 border-yellow-500 pl-4 py-2">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">Skills Relevance</h3>
                  <span className={`text-xl font-bold ${getScoreColor(result.sections.skillsRelevance.score)}`}>
                    {getScoreDisplay(result.sections.skillsRelevance.score)}
                  </span>
                </div>
                <p className="text-gray-700">{result.sections.skillsRelevance.feedback}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
