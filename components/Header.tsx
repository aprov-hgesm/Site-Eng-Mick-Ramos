'use client';

import React, { useState } from 'react';
import { Phone, Menu, X, MessageSquare, ChevronRight } from 'lucide-react';
import { useSiteData } from '@/lib/SiteContext';
import { MRLogo } from './MRLogo';

export type TabType = 'inicio' | 'sobre' | 'servicos' | 'projetos' | 'blog' | 'contato' | 'admin';

interface HeaderProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  onOpenQuote: () => void;
  selectedArticleId?: string | null;
  setSelectedArticleId?: (id: string | null) => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenQuote,
  setSelectedArticleId
}) => {
  const { siteInfo } = useSiteData();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems: { id: TabType; label: string }[] = [
    { id: 'inicio', label: 'INÍCIO' },
    { id: 'sobre', label: 'SOBRE' },
    { id: 'servicos', label: 'SERVIÇOS' },
    { id: 'projetos', label: 'PROJETOS' },
    { id: 'blog', label: 'BLOG' },
    { id: 'contato', label: 'CONTATO' },
    { id: 'admin', label: 'PAINEL ADMIN' },
  ];

  const handleNavClick = (tabId: TabType) => {
    setActiveTab(tabId);
    if (setSelectedArticleId) {
      setSelectedArticleId(null);
    }
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="sticky top-0 z-50 bg-[#0A1128] text-white shadow-xl border-b border-amber-500/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo & Branding */}
          <button
            onClick={() => handleNavClick('inicio')}
            className="flex items-center gap-3 text-left group focus:outline-none"
            id="brand-logo-btn"
          >
            <div className="h-12 px-2 bg-gradient-to-br from-[#0A1128] via-[#111C3A] to-[#0A1128] border-2 border-amber-500/60 rounded-xl flex items-center justify-center shadow-lg group-hover:border-amber-400 transition-all duration-300 max-w-[120px] overflow-hidden">
              {siteInfo.headerLogoUrl ? (
                <img
                  src={siteInfo.headerLogoUrl}
                  alt={siteInfo.brandName}
                  className="h-8 max-w-full object-contain"
                />
              ) : (
                <MRLogo className="h-8 w-auto" color="#F59E0B" />
              )}
            </div>
            <div className="flex flex-col justify-center">
              <span className="font-serif font-bold text-lg sm:text-xl tracking-wider text-white group-hover:text-amber-300 transition-colors">
                {siteInfo.brandName}
              </span>
              <div className="flex items-center gap-2 text-[10px] sm:text-xs text-slate-300 font-medium tracking-widest uppercase">
                <span>{siteInfo.role}</span>
                <span className="text-amber-500">•</span>
                <span className="text-amber-400/90">{siteInfo.crea}</span>
              </div>
            </div>
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1 xl:space-x-2" id="desktop-navbar">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  id={`nav-link-${item.id}`}
                  className={`relative px-3 py-2 text-xs xl:text-sm font-semibold tracking-wider transition-colors duration-200 ${
                    isActive
                      ? 'text-amber-400 font-bold'
                      : 'text-slate-200 hover:text-amber-300'
                  }`}
                >
                  {item.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-500 rounded-full animate-in fade-in zoom-in duration-200" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Action CTA Button */}
          <div className="hidden sm:flex items-center gap-3">
            <button
              onClick={onOpenQuote}
              id="header-cta-quote-btn"
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-amber-500/80 bg-amber-500/10 hover:bg-amber-500 hover:text-slate-950 text-amber-400 text-xs font-bold tracking-wider uppercase transition-all duration-300 shadow-sm hover:shadow-amber-500/20"
            >
              <MessageSquare className="w-4 h-4" />
              <span>FALE CONOSCO</span>
            </button>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="lg:hidden flex items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              id="mobile-menu-toggle-btn"
              className="p-2 rounded-md text-slate-300 hover:text-white hover:bg-slate-800 focus:outline-none"
              aria-label="Abrir menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6 text-amber-400" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#0D182E] border-t border-amber-500/20 px-4 pt-3 pb-6 space-y-2 animate-in slide-in-from-top duration-300">
          <div className="grid grid-cols-1 gap-1 py-2">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`flex items-center justify-between px-4 py-3 rounded-md text-sm font-semibold tracking-wider transition-all ${
                    isActive
                      ? 'bg-amber-500/15 text-amber-400 border-l-4 border-amber-500 font-bold'
                      : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                  }`}
                >
                  <span>{item.label}</span>
                  <ChevronRight className="w-4 h-4 opacity-50" />
                </button>
              );
            })}
          </div>

          <div className="pt-2 border-t border-slate-800 flex flex-col gap-2">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenQuote();
              }}
              className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs uppercase tracking-wider rounded-lg flex items-center justify-center gap-2 shadow-lg"
            >
              <Phone className="w-4 h-4" />
              <span>FALE CONOSCO / SOLICITAR ORÇAMENTO</span>
            </button>
            <a
              href={siteInfo.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider rounded-lg flex items-center justify-center gap-2 text-center"
            >
              <span>WHATSAPP DIRETO ({siteInfo.phone})</span>
            </a>
          </div>
        </div>
      )}
    </header>
  );
};
