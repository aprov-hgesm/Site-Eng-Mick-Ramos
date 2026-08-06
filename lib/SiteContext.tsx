'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Project, BlogPost, Service, SiteContactInfo, AboutInfo, PROJECTS, BLOG_POSTS, SERVICES, DEFAULT_SITE_INFO, DEFAULT_ABOUT_INFO } from './siteData';

interface SiteContextType {
  projects: Project[];
  blogPosts: BlogPost[];
  services: Service[];
  siteInfo: SiteContactInfo;
  aboutInfo: AboutInfo;
  addProject: (project: Omit<Project, 'id'>) => void;
  updateProject: (id: string, updated: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  addBlogPost: (post: Omit<BlogPost, 'id' | 'slug'>) => void;
  updateBlogPost: (id: string, updated: Partial<BlogPost>) => void;
  deleteBlogPost: (id: string) => void;
  addService: (service: Omit<Service, 'id'>) => void;
  updateService: (id: string, updated: Partial<Service>) => void;
  deleteService: (id: string) => void;
  updateSiteInfo: (info: Partial<SiteContactInfo>) => void;
  updateAboutInfo: (info: Partial<AboutInfo>) => void;
  resetToDefaultData: () => void;
}

const SiteContext = createContext<SiteContextType | undefined>(undefined);

const PROJECTS_STORAGE_KEY = 'mr_engenharia_projects_v1';
const BLOG_STORAGE_KEY = 'mr_engenharia_blog_posts_v1';
const SERVICES_STORAGE_KEY = 'mr_engenharia_services_v1';
const SITE_INFO_STORAGE_KEY = 'mr_engenharia_site_info_v1';
const ABOUT_INFO_STORAGE_KEY = 'mr_engenharia_about_info_v1';

export const SiteProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [projects, setProjects] = useState<Project[]>(PROJECTS);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>(BLOG_POSTS);
  const [services, setServices] = useState<Service[]>(SERVICES);
  const [siteInfo, setSiteInfo] = useState<SiteContactInfo>(DEFAULT_SITE_INFO);
  const [aboutInfo, setAboutInfo] = useState<AboutInfo>(DEFAULT_ABOUT_INFO);

