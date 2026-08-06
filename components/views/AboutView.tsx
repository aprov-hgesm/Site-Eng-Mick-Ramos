'use client';

import React from 'react';
import { 
  ShieldCheck, Target, Award, Users, CheckCircle2, MapPin, 
  Quote, GraduationCap, Scale, Eye
} from 'lucide-react';
import { useSiteData } from '@/lib/SiteContext';

interface AboutViewProps {
  onOpenQuote: () => void;
}

export const AboutView: React.FC<AboutViewProps> = ({ onOpenQuote }) => {
  const { aboutInfo, siteInfo } = useSiteData();

  const getValueIcon = (iconName?: string) => {
    switch (iconName) {
      case 'ShieldCheck': return <ShieldCheck className="w-5 h-5" />;
      case 'Target': return <Target className="w-5 h-5" />;
      case 'Scale': return <Scale className="w-5 h-5" />;
      case 'Eye': return <Eye className="w-5 h-5" />;
      case 'Users': return <Users className="w-5 h-5" />;
      case 'Award': return <Award className="w-5 h-5" />;
      default: return <ShieldCheck className="w-5 h-5" />;
    }
  };

  return (
    <div className="space-y-0 bg-white">

      {/* PAGE HEADER & BREADCRUMBS */}
      <section className="relative bg-[#0A1128] text-white py-16 px-4 sm:px-6 lg:px-8 border-b border-amber-500/20 overflow-hidden">
        <div className="max-w-7xl mx-auto relative z-10">
          
          <div className="text-xs text-amber-400 font-bold tracking-widest uppercase mb-4 flex items-center gap-2">
            <span>INÍCIO</span>
            <span>/</span>
            <span className="text-white">SOBRE</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8 space-y-4">
              <h1 className="text-4xl sm:text-5xl font-serif font-bold text-white tracking-tight">
                {aboutInfo.heroTitle || 'Sobre'}
              </h1>
              <p className="text-slate-300 text-base sm:text-lg max-w-2xl leading-relaxed">
                {aboutInfo.heroSubtitle}
              </p>
            </div>

            {aboutInfo.heroImage && (
              <div className="lg:col-span-4 hidden lg:block">
                <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl">
                  <img
                    src={aboutInfo.heroImage}
                    alt={siteInfo.brandName}
                    className="rounded-xl h-40 w-full object-cover"
                  />
                </div>
              </div>
            )}
          </div>

        </div>
      </section>

      {/* QUEM SOMOS DETAILED NARRATIVE */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 text-amber-600 font-mono text-xs font-bold uppercase tracking-widest">
              <span>QUEM SOMOS</span>
              <span className="w-8 h-px bg-amber-500" />
            </div>

            <h2 className="text-2xl sm:text-4xl font-serif font-bold text-slate-900 leading-snug">
              {aboutInfo.whoWeAreTitle}
            </h2>

            <div className="space-y-4 text-slate-600 text-sm sm:text-base leading-relaxed">
              {aboutInfo.whoWeAreParagraphs.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-slate-200">
              <img
                src={aboutInfo.officeImage}
                alt={siteInfo.brandName}
                className="w-full h-80 sm:h-96 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 to-transparent flex items-end p-6">
                <div className="text-white">
                  <span className="font-serif font-bold text-lg block">{siteInfo.brandName}</span>
                  <span className="text-xs text-amber-300">{aboutInfo.officeLocation || siteInfo.cityRegion}</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* NOSSOS VALORES */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-slate-50 border-y border-slate-200">
        <div className="max-w-7xl mx-auto space-y-12">
          
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <div className="inline-flex items-center gap-2 text-amber-600 font-mono text-xs font-bold uppercase tracking-widest justify-center">
              <span>{aboutInfo.valuesTitle || 'NOSSOS VALORES'}</span>
            </div>
            <h2 className="text-3xl font-serif font-bold text-slate-900">
              {aboutInfo.valuesSubtitle || 'Pilares da Nossa Atuação'}
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {aboutInfo.values.map((v, idx) => (
              <div
                key={idx}
                className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3 text-center sm:text-left flex flex-col justify-between"
              >
                <div>
                  <div className="w-10 h-10 bg-amber-500/10 text-amber-600 rounded-xl flex items-center justify-center mx-auto sm:mx-0 mb-3">
                    {getValueIcon(v.iconName)}
                  </div>
                  <h3 className="font-serif font-bold text-slate-900 text-sm uppercase mb-1">{v.title}</h3>
                  <p className="text-slate-600 text-xs leading-relaxed">
                    {v.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* STATS STRIP */}
      <section className="bg-[#0A1128] text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center text-xs font-bold text-amber-400 uppercase tracking-widest mb-8">
            EXPERIÊNCIA QUE GERA RESULTADOS
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
            <div>
              <span className="text-3xl sm:text-4xl font-serif font-bold text-amber-400 block">{aboutInfo.stats.clients}</span>
              <span className="text-xs text-slate-300">Clientes atendidos</span>
            </div>
            <div>
              <span className="text-3xl sm:text-4xl font-serif font-bold text-amber-400 block">{aboutInfo.stats.projects}</span>
              <span className="text-xs text-slate-300">Projetos desenvolvidos</span>
            </div>
            <div>
              <span className="text-3xl sm:text-4xl font-serif font-bold text-amber-400 block">{aboutInfo.stats.years}</span>
              <span className="text-xs text-slate-300">Anos de experiência</span>
            </div>
            <div>
              <span className="text-lg sm:text-xl font-serif font-bold text-amber-400 block pt-1">{aboutInfo.stats.region}</span>
              <span className="text-xs text-slate-300">{aboutInfo.stats.regionSubtitle}</span>
            </div>
          </div>
        </div>
      </section>

      {/* FORMAÇÃO E CREDENCIAIS */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 text-amber-600 font-mono text-xs font-bold uppercase tracking-widest">
              <GraduationCap className="w-4 h-4" />
              <span>FORMAÇÃO E CREDENCIAIS</span>
            </div>

            <h2 className="text-3xl font-serif font-bold text-slate-900">
              {aboutInfo.credentialsTitle}
            </h2>

            <ul className="space-y-3 text-slate-700 text-sm font-medium">
              {aboutInfo.credentialsList.map((cred, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <span>{cred}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Navy Quote Card */}
          <div className="lg:col-span-5">
            <div className="p-8 rounded-2xl bg-[#0A1128] text-white border border-amber-500/30 shadow-2xl relative space-y-6">
              <Quote className="w-12 h-12 text-amber-500/30 absolute top-6 right-6" />
              <p className="text-lg sm:text-xl font-serif italic text-amber-200 relative z-10 leading-relaxed">
                &ldquo;{aboutInfo.quoteText}&rdquo;
              </p>
              <div className="border-t border-amber-500/20 pt-4">
                <span className="font-serif font-bold text-white block">{aboutInfo.quoteAuthor}</span>
                <span className="text-xs text-amber-400 font-mono uppercase">{aboutInfo.quoteRoleCrea || siteInfo.crea}</span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* BOTTOM CTA */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-slate-100 border-t border-slate-200">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          <div>
            <h3 className="text-2xl font-serif font-bold text-slate-900">
              Pronto para tirar seu projeto do papel?
            </h3>
            <p className="text-slate-600 text-sm mt-1">
              Fale com um engenheiro e solicite um orçamento sem compromisso.
            </p>
          </div>
          <button
            onClick={onOpenQuote}
            className="px-8 py-4 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs uppercase tracking-widest rounded-xl shadow-lg transition-all"
          >
            FALE CONOSCO AGORA
          </button>
        </div>
      </section>

    </div>
  );
};
