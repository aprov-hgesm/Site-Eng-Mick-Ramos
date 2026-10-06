'use client';

import React, { useMemo, useState } from 'react';
import { Plus, Trash2, ArrowUp, ArrowDown, Save, FileText, Image as ImageIcon, Eye, LogOut, CheckCircle2 } from 'lucide-react';
import { useSiteData } from '@/lib/SiteContext';
import { BLOG_CATEGORIES, BlogPost } from '@/lib/siteData';
import { auth } from '@/lib/firebase';

type Section = { title: string; text: string };

type EditorForm = {
  title: string;
  category: string;
  author: string;
  date: string;
  readTime: string;
  image: string;
  excerpt: string;
  intro: string;
  sections: Section[];
  warningBox: string;
  conclusion: string;
};

const defaultImage = 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=1200&q=80';

const emptyForm = (): EditorForm => ({
  title: '',
  category: 'vistorias',
  author: 'Eng. Mick Ramos',
  date: new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }),
  readTime: '5 min de leitura',
  image: defaultImage,
  excerpt: '',
  intro: '',
  sections: [{ title: '', text: '' }],
  warningBox: '',
  conclusion: '',
});

const splitParagraphs = (value: string) => value.split(/\n\s*\n/).map((item) => item.trim()).filter(Boolean);

