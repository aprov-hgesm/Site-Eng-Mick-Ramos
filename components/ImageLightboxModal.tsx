'use client';

import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Maximize2 } from 'lucide-react';

interface ImageLightboxModalProps {
  images: string[];
  initialIndex?: number;
  isOpen: boolean;
  onClose: () => void;
  title?: string;
}

export const ImageLightboxModal: React.FC<ImageLightboxModalProps> = ({
  images,
  initialIndex = 0,
  isOpen,
  onClose,
  title,
}) => {
  const [currentIndex, setCurrentIndex] = useState<number>(initialIndex);

  // Sync index when modal opens
  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(initialIndex >= 0 && initialIndex < images.length ? initialIndex : 0);
    }
  }, [isOpen, initialIndex, images.length]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentIndex, images.length]);

  if (!isOpen || images.length === 0) return null;

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const activeImage = images[currentIndex] || images[0];

  return (
    <div className="fixed inset-0 z-[100] bg-slate-950/95 backdrop-blur-md flex flex-col justify-between p-4 sm:p-6 animate-in fade-in duration-200 select-none">
      
      {/* Top Header Bar */}
      <div className="flex items-center justify-between text-white z-10 py-2 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/30">
            <Maximize2 className="w-4 h-4" />
          </div>
          <div>
            {title && (
              <h3 className="font-serif font-bold text-sm sm:text-base text-white line-clamp-1">
                {title}
              </h3>
            )}
            <span className="text-xs text-amber-400 font-bold tracking-wider">
              Foto {currentIndex + 1} de {images.length}
            </span>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-2.5 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-200 hover:text-white transition-all transform hover:scale-105"
          title="Fechar (Esc)"
          aria-label="Fechar galeria em tela cheia"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Main Image Container */}
      <div className="relative flex-1 flex items-center justify-center my-4 overflow-hidden">
        
        {/* Previous Button */}
        {images.length > 1 && (
          <button
            onClick={handlePrev}
            className="absolute left-2 sm:left-6 z-20 p-3 sm:p-4 rounded-full bg-slate-900/80 hover:bg-amber-500 text-slate-200 hover:text-slate-950 border border-slate-700/80 transition-all transform hover:scale-110 shadow-2xl"
            title="Imagem Anterior (Seta Esquerda)"
            aria-label="Imagem anterior"
          >
            <ChevronLeft className="w-6 h-6 sm:w-8 sm:h-8" />
          </button>
        )}

        {/* Active Image */}
        <div className="relative max-w-full max-h-[75vh] flex items-center justify-center p-2">
          <img
            src={activeImage}
            alt={`Foto ${currentIndex + 1}`}
            className="max-w-full max-h-[75vh] object-contain rounded-xl shadow-2xl transition-all duration-300"
          />
        </div>

        {/* Next Button */}
        {images.length > 1 && (
          <button
            onClick={handleNext}
            className="absolute right-2 sm:right-6 z-20 p-3 sm:p-4 rounded-full bg-slate-900/80 hover:bg-amber-500 text-slate-200 hover:text-slate-950 border border-slate-700/80 transition-all transform hover:scale-110 shadow-2xl"
            title="Próxima Imagem (Seta Direita)"
            aria-label="Próxima imagem"
          >
            <ChevronRight className="w-6 h-6 sm:w-8 sm:h-8" />
          </button>
        )}
      </div>

      {/* Bottom Thumbnails Strip (If multiple images) */}
      {images.length > 1 && (
        <div className="flex items-center justify-center gap-2 overflow-x-auto py-2 no-scrollbar z-10 border-t border-slate-800/80">
          {images.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`w-14 h-10 sm:w-16 sm:h-12 rounded-lg overflow-hidden border-2 transition-all shrink-0 ${
                currentIndex === idx
                  ? 'border-amber-400 scale-105 ring-2 ring-amber-400/40 shadow-lg'
                  : 'border-slate-800 opacity-50 hover:opacity-100'
              }`}
            >
              <img src={img} alt={`Miniatura ${idx + 1}`} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}

    </div>
  );
};
