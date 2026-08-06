'use client';

import React from 'react';
import { 
  Calendar, Clock, User, Share2, ArrowLeft, ArrowRight, MessageCircle, 
  AlertTriangle, ShieldAlert, CheckCircle2, Copy 
} from 'lucide-react';
import { BLOG_CATEGORIES, SITE_INFO } from '@/lib/siteData';
import { useSiteData } from '@/lib/SiteContext';
import { TabType } from '../Header';

interface ArticleDetailViewProps {
  articleId: string;
  onBackToBlog: () => void;
  onSelectArticle: (id: string) => void;
  onOpenQuote: () => void;
  setActiveTab: (tab: TabType) => void;
}

export const ArticleDetailView: React.FC<ArticleDetailViewProps> = ({
  articleId,
  onBackToBlog,
  onSelectArticle,
  onOpenQuote,
  setActiveTab
}) => {
  const { blogPosts } = useSiteData();
  const post = blogPosts.find((p) => p.id === articleId) || blogPosts[0] || {
    id: 'default',
    title: 'Artigo',
    category: 'geral',
    categoryLabel: 'Geral',
    date: '2024',
    readTime: '3 min',
    author: 'Eng. Mick Ramos',
    image: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=600&q=80',
    excerpt: 'Artigo técnico',
    content: { intro: 'Conteúdo', points: [], conclusion: 'Conclusão' }
  };
  const relatedPosts = blogPosts.filter((p) => p.id !== post.id).slice(0, 3);

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copiado para a área de transferência!');
    }
  };

  const handleShareWhatsApp = () => {
    const text = `Confira este artigo técnico da MR Engenharia: *${post.title}*`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="space-y-0 bg-white font-sans">

      {/* BREADCRUMB & ARTICLE HEADER */}
      <section className="bg-slate-50 border-b border-slate-200 py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-4">
          
          <div className="flex items-center gap-2 text-xs text-slate-500 font-bold uppercase tracking-wider">
            <button onClick={() => setActiveTab('inicio')} className="hover:text-amber-600">INÍCIO</button>
            <span>/</span>
            <button onClick={onBackToBlog} className="hover:text-amber-600">BLOG</button>
            <span>/</span>
            <span className="text-amber-600">{post.categoryLabel}</span>
          </div>

          <div className="space-y-3 max-w-4xl">
            <span className="inline-block px-3 py-1 rounded-md bg-amber-500/10 text-amber-700 font-bold text-xs uppercase tracking-wider">
              {post.categoryLabel}
            </span>

            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-serif font-bold text-slate-900 leading-tight">
              {post.title}
            </h1>

            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
              {post.excerpt}
            </p>

            <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-500 pt-2 border-t border-slate-200">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-amber-600" />
                {post.date}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-600" />
                {post.readTime}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-amber-600" />
                Por {post.author} (Engenheiro Civil)
              </span>
            </div>
          </div>

        </div>
      </section>

      {/* ARTICLE CONTENT & SIDEBAR */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* MAIN ARTICLE BODY */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Hero Article Image */}
            <div className="rounded-2xl overflow-hidden shadow-lg border border-slate-200 bg-slate-900">
              <img
                src={post.image}
                alt={post.title}
                className="w-full h-80 sm:h-[420px] object-cover"
              />
            </div>

            {/* Introduction Paragraph */}
            <div className="prose prose-slate max-w-none text-slate-700 text-sm sm:text-base leading-relaxed space-y-4">
              <p className="text-slate-800 font-medium text-base sm:text-lg border-l-4 border-amber-500 pl-4 py-1 bg-amber-500/5">
                {post.content.intro}
              </p>

              {/* Numbered Subsections */}
              <div className="space-y-6 pt-4">
                {post.content.points.map((pt, index) => (
                  <div key={index} className="space-y-2">
                    <h3 className="text-lg sm:text-xl font-serif font-bold text-slate-900 flex items-center gap-2">
                      <span className="text-amber-600 font-mono text-base">{index + 1}.</span>
                      <span>{pt.title.replace(/^\d+\.\s*/, '')}</span>
                    </h3>
                    <p className="text-slate-600 leading-relaxed text-sm">
                      {pt.text}
                    </p>
                  </div>
                ))}
              </div>

              {/* Warning Callout Box */}
              {post.content.warningBox && (
                <div className="p-5 rounded-xl bg-amber-50 border-l-4 border-amber-500 text-amber-950 space-y-2 my-6">
                  <div className="flex items-center gap-2 text-amber-800 font-bold text-sm">
                    <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                    <span>Atenção Técnica</span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-800 font-medium leading-relaxed">
                    {post.content.warningBox}
                  </p>
                </div>
              )}

              <p className="pt-2 text-slate-700 font-medium">
                {post.content.conclusion}
              </p>
            </div>

            {/* Share Buttons Strip */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-between gap-4">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Compartilhe este artigo:
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleShareWhatsApp}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg flex items-center gap-1.5"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>WhatsApp</span>
                </button>
                <button
                  onClick={handleCopyLink}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-lg flex items-center gap-1.5"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copiar Link</span>
                </button>
              </div>
            </div>

            {/* Previous / Next Article Nav */}
            <div className="pt-6 border-t border-slate-200 flex items-center justify-between gap-4">
              <button
                onClick={onBackToBlog}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs uppercase tracking-wider rounded-lg flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Voltar ao Blog</span>
              </button>

              <button
                onClick={onOpenQuote}
                className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs uppercase tracking-wider rounded-lg flex items-center gap-2"
              >
                <span>Solicitar Avaliação Técnica</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>

          {/* RIGHT SIDEBAR COLUMN */}
          <div className="lg:col-span-4 space-y-8">
            
            {/* SOBRE O AUTOR CARD (NAVY BG AS IN IMAGE 1) */}
            <div className="p-6 rounded-2xl bg-[#0A1128] text-white border border-amber-500/30 space-y-4 text-center">
              <div className="w-20 h-20 rounded-full border-2 border-amber-400 overflow-hidden mx-auto bg-slate-800">
                <img
                  src="https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=400&q=80"
                  alt="Mick Ramos Engenheiro Civil"
                  className="w-full h-full object-cover"
                />
              </div>

              <div>
                <h4 className="font-serif font-bold text-lg text-white">Mick Ramos</h4>
                <p className="text-xs text-amber-400 font-mono">Engenheiro Civil • {SITE_INFO.crea}</p>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                Especialista em projetos, vistorias e consultoria técnica para obras e regularizações de imóveis em Parnaíba e região.
              </p>

              <button
                onClick={() => {
                  setActiveTab('sobre');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="text-xs font-bold text-amber-400 hover:text-amber-300 inline-flex items-center gap-1"
              >
                <span>Saiba mais sobre nós</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* ARTIGOS RELACIONADOS */}
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
              <h4 className="font-serif font-bold text-slate-900 text-xs uppercase tracking-widest border-b border-slate-200 pb-2">
                ARTIGOS RELACIONADOS
              </h4>

              <div className="space-y-4">
                {relatedPosts.map((rel) => (
                  <div
                    key={rel.id}
                    onClick={() => onSelectArticle(rel.id)}
                    className="flex gap-3 group cursor-pointer border-b border-slate-100 pb-3 last:border-0"
                  >
                    <img
                      src={rel.image}
                      alt={rel.title}
                      className="w-16 h-16 rounded-lg object-cover shrink-0"
                    />
                    <div>
                      <span className="text-[10px] font-bold text-amber-600 uppercase">
                        {rel.categoryLabel}
                      </span>
                      <h5 className="font-serif font-bold text-slate-800 text-xs group-hover:text-amber-600 transition-colors line-clamp-2">
                        {rel.title}
                      </h5>
                      <span className="text-[10px] text-slate-400 block mt-0.5">
                        {rel.date}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* EVALUATION REQUEST CALLOUT */}
            <div className="p-6 rounded-2xl bg-[#0A1128] text-white border border-amber-500/30 text-center space-y-3">
              <ShieldAlert className="w-10 h-10 text-amber-400 mx-auto" />
              <h4 className="font-serif font-bold text-base text-white">
                Precisando de uma avaliação técnica?
              </h4>
              <p className="text-xs text-slate-300">
                Conte com um engenheiro especialista para orientar sua decisão.
              </p>
              <button
                onClick={onOpenQuote}
                className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs uppercase tracking-wider rounded-xl transition-colors shadow-md"
              >
                SOLICITAR ORÇAMENTO
              </button>
            </div>

          </div>

        </div>
      </section>

    </div>
  );
};
