import React, { useState, useEffect, useMemo } from 'react';
import { Copy, Check, Code, LayoutList, PenTool, RefreshCw, User, Aperture, MapPin, Zap, Monitor, Terminal, Sparkles, Layers } from 'lucide-react';
import { PromptBreakdown, TimelineItem } from '../types';

interface ResultDisplayProps {
  prompt: string;
}

interface ParsedResult {
  breakdown?: PromptBreakdown;
  final_prompt: string;
  timeline?: TimelineItem[];
}

export const ResultDisplay: React.FC<ResultDisplayProps> = ({ prompt }) => {
  const [copied, setCopied] = useState(false);
  const [viewMode, setViewMode] = useState<'builder' | 'timeline' | 'raw'>('timeline');
  
  const [breakdown, setBreakdown] = useState<PromptBreakdown | null>(null);
  const [finalPrompt, setFinalPrompt] = useState<string>("");

  const parsedData: ParsedResult = useMemo(() => {
    try {
      const data = JSON.parse(prompt);
      if (Array.isArray(data)) {
        return { 
          final_prompt: JSON.stringify(data, null, 2), 
          timeline: data.map((item: any, idx: number) => ({
            id: idx + 1,
            time: item.time_range || `00:${String(idx * 8).padStart(2, '0')}`,
            title: item.title || `Adegan ${idx + 1}`,
            content: item.visual_description || item.description || JSON.stringify(item)
          }))
        };
      }
    } catch (e) { /* Ignore */ }

    const timeline: TimelineItem[] = [];
    let extractedBreakdown: PromptBreakdown | null = null;
    
    const jsonBlockRegex = /```json\s*({[\s\S]*?})\s*```/;
    const jsonMatch = prompt.match(jsonBlockRegex);
    if (jsonMatch && jsonMatch[1]) {
      try {
        const parsedBlock = JSON.parse(jsonMatch[1]);
        if (parsedBlock.breakdown) {
          extractedBreakdown = parsedBlock.breakdown;
        }
      } catch (e) { console.error("Failed to parse breakdown block"); }
    }

    const sceneRegex = /###\s*(?:Adegan|Scene)\s*(\d+)\s*\(([^)]+)\)\s*(?:-\s*(.+))?\s*\n([\s\S]*?)(?=(?:###\s*(?:Adegan|Scene)|```|$))/g;
    let match;
    
    while ((match = sceneRegex.exec(prompt)) !== null) {
      timeline.push({
        id: parseInt(match[1]),
        time: match[2].trim(),
        title: match[3] ? match[3].trim() : `Adegan ${match[1]}`,
        content: match[4].trim()
      });
    }

    const cleanPrompt = prompt.replace(jsonBlockRegex, '').trim();

    return {
      breakdown: extractedBreakdown,
      final_prompt: cleanPrompt,
      timeline: timeline.length > 0 ? timeline : undefined
    };
  }, [prompt]);

  useEffect(() => {
    if (parsedData.breakdown) setBreakdown(parsedData.breakdown);
    if (parsedData.timeline && parsedData.timeline.length > 0) setViewMode('timeline');
    else if (parsedData.breakdown) setViewMode('builder');
    else setViewMode('raw');
    setFinalPrompt(parsedData.final_prompt);
  }, [parsedData]);

  const handleCopy = () => {
    navigator.clipboard.writeText(finalPrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleBreakdownChange = (key: keyof PromptBreakdown, value: string) => {
    if (!breakdown) return;
    setBreakdown({ ...breakdown, [key]: value });
  };

  const regeneratePrompt = () => {
    if (!breakdown) return;
    const newPrompt = [
      breakdown.subject, breakdown.action, breakdown.environment, breakdown.lighting, breakdown.camera
    ].filter(Boolean).join(", ");
    setFinalPrompt(newPrompt);
  };

  const TabButton = ({ mode, icon: Icon, label }: { mode: any, icon: any, label: string }) => (
    <button 
      onClick={() => setViewMode(mode)}
      className={`
        relative flex items-center space-x-2 px-4 py-2 text-[11px] font-bold uppercase tracking-wider transition-all rounded-xl z-10
        ${viewMode === mode 
          ? 'text-lime-400 bg-lime-900/30 ring-1 ring-lime-500/50' 
          : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
        }
      `}
    >
      <Icon size={14} />
      <span>{label}</span>
    </button>
  );

  return (
    <div className="w-full h-full flex flex-col mx-auto bg-black/40 backdrop-blur-xl rounded-[2.5rem] border border-white/10 shadow-2xl shadow-black overflow-hidden">
      
      {/* Premium Header */}
      <div className="flex-none flex flex-col sm:flex-row items-center justify-between px-6 py-4 border-b border-white/5 bg-white/5">
         <div className="flex p-1 bg-black/40 rounded-2xl ring-1 ring-white/10">
            <TabButton mode="timeline" icon={LayoutList} label="Timeline" />
            <TabButton mode="builder" icon={Layers} label="Builder" />
            <TabButton mode="raw" icon={Code} label="Code" />
         </div>

         <div className="mt-4 sm:mt-0">
           <button
              onClick={handleCopy}
              className={`
                flex items-center space-x-2 px-5 py-2 rounded-full text-[11px] font-bold tracking-wide transition-all shadow-sm
                ${copied 
                    ? 'bg-lime-500 text-black shadow-lime-500/30 scale-105' 
                    : 'bg-white/10 text-white hover:bg-white/20 hover:shadow-lg ring-1 ring-white/10'
                }
              `}
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
              <span>{copied ? 'BERHASIL DISALIN' : 'SALIN SEMUA'}</span>
            </button>
         </div>
      </div>

      <div className="flex-grow overflow-y-auto p-6 sm:p-8 custom-scrollbar">
        {/* VIEW: TIMELINE */}
        {viewMode === 'timeline' && parsedData.timeline && parsedData.timeline.length > 0 && (
          <div className="space-y-8 relative pl-4">
             {/* Timeline Bar */}
             <div className="absolute left-[29px] top-4 bottom-8 w-0.5 bg-gradient-to-b from-lime-500 via-slate-700 to-transparent"></div>
             
            {parsedData.timeline.map((item, idx) => (
              <div key={item.id} className="group relative pl-12 animate-in fade-in slide-in-from-bottom-4" style={{ animationDelay: `${idx * 100}ms` }}>
                
                {/* Numbered Node */}
                <div className={`
                    absolute left-[12px] top-0 w-9 h-9 rounded-full z-10 flex items-center justify-center text-xs font-bold transition-all duration-300
                    bg-black border-[3px] border-slate-700 text-slate-400 group-hover:border-lime-500 group-hover:text-lime-400 group-hover:scale-110 shadow-sm
                `}>
                  {idx + 1}
                </div>
                
                <div className="bg-white/5 rounded-2xl border border-white/10 p-5 hover:border-lime-500/50 hover:bg-white/10 hover:shadow-xl hover:shadow-lime-500/5 transition-all duration-300">
                  <div className="flex flex-col sm:flex-row justify-between items-start mb-3">
                     <h3 className="text-base font-bold text-slate-200">{item.title}</h3>
                     <span className="mt-1 sm:mt-0 text-[10px] font-mono font-bold text-lime-400 bg-lime-900/30 px-2 py-1 rounded-md border border-lime-500/20">
                        {item.time}
                     </span>
                  </div>
                  <p className="text-sm text-slate-400 leading-relaxed">{item.content}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* VIEW: BUILDER */}
        {viewMode === 'builder' && breakdown ? (
          <div className="grid grid-cols-1 gap-6 animate-in fade-in">
            <div className="p-4 bg-lime-900/10 rounded-2xl border border-lime-500/20">
               <div className="flex items-center space-x-2 mb-3 text-lime-400">
                  <User size={16} />
                  <span className="text-xs font-bold uppercase tracking-widest">Subjek Utama</span>
               </div>
               <textarea 
                 value={breakdown.subject}
                 onChange={(e) => handleBreakdownChange('subject', e.target.value)}
                 className="w-full bg-black/40 border-0 rounded-xl p-4 text-sm text-slate-200 shadow-sm ring-1 ring-white/10 focus:ring-2 focus:ring-lime-500 transition-all h-24 resize-none"
               />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               {[
                   { key: 'action', label: 'Aksi', icon: Zap },
                   { key: 'environment', label: 'Lingkungan', icon: MapPin },
                   { key: 'lighting', label: 'Pencahayaan', icon: Monitor },
                   { key: 'camera', label: 'Kamera', icon: Aperture }
               ].map(({ key, label, icon: Icon }) => (
                   <div key={key} className="p-4 bg-white/5 rounded-2xl border border-white/10 hover:border-white/20 transition-colors">
                      <div className="flex items-center space-x-2 mb-2 text-slate-500">
                        <Icon size={14} />
                        <span className="text-[10px] font-bold uppercase tracking-widest">{label}</span>
                      </div>
                      <textarea 
                        value={(breakdown as any)[key]}
                        onChange={(e) => handleBreakdownChange(key as keyof PromptBreakdown, e.target.value)}
                        className="w-full bg-black/40 border-0 rounded-lg p-3 text-xs text-slate-300 ring-1 ring-white/5 focus:ring-1 focus:ring-lime-500 h-20 resize-none"
                      />
                   </div>
               ))}
            </div>

            <button 
                onClick={regeneratePrompt}
                className="mx-auto flex items-center space-x-2 px-6 py-2 bg-slate-800 hover:bg-lime-600 hover:text-black text-slate-300 rounded-full transition-all text-xs font-bold uppercase tracking-widest border border-slate-700 hover:border-lime-500"
            >
                <RefreshCw size={14} />
                <span>Re-Sync Prompt</span>
            </button>

            <div className="relative mt-4">
               <div className="absolute top-3 right-3 px-2 py-1 bg-lime-500 text-black text-[10px] font-bold rounded">PREVIEW</div>
               <textarea 
                  value={finalPrompt}
                  onChange={(e) => setFinalPrompt(e.target.value)}
                  className="w-full h-40 bg-black/60 rounded-2xl p-6 text-sm font-mono text-lime-400 focus:outline-none resize-none leading-relaxed border border-white/10 focus:border-lime-500/50"
               />
            </div>
          </div>
        ) : (viewMode === 'builder' && (
          <div className="h-full flex flex-col items-center justify-center text-slate-600 opacity-50">
            <PenTool size={48} className="mb-4" />
            <p>Builder mode unavailable for this format.</p>
          </div>
        ))}

        {/* VIEW: RAW */}
        {viewMode === 'raw' && (
          <div className="relative h-full bg-black/60 rounded-2xl p-6 font-mono text-xs text-slate-300 overflow-auto shadow-inner border border-white/10">
             <Terminal size={16} className="absolute top-6 right-6 text-lime-500 opacity-50" />
            <pre className="whitespace-pre-wrap leading-relaxed">{prompt}</pre>
          </div>
        )}
      </div>
    </div>
  );
};