'use client';

import React, { useState } from 'react';
import {
  MapPin, ArrowRight, Layers, ShieldCheck, Cpu, HeartHandshake, Sparkles, Filter, ZoomIn, Images
} from 'lucide-react';
import { Project } from '@/lib/siteData';
import { useSiteData } from '@/lib/SiteContext';
import { ImageLightboxModal } from '@/components/ImageLightboxModal';

interface ProjectsViewProps {
  onSelectProject: (project: Project) => void;
  onOpenQuote: () => void;
}

export const ProjectsView: React.FC<ProjectsViewProps> = ({
  onSelectProject,
  onOpenQuote
}) => {
  const { projects } = useSiteData();
  const [filterCategory, setFilterCategory] = useState<string>('TODOS');

  const [lightboxData, setLightboxData] = useState<{
    isOpen: boolean;
    images: string[];
    title: string;
    index: number;
  }>({
    isOpen: false,
    images: [],
    title: '',
    index: 0,
  });

  const handleOpenDirectLightbox = (e: React.MouseEvent, p: Project) => {
    e.stopPropagation();
    const imgs = Array.from(new Set([p.image, ...(p.images || [])])).filter(Boolean);
    setLightboxData({
      isOpen: true,
      images: imgs,
      title: p.title,
      index: 0,
    });
  };

  const categories = [
    { id: 'TODOS', label: 'TODOS OS PROJETOS' },
    { id: 'ARQUITETÔNICO', label: 'ARQUITETÔNICO' },
    { id: 'ESTRUTURAL', label: 'ESTRUTURAL' },
    { id: 'HIDROSSANITÁRIO', label: 'HIDROSSANITÁRIO' },
    { id: 'ELÉTRICO', label: 'ELÉTRICO' },
    { id: 'PPCI', label: 'PPCI' },
  ];

  const filteredProjects = filterCategory === 'TODOS'
    ? projects
    : projects.filter((p) => p.category === filterCategory);

  return (
    <div className="space-y-0 bg-white font-sans">

      {/* PORTFÓLIO HEADER */}
      <section className="relative bg-[#0A1128] text-white py-16 px-4 sm:px-6 lg:px-8 border-b border-amber-500/20">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="text-xs text-amber-400 font-bold tracking-widest uppercase flex items-center gap-2">
            <span>INÍCIO</span>
            <span>/</span>
            <span className="text-white">PORTFÓLIO</span>
          </div>

          <div className="space-y-3 max-w-3xl">
            <div className="inline-flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-[0.2em]">
              <Images className="w-4 h-4" />
              <span>Galeria de projetos</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-serif font-bold text-white tracking-tight leading-tight">
              Portfólio de projetos.
            </h1>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Conheça alguns dos projetos desenvolvidos pela MR Engenharia. Explore as imagens, veja os detalhes técnicos e inspire-se para tirar seu projeto do papel.
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-slate-800">
            <div className="flex items-center gap-2.5 text-xs font-semibold text-slate-300">
              <Layers className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Soluções completas</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs font-semibold text-slate-300">
              <Cpu className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Tecnologia e precisão</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs font-semibold text-slate-300">
              <HeartHandshake className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Atendimento personalizado</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs font-semibold text-slate-300">
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Qualidade em cada detalhe</span>
            </div>
          </div>
        </div>
      </section>

      {/* VISUAL PORTFOLIO */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-10">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div className="space-y-2">
            <span className="text-[11px] font-bold text-amber-600 uppercase tracking-[0.2em]">Nosso trabalho</span>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900">Galeria de projetos</h2>
            <p className="text-sm text-slate-500 max-w-2xl">
              Clique em qualquer projeto para abrir a galeria completa de imagens e conhecer suas principais características.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 shrink-0">
            <Images className="w-4 h-4 text-amber-500" />
            <span>{filteredProjects.length} {filteredProjects.length === 1 ? 'projeto' : 'projetos'}</span>
          </div>
        </div>

        {/* Category Filters Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-3 border-b border-slate-200 no-scrollbar">
          <Filter className="w-4 h-4 text-slate-400 shrink-0 ml-1 mr-2 hidden sm:block" />
          {categories.map((cat) => {
            const isActive = filterCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setFilterCategory(cat.id)}
                className={`px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-[#0A1128] text-amber-400 shadow-md font-extrabold'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Projects Gallery Grid */}
        {filteredProjects.length === 0 ? (
          <div className="py-16 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 p-8 space-y-2">
            <Layers className="w-8 h-8 text-slate-400 mx-auto" />
            <h3 className="text-base font-bold text-slate-700">Nenhum projeto encontrado</h3>
            <p className="text-xs text-slate-500">Não há projetos cadastrados nesta categoria no momento.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-7">
            {filteredProjects.map((p) => {
              const imageCount = Array.from(new Set([p.image, ...(p.images || [])])).filter(Boolean).length;

              return (
                <article
                  key={p.id}
                  onClick={() => onSelectProject(p)}
                  className="group cursor-pointer bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
                >
                  <div>
                    <div className="relative aspect-[16/10] overflow-hidden bg-slate-900 group/img">
                      <img
                        src={p.image}
                        alt={`Imagem do projeto ${p.title}`}
                        loading="lazy"
                        className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-transparent to-transparent opacity-70 group-hover/img:opacity-90 transition-opacity" />

                      <div className="absolute top-3 left-3 bg-slate-950/80 text-amber-400 font-bold text-[10px] uppercase px-2.5 py-1 rounded-md tracking-wider border border-amber-500/30">
                        {p.categoryLabel}
                      </div>

                      {imageCount > 1 && (
                        <div className="absolute top-3 right-3 px-2.5 py-1.5 rounded-full bg-slate-950/75 text-white text-[10px] font-bold flex items-center gap-1.5 border border-white/20">
                          <Images className="w-3 h-3 text-amber-400" />
                          <span>{imageCount} fotos</span>
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={(e) => handleOpenDirectLightbox(e, p)}
                        className="absolute bottom-3 right-3 px-3 py-2 rounded-lg bg-white/95 hover:bg-amber-500 text-slate-900 font-bold text-[10px] uppercase tracking-wider transition-all opacity-0 group-hover/img:opacity-100 shadow-lg flex items-center gap-1.5"
                        title="Abrir galeria de fotos"
                      >
                        <ZoomIn className="w-3.5 h-3.5" />
                        <span>Ver galeria</span>
                      </button>
                    </div>

                    <div className="p-5 space-y-2">
                      <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-amber-600" />
                        {p.location}
                      </span>
                      <h3 className="font-serif font-bold text-slate-900 text-base group-hover:text-amber-600 transition-colors leading-snug">
                        {p.title}
                      </h3>
                      <p className="text-xs text-slate-500 line-clamp-2 pt-1">
                        {p.description}
                      </p>
                    </div>
                  </div>

                  <div className="px-5 pb-5 pt-2 flex items-center justify-between gap-3">
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-600 group-hover:translate-x-1 transition-transform">
                      <span>VER PROJETO</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                      {imageCount > 1 ? 'Galeria disponível' : '1 imagem'}
                    </span>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* PROCESS TIMELINE BANNER */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-slate-900 text-white border-y border-slate-800">
        <div className="max-w-7xl mx-auto space-y-10">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white">
              Do conceito à execução, cuidamos de cada detalhe.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
            <div className="p-6 rounded-xl bg-slate-800/60 border border-slate-700/80 space-y-2">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-widest block">PASSO 01</span>
              <h3 className="font-serif font-bold text-lg text-white">PLANEJAMENTO</h3>
              <p className="text-slate-300 text-xs leading-relaxed">
                Estudamos suas necessidades para criar a melhor solução técnica e financeira.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-slate-800/60 border border-slate-700/80 space-y-2">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-widest block">PASSO 02</span>
              <h3 className="font-serif font-bold text-lg text-white">DESENVOLVIMENTO</h3>
              <p className="text-slate-300 text-xs leading-relaxed">
                Projetos completos e detalhados com tecnologia BIM e precisão de quantitativos.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-slate-800/60 border border-slate-700/80 space-y-2">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-widest block">PASSO 03</span>
              <h3 className="font-serif font-bold text-lg text-white">EXECUÇÃO</h3>
              <p className="text-slate-300 text-xs leading-relaxed">
                Acompanhamento e fiscalização rigorosa para garantir a correta aplicação do projeto.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* BOTTOM ORÇAMENTO CALLOUT BOX */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-slate-100 border-t border-slate-200">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          <div className="space-y-1">
            <h3 className="text-2xl font-serif font-bold text-slate-900">
              Tem um projeto em mente?
            </h3>
            <p className="text-slate-600 text-sm">
              Fale com um engenheiro e solicite um orçamento personalizado sem compromisso.
            </p>
          </div>

          <button
            onClick={onOpenQuote}
            className="px-8 py-4 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs uppercase tracking-widest rounded-xl shadow-lg shrink-0 transition-all"
          >
            FALE CONOSCO AGORA
          </button>
        </div>
      </section>

      <ImageLightboxModal
        isOpen={lightboxData.isOpen}
        onClose={() => setLightboxData((prev) => ({ ...prev, isOpen: false }))}
        images={lightboxData.images}
        initialIndex={lightboxData.index}
        title={lightboxData.title}
      />
    </div>
  );
};
