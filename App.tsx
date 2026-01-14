
import React, { useState, useEffect, useCallback } from 'react';
import { wasteClassifier } from './services/wasteClassifier';
import { ClassificationResult, WasteCategory } from './types';
import Dropzone from './components/Dropzone';

const App: React.FC = () => {
  const [modelReady, setModelReady] = useState(false);
  const [loadingError, setLoadingError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<ClassificationResult | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    const initModel = async () => {
      try {
        await wasteClassifier.loadModel();
        setModelReady(true);
      } catch (err) {
        setLoadingError("AI System Offline. Check your connection to load the neural network.");
      }
    };
    initModel();
  }, []);

  const handleFileSelect = useCallback(async (file: File) => {
    if (!modelReady) return;
    setResult(null);
    setPreviewUrl(null);
    setIsProcessing(true);

    const url = URL.createObjectURL(file);
    setPreviewUrl(url);

    try {
      const classification = await wasteClassifier.classify(file);
      setResult(classification);
    } catch (err) {
      console.error(err);
      setLoadingError("Analysis failed. Try another angle or lighting.");
    } finally {
      setIsProcessing(false);
    }
  }, [modelReady]);

  const getCategoryStyles = (category: WasteCategory) => {
    switch (category) {
      case WasteCategory.ORGANIC: return { bg: 'bg-green-500', text: 'text-green-600', light: 'bg-green-50', border: 'border-green-200' };
      case WasteCategory.PLASTIC: return { bg: 'bg-amber-500', text: 'text-amber-600', light: 'bg-amber-50', border: 'border-amber-200' };
      case WasteCategory.PAPER: return { bg: 'bg-sky-500', text: 'text-sky-600', light: 'bg-sky-50', border: 'border-sky-200' };
      case WasteCategory.METAL: return { bg: 'bg-zinc-500', text: 'text-zinc-600', light: 'bg-zinc-50', border: 'border-zinc-200' };
      case WasteCategory.GLASS: return { bg: 'bg-emerald-500', text: 'text-emerald-600', light: 'bg-emerald-50', border: 'border-emerald-200' };
      case WasteCategory.E_WASTE: return { bg: 'bg-indigo-500', text: 'text-indigo-600', light: 'bg-indigo-50', border: 'border-indigo-200' };
      default: return { bg: 'bg-rose-500', text: 'text-rose-600', light: 'bg-rose-50', border: 'border-rose-200' };
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 lg:py-20">
      <header className="mb-16 text-center">
        <div className="inline-flex items-center gap-3 bg-white px-5 py-2 rounded-full shadow-sm border border-slate-100 mb-8">
          <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center text-white shadow-emerald-200 shadow-lg">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0V12m3.024-4.5a1.5 1.5 0 013 0v6a1.5 1.5 0 01-3 0v-6zM6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
            </svg>
          </div>
          <span className="text-sm font-bold tracking-widest text-emerald-600 uppercase">Version 2.0</span>
        </div>
        <h1 className="text-5xl lg:text-7xl font-extrabold text-slate-900 tracking-tight mb-6">
          Eco<span className="text-emerald-500 italic">Clear</span>
        </h1>
        <p className="text-lg lg:text-xl text-slate-500 max-w-xl mx-auto font-medium leading-relaxed">
          AI-powered waste classification that runs entirely in your browser. Fast, private, and zero-carbon.
        </p>
      </header>

      <div className="grid lg:grid-cols-2 gap-10 items-start">
        {/* Left Side: Interaction */}
        <section className="space-y-6">
          <div className="bg-white/80 glass-effect p-8 rounded-[2rem] shadow-xl border border-white/50">
            {!modelReady && !loadingError ? (
              <div className="py-12 text-center">
                <div className="relative w-20 h-20 mx-auto mb-6">
                  <div className="absolute inset-0 rounded-full border-4 border-emerald-100"></div>
                  <div className="absolute inset-0 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin"></div>
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">Deploying Neural Network</h3>
                <p className="text-sm text-slate-500 px-4">Loading MobileNet weights (approx. 15MB) into your browser session...</p>
              </div>
            ) : loadingError ? (
              <div className="p-8 text-center bg-rose-50 rounded-2xl border border-rose-100">
                <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-rose-900 mb-1">System Error</h3>
                <p className="text-sm text-rose-600">{loadingError}</p>
                <button onClick={() => window.location.reload()} className="mt-4 px-6 py-2 bg-rose-600 text-white rounded-xl font-bold hover:bg-rose-700 transition-colors">
                  Retry Load
                </button>
              </div>
            ) : (
              <div className="space-y-6 animate-in fade-in duration-1000">
                <Dropzone onFileSelect={handleFileSelect} disabled={isProcessing} />
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Privacy</p>
                    <p className="text-xs font-semibold text-slate-700">100% On-Device</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Model</p>
                    <p className="text-xs font-semibold text-slate-700">MobileNet v2</p>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <div className="px-4">
            <h4 className="text-sm font-bold text-slate-800 mb-4 uppercase tracking-widest">How to use</h4>
            <ul className="space-y-3">
              {[
                { i: '1', t: 'Snap a clear photo of your item' },
                { i: '2', t: 'Our AI identifies the material instantly' },
                { i: '3', t: 'Follow the eco-friendly disposal guide' }
              ].map(step => (
                <li key={step.i} className="flex items-center gap-3 text-sm text-slate-500">
                  <span className="w-6 h-6 flex items-center justify-center bg-white border border-slate-200 rounded-full text-[10px] font-bold text-slate-900">{step.i}</span>
                  {step.t}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Right Side: Results */}
        <section>
          {previewUrl ? (
            <div className="space-y-6 animate-in slide-in-from-right-8 duration-700">
              <div className="bg-white p-4 rounded-[2.5rem] shadow-2xl border border-slate-100 relative overflow-hidden group">
                <img 
                  src={previewUrl} 
                  alt="Analyzing..." 
                  className={`w-full aspect-square object-cover rounded-[2rem] transition-all duration-700 ${isProcessing ? 'scale-110 blur-sm opacity-50' : 'group-hover:scale-105'}`}
                />
                {isProcessing && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <div className="w-24 h-24 border-t-4 border-l-4 border-emerald-500 rounded-full animate-spin mb-4"></div>
                    <span className="text-xl font-black text-slate-800 tracking-tighter uppercase">Analyzing...</span>
                  </div>
                )}
              </div>

              {result && !isProcessing && (
                <div className="bg-white/90 glass-effect p-8 rounded-[2.5rem] shadow-2xl border border-white/50 animate-in fade-in zoom-in-95 duration-500">
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h2 className="text-4xl font-black text-slate-900 tracking-tight leading-none mb-2">
                        {result.category}
                      </h2>
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${getCategoryStyles(result.category).bg} animate-pulse`}></div>
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Confidence {Math.round(result.confidence * 100)}%</span>
                      </div>
                    </div>
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${getCategoryStyles(result.category).light} ${getCategoryStyles(result.category).text}`}>
                       <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                       </svg>
                    </div>
                  </div>

                  <div className={`p-6 rounded-3xl border ${getCategoryStyles(result.category).border} ${getCategoryStyles(result.category).light} mb-6`}>
                    <h4 className={`text-xs font-black uppercase tracking-widest mb-3 ${getCategoryStyles(result.category).text}`}>Proper Disposal</h4>
                    <p className="text-slate-800 font-medium leading-relaxed">
                      {result.disposalInstructions}
                    </p>
                  </div>

                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between px-2 text-xs">
                      <span className="font-bold text-slate-400 uppercase">Model Label</span>
                      <span className="font-mono bg-slate-100 text-slate-600 px-2 py-1 rounded">{result.label}</span>
                    </div>
                    <div className="text-xs text-slate-400 leading-relaxed px-2 italic">
                      <span className="font-bold">Reasoning:</span> {result.reasoning}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="h-full min-h-[400px] border-4 border-dashed border-slate-100 rounded-[3rem] flex flex-col items-center justify-center text-center p-10 opacity-60">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6 text-slate-200">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                </svg>
              </div>
              <h3 className="text-xl font-bold text-slate-400 mb-2">Awaiting Intelligence</h3>
              <p className="text-sm text-slate-300 max-w-[200px]">The analysis report will appear here once an image is uploaded.</p>
            </div>
          )}
        </section>
      </div>

      <footer className="mt-24 pt-12 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-6 text-slate-400">
        <div className="flex items-center gap-2">
           <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse-slow"></div>
           <span className="text-sm font-semibold tracking-tight">EcoClear v2.0-Alpha</span>
        </div>
        <p className="text-xs text-center md:text-right max-w-sm leading-relaxed">
          Developed with <span className="text-slate-900 font-bold tracking-tighter">TensorFlow.js</span>. 
          Your images never leave your browser. Built for a cleaner planet.
        </p>
      </footer>
    </div>
  );
};

export default App;