  // Sync with localStorage safely on the client after initial hydration
  useEffect(() => {
    queueMicrotask(() => {
      try {
        const savedProjects = localStorage.getItem(PROJECTS_STORAGE_KEY);
        if (savedProjects) {
          setProjects(JSON.parse(savedProjects));
        } else {
          localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(PROJECTS));
        }
      } catch (e) {
        console.error(e);
      }

      try {
        const savedPosts = localStorage.getItem(BLOG_STORAGE_KEY);
        if (savedPosts) {
          setBlogPosts(JSON.parse(savedPosts));
        } else {
          localStorage.setItem(BLOG_STORAGE_KEY, JSON.stringify(BLOG_POSTS));
        }
      } catch (e) {
        console.error(e);
      }

      try {
        const savedServices = localStorage.getItem(SERVICES_STORAGE_KEY);
        if (savedServices) {
          setServices(JSON.parse(savedServices));
        } else {
          localStorage.setItem(SERVICES_STORAGE_KEY, JSON.stringify(SERVICES));
        }
      } catch (e) {
        console.error(e);
      }

      try {
        const savedInfo = localStorage.getItem(SITE_INFO_STORAGE_KEY);
        if (savedInfo) {
          setSiteInfo(JSON.parse(savedInfo));
        } else {
          localStorage.setItem(SITE_INFO_STORAGE_KEY, JSON.stringify(DEFAULT_SITE_INFO));
        }
      } catch (e) {
        console.error(e);
      }

      try {
        const savedAbout = localStorage.getItem(ABOUT_INFO_STORAGE_KEY);
        if (savedAbout) {
          setAboutInfo(JSON.parse(savedAbout));
        } else {
          localStorage.setItem(ABOUT_INFO_STORAGE_KEY, JSON.stringify(DEFAULT_ABOUT_INFO));
        }
      } catch (e) {
        console.error(e);
      }
    });
  }, []);

  // Save changes helper
  const saveProjects = (newProjects: Project[]) => {
    setProjects(newProjects);
    try {
      localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(newProjects));
    } catch (e) {
      console.error('Failed to save projects to localStorage:', e);
    }
  };

  const saveBlogPosts = (newPosts: BlogPost[]) => {
    setBlogPosts(newPosts);
    try {
      localStorage.setItem(BLOG_STORAGE_KEY, JSON.stringify(newPosts));
    } catch (e) {
      console.error('Failed to save blog posts to localStorage:', e);
    }
  };

  const saveServices = (newServices: Service[]) => {
    setServices(newServices);
    try {
      localStorage.setItem(SERVICES_STORAGE_KEY, JSON.stringify(newServices));
    } catch (e) {
      console.error('Failed to save services to localStorage:', e);
    }
  };

  const updateSiteInfo = (updated: Partial<SiteContactInfo>) => {
    const newInfo = { ...siteInfo, ...updated };
    setSiteInfo(newInfo);
    try {
      localStorage.setItem(SITE_INFO_STORAGE_KEY, JSON.stringify(newInfo));
    } catch (e) {
      console.error('Failed to save site info to localStorage:', e);
    }
  };

  const updateAboutInfo = (updated: Partial<AboutInfo>) => {
    const newAbout = { ...aboutInfo, ...updated };
    setAboutInfo(newAbout);
    try {
      localStorage.setItem(ABOUT_INFO_STORAGE_KEY, JSON.stringify(newAbout));
    } catch (e) {
      console.error('Failed to save about info to localStorage:', e);
    }
  };

  const addProject = (projectData: Omit<Project, 'id'>) => {
    const newProject: Project = {
      ...projectData,
      id: 'proj-' + Date.now(),
    };
    const updated = [newProject, ...projects];
    saveProjects(updated);
  };

  const updateProject = (id: string, updatedData: Partial<Project>) => {
    const updated = projects.map((p) => (p.id === id ? { ...p, ...updatedData } : p));
    saveProjects(updated);
  };

  const deleteProject = (id: string) => {
    const updated = projects.filter((p) => p.id !== id);
    saveProjects(updated);
  };

  const addBlogPost = (postData: Omit<BlogPost, 'id' | 'slug'>) => {
    const slug = postData.title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    const newPost: BlogPost = {
      ...postData,
      id: 'post-' + Date.now(),
      slug,
    };
    const updated = [newPost, ...blogPosts];
    saveBlogPosts(updated);
  };

  const updateBlogPost = (id: string, updatedData: Partial<BlogPost>) => {
    const updated = blogPosts.map((p) => (p.id === id ? { ...p, ...updatedData } : p));
    saveBlogPosts(updated);
  };

  const deleteBlogPost = (id: string) => {
    const updated = blogPosts.filter((p) => p.id !== id);
    saveBlogPosts(updated);
  };

  const addService = (serviceData: Omit<Service, 'id'>) => {
    const newService: Service = {
      ...serviceData,
      id: 'serv-' + Date.now(),
    };
    const updated = [...services, newService];
    saveServices(updated);
  };

  const updateService = (id: string, updatedData: Partial<Service>) => {
    const updated = services.map((s) => (s.id === id ? { ...s, ...updatedData } : s));
    saveServices(updated);
  };

  const deleteService = (id: string) => {
    const updated = services.filter((s) => s.id !== id);
    saveServices(updated);
  };

  const resetToDefaultData = () => {
    saveProjects(PROJECTS);
    saveBlogPosts(BLOG_POSTS);
    saveServices(SERVICES);
    updateSiteInfo(DEFAULT_SITE_INFO);
    updateAboutInfo(DEFAULT_ABOUT_INFO);
  };

  return (
    <SiteContext.Provider
      value={{
        projects,
        blogPosts,
        services,
        siteInfo,
        aboutInfo,
        addProject,
        updateProject,
        deleteProject,
        addBlogPost,
        updateBlogPost,
        deleteBlogPost,
        addService,
        updateService,
        deleteService,
        updateSiteInfo,
        updateAboutInfo,
        resetToDefaultData,
      }}
    >
      {children}
    </SiteContext.Provider>
  );
};

export const useSiteData = () => {
  const context = useContext(SiteContext);
  if (!context) {
    throw new Error('useSiteData must be used within a SiteProvider');
  }
  return context;
};
