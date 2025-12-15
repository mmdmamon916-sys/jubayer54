import React, { useState, useRef } from 'react';
import { AppMode, ImageUploadState } from './types';
import { generateImageWithGemini, editImageWithGemini, fileToBase64 } from './services/geminiService';
import { SparklesIcon, PhotoIcon, EditIcon, UploadIcon, XCircleIcon } from './components/Icon';
import { LoadingSpinner } from './components/LoadingSpinner';
import { ImageDisplay } from './components/ImageDisplay';

const App: React.FC = () => {
  const [mode, setMode] = useState<AppMode>(AppMode.GENERATE);
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);
  
  // Edit mode state
  const [uploadState, setUploadState] = useState<ImageUploadState>({
    file: null,
    previewUrl: null,
    base64: null,
    mimeType: null
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleModeChange = (newMode: AppMode) => {
    setMode(newMode);
    setError(null);
    setResultImage(null);
    setPrompt('');
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please upload a valid image file');
      return;
    }

    try {
      const base64 = await fileToBase64(file);
      setUploadState({
        file,
        previewUrl: URL.createObjectURL(file),
        base64,
        mimeType: file.type
      });
      setError(null);
    } catch (err) {
      console.error(err);
      setError('Failed to process image file');
    }
  };

  const clearUpload = () => {
    setUploadState({
      file: null,
      previewUrl: null,
      base64: null,
      mimeType: null
    });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    
    // Validation for Edit mode
    if (mode === AppMode.EDIT && !uploadState.base64) {
      setError("Please upload an image to edit first.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setResultImage(null);

    try {
      let imageUrl = '';
      if (mode === AppMode.GENERATE) {
        imageUrl = await generateImageWithGemini(prompt);
      } else {
        // Edit mode
        if (uploadState.base64 && uploadState.mimeType) {
          imageUrl = await editImageWithGemini(uploadState.base64, uploadState.mimeType, prompt);
        }
      }
      setResultImage(imageUrl);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col items-center">
      
      {/* Header */}
      <header className="w-full max-w-5xl mx-auto p-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg shadow-lg">
            <SparklesIcon className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">
              NanoGen AI
            </h1>
            <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Gemini Flash Image</p>
          </div>
        </div>

        <nav className="bg-gray-800 p-1 rounded-lg flex shadow-inner border border-gray-700">
          <button 
            onClick={() => handleModeChange(AppMode.GENERATE)}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${mode === AppMode.GENERATE ? 'bg-gray-700 text-white shadow-sm' : 'text-gray-400 hover:text-gray-200'}`}
          >
            <PhotoIcon className="w-4 h-4" />
            Generate
          </button>
          <button 
            onClick={() => handleModeChange(AppMode.EDIT)}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${mode === AppMode.EDIT ? 'bg-gray-700 text-white shadow-sm' : 'text-gray-400 hover:text-gray-200'}`}
          >
            <EditIcon className="w-4 h-4" />
            Edit
          </button>
        </nav>
      </header>

      {/* Main Content */}
      <main className="w-full max-w-4xl mx-auto p-4 flex-1 flex flex-col gap-8">
        
        {/* Intro Text */}
        <div className="text-center py-4">
          <h2 className="text-3xl md:text-4xl font-bold mb-3">
            {mode === AppMode.GENERATE ? 'Imagine Anything.' : 'Remix Reality.'}
          </h2>
          <p className="text-gray-400 max-w-lg mx-auto">
            {mode === AppMode.GENERATE 
              ? 'Enter a prompt and let Gemini 2.5 Flash create unique visuals in seconds.' 
              : 'Upload an image and use natural language to add filters, remove objects, or transform styles.'}
          </p>
        </div>

        {/* Input Section */}
        <div className="bg-gray-800 rounded-2xl p-6 shadow-xl border border-gray-700">
          
          {/* File Upload Area for Edit Mode */}
          {mode === AppMode.EDIT && (
            <div className="mb-6">
              {!uploadState.previewUrl ? (
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-600 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-700/50 hover:border-indigo-500 transition-all group h-64"
                >
                  <div className="p-4 bg-gray-700 rounded-full mb-4 group-hover:scale-110 transition-transform">
                    <UploadIcon className="w-8 h-8 text-indigo-400" />
                  </div>
                  <p className="text-lg font-medium text-gray-300">Click to upload an image</p>
                  <p className="text-sm text-gray-500 mt-2">JPEG or PNG supported</p>
                </div>
              ) : (
                <div className="relative rounded-xl overflow-hidden border border-gray-600 bg-black/50 h-64 flex items-center justify-center group">
                  <img src={uploadState.previewUrl} alt="Preview" className="max-h-full max-w-full object-contain" />
                  <div className="absolute top-2 right-2">
                    <button 
                      onClick={clearUpload}
                      className="p-1 bg-gray-900/80 text-gray-400 hover:text-red-400 rounded-full transition-colors backdrop-blur-sm"
                    >
                      <XCircleIcon className="w-6 h-6" />
                    </button>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-2 bg-black/60 text-xs text-center text-gray-300 backdrop-blur-sm">
                    Original Image
                  </div>
                </div>
              )}
              <input 
                type="file" 
                ref={fileInputRef}
                onChange={handleFileChange} 
                accept="image/*" 
                className="hidden" 
              />
            </div>
          )}

          {/* Prompt Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="relative">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={mode === AppMode.GENERATE 
                  ? "Describe the image you want to create... (e.g., 'A cyberpunk city with neon lights in rain')" 
                  : "Describe how to edit the image... (e.g., 'Add a retro VHS filter', 'Turn the cat into a lion')"}
                className="w-full bg-gray-900 border border-gray-600 rounded-xl p-4 text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent min-h-[100px] resize-none"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e);
                  }
                }}
              />
              <div className="absolute bottom-3 right-3 text-xs text-gray-500">
                Press Enter to generate
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-900/30 border border-red-800 rounded-lg text-red-200 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || !prompt.trim() || (mode === AppMode.EDIT && !uploadState.base64)}
              className={`w-full py-3 px-6 rounded-xl font-bold text-white shadow-lg transition-all transform active:scale-[0.98]
                ${isLoading || !prompt.trim() || (mode === AppMode.EDIT && !uploadState.base64)
                  ? 'bg-gray-700 cursor-not-allowed text-gray-400' 
                  : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 hover:shadow-indigo-500/25'
                }`}
            >
              {isLoading ? 'Processing...' : (mode === AppMode.GENERATE ? 'Generate Image' : 'Edit Image')}
            </button>
          </form>
        </div>

        {/* Results Section */}
        {(isLoading || resultImage) && (
          <div className="w-full mb-12 animate-fade-in">
             <div className="flex items-center gap-4 mb-4">
                <div className="h-px flex-1 bg-gray-800"></div>
                <span className="text-gray-500 text-sm font-medium uppercase tracking-wider">Result</span>
                <div className="h-px flex-1 bg-gray-800"></div>
             </div>
             
             {isLoading ? (
               <LoadingSpinner />
             ) : resultImage ? (
               <ImageDisplay imageUrl={resultImage} />
             ) : null}
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="w-full p-6 text-center text-gray-600 text-sm border-t border-gray-800">
        <p>Powered by Google Gemini 2.5 Flash Image</p>
      </footer>

    </div>
  );
};

export default App;
