import React, { useState, useEffect } from 'react';
import { VideoUpload } from './components/VideoUpload';
import { ResultDisplay } from './components/ResultDisplay';
import { StyleSelector } from './components/StyleSelector';
import { HistoryPanel } from './components/HistoryPanel';
import { analyzeVideoContent } from './services/gemini';
import { VideoMetadata, AppState, PromptStyle, HistoryItem } from './types';
import { Loader2, Zap, AlertCircle, ArrowRight, Sparkles, Command, Cpu, Info, X, FileVideo, Sliders, Copy } from 'lucide-react';

// --- Components ---

const SplashScreen: React.FC = () => {
  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#050505] text-slate-200 overflow-hidden font-sans">
      {/* Background FX for smooth transition */}
      <div className="absolute inset-0 bg-aurora opacity-40"></div>
      <div className="absolute inset-0 bg-noise opacity-10"></div>
      
      {/* Background Blobs */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-lime-900/20 rounded-full blur-[100px] animate-pulse-slow"></div>

      <div className="relative z-10 flex flex-col items-center">
        {/* Logo Container */}
        <div className="mb-8 relative">
           <div className="absolute inset-0 bg-lime-500 blur-3xl opacity-20 rounded-full"></div>
           <div className="relative flex items-center justify-center w-20 h-20 bg-gradient-to-tr from-lime-500 to-lime-600 rounded-3xl shadow-2xl shadow-lime-500/20 animate-in zoom-in duration-700">
              <Command size={40} className="text-black" />
           </div>
        </div>

        {/* Text Animation */}
        <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-white mb-2 animate-in fade-in slide-in-from-bottom-4 duration-700">
          Dooze<span className="text-lime-500">.</span>
        </h1>
        
        <div className="flex items-center space-x-3 mt-4">
           <div className="h-px w-12 bg-gradient-to-r from-transparent to-lime-500/50"></div>
           <p className="text-[10px] md:text-xs font-mono text-lime-400 tracking-[0.3em] uppercase animate-pulse">
              System Initialization
           </p>
           <div className="h-px w-12 bg-gradient-to-l from-transparent to-lime-500/50"></div>
        </div>

        {/* Loading Bar */}
        <div className="mt-10 w-64 h-1 bg-slate-900/50 rounded-full overflow-hidden border border-white/5 backdrop-blur-sm relative">
           <div className="absolute top-0 left-0 h-full bg-lime-500 shadow-[0_0_10px_rgba(132,204,22,0.8)] animate-[shimmer_2s_infinite] w-full origin-left -translate-x-full"></div>
        </div>
      </div>

      {/* Footer Version */}
      <div className="absolute bottom-8 text-[10px] text-slate-600 font-mono">
        v2.0.1 <span className="mx-2 text-slate-800">|</span> POWERED BY GEMINI
      </div>
    </div>
  );
};

const InfoModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
      
      <div className="relative w-full max-w-3xl bg-[#0a0a0a] border border-slate-800 rounded-[2rem] overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-white/5 bg-white/5 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-lime-500/10 rounded-lg text-lime-500">
              <Info size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">Panduan Sistem</h2>
              <p className="text-xs text-slate-400">Dooze Intelligence System</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors text-slate-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 sm:p-8 overflow-y-auto custom-scrollbar space-y-8">
          
          {/* Section 1: Apa ini? */}
          <div className="space-y-4">
             <h3 className="text-sm font-bold text-lime-500 uppercase tracking-widest flex items-center">
               <span className="w-1.5 h-1.5 bg-lime-500 rounded-full mr-2"></span>
               Fungsi Utama
             </h3>
             <p className="text-slate-300 text-sm leading-relaxed">
               Aplikasi ini adalah alat <strong className="text-white">Reverse Engineering Visual</strong>. Dooze menganalisis video Anda (struktur, pencahayaan, pergerakan kamera) dan menerjemahkannya kembali menjadi <strong className="text-white">Teks Prompt</strong> yang sangat detail.
             </p>
             <div className="p-4 bg-lime-900/10 border border-lime-500/20 rounded-xl text-xs text-lime-200/80">
               <strong className="text-lime-400">Sangat berguna untuk:</strong> Filmmaker, AI Creator (Runway, Midjourney, Pika), dan Editor yang ingin menduplikasi gaya visual video referensi.
             </div>
          </div>

          {/* Section 2: Cara Pakai */}
          <div className="space-y-4">
             <h3 className="text-sm font-bold text-lime-500 uppercase tracking-widest flex items-center">
               <span className="w-1.5 h-1.5 bg-lime-500 rounded-full mr-2"></span>
               Alur Penggunaan
             </h3>
             
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-white/5 p-4 rounded-2xl border border-white/5 flex flex-col space-y-2">
                   <div className="bg-slate-800 w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs mb-1">1</div>
                   <h4 className="font-bold text-slate-200 text-sm">Upload Referensi</h4>
                   <p className="text-xs text-slate-400">Unggah video pendek (MP4/MOV, max 20MB) yang memiliki gaya visual yang ingin Anda tiru.</p>
                </div>

                <div className="bg-white/5 p-4 rounded-2xl border border-white/5 flex flex-col space-y-2">
                   <div className="bg-slate-800 w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs mb-1">2</div>
                   <h4 className="font-bold text-slate-200 text-sm">Pilih Target Gaya</h4>
                   <p className="text-xs text-slate-400">Pilih format output: <strong>Midjourney</strong> (artistik), <strong>Runway</strong> (fisika kamera), atau <strong>Standard</strong>.</p>
                </div>

                <div className="bg-white/5 p-4 rounded-2xl border border-white/5 flex flex-col space-y-2">
                   <div className="bg-slate-800 w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs mb-1">3</div>
                   <h4 className="font-bold text-slate-200 text-sm">Analisis AI</h4>
                   <p className="text-xs text-slate-400">Klik <strong>Generate Prompt</strong>. AI akan membedah adegan per 8 detik.</p>
                </div>

                <div className="bg-white/5 p-4 rounded-2xl border border-white/5 flex flex-col space-y-2">
                   <div className="bg-slate-800 w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs mb-1">4</div>
                   <h4 className="font-bold text-slate-200 text-sm">Salin & Gunakan</h4>
                   <p className="text-xs text-slate-400">Salin hasil prompt dan tempel (paste) ke tools AI Generative favorit Anda.</p>
                </div>
             </div>
          </div>

        </div>
        
        {/* Footer */}
        <div className="p-4 bg-black border-t border-white/10 text-center">
          <button 
            onClick={onClose}
            className="w-full sm:w-auto px-8 py-3 bg-lime-500 hover:bg-lime-400 text-black font-bold rounded-xl transition-colors text-sm"
          >
            Mengerti, Mulai Sistem
          </button>
        </div>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [showInfo, setShowInfo] = useState(false);
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoMeta, setVideoMeta] = useState<VideoMetadata | null>(null);
  const [resultPrompt, setResultPrompt] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [selectedStyle, setSelectedStyle] = useState<PromptStyle>(PromptStyle.DESCRIPTIVE);
  const [includeAudio, setIncludeAudio] = useState<boolean>(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isOptimizing, setIsOptimizing] = useState(false);

  // Initial Boot Loader
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2500); // 2.5 seconds splash screen
    return () => clearTimeout(timer);
  }, []);

  // Load History
  useEffect(() => {
    const savedHistory = localStorage.getItem('dooze_history');
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (e) { console.error(e); }
    }
  }, []);

  useEffect(() => {
    return () => {
      if (videoMeta?.url) URL.revokeObjectURL(videoMeta.url);
    };
  }, [videoMeta]);

  const saveToHistory = (prompt: string) => {
    if (!videoMeta) return;
    const newItem: HistoryItem = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      videoName: videoMeta.name,
      prompt: prompt,
      style: selectedStyle
    };
    const newHistory = [newItem, ...history].slice(0, 9);
    setHistory(newHistory);
    localStorage.setItem('dooze_history', JSON.stringify(newHistory));
  };

  const handleVideoSelect = (file: File) => {
    setAppState(AppState.IDLE);
    setResultPrompt('');
    setErrorMessage('');

    if (file.size > 20 * 1024 * 1024) {
      setIsOptimizing(true);
      setTimeout(() => {
        setIsOptimizing(false);
        finalizeVideoLoad(file);
      }, 1500); 
    } else {
      finalizeVideoLoad(file);
    }
  };

  const finalizeVideoLoad = (file: File) => {
    const url = URL.createObjectURL(file);
    setVideoFile(file);
    setVideoMeta({ name: file.name, size: file.size, type: file.type, url: url });
  };

  const handleClear = () => {
    setVideoFile(null);
    setVideoMeta(null);
    setResultPrompt('');
    setAppState(AppState.IDLE);
  };

  const handleClearHistory = () => {
    setHistory([]);
    localStorage.removeItem('dooze_history');
  };

  const handleSelectHistory = (item: HistoryItem) => {
    setResultPrompt(item.prompt);
    setSelectedStyle(item.style);
    setAppState(AppState.SUCCESS);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAnalyze = async () => {
    if (!videoFile) return;
    setAppState(AppState.ANALYZING);
    setErrorMessage('');
    try {
      const prompt = await analyzeVideoContent(videoFile, selectedStyle, includeAudio);
      setResultPrompt(prompt);
      setAppState(AppState.SUCCESS);
      saveToHistory(prompt);
    } catch (error: any) {
      console.error(error);
      setErrorMessage(error.message || "Something went wrong during analysis.");
      setAppState(AppState.ERROR);
    }
  };

  if (loading) {
    return <SplashScreen />;
  }

  return (
    <div className="relative min-h-screen flex flex-col overflow-x-hidden text-slate-200 font-sans selection:bg-lime-900 selection:text-lime-200 animate-in fade-in duration-1000">
      
      {/* Dynamic Backgrounds */}
      <div className="bg-aurora"></div>
      <div className="bg-noise"></div>

      {/* Info Modal */}
      {showInfo && <InfoModal onClose={() => setShowInfo(false)} />}

      {/* Animated Blobs - Adjusted for Dark Mode */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10 opacity-30">
        <div className="absolute top-0 -left-4 w-[500px] h-[500px] bg-lime-900/40 rounded-full mix-blend-screen filter blur-[100px] animate-blob"></div>
        <div className="absolute top-20 right-0 w-[400px] h-[400px] bg-emerald-900/30 rounded-full mix-blend-screen filter blur-[80px] animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-32 left-20 w-[600px] h-[600px] bg-lime-950/50 rounded-full mix-blend-screen filter blur-[120px] animate-blob animation-delay-4000"></div>
      </div>

      {/* Floating Navbar */}
      <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-4xl">
        <div className="glass-card rounded-full px-6 py-3 flex items-center justify-between shadow-2xl shadow-black/50 ring-1 ring-white/10">
           <div className="flex items-center space-x-3 cursor-pointer group" onClick={handleClear}>
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-lime-500 to-lime-700 flex items-center justify-center shadow-lg shadow-lime-500/20 group-hover:scale-105 transition-transform duration-300">
                 <Command size={16} className="text-black" />
              </div>
              <span className="text-lg font-bold tracking-tight text-white">Dooze <span className="text-lime-500">Analis Prompt</span></span>
           </div>

           <div className="flex items-center space-x-3">
              <button 
                onClick={() => setShowInfo(true)}
                className="flex items-center justify-center w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all ring-1 ring-white/10 hover:ring-lime-500/50"
                title="Panduan"
              >
                <Info size={16} />
              </button>
              <div className="hidden sm:flex items-center space-x-2 bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
                 <Cpu size={12} className="text-lime-500" />
                 <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Gemini 2.0 Flash</span>
              </div>
           </div>
        </div>
      </nav>

      <main className="relative z-10 flex-grow pt-32 pb-24 px-4 sm:px-6 flex flex-col items-center">
        
        <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          
          {/* LEFT COLUMN: Controls */}
          <div className="lg:col-span-5 space-y-8 flex flex-col">
             
             {/* Header */}
             <div className="space-y-4 text-center lg:text-left animate-in fade-in slide-in-from-bottom-4 duration-700">
                <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-[1.1]">
                  Visual menjadi <br/>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-lime-400 to-emerald-400">Prompt Presisi.</span>
                </h1>
                <p className="text-base text-slate-400 font-medium leading-relaxed max-w-md mx-auto lg:mx-0">
                  Analisis struktur sinematik dan pencahayaan video Anda untuk rekayasa ulang prompt AI Generatif yang sempurna.
                </p>
             </div>

             {/* Main Card */}
             <div className="glass-card rounded-[2rem] p-6 space-y-6 shadow-2xl shadow-black/50 relative overflow-hidden group">
                {/* Glow effect behind inputs */}
                <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-b from-white/5 to-transparent pointer-events-none opacity-50"></div>
                
                {/* Upload */}
                <div className="space-y-4 relative z-10">
                  {isOptimizing ? (
                    <div className="h-64 border border-lime-500/30 bg-black/40 rounded-3xl flex flex-col items-center justify-center space-y-4 backdrop-blur-md">
                      <div className="relative">
                        <div className="absolute inset-0 bg-lime-500 blur-2xl opacity-20 animate-pulse rounded-full"></div>
                        <Loader2 className="animate-spin text-lime-500 relative z-10" size={40} />
                      </div>
                      <p className="font-bold text-lime-500 text-xs tracking-widest uppercase">Menganalisis Metadata...</p>
                    </div>
                  ) : (
                    <VideoUpload 
                      onVideoSelected={handleVideoSelect} 
                      onClear={handleClear} 
                      selectedVideo={videoMeta}
                      disabled={appState === AppState.ANALYZING}
                    />
                  )}
                </div>

                {/* Settings */}
                <div className="relative z-10">
                  <StyleSelector 
                    selectedStyle={selectedStyle} 
                    onSelect={setSelectedStyle} 
                    includeAudio={includeAudio}
                    onToggleAudio={setIncludeAudio}
                    disabled={appState === AppState.ANALYZING || !videoFile} 
                  />
                </div>

                {/* Action Button */}
                <div className="pt-2 relative z-10">
                  {videoFile && appState !== AppState.SUCCESS && !isOptimizing && (
                      <button
                        onClick={handleAnalyze}
                        disabled={appState === AppState.ANALYZING}
                        className={`
                          w-full h-16 rounded-2xl font-bold text-lg tracking-wide transition-all duration-500 flex items-center justify-center shadow-lg relative overflow-hidden group border
                          ${appState === AppState.ANALYZING 
                            ? 'bg-slate-900/50 text-slate-500 cursor-wait border-slate-800' 
                            : 'bg-lime-500 text-black border-lime-400 hover:bg-lime-400 hover:shadow-lime-500/20 hover:-translate-y-1'
                          }
                        `}
                      >
                          {appState !== AppState.ANALYZING && (
                             <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 skew-x-12 opacity-0 group-hover:animate-[shimmer_1s_infinite]"></div>
                          )}
                          
                          <div className="relative z-10 flex items-center">
                            {appState === AppState.ANALYZING ? (
                              <>
                                <Loader2 className="animate-spin mr-3" size={20} />
                                <span className="text-sm uppercase tracking-widest">Sedang Memproses...</span>
                              </>
                            ) : (
                              <>
                                <Sparkles className="mr-2 text-black" size={20} fill="currentColor" />
                                <span>Generate Prompt</span>
                                <ArrowRight size={20} className="ml-2 group-hover:translate-x-2 transition-transform duration-300" />
                              </>
                            )}
                          </div>
                      </button>
                  )}

                  {appState === AppState.ERROR && (
                      <div className="mt-4 bg-red-950/30 border border-red-500/30 backdrop-blur-sm rounded-xl p-4 flex items-center space-x-3 text-red-400 animate-in fade-in slide-in-from-top-2">
                        <AlertCircle size={20} />
                        <p className="text-xs font-bold">{errorMessage}</p>
                      </div>
                  )}
                </div>
             </div>
          </div>

          {/* RIGHT COLUMN: Results */}
          <div className="lg:col-span-7 flex flex-col h-full min-h-[600px]">
             {appState === AppState.SUCCESS ? (
                <div className="flex-grow animate-in fade-in slide-in-from-bottom-8 duration-700 h-full">
                   <div className="flex items-center justify-between mb-6 px-2">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-lime-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(132,204,22,0.8)]"></div>
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                          Hasil Analisis
                        </span>
                      </div>
                      <button 
                        onClick={() => {
                          setAppState(AppState.IDLE);
                          setVideoFile(null);
                          setVideoMeta(null);
                          setResultPrompt('');
                        }}
                        className="text-xs text-slate-400 hover:text-lime-400 transition-colors font-bold bg-white/5 px-4 py-1.5 rounded-full border border-white/10 hover:border-lime-500/50"
                      >
                        Reset
                      </button>
                   </div>
                   <ResultDisplay prompt={resultPrompt} />
                </div>
             ) : (
                <div className="h-full border-2 border-dashed border-slate-800 rounded-[2.5rem] flex flex-col items-center justify-center text-slate-600 bg-black/20 backdrop-blur-sm">
                   <div className="w-20 h-20 rounded-3xl bg-slate-900/80 shadow-lg shadow-black/50 flex items-center justify-center mb-6 ring-1 ring-white/10">
                      <Zap size={32} className="opacity-30 text-lime-500" fill="currentColor" />
                   </div>
                   <h3 className="text-lg font-bold text-slate-500">Area Hasil</h3>
                   <p className="text-sm font-medium text-slate-600 mt-1">Prompt akan muncul di sini setelah analisis.</p>
                </div>
             )}
          </div>
        </div>
        
        {/* History Panel */}
        <div className="w-full max-w-7xl mt-16 pt-10 border-t border-slate-800/50">
            <HistoryPanel 
               history={history} 
               onSelect={handleSelectHistory} 
               onClear={handleClearHistory} 
            />
        </div>

      </main>

      <footer className="w-full py-8 text-center relative z-10">
         <p className="text-[10px] text-slate-600 font-mono uppercase tracking-[0.2em]">Dooze Intelligence System &copy; 2024</p>
      </footer>
    </div>
  );
};

export default App;