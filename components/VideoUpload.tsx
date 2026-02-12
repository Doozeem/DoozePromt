import React, { useRef, useState } from 'react';
import { Upload, X, FileVideo, Film } from 'lucide-react';
import { VideoMetadata } from '../types';

interface VideoUploadProps {
  onVideoSelected: (file: File) => void;
  onClear: () => void;
  selectedVideo: VideoMetadata | null;
  disabled: boolean;
}

export const VideoUpload: React.FC<VideoUploadProps> = ({ onVideoSelected, onClear, selectedVideo, disabled }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndProcess(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      validateAndProcess(e.target.files[0]);
    }
  };

  const validateAndProcess = (file: File) => {
    if (file.size > 50 * 1024 * 1024) { 
      alert("Ukuran file terlalu besar. Harap unggah video di bawah 50MB.");
      return;
    }
    if (!file.type.startsWith('video/')) {
      alert("Harap unggah file video yang valid.");
      return;
    }
    onVideoSelected(file);
  };

  if (selectedVideo) {
    return (
      <div className="w-full mx-auto animate-in fade-in zoom-in-95 duration-500">
        <div className="relative group rounded-3xl overflow-hidden bg-black shadow-2xl ring-1 ring-lime-500/20">
          
          {/* Cinematic Overlay - Top */}
          <div className="absolute top-0 left-0 right-0 p-4 z-20 flex justify-between items-start bg-gradient-to-b from-black/80 to-transparent transition-opacity duration-300 opacity-0 group-hover:opacity-100">
             <div className="flex items-center space-x-2">
                <span className="px-2 py-1 bg-white/10 backdrop-blur-md rounded border border-white/20 text-[10px] text-white font-mono uppercase tracking-wider">
                   Raw Input
                </span>
             </div>
             <button 
                onClick={onClear}
                disabled={disabled}
                className="p-2 bg-black/50 hover:bg-red-500/80 text-white backdrop-blur-md rounded-full transition-all border border-white/10 hover:border-red-500"
              >
                <X size={14} />
              </button>
          </div>

          <div className="relative aspect-video flex items-center justify-center bg-slate-900">
             <video 
              src={selectedVideo.url} 
              controls 
              className="w-full h-full object-contain relative z-10"
            />
          </div>
          
          {/* Metadata Footer */}
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/95 to-transparent z-20 flex justify-between items-end">
             <div className="flex items-center space-x-3">
                <div className="p-2 bg-lime-500 rounded-lg text-black shadow-[0_0_15px_rgba(132,204,22,0.4)]">
                   <FileVideo size={16} />
                </div>
                <div>
                   <h3 className="text-white text-xs font-bold tracking-tight line-clamp-1 max-w-[200px]">{selectedVideo.name}</h3>
                   <p className="text-slate-400 text-[10px] font-mono">{(selectedVideo.size / (1024 * 1024)).toFixed(1)} MB</p>
                </div>
             </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full mx-auto">
      <div 
        className={`
          relative h-64 rounded-3xl transition-all duration-500 ease-out flex flex-col items-center justify-center p-8 text-center cursor-pointer overflow-hidden
          border border-dashed
          ${dragActive 
            ? 'border-lime-500 bg-lime-900/20 scale-[1.02]' 
            : 'border-slate-700 bg-white/5 hover:bg-white/10 hover:border-lime-500/40 hover:shadow-lg hover:shadow-lime-500/10'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={!disabled ? () => fileInputRef.current?.click() : undefined}
      >
        <input 
          ref={fileInputRef}
          type="file" 
          accept="video/*" 
          className="hidden" 
          onChange={handleChange}
          disabled={disabled}
        />
        
        {/* Decorative */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-gradient-to-tr from-lime-500 to-emerald-500 rounded-full blur-[80px] opacity-10 pointer-events-none group-hover:opacity-20 transition-opacity"></div>

        <div className={`
          relative z-10 w-16 h-16 mb-5 flex items-center justify-center rounded-2xl
          bg-slate-800 shadow-xl shadow-black/50 ring-1 ring-slate-700
          transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 group-hover:ring-lime-500/50
        `}>
          <Film size={28} className="text-slate-400 group-hover:text-lime-400 transition-colors duration-300" />
          <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-lime-500 rounded-full flex items-center justify-center border-2 border-slate-900">
             <Upload size={10} className="text-black" />
          </div>
        </div>
        
        <div className="relative z-10 space-y-2">
          <h3 className="text-lg font-bold text-slate-200 tracking-tight">
            Unggah Rekaman Video
          </h3>
          <p className="text-slate-500 text-xs font-medium max-w-[200px] mx-auto leading-relaxed">
            Drag & drop file MP4 atau MOV <br/> (Max 50MB)
          </p>
        </div>
      </div>
    </div>
  );
};