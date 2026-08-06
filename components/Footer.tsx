'use client';

import React from 'react';
import { Phone, Mail, MapPin, Clock, Instagram, Linkedin, MessageCircle } from 'lucide-react';
import { useSiteData } from '@/lib/SiteContext';
import { TabType } from './Header';
import { MRLogo } from './MRLogo';

interface FooterProps {
  setActiveTab: (tab: TabType) => void;
  onOpenQuote: () => void;
}

export const Footer: React.FC<FooterProps> = ({ setActiveTab, onOpenQuote }) => {
  const { siteInfo } = useSiteData();

  const handleNavClick = (tab: TabType) => {
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-[#070D1E] text-slate-300 border-t border-slate-800 font-sans">
      
      {/* Upper Footer CTA Strip */}
      <div className="bg-[#0A1128] border-b border-slate-800/80 py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4 text-center md:text-left">
            <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-full text-amber-400 hidden sm:block">
              <MessageCircle className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-xl sm:text-2xl font-serif font-bold text-white">
                Ficou com alguma dúvida?
              </h3>
              <p className="text-slate-400 text-sm mt-1">
                Fale com um engenheiro e receba orientação técnica personalizada.
              </p>
            </div>
          </div>
          <button
            onClick={onOpenQuote}
            id="footer-quote-cta-btn"
            className="px-6 py-3.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs uppercase tracking-widest rounded-lg flex items-center gap-2 shadow-lg shadow-amber-500/10 transition-all transform hover:-translate-y-0.5"
          >
            <Phone className="w-4 h-4" />
            <span>FALE CONOSCO AGORA</span>
          </button>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          
          {/* Brand Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-10 px-2 bg-amber-500/10 border border-amber-500/50 rounded-lg flex items-center justify-center max-w-[100px] overflow-hidden">
                {siteInfo.footerLogoUrl || siteInfo.headerLogoUrl ? (
                  <img
                    src={siteInfo.footerLogoUrl || siteInfo.headerLogoUrl}
                    alt={siteInfo.brandName}
                    className="h-6 max-w-full object-contain"
                  />
                ) : (
                  <MRLogo className="h-6 w-auto" color="#F59E0B" />
                )}
              </div>
              <div>
                <h4 className="font-serif font-bold text-white text-lg leading-tight">{siteInfo.brandName}</h4>
                <p className="text-[10px] text-amber-400 uppercase tracking-widest">{siteInfo.role} • {siteInfo.crea}</p>
              </div>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              {siteInfo.tagline}
            </p>
            <div className="flex items-center gap-3 pt-2">
              <a
                href={siteInfo.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-slate-800 hover:bg-emerald-600 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
                aria-label="WhatsApp"
              >
                <MessageCircle className="w-4 h-4" />
              </a>
              <a
                href="#"
                className="w-9 h-9 rounded-full bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-slate-300 flex items-center justify-center transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="#"
                className="w-9 h-9 rounded-full bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-slate-300 flex items-center justify-center transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Navigation Links */}
          <div>
            <h5 className="font-serif font-bold text-white text-sm tracking-wider uppercase border-b border-amber-500/30 pb-2 mb-4">
              NAVEGAÇÃO
            </h5>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => handleNavClick('inicio')} className="hover:text-amber-400 transition-colors">
                  Início
                </button>
              </li>
              <li>
                <button onClick={() => handleNavClick('sobre')} className="hover:text-amber-400 transition-colors">
                  Sobre
                </button>
              </li>
              <li>
                <button onClick={() => handleNavClick('servicos')} className="hover:text-amber-400 transition-colors">
                  Serviços
                </button>
              </li>
              <li>
                <button onClick={() => handleNavClick('projetos')} className="hover:text-amber-400 transition-colors">
                  Projetos
                </button>
              </li>
              <li>
                <button onClick={() => handleNavClick('blog')} className="hover:text-amber-400 transition-colors">
                  Blog
                </button>
              </li>
              <li>
                <button onClick={() => handleNavClick('contato')} className="hover:text-amber-400 transition-colors">
                  Contato
                </button>
              </li>
              <li>
                <button onClick={() => handleNavClick('admin')} className="text-amber-400 hover:text-amber-300 font-bold transition-colors">
                  🔒 Painel Admin
                </button>
              </li>
            </ul>
          </div>

          {/* Services Column */}
          <div>
            <h5 className="font-serif font-bold text-white text-sm tracking-wider uppercase border-b border-amber-500/30 pb-2 mb-4">
              SERVIÇOS
            </h5>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>Vistorias e Laudos Técnicos</li>
              <li>Projetos de Engenharia Civil</li>
              <li>Regularização de Imóveis & Habite-se</li>
              <li>Emissão de ART (CREA-PI)</li>
              <li>PPCI e Combate a Incêndio</li>
              <li>Acompanhamento e Gestão de Obras</li>
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h5 className="font-serif font-bold text-white text-sm tracking-wider uppercase border-b border-amber-500/30 pb-2 mb-4">
              CONTATO
            </h5>
            <ul className="space-y-3 text-xs">
              <li className="flex items-start gap-2.5">
                <Phone className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>{siteInfo.phone}</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Mail className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span className="break-all">{siteInfo.email}</span>
              </li>
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>{siteInfo.address}</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>{siteInfo.hours}</span>
              </li>
            </ul>

          </div>

        </div>
      </div>

      {/* Bottom Legal Bar */}
      <div className="bg-[#040813] py-6 border-t border-slate-800/80 text-slate-500 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
          <p>© 2024 {siteInfo.brandName}. Todos os direitos reservados.</p>
          <div className="flex items-center gap-4 text-amber-400/80 font-mono text-[11px]">
            <span>{siteInfo.crea}</span>
          </div>
          <p>Desenvolvido com propósito e excelência técnica.</p>
        </div>
      </div>

    </footer>
  );
};
