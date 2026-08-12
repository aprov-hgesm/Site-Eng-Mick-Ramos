'use client';

import React from 'react';
import { 
  ShieldCheck, Target, Compass, HardHat, Users, Award, MapPin, 
  ArrowRight, FolderCheck, Building2, FileCheck2, Sparkles, CheckCircle2,
  Star, Quote, Search, FileText, Flame, Box
} from 'lucide-react';
import { SITE_INFO, SERVICES, Project } from '@/lib/siteData';
import { useSiteData } from '@/lib/SiteContext';
import { TabType } from '../Header';

interface HomeViewProps {
  setActiveTab: (tab: TabType) => void;
  onOpenQuote: () => void;
  onSelectProject: (project: Project) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  setActiveTab,
  onOpenQuote,
  onSelectProject
}) => {
  const { projects, services, siteInfo } = useSiteData();
  const featuredProjects = projects.slice(0, 4);
  const featuredServices = services.slice(0, 4);

  const testimonials = [
    {
      name: 'Carlos Eduardo M.',
      role: 'Proprietário Residencial',
      location: 'Parnaíba - PI',
      text: 'O laudo técnico e o acompanhamento do Eng. Mick Ramos foram essenciais para garantir a segurança na ampliação do nosso imóvel. Atendimento ágil e com extremo rigor profissional.',
      stars: 5,
    },
    {
      name: 'Dra. Vanessa Alencar',
      role: 'Diretora Clínica',
      location: 'Luís Correia - PI',
      text: 'A regularização do prédio comercial e o Habite-se foram concluídos dentro do prazo prometido e com toda transparência. Recomendo fortemente a MR Engenharia.',
      stars: 5,
    },
    {
      name: 'Marcos Vinícius S.',
      role: 'Investidor Imobiliário',
      location: 'Parnaíba - PI',
      text: 'O projeto estrutural e a compatibilização BIM economizaram mais de 15% em materiais durante a fase de fundação. Solução técnica impecável.',
      stars: 5,
    },
  ];

  return (
    <div className="space-y-0">

      {/* HERO SECTION */}
      <section className="relative bg-[#0A1128] text-white py-16 sm:py-24 overflow-hidden border-b border-amber-500/20">
        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#C59B27_1px,transparent_1px)] [background-size:24px_24px]" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Column Text */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold tracking-widest uppercase">
                <Sparkles className="w-3.5 h-3.5" />
                <span>ENGENHARIA COM PROPÓSITO</span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-serif font-bold text-white tracking-tight leading-[1.15]">
                Projetos inteligentes para construir com <span className="text-amber-400">segurança</span>, eficiência e qualidade.
              </h1>

              <p className="text-slate-300 text-base sm:text-lg font-normal leading-relaxed max-w-2xl mx-auto lg:mx-0">
                Soluções completas em engenharia e projetos para transformar ideias em realidade com responsabilidade técnica e excelência.
              </p>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <button
                  onClick={onOpenQuote}
                  id="hero-quote-btn"
                  className="w-full sm:w-auto px-7 py-4 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs uppercase tracking-widest rounded-xl shadow-lg shadow-amber-500/20 transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
                >
                  <span>SOLICITE UM ORÇAMENTO</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    setActiveTab('servicos');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  id="hero-services-btn"
                  className="w-full sm:w-auto px-7 py-4 bg-slate-900/80 hover:bg-slate-800 text-white border border-slate-700 font-bold text-xs uppercase tracking-widest rounded-xl transition-all flex items-center justify-center"
                >
                  <span>CONHEÇA NOSSOS SERVIÇOS</span>
                </button>
              </div>

              <div className="pt-4 flex items-center justify-center lg:justify-start gap-6 text-xs text-slate-400 font-medium">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-amber-400" />
                  Registro CREA-PI
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-amber-400" />
                  Atendimento em Parnaíba e Região
                </span>
              </div>
            </div>

            {/* Right Column Image Frame */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border-2 border-amber-500/30 group">
                <img
                  src={siteInfo.heroImageUrl || "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1000&q=80"}
                  alt="Engenharia e Arquitetura MR"
                  className="w-full h-[400px] sm:h-[480px] object-cover transform group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A1128] via-transparent to-transparent opacity-80" />
                <div className="absolute bottom-6 left-6 right-6 p-4 rounded-xl bg-slate-950/80 backdrop-blur-md border border-amber-500/30 text-white">
                  <p className="text-xs font-bold text-amber-400 uppercase tracking-widest">
                    {siteInfo.heroImageTag || 'Parnaíba • Litoral Piauiense'}
                  </p>
                  <p className="text-sm font-serif font-bold text-white mt-0.5">
                    {siteInfo.heroImageTitle || 'Residência Unifamiliar de Alto Padrão'}
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 5 VALUE PILLARS BAR */}
      <section className="bg-slate-100 border-b border-slate-200 py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            
            <div className="flex items-start gap-3.5 p-4 rounded-xl bg-white shadow-sm border border-slate-200/80">
              <div className="p-2.5 bg-amber-500/10 text-amber-600 rounded-lg shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-serif font-bold text-slate-900 text-xs uppercase tracking-wider">SEGURANÇA</h4>
                <p className="text-slate-600 text-[11px] mt-1 leading-snug">Responsabilidade técnica em cada etapa do projeto.</p>
              </div>
            </div>

            <div className="flex items-start gap-3.5 p-4 rounded-xl bg-white shadow-sm border border-slate-200/80">
              <div className="p-2.5 bg-amber-500/10 text-amber-600 rounded-lg shrink-0">
                <Target className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-serif font-bold text-slate-900 text-xs uppercase tracking-wider">PRECISÃO</h4>
                <p className="text-slate-600 text-[11px] mt-1 leading-snug">Projetos detalhados para evitar erros e retrabalhos.</p>
              </div>
            </div>

            <div className="flex items-start gap-3.5 p-4 rounded-xl bg-white shadow-sm border border-slate-200/80">
              <div className="p-2.5 bg-amber-500/10 text-amber-600 rounded-lg shrink-0">
                <Compass className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-serif font-bold text-slate-900 text-xs uppercase tracking-wider">PLANEJAMENTO</h4>
                <p className="text-slate-600 text-[11px] mt-1 leading-snug">Soluções inteligentes que otimizam tempo e custos.</p>
              </div>
            </div>

            <div className="flex items-start gap-3.5 p-4 rounded-xl bg-white shadow-sm border border-slate-200/80">
              <div className="p-2.5 bg-amber-500/10 text-amber-600 rounded-lg shrink-0">
                <HardHat className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-serif font-bold text-slate-900 text-xs uppercase tracking-wider">EXPERIÊNCIA</h4>
                <p className="text-slate-600 text-[11px] mt-1 leading-snug">Conhecimento técnico com foco em resultados.</p>
              </div>
            </div>

            <div className="flex items-start gap-3.5 p-4 rounded-xl bg-white shadow-sm border border-slate-200/80 sm:col-span-2 lg:col-span-1">
              <div className="p-2.5 bg-amber-500/10 text-amber-600 rounded-lg shrink-0">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-serif font-bold text-slate-900 text-xs uppercase tracking-wider">ATENDIMENTO</h4>
                <p className="text-slate-600 text-[11px] mt-1 leading-snug">Proximidade e suporte em todas as etapas.</p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* QUEM SOMOS SECTION */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 text-amber-600 font-mono text-xs font-bold uppercase tracking-widest">
                <span>QUEM SOMOS</span>
                <span className="w-8 h-px bg-amber-500" />
              </div>

              <h2 className="text-3xl sm:text-4xl font-serif font-bold text-slate-900 leading-tight">
                Compromisso técnico do projeto à execução.
              </h2>

              <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                A MR Engenharia oferece soluções completas em projetos, consultorias e serviços técnicos, sempre com foco na segurança, na qualidade e na satisfação dos nossos clientes. Atuamos com responsabilidade, transparência e excelência para garantir que cada obra seja sinônimo de confiança e resultado.
              </p>

              <div className="pt-2">
                <button
                  onClick={() => {
                    setActiveTab('sobre');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  id="about-learn-more-btn"
                  className="px-6 py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-widest rounded-xl transition-colors inline-flex items-center gap-2 shadow-md"
                >
                  <span>CONHEÇA NOSSA HISTÓRIA</span>
                  <ArrowRight className="w-4 h-4 text-amber-400" />
                </button>
              </div>
            </div>

            {/* Right side: Image + Dark Service Summary Card */}
            <div className="lg:col-span-5 grid grid-cols-1 gap-6">
              <div className="relative rounded-2xl overflow-hidden shadow-lg border border-slate-200">
                <img
                  src={siteInfo.homeAboutImageUrl || "https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=800&q=80"}
                  alt="Capacete de Engenharia e Planta Baixa"
                  className="w-full h-56 object-cover"
                />
              </div>

              {/* Dark Navy Service Highlights Card */}
              <div className="p-6 rounded-2xl bg-[#0A1128] text-white border border-amber-500/30 shadow-xl space-y-4">
                <div className="border-b border-amber-500/20 pb-3">
                  <h4 className="font-serif font-bold text-amber-400 text-sm uppercase tracking-wider">
                    PRINCIPAIS ATUAÇÕES
                  </h4>
                </div>

                <ul className="space-y-3 text-xs text-slate-300">
                  <li className="flex items-start gap-2.5">
                    <Building2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-white block font-semibold">PROJETOS:</strong>
                      <span>Residenciais, comerciais e industriais.</span>
                    </div>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <FileCheck2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-white block font-semibold">VISTORIAS E LAUDOS:</strong>
                      <span>Diagnósticos precisos e confiáveis.</span>
                    </div>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-white block font-semibold">REGULARIZAÇÃO:</strong>
                      <span>Habite-se, averbação, documentação.</span>
                    </div>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <HardHat className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-white block font-semibold">ACOMPANHAMENTO:</strong>
                      <span>Gestão e fiscalização técnica de obras.</span>
                    </div>
                  </li>
                </ul>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* FEATURED SERVICES SECTION */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 text-amber-600 font-mono text-xs font-bold uppercase tracking-widest mb-2">
                <span>SOLUÇÕES DE ENGENHARIA</span>
                <span className="w-8 h-px bg-amber-500" />
              </div>
              <h2 className="text-3xl sm:text-4xl font-serif font-bold text-slate-900">
                Nossos Serviços em Destaque
              </h2>
            </div>

            <button
              onClick={() => {
                setActiveTab('servicos');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center gap-2 self-start md:self-auto"
            >
              <span>TODOS OS SERVIÇOS</span>
              <ArrowRight className="w-4 h-4 text-amber-400" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredServices.map((s) => (
              <div
                key={s.id}
                className="group p-6 rounded-2xl bg-slate-50 border border-slate-200 hover:bg-white hover:border-amber-500/40 hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-600 group-hover:bg-amber-500 group-hover:text-slate-950 transition-colors">
                    {s.iconName === 'Search' && <Search className="w-6 h-6" />}
                    {s.iconName === 'FileText' && <FileText className="w-6 h-6" />}
                    {s.iconName === 'Building2' && <Building2 className="w-6 h-6" />}
                    {s.iconName === 'FileCheck' && <FileCheck2 className="w-6 h-6" />}
                    {s.iconName === 'HardHat' && <HardHat className="w-6 h-6" />}
                    {s.iconName === 'Compass' && <Compass className="w-6 h-6" />}
                    {s.iconName === 'Flame' && <Flame className="w-6 h-6" />}
                    {s.iconName === 'Box' && <Box className="w-6 h-6" />}
                  </div>

                  <h3 className="font-serif font-bold text-slate-900 text-base uppercase tracking-wide group-hover:text-amber-600 transition-colors">
                    {s.title}
                  </h3>

                  <p className="text-slate-600 text-xs leading-relaxed line-clamp-3">
                    {s.shortDesc}
                  </p>
                </div>

                <div className="pt-6">
                  <button
                    onClick={() => {
                      setActiveTab('servicos');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-600 group-hover:translate-x-1 transition-transform"
                  >
                    <span>SAIBA MAIS</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED PROJECTS SECTION */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto space-y-12">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 text-amber-600 font-mono text-xs font-bold uppercase tracking-widest mb-2">
                <span>PROJETOS QUE GERAM VALOR</span>
                <span className="w-8 h-px bg-amber-500" />
              </div>
              <h2 className="text-3xl sm:text-4xl font-serif font-bold text-slate-900">
                Conheça alguns dos projetos desenvolvidos.
              </h2>
            </div>

            <button
              onClick={() => {
                setActiveTab('projetos');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="px-6 py-3 bg-white hover:bg-slate-100 text-slate-900 border border-slate-300 font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-sm flex items-center gap-2 self-start md:self-auto"
            >
              <span>VER PORTFÓLIO COMPLETO</span>
              <ArrowRight className="w-4 h-4 text-amber-600" />
            </button>
          </div>

          {/* Grid of 4 Featured Projects */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProjects.map((p) => (
              <div
                key={p.id}
                onClick={() => onSelectProject(p)}
                className="group cursor-pointer bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="relative h-48 overflow-hidden bg-slate-900">
                    <img
                      src={p.image}
                      alt={p.title}
                      className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3 bg-slate-950/80 text-amber-400 font-bold text-[10px] uppercase px-2.5 py-1 rounded-md tracking-wider border border-amber-500/30">
                      {p.categoryLabel}
                    </div>
                  </div>

                  <div className="p-5 space-y-2">
                    <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-amber-600" />
                      {p.location}
                    </span>
                    <h3 className="font-serif font-bold text-slate-900 text-base group-hover:text-amber-600 transition-colors line-clamp-2">
                      {p.title}
                    </h3>
                  </div>
                </div>

                <div className="px-5 pb-5 pt-2">
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-600 group-hover:translate-x-1 transition-transform">
                    <span>VER DETALHES</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* STATS BAR SECTION */}
      <section className="bg-[#0A1128] text-white py-14 px-4 sm:px-6 lg:px-8 border-b border-amber-500/20">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            
            <div className="space-y-1">
              <div className="text-3xl sm:text-5xl font-serif font-bold text-amber-400">
                +150
              </div>
              <div className="text-xs sm:text-sm font-medium text-slate-300">
                Clientes atendidos
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-3xl sm:text-5xl font-serif font-bold text-amber-400">
                +250
              </div>
              <div className="text-xs sm:text-sm font-medium text-slate-300">
                Projetos desenvolvidos
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-3xl sm:text-5xl font-serif font-bold text-amber-400">
                +8
              </div>
              <div className="text-xs sm:text-sm font-medium text-slate-300">
                Anos de experiência
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-xl sm:text-2xl font-serif font-bold text-amber-400 pt-2">
                Parnaíba e região
              </div>
              <div className="text-xs sm:text-sm font-medium text-slate-300">
                Atuação no Piauí
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* CLIENT TESTIMONIALS SECTION */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-900 text-white border-b border-amber-500/20">
        <div className="max-w-7xl mx-auto space-y-12">
          
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-2 text-amber-400 font-mono text-xs font-bold uppercase tracking-widest">
              <Sparkles className="w-3.5 h-3.5" />
              <span>O QUE DIZEM NOSSOS CLIENTES</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-white">
              Depoimentos de quem confia no nosso trabalho
            </h2>
            <p className="text-slate-400 text-sm">
              Satisfação garantida em projetos residenciais, laudos periciais e regularizações em Parnaíba e região.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((item, idx) => (
              <div
                key={idx}
                className="bg-[#0A1128] p-8 rounded-2xl border border-amber-500/20 shadow-xl relative flex flex-col justify-between hover:border-amber-500/50 transition-colors"
              >
                <Quote className="w-10 h-10 text-amber-500/20 absolute top-6 right-6" />
                
                <div className="space-y-4 relative z-10">
                  <div className="flex items-center gap-1 text-amber-400">
                    {[...Array(item.stars)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-slate-300 text-sm leading-relaxed italic">
                    &ldquo;{item.text}&rdquo;
                  </p>
                </div>

                <div className="pt-6 border-t border-slate-800 mt-6 space-y-0.5">
                  <span className="font-serif font-bold text-white text-base block">{item.name}</span>
                  <span className="text-xs text-amber-400 font-medium block">{item.role}</span>
                  <span className="text-[11px] text-slate-400 block">{item.location}</span>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* BOTTOM CALLOUT BANNER */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-amber-500 text-slate-950 font-sans">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          <div className="space-y-2">
            <h3 className="text-2xl sm:text-3xl font-serif font-bold text-slate-950">
              VAMOS TRANSFORMAR SEU PROJETO EM REALIDADE?
            </h3>
            <p className="text-slate-900 text-sm font-medium">
              Entre em contato e solicite um orçamento sem compromisso.
            </p>
          </div>

          <button
            onClick={onOpenQuote}
            className="px-8 py-4 bg-slate-950 hover:bg-slate-900 text-amber-400 font-bold text-xs uppercase tracking-widest rounded-xl shadow-2xl transition-all shrink-0"
          >
            FALE CONOSCO AGORA
          </button>
        </div>
      </section>

    </div>
  );
};
