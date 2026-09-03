'use client';

import React, { useState } from 'react';
import { 
  Search, Calendar, Clock, ArrowRight, User, FolderOpen, Flame, ShieldAlert, ChevronRight 
} from 'lucide-react';
import { BLOG_CATEGORIES, BlogPost, SITE_INFO } from '@/lib/siteData';
import { useSiteData } from '@/lib/SiteContext';

interface BlogViewProps {
  onSelectArticle: (articleId: string) => void;
  onOpenQuote: () => void;
}

export const BlogView: React.FC<BlogViewProps> = ({
  onSelectArticle,
  onOpenQuote
}) => {
  const { blogPosts } = useSiteData();
  const [selectedCategory, setSelectedCategory] = useState<string>('todos');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredPosts = blogPosts.filter((post) => {
    const matchesCategory = selectedCategory === 'todos' || post.category === selectedCategory;
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const popularPosts = blogPosts.slice(0, 5);

  return (
    <div className="space-y-0 bg-white font-sans">

      {/* PAGE HEADER */}
      <section className="relative bg-[#0A1128] text-white py-16 px-4 sm:px-6 lg:px-8 border-b border-amber-500/20">
        <div className="max-w-7xl mx-auto space-y-6">
          
          <div className="text-xs text-amber-400 font-bold tracking-widest uppercase flex items-center gap-2">
            <span>INÍCIO</span>
            <span>/</span>
            <span className="text-white">BLOG</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8 space-y-3">
              <h1 className="text-3xl sm:text-5xl font-serif font-bold text-white tracking-tight">
                Blog MR Engenharia
              </h1>
              <p className="text-slate-300 text-sm sm:text-base max-w-2xl leading-relaxed">
                Conteúdos técnicos e dicas práticas para ajudar você a construir, reformar e manter seu imóvel com segurança e qualidade.
              </p>
            </div>

            <div className="lg:col-span-4 hidden lg:block">
              <div className="p-2.5 bg-amber-500/10 border border-amber-500/30 rounded-2xl">
                <img
                  src="https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=600&q=80"
                  alt="Planta e Projetos Blog"
                  className="rounded-xl h-40 w-full object-cover"
                />
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* CATEGORIES HORIZONTAL BAR */}
      <section className="bg-slate-50 border-b border-slate-200 py-4 px-4 sm:px-6 lg:px-8 sticky top-20 z-20">
        <div className="max-w-7xl mx-auto flex items-center gap-2 overflow-x-auto no-scrollbar">
          {BLOG_CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-[#0A1128] text-amber-400 shadow-md font-extrabold'
                    : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      </section>

      {/* MAIN LAYOUT: LEFT ARTICLES GRID + RIGHT SIDEBAR */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* ARTICLES GRID COLUMN */}
          <div className="lg:col-span-8 space-y-8">
            
            {filteredPosts.length === 0 ? (
              <div className="p-12 text-center bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <Search className="w-10 h-10 text-slate-400 mx-auto" />
                <h3 className="text-lg font-bold text-slate-800">Nenhum artigo encontrado</h3>
                <p className="text-xs text-slate-500">Tente buscar por outras palavras-chave ou selecione outra categoria.</p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('todos');
                  }}
                  className="px-4 py-2 bg-amber-500 text-slate-950 font-bold text-xs uppercase rounded-lg"
                >
                  Limpar Filtros
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPosts.map((post) => (
                  <article
                    key={post.id}
                    onClick={() => onSelectArticle(post.id)}
                    className="group cursor-pointer bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col justify-between"
                  >
                    <div>
                      <div className="relative h-48 overflow-hidden bg-slate-900">
                        <img
                          src={post.image}
                          alt={post.title}
                          className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute top-3 left-3 bg-slate-950/80 text-amber-400 font-bold text-[10px] uppercase px-2.5 py-1 rounded-md tracking-wider border border-amber-500/30">
                          {post.categoryLabel}
                        </div>
                      </div>

                      <div className="p-5 space-y-2.5">
                        <div className="flex items-center gap-3 text-[10px] font-bold text-slate-400">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-amber-600" />
                            {post.date}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-amber-600" />
                            {post.readTime}
                          </span>
                        </div>

                        <h3 className="font-serif font-bold text-slate-900 text-base group-hover:text-amber-600 transition-colors leading-snug">
                          {post.title}
                        </h3>

                        <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                          {post.excerpt}
                        </p>
                      </div>
                    </div>

                    <div className="px-5 pb-5 pt-1">
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-600 group-hover:translate-x-1 transition-transform">
                        <span>LER ARTIGO COMPLETO</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </article>
                ))}
              </div>
            )}

            {/* Pagination Controls */}
            <div className="flex items-center justify-center gap-2 pt-8">
              <button className="w-9 h-9 rounded-lg bg-[#0A1128] text-amber-400 font-bold text-xs flex items-center justify-center">
                1
              </button>
              <button className="w-9 h-9 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 font-bold text-xs flex items-center justify-center">
                2
              </button>
              <button className="w-9 h-9 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 font-bold text-xs flex items-center justify-center">
                3
              </button>
              <span className="text-xs text-slate-400">...</span>
              <button className="px-3 h-9 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 font-bold text-xs flex items-center justify-center gap-1">
                <span>Próxima</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>

          {/* RIGHT SIDEBAR COLUMN */}
          <div className="lg:col-span-4 space-y-8">
            
            {/* Search Box */}
            <div className="p-6 rounded-2xl bg-[#0A1128] text-white border border-amber-500/30 space-y-3">
              <h4 className="font-serif font-bold text-amber-400 text-xs uppercase tracking-widest">
                BUSCAR ARTIGOS
              </h4>
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar palavras-chave..."
                  className="w-full pl-3.5 pr-10 py-2.5 rounded-lg bg-slate-900 border border-slate-700 text-white placeholder-slate-400 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
                <Search className="w-4 h-4 text-amber-400 absolute right-3 top-3" />
              </div>
            </div>

            {/* Categories List */}
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
              <h4 className="font-serif font-bold text-slate-900 text-xs uppercase tracking-widest border-b border-slate-200 pb-2">
                CATEGORIAS
              </h4>
              <ul className="space-y-2 text-xs">
                {BLOG_CATEGORIES.filter(c => c.id !== 'todos').map((c) => (
                  <li key={c.id}>
                    <button
                      onClick={() => setSelectedCategory(c.id)}
                      className={`w-full flex items-center justify-between py-1.5 px-2 rounded-md transition-colors ${
                        selectedCategory === c.id
                          ? 'bg-amber-500/10 text-amber-700 font-bold'
                          : 'text-slate-700 hover:text-amber-600'
                      }`}
                    >
                      <span>{c.label}</span>
                      <span className="px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 font-mono text-[10px]">
                        {c.count}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Technical Evaluation Request Banner */}
            <div className="p-6 rounded-2xl bg-[#0A1128] text-white border border-amber-500/30 shadow-xl space-y-4 text-center">
              <ShieldAlert className="w-10 h-10 text-amber-400 mx-auto" />
              <h4 className="font-serif font-bold text-lg text-white leading-snug">
                Precisando de uma avaliação técnica?
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Conte com um engenheiro especialista para orientar sua decisão e emitir o laudo correto.
              </p>
              <button
                onClick={onOpenQuote}
                className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs uppercase tracking-wider rounded-xl transition-colors shadow-md"
              >
                SOLICITAR ORÇAMENTO
              </button>
            </div>

            {/* Artigos Mais Lidos */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200 space-y-4">
              <h4 className="font-serif font-bold text-slate-900 text-xs uppercase tracking-widest border-b border-slate-200 pb-2">
                ARTIGOS MAIS LIDOS
              </h4>

              <div className="space-y-4">
                {popularPosts.map((post, index) => (
                  <div
                    key={post.id}
                    onClick={() => onSelectArticle(post.id)}
                    className="flex items-start gap-3 group cursor-pointer border-b border-slate-100 pb-3 last:border-0"
                  >
                    <span className="font-serif font-bold text-amber-600 text-lg w-6 shrink-0">
                      0{index + 1}
                    </span>
                    <div>
                      <h5 className="font-serif font-semibold text-slate-800 text-xs group-hover:text-amber-600 transition-colors line-clamp-2">
                        {post.title}
                      </h5>
                      <span className="text-[10px] text-slate-400 block mt-0.5">
                        {post.date}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      </section>

    </div>
  );
};
