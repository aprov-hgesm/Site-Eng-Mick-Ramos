'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Project, BlogPost, Service, SiteContactInfo, AboutInfo, PROJECTS, BLOG_POSTS, SERVICES, DEFAULT_SITE_INFO, DEFAULT_ABOUT_INFO } from './siteData';
import { db } from './firebase';
import { collection, doc, onSnapshot, setDoc, deleteDoc, writeBatch } from 'firebase/firestore';

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

const compressDataUrlIfNeeded = async (dataUrl: string, maxChars = 450000): Promise<string> => {
  if (typeof window === 'undefined' || !dataUrl || !dataUrl.startsWith('data:image/') || dataUrl.length <= maxChars) {
    return dataUrl;
  }
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      let width = img.width;
      let height = img.height;
      let quality = 0.8;
      const canvas = document.createElement('canvas');

      const attempt = () => {
        width = Math.max(200, Math.round(width * 0.7));
        height = Math.max(200, Math.round(height * 0.7));
        quality = Math.max(0.2, quality - 0.15);

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(dataUrl);
          return;
        }
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);
        const result = canvas.toDataURL('image/jpeg', quality);
        if (result.length <= maxChars || (width <= 200 && quality <= 0.2)) {
          resolve(result);
        } else {
          attempt();
        }
      };
      attempt();
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
};

