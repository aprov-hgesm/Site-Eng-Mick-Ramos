'use client';

import React from 'react';
import { X, MapPin, Calendar, Maximize2, Check, ArrowRight, ShieldCheck, ZoomIn } from 'lucide-react';
import { Project } from '@/lib/siteData';
import { ImageLightboxModal } from '@/components/ImageLightboxModal';

interface ProjectDetailModalProps {
  project: Project | null;
  onClose: () => void;
  onOpenQuote: () => void;
}

export const ProjectDetailModal: React.FC<ProjectDetailModalProps> = ({
  project,
  onClose,
  onOpenQuote
}) => {
  const [selectedImage, setSelectedImage] = React.useState<string | null>(null);
  const [isLightboxOpen, setIsLightboxOpen] = React.useState<boolean>(false);
  const [lightboxIndex, setLightboxIndex] = React.useState<number>(0);

  if (!project) return null;

  // Gallery support: combine main image and optional gallery images into unique array
  const allImages = Array.from(new Set([project.image, ...(project.images || [])])).filter(Boolean);
  const currentImage = selectedImage && allImages.includes(selectedImage) ? selectedImage : project.image;

  const handleOpenLightbox = (indexToOpen?: number) => {
    const idx = typeof indexToOpen === 'number' 
      ? indexToOpen 
      : Math.max(0, allImages.indexOf(currentImage));
    setLightboxIndex(idx);
    setIsLightboxOpen(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200 text-slate-800 my-8 max-h-[90vh] flex flex-col">
        
        {/* Header Image */}
        <div 
          onClick={() => handleOpenLightbox()}
          className="relative h-64 sm:h-80 w-full overflow-hidden bg-slate-900 shrink-0 cursor-pointer group"
        >
          <img
            src={currentImage}
            alt={project.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
          
          {/* Top Control Buttons */}
          <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleOpenLightbox();
              }}
              className="px-3 py-1.5 rounded-full bg-slate-950/70 hover:bg-amber-500 text-white hover:text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all shadow-lg border border-white/20"
              title="Expandir foto em tela cheia"
            >
              <ZoomIn className="w-3.5 h-3.5" />
              <span>Expandir Foto</span>
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              className="p-2.5 rounded-full bg-slate-950/70 hover:bg-slate-950 text-white transition-colors"
              aria-label="Fechar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="absolute bottom-6 left-6 right-6 text-white space-y-2">
            <span className="inline-block px-3 py-1 rounded-full bg-amber-500 text-slate-950 font-extrabold text-[10px] uppercase tracking-wider shadow">
              {project.categoryLabel}
            </span>
            <h3 className="text-2xl sm:text-3xl font-serif font-bold text-white drop-shadow-md">
              {project.title}
            </h3>
            <div className="flex flex-wrap items-center gap-4 text-xs text-amber-200/90 font-medium">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" />
                {project.location}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Maximize2 className="w-3.5 h-3.5" />
                {project.area}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {project.year}
              </span>
            </div>
          </div>
        </div>

        {/* Gallery Thumbnails (if multiple images exist) */}
        {allImages.length > 1 && (
          <div className="bg-slate-900 px-6 py-3 border-b border-slate-800 flex items-center justify-between gap-3 overflow-x-auto no-scrollbar shrink-0">
            <div className="flex items-center gap-3 overflow-x-auto no-scrollbar">
              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider shrink-0">
                Galeria ({allImages.length}):
              </span>
              {allImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(img)}
                  className={`w-14 h-10 rounded-lg overflow-hidden border-2 transition-all shrink-0 ${
                    currentImage === img
                      ? 'border-amber-400 scale-105 shadow-md'
                      : 'border-slate-700 opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt={`Foto ${idx + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>

            <button
              onClick={() => handleOpenLightbox()}
              className="px-3 py-1.5 rounded-lg bg-amber-500/20 text-amber-300 hover:bg-amber-500 hover:text-slate-950 text-[11px] font-bold uppercase tracking-wider shrink-0 transition-colors flex items-center gap-1.5"
            >
              <ZoomIn className="w-3.5 h-3.5" />
              <span>Ver Tela Cheia</span>
            </button>
          </div>
        )}

        {/* Content Body */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">
              Sobre o Projeto
            </h4>
            <p className="text-slate-700 text-sm sm:text-base leading-relaxed">
              {project.description}
            </p>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">
              Destaques Técnicos
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {project.features.map((feat, idx) => (
                <div key={idx} className="flex items-center gap-2.5 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-slate-800 text-xs font-semibold">
                  <Check className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>{feat}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900 text-white flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-8 h-8 text-amber-400 shrink-0" />
              <div>
                <h5 className="font-serif font-bold text-sm">Gostou desse projeto?</h5>
                <p className="text-xs text-slate-400">Desenvolvemos a solução perfeita para a sua necessidade.</p>
              </div>
            </div>
            <button
              onClick={() => {
                onClose();
                onOpenQuote();
              }}
              className="w-full sm:w-auto px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs uppercase tracking-wider rounded-lg flex items-center justify-center gap-2 shrink-0 transition-colors"
            >
              <span>Solicitar Semelhante</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>

      </div>

      {/* Fullscreen Lightbox Modal */}
      <ImageLightboxModal
        isOpen={isLightboxOpen}
        onClose={() => setIsLightboxOpen(false)}
        images={allImages}
        initialIndex={lightboxIndex}
        title={project.title}
      />
    </div>
  );
};
