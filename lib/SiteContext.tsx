'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Project, BlogPost, Service, SiteContactInfo, AboutInfo, PROJECTS, BLOG_POSTS, SERVICES, DEFAULT_SITE_INFO, DEFAULT_ABOUT_INFO } from './siteData';
import { db } from './firebase';
import { collection, doc, onSnapshot, setDoc, deleteDoc, writeBatch, getDocs } from 'firebase/firestore';

interface SiteContextType {
  projects: Project[];
  blogPosts: BlogPost[];
  services: Service[];
  siteInfo: SiteContactInfo;
  aboutInfo: AboutInfo;
  addProject: (project: Omit<Project, 'id'>) => Promise<void> | void;
  updateProject: (id: string, updated: Partial<Project>) => Promise<void> | void;
  deleteProject: (id: string) => Promise<void> | void;
  addBlogPost: (post: Omit<BlogPost, 'id' | 'slug'>) => Promise<void> | void;
  updateBlogPost: (id: string, updated: Partial<BlogPost>) => Promise<void> | void;
  deleteBlogPost: (id: string) => Promise<void> | void;
  addService: (service: Omit<Service, 'id'>) => Promise<void> | void;
  updateService: (id: string, updated: Partial<Service>) => Promise<void> | void;
  deleteService: (id: string) => Promise<void> | void;
  updateSiteInfo: (info: Partial<SiteContactInfo>) => Promise<void> | void;
  updateAboutInfo: (info: Partial<AboutInfo>) => Promise<void> | void;
  resetToDefaultData: () => Promise<void> | void;
}

const SiteContext = createContext<SiteContextType | undefined>(undefined);

const PROJECTS_STORAGE_KEY = 'mr_engenharia_projects_v1';
const BLOG_STORAGE_KEY = 'mr_engenharia_blog_posts_v1';
const SERVICES_STORAGE_KEY = 'mr_engenharia_services_v1';
const SITE_INFO_STORAGE_KEY = 'mr_engenharia_site_info_v1';
const ABOUT_INFO_STORAGE_KEY = 'mr_engenharia_about_info_v1';

const cleanObj = (obj: any) => JSON.parse(JSON.stringify(obj));

