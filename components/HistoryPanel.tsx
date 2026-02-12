import React from 'react';
import { HistoryItem } from '../types';
import { Clock, Trash2, ArrowUpRight, PlayCircle } from 'lucide-react';

interface HistoryPanelProps {
  history: HistoryItem[];
  onSelect: (item: HistoryItem) => void;
  onClear: () => void;
}

export const HistoryPanel: React.FC<HistoryPanelProps> = ({ history, onSelect, onClear }) => {
  if (history.length === 0) return null;

  return (
    <div className="w-full animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div className="flex items-center justify-between mb-8 px-2 border-b border-slate-800 pb-4">
        <h3 className="text-sm font-extrabold text-slate-400 flex items-center">
          <Clock size={16} className="mr-2 text-lime-500" />
          RIWAYAT TERBARU
        </h3>
        <button 
          onClick={onClear}
          className="text-[10px] font-bold text-slate-500 hover:text-red-400 transition-colors uppercase tracking-wider flex items-center group"
        >
          <Trash2 size={12} className="mr-1.5 group-hover:scale-110 transition-transform" /> Hapus Semua
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {history.map((item) => (
          <button
            key={item.id}
            onClick={() => onSelect(item)}
            className="group relative flex flex-col items-start text-left p-6 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-lime-500/30 rounded-[1.5rem] transition-all duration-300 shadow-sm hover:shadow-xl hover:shadow-lime-500/10 hover:-translate-y-1"
          >
            <div className="w-full flex justify-between items-start mb-4">
              <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-full bg-lime-900/30 text-lime-400 border border-lime-500/20 text-[9px] font-bold uppercase tracking-wide">
                {item.style}
              </span>
              <ArrowUpRight size={16} className="text-slate-600 group-hover:text-lime-400 transition-colors" />
            </div>
            
            <div className="mb-3 w-full">
                <h4 className="text-sm font-bold text-slate-200 truncate pr-4 group-hover:text-lime-400 transition-colors">
                {item.videoName}
                </h4>
                <p className="text-[10px] text-slate-500 font-mono mt-1">
                  {new Date(item.timestamp).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                </p>
            </div>
            
            <div className="w-full p-3 bg-black/40 rounded-xl group-hover:bg-lime-900/10 transition-colors border border-white/5">
              <p className="text-[11px] text-slate-400 line-clamp-2 font-medium leading-relaxed italic">
                "{item.prompt}"
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};