const sanitizeDocObject = async <T extends Record<string, any>>(rawObj: T): Promise<T> => {
  const obj = cleanObj(rawObj);
  for (const key of Object.keys(obj)) {
    const val = obj[key];
    if (typeof val === 'string' && val.startsWith('data:image/') && val.length > 450000) {
      obj[key] = await compressDataUrlIfNeeded(val, 450000);
    } else if (Array.isArray(val)) {
      obj[key] = await Promise.all(val.map(async (item: any) => {
        if (typeof item === 'string' && item.startsWith('data:image/') && item.length > 450000) {
          return await compressDataUrlIfNeeded(item, 450000);
        }
        return item;
      }));
    }
  }
  return obj;
};

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
      if (savedProjects) {
        const data = JSON.parse(savedProjects);
        queueMicrotask(() => setProjects(data));
      }

      const savedBlog = localStorage.getItem(BLOG_STORAGE_KEY);
      if (savedBlog) {
        const data = JSON.parse(savedBlog);
        queueMicrotask(() => setBlogPosts(data));
      }

      const savedServices = localStorage.getItem(SERVICES_STORAGE_KEY);
      if (savedServices) {
        const data = JSON.parse(savedServices);
        queueMicrotask(() => setServices(data));
      }
    } catch (e) {}

    // 1. Site Info (contact details, logos, phone, wa, CREA)
    const unsubSiteInfo = onSnapshot(doc(db, 'siteConfig', 'contact'), async (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data() as SiteContactInfo;
        setSiteInfo(data);
        try { localStorage.setItem(SITE_INFO_STORAGE_KEY, JSON.stringify(data)); } catch (e) {}
      } else {
        try {
          await setDoc(doc(db, 'siteConfig', 'contact'), cleanObj(DEFAULT_SITE_INFO));
        } catch (err) {
          console.error('Error seeding initial siteInfo to Firestore:', err);
        }
      }
    }, (error) => console.error('Firestore siteInfo listener error:', error));

    // 2. About Info (hero title, image, history, values)
    const unsubAboutInfo = onSnapshot(doc(db, 'siteConfig', 'about'), async (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data() as AboutInfo;
        setAboutInfo(data);
        try { localStorage.setItem(ABOUT_INFO_STORAGE_KEY, JSON.stringify(data)); } catch (e) {}
      } else {
        try {
          await setDoc(doc(db, 'siteConfig', 'about'), cleanObj(DEFAULT_ABOUT_INFO));
        } catch (err) {
          console.error('Error seeding initial aboutInfo to Firestore:', err);
        }
      }
    }, (error) => console.error('Firestore aboutInfo listener error:', error));

    // 3. Projects collection
    const unsubProjects = onSnapshot(collection(db, 'projects'), async (snapshot) => {
      if (!snapshot.empty) {
        const loadedProjects = snapshot.docs.map(docSnap => ({ ...docSnap.data(), id: docSnap.id } as Project));
        setProjects(loadedProjects);
        try { localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(loadedProjects)); } catch (e) {}
      } else {
        try {
          const batch = writeBatch(db);
          PROJECTS.forEach((p) => {
            const pRef = doc(db, 'projects', p.id);
            batch.set(pRef, cleanObj(p));
          });
          await batch.commit();
        } catch (err) {
          console.error('Error seeding initial projects to Firestore:', err);
        }
      }
    }, (error) => console.error('Firestore projects listener error:', error));

    // 4. Blog Posts collection
    const unsubBlog = onSnapshot(collection(db, 'blogPosts'), async (snapshot) => {
      if (!snapshot.empty) {
        const loadedPosts = snapshot.docs.map(docSnap => ({ ...docSnap.data(), id: docSnap.id } as BlogPost));
        setBlogPosts(loadedPosts);
        try { localStorage.setItem(BLOG_STORAGE_KEY, JSON.stringify(loadedPosts)); } catch (e) {}
      } else {
        try {
          const batch = writeBatch(db);
          BLOG_POSTS.forEach((post) => {
            const postRef = doc(db, 'blogPosts', post.id);
            batch.set(postRef, cleanObj(post));
          });
          await batch.commit();
        } catch (err) {
          console.error('Error seeding initial blog posts to Firestore:', err);
        }
      }
    }, (error) => console.error('Firestore blogPosts listener error:', error));

    // 5. Services collection
    const unsubServices = onSnapshot(collection(db, 'services'), async (snapshot) => {
      if (!snapshot.empty) {
        const loadedServices = snapshot.docs.map(docSnap => ({ ...docSnap.data(), id: docSnap.id } as Service));
        setServices(loadedServices);
        try { localStorage.setItem(SERVICES_STORAGE_KEY, JSON.stringify(loadedServices)); } catch (e) {}
      } else {
        try {
          const batch = writeBatch(db);
          SERVICES.forEach((s) => {
            const sRef = doc(db, 'services', s.id);
            batch.set(sRef, cleanObj(s));
          });
          await batch.commit();
        } catch (err) {
          console.error('Error seeding initial services to Firestore:', err);
        }
      }
    }, (error) => console.error('Firestore services listener error:', error));

    return () => {
      unsubSiteInfo();
      unsubAboutInfo();
      unsubProjects();
      unsubBlog();
      unsubServices();
    };
  }, []);

  // Update operations - Writes to Firestore so all connected devices update live
  const updateSiteInfo = async (updated: Partial<SiteContactInfo>) => {
    const newInfo = { ...siteInfo, ...updated };
    setSiteInfo(newInfo);
    try {
      const sanitized = await sanitizeDocObject(newInfo);
      await setDoc(doc(db, 'siteConfig', 'contact'), sanitized, { merge: true });
    } catch (e) {
      console.error('Failed to update site info in Firestore:', e);
    }
  };

  const updateAboutInfo = async (updated: Partial<AboutInfo>) => {
    const newAbout = { ...aboutInfo, ...updated };
    setAboutInfo(newAbout);
    try {
      const sanitized = await sanitizeDocObject(newAbout);
      await setDoc(doc(db, 'siteConfig', 'about'), sanitized, { merge: true });
    } catch (e) {
      console.error('Failed to update about info in Firestore:', e);
    }
  };

  const addProject = async (projectData: Omit<Project, 'id'>) => {
    const newId = 'proj-' + Date.now();
    const newProject: Project = { ...projectData, id: newId };
    try {
      const sanitized = await sanitizeDocObject(newProject);
      await setDoc(doc(db, 'projects', newId), sanitized);
    } catch (e) {
      console.error('Failed to add project to Firestore:', e);
    }
  };

  const updateProject = async (id: string, updatedData: Partial<Project>) => {
    const existing = projects.find(p => p.id === id);
    const updated = existing ? { ...existing, ...updatedData } : updatedData;
    try {
      const sanitized = await sanitizeDocObject(updated);
      await setDoc(doc(db, 'projects', id), sanitized, { merge: true });
    } catch (e) {
      console.error('Failed to update project in Firestore:', e);
    }
  };

  const deleteProject = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'projects', id));
    } catch (e) {
      console.error('Failed to delete project from Firestore:', e);
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
      const sanitized = await sanitizeDocObject(newPost);
      await setDoc(doc(db, 'blogPosts', newId), sanitized);
    } catch (e) {
      console.error('Failed to add blog post to Firestore:', e);
    }
  };

  const updateBlogPost = async (id: string, updatedData: Partial<BlogPost>) => {
    const existing = blogPosts.find(p => p.id === id);
    const updated = existing ? { ...existing, ...updatedData } : updatedData;
    try {
      const sanitized = await sanitizeDocObject(updated);
      await setDoc(doc(db, 'blogPosts', id), sanitized, { merge: true });
    } catch (e) {
      console.error('Failed to update blog post in Firestore:', e);
    }
  };

  const deleteBlogPost = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'blogPosts', id));
    } catch (e) {
      console.error('Failed to delete blog post from Firestore:', e);
    }
  };

  const addService = async (serviceData: Omit<Service, 'id'>) => {
    const newId = 'serv-' + Date.now();
    const newService: Service = { ...serviceData, id: newId };
    try {
      const sanitized = await sanitizeDocObject(newService);
      await setDoc(doc(db, 'services', newId), sanitized);
    } catch (e) {
      console.error('Failed to add service to Firestore:', e);
    }
  };

  const updateService = async (id: string, updatedData: Partial<Service>) => {
    const existing = services.find(s => s.id === id);
    const updated = existing ? { ...existing, ...updatedData } : updatedData;
    try {
      const sanitized = await sanitizeDocObject(updated);
      await setDoc(doc(db, 'services', id), sanitized, { merge: true });
    } catch (e) {
      console.error('Failed to update service in Firestore:', e);
    }
  };

  const deleteService = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'services', id));
    } catch (e) {
      console.error('Failed to delete service from Firestore:', e);
    }
  };

  const resetToDefaultData = async () => {
    try {
      await setDoc(doc(db, 'siteConfig', 'contact'), cleanObj(DEFAULT_SITE_INFO));
      await setDoc(doc(db, 'siteConfig', 'about'), cleanObj(DEFAULT_ABOUT_INFO));

      const pBatch = writeBatch(db);
      PROJECTS.forEach(p => pBatch.set(doc(db, 'projects', p.id), cleanObj(p)));
      await pBatch.commit();

      const bBatch = writeBatch(db);
      BLOG_POSTS.forEach(b => bBatch.set(doc(db, 'blogPosts', b.id), cleanObj(b)));
      await bBatch.commit();

      const sBatch = writeBatch(db);
      SERVICES.forEach(s => sBatch.set(doc(db, 'services', s.id), cleanObj(s)));
      await sBatch.commit();
    } catch (e) {
      console.error('Failed to reset default data in Firestore:', e);
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

