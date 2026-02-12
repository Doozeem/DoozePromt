import React from 'react';
import { PromptStyle } from '../types';
import { Palette, Camera, Zap, Video, FileJson, Volume2, VolumeX, Check } from 'lucide-react';

interface StyleSelectorProps {
  selectedStyle: PromptStyle;
  onSelect: (style: PromptStyle) => void;
  includeAudio: boolean;
  onToggleAudio: (enabled: boolean) => void;
  disabled: boolean;
}

export const StyleSelector: React.FC<StyleSelectorProps> = ({ 
  selectedStyle, 
  onSelect, 
  includeAudio, 
  onToggleAudio, 
  disabled 
}) => {
  const styles = [
    { id: PromptStyle.DESCRIPTIVE, label: 'Standard', desc: 'Detail Seimbang', icon: <Video size={16} /> },
    { id: PromptStyle.RUNWAY, label: 'Runway', desc: 'Fokus Fisika', icon: <Camera size={16} /> },
    { id: PromptStyle.MIDJOURNEY, label: 'Midjourney', desc: 'Estetika V6', icon: <Palette size={16} /> },
    { id: PromptStyle.STABLE_DIFFUSION, label: 'SDXL', desc: 'Tag-based', icon: <Zap size={16} /> },
    { id: PromptStyle.JSON, label: 'Data', desc: 'JSON Output', icon: <FileJson size={16} /> },
  ];

  return (
    <div className="w-full space-y-4">
      {/* Header with Switch */}
      <div className="flex items-center justify-between px-2">
        <span className="text-xs font-extrabold text-slate-500 uppercase tracking-widest">Target Output</span>
        
        <button
          onClick={() => onToggleAudio(!includeAudio)}
          disabled={disabled}
          className={`
            group relative flex items-center space-x-2 pl-2 pr-3 py-1.5 rounded-full text-[10px] font-bold transition-all duration-300
            ${includeAudio 
              ? 'bg-lime-900/30 text-lime-400 ring-1 ring-lime-500/50' 
              : 'bg-white/5 text-slate-500 ring-1 ring-white/10 hover:bg-white/10 hover:text-slate-300'
            }
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          `}
        >
           <div className={`
             w-5 h-5 rounded-full flex items-center justify-center transition-colors
             ${includeAudio ? 'bg-lime-500 text-black' : 'bg-slate-700 text-slate-400'}
           `}>
             {includeAudio ? <Volume2 size={10} /> : <VolumeX size={10} />}
           </div>
           <span>Analisis Audio</span>
        </button>
      </div>

      {/* Modern Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        {styles.map((style) => {
           const isActive = selectedStyle === style.id;
           return (
            <button
              key={style.id}
              onClick={() => onSelect(style.id)}
              disabled={disabled}
              className={`
                group relative p-3 rounded-2xl text-left transition-all duration-300 flex flex-col items-start justify-between h-28 overflow-hidden
                ${isActive 
                  ? 'bg-gradient-to-br from-lime-900/40 to-slate-900 text-white shadow-xl shadow-lime-900/20 ring-1 ring-lime-500' 
                  : 'bg-white/5 hover:bg-white/10 text-slate-500 border border-white/5 hover:border-lime-500/30 hover:shadow-lg'
                }
                ${disabled ? 'opacity-40 grayscale cursor-not-allowed' : 'cursor-pointer'}
              `}
            >
              {/* Background Glow for Active */}
              {isActive && (
                 <div className="absolute -top-10 -right-10 w-24 h-24 bg-lime-500/20 blur-2xl rounded-full"></div>
              )}

              <div className={`
                 p-2 rounded-xl mb-2 transition-transform duration-300 group-hover:scale-110
                 ${isActive ? 'bg-lime-500 text-black' : 'bg-slate-800 text-slate-400 group-hover:bg-lime-900/50 group-hover:text-lime-400'}
              `}>
                {style.icon}
              </div>
              
              <div className="relative z-10 w-full">
                <div className={`text-xs font-bold leading-none mb-1 ${isActive ? 'text-lime-100' : 'text-slate-300'}`}>
                  {style.label}
                </div>
                <div className={`text-[9px] font-medium leading-tight ${isActive ? 'text-lime-200/70' : 'text-slate-500'}`}>
                  {style.desc}
                </div>
              </div>
              
              {isActive && (
                <div className="absolute top-2 right-2 text-lime-400 animate-in fade-in zoom-in duration-300">
                  <Check size={12} strokeWidth={4} />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};