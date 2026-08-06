'use client';

import React, { useState } from 'react';
import { 
  Phone, Mail, MapPin, Clock, MessageCircle, Send, CheckCircle2, 
  ShieldCheck, Upload, ExternalLink, HelpCircle 
} from 'lucide-react';
import { useSiteData } from '@/lib/SiteContext';

export const ContactView: React.FC = () => {
  const { siteInfo } = useSiteData();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [subject, setSubject] = useState('Vistoria Técnica / Laudo');
  const [message, setMessage] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [agreed, setAgreed] = useState(true);
  const [submitted, setSubmitted] = useState(false);

  const targetEmail = 'engcivilmickramos@gmail.com';

  const handleSendEmail = () => {
    const mailSubject = `[CONTATO - SITE] ${subject} - ${name}`;
    const mailBody = 
      `MENSAGEM DE CONTATO - MR ENGENHARIA CIVIL\n\n` +
      `-------------------------------------------\n` +
      `DADOS DO CONTATO:\n` +
      `Nome Completo: ${name}\n` +
      `E-mail do Cliente: ${email}\n` +
      `WhatsApp / Telefone: ${whatsapp}\n` +
      `Assunto: ${subject}\n\n` +
      `-------------------------------------------\n` +
      `MENSAGEM:\n${message}\n\n` +
      `-------------------------------------------\n` +
      `Mensagem padronizada enviada pelo site oficial da MR Engenharia.`;

    const mailtoUrl = `mailto:${targetEmail}?subject=${encodeURIComponent(mailSubject)}&body=${encodeURIComponent(mailBody)}`;
    window.location.href = mailtoUrl;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreed) {
      alert('Por favor, aceite os termos de privacidade para enviar.');
      return;
    }
    setSubmitted(true);
    handleSendEmail();
  };

  const handleSendWhatsApp = () => {
    const text = `*NOVA MENSAGEM VIA SITE - ${siteInfo.brandName}*\n\n` +
      `*Nome:* ${name}\n` +
      `*WhatsApp:* ${whatsapp}\n` +
      `*E-mail:* ${email || 'Não informado'}\n` +
      `*Assunto:* ${subject}\n` +
      `*Mensagem:* ${message}`;
    
    if (siteInfo.whatsappUrl && siteInfo.whatsappUrl.includes('wa.me')) {
      const baseUrl = siteInfo.whatsappUrl.split('?')[0];
      window.open(`${baseUrl}?text=${encodeURIComponent(text)}`, '_blank');
    } else {
      const cleanPhone = siteInfo.phone.replace(/\D/g, '');
      window.open(`https://wa.me/55${cleanPhone}?text=${encodeURIComponent(text)}`, '_blank');
    }
  };

  return (
    <div className="space-y-0 bg-white font-sans">

      {/* PAGE HEADER */}
      <section className="relative bg-[#0A1128] text-white py-16 px-4 sm:px-6 lg:px-8 border-b border-amber-500/20">
        <div className="max-w-7xl mx-auto space-y-6">
          
          <div className="text-xs text-amber-400 font-bold tracking-widest uppercase flex items-center gap-2">
            <span>INÍCIO</span>
            <span>/</span>
            <span className="text-white">CONTATO</span>
          </div>

          <div className="space-y-3 max-w-3xl">
            <h1 className="text-3xl sm:text-5xl font-serif font-bold text-white tracking-tight">
              Fale com a MR Engenharia
            </h1>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Estamos prontos para entender sua necessidade e oferecer a melhor solução em engenharia civil.
            </p>
          </div>

          {/* 4 Icon Badges */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-slate-800">
            <div className="flex items-center gap-2.5 text-xs font-semibold text-slate-300">
              <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Atendimento personalizado</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs font-semibold text-slate-300">
              <Clock className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Respostas rápidas</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs font-semibold text-slate-300">
              <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Confidencialidade garantida</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs font-semibold text-slate-300">
              <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Compromisso com resultados</span>
            </div>
          </div>

        </div>
      </section>

      {/* FORM & OTHER CONTACTS GRID */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* FORM COLUMN */}
          <div className="lg:col-span-7 bg-slate-50 p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            <div>
              <h2 className="text-2xl font-serif font-bold text-slate-900">
                Envie sua mensagem
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Preencha o formulário abaixo e nossa equipe entrará em contato o mais breve possível.
              </p>
            </div>

            {submitted ? (
              <div className="p-8 bg-white rounded-xl border border-emerald-200 text-center space-y-4">
                <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-serif font-bold text-slate-900">
                  Mensagem Enviada com Sucesso!
                </h3>
                <p className="text-xs text-slate-600 max-w-md mx-auto">
                  Obrigado, <strong className="text-slate-900">{name}</strong>. Sua mensagem foi formatada e direcionada para <strong>{targetEmail}</strong>.
                </p>

                <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 text-left space-y-2 max-w-lg mx-auto text-xs text-slate-700">
                  <div className="font-bold text-slate-900 text-sm border-b border-amber-200 pb-1 mb-2 flex justify-between items-center">
                    <span>Resumo da Mensagem:</span>
                    <span className="text-[11px] text-amber-800 font-normal">Destinatário: {targetEmail}</span>
                  </div>
                  <div>• <strong>Assunto:</strong> {subject}</div>
                  <div>• <strong>E-mail:</strong> {email}</div>
                  <div>• <strong>WhatsApp:</strong> {whatsapp}</div>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
                  <button
                    onClick={handleSendEmail}
                    className="px-5 py-3 bg-[#0A1128] hover:bg-slate-900 text-amber-400 font-bold text-xs uppercase tracking-wider rounded-xl inline-flex items-center justify-center gap-2 shadow-md transition-colors"
                  >
                    <Mail className="w-4 h-4" />
                    <span>Enviar por E-mail</span>
                  </button>
                  <button
                    onClick={handleSendWhatsApp}
                    className="px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl inline-flex items-center justify-center gap-2 shadow-md transition-colors"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Enviar via WhatsApp</span>
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Nome completo *
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Seu nome"
                      className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      E-mail *
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="seuemail@exemplo.com"
                      className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      WhatsApp *
                    </label>
                    <input
                      type="tel"
                      value={whatsapp}
                      onChange={(e) => setWhatsapp(e.target.value)}
                      placeholder="(86) 99927-0261"
                      className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Assunto *
                    </label>
                    <select
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                    >
                      <option value="Vistoria Técnica / Laudo">Vistoria Técnica / Laudo</option>
                      <option value="Regularização de Imóvel">Regularização de Imóvel</option>
                      <option value="Projeto de Engenharia">Projeto de Engenharia</option>
                      <option value="Emissão de ART">Emissão de ART</option>
                      <option value="PPCI / Bombeiros">PPCI / Bombeiros</option>
                      <option value="Outro Assunto">Outro Assunto</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Mensagem *
                  </label>
                  <textarea
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Descreva sua necessidade ou projeto..."
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Anexar arquivo (opcional)
                  </label>
                  <div className="flex items-center gap-3">
                    <label className="px-4 py-2 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-700 cursor-pointer hover:bg-slate-100 flex items-center gap-2">
                      <Upload className="w-4 h-4 text-amber-600" />
                      <span>{file ? file.name : 'Escolher arquivo'}</span>
                      <input
                        type="file"
                        onChange={(e) => setFile(e.target.files?.[0] || null)}
                        className="hidden"
                        accept=".pdf,.dwg,.jpg,.png"
                      />
                    </label>
                    <span className="text-[10px] text-slate-400">Máx. 10MB (PDF, DWG, JPG, PNG)</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="privacy-check"
                    checked={agreed}
                    onChange={(e) => setAgreed(e.target.checked)}
                    className="w-4 h-4 text-amber-600 rounded border-slate-300 focus:ring-amber-500"
                  />
                  <label htmlFor="privacy-check" className="text-xs text-slate-600">
                    Li e concordo com a Política de Privacidade.
                  </label>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 bg-[#0A1128] hover:bg-slate-900 text-amber-400 font-bold text-xs uppercase tracking-widest rounded-xl shadow-lg transition-colors flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>ENVIAR MENSAGEM</span>
                </button>
              </form>
            )}

          </div>

          {/* OTHER CONTACT FORMS COLUMN */}
          <div className="lg:col-span-5 space-y-6">
            
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
              <h3 className="font-serif font-bold text-slate-900 text-lg border-b border-slate-200 pb-3">
                Outras formas de contato
              </h3>

              <div className="space-y-4 text-xs">
                
                <a
                  href={siteInfo.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-3 p-3 rounded-xl hover:bg-emerald-50 transition-colors border border-slate-100"
                >
                  <div className="p-2.5 bg-emerald-100 text-emerald-700 rounded-lg shrink-0">
                    <MessageCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <strong className="text-slate-900 block font-bold text-sm">WhatsApp</strong>
                    <span className="text-slate-700 font-semibold">{siteInfo.phone}</span>
                    <p className="text-[11px] text-slate-500 mt-0.5">Atendimento rápido e direto.</p>
                  </div>
                </a>

                <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="p-2.5 bg-amber-500/10 text-amber-600 rounded-lg shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <strong className="text-slate-900 block font-bold text-sm">E-mail</strong>
                    <span className="text-slate-700 font-semibold break-all">{siteInfo.email}</span>
                    <p className="text-[11px] text-slate-500 mt-0.5">Envie sua solicitação por e-mail.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="p-2.5 bg-amber-500/10 text-amber-600 rounded-lg shrink-0">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <strong className="text-slate-900 block font-bold text-sm">Telefone</strong>
                    <span className="text-slate-700 font-semibold">{siteInfo.phone}</span>
                    <p className="text-[11px] text-slate-500 mt-0.5">Atendimento em horário comercial.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="p-2.5 bg-amber-500/10 text-amber-600 rounded-lg shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <strong className="text-slate-900 block font-bold text-sm">Endereço</strong>
                    <span className="text-slate-700 font-semibold">{siteInfo.address}</span>
                    <p className="text-[11px] text-slate-500 mt-0.5">Atendemos {siteInfo.cityRegion}.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="p-2.5 bg-amber-500/10 text-amber-600 rounded-lg shrink-0">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <strong className="text-slate-900 block font-bold text-sm">Horário de atendimento</strong>
                    <span className="text-slate-700 font-semibold">{siteInfo.hours}</span>
                  </div>
                </div>

              </div>
            </div>

            {/* ONDE ESTAMOS MAP BOX */}
            <div className="bg-[#0A1128] text-white p-6 rounded-2xl border border-amber-500/30 space-y-4">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
                <MapPin className="w-4 h-4" />
                <span>Onde estamos</span>
              </div>
              <p className="text-xs text-slate-300">
                Estamos localizados no centro de Parnaíba - PI, com fácil acesso e estacionamento próximo.
              </p>
              <div className="h-32 bg-slate-900 rounded-xl overflow-hidden relative border border-slate-800 flex items-center justify-center text-center p-4">
                <img
                  src="https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&w=600&q=80"
                  alt="Mapa Parnaíba PI"
                  className="w-full h-full object-cover opacity-40 absolute inset-0"
                />
                <span className="relative z-10 text-xs font-bold text-amber-300 bg-slate-950/80 px-3 py-1.5 rounded-lg border border-amber-500/30">
                  📍 Parnaíba - PI (Av. São Sebastião, 1234)
                </span>
              </div>
              <a
                href="https://maps.google.com/?q=Parnaiba+Piaui"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 transition-colors"
              >
                <span>VER NO GOOGLE MAPS</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

          </div>

        </div>
      </section>

      {/* WHY CONTACT US GRID */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-slate-50 border-t border-slate-200">
        <div className="max-w-7xl mx-auto space-y-8">
          
          <div className="text-center space-y-2">
            <h3 className="text-2xl font-serif font-bold text-slate-900">
              Por que entrar em contato conosco?
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2">
              <h4 className="font-serif font-bold text-slate-900 text-sm">Atendimento especializado</h4>
              <p className="text-slate-600 text-xs leading-relaxed">
                Entendemos sua necessidade e indicamos a melhor solução técnica sem enrolação.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2">
              <h4 className="font-serif font-bold text-slate-900 text-sm">Experiência e segurança</h4>
              <p className="text-slate-600 text-xs leading-relaxed">
                Projetos e serviços com responsabilidade técnica e conformidade normativa.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2">
              <h4 className="font-serif font-bold text-slate-900 text-sm">Soluções completas</h4>
              <p className="text-slate-600 text-xs leading-relaxed">
                Do projeto à execução, oferecemos suporte em todas as etapas da sua obra.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2">
              <h4 className="font-serif font-bold text-slate-900 text-sm">Compromisso com resultados</h4>
              <p className="text-slate-600 text-xs leading-relaxed">
                Nosso objetivo é entregar qualidade, eficiência e tranquilidade para você.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* BOTTOM CALLOUT */}
      <section className="py-14 px-4 sm:px-6 lg:px-8 bg-[#0A1128] text-white">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          <div className="space-y-1">
            <h3 className="text-2xl font-serif font-bold text-white">
              Vamos tirar seu projeto do papel?
            </h3>
            <p className="text-slate-300 text-xs sm:text-sm">
              Conte com a experiência e responsabilidade técnica da MR Engenharia.
            </p>
          </div>

          <a
            href={siteInfo.whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-widest rounded-xl shadow-lg shrink-0 transition-all flex items-center justify-center gap-2"
          >
            <MessageCircle className="w-4 h-4" />
            <span>FALE CONOSCO AGORA</span>
          </a>
        </div>
      </section>

    </div>
  );
};
