'use client';

import React, { useState } from 'react';
import { Header, TabType } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { HomeView } from '@/components/views/HomeView';
import { AboutView } from '@/components/views/AboutView';
import { ServicesView } from '@/components/views/ServicesView';
import { ProjectsView } from '@/components/views/ProjectsView';
import { BlogView } from '@/components/views/BlogView';
import { ArticleDetailView } from '@/components/views/ArticleDetailView';
import { ContactView } from '@/components/views/ContactView';
import { AdminSecureGate } from '@/components/AdminSecureGate';
import { QuoteModal } from '@/components/QuoteModal';
import { ProjectDetailModal } from '@/components/ProjectDetailModal';
import { Project } from '@/lib/siteData';
import { SiteProvider } from '@/lib/SiteContext';

export default function Page() {
  const [activeTab, setActiveTab] = useState<TabType>('inicio');
  const [isQuoteOpen, setIsQuoteOpen] = useState(false);
  const [selectedServiceTitle, setSelectedServiceTitle] = useState<string | undefined>();
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedArticleId, setSelectedArticleId] = useState<string | null>(null);

  const handleOpenQuote = (serviceTitle?: string) => {
    if (serviceTitle) {
      setSelectedServiceTitle(serviceTitle);
    }
    setIsQuoteOpen(true);
  };

  const handleSelectArticle = (articleId: string) => {
    setSelectedArticleId(articleId);
    setActiveTab('blog');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <SiteProvider>
      <div className="site-shell">
        <Header
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onOpenQuote={() => handleOpenQuote()}
          selectedArticleId={selectedArticleId}
          setSelectedArticleId={setSelectedArticleId}
        />

        <main className="flex-1">
          {activeTab === 'inicio' && (
            <HomeView
              setActiveTab={setActiveTab}
              onOpenQuote={() => handleOpenQuote()}
              onSelectProject={(project) => setSelectedProject(project)}
            />
          )}

          {activeTab === 'sobre' && (
            <AboutView
              onOpenQuote={() => handleOpenQuote()}
            />
          )}

          {activeTab === 'servicos' && (
            <ServicesView
              onOpenQuote={(serviceTitle) => handleOpenQuote(serviceTitle)}
            />
          )}

          {activeTab === 'projetos' && (
            <ProjectsView
              onSelectProject={(project) => setSelectedProject(project)}
              onOpenQuote={() => handleOpenQuote()}
            />
          )}

          {activeTab === 'blog' && (
            selectedArticleId ? (
              <ArticleDetailView
                articleId={selectedArticleId}
                onBackToBlog={() => setSelectedArticleId(null)}
                onSelectArticle={(id) => handleSelectArticle(id)}
                onOpenQuote={() => handleOpenQuote()}
                setActiveTab={setActiveTab}
              />
            ) : (
              <BlogView
                onSelectArticle={(id) => handleSelectArticle(id)}
                onOpenQuote={() => handleOpenQuote()}
              />
            )
          )}

          {activeTab === 'contato' && (
            <ContactView />
          )}

          {activeTab === 'admin' && (
            <AdminSecureGate
              onNavigateToTab={(tab) => {
                setActiveTab(tab);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
          )}
        </main>

        <Footer
          setActiveTab={setActiveTab}
          onOpenQuote={() => handleOpenQuote()}
        />

        <QuoteModal
          isOpen={isQuoteOpen}
          onClose={() => setIsQuoteOpen(false)}
          defaultService={selectedServiceTitle}
        />

        <ProjectDetailModal
          project={selectedProject}
          onClose={() => setSelectedProject(null)}
          onOpenQuote={() => handleOpenQuote()}
        />
      </div>
    </SiteProvider>
  );
}