export const BlogEditorView: React.FC = () => {
  const { blogPosts, addBlogPost, updateBlogPost, deleteBlogPost, siteInfo } = useSiteData();
  const [form, setForm] = useState<EditorForm>(emptyForm());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);

  const selectedCategoryLabel = useMemo(
    () => BLOG_CATEGORIES.find((category) => category.id === form.category)?.label || 'Geral',
    [form.category],
  );

  const updateForm = <K extends keyof EditorForm>(key: K, value: EditorForm[K]) => {
    setForm((previous) => ({ ...previous, [key]: value }));
  };

  const updateSection = (index: number, key: keyof Section, value: string) => {
    setForm((previous) => ({
      ...previous,
      sections: previous.sections.map((section, sectionIndex) =>
        sectionIndex === index ? { ...section, [key]: value } : section,
      ),
    }));
  };

  const addSection = () => {
    setForm((previous) => ({
      ...previous,
      sections: [...previous.sections, { title: '', text: '' }],
    }));
  };

  const removeSection = (index: number) => {
    setForm((previous) => ({
      ...previous,
      sections: previous.sections.length === 1 ? previous.sections : previous.sections.filter((_, i) => i !== index),
    }));
  };

  const moveSection = (index: number, direction: -1 | 1) => {
    setForm((previous) => {
      const target = index + direction;
      if (target < 0 || target >= previous.sections.length) return previous;
      const sections = [...previous.sections];
      [sections[index], sections[target]] = [sections[target], sections[index]];
      return { ...previous, sections };
    });
  };

  const startNew = () => {
    setEditingId(null);
    setForm(emptyForm());
    setMessage('Novo artigo iniciado.');
  };

  const editPost = (post: BlogPost) => {
    setEditingId(post.id);
    setForm({
      title: post.title,
      category: post.category,
      author: post.author,
      date: post.date,
      readTime: post.readTime,
      image: post.image || defaultImage,
      excerpt: post.excerpt,
      intro: post.content?.intro || '',
      sections: post.content?.points?.length ? post.content.points.map((point) => ({ title: point.title, text: point.text })) : [{ title: '', text: '' }],
      warningBox: post.content?.warningBox || '',
      conclusion: post.content?.conclusion || '',
    });
    setMessage(`Editando: ${post.title}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const saveArticle = async (event: React.FormEvent) => {
    event.preventDefault();
    if (saving) return;
    setSaving(true);
    setMessage('');

    const cleanSections = form.sections
      .map((section) => ({ title: section.title.trim(), text: section.text.trim() }))
      .filter((section) => section.title || section.text);

    const payload = {
      title: form.title.trim(),
      category: form.category,
      categoryLabel: selectedCategoryLabel,
      author: form.author.trim() || siteInfo.engineerName || siteInfo.brandName,
      date: form.date.trim(),
      readTime: form.readTime.trim() || '5 min de leitura',
      image: form.image.trim() || defaultImage,
      excerpt: form.excerpt.trim(),
      content: {
        intro: form.intro.trim(),
        points: cleanSections,
        warningBox: form.warningBox.trim() || undefined,
        conclusion: form.conclusion.trim(),
      },
    };

    try {
      if (!payload.title || !payload.excerpt || !payload.intro || !payload.conclusion) {
        throw new Error('Preencha título, resumo, introdução e conclusão antes de publicar.');
      }
      if (editingId) {
        await updateBlogPost(editingId, payload);
        setMessage('Artigo atualizado e publicado no site com sucesso.');
      } else {
        await addBlogPost(payload);
        setMessage('Artigo publicado no site com sucesso.');
        setForm(emptyForm());
      }
    } catch (error: any) {
      setMessage(error?.message || 'Não foi possível salvar o artigo.');
    } finally {
      setSaving(false);
    }
  };

  const removePost = async (post: BlogPost) => {
    if (!window.confirm(`Excluir o artigo "${post.title}"?`)) return;
    try {
      await deleteBlogPost(post.id);
      if (editingId === post.id) startNew();
      setMessage('Artigo excluído.');
    } catch (error: any) {
      setMessage(error?.message || 'Não foi possível excluir o artigo.');
    }
  };

  const previewParagraphs = splitParagraphs(form.intro);

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <header className="bg-[#0A1128] border-b border-amber-500/20 px-4 py-6 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-amber-400 text-[10px] font-bold uppercase tracking-widest">
              <FileText className="w-4 h-4" /> Editor exclusivo do proprietário
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white mt-1">Escrever artigo</h1>
            <p className="text-xs text-slate-400 mt-1">Escreva como um artigo técnico de verdade e publique sem editar código.</p>
          </div>
          <button onClick={() => auth.signOut()} className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold flex items-center gap-2">
            <LogOut className="w-4 h-4" /> Sair
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-1 xl:grid-cols-12 gap-8">
        <form onSubmit={saveArticle} className="xl:col-span-8 space-y-6">
          <section className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-7 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <span className="text-[10px] text-amber-400 font-bold uppercase tracking-widest">01 • Identificação</span>
                <h2 className="text-xl font-serif font-bold text-white mt-1">Cabeçalho do artigo</h2>
              </div>
              <button type="button" onClick={startNew} className="px-3 py-2 rounded-lg bg-slate-800 text-slate-300 text-xs font-bold">Novo artigo</button>
            </div>

            <div>
              <label className="block text-xs font-bold text-amber-400 mb-1">Título *</label>
              <input required value={form.title} onChange={(e) => updateForm('title', e.target.value)} placeholder="Ex.: Como identificar sinais de infiltração antes de reformar" className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-white text-base focus:outline-none focus:ring-2 focus:ring-amber-500" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Categoria</label>
                <select value={form.category} onChange={(e) => updateForm('category', e.target.value)} className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm">
                  {BLOG_CATEGORIES.filter((category) => category.id !== 'todos').map((category) => <option key={category.id} value={category.id}>{category.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Autor</label>
                <input value={form.author} onChange={(e) => updateForm('author', e.target.value)} className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Tempo de leitura</label>
                <input value={form.readTime} onChange={(e) => updateForm('readTime', e.target.value)} placeholder="5 min de leitura" className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm" />
              </div>
            </div>
          </section>

          <section className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-7 space-y-5">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-4">
              <ImageIcon className="w-5 h-5 text-amber-400" />
              <div><span className="text-[10px] text-amber-400 font-bold uppercase tracking-widest">02 • Imagem</span><h2 className="text-xl font-serif font-bold text-white">Capa do artigo</h2></div>
            </div>
            <input value={form.image} onChange={(e) => updateForm('image', e.target.value)} placeholder="Cole a URL da imagem de capa" className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm" />
            <div className="rounded-xl overflow-hidden border border-slate-700 bg-slate-950">
              <img src={form.image || defaultImage} alt="Prévia da capa" className="w-full h-48 sm:h-64 object-cover" />
            </div>
            <p className="text-[11px] text-slate-500">A estrutura atual do projeto já comprime imagens enviadas pelo painel antigo. Neste editor dedicado, a capa usa uma URL para evitar armazenar arquivos grandes dentro do documento do artigo.</p>
          </section>

          <section className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-7 space-y-5">
            <div><span className="text-[10px] text-amber-400 font-bold uppercase tracking-widest">03 • Conteúdo</span><h2 className="text-xl font-serif font-bold text-white mt-1">Escreva o artigo</h2><p className="text-xs text-slate-400 mt-1">Use uma linha em branco entre parágrafos. Você pode criar quantos tópicos quiser.</p></div>

            <div>
              <label className="block text-xs font-bold text-amber-400 mb-1">Resumo para a página do Blog *</label>
              <textarea required rows={3} value={form.excerpt} onChange={(e) => updateForm('excerpt', e.target.value)} placeholder="Um resumo curto que aparecerá no cartão do artigo." className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm leading-relaxed resize-y" />
            </div>

            <div>
              <label className="block text-xs font-bold text-amber-400 mb-1">Introdução *</label>
              <textarea required rows={7} value={form.intro} onChange={(e) => updateForm('intro', e.target.value)} placeholder="Escreva aqui a introdução.\n\nPressione Enter duas vezes para iniciar um novo parágrafo." className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm leading-7 resize-y" />
            </div>

            <div className="space-y-4">
              {form.sections.map((section, index) => (
                <article key={index} className="p-4 sm:p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-xs font-bold text-white">Tópico {index + 1}</div>
                    <div className="flex items-center gap-1">
                      <button type="button" onClick={() => moveSection(index, -1)} disabled={index === 0} className="p-2 rounded-lg bg-slate-900 text-slate-400 disabled:opacity-30" title="Subir"><ArrowUp className="w-4 h-4" /></button>
                      <button type="button" onClick={() => moveSection(index, 1)} disabled={index === form.sections.length - 1} className="p-2 rounded-lg bg-slate-900 text-slate-400 disabled:opacity-30" title="Descer"><ArrowDown className="w-4 h-4" /></button>
                      <button type="button" onClick={() => removeSection(index)} className="p-2 rounded-lg bg-red-950/50 text-red-300" title="Excluir tópico"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                  <input value={section.title} onChange={(e) => updateSection(index, 'title', e.target.value)} placeholder="Título do tópico" className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm font-bold" />
                  <textarea rows={7} value={section.text} onChange={(e) => updateSection(index, 'text', e.target.value)} placeholder="Desenvolva o tópico. Use linhas em branco para separar os parágrafos." className="w-full px-3.5 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm leading-7 resize-y" />
                </article>
              ))}
              <button type="button" onClick={addSection} className="w-full py-3 rounded-xl border border-dashed border-amber-500/40 bg-amber-500/5 text-amber-300 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2"><Plus className="w-4 h-4" /> Adicionar novo tópico</button>
            </div>

            <div>
              <label className="block text-xs font-bold text-amber-400 mb-1">Caixa de atenção técnica (opcional)</label>
              <textarea rows={3} value={form.warningBox} onChange={(e) => updateForm('warningBox', e.target.value)} placeholder="Uma observação importante, alerta ou recomendação profissional." className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm leading-relaxed resize-y" />
            </div>

            <div>
              <label className="block text-xs font-bold text-amber-400 mb-1">Conclusão *</label>
              <textarea required rows={6} value={form.conclusion} onChange={(e) => updateForm('conclusion', e.target.value)} placeholder="Feche o artigo com a conclusão e, se desejar, uma orientação ao leitor." className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm leading-7 resize-y" />
            </div>

            <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
              {message ? <div className="text-xs text-emerald-300 flex items-center gap-2"><CheckCircle2 className="w-4 h-4" />{message}</div> : <span className="text-[11px] text-slate-500">Somente o proprietário autenticado consegue chegar a esta tela.</span>}
              <button disabled={saving} type="submit" className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 disabled:opacity-50"><Save className="w-4 h-4" />{saving ? 'Salvando...' : editingId ? 'Salvar alterações' : 'Publicar artigo'}</button>
            </div>
          </section>
        </form>

        <aside className="xl:col-span-4 space-y-6 xl:sticky xl:top-6 self-start">
          <section className="bg-white text-slate-900 rounded-2xl overflow-hidden shadow-xl">
            <div className="p-4 bg-[#0A1128] text-white flex items-center gap-2"><Eye className="w-4 h-4 text-amber-400" /><span className="text-xs font-bold uppercase tracking-widest">Prévia do artigo</span></div>
            <div className="p-5 space-y-4">
              <span className="inline-block px-2.5 py-1 rounded-md bg-amber-500/10 text-amber-700 font-bold text-[10px] uppercase">{selectedCategoryLabel}</span>
              <h3 className="text-2xl font-serif font-bold leading-tight">{form.title || 'Título do seu artigo'}</h3>
              <p className="text-sm text-slate-600 leading-relaxed">{form.excerpt || 'O resumo do artigo aparecerá aqui.'}</p>
              <div className="rounded-xl overflow-hidden bg-slate-100"><img src={form.image || defaultImage} alt="Prévia" className="w-full h-44 object-cover" /></div>
              <div className="text-sm leading-7 text-slate-700 space-y-4">
                {previewParagraphs.length ? previewParagraphs.map((paragraph, index) => <p key={index}>{paragraph}</p>) : <p className="text-slate-400">A introdução aparecerá aqui conforme você escrever.</p>}
                {form.sections.filter((section) => section.title || section.text).map((section, index) => (
                  <div key={index} className="space-y-2">
                    <h4 className="font-serif font-bold text-slate-900">{index + 1}. {section.title || 'Tópico sem título'}</h4>
                    {splitParagraphs(section.text).map((paragraph, paragraphIndex) => <p key={paragraphIndex}>{paragraph}</p>)}
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between"><h3 className="font-serif font-bold text-white">Artigos existentes</h3><span className="text-xs text-amber-400">{blogPosts.length}</span></div>
            <div className="space-y-2 max-h-[50vh] overflow-y-auto">
              {blogPosts.map((post) => (
                <div key={post.id} className={`p-3 rounded-xl border ${editingId === post.id ? 'border-amber-500/50 bg-amber-500/5' : 'border-slate-800 bg-slate-950'}`}>
                  <div className="flex items-start gap-3">
                    <img src={post.image} alt="" className="w-14 h-10 object-cover rounded-lg" />
                    <div className="min-w-0 flex-1"><p className="text-xs font-bold text-white line-clamp-2">{post.title}</p><p className="text-[10px] text-slate-500 mt-1">{post.categoryLabel} • {post.date}</p></div>
                  </div>
                  <div className="flex gap-2 mt-3"><button type="button" onClick={() => editPost(post)} className="flex-1 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-[10px] font-bold">Editar</button><button type="button" onClick={() => removePost(post)} className="px-3 py-1.5 rounded-lg bg-red-950/50 text-red-300 text-[10px] font-bold">Excluir</button></div>
                </div>
              ))}
            </div>
          </section>
        </aside>
      </div>
    </main>
  );
};
