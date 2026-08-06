'use client';

import React, { useState } from 'react';
import { X, CheckCircle2, Send, Building, ShieldCheck, FileCheck2, Calculator } from 'lucide-react';
import { useSiteData } from '@/lib/SiteContext';

interface QuoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultService?: string;
}

export const QuoteModal: React.FC<QuoteModalProps> = ({
  isOpen,
  onClose,
  defaultService
}) => {
  const { siteInfo, services } = useSiteData();
  const [service, setService] = useState(defaultService || (services.length > 0 ? services[0].title : 'VISTORIAS TÉCNICAS'));
  const [propertyType, setPropertyType] = useState('Residencial');
  const [areaSize, setAreaSize] = useState('150');
  const [location, setLocation] = useState('Parnaíba - PI');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [details, setDetails] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const handleSendWhatsApp = () => {
    const text = `*SOLICITAÇÃO DE ORÇAMENTO - ${siteInfo.brandName}*\n\n` +
      `*Nome:* ${name}\n` +
      `*WhatsApp:* ${phone}\n` +
      `*E-mail:* ${email || 'Não informado'}\n` +
      `*Serviço:* ${service}\n` +
      `*Tipo de Imóvel:* ${propertyType}\n` +
      `*Área Aprox.:* ${areaSize} m²\n` +
      `*Localização:* ${location}\n` +
      `*Observações:* ${details || 'Nenhuma'}`;
    
    if (siteInfo.whatsappUrl && siteInfo.whatsappUrl.includes('wa.me')) {
      const baseUrl = siteInfo.whatsappUrl.split('?')[0];
      window.open(`${baseUrl}?text=${encodeURIComponent(text)}`, '_blank');
    } else {
      const cleanPhone = siteInfo.phone.replace(/\D/g, '');
      window.open(`https://wa.me/55${cleanPhone}?text=${encodeURIComponent(text)}`, '_blank');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200 text-slate-800 my-8 max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="bg-[#0A1128] text-white p-6 sm:p-8 flex items-center justify-between border-b border-amber-500/30 shrink-0">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-amber-500/20 text-amber-400 text-xs font-bold uppercase tracking-wider mb-2">
              <Calculator className="w-3.5 h-3.5" />
              <span>Avaliação Técnica & Orçamento</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-serif font-bold text-white">
              Solicitar Orçamento Personalizado
            </h3>
            <p className="text-xs text-slate-300 mt-1">
              Fale diretamente com o Engenheiro Mick Ramos (CREA 1920983666).
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            aria-label="Fechar"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6">
          {submitted ? (
            <div className="text-center py-8 space-y-4">
              <div className="w-16 h-16 bg-emerald-100 border-2 border-emerald-500 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h4 className="text-2xl font-serif font-bold text-slate-900">
                Solicitação Recebida com Sucesso!
              </h4>
              <p className="text-sm text-slate-600 max-w-md mx-auto">
                Obrigado, <strong className="text-slate-900">{name}</strong>. Recebemos os dados do seu imóvel e entraremos em contato rapidamente para enviar a proposta.
              </p>
              
              <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 text-left space-y-2 max-w-lg mx-auto text-xs text-slate-700">
                <div className="font-bold text-slate-900 text-sm border-b border-amber-200 pb-1 mb-2">
                  Resumo da Solicitação:
                </div>
                <div>• <strong>Serviço:</strong> {service}</div>
                <div>• <strong>Imóvel:</strong> {propertyType} (~{areaSize} m²)</div>
                <div>• <strong>Cidade:</strong> {location}</div>
              </div>

              <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={handleSendWhatsApp}
                  className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20"
                >
                  <Send className="w-4 h-4" />
                  <span>Enviar Agora no WhatsApp</span>
                </button>
                <button
                  onClick={() => {
                    setSubmitted(false);
                    onClose();
                  }}
                  className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs uppercase tracking-wider rounded-xl"
                >
                  Fechar Janela
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Tipo de Serviço *
                  </label>
                  <select
                    value={service}
                    onChange={(e) => setService(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 bg-slate-50 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                    required
                  >
                    {services.map((s) => (
                      <option key={s.id} value={s.title}>
                        {s.title}
                      </option>
                    ))}
                    <option value="Outro Serviço de Engenharia">Outro Serviço Especializado</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Tipo de Imóvel
                  </label>
                  <select
                    value={propertyType}
                    onChange={(e) => setPropertyType(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 bg-slate-50 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="Residencial (Casa / Ap)">Residencial (Casa / Ap)</option>
                    <option value="Comercial / Loja">Comercial / Loja</option>
                    <option value="Industrial / Galpão">Industrial / Galpão</option>
                    <option value="Terreno / Lote">Terreno / Lote</option>
                    <option value="Obra em Andamento">Obra em Andamento</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Área Aproximada (m²)
                  </label>
                  <input
                    type="number"
                    value={areaSize}
                    onChange={(e) => setAreaSize(e.target.value)}
                    placeholder="Ex: 150"
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 bg-slate-50 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Cidade / Região *
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Ex: Parnaíba - PI"
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 bg-slate-50 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                    required
                  />
                </div>
              </div>

              <hr className="border-slate-200" />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Seu Nome Completo *
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Digite seu nome"
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 bg-slate-50 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    WhatsApp / Telefone *
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="(86) 99999-9999"
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 bg-slate-50 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  E-mail (opcional)
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seuemail@exemplo.com"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 bg-slate-50 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Detalhes do Projeto ou Dúvida
                </label>
                <textarea
                  rows={3}
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  placeholder="Descreva brevemente o que precisa (ex: preciso regularizar minha casa, fazer vistoria de laudo de infiltração, etc.)"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 bg-slate-50 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Sigilo garantido e sem compromisso.</span>
                </div>

                <button
                  type="submit"
                  className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs uppercase tracking-widest rounded-xl shadow-md transition-all"
                >
                  SOLICITAR PROPOSTA
                </button>
              </div>

            </form>
          )}
        </div>

      </div>
    </div>
  );
};
