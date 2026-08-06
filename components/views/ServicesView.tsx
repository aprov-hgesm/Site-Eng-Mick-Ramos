'use client';

import React, { useState } from 'react';
import { 
  Search, FileText, Building2, FileCheck, HardHat, Compass, Flame, Box,
  ArrowRight, CheckCircle2, ShieldCheck, HelpCircle, X
} from 'lucide-react';
import { Service } from '@/lib/siteData';
import { useSiteData } from '@/lib/SiteContext';

interface ServicesViewProps {
  onOpenQuote: (serviceTitle?: string) => void;
}

export const ServicesView: React.FC<ServicesViewProps> = ({ onOpenQuote }) => {
  const { services, siteInfo } = useSiteData();
  const [selectedService, setSelectedService] = useState<Service | null>(null);

  const getServiceIcon = (iconName: string) => {
    switch (iconName) {
      case 'Search': return <Search className="w-6 h-6 text-amber-600" />;
      case 'FileText': return <FileText className="w-6 h-6 text-amber-600" />;
      case 'Building2': return <Building2 className="w-6 h-6 text-amber-600" />;
      case 'FileCheck': return <FileCheck className="w-6 h-6 text-amber-600" />;
      case 'HardHat': return <HardHat className="w-6 h-6 text-amber-600" />;
      case 'Compass': return <Compass className="w-6 h-6 text-amber-600" />;
      case 'Flame': return <Flame className="w-6 h-6 text-amber-600" />;
      case 'Box': return <Box className="w-6 h-6 text-amber-600" />;
      default: return <Compass className="w-6 h-6 text-amber-600" />;
    }
  };

  const getServiceImage = (id: string) => {
    switch (id) {
      case 'vistorias': return 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=600&q=80';
      case 'laudos': return 'https://images.unsplash.com/photo-1590069261209-f8e9b8642343?auto=format&fit=crop&w=600&q=80';
      case 'regularizacao': return 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=600&q=80';
      case 'art': return 'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=600&q=80';
      case 'acompanhamento': return 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=600&q=80';
      case 'projetos': return 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80';
      case 'ppci': return 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=600&q=80';
      case 'bim3d': return 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=600&q=80';
      default: return 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=600&q=80';
    }
  };

  return (
    <div className="space-y-0 bg-white font-sans">

      {/* PAGE HEADER */}
      <section className="relative bg-[#0A1128] text-white py-16 px-4 sm:px-6 lg:px-8 border-b border-amber-500/20">
        <div className="max-w-7xl mx-auto">
          
          <div className="text-xs text-amber-400 font-bold tracking-widest uppercase mb-4 flex items-center gap-2">
            <span>INÍCIO</span>
            <span>/</span>
            <span className="text-white">SERVIÇOS</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8 space-y-4">
              <h1 className="text-3xl sm:text-5xl font-serif font-bold text-white tracking-tight leading-tight">
                Soluções técnicas com responsabilidade e excelência.
              </h1>
              <p className="text-slate-300 text-sm sm:text-base max-w-2xl leading-relaxed">
                Serviços completos em engenharia civil para garantir segurança, qualidade e tranquilidade em todas as etapas do seu projeto ou obra.
              </p>
            </div>

            <div className="lg:col-span-4 hidden lg:block">
              <div className="p-2.5 bg-amber-500/10 border border-amber-500/30 rounded-2xl">
                <img
                  src="https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=600&q=80"
                  alt="Engenheiro Mick Ramos - Vistoria"
                  className="rounded-xl h-44 w-full object-cover"
                />
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* NOSSOS SERVIÇOS GRID */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12">
        
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-2 text-amber-600 font-mono text-xs font-bold uppercase tracking-widest">
            <span>NOSSOS SERVIÇOS</span>
            <span className="w-8 h-px bg-amber-500" />
          </div>
          <h2 className="text-3xl font-serif font-bold text-slate-900">
            Atuação Especializada em Engenharia Civil
          </h2>
        </div>

        {/* 8 Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((s) => (
            <div
              key={s.id}
              className="group bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col justify-between"
            >
              <div>
                <div className="relative h-40 overflow-hidden bg-slate-100">
                  <img
                    src={getServiceImage(s.id)}
                    alt={s.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-slate-950/20 group-hover:bg-slate-950/0 transition-colors" />
                </div>

                <div className="p-6 space-y-3">
                  <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center -mt-10 relative z-10 bg-white shadow-md">
                    {getServiceIcon(s.iconName)}
                  </div>

                  <h3 className="font-serif font-bold text-slate-900 text-sm uppercase tracking-wide group-hover:text-amber-600 transition-colors">
                    {s.title}
                  </h3>

                  <p className="text-slate-600 text-xs leading-relaxed line-clamp-3">
                    {s.shortDesc}
                  </p>
                </div>
              </div>

              <div className="px-6 pb-6 pt-2">
                <button
                  onClick={() => setSelectedService(s)}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-600 group-hover:translate-x-1 transition-transform"
                >
                  <span>SAIBA MAIS</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>

      </section>

      {/* COMO TRABALHAMOS (5 STEPS) */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-slate-50 border-y border-slate-200">
        <div className="max-w-7xl mx-auto space-y-12">
          
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <div className="inline-flex items-center gap-2 text-amber-600 font-mono text-xs font-bold uppercase tracking-widest justify-center">
              <span>COMO TRABALHAMOS</span>
            </div>
            <h2 className="text-3xl font-serif font-bold text-slate-900">
              Metodologia Transparente em 5 Passos
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3 relative">
              <div className="w-8 h-8 rounded-full bg-amber-500 text-slate-950 font-bold text-xs flex items-center justify-center font-mono">
                1
              </div>
              <h4 className="font-serif font-bold text-slate-900 text-sm uppercase">ENTENDIMENTO</h4>
              <p className="text-slate-600 text-xs leading-relaxed">
                Entendemos sua necessidade e analisamos minuciosamente o caso.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3 relative">
              <div className="w-8 h-8 rounded-full bg-amber-500 text-slate-950 font-bold text-xs flex items-center justify-center font-mono">
                2
              </div>
              <h4 className="font-serif font-bold text-slate-900 text-sm uppercase">DIAGNÓSTICO</h4>
              <p className="text-slate-600 text-xs leading-relaxed">
                Realizamos as análises e levantamentos técnicos necessários no imóvel.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3 relative">
              <div className="w-8 h-8 rounded-full bg-amber-500 text-slate-950 font-bold text-xs flex items-center justify-center font-mono">
                3
              </div>
              <h4 className="font-serif font-bold text-slate-900 text-sm uppercase">SOLUÇÃO</h4>
              <p className="text-slate-600 text-xs leading-relaxed">
                Apresentamos as melhores soluções técnicas com economia e segurança.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3 relative">
              <div className="w-8 h-8 rounded-full bg-amber-500 text-slate-950 font-bold text-xs flex items-center justify-center font-mono">
                4
              </div>
              <h4 className="font-serif font-bold text-slate-900 text-sm uppercase">EXECUÇÃO</h4>
              <p className="text-slate-600 text-xs leading-relaxed">
                Acompanhamos e garantimos a correta aplicação segundo normas ABNT.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3 relative sm:col-span-2 lg:col-span-1">
              <div className="w-8 h-8 rounded-full bg-amber-500 text-slate-950 font-bold text-xs flex items-center justify-center font-mono">
                5
              </div>
              <h4 className="font-serif font-bold text-slate-900 text-sm uppercase">RESULTADO</h4>
              <p className="text-slate-600 text-xs leading-relaxed">
                Entregamos com total qualidade, segurança e responsabilidade legal.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* POR QUE CONTRATAR A MR ENGENHARIA? */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 text-amber-600 font-mono text-xs font-bold uppercase tracking-widest">
              <span>POR QUE CONTRATAR A MR ENGENHARIA?</span>
            </div>

            <h2 className="text-3xl font-serif font-bold text-slate-900">
              Tranquilidade e Rigor Técnico na Sua Obra
            </h2>

            <ul className="space-y-4 text-slate-700 text-sm">
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <span><strong>Experiência técnica e comprometimento</strong> em cada projeto.</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <span><strong>Soluções personalizadas</strong> para cada necessidade e tipo de imóvel.</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <span><strong>Atuação rigorosa conforme normas NBR/ABNT</strong> e legislações vigentes.</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <span><strong>Transparência, ética e responsabilidade</strong> na entrega dos relatórios.</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <span><strong>Foco inegociável em segurança</strong>, qualidade e resultado duradouro.</span>
              </li>
            </ul>
          </div>

          <div className="lg:col-span-5">
            <div className="p-8 rounded-2xl bg-[#0A1128] text-white border border-amber-500/30 shadow-2xl text-center space-y-4">
              <ShieldCheck className="w-16 h-16 text-amber-400 mx-auto" />
              <h3 className="font-serif font-bold text-2xl text-white">
                CONFIANÇA
              </h3>
              <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                que você percebe em cada detalhe do diagnóstico ao encerramento do serviço.
              </p>
              <button
                onClick={() => onOpenQuote()}
                className="w-full py-3.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs uppercase tracking-widest rounded-xl transition-colors mt-2"
              >
                SOLICITAR AVALIAÇÃO TÉCNICA
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* BOTTOM CALLOUT */}
      <section className="py-14 px-4 sm:px-6 lg:px-8 bg-[#0A1128] text-white border-t border-amber-500/20">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          <div className="space-y-1">
            <h3 className="text-2xl font-serif font-bold text-white">
              Tem um projeto ou problema para resolver? Conte com a gente!
            </h3>
            <p className="text-slate-300 text-xs sm:text-sm">
              Fale com um engenheiro e receba um atendimento rápido e personalizado.
            </p>
          </div>

          <button
            onClick={() => onOpenQuote()}
            className="px-8 py-4 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs uppercase tracking-widest rounded-xl shadow-lg shrink-0 transition-all"
          >
            FALE CONOSCO AGORA
          </button>
        </div>
      </section>

      {/* SERVICE DETAIL MODAL */}
      {selectedService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200 text-slate-800 my-8 max-h-[90vh] flex flex-col">
            
            <div className="bg-[#0A1128] text-white p-6 flex items-center justify-between border-b border-amber-500/30 shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-500/20 text-amber-400 rounded-lg">
                  {getServiceIcon(selectedService.iconName)}
                </div>
                <div>
                  <h3 className="text-lg font-serif font-bold text-white uppercase">
                    {selectedService.title}
                  </h3>
                  <p className="text-xs text-slate-400">{siteInfo.brandName} • {siteInfo.crea}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedService(null)}
                className="p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 sm:p-8 overflow-y-auto space-y-6">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Descrição do Serviço
                </h4>
                <p className="text-slate-700 text-sm leading-relaxed">
                  {selectedService.fullDesc}
                </p>
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Benefícios Diretos
                </h4>
                <ul className="space-y-2 text-xs text-slate-700">
                  {selectedService.benefits.map((b, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  O que você recebe (Entregáveis)
                </h4>
                <div className="flex flex-wrap gap-2">
                  {selectedService.deliverables.map((d, i) => (
                    <span key={i} className="px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-xs font-semibold">
                      • {d}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row gap-3 justify-end">
                <button
                  onClick={() => setSelectedService(null)}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs uppercase tracking-wider rounded-xl"
                >
                  Fechar
                </button>
                <button
                  onClick={() => {
                    const title = selectedService.title;
                    setSelectedService(null);
                    onOpenQuote(title);
                  }}
                  className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs uppercase tracking-wider rounded-xl shadow-md"
                >
                  Solicitar Orçamento Deste Serviço
                </button>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
};