export const SiteProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [projects, setProjects] = useState<Project[]>(PROJECTS);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>(BLOG_POSTS);
  const [services, setServices] = useState<Service[]>(SERVICES);
  const [siteInfo, setSiteInfo] = useState<SiteContactInfo>(DEFAULT_SITE_INFO);
  const [aboutInfo, setAboutInfo] = useState<AboutInfo>(DEFAULT_ABOUT_INFO);

  // Listen to Firestore changes in real-time across all devices
  useEffect(() => {
    // Read local cache safely after mount to avoid server/client hydration mismatch
    try {
      const savedSiteInfo = localStorage.getItem(SITE_INFO_STORAGE_KEY);
      if (savedSiteInfo) {
        const data = JSON.parse(savedSiteInfo);
        queueMicrotask(() => setSiteInfo(data));
      }

      const savedAboutInfo = localStorage.getItem(ABOUT_INFO_STORAGE_KEY);
      if (savedAboutInfo) {
        const data = JSON.parse(savedAboutInfo);
        queueMicrotask(() => setAboutInfo(data));
      }

      const savedProjects = localStorage.getItem(PROJECTS_STORAGE_KEY);
      if (savedProjects !== null) {
        const data = JSON.parse(savedProjects);
        queueMicrotask(() => setProjects(data));
      }

      const savedBlog = localStorage.getItem(BLOG_STORAGE_KEY);
      if (savedBlog !== null) {
        const data = JSON.parse(savedBlog);
        queueMicrotask(() => setBlogPosts(data));
      }

      const savedServices = localStorage.getItem(SERVICES_STORAGE_KEY);
      if (savedServices !== null) {
        const data = JSON.parse(savedServices);
        queueMicrotask(() => setServices(data));
      }
    } catch (e) {}

    // 1. Site Info (contact details, logos, phone, wa, CREA)
    const unsubSiteInfo = onSnapshot(doc(db, 'siteConfig', 'contact'), (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data() as SiteContactInfo;
        setSiteInfo((prev) => {
          const merged = { ...prev, ...data };
          try { localStorage.setItem(SITE_INFO_STORAGE_KEY, JSON.stringify(merged)); } catch (e) {}
          return merged;
        });
      }
    }, (error) => console.error('Firestore siteInfo listener error:', error));

    // 2. About Info (hero title, image, history, values)
    const unsubAboutInfo = onSnapshot(doc(db, 'siteConfig', 'about'), (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data() as AboutInfo;
        setAboutInfo((prev) => {
          const merged = { ...prev, ...data };
          try { localStorage.setItem(ABOUT_INFO_STORAGE_KEY, JSON.stringify(merged)); } catch (e) {}
          return merged;
        });
      }
    }, (error) => console.error('Firestore aboutInfo listener error:', error));

    // Dedicated listener for modular site images
    const unsubImages = onSnapshot(doc(db, 'siteConfig', 'images'), (snapshot) => {
      if (snapshot.exists()) {
        const imgData = snapshot.data() as Record<string, any>;
        if (imgData.homeAboutImageUrl || imgData.servicesHeroImage || imgData.heroImageUrl || imgData.engineerPhotoUrl) {
          setSiteInfo((prev) => {
            const updated: SiteContactInfo = { ...prev };
            if (imgData.homeAboutImageUrl) updated.homeAboutImageUrl = imgData.homeAboutImageUrl;
            if (imgData.servicesHeroImage) updated.servicesHeroImage = imgData.servicesHeroImage;
            if (imgData.heroImageUrl) updated.heroImageUrl = imgData.heroImageUrl;
            if (imgData.engineerPhotoUrl) updated.engineerPhotoUrl = imgData.engineerPhotoUrl;
            try { localStorage.setItem(SITE_INFO_STORAGE_KEY, JSON.stringify(updated)); } catch (e) {}
            return updated;
          });
        }
        if (imgData.aboutHeroImage || imgData.aboutOfficeImage) {
          setAboutInfo((prev) => {
            const updated: AboutInfo = { ...prev };
            if (imgData.aboutHeroImage) updated.heroImage = imgData.aboutHeroImage;
            if (imgData.aboutOfficeImage) updated.officeImage = imgData.aboutOfficeImage;
            try { localStorage.setItem(ABOUT_INFO_STORAGE_KEY, JSON.stringify(updated)); } catch (e) {}
            return updated;
          });
        }
      }
    }, (error) => console.warn('Firestore images listener error:', error));

    // 3. Projects collection
    const unsubProjects = onSnapshot(collection(db, 'projects'), (snapshot) => {
      const loadedProjects = snapshot.docs.map(docSnap => ({ ...docSnap.data(), id: docSnap.id } as Project));
      setProjects(loadedProjects);
      try { localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(loadedProjects)); } catch (e) {}
    }, (error) => console.error('Firestore projects listener error:', error));

    // 4. Blog Posts collection
    const unsubBlog = onSnapshot(collection(db, 'blogPosts'), (snapshot) => {
      const loadedPosts = snapshot.docs.map(docSnap => ({ ...docSnap.data(), id: docSnap.id } as BlogPost));
      setBlogPosts(loadedPosts);
      try { localStorage.setItem(BLOG_STORAGE_KEY, JSON.stringify(loadedPosts)); } catch (e) {}
    }, (error) => console.error('Firestore blogPosts listener error:', error));

    // 5. Services collection
    const unsubServices = onSnapshot(collection(db, 'services'), (snapshot) => {
      const loadedServices = snapshot.docs.map(docSnap => ({ ...docSnap.data(), id: docSnap.id } as Service));
      setServices(loadedServices);
      try { localStorage.setItem(SERVICES_STORAGE_KEY, JSON.stringify(loadedServices)); } catch (e) {}
    }, (error) => console.error('Firestore services listener error:', error));

    return () => {
      unsubSiteInfo();
      unsubAboutInfo();
      unsubImages();
      unsubProjects();
      unsubBlog();
      unsubServices();
    };
  }, []);

  // Update operations - Writes immediately to local cache and Firestore
  const updateSiteInfo = async (updated: Partial<SiteContactInfo>) => {
    const newInfo = { ...siteInfo, ...updated };
    setSiteInfo(newInfo);
    try {
      localStorage.setItem(SITE_INFO_STORAGE_KEY, JSON.stringify(newInfo));
    } catch (e) {
      console.warn('LocalStorage save warning:', e);
    }

    try {
      await setDoc(doc(db, 'siteConfig', 'contact'), cleanObj(newInfo), { merge: true });
    } catch (e) {
      console.error('Failed to update site info in Firestore:', e);
    }

    // Also persist image fields into dedicated image document for high reliability
    const imageFields: Record<string, string> = {};
    if (newInfo.homeAboutImageUrl) imageFields.homeAboutImageUrl = newInfo.homeAboutImageUrl;
    if (newInfo.servicesHeroImage) imageFields.servicesHeroImage = newInfo.servicesHeroImage;
    if (newInfo.heroImageUrl) imageFields.heroImageUrl = newInfo.heroImageUrl;
    if (newInfo.engineerPhotoUrl) imageFields.engineerPhotoUrl = newInfo.engineerPhotoUrl;

    if (Object.keys(imageFields).length > 0) {
      try {
        await setDoc(doc(db, 'siteConfig', 'images'), cleanObj(imageFields), { merge: true });
      } catch (err) {
        console.warn('Failed to update dedicated images document:', err);
      }
    }
  };

  const updateAboutInfo = async (updated: Partial<AboutInfo>) => {
    const newAbout = { ...aboutInfo, ...updated };
    setAboutInfo(newAbout);
    try {
      localStorage.setItem(ABOUT_INFO_STORAGE_KEY, JSON.stringify(newAbout));
    } catch (e) {
      console.warn('LocalStorage save warning:', e);
    }

    try {
      await setDoc(doc(db, 'siteConfig', 'about'), cleanObj(newAbout), { merge: true });
    } catch (e) {
      console.error('Failed to update about info in Firestore:', e);
    }

    // Also persist about images into dedicated image document
    const imageFields: Record<string, string> = {};
    if (newAbout.heroImage) imageFields.aboutHeroImage = newAbout.heroImage;
    if (newAbout.officeImage) imageFields.aboutOfficeImage = newAbout.officeImage;

    if (Object.keys(imageFields).length > 0) {
      try {
        await setDoc(doc(db, 'siteConfig', 'images'), cleanObj(imageFields), { merge: true });
      } catch (err) {
        console.warn('Failed to update dedicated about images document:', err);
      }
    }
  };

  const addProject = async (projectData: Omit<Project, 'id'>) => {
    const newId = 'proj-' + Date.now();
    const newProject: Project = { ...projectData, id: newId };
    try {
      await setDoc(doc(db, 'projects', newId), cleanObj(newProject));
    } catch (e) {
      console.error('Failed to add project to Firestore:', e);
    }
  };

  const updateProject = async (id: string, updatedData: Partial<Project>) => {
    const existing = projects.find(p => p.id === id);
    const updated = existing ? { ...existing, ...updatedData } : updatedData;
    try {
      await setDoc(doc(db, 'projects', id), cleanObj(updated), { merge: true });
    } catch (e) {
      console.error('Failed to update project in Firestore:', e);
    }
  };

  const deleteProject = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'projects', id));
    } catch (e) {
      console.error('Failed to delete project from Firestore:', e);
      throw e;
    }
  };

  const addBlogPost = async (postData: Omit<BlogPost, 'id' | 'slug'>) => {
    const newId = 'post-' + Date.now();
    const slug = postData.title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    const newPost: BlogPost = { ...postData, id: newId, slug };
    try {
      await setDoc(doc(db, 'blogPosts', newId), cleanObj(newPost));
    } catch (e) {
      console.error('Failed to add blog post to Firestore:', e);
    }
  };

  const updateBlogPost = async (id: string, updatedData: Partial<BlogPost>) => {
    const existing = blogPosts.find(p => p.id === id);
    const updated = existing ? { ...existing, ...updatedData } : updatedData;
    try {
      await setDoc(doc(db, 'blogPosts', id), cleanObj(updated), { merge: true });
    } catch (e) {
      console.error('Failed to update blog post in Firestore:', e);
    }
  };

  const deleteBlogPost = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'blogPosts', id));
    } catch (e) {
      console.error('Failed to delete blog post from Firestore:', e);
      throw e;
    }
  };

  const addService = async (serviceData: Omit<Service, 'id'>) => {
    const newId = 'serv-' + Date.now();
    const newService: Service = { ...serviceData, id: newId };
    try {
      await setDoc(doc(db, 'services', newId), cleanObj(newService));
    } catch (e) {
      console.error('Failed to add service to Firestore:', e);
    }
  };

  const updateService = async (id: string, updatedData: Partial<Service>) => {
    const existing = services.find(s => s.id === id);
    const updated = existing ? { ...existing, ...updatedData } : updatedData;
    try {
      await setDoc(doc(db, 'services', id), cleanObj(updated), { merge: true });
    } catch (e) {
      console.error('Failed to update service in Firestore:', e);
    }
  };

  const deleteService = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'services', id));
    } catch (e) {
      console.error('Failed to delete service from Firestore:', e);
      throw e;
    }
  };

  const resetToDefaultData = async () => {
    try {
      await setDoc(doc(db, 'siteConfig', 'contact'), cleanObj(DEFAULT_SITE_INFO));
      await setDoc(doc(db, 'siteConfig', 'about'), cleanObj(DEFAULT_ABOUT_INFO));

      // Limpa projetos existentes e recria apenas os originais
      const pSnap = await getDocs(collection(db, 'projects'));
      const pBatch = writeBatch(db);
      pSnap.forEach(d => pBatch.delete(d.ref));
      PROJECTS.forEach(p => pBatch.set(doc(db, 'projects', p.id), cleanObj(p)));
      await pBatch.commit();

      // Limpa artigos existentes e recria apenas os originais
      const bSnap = await getDocs(collection(db, 'blogPosts'));
      const bBatch = writeBatch(db);
      bSnap.forEach(d => bBatch.delete(d.ref));
      BLOG_POSTS.forEach(b => bBatch.set(doc(db, 'blogPosts', b.id), cleanObj(b)));
      await bBatch.commit();

      // Limpa serviços existentes e recria apenas os originais
      const sSnap = await getDocs(collection(db, 'services'));
      const sBatch = writeBatch(db);
      sSnap.forEach(d => sBatch.delete(d.ref));
      SERVICES.forEach(s => sBatch.set(doc(db, 'services', s.id), cleanObj(s)));
      await sBatch.commit();
    } catch (e) {
      console.error('Failed to reset default data in Firestore:', e);
      throw e;
    }
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

