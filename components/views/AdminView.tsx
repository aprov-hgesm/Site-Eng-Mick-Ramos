'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  ShieldCheck, Lock, Unlock, Plus, Edit2, Trash2, LayoutDashboard, 
  FolderKanban, FileText, RotateCcw, Image as ImageIcon, MapPin, 
  Calendar, Clock, User, Check, X, Layers, AlertTriangle, Eye, EyeOff, ShieldAlert, ArrowRight,
  Upload, FileUp, Star, Phone, Mail, MessageCircle, Save, CheckCircle2,
  Compass, Search, Building2, FileCheck, HardHat, Flame, Box, Wrench, HelpCircle,
  GraduationCap, Quote, Target, Scale, Award, Inbox, Sparkles
} from 'lucide-react';
import { useSiteData } from '@/lib/SiteContext';
import { Project, BlogPost, Service, BLOG_CATEGORIES, SiteContactInfo, AboutInfo, AboutValue } from '@/lib/siteData';
import { MRLogo } from '../MRLogo';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, doc, deleteDoc } from 'firebase/firestore';

// Helper to compress uploaded images to lightweight Base64 (guarantees size stays under Firestore limits)
const MAX_BASE64_LENGTH = 450000; // ~337 KB binary data, safely under Firestore 1MB document limit

const compressImageFile = (
  file: File, 
  maxWidth = 1200, 
  maxHeight = 1200, 
  quality = 0.8,
  outputType?: string
): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('O arquivo selecionado não é uma imagem válida.'));
      return;
    }
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Erro ao ler arquivo de imagem.'));
    reader.onload = (evt) => {
      const img = new Image();
      img.onerror = () => reject(new Error('Erro ao processar conteúdo da imagem.'));
      img.onload = () => {
        let curWidth = img.width;
        let curHeight = img.height;

        if (curWidth > maxWidth || curHeight > maxHeight) {
          if (curWidth / curHeight > maxWidth / maxHeight) {
            curHeight = Math.round((curHeight * maxWidth) / curWidth);
            curWidth = maxWidth;
          } else {
            curWidth = Math.round((curWidth * maxHeight) / curHeight);
            curHeight = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = curWidth;
        canvas.height = curHeight;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          const raw = evt.target?.result as string;
          if (raw.length > MAX_BASE64_LENGTH) {
            reject(new Error('Imagem muito grande para armazenamento. Escolha uma imagem menor.'));
          } else {
            resolve(raw);
          }
          return;
        }

        // Fill white background for transparent images converted to JPEG
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, curWidth, curHeight);
        ctx.drawImage(img, 0, 0, curWidth, curHeight);

        // Note: PNG toDataURL ignores quality parameter in browsers, so use JPEG or WebP for compression
        const format = outputType || (file.type === 'image/webp' ? 'image/webp' : 'image/jpeg');
        let currentQuality = quality;
        let compressed = canvas.toDataURL(format, currentQuality);

        // Iteratively downscale dimensions & quality if image string length > MAX_BASE64_LENGTH
        let attempts = 0;
        while (compressed.length > MAX_BASE64_LENGTH && attempts < 10) {
          attempts++;
          curWidth = Math.max(250, Math.round(curWidth * 0.75));
          curHeight = Math.max(250, Math.round(curHeight * 0.75));
          currentQuality = Math.max(0.2, currentQuality - 0.12);

          canvas.width = curWidth;
          canvas.height = curHeight;
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, curWidth, curHeight);
          ctx.drawImage(img, 0, 0, curWidth, curHeight);
          compressed = canvas.toDataURL('image/jpeg', currentQuality);
        }

        if (compressed.length > 800000) {
          reject(new Error('A imagem é muito pesada. Por favor, selecione um arquivo menor ou em formato JPG.'));
          return;
        }

        resolve(compressed);
      };
      img.src = evt.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
};

interface AdminViewProps {
  onNavigateToTab: (tab: 'inicio' | 'sobre' | 'servicos' | 'projetos' | 'blog' | 'contato') => void;
}

export const AdminView: React.FC<AdminViewProps> = ({ onNavigateToTab }) => {
  const {
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
    resetToDefaultData
  } = useSiteData();

  // SHA-256 Hash of "Antonia1#"
  const SECURE_PASSWORD_HASH = 'e218440d0b94b384218f7b6face3f8f051251c787e91ce378b1b59dc0e478145';

  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedAuth = sessionStorage.getItem('mr_admin_auth');
      return savedAuth === `true_${SECURE_PASSWORD_HASH}`;
    }
    return false;
  });
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockoutTimeLeft, setLockoutTimeLeft] = useState(0);

  useEffect(() => {
    if (lockoutTimeLeft <= 0) return;
    const interval = setInterval(() => {
      setLockoutTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setAuthError('');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [lockoutTimeLeft]);

  const [adminTab, setAdminTab] = useState<'dashboard' | 'about' | 'projects' | 'services' | 'blog' | 'contact' | 'inbox' | 'home'>('dashboard');

  // Messages & Quotes inbox state
  const [messagesList, setMessagesList] = useState<any[]>([]);
  const [quotesList, setQuotesList] = useState<any[]>([]);

  // Home Images Upload State
  const [isUploadingHeroImage, setIsUploadingHeroImage] = useState(false);
  const [isUploadingHomeAboutImage, setIsUploadingHomeAboutImage] = useState(false);
  const [isHeroDragOver, setIsHeroDragOver] = useState(false);
  const [isHomeAboutDragOver, setIsHomeAboutDragOver] = useState(false);
  const heroImageFileInputRef = useRef<HTMLInputElement | null>(null);
  const homeAboutImageFileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!isAuthenticated) return;

    const unsubMsgs = onSnapshot(collection(db, 'contactMessages'), (snapshot) => {
      const items: any[] = [];
      snapshot.forEach((docSnap) => {
        items.push({ id: docSnap.id, ...docSnap.data() });
      });
      items.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
      setMessagesList(items);
    });

    const unsubQuotes = onSnapshot(collection(db, 'quoteRequests'), (snapshot) => {
      const items: any[] = [];
      snapshot.forEach((docSnap) => {
        items.push({ id: docSnap.id, ...docSnap.data() });
      });
      items.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
      setQuotesList(items);
    });

    return () => {
      unsubMsgs();
      unsubQuotes();
    };
  }, [isAuthenticated]);

  // Contact Form State
  const [contactForm, setContactForm] = useState<SiteContactInfo>(siteInfo);

  // About Form State
  const [aboutForm, setAboutForm] = useState<AboutInfo>(aboutInfo);
  const [isUploadingAboutHeroImage, setIsUploadingAboutHeroImage] = useState(false);
  const [isUploadingAboutOfficeImage, setIsUploadingAboutOfficeImage] = useState(false);
  const [isAboutHeroDragOver, setIsAboutHeroDragOver] = useState(false);
  const [isAboutOfficeDragOver, setIsAboutOfficeDragOver] = useState(false);
  const aboutHeroFileInputRef = useRef<HTMLInputElement | null>(null);
  const aboutOfficeFileInputRef = useRef<HTMLInputElement | null>(null);

  // Logo Upload State
  const [isUploadingHeaderLogo, setIsUploadingHeaderLogo] = useState(false);
  const [isUploadingFooterLogo, setIsUploadingFooterLogo] = useState(false);
  const headerLogoFileInputRef = useRef<HTMLInputElement | null>(null);
  const footerLogoFileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (siteInfo) {
      queueMicrotask(() => {
        setContactForm(siteInfo);
      });
    }
  }, [siteInfo]);

  useEffect(() => {
    if (aboutInfo) {
      queueMicrotask(() => {
        setAboutForm(aboutInfo);
      });
    }
  }, [aboutInfo]);

  const handleSaveContact = (e: React.FormEvent) => {
    e.preventDefault();
    updateSiteInfo(contactForm);
    triggerToast('Informações de contato e dados do site atualizados com sucesso!');
  };

  const handleSaveAbout = (e: React.FormEvent) => {
    e.preventDefault();
    updateAboutInfo(aboutForm);
    triggerToast('Página "Sobre" atualizada com sucesso!');
  };

  const processAboutHeroFile = async (file: File) => {
    if (!file) return;
    setIsUploadingAboutHeroImage(true);
    try {
      const compressed = await compressImageFile(file, 1200, 1200, 0.82);
      const updated = { ...aboutForm, heroImage: compressed };
      setAboutForm(updated);
      await updateAboutInfo(updated);
      triggerToast('Imagem do cabeçalho Sobre salva e sincronizada em todos os dispositivos!');
    } catch (err: any) {
      console.error(err);
      triggerToast(err?.message || 'Erro ao carregar a imagem.');
    } finally {
      setIsUploadingAboutHeroImage(false);
    }
  };

  const processAboutOfficeFile = async (file: File) => {
    if (!file) return;
    setIsUploadingAboutOfficeImage(true);
    try {
      const compressed = await compressImageFile(file, 1200, 1200, 0.82);
      const updated = { ...aboutForm, officeImage: compressed };
      setAboutForm(updated);
      await updateAboutInfo(updated);
      triggerToast('Imagem do escritório salva e sincronizada em todos os dispositivos!');
    } catch (err: any) {
      console.error(err);
      triggerToast(err?.message || 'Erro ao carregar a imagem.');
    } finally {
      setIsUploadingAboutOfficeImage(false);
    }
  };

  const processHeroImageFile = async (file: File) => {
    if (!file) return;
    setIsUploadingHeroImage(true);
    try {
      const compressed = await compressImageFile(file, 1600, 1200, 0.88);
      const updated = { ...contactForm, heroImageUrl: compressed };
      setContactForm(updated);
      await updateSiteInfo(updated);
      triggerToast('Imagem do banner principal salva e atualizada no site!');
    } catch (err: any) {
      console.error(err);
      triggerToast(err?.message || 'Erro ao carregar a imagem do banner.');
    } finally {
      setIsUploadingHeroImage(false);
    }
  };

  const processHomeAboutImageFile = async (file: File) => {
    if (!file) return;
    setIsUploadingHomeAboutImage(true);
    try {
      const compressed = await compressImageFile(file, 1200, 900, 0.85);
      const updated = { ...contactForm, homeAboutImageUrl: compressed };
      setContactForm(updated);
      await updateSiteInfo(updated);
      triggerToast('Imagem da seção Quem Somos salva e atualizada no site!');
    } catch (err: any) {
      console.error(err);
      triggerToast(err?.message || 'Erro ao carregar a imagem.');
    } finally {
      setIsUploadingHomeAboutImage(false);
    }
  };

  const processHeaderLogoFile = async (file: File) => {
    if (!file) return;
    setIsUploadingHeaderLogo(true);
    try {
      let resultUrl = '';
      if (file.type === 'image/svg+xml') {
        resultUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
      } else {
        resultUrl = await compressImageFile(file, 800, 800, 0.9);
      }
      const updated = { ...contactForm, headerLogoUrl: resultUrl };
      setContactForm(updated);
      await updateSiteInfo(updated);
      triggerToast('Logo do cabeçalho salva e sincronizada em todos os dispositivos!');
    } catch (err: any) {
      console.error(err);
      triggerToast(err?.message || 'Erro ao carregar a logo do cabeçalho.');
    } finally {
      setIsUploadingHeaderLogo(false);
    }
  };

  const processFooterLogoFile = async (file: File) => {
    if (!file) return;
    setIsUploadingFooterLogo(true);
    try {
      let resultUrl = '';
      if (file.type === 'image/svg+xml') {
        resultUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
      } else {
        resultUrl = await compressImageFile(file, 800, 800, 0.9);
      }
      const updated = { ...contactForm, footerLogoUrl: resultUrl };
      setContactForm(updated);
      await updateSiteInfo(updated);
      triggerToast('Logo do rodapé salva e sincronizada em todos os dispositivos!');
    } catch (err: any) {
      console.error(err);
      triggerToast(err?.message || 'Erro ao carregar a logo do rodapé.');
    } finally {
      setIsUploadingFooterLogo(false);
    }
  };

  const handleRemoveHeaderLogo = async () => {
    const updated = { ...contactForm, headerLogoUrl: '' };
    setContactForm(updated);
    await updateSiteInfo(updated);
    triggerToast('Logo do cabeçalho restaurada em todos os dispositivos!');
  };

  const handleUseHeaderLogoForFooter = async () => {
    const updated = { ...contactForm, footerLogoUrl: contactForm.headerLogoUrl };
    setContactForm(updated);
    await updateSiteInfo(updated);
    triggerToast('Logo do rodapé sincronizada com a do cabeçalho!');
  };

  const handleRemoveFooterLogo = async () => {
    const updated = { ...contactForm, footerLogoUrl: '' };
    setContactForm(updated);
    await updateSiteInfo(updated);
    triggerToast('Logo do rodapé restaurada em todos os dispositivos!');
  };

  // Services Hero Image State
  const [isUploadingServicesHeroImage, setIsUploadingServicesHeroImage] = useState(false);
  const [isServicesHeroDragOver, setIsServicesHeroDragOver] = useState(false);
  const servicesHeroFileInputRef = useRef<HTMLInputElement | null>(null);

  const processServicesHeroFile = async (file: File) => {
    if (!file) return;
    setIsUploadingServicesHeroImage(true);
    try {
      const compressed = await compressImageFile(file, 1600, 1200, 0.88);
      const updated = { ...contactForm, servicesHeroImage: compressed };
      setContactForm(updated);
      await updateSiteInfo(updated);
      triggerToast('Imagem de capa da aba Serviços salva e sincronizada!');
    } catch (err: any) {
      console.error(err);
      triggerToast(err?.message || 'Erro ao carregar a imagem do cabeçalho de Serviços.');
    } finally {
      setIsUploadingServicesHeroImage(false);
    }
  };

  // Service Modal State
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [serviceForm, setServiceForm] = useState({
    title: '',
    shortDesc: '',
    fullDesc: '',
    iconName: 'Compass',
    imageUrl: '',
    benefitsText: '',
    deliverablesText: '',
  });
  const [isUploadingServiceImage, setIsUploadingServiceImage] = useState(false);
  const [isServiceImageDragOver, setIsServiceImageDragOver] = useState(false);
  const serviceImageFileInputRef = useRef<HTMLInputElement | null>(null);

  const processServiceImageFile = async (file: File) => {
    if (!file) return;
    setIsUploadingServiceImage(true);
    try {
      const compressed = await compressImageFile(file, 1200, 900, 0.85);
      setServiceForm((prev) => ({ ...prev, imageUrl: compressed }));
      triggerToast('Imagem do serviço anexada com sucesso!');
    } catch (err: any) {
      console.error(err);
      triggerToast(err?.message || 'Erro ao processar imagem do serviço.');
    } finally {
      setIsUploadingServiceImage(false);
    }
  };

  const getServiceIcon = (iconName: string) => {
    switch (iconName) {
      case 'Search': return <Search className="w-5 h-5 text-amber-400" />;
      case 'FileText': return <FileText className="w-5 h-5 text-amber-400" />;
      case 'Building2': return <Building2 className="w-5 h-5 text-amber-400" />;
      case 'FileCheck': return <FileCheck className="w-5 h-5 text-amber-400" />;
      case 'HardHat': return <HardHat className="w-5 h-5 text-amber-400" />;
      case 'Compass': return <Compass className="w-5 h-5 text-amber-400" />;
      case 'Flame': return <Flame className="w-5 h-5 text-amber-400" />;
      case 'Box': return <Box className="w-5 h-5 text-amber-400" />;
      default: return <Compass className="w-5 h-5 text-amber-400" />;
    }
  };

  const openNewServiceModal = () => {
    setEditingService(null);
    setServiceForm({
      title: '',
      shortDesc: '',
      fullDesc: '',
      iconName: 'Compass',
      imageUrl: '',
      benefitsText: 'Relatório detalhado\nDiagnóstico de falhas\nOrientações preventivas e corretivas',
      deliverablesText: 'Laudo fotográfico\nChecklist estrutural\nTermo de Vistoria',
    });
    setIsServiceModalOpen(true);
  };

  const openEditServiceModal = (service: Service) => {
    setEditingService(service);
    setServiceForm({
      title: service.title,
      shortDesc: service.shortDesc,
      fullDesc: service.fullDesc,
      iconName: service.iconName || 'Compass',
      imageUrl: service.imageUrl || service.image || '',
      benefitsText: service.benefits ? service.benefits.join('\n') : '',
      deliverablesText: service.deliverables ? service.deliverables.join('\n') : '',
    });
    setIsServiceModalOpen(true);
  };

  const handleSaveService = (e: React.FormEvent) => {
    e.preventDefault();
    const benefits = serviceForm.benefitsText
      .split('\n')
      .map((b) => b.trim())
      .filter(Boolean);
    const deliverables = serviceForm.deliverablesText
      .split('\n')
      .map((d) => d.trim())
      .filter(Boolean);

    const payload = {
      title: serviceForm.title,
      shortDesc: serviceForm.shortDesc,
      fullDesc: serviceForm.fullDesc,
      iconName: serviceForm.iconName,
      imageUrl: serviceForm.imageUrl,
      image: serviceForm.imageUrl,
      benefits,
      deliverables,
    };

    if (editingService) {
      updateService(editingService.id, payload);
      triggerToast(`Serviço "${serviceForm.title}" atualizado com sucesso!`);
    } else {
      addService(payload);
      triggerToast(`Novo serviço "${serviceForm.title}" cadastrado com sucesso!`);
    }
    setIsServiceModalOpen(false);
  };

  // Project Modal State
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [projectImages, setProjectImages] = useState<string[]>([]);
  const [newImageUrlInput, setNewImageUrlInput] = useState<string>('');
  const [projectForm, setProjectForm] = useState({
    title: '',
    category: 'ARQUITETÔNICO' as Project['category'],
    categoryLabel: 'PROJETO ARQUITETÔNICO',
    location: 'Parnaíba - PI',
    image: '',
    description: '',
    area: '150m²',
    year: '2024',
    featuresText: 'BIM 3D, Maquete Eletrônica, Compatibilização',
  });

  // Blog Modal State
  const [isBlogModalOpen, setIsBlogModalOpen] = useState(false);
  const [editingBlogPost, setEditingBlogPost] = useState<BlogPost | null>(null);
  const [blogForm, setBlogForm] = useState({
    title: '',
    category: 'vistorias',
    categoryLabel: 'Vistorias & Laudos',
    author: 'Eng. Mick Ramos',
    date: new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }),
    readTime: '4 min de leitura',
    image: '',
    excerpt: '',
    intro: '',
    point1Title: '',
    point1Text: '',
    point2Title: '',
    point2Text: '',
    warningBox: '',
    conclusion: '',
  });

  // File Upload & Drag-and-Drop States
  const [isUploadingProjectImages, setIsUploadingProjectImages] = useState(false);
  const [isUploadingBlogImage, setIsUploadingBlogImage] = useState(false);
  const [isProjectDragOver, setIsProjectDragOver] = useState(false);
  const [isBlogDragOver, setIsBlogDragOver] = useState(false);

  const projectFileInputRef = useRef<HTMLInputElement | null>(null);
  const blogFileInputRef = useRef<HTMLInputElement | null>(null);

  // Delete & Action Confirmation Modal State
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    type: 'delete_project' | 'delete_blog' | 'delete_service' | 'reset_defaults';
    id?: string;
    title?: string;
  }>({ isOpen: false, type: 'delete_project' });

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleConfirmAction = () => {
    if (confirmModal.type === 'delete_project' && confirmModal.id) {
      deleteProject(confirmModal.id);
      triggerToast(`Projeto "${confirmModal.title || ''}" excluído com sucesso!`);
    } else if (confirmModal.type === 'delete_blog' && confirmModal.id) {
      deleteBlogPost(confirmModal.id);
      triggerToast(`Artigo "${confirmModal.title || ''}" excluído com sucesso!`);
    } else if (confirmModal.type === 'delete_service' && confirmModal.id) {
      deleteService(confirmModal.id);
      triggerToast(`Serviço "${confirmModal.title || ''}" excluído com sucesso!`);
    } else if (confirmModal.type === 'reset_defaults') {
      resetToDefaultData();
      triggerToast('Dados originais do site restaurados com sucesso!');
    }
    setConfirmModal({ ...confirmModal, isOpen: false });
  };

  const hashPassword = async (pwd: string): Promise<string> => {
    const encoder = new TextEncoder();
    const data = encoder.encode(pwd);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (lockoutTimeLeft > 0 || isVerifying) return;

    if (!passwordInput.trim()) {
      setAuthError('Por favor, informe a senha de acesso.');
      return;
    }

    setIsVerifying(true);
    setAuthError('');

    // Artificial delay to prevent timing analysis attack
    await new Promise((resolve) => setTimeout(resolve, 350));

    try {
      const computedHash = await hashPassword(passwordInput);
      if (computedHash === SECURE_PASSWORD_HASH) {
        setIsAuthenticated(true);
        setFailedAttempts(0);
        setPasswordInput('');
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('mr_admin_auth', `true_${SECURE_PASSWORD_HASH}`);
        }
      } else {
        const nextAttempts = failedAttempts + 1;
        setFailedAttempts(nextAttempts);
        setPasswordInput('');
        if (nextAttempts >= 5) {
          setLockoutTimeLeft(60);
          setAuthError('Proteção Anti-Ataque Ativada: Excesso de tentativas incorretas. Aguarde 60 segundos.');
        } else {
          setAuthError(`Senha incorreta. Tentativa ${nextAttempts} de 5.`);
        }
      }
    } catch (err) {
      console.error(err);
      setAuthError('Erro ao verificar criptografia.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('mr_admin_auth');
    }
  };

  // Multiple project images upload processor
  const processProjectFiles = async (files: FileList | File[]) => {
    if (!files || files.length === 0) return;
    setIsUploadingProjectImages(true);
    try {
      const fileArray = Array.from(files);
      const compressedList = await Promise.all(
        fileArray.map((file) => compressImageFile(file))
      );

      setProjectImages((prev) => {
        // If previous array only had the single default Unsplash placeholder, replace it with new upload
        const isOnlyDefault = prev.length === 1 && prev[0].includes('images.unsplash.com');
        const base = isOnlyDefault ? [] : prev;
        return [...base, ...compressedList];
      });

      triggerToast(`${compressedList.length} foto(s) adicionada(s) ao projeto!`);
    } catch (err: any) {
      console.error(err);
      triggerToast(err?.message || 'Erro ao processar as imagens.');
    } finally {
      setIsUploadingProjectImages(false);
    }
  };

  const handleProjectFilesUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      processProjectFiles(e.target.files);
      e.target.value = '';
    }
  };

  const handleProjectDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsProjectDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processProjectFiles(e.dataTransfer.files);
    }
  };

  // Add project image via URL string
  const handleAddProjectImageUrl = () => {
    if (!newImageUrlInput.trim()) return;
    setProjectImages((prev) => {
      const isOnlyDefault = prev.length === 1 && prev[0].includes('images.unsplash.com');
      const base = isOnlyDefault ? [] : prev;
      return [...base, newImageUrlInput.trim()];
    });
    setNewImageUrlInput('');
    triggerToast('Imagem adicionada por URL!');
  };

  const handleRemoveProjectImage = (indexToRemove: number) => {
    setProjectImages((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleSetCoverProjectImage = (index: number) => {
    setProjectImages((prev) => {
      const copy = [...prev];
      const selected = copy.splice(index, 1)[0];
      return [selected, ...copy];
    });
    triggerToast('Imagem definida como Capa Principal!');
  };

  // Single blog image upload processor
  const processBlogFile = async (file: File) => {
    if (!file) return;
    setIsUploadingBlogImage(true);
    try {
      const compressed = await compressImageFile(file);
      setBlogForm((prev) => ({ ...prev, image: compressed }));
      triggerToast('Imagem de capa do artigo atualizada!');
    } catch (err: any) {
      console.error(err);
      triggerToast(err?.message || 'Erro ao carregar a imagem.');
    } finally {
      setIsUploadingBlogImage(false);
    }
  };

  const handleBlogFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processBlogFile(file);
      e.target.value = '';
    }
  };

  const handleBlogDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsBlogDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processBlogFile(file);
    }
  };

  // Open Project Form
  const openNewProjectModal = () => {
    setEditingProject(null);
    setProjectImages([]);
    setProjectForm({
      title: '',
      category: 'ARQUITETÔNICO',
      categoryLabel: 'PROJETO ARQUITETÔNICO',
      location: 'Parnaíba - PI',
      image: '',
      description: '',
      area: '180m²',
      year: new Date().getFullYear().toString(),
      featuresText: 'Projeto BIM 3D, Detalhamento Executivo, Aprovação na Prefeitura',
    });
    setIsProjectModalOpen(true);
  };

  const openEditProjectModal = (proj: Project) => {
    setEditingProject(proj);
    const imgs = proj.images && proj.images.length ? proj.images : (proj.image ? [proj.image] : []);
    setProjectImages(imgs);
    setProjectForm({
      title: proj.title,
      category: proj.category,
      categoryLabel: proj.categoryLabel,
      location: proj.location,
      image: proj.image,
      description: proj.description,
      area: proj.area,
      year: proj.year,
      featuresText: proj.features ? proj.features.join(', ') : '',
    });
    setIsProjectModalOpen(true);
  };

  const handleSaveProject = (e: React.FormEvent) => {
    e.preventDefault();
    const features = projectForm.featuresText
      .split(',')
      .map((f) => f.trim())
      .filter(Boolean);

    let catLabel = 'PROJETO ARQUITETÔNICO';
    if (projectForm.category === 'ESTRUTURAL') catLabel = 'PROJETO ESTRUTURAL';
    if (projectForm.category === 'HIDROSSANITÁRIO') catLabel = 'PROJETO HIDROSSANITÁRIO';
    if (projectForm.category === 'ELÉTRICO') catLabel = 'PROJETO ELÉTRICO';
    if (projectForm.category === 'PPCI') catLabel = 'PPCI / INCÊNDIO';

    const defaultCover = 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80';
    const finalImages = projectImages.length > 0 ? projectImages : [projectForm.image || defaultCover];
    const mainCover = finalImages[0];

    if (editingProject) {
      updateProject(editingProject.id, {
        title: projectForm.title,
        category: projectForm.category,
        categoryLabel: catLabel,
        location: projectForm.location,
        image: mainCover,
        images: finalImages,
        description: projectForm.description,
        area: projectForm.area,
        year: projectForm.year,
        features,
      });
      triggerToast(`Projeto "${projectForm.title}" atualizado com sucesso!`);
    } else {
      addProject({
        title: projectForm.title,
        category: projectForm.category,
        categoryLabel: catLabel,
        location: projectForm.location,
        image: mainCover,
        images: finalImages,
        description: projectForm.description,
        area: projectForm.area,
        year: projectForm.year,
        features,
      });
      triggerToast(`Projeto "${projectForm.title}" cadastrado com sucesso!`);
    }
    setIsProjectModalOpen(false);
  };

  // Open Blog Form
  const openNewBlogModal = () => {
    setEditingBlogPost(null);
    setBlogForm({
      title: '',
      category: 'vistorias',
      categoryLabel: 'Vistorias & Laudos',
      author: 'Eng. Mick Ramos',
      date: new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }),
      readTime: '4 min de leitura',
      image: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=600&q=80',
      excerpt: '',
      intro: '',
      point1Title: 'Identificação das causas técnicas',
      point1Text: 'A análise preliminar deve verificar a origem da patologia nas estruturas.',
      point2Title: 'Medidas corretivas recomendadas',
      point2Text: 'Aplicação de impermeabilização adequada segundo normas NBR ABNT.',
      warningBox: 'Consulte sempre um Engenheiro Civil habilitado antes de iniciar qualquer reforma estrutural.',
      conclusion: 'Investir em diagnóstico técnico especializado previne prejuízos acumulados e garante a segurança do imóvel.',
    });
    setIsBlogModalOpen(true);
  };

  const openEditBlogModal = (post: BlogPost) => {
    setEditingBlogPost(post);
    setBlogForm({
      title: post.title,
      category: post.category,
      categoryLabel: post.categoryLabel,
      author: post.author,
      date: post.date,
      readTime: post.readTime,
      image: post.image,
      excerpt: post.excerpt,
      intro: post.content.intro,
      point1Title: post.content.points[0]?.title || '',
      point1Text: post.content.points[0]?.text || '',
      point2Title: post.content.points[1]?.title || '',
      point2Text: post.content.points[1]?.text || '',
      warningBox: post.content.warningBox || '',
      conclusion: post.content.conclusion,
    });
    setIsBlogModalOpen(true);
  };

  const handleSaveBlogPost = (e: React.FormEvent) => {
    e.preventDefault();

    const catObj = BLOG_CATEGORIES.find((c) => c.id === blogForm.category);
    const catLabel = catObj ? catObj.label : 'Geral';

    const points = [];
    if (blogForm.point1Title) points.push({ title: blogForm.point1Title, text: blogForm.point1Text });
    if (blogForm.point2Title) points.push({ title: blogForm.point2Title, text: blogForm.point2Text });

    const content = {
      intro: blogForm.intro,
      points,
      warningBox: blogForm.warningBox || undefined,
      conclusion: blogForm.conclusion,
    };

    if (editingBlogPost) {
      updateBlogPost(editingBlogPost.id, {
        title: blogForm.title,
        category: blogForm.category,
        categoryLabel: catLabel,
        author: blogForm.author,
        date: blogForm.date,
        readTime: blogForm.readTime,
        image: blogForm.image || 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=600&q=80',
        excerpt: blogForm.excerpt,
        content,
      });
    } else {
      addBlogPost({
        title: blogForm.title,
        category: blogForm.category,
        categoryLabel: catLabel,
        author: blogForm.author,
        date: blogForm.date,
        readTime: blogForm.readTime,
        image: blogForm.image || 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=600&q=80',
        excerpt: blogForm.excerpt,
        content,
      });
    }
    setIsBlogModalOpen(false);
  };

  // LOGIN SCREEN
  if (!isAuthenticated) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center bg-slate-900 py-16 px-4">
        <div className="w-full max-w-md bg-slate-950 border border-amber-500/30 rounded-2xl p-8 shadow-2xl space-y-6 text-center relative overflow-hidden">
          
          <div className="w-16 h-16 bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
            <ShieldCheck className="w-8 h-8 text-amber-400" />
          </div>

          <div>
            <h1 className="text-2xl font-serif font-bold text-white">
              Painel Administrativo Restrito
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              MR Engenharia Civil • Gestão e Segurança
            </p>
          </div>

          <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-800 text-[11px] text-slate-300 flex items-center justify-center gap-2">
            <ShieldAlert className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>Acesso protegido com criptografia SHA-256 e proteção anti-ataque.</span>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="Informe a senha do painel..."
                disabled={lockoutTimeLeft > 0 || isVerifying}
                className="w-full pl-4 pr-11 py-3.5 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-center text-sm font-mono focus:outline-none focus:ring-2 focus:ring-amber-500 disabled:opacity-50"
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-amber-400 transition-colors p-1"
                title={showPassword ? 'Ocultar senha' : 'Exibir senha'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {authError && (
              <div className="p-3 bg-red-950/60 border border-red-500/40 rounded-xl text-xs text-red-300 font-medium">
                {authError}
              </div>
            )}

            {lockoutTimeLeft > 0 && (
              <div className="p-3 bg-amber-950/60 border border-amber-500/40 rounded-xl text-xs text-amber-300 font-mono">
                Aguarde <strong>{lockoutTimeLeft}s</strong> para tentar novamente.
              </div>
            )}

            <button
              type="submit"
              disabled={lockoutTimeLeft > 0 || isVerifying}
              className="w-full py-3.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs uppercase tracking-widest rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isVerifying ? (
                <span>VERIFICANDO CRIPTOGRAFIA...</span>
              ) : (
                <>
                  <Unlock className="w-4 h-4" />
                  <span>ACESSAR PAINEL SEGURO</span>
                </>
              )}
            </button>
          </form>

          <p className="text-[10px] text-slate-500 pt-2 border-t border-slate-800/80">
            Acesso monitorado e exclusivo para Eng. Mick Ramos • CREA/PI
          </p>

        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-950 text-slate-100 font-sans min-h-screen">

      {/* ADMIN HEADER */}
      <section className="bg-[#0A1128] border-b border-amber-500/20 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          
          <div className="flex items-center gap-3 text-center sm:text-left">
            <div className="p-3 bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded-xl">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-serif font-bold text-white">
                  Painel de Gestão do Site
                </h1>
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-mono uppercase font-bold">
                  Ativo
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Gerencie todos os projetos e artigos do blog da MR Engenharia Civil em tempo real.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setConfirmModal({
                isOpen: true,
                type: 'reset_defaults',
                title: 'Restaurar Dados Originais'
              })}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors"
              title="Restaurar dados originais de fábrica"
            >
              <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
              <span>Restaurar Padrões</span>
            </button>

            <button
              onClick={handleLogout}
              className="px-3.5 py-2 rounded-xl bg-red-950/50 hover:bg-red-900/60 border border-red-500/30 text-red-300 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Sair</span>
            </button>
          </div>

        </div>
      </section>

      {/* ADMIN NAV TABS */}
      <section className="bg-slate-900 border-b border-slate-800 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center gap-4 overflow-x-auto no-scrollbar py-3">
          
          <button
            onClick={() => setAdminTab('dashboard')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all ${
              adminTab === 'dashboard'
                ? 'bg-amber-500 text-slate-950 shadow-md font-extrabold'
                : 'bg-slate-800/60 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Visão Geral</span>
          </button>

          <button
            onClick={() => {
              setContactForm(siteInfo);
              setAdminTab('home');
            }}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all ${
              adminTab === 'home'
                ? 'bg-amber-500 text-slate-950 shadow-md font-extrabold'
                : 'bg-slate-800/60 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Imagens do Início</span>
          </button>

          <button
            onClick={() => setAdminTab('projects')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all ${
              adminTab === 'projects'
                ? 'bg-amber-500 text-slate-950 shadow-md font-extrabold'
                : 'bg-slate-800/60 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <FolderKanban className="w-4 h-4" />
            <span>Gerenciar Projetos ({projects.length})</span>
          </button>

          <button
            onClick={() => setAdminTab('services')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all ${
              adminTab === 'services'
                ? 'bg-amber-500 text-slate-950 shadow-md font-extrabold'
                : 'bg-slate-800/60 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>Gerenciar Serviços ({services.length})</span>
          </button>

          <button
            onClick={() => {
              setAboutForm(aboutInfo);
              setAdminTab('about');
            }}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all ${
              adminTab === 'about'
                ? 'bg-amber-500 text-slate-950 shadow-md font-extrabold'
                : 'bg-slate-800/60 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Gerenciar Sobre</span>
          </button>

          <button
            onClick={() => setAdminTab('blog')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all ${
              adminTab === 'blog'
                ? 'bg-amber-500 text-slate-950 shadow-md font-extrabold'
                : 'bg-slate-800/60 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Gerenciar Blog ({blogPosts.length})</span>
          </button>

          <button
            onClick={() => {
              setContactForm(siteInfo);
              setAdminTab('contact');
            }}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all ${
              adminTab === 'contact'
                ? 'bg-amber-500 text-slate-950 shadow-md font-extrabold'
                : 'bg-slate-800/60 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Phone className="w-4 h-4" />
            <span>Gerenciar Contato</span>
          </button>

          <button
            onClick={() => setAdminTab('inbox')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all ${
              adminTab === 'inbox'
                ? 'bg-amber-500 text-slate-950 shadow-md font-extrabold'
                : 'bg-slate-800/60 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Inbox className="w-4 h-4" />
            <span>Mensagens & Orçamentos ({messagesList.length + quotesList.length})</span>
          </button>

        </div>
      </section>

      {/* TAB CONTENT */}
      <section className="py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
        
        {/* DASHBOARD TAB */}
        {adminTab === 'dashboard' && (
          <div className="space-y-8">
            
            {/* STATS CARDS GRID */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              
              <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block">
                  PROJETOS CADASTRADOS
                </span>
                <div className="text-3xl font-serif font-bold text-white">
                  {projects.length}
                </div>
                <p className="text-xs text-slate-400">
                  Cadastrados no portfólio do site
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block">
                  SERVIÇOS OFERECIDOS
                </span>
                <div className="text-3xl font-serif font-bold text-white">
                  {services.length}
                </div>
                <p className="text-xs text-slate-400">
                  Especialidades de engenharia
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block">
                  ARTIGOS PUBLICADOS
                </span>
                <div className="text-3xl font-serif font-bold text-white">
                  {blogPosts.length}
                </div>
                <p className="text-xs text-slate-400">
                  Artigos técnicos disponíveis no blog
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block">
                  CATEGORIAS ATIVAS
                </span>
                <div className="text-3xl font-serif font-bold text-white">
                  {BLOG_CATEGORIES.length - 1}
                </div>
                <p className="text-xs text-slate-400">
                  Áreas de especialidade no blog
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block">
                  STATUS DE SINCRONIZAÇÃO
                </span>
                <div className="text-base font-serif font-bold text-white flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Online & Ativo</span>
                </div>
                <p className="text-xs text-slate-400">
                  Armazenamento em LocalStorage ativo
                </p>
              </div>

            </div>

            {/* QUICK ACTIONS BANNER */}
            <div className="p-8 rounded-2xl bg-[#0A1128] border border-amber-500/30 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="space-y-2 text-center md:text-left">
                <h3 className="text-xl font-serif font-bold text-white">
                  O que você deseja fazer agora?
                </h3>
                <p className="text-xs text-slate-300">
                  Adicione novos projetos finalizados ou publique artigos informativos para seus clientes.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={() => {
                    setAdminTab('projects');
                    openNewProjectModal();
                  }}
                  className="px-5 py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center gap-2 shadow-md"
                >
                  <Plus className="w-4 h-4" />
                  <span>NOVO PROJETO</span>
                </button>

                <button
                  onClick={() => {
                    setAdminTab('blog');
                    openNewBlogModal();
                  }}
                  className="px-5 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center gap-2 border border-slate-700"
                >
                  <Plus className="w-4 h-4 text-amber-400" />
                  <span>NOVO ARTIGO NO BLOG</span>
                </button>

                <button
                  onClick={() => {
                    setAboutForm(aboutInfo);
                    setAdminTab('about');
                  }}
                  className="px-5 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center gap-2 border border-slate-700"
                >
                  <User className="w-4 h-4 text-amber-400" />
                  <span>EDITAR PÁGINA SOBRE</span>
                </button>

                <button
                  onClick={() => {
                    setContactForm(siteInfo);
                    setAdminTab('contact');
                  }}
                  className="px-5 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center gap-2 border border-slate-700"
                >
                  <Phone className="w-4 h-4 text-amber-400" />
                  <span>EDITAR DADOS DE CONTATO</span>
                </button>
              </div>
            </div>

            {/* PREVIEW WEBPAGE LINK BOX */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                <h4 className="font-serif font-bold text-white text-base flex items-center gap-2">
                  <FolderKanban className="w-5 h-5 text-amber-400" />
                  <span>Ver Página de Projetos no Site</span>
                </h4>
                <p className="text-xs text-slate-400">
                  Veja como os clientes visualizam a galeria de projetos e portfólio da MR Engenharia.
                </p>
                <button
                  onClick={() => onNavigateToTab('projetos')}
                  className="inline-flex items-center gap-2 text-xs font-bold text-amber-400 hover:underline"
                >
                  <span>Ir para Aba de Projetos</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                <h4 className="font-serif font-bold text-white text-base flex items-center gap-2">
                  <FileText className="w-5 h-5 text-amber-400" />
                  <span>Ver Página do Blog no Site</span>
                </h4>
                <p className="text-xs text-slate-400">
                  Confira como os artigos publicados ficam dispostos no layout público.
                </p>
                <button
                  onClick={() => onNavigateToTab('blog')}
                  className="inline-flex items-center gap-2 text-xs font-bold text-amber-400 hover:underline"
                >
                  <span>Ir para Aba do Blog</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

            </div>

          </div>
        )}

        {/* PROJECTS TAB MANAGER */}
        {adminTab === 'projects' && (
          <div className="space-y-6">
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <h2 className="text-xl font-serif font-bold text-white">
                  Gerenciamento de Projetos ({projects.length})
                </h2>
                <p className="text-xs text-slate-400">
                  Inclua, edite ou exclua projetos do portfólio público.
                </p>
              </div>

              <button
                onClick={openNewProjectModal}
                className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center gap-2 shadow-lg"
              >
                <Plus className="w-4 h-4" />
                <span>ADICIONAR PROJETO</span>
              </button>
            </div>

            {/* PROJECTS LIST TABLE */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-[#0A1128] text-amber-400 uppercase text-[10px] tracking-wider font-mono border-b border-slate-800">
                    <tr>
                      <th className="p-4">Capa</th>
                      <th className="p-4">Título do Projeto</th>
                      <th className="p-4">Categoria</th>
                      <th className="p-4">Localização / Área</th>
                      <th className="p-4 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {projects.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-800/50 transition-colors">
                        <td className="p-4">
                          <img
                            src={p.image}
                            alt={p.title}
                            className="w-14 h-10 object-cover rounded-lg border border-slate-700 bg-slate-950"
                          />
                        </td>
                        <td className="p-4">
                          <strong className="text-white text-sm block font-serif">{p.title}</strong>
                          <span className="text-[11px] text-slate-500 line-clamp-1">{p.description}</span>
                        </td>
                        <td className="p-4">
                          <span className="px-2.5 py-1 rounded bg-amber-500/10 text-amber-300 font-mono text-[10px] uppercase font-bold border border-amber-500/20">
                            {p.category}
                          </span>
                        </td>
                        <td className="p-4 text-slate-400">
                          <div>{p.location}</div>
                          <div className="text-[10px] text-slate-500">{p.area} • {p.year}</div>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => openEditProjectModal(p)}
                              className="p-2 rounded-lg bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-slate-300 transition-colors"
                              title="Editar"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setConfirmModal({
                                isOpen: true,
                                type: 'delete_project',
                                id: p.id,
                                title: p.title
                              })}
                              className="p-2 rounded-lg bg-red-950/40 border border-red-500/30 text-red-400 hover:bg-red-900 transition-colors"
                              title="Excluir Projeto"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* SERVICES TAB MANAGER */}
        {adminTab === 'services' && (
          <div className="space-y-8 animate-in fade-in duration-300">
            
            {/* 1. SEÇÃO DE IMAGEM DA ABA SERVIÇOS (HEADER HERO BANNER) */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                <div>
                  <h2 className="text-xl font-serif font-bold text-white flex items-center gap-2">
                    <ImageIcon className="w-5 h-5 text-amber-400" />
                    <span>Imagem Principal da Aba &quot;Serviços&quot;</span>
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Altere a foto de destaque do cabeçalho da página de Serviços no site.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                {/* Live Preview */}
                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Pré-visualização do Cabeçalho</span>
                  <div className="relative rounded-xl overflow-hidden shadow-lg border border-slate-700 bg-slate-950 group">
                    <img
                      src={contactForm.servicesHeroImage || "https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=800&q=80"}
                      alt="Capa da Aba Serviços"
                      className="w-full h-44 object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end p-3">
                      <span className="text-xs font-bold text-amber-400 font-serif">
                        Aba Serviços • Banner de Topo
                      </span>
                    </div>
                  </div>
                </div>

                {/* Drop Zone & Controls */}
                <div className="space-y-3">
                  <div
                    onDragOver={(e) => { e.preventDefault(); setIsServicesHeroDragOver(true); }}
                    onDragLeave={() => setIsServicesHeroDragOver(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsServicesHeroDragOver(false);
                      const file = e.dataTransfer.files?.[0];
                      if (file) processServicesHeroFile(file);
                    }}
                    className={`p-4 rounded-xl border-2 border-dashed transition-all text-center space-y-2 ${
                      isServicesHeroDragOver
                        ? 'border-amber-400 bg-amber-500/10'
                        : 'border-slate-800 bg-slate-950 hover:border-slate-700'
                    }`}
                  >
                    <input
                      type="file"
                      ref={servicesHeroFileInputRef}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) processServicesHeroFile(file);
                      }}
                      accept="image/*"
                      className="hidden"
                    />

                    <div className="w-10 h-10 mx-auto rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                      <FileUp className="w-5 h-5" />
                    </div>

                    <div>
                      <p className="text-xs font-bold text-white">
                        Arraste e solte uma nova imagem para a capa da aba Serviços
                      </p>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        ou clique para selecionar do seu dispositivo (JPG, PNG, WEBP)
                      </p>
                    </div>

                    <div className="pt-1 flex justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => servicesHeroFileInputRef.current?.click()}
                        disabled={isUploadingServicesHeroImage}
                        className="px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center gap-1.5"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>{isUploadingServicesHeroImage ? 'Processando...' : 'Fazer Upload de Foto'}</span>
                      </button>

                      {contactForm.servicesHeroImage && (
                        <button
                          type="button"
                          onClick={async () => {
                            const updated = { ...contactForm, servicesHeroImage: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=800&q=80' };
                            setContactForm(updated);
                            await updateSiteInfo(updated);
                            triggerToast('Imagem do cabeçalho de Serviços restaurada para a padrão!');
                          }}
                          className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs uppercase tracking-wider rounded-xl transition-colors"
                          title="Restaurar Imagem Padrão"
                        >
                          <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 mb-1">
                      Ou informe o link direto (URL) da imagem:
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={contactForm.servicesHeroImage || ''}
                        onChange={(e) => setContactForm({ ...contactForm, servicesHeroImage: e.target.value })}
                        placeholder="https://images.unsplash.com/..."
                        className="flex-1 px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={async () => {
                          await updateSiteInfo(contactForm);
                          triggerToast('URL da imagem do cabeçalho de Serviços salva!');
                        }}
                        className="px-3 py-2 bg-amber-500/20 text-amber-300 hover:bg-amber-500 hover:text-slate-950 font-bold text-xs rounded-xl transition-colors shrink-0"
                      >
                        Salvar URL
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. GERENCIAMENTO DE SERVIÇOS CADASTRADOS */}
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                <div>
                  <h2 className="text-xl font-serif font-bold text-white flex items-center gap-2">
                    <Compass className="w-5 h-5 text-amber-400" />
                    <span>Serviços Cadastrados no Site ({services.length})</span>
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Cadastre, edite fotos, títulos, descrições e entregáveis dos serviços oferecidos.
                  </p>
                </div>

                <button
                  onClick={openNewServiceModal}
                  className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center gap-2 shadow-lg"
                >
                  <Plus className="w-4 h-4" />
                  <span>CADASTRAR NOVO SERVIÇO</span>
                </button>
              </div>

              {/* SERVICES LIST TABLE */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-[#0A1128] text-amber-400 uppercase text-[10px] tracking-wider font-mono border-b border-slate-800">
                      <tr>
                        <th className="p-4">Foto / Ícone</th>
                        <th className="p-4">Título do Serviço</th>
                        <th className="p-4">Descrição Curta</th>
                        <th className="p-4">Entregáveis</th>
                        <th className="p-4 text-right">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {services.map((s) => {
                        const img = s.imageUrl || s.image || 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=600&q=80';
                        return (
                          <tr key={s.id} className="hover:bg-slate-800/50 transition-colors">
                            <td className="p-4">
                              <div className="relative w-14 h-10 rounded-lg overflow-hidden border border-slate-700 bg-slate-950">
                                <img
                                  src={img}
                                  alt={s.title}
                                  className="w-full h-full object-cover"
                                />
                                <div className="absolute bottom-0 right-0 p-0.5 bg-slate-950/80 rounded-tl">
                                  {getServiceIcon(s.iconName)}
                                </div>
                              </div>
                            </td>
                            <td className="p-4">
                              <strong className="text-white text-sm block font-serif uppercase">{s.title}</strong>
                            </td>
                            <td className="p-4 max-w-xs">
                              <p className="text-slate-400 text-xs line-clamp-2 leading-relaxed">{s.shortDesc}</p>
                            </td>
                            <td className="p-4">
                              <span className="px-2.5 py-1 rounded bg-amber-500/10 text-amber-300 font-mono text-[10px] uppercase font-bold border border-amber-500/20">
                                {s.deliverables ? `${s.deliverables.length} item(ns)` : 'Nenhum'}
                              </span>
                            </td>
                            <td className="p-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => openEditServiceModal(s)}
                                  className="p-2 rounded-lg bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-slate-300 transition-colors"
                                  title="Editar Serviço e Foto"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => setConfirmModal({
                                    isOpen: true,
                                    type: 'delete_service',
                                    id: s.id,
                                    title: s.title
                                  })}
                                  className="p-2 rounded-lg bg-red-950/40 border border-red-500/30 text-red-400 hover:bg-red-900 transition-colors"
                                  title="Excluir Serviço"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* BLOG TAB MANAGER */}
        {adminTab === 'blog' && (
          <div className="space-y-6">
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <h2 className="text-xl font-serif font-bold text-white">
                  Gerenciamento do Blog ({blogPosts.length})
                </h2>
                <p className="text-xs text-slate-400">
                  Escreva e publique novos artigos técnicos ou atualize postagens existentes.
                </p>
              </div>

              <button
                onClick={openNewBlogModal}
                className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center gap-2 shadow-lg"
              >
                <Plus className="w-4 h-4" />
                <span>NOVO ARTIGO NO BLOG</span>
              </button>
            </div>

            {/* BLOG LIST TABLE */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-[#0A1128] text-amber-400 uppercase text-[10px] tracking-wider font-mono border-b border-slate-800">
                    <tr>
                      <th className="p-4">Capa</th>
                      <th className="p-4">Título do Artigo</th>
                      <th className="p-4">Categoria</th>
                      <th className="p-4">Data / Autor</th>
                      <th className="p-4 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {blogPosts.map((post) => (
                      <tr key={post.id} className="hover:bg-slate-800/50 transition-colors">
                        <td className="p-4">
                          <img
                            src={post.image}
                            alt={post.title}
                            className="w-14 h-10 object-cover rounded-lg border border-slate-700 bg-slate-950"
                          />
                        </td>
                        <td className="p-4">
                          <strong className="text-white text-sm block font-serif">{post.title}</strong>
                          <span className="text-[11px] text-slate-500 line-clamp-1">{post.excerpt}</span>
                        </td>
                        <td className="p-4">
                          <span className="px-2.5 py-1 rounded bg-amber-500/10 text-amber-300 font-mono text-[10px] uppercase font-bold border border-amber-500/20">
                            {post.categoryLabel}
                          </span>
                        </td>
                        <td className="p-4 text-slate-400">
                          <div>{post.date}</div>
                          <div className="text-[10px] text-slate-500">{post.author}</div>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => openEditBlogModal(post)}
                              className="p-2 rounded-lg bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-slate-300 transition-colors"
                              title="Editar"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setConfirmModal({
                                isOpen: true,
                                type: 'delete_blog',
                                id: post.id,
                                title: post.title
                              })}
                              className="p-2 rounded-lg bg-red-950/40 border border-red-500/30 text-red-400 hover:bg-red-900 transition-colors"
                              title="Excluir Artigo"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* ABOUT TAB EDITING SECTION */}
        {adminTab === 'about' && (
          <div className="space-y-8 animate-in fade-in duration-300">
            
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-8">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
                <div>
                  <h2 className="text-xl font-serif font-bold text-white flex items-center gap-2">
                    <User className="w-5 h-5 text-amber-400" />
                    <span>Editar Conteúdo da Aba &quot;Sobre&quot;</span>
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Altere os textos do cabeçalho, a história da empresa, fotos do escritório, valores institucionais, estatísticas e credenciais.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setAboutForm(aboutInfo);
                    triggerToast('Valores recarregados dos dados salvos.');
                  }}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 self-start sm:self-auto"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
                  <span>Restaurar Salvos</span>
                </button>
              </div>

              <form onSubmit={handleSaveAbout} className="space-y-8">

                {/* 1. CABEÇALHO HERO */}
                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-amber-400 uppercase tracking-widest border-b border-slate-800 pb-2 flex items-center gap-2">
                    <span>1. Cabeçalho Principal (Hero)</span>
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">
                        Título do Cabeçalho *
                      </label>
                      <input
                        type="text"
                        value={aboutForm.heroTitle}
                        onChange={(e) => setAboutForm({ ...aboutForm, heroTitle: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">
                        Subtítulo do Cabeçalho *
                      </label>
                      <input
                        type="text"
                        value={aboutForm.heroSubtitle}
                        onChange={(e) => setAboutForm({ ...aboutForm, heroSubtitle: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
                        required
                      />
                    </div>
                  </div>

                  {/* UPLOAD CARDS DAS IMAGENS DA ABA SOBRE */}
                  <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
                    <div className="border-b border-slate-800 pb-2 flex items-center justify-between">
                      <div>
                        <label className="block text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
                          <Upload className="w-4 h-4 text-amber-400" />
                          <span>Imagem de Destaque do Cabeçalho da Aba Sobre</span>
                        </label>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Imagem exibida no topo da página &quot;Sobre&quot; em destaque.
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                      {/* Live Preview Card */}
                      <div className="space-y-2">
                        <span className="text-[10px] font-bold text-slate-400 uppercase block">Pré-visualização do Banner</span>
                        <div className="relative rounded-xl overflow-hidden shadow-lg border border-amber-500/30 bg-slate-900 group">
                          <img
                            src={aboutForm.heroImage || "https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=600&q=80"}
                            alt="Hero About Preview"
                            className="w-full h-44 object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end p-3">
                            <div className="text-white text-xs font-serif font-bold truncate">
                              {aboutForm.heroTitle || 'Sobre a MR Engenharia'}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Drop Zone & Buttons */}
                      <div className="space-y-3">
                        <div
                          onDragOver={(e) => { e.preventDefault(); setIsAboutHeroDragOver(true); }}
                          onDragLeave={() => setIsAboutHeroDragOver(false)}
                          onDrop={(e) => {
                            e.preventDefault();
                            setIsAboutHeroDragOver(false);
                            const file = e.dataTransfer.files?.[0];
                            if (file) processAboutHeroFile(file);
                          }}
                          className={`p-4 rounded-xl border-2 border-dashed transition-all text-center space-y-2 ${
                            isAboutHeroDragOver
                              ? 'border-amber-400 bg-amber-500/10'
                              : 'border-slate-800 bg-slate-900 hover:border-slate-700'
                          }`}
                        >
                          <input
                            type="file"
                            ref={aboutHeroFileInputRef}
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) processAboutHeroFile(file);
                            }}
                            accept="image/*"
                            className="hidden"
                          />

                          <div className="w-10 h-10 mx-auto rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                            <FileUp className="w-5 h-5" />
                          </div>

                          <div>
                            <p className="text-xs font-bold text-white">
                              Arraste e solte uma imagem aqui
                            </p>
                            <p className="text-[10px] text-slate-400 mt-0.5">
                              ou clique para selecionar um arquivo
                            </p>
                          </div>

                          <div className="pt-1 flex justify-center gap-2">
                            <button
                              type="button"
                              onClick={() => aboutHeroFileInputRef.current?.click()}
                              disabled={isUploadingAboutHeroImage}
                              className="px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center gap-1.5"
                            >
                              <Upload className="w-3.5 h-3.5" />
                              <span>{isUploadingAboutHeroImage ? 'Processando...' : 'Fazer Upload'}</span>
                            </button>

                            {aboutForm.heroImage && (
                              <button
                                type="button"
                                onClick={() => {
                                  const updated = { ...aboutForm, heroImage: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=600&q=80' };
                                  setAboutForm(updated);
                                  updateAboutInfo(updated);
                                  triggerToast('Imagem padrão do cabeçalho restaurada!');
                                }}
                                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs uppercase tracking-wider rounded-xl transition-colors"
                                title="Restaurar Imagem Padrão"
                              >
                                <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
                              </button>
                            )}
                          </div>
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-400 mb-1">
                            Ou informe a URL da Imagem:
                          </label>
                          <input
                            type="text"
                            value={aboutForm.heroImage || ''}
                            onChange={(e) => setAboutForm({ ...aboutForm, heroImage: e.target.value })}
                            placeholder="https://images.unsplash.com/..."
                            className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. APRESENTAÇÃO QUEM SOMOS */}
                <div className="space-y-4 pt-2">
                  <h3 className="text-xs font-bold text-amber-400 uppercase tracking-widest border-b border-slate-800 pb-2">
                    2. Apresentação &quot;Quem Somos&quot;
                  </h3>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Título Principal do Quem Somos *
                    </label>
                    <input
                      type="text"
                      value={aboutForm.whoWeAreTitle}
                      onChange={(e) => setAboutForm({ ...aboutForm, whoWeAreTitle: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Parágrafos da História / Apresentação (Separe parágrafos dando Enter duas vezes) *
                    </label>
                    <textarea
                      rows={5}
                      value={aboutForm.whoWeAreParagraphs.join('\n\n')}
                      onChange={(e) => {
                        const raw = e.target.value;
                        const paras = raw.split(/\n\s*\n/).map(p => p.trim()).filter(Boolean);
                        setAboutForm({ ...aboutForm, whoWeAreParagraphs: paras.length ? paras : [raw] });
                      }}
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none leading-relaxed"
                      required
                    />
                  </div>

                  {/* UPLOAD DA FOTO DO ESCRITÓRIO / EQUIPE */}
                  <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
                    <div className="border-b border-slate-800 pb-2 flex items-center justify-between">
                      <div>
                        <label className="block text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
                          <Upload className="w-4 h-4 text-amber-400" />
                          <span>Foto Institucional do Escritório / Equipe (Página Sobre)</span>
                        </label>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Exibida ao lado do texto da história institucional no bloco Quem Somos.
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                      {/* Live Preview Card */}
                      <div className="space-y-2">
                        <span className="text-[10px] font-bold text-slate-400 uppercase block">Pré-visualização na Seção</span>
                        <div className="relative rounded-xl overflow-hidden shadow-lg border border-slate-700 bg-slate-900 group">
                          <img
                            src={aboutForm.officeImage || "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80"}
                            alt="Office About Preview"
                            className="w-full h-48 object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end p-3">
                            <div className="text-white text-xs font-bold">
                              <span className="block text-amber-400 text-[10px] uppercase font-mono">{aboutForm.officeLocation || 'Parnaíba - PI'}</span>
                              <span>MR Engenharia</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Drop Zone & Controls */}
                      <div className="space-y-3">
                        <div
                          onDragOver={(e) => { e.preventDefault(); setIsAboutOfficeDragOver(true); }}
                          onDragLeave={() => setIsAboutOfficeDragOver(false)}
                          onDrop={(e) => {
                            e.preventDefault();
                            setIsAboutOfficeDragOver(false);
                            const file = e.dataTransfer.files?.[0];
                            if (file) processAboutOfficeFile(file);
                          }}
                          className={`p-4 rounded-xl border-2 border-dashed transition-all text-center space-y-2 ${
                            isAboutOfficeDragOver
                              ? 'border-amber-400 bg-amber-500/10'
                              : 'border-slate-800 bg-slate-900 hover:border-slate-700'
                          }`}
                        >
                          <input
                            type="file"
                            ref={aboutOfficeFileInputRef}
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) processAboutOfficeFile(file);
                            }}
                            accept="image/*"
                            className="hidden"
                          />

                          <div className="w-10 h-10 mx-auto rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                            <FileUp className="w-5 h-5" />
                          </div>

                          <div>
                            <p className="text-xs font-bold text-white">
                              Arraste e solte uma imagem aqui
                            </p>
                            <p className="text-[10px] text-slate-400 mt-0.5">
                              ou clique para escolher um arquivo do seu dispositivo
                            </p>
                          </div>

                          <div className="pt-1 flex justify-center gap-2">
                            <button
                              type="button"
                              onClick={() => aboutOfficeFileInputRef.current?.click()}
                              disabled={isUploadingAboutOfficeImage}
                              className="px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center gap-1.5"
                            >
                              <Upload className="w-3.5 h-3.5" />
                              <span>{isUploadingAboutOfficeImage ? 'Processando...' : 'Fazer Upload'}</span>
                            </button>

                            {aboutForm.officeImage && (
                              <button
                                type="button"
                                onClick={() => {
                                  const updated = { ...aboutForm, officeImage: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80' };
                                  setAboutForm(updated);
                                  updateAboutInfo(updated);
                                  triggerToast('Imagem do escritório restaurada para a padrão!');
                                }}
                                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs uppercase tracking-wider rounded-xl transition-colors"
                                title="Restaurar Imagem Padrão"
                              >
                                <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
                              </button>
                            )}
                          </div>
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-400 mb-1">
                            Legenda de Localização na Foto *
                          </label>
                          <input
                            type="text"
                            value={aboutForm.officeLocation || ''}
                            onChange={(e) => setAboutForm({ ...aboutForm, officeLocation: e.target.value })}
                            placeholder="Ex: Parnaíba - PI"
                            className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none mb-2"
                          />

                          <label className="block text-[11px] font-bold text-slate-400 mb-1">
                            Ou informe a URL da Imagem do Escritório:
                          </label>
                          <input
                            type="text"
                            value={aboutForm.officeImage || ''}
                            onChange={(e) => setAboutForm({ ...aboutForm, officeImage: e.target.value })}
                            placeholder="https://images.unsplash.com/..."
                            className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3. NOSSOS VALORES */}
                <div className="space-y-4 pt-2">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <h3 className="text-xs font-bold text-amber-400 uppercase tracking-widest">
                      3. Nossos Valores Institucionais
                    </h3>
                    <button
                      type="button"
                      onClick={() => {
                        setAboutForm((prev) => ({
                          ...prev,
                          values: [
                            ...prev.values,
                            { title: 'NOVO VALOR', description: 'Descrição do novo pilar...', iconName: 'ShieldCheck' }
                          ]
                        }));
                      }}
                      className="text-xs font-bold text-amber-400 hover:underline flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Adicionar Valor</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">
                        Título da Seção *
                      </label>
                      <input
                        type="text"
                        value={aboutForm.valuesTitle || 'NOSSOS VALORES'}
                        onChange={(e) => setAboutForm({ ...aboutForm, valuesTitle: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none uppercase"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">
                        Subtítulo da Seção *
                      </label>
                      <input
                        type="text"
                        value={aboutForm.valuesSubtitle || 'Pilares da Nossa Atuação'}
                        onChange={(e) => setAboutForm({ ...aboutForm, valuesSubtitle: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-3 pt-2">
                    {aboutForm.values.map((v, idx) => (
                      <div key={idx} className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3 relative">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-amber-400 font-mono">
                            VALOR #{idx + 1}
                          </span>
                          {aboutForm.values.length > 1 && (
                            <button
                              type="button"
                              onClick={() => {
                                setAboutForm((prev) => ({
                                  ...prev,
                                  values: prev.values.filter((_, i) => i !== idx)
                                }));
                              }}
                              className="text-red-400 hover:text-red-300 text-xs p-1"
                              title="Remover Valor"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div>
                            <label className="block text-[11px] font-bold text-slate-400 mb-1">Título</label>
                            <input
                              type="text"
                              value={v.title}
                              onChange={(e) => {
                                const newValues = [...aboutForm.values];
                                newValues[idx].title = e.target.value;
                                setAboutForm({ ...aboutForm, values: newValues });
                              }}
                              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs font-bold uppercase"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold text-slate-400 mb-1">Ícone</label>
                            <select
                              value={v.iconName || 'ShieldCheck'}
                              onChange={(e) => {
                                const newValues = [...aboutForm.values];
                                newValues[idx].iconName = e.target.value;
                                setAboutForm({ ...aboutForm, values: newValues });
                              }}
                              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs"
                            >
                              <option value="ShieldCheck">ShieldCheck (Segurança)</option>
                              <option value="Target">Target (Precisão)</option>
                              <option value="Scale">Scale (Responsabilidade)</option>
                              <option value="Eye">Eye (Transparência)</option>
                              <option value="Users">Users (Valorização)</option>
                              <option value="Award">Award (Qualidade)</option>
                            </select>
                          </div>

                          <div className="sm:col-span-3">
                            <label className="block text-[11px] font-bold text-slate-400 mb-1">Descrição</label>
                            <input
                              type="text"
                              value={v.description}
                              onChange={(e) => {
                                const newValues = [...aboutForm.values];
                                newValues[idx].description = e.target.value;
                                setAboutForm({ ...aboutForm, values: newValues });
                              }}
                              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 4. ESTATÍSTICAS DE IMPACTO */}
                <div className="space-y-4 pt-2">
                  <h3 className="text-xs font-bold text-amber-400 uppercase tracking-widest border-b border-slate-800 pb-2">
                    4. Estatísticas de Impacto (Faixa Azul)
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">
                        Clientes Atendidos *
                      </label>
                      <input
                        type="text"
                        value={aboutForm.stats.clients}
                        onChange={(e) => setAboutForm({
                          ...aboutForm,
                          stats: { ...aboutForm.stats, clients: e.target.value }
                        })}
                        placeholder="+150"
                        className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">
                        Projetos Desenvolvidos *
                      </label>
                      <input
                        type="text"
                        value={aboutForm.stats.projects}
                        onChange={(e) => setAboutForm({
                          ...aboutForm,
                          stats: { ...aboutForm.stats, projects: e.target.value }
                        })}
                        placeholder="+250"
                        className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">
                        Anos de Experiência *
                      </label>
                      <input
                        type="text"
                        value={aboutForm.stats.years}
                        onChange={(e) => setAboutForm({
                          ...aboutForm,
                          stats: { ...aboutForm.stats, years: e.target.value }
                        })}
                        placeholder="+8"
                        className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">
                        Texto Principal de Região de Atuação *
                      </label>
                      <input
                        type="text"
                        value={aboutForm.stats.region}
                        onChange={(e) => setAboutForm({
                          ...aboutForm,
                          stats: { ...aboutForm.stats, region: e.target.value }
                        })}
                        placeholder="Atuação em Parnaíba e região"
                        className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">
                        Subtítulo da Região *
                      </label>
                      <input
                        type="text"
                        value={aboutForm.stats.regionSubtitle}
                        onChange={(e) => setAboutForm({
                          ...aboutForm,
                          stats: { ...aboutForm.stats, regionSubtitle: e.target.value }
                        })}
                        placeholder="Piauí e vizinhança"
                        className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* 5. FORMAÇÃO, CREDENCIAIS E CITAÇÃO */}
                <div className="space-y-4 pt-2">
                  <h3 className="text-xs font-bold text-amber-400 uppercase tracking-widest border-b border-slate-800 pb-2">
                    5. Formação, Credenciais & Citação Inspiracional
                  </h3>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Título da Seção de Formação *
                    </label>
                    <input
                      type="text"
                      value={aboutForm.credentialsTitle}
                      onChange={(e) => setAboutForm({ ...aboutForm, credentialsTitle: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Lista de Credenciais / Qualificações (1 por linha) *
                    </label>
                    <textarea
                      rows={4}
                      value={aboutForm.credentialsList.join('\n')}
                      onChange={(e) => {
                        const list = e.target.value.split('\n').filter(Boolean);
                        setAboutForm({ ...aboutForm, credentialsList: list });
                      }}
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
                      required
                    />
                  </div>

                  <div className="p-4 bg-slate-950 border border-amber-500/20 rounded-xl space-y-4">
                    <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block">
                      Citação Inspiracional (Card Azul à Direita)
                    </span>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-400 mb-1">
                        Texto da Citação *
                      </label>
                      <textarea
                        rows={2}
                        value={aboutForm.quoteText}
                        onChange={(e) => setAboutForm({ ...aboutForm, quoteText: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs italic"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-400 mb-1">
                          Autor da Citação *
                        </label>
                        <input
                          type="text"
                          value={aboutForm.quoteAuthor}
                          onChange={(e) => setAboutForm({ ...aboutForm, quoteAuthor: e.target.value })}
                          className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs font-bold"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-400 mb-1">
                          Cargo / Registro CREA *
                        </label>
                        <input
                          type="text"
                          value={aboutForm.quoteRoleCrea}
                          onChange={(e) => setAboutForm({ ...aboutForm, quoteRoleCrea: e.target.value })}
                          className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs font-mono uppercase"
                          required
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* BOTÃO SALVAR */}
                <div className="pt-6 border-t border-slate-800 flex items-center justify-end gap-4">
                  <button
                    type="submit"
                    className="px-8 py-3.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs uppercase tracking-widest rounded-xl transition-all shadow-xl flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    <span>SALVAR ALTERAÇÕES DA PÁGINA SOBRE</span>
                  </button>
                </div>

              </form>

            </div>

          </div>
        )}

        {/* CONTACT TAB EDITING SECTION */}
        {adminTab === 'contact' && (
          <div className="space-y-8 animate-in fade-in duration-300">
            
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
                <div>
                  <h2 className="text-xl font-serif font-bold text-white flex items-center gap-2">
                    <Phone className="w-5 h-5 text-amber-400" />
                    <span>Editar Informações de Contato e Dados do Site</span>
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Altere telefone, WhatsApp, e-mail, endereço, horários de funcionamento e dados profissionais exibidos no site.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setContactForm(siteInfo);
                    triggerToast('Valores recarregados dos dados salvos.');
                  }}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 self-start sm:self-auto"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
                  <span>Restaurar Valores Salvos</span>
                </button>
              </div>

              <form onSubmit={handleSaveContact} className="space-y-6">
                
                {/* Seção 1: Identificação Profissional & Marca */}
                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-amber-400 uppercase tracking-widest border-b border-slate-800 pb-2">
                    1. Identificação Profissional & Marca
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">
                        Nome da Marca / Engenheiro *
                      </label>
                      <input
                        type="text"
                        value={contactForm.brandName}
                        onChange={(e) => setContactForm({ ...contactForm, brandName: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">
                        Título Profissional / Cargo *
                      </label>
                      <input
                        type="text"
                        value={contactForm.role}
                        onChange={(e) => setContactForm({ ...contactForm, role: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">
                        Registro CREA *
                      </label>
                      <input
                        type="text"
                        value={contactForm.crea}
                        onChange={(e) => setContactForm({ ...contactForm, crea: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Slogan / Apresentação Institucional *
                    </label>
                    <textarea
                      rows={2}
                      value={contactForm.tagline}
                      onChange={(e) => setContactForm({ ...contactForm, tagline: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
                      required
                    />
                  </div>

                  {/* UPLOAD DE LOGOMARCA - CABEÇALHO E RODAPÉ */}
                  <div className="pt-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* LOGO DO CABEÇALHO */}
                    <div className="p-5 bg-slate-950 border border-slate-800 rounded-2xl space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                        <div>
                          <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                            <Upload className="w-3.5 h-3.5" />
                            <span>Logo do Cabeçalho (Menu Superior)</span>
                          </h4>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            Substitui o símbolo MR na barra de navegação no topo do site.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        {/* Previsualização */}
                        <div className="h-14 px-3 bg-[#0A1128] border-2 border-amber-500/60 rounded-xl flex items-center justify-center shrink-0 min-w-[80px]">
                          {contactForm.headerLogoUrl ? (
                            <img
                              src={contactForm.headerLogoUrl}
                              alt="Header Logo Preview"
                              className="h-9 max-w-[120px] object-contain"
                            />
                          ) : (
                            <MRLogo className="h-9 w-auto" color="#F59E0B" />
                          )}
                        </div>

                        <div className="flex-1 space-y-2">
                          <input
                            type="file"
                            ref={headerLogoFileInputRef}
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) processHeaderLogoFile(file);
                            }}
                            accept="image/*,.svg"
                            className="hidden"
                          />
                          <div className="flex flex-wrap items-center gap-2">
                            <button
                              type="button"
                              onClick={() => headerLogoFileInputRef.current?.click()}
                              disabled={isUploadingHeaderLogo}
                              className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors shadow-md"
                            >
                              <Upload className="w-3.5 h-3.5" />
                              <span>{isUploadingHeaderLogo ? 'Enviando...' : 'Fazer Upload'}</span>
                            </button>

                            {contactForm.headerLogoUrl && (
                              <button
                                type="button"
                                onClick={handleRemoveHeaderLogo}
                                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold uppercase tracking-wider flex items-center gap-1 transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5 text-red-400" />
                                <span>Restaurar Logo MR</span>
                              </button>
                            )}
                          </div>
                          <p className="text-[10px] text-slate-400">
                            Formatos suportados: PNG, SVG, WEBP, JPG (Ideal fundo transparente)
                          </p>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-400 mb-1">
                          Ou informe a URL da Imagem do Cabeçalho:
                        </label>
                        <input
                          type="text"
                          value={contactForm.headerLogoUrl || ''}
                          onChange={(e) => setContactForm({ ...contactForm, headerLogoUrl: e.target.value })}
                          placeholder="https://... ou data:image/..."
                          className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs"
                        />
                      </div>
                    </div>

                    {/* LOGO DO RODAPÉ */}
                    <div className="p-5 bg-slate-950 border border-slate-800 rounded-2xl space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                        <div>
                          <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                            <Upload className="w-3.5 h-3.5" />
                            <span>Logo do Rodapé (Footer)</span>
                          </h4>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            Exibida na parte inferior de todas as páginas.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        {/* Previsualização */}
                        <div className="h-14 px-3 bg-amber-500/10 border border-amber-500/50 rounded-xl flex items-center justify-center shrink-0 min-w-[80px]">
                          {contactForm.footerLogoUrl || contactForm.headerLogoUrl ? (
                            <img
                              src={contactForm.footerLogoUrl || contactForm.headerLogoUrl}
                              alt="Footer Logo Preview"
                              className="h-8 max-w-[120px] object-contain"
                            />
                          ) : (
                            <MRLogo className="h-8 w-auto" color="#F59E0B" />
                          )}
                        </div>

                        <div className="flex-1 space-y-2">
                          <input
                            type="file"
                            ref={footerLogoFileInputRef}
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) processFooterLogoFile(file);
                            }}
                            accept="image/*,.svg"
                            className="hidden"
                          />
                          <div className="flex flex-wrap items-center gap-2">
                            <button
                              type="button"
                              onClick={() => footerLogoFileInputRef.current?.click()}
                              disabled={isUploadingFooterLogo}
                              className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors shadow-md"
                            >
                              <Upload className="w-3.5 h-3.5" />
                              <span>{isUploadingFooterLogo ? 'Enviando...' : 'Fazer Upload'}</span>
                            </button>

                            {contactForm.headerLogoUrl && contactForm.footerLogoUrl !== contactForm.headerLogoUrl && (
                              <button
                                type="button"
                                onClick={handleUseHeaderLogoForFooter}
                                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 text-xs font-bold uppercase tracking-wider flex items-center gap-1 transition-colors border border-slate-700"
                              >
                                <span>Usar a do Cabeçalho</span>
                              </button>
                            )}

                            {contactForm.footerLogoUrl && (
                              <button
                                type="button"
                                onClick={handleRemoveFooterLogo}
                                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold uppercase tracking-wider flex items-center gap-1 transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5 text-red-400" />
                                <span>Restaurar Logo MR</span>
                              </button>
                            )}
                          </div>
                          <p className="text-[10px] text-slate-400">
                            Formatos suportados: PNG, SVG, WEBP, JPG
                          </p>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-400 mb-1">
                          Ou informe a URL da Imagem do Rodapé:
                        </label>
                        <input
                          type="text"
                          value={contactForm.footerLogoUrl || ''}
                          onChange={(e) => setContactForm({ ...contactForm, footerLogoUrl: e.target.value })}
                          placeholder="https://... ou deixa em branco para usar a do cabeçalho"
                          className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Seção 2: Canais de Contato Direto */}
                <div className="space-y-4 pt-2">
                  <h3 className="text-xs font-bold text-amber-400 uppercase tracking-widest border-b border-slate-800 pb-2">
                    2. Canais de Contato Direto
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">
                        Telefone Principal de Atendimento *
                      </label>
                      <input
                        type="text"
                        value={contactForm.phone}
                        onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                        placeholder="(86) 99927-0261"
                        className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">
                        E-mail Profissional *
                      </label>
                      <input
                        type="email"
                        value={contactForm.email}
                        onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                        placeholder="engcivil@mickramos@gmail.com"
                        className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">
                        Link Direto do WhatsApp (wa.me) *
                      </label>
                      <input
                        type="url"
                        value={contactForm.whatsappUrl}
                        onChange={(e) => setContactForm({ ...contactForm, whatsappUrl: e.target.value })}
                        placeholder="https://wa.me/5586999270261?text=..."
                        className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Seção 3: Localização & Horários */}
                <div className="space-y-4 pt-2">
                  <h3 className="text-xs font-bold text-amber-400 uppercase tracking-widest border-b border-slate-800 pb-2">
                    3. Localização & Horários de Funcionamento
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">
                        Endereço Físico do Escritório *
                      </label>
                      <input
                        type="text"
                        value={contactForm.address}
                        onChange={(e) => setContactForm({ ...contactForm, address: e.target.value })}
                        placeholder="Av. São Sebastião, 1234 - Sala 05 - Centro..."
                        className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">
                        Cidades e Região de Atuação *
                      </label>
                      <input
                        type="text"
                        value={contactForm.cityRegion}
                        onChange={(e) => setContactForm({ ...contactForm, cityRegion: e.target.value })}
                        placeholder="Parnaíba - PI e região (Luís Correia...)"
                        className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Horário de Atendimento Comercial *
                    </label>
                    <input
                      type="text"
                      value={contactForm.hours}
                      onChange={(e) => setContactForm({ ...contactForm, hours: e.target.value })}
                      placeholder="Segunda a Sexta: 8h às 18h | Sábado: 8h às 12h"
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
                      required
                    />
                  </div>
                </div>

                {/* Bottom Save Action Bar */}
                <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Ao salvar, as informações são atualizadas instantaneamente em todo o site.</span>
                  </div>
                  <button
                    type="submit"
                    className="w-full sm:w-auto px-8 py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
                  >
                    <Check className="w-4 h-4" />
                    <span>Salvar Alterações de Contato</span>
                  </button>
                </div>

              </form>

              {/* Live Preview Box */}
              <div className="mt-8 p-6 bg-slate-950 border border-amber-500/30 rounded-xl space-y-4">
                <span className="text-xs font-bold text-amber-400 uppercase tracking-widest flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  <span>Pré-visualização dos Dados de Contato</span>
                </span>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-300">
                  <div className="p-4 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
                    <span className="text-[10px] text-amber-400 uppercase font-bold">Marca & CREA</span>
                    <p className="text-sm font-bold text-white">{contactForm.brandName}</p>
                    <p className="text-slate-400">{contactForm.role} • {contactForm.crea}</p>
                  </div>

                  <div className="p-4 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
                    <span className="text-[10px] text-amber-400 uppercase font-bold">Telefone & E-mail</span>
                    <p className="text-sm font-bold text-white">{contactForm.phone}</p>
                    <p className="text-slate-400 break-all">{contactForm.email}</p>
                  </div>

                  <div className="p-4 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
                    <span className="text-[10px] text-amber-400 uppercase font-bold">Endereço & Atendimento</span>
                    <p className="text-sm font-bold text-white truncate">{contactForm.address}</p>
                    <p className="text-slate-400">{contactForm.hours}</p>
                  </div>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* SERVICES TAB */}
        {adminTab === 'services' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-2xl bg-slate-900 border border-slate-800">
              <div>
                <h2 className="text-xl font-serif font-bold text-white flex items-center gap-2">
                  <Compass className="w-6 h-6 text-amber-400" />
                  <span>Gerenciar Serviços de Engenharia</span>
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Adicione, edite ou remova os serviços oferecidos pela MR Engenharia. As alterações são refletidas instantaneamente na aba pública &quot;Serviços&quot;.
                </p>
              </div>

              <button
                onClick={openNewServiceModal}
                className="px-5 py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center gap-2 shadow-lg shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>NOVO SERVIÇO</span>
              </button>
            </div>

            {/* SERVICES GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {services.map((service) => (
                <div
                  key={service.id}
                  className="p-6 bg-slate-900 border border-slate-800 hover:border-amber-500/40 rounded-2xl transition-all space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
                          {getServiceIcon(service.iconName)}
                        </div>
                        <div>
                          <h3 className="font-serif font-bold text-white text-base">
                            {service.title}
                          </h3>
                          <span className="text-[10px] text-amber-400 font-mono uppercase font-semibold">
                            Ícone: {service.iconName || 'Compass'}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEditServiceModal(service)}
                          className="p-2 rounded-lg bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-slate-300 transition-colors"
                          title="Editar Serviço"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() =>
                            setConfirmModal({
                              isOpen: true,
                              type: 'delete_service',
                              id: service.id,
                              title: service.title,
                            })
                          }
                          className="p-2 rounded-lg bg-slate-800 hover:bg-red-500 hover:text-white text-slate-400 transition-colors"
                          title="Excluir Serviço"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div>
                        <span className="text-[10px] font-bold uppercase text-slate-500 block">
                          Descrição Curta (Resumo Card)
                        </span>
                        <p className="text-slate-300 line-clamp-2">
                          {service.shortDesc}
                        </p>
                      </div>

                      <div>
                        <span className="text-[10px] font-bold uppercase text-slate-500 block">
                          Descrição Completa (Modal)
                        </span>
                        <p className="text-slate-400 line-clamp-3 leading-relaxed">
                          {service.fullDesc}
                        </p>
                      </div>
                    </div>

                    {/* Benefits & Deliverables Preview */}
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800 text-[11px]">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                          Benefícios ({service.benefits?.length || 0})
                        </span>
                        <ul className="space-y-1 text-slate-300">
                          {service.benefits?.slice(0, 2).map((b, i) => (
                            <li key={i} className="truncate flex items-center gap-1">
                              <span className="w-1 h-1 rounded-full bg-amber-400 shrink-0" />
                              <span className="truncate">{b}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                          Entregáveis ({service.deliverables?.length || 0})
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {service.deliverables?.slice(0, 2).map((d, i) => (
                            <span
                              key={i}
                              className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] truncate max-w-[120px]"
                            >
                              {d}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                    <span className="text-[10px] text-slate-500 font-mono">ID: {service.id}</span>
                    <button
                      onClick={() => openEditServiceModal(service)}
                      className="text-amber-400 hover:underline font-bold text-xs uppercase flex items-center gap-1"
                    >
                      <span>Editar Detalhes</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* INBOX TAB (MESSAGES & QUOTES) */}
        {adminTab === 'inbox' && (
          <div className="space-y-8 animate-in fade-in duration-300">
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-serif font-bold text-white flex items-center gap-2">
                  <Inbox className="w-6 h-6 text-amber-400" />
                  <span>Central de Mensagens & Orçamentos Recebidos</span>
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Todas as solicitações de clientes feitas através do site oficial são salvas em tempo real no banco de dados da MR Engenharia.
                </p>
              </div>
              <div className="flex gap-2">
                <span className="px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold">
                  {quotesList.length} Orçamentos
                </span>
                <span className="px-3 py-1.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold">
                  {messagesList.length} Mensagens
                </span>
              </div>
            </div>

            {/* QUOTE REQUESTS SECTION */}
            <div className="space-y-4">
              <h3 className="text-lg font-serif font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-2">
                <Building2 className="w-5 h-5 text-amber-400" />
                <span>Solicitações de Orçamento ({quotesList.length})</span>
              </h3>

              {quotesList.length === 0 ? (
                <div className="p-8 rounded-2xl bg-slate-900/50 border border-slate-800 text-center text-slate-400 text-sm">
                  Nenhuma solicitação de orçamento registrada até o momento.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {quotesList.map((q) => (
                    <div key={q.id} className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-amber-500/30 transition-all space-y-3">
                      <div className="flex items-start justify-between gap-2 border-b border-slate-800 pb-2">
                        <div>
                          <span className="text-[10px] uppercase font-bold text-amber-400 block">{q.service || 'Orçamento'}</span>
                          <h4 className="text-base font-bold text-white">{q.name}</h4>
                        </div>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {q.createdAt ? new Date(q.createdAt).toLocaleDateString('pt-BR') : 'Recent'}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs text-slate-300 bg-slate-950/50 p-3 rounded-xl">
                        <div><strong>Telefone/WA:</strong> {q.phone || 'N/I'}</div>
                        <div><strong>E-mail:</strong> {q.email || 'N/I'}</div>
                        <div><strong>Imóvel:</strong> {q.propertyType} ({q.areaSize} m²)</div>
                        <div><strong>Local:</strong> {q.location}</div>
                      </div>

                      {q.details && (
                        <div className="text-xs text-slate-300 bg-slate-800/40 p-3 rounded-xl border border-slate-800">
                          <strong className="text-slate-400 block text-[10px] uppercase mb-1">Observações do Cliente:</strong>
                          {q.details}
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
                        <div className="flex gap-2">
                          {q.phone && (
                            <a
                              href={`https://wa.me/55${q.phone.replace(/\D/g, '')}`}
                              target="_blank"
                              rel="noreferrer"
                              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] flex items-center gap-1"
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                              <span>WhatsApp</span>
                            </a>
                          )}
                          {q.email && (
                            <a
                              href={`mailto:${q.email}`}
                              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-[11px] flex items-center gap-1"
                            >
                              <Mail className="w-3.5 h-3.5" />
                              <span>E-mail</span>
                            </a>
                          )}
                        </div>

                        <button
                          onClick={async () => {
                            if (confirm('Deseja excluir esta solicitação de orçamento?')) {
                              await deleteDoc(doc(db, 'quoteRequests', q.id));
                            }
                          }}
                          className="p-2 text-slate-500 hover:text-red-400 transition-colors"
                          title="Excluir da Lista"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* CONTACT MESSAGES SECTION */}
            <div className="space-y-4 pt-4 border-t border-slate-800">
              <h3 className="text-lg font-serif font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-2">
                <Mail className="w-5 h-5 text-blue-400" />
                <span>Mensagens Fale Conosco ({messagesList.length})</span>
              </h3>

              {messagesList.length === 0 ? (
                <div className="p-8 rounded-2xl bg-slate-900/50 border border-slate-800 text-center text-slate-400 text-sm">
                  Nenhuma mensagem de contato recebida até o momento.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {messagesList.map((m) => (
                    <div key={m.id} className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-blue-500/30 transition-all space-y-3">
                      <div className="flex items-start justify-between gap-2 border-b border-slate-800 pb-2">
                        <div>
                          <span className="text-[10px] uppercase font-bold text-blue-400 block">{m.subject || 'Contato'}</span>
                          <h4 className="text-base font-bold text-white">{m.name}</h4>
                        </div>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {m.createdAt ? new Date(m.createdAt).toLocaleDateString('pt-BR') : 'Recent'}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs text-slate-300 bg-slate-950/50 p-3 rounded-xl">
                        <div><strong>WhatsApp:</strong> {m.whatsapp || 'N/I'}</div>
                        <div><strong>E-mail:</strong> {m.email || 'N/I'}</div>
                      </div>

                      <div className="text-xs text-slate-300 bg-slate-800/40 p-3 rounded-xl border border-slate-800">
                        <strong className="text-slate-400 block text-[10px] uppercase mb-1">Mensagem:</strong>
                        {m.message}
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
                        <div className="flex gap-2">
                          {m.whatsapp && (
                            <a
                              href={`https://wa.me/55${m.whatsapp.replace(/\D/g, '')}`}
                              target="_blank"
                              rel="noreferrer"
                              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] flex items-center gap-1"
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                              <span>WhatsApp</span>
                            </a>
                          )}
                          {m.email && (
                            <a
                              href={`mailto:${m.email}`}
                              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-[11px] flex items-center gap-1"
                            >
                              <Mail className="w-3.5 h-3.5" />
                              <span>E-mail</span>
                            </a>
                          )}
                        </div>

                        <button
                          onClick={async () => {
                            if (confirm('Deseja excluir esta mensagem?')) {
                              await deleteDoc(doc(db, 'contactMessages', m.id));
                            }
                          }}
                          className="p-2 text-slate-500 hover:text-red-400 transition-colors"
                          title="Excluir da Lista"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}

        {/* HOME TAB (IMAGENS DA ABA INÍCIO) */}
        {adminTab === 'home' && (
          <div className="space-y-8 animate-in fade-in duration-300">
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-serif font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-6 h-6 text-amber-400" />
                  <span>Gerenciar Imagens da Aba Início</span>
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Altere as imagens exibidas no topo (Hero Banner) e na seção institucional da página inicial. Todas as alterações são salvas e sincronizadas instantaneamente no banco de dados.
                </p>
              </div>
              <button
                type="button"
                onClick={handleSaveContact}
                className="px-5 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all shadow-lg shadow-amber-500/20"
              >
                <Save className="w-4 h-4" />
                <span>Salvar Alterações do Início</span>
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

              {/* 1. HERO BANNER IMAGE CARD */}
              <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-6 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-serif font-bold text-white flex items-center gap-2">
                        <Upload className="w-4 h-4 text-amber-400" />
                        <span>1. Imagem do Banner Principal (Hero)</span>
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Imagem de destaque exibida no cabeçalho inicial do site.
                      </p>
                    </div>
                  </div>

                  {/* Previsualização em Tempo Real com Moldura */}
                  <div className="relative rounded-2xl overflow-hidden shadow-2xl border-2 border-amber-500/30 group bg-slate-950">
                    <img
                      src={contactForm.heroImageUrl || "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1000&q=80"}
                      alt="Banner Hero Preview"
                      className="w-full h-64 object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0A1128] via-transparent to-transparent opacity-80" />
                    <div className="absolute bottom-3 left-3 right-3 p-3 rounded-xl bg-slate-950/80 backdrop-blur-md border border-amber-500/30 text-white">
                      <p className="text-[10px] font-bold text-amber-400 uppercase tracking-widest">
                        {contactForm.heroImageTag || 'Parnaíba • Litoral Piauiense'}
                      </p>
                      <p className="text-xs font-serif font-bold text-white mt-0.5">
                        {contactForm.heroImageTitle || 'Residência Unifamiliar de Alto Padrão'}
                      </p>
                    </div>
                  </div>

                  {/* Zona de Drop & Upload */}
                  <div
                    onDragOver={(e) => { e.preventDefault(); setIsHeroDragOver(true); }}
                    onDragLeave={() => setIsHeroDragOver(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsHeroDragOver(false);
                      const file = e.dataTransfer.files?.[0];
                      if (file) processHeroImageFile(file);
                    }}
                    className={`p-5 rounded-2xl border-2 border-dashed transition-all text-center space-y-3 ${
                      isHeroDragOver
                        ? 'border-amber-400 bg-amber-500/10'
                        : 'border-slate-800 bg-slate-950 hover:border-slate-700'
                    }`}
                  >
                    <input
                      type="file"
                      ref={heroImageFileInputRef}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) processHeroImageFile(file);
                      }}
                      accept="image/*"
                      className="hidden"
                    />

                    <div className="w-12 h-12 mx-auto rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                      <FileUp className="w-6 h-6" />
                    </div>

                    <div>
                      <p className="text-xs font-bold text-white">
                        Arraste e solte uma imagem aqui
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        ou clique para escolher um arquivo do seu computador/celular
                      </p>
                    </div>

                    <div className="pt-1 flex justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => heroImageFileInputRef.current?.click()}
                        disabled={isUploadingHeroImage}
                        className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center gap-2"
                      >
                        <Upload className="w-4 h-4" />
                        <span>{isUploadingHeroImage ? 'Processando...' : 'Fazer Upload de Imagem'}</span>
                      </button>

                      {contactForm.heroImageUrl && (
                        <button
                          type="button"
                          onClick={() => setContactForm({ ...contactForm, heroImageUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1000&q=80' })}
                          className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs uppercase tracking-wider rounded-xl transition-colors"
                          title="Restaurar Imagem Padrão"
                        >
                          <RotateCcw className="w-4 h-4 text-amber-400" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* URL Externa Manual */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Ou informe a URL da imagem do Banner:
                    </label>
                    <input
                      type="text"
                      value={contactForm.heroImageUrl || ''}
                      onChange={(e) => setContactForm({ ...contactForm, heroImageUrl: e.target.value })}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>

                  {/* Legenda do Card no Banner */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">
                        Subtítulo / Localização na Imagem:
                      </label>
                      <input
                        type="text"
                        value={contactForm.heroImageTag || ''}
                        onChange={(e) => setContactForm({ ...contactForm, heroImageTag: e.target.value })}
                        placeholder="Ex: Parnaíba • Litoral Piauiense"
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">
                        Título do Projeto na Imagem:
                      </label>
                      <input
                        type="text"
                        value={contactForm.heroImageTitle || ''}
                        onChange={(e) => setContactForm({ ...contactForm, heroImageTitle: e.target.value })}
                        placeholder="Ex: Residência Unifamiliar de Alto Padrão"
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                      />
                    </div>
                  </div>

                </div>
              </div>

              {/* 2. QUEM SOMOS SECTION IMAGE CARD */}
              <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-6 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-serif font-bold text-white flex items-center gap-2">
                        <Upload className="w-4 h-4 text-amber-400" />
                        <span>2. Imagem da Seção &quot;Quem Somos&quot; (Início)</span>
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Exibida no bloco institucional do Início.
                      </p>
                    </div>
                  </div>

                  {/* Previsualização em Tempo Real */}
                  <div className="relative rounded-2xl overflow-hidden shadow-lg border border-slate-700 bg-slate-950">
                    <img
                      src={contactForm.homeAboutImageUrl || "https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=800&q=80"}
                      alt="Quem Somos Preview"
                      className="w-full h-64 object-cover"
                    />
                  </div>

                  {/* Zona de Drop & Upload */}
                  <div
                    onDragOver={(e) => { e.preventDefault(); setIsHomeAboutDragOver(true); }}
                    onDragLeave={() => setIsHomeAboutDragOver(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsHomeAboutDragOver(false);
                      const file = e.dataTransfer.files?.[0];
                      if (file) processHomeAboutImageFile(file);
                    }}
                    className={`p-5 rounded-2xl border-2 border-dashed transition-all text-center space-y-3 ${
                      isHomeAboutDragOver
                        ? 'border-amber-400 bg-amber-500/10'
                        : 'border-slate-800 bg-slate-950 hover:border-slate-700'
                    }`}
                  >
                    <input
                      type="file"
                      ref={homeAboutImageFileInputRef}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) processHomeAboutImageFile(file);
                      }}
                      accept="image/*"
                      className="hidden"
                    />

                    <div className="w-12 h-12 mx-auto rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                      <FileUp className="w-6 h-6" />
                    </div>

                    <div>
                      <p className="text-xs font-bold text-white">
                        Arraste e solte uma imagem aqui
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        ou clique para escolher um arquivo do seu dispositivo
                      </p>
                    </div>

                    <div className="pt-1 flex justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => homeAboutImageFileInputRef.current?.click()}
                        disabled={isUploadingHomeAboutImage}
                        className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center gap-2"
                      >
                        <Upload className="w-4 h-4" />
                        <span>{isUploadingHomeAboutImage ? 'Processando...' : 'Fazer Upload de Imagem'}</span>
                      </button>

                      {contactForm.homeAboutImageUrl && (
                        <button
                          type="button"
                          onClick={() => setContactForm({ ...contactForm, homeAboutImageUrl: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=800&q=80' })}
                          className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs uppercase tracking-wider rounded-xl transition-colors"
                          title="Restaurar Imagem Padrão"
                        >
                          <RotateCcw className="w-4 h-4 text-amber-400" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* URL Externa Manual */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Ou informe a URL da imagem da seção Quem Somos:
                    </label>
                    <input
                      type="text"
                      value={contactForm.homeAboutImageUrl || ''}
                      onChange={(e) => setContactForm({ ...contactForm, homeAboutImageUrl: e.target.value })}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>

                </div>
              </div>

            </div>

            {/* Bottom Save Action Bar */}
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
              <div className="text-xs text-slate-400">
                Ao clicar em salvar, todas as imagens e legendas do Início serão salvas e atualizadas instantaneamente no site.
              </div>
              <button
                type="button"
                onClick={handleSaveContact}
                className="px-6 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs uppercase tracking-widest flex items-center gap-2 transition-all shadow-lg shadow-amber-500/20"
              >
                <Save className="w-4 h-4" />
                <span>Salvar e Publicar Alterações do Início</span>
              </button>
            </div>

          </div>
        )}

      </section>

      {/* PROJECT FORM MODAL */}
      {isProjectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-2xl bg-slate-900 border border-amber-500/30 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            
            <div className="bg-[#0A1128] p-5 border-b border-amber-500/30 flex items-center justify-between">
              <h3 className="text-lg font-serif font-bold text-white uppercase flex items-center gap-2">
                <FolderKanban className="w-5 h-5 text-amber-400" />
                <span>{editingProject ? 'Editar Projeto' : 'Cadastrar Novo Projeto'}</span>
              </h3>
              <button
                onClick={() => setIsProjectModalOpen(false)}
                className="p-2 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProject} className="p-6 overflow-y-auto space-y-4">
              
              <div>
                <label className="block text-xs font-bold text-amber-400 uppercase tracking-wider mb-1">
                  Título do Projeto *
                </label>
                <input
                  type="text"
                  value={projectForm.title}
                  onChange={(e) => setProjectForm({ ...projectForm, title: e.target.value })}
                  placeholder="Ex: Residência Unifamiliar Alphaville"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-amber-400 uppercase tracking-wider mb-1">
                    Categoria *
                  </label>
                  <select
                    value={projectForm.category}
                    onChange={(e) => setProjectForm({ ...projectForm, category: e.target.value as Project['category'] })}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  >
                    <option value="ARQUITETÔNICO">ARQUITETÔNICO</option>
                    <option value="ESTRUTURAL">ESTRUTURAL</option>
                    <option value="HIDROSSANITÁRIO">HIDROSSANITÁRIO</option>
                    <option value="ELÉTRICO">ELÉTRICO</option>
                    <option value="PPCI">PPCI</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-amber-400 uppercase tracking-wider mb-1">
                    Localização *
                  </label>
                  <input
                    type="text"
                    value={projectForm.location}
                    onChange={(e) => setProjectForm({ ...projectForm, location: e.target.value })}
                    placeholder="Parnaíba - PI"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-amber-400 uppercase tracking-wider mb-1">
                    Área Total (m²)
                  </label>
                  <input
                    type="text"
                    value={projectForm.area}
                    onChange={(e) => setProjectForm({ ...projectForm, area: e.target.value })}
                    placeholder="240m²"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-amber-400 uppercase tracking-wider mb-1">
                    Ano do Projeto
                  </label>
                  <input
                    type="text"
                    value={projectForm.year}
                    onChange={(e) => setProjectForm({ ...projectForm, year: e.target.value })}
                    placeholder="2024"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Project Images Upload & Gallery Section */}
              <div className="space-y-3 p-4 bg-slate-950 rounded-xl border border-slate-800">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-amber-400 uppercase tracking-wider">
                    Imagens do Projeto ({projectImages.length})
                  </label>
                  <span className="text-[10px] text-slate-400 font-medium">
                    Upload múltiplo de fotos
                  </span>
                </div>

                {/* File Upload Drop Area */}
                <div
                  onDragOver={(e) => { e.preventDefault(); setIsProjectDragOver(true); }}
                  onDragLeave={() => setIsProjectDragOver(false)}
                  onDrop={handleProjectDrop}
                  className={`flex flex-col items-center justify-center w-full min-h-[110px] border-2 border-dashed rounded-xl cursor-pointer transition-all text-center p-4 relative ${
                    isProjectDragOver
                      ? 'border-amber-400 bg-amber-500/10 scale-[0.99]'
                      : 'border-amber-500/40 hover:border-amber-400 bg-slate-900/60 hover:bg-slate-900'
                  }`}
                  onClick={() => projectFileInputRef.current?.click()}
                >
                  <input
                    ref={projectFileInputRef}
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleProjectFilesUpload}
                    className="hidden"
                  />
                  {isUploadingProjectImages ? (
                    <div className="flex flex-col items-center gap-2 text-amber-400">
                      <RotateCcw className="w-6 h-6 animate-spin" />
                      <span className="text-xs font-bold">Processando e otimizando imagens...</span>
                    </div>
                  ) : (
                    <>
                      <FileUp className="w-6 h-6 text-amber-400 mb-1" />
                      <span className="text-xs font-bold text-white">
                        Clique ou arraste fotos do seu computador
                      </span>
                      <span className="text-[10px] text-slate-400 mt-0.5">
                        Selecione um ou múltiplos arquivos (JPG, PNG, WEBP)
                      </span>
                    </>
                  )}
                </div>

                {/* Or add via URL */}
                <div className="flex gap-2 pt-1">
                  <input
                    type="url"
                    value={newImageUrlInput}
                    onChange={(e) => setNewImageUrlInput(e.target.value)}
                    placeholder="Ou cole o link URL da imagem (http://...)"
                    className="flex-1 px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs focus:ring-1 focus:ring-amber-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleAddProjectImageUrl}
                    className="px-3 py-2 bg-amber-500/20 text-amber-300 hover:bg-amber-500 hover:text-slate-950 font-bold text-xs rounded-lg transition-colors shrink-0"
                  >
                    Adicionar URL
                  </button>
                </div>

                {/* Thumbnails Gallery Preview */}
                {projectImages.length > 0 && (
                  <div className="pt-2">
                    <span className="text-[11px] font-bold text-slate-400 uppercase block mb-2">
                      Fotos adicionadas (A 1ª imagem é a Capa Principal):
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-h-48 overflow-y-auto p-1">
                      {projectImages.map((imgUrl, idx) => (
                        <div key={idx} className="relative group rounded-lg overflow-hidden border border-slate-700 bg-slate-900 aspect-video">
                          <img src={imgUrl} alt={`Foto ${idx + 1}`} className="w-full h-full object-cover" />
                          {idx === 0 && (
                            <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded bg-amber-500 text-slate-950 font-extrabold text-[9px] uppercase tracking-wider flex items-center gap-1 shadow">
                              <Star className="w-2.5 h-2.5 fill-slate-950" />
                              Capa
                            </span>
                          )}
                          <div className="absolute inset-0 bg-slate-950/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 p-1">
                            {idx !== 0 && (
                              <button
                                type="button"
                                onClick={() => handleSetCoverProjectImage(idx)}
                                className="px-1.5 py-1 bg-amber-500 text-slate-950 text-[9px] font-bold rounded hover:bg-amber-400"
                                title="Tornar imagem principal"
                              >
                                Virar Capa
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => handleRemoveProjectImage(idx)}
                              className="p-1 bg-red-600 text-white rounded hover:bg-red-700"
                              title="Remover Imagem"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-amber-400 uppercase tracking-wider mb-1">
                  Descrição do Projeto *
                </label>
                <textarea
                  rows={3}
                  value={projectForm.description}
                  onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
                  placeholder="Descreva as principais características do projeto..."
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-amber-400 uppercase tracking-wider mb-1">
                  Destaques Técnicos (Separados por vírgula)
                </label>
                <input
                  type="text"
                  value={projectForm.featuresText}
                  onChange={(e) => setProjectForm({ ...projectForm, featuresText: e.target.value })}
                  placeholder="BIM 3D, Maquete Eletrônica, Compatibilização Completa"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsProjectModalOpen(false)}
                  className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs uppercase tracking-wider rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg"
                >
                  Salvar Projeto
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* BLOG FORM MODAL */}
      {isBlogModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-3xl bg-slate-900 border border-amber-500/30 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            
            <div className="bg-[#0A1128] p-5 border-b border-amber-500/30 flex items-center justify-between">
              <h3 className="text-lg font-serif font-bold text-white uppercase flex items-center gap-2">
                <FileText className="w-5 h-5 text-amber-400" />
                <span>{editingBlogPost ? 'Editar Artigo' : 'Publicar Novo Artigo'}</span>
              </h3>
              <button
                onClick={() => setIsBlogModalOpen(false)}
                className="p-2 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveBlogPost} className="p-6 overflow-y-auto space-y-4">
              
              <div>
                <label className="block text-xs font-bold text-amber-400 uppercase tracking-wider mb-1">
                  Título do Artigo *
                </label>
                <input
                  type="text"
                  value={blogForm.title}
                  onChange={(e) => setBlogForm({ ...blogForm, title: e.target.value })}
                  placeholder="Ex: Como evitar fissuras e trincas estruturais no litoral"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-amber-400 uppercase tracking-wider mb-1">
                    Categoria *
                  </label>
                  <select
                    value={blogForm.category}
                    onChange={(e) => setBlogForm({ ...blogForm, category: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  >
                    {BLOG_CATEGORIES.filter(c => c.id !== 'todos').map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-amber-400 uppercase tracking-wider mb-1">
                    Autor *
                  </label>
                  <input
                    type="text"
                    value={blogForm.author}
                    onChange={(e) => setBlogForm({ ...blogForm, author: e.target.value })}
                    placeholder="Eng. Mick Ramos"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    required
                  />
                </div>
              </div>

              {/* Blog Image Upload Section */}
              <div className="space-y-3 p-4 bg-slate-950 rounded-xl border border-slate-800">
                <label className="block text-xs font-bold text-amber-400 uppercase tracking-wider">
                  Imagem de Capa do Artigo
                </label>

                {/* Drag & Drop File Upload Box */}
                <div
                  onDragOver={(e) => { e.preventDefault(); setIsBlogDragOver(true); }}
                  onDragLeave={() => setIsBlogDragOver(false)}
                  onDrop={handleBlogDrop}
                  className={`flex flex-col items-center justify-center w-full min-h-[100px] border-2 border-dashed rounded-xl cursor-pointer transition-all text-center p-3 ${
                    isBlogDragOver
                      ? 'border-amber-400 bg-amber-500/10 scale-[0.99]'
                      : 'border-amber-500/40 hover:border-amber-400 bg-slate-900/60 hover:bg-slate-900'
                  }`}
                  onClick={() => blogFileInputRef.current?.click()}
                >
                  <input
                    ref={blogFileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleBlogFileUpload}
                    className="hidden"
                  />
                  {isUploadingBlogImage ? (
                    <div className="flex flex-col items-center gap-2 text-amber-400">
                      <RotateCcw className="w-6 h-6 animate-spin" />
                      <span className="text-xs font-bold">Processando e otimizando imagem...</span>
                    </div>
                  ) : (
                    <>
                      <Upload className="w-5 h-5 text-amber-400 mb-1" />
                      <span className="text-xs font-bold text-white">
                        Clique ou arraste uma imagem do seu computador
                      </span>
                      <span className="text-[10px] text-slate-400 mt-0.5">
                        Arquivos JPG, PNG ou WEBP - Otimização automática
                      </span>
                    </>
                  )}
                </div>

                {/* Fallback URL input */}
                <div>
                  <input
                    type="url"
                    value={blogForm.image}
                    onChange={(e) => setBlogForm({ ...blogForm, image: e.target.value })}
                    placeholder="Ou cole o link URL da imagem (https://...)"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs focus:ring-1 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                {/* Preview Thumbnail */}
                {blogForm.image && (
                  <div className="flex items-center gap-3 pt-1">
                    <img
                      src={blogForm.image}
                      alt="Pré-visualização"
                      className="w-20 h-14 object-cover rounded-lg border border-slate-700 bg-slate-900"
                    />
                    <div className="text-xs text-slate-400">
                      <span className="text-amber-400 font-bold block">Imagem Selecionada</span>
                      Pronta para ser publicada com o artigo.
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-amber-400 uppercase tracking-wider mb-1">
                  Resumo Curto (Excerpt) *
                </label>
                <textarea
                  rows={2}
                  value={blogForm.excerpt}
                  onChange={(e) => setBlogForm({ ...blogForm, excerpt: e.target.value })}
                  placeholder="Resumo breve para os cartões de pré-visualização..."
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-amber-400 uppercase tracking-wider mb-1">
                  Introdução do Artigo *
                </label>
                <textarea
                  rows={3}
                  value={blogForm.intro}
                  onChange={(e) => setBlogForm({ ...blogForm, intro: e.target.value })}
                  placeholder="Parágrafo introdutório do artigo..."
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  required
                />
              </div>

              <div className="space-y-3 p-4 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-xs font-bold text-white uppercase tracking-wider block">
                  Tópico Técnico 1
                </span>
                <input
                  type="text"
                  value={blogForm.point1Title}
                  onChange={(e) => setBlogForm({ ...blogForm, point1Title: e.target.value })}
                  placeholder="Título do Tópico 1"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs"
                />
                <textarea
                  rows={2}
                  value={blogForm.point1Text}
                  onChange={(e) => setBlogForm({ ...blogForm, point1Text: e.target.value })}
                  placeholder="Explicação detalhada do Tópico 1..."
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs"
                />
              </div>

              <div className="space-y-3 p-4 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-xs font-bold text-white uppercase tracking-wider block">
                  Tópico Técnico 2
                </span>
                <input
                  type="text"
                  value={blogForm.point2Title}
                  onChange={(e) => setBlogForm({ ...blogForm, point2Title: e.target.value })}
                  placeholder="Título do Tópico 2"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs"
                />
                <textarea
                  rows={2}
                  value={blogForm.point2Text}
                  onChange={(e) => setBlogForm({ ...blogForm, point2Text: e.target.value })}
                  placeholder="Explicação detalhada do Tópico 2..."
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-amber-400 uppercase tracking-wider mb-1">
                  Caixa de Alerta / Atenção Técnica (Opcional)
                </label>
                <input
                  type="text"
                  value={blogForm.warningBox}
                  onChange={(e) => setBlogForm({ ...blogForm, warningBox: e.target.value })}
                  placeholder="Consulte sempre um engenheiro antes de intervir..."
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-amber-400 uppercase tracking-wider mb-1">
                  Conclusão do Artigo *
                </label>
                <textarea
                  rows={2}
                  value={blogForm.conclusion}
                  onChange={(e) => setBlogForm({ ...blogForm, conclusion: e.target.value })}
                  placeholder="Conclusão e encerramento..."
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  required
                />
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsBlogModalOpen(false)}
                  className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs uppercase tracking-wider rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg"
                >
                  Publicar Artigo
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* SERVICE FORM MODAL */}
      {isServiceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-2xl bg-slate-900 border border-amber-500/30 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            
            <div className="bg-[#0A1128] p-5 border-b border-amber-500/30 flex items-center justify-between">
              <h3 className="text-lg font-serif font-bold text-white uppercase flex items-center gap-2">
                <Compass className="w-5 h-5 text-amber-400" />
                <span>{editingService ? 'Editar Serviço' : 'Cadastrar Novo Serviço'}</span>
              </h3>
              <button
                onClick={() => setIsServiceModalOpen(false)}
                className="p-2 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveService} className="p-6 overflow-y-auto space-y-5 text-slate-300">
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-amber-400 uppercase tracking-wider mb-1">
                    Título do Serviço *
                  </label>
                  <input
                    type="text"
                    value={serviceForm.title}
                    onChange={(e) => setServiceForm({ ...serviceForm, title: e.target.value })}
                    placeholder="Ex: PROJETO DE REFORMA E AMBIENTAÇÃO"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none uppercase"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-amber-400 uppercase tracking-wider mb-1">
                    Ícone Ilustrativo *
                  </label>
                  <select
                    value={serviceForm.iconName}
                    onChange={(e) => setServiceForm({ ...serviceForm, iconName: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  >
                    <option value="Search">Search (Vistorias)</option>
                    <option value="FileText">FileText (Laudos)</option>
                    <option value="Building2">Building2 (Regularização)</option>
                    <option value="FileCheck">FileCheck (ART/RRT)</option>
                    <option value="HardHat">HardHat (Acompanhamento)</option>
                    <option value="Compass">Compass (Projetos)</option>
                    <option value="Flame">Flame (PPCI)</option>
                    <option value="Box">Box (BIM 3D)</option>
                  </select>
                </div>
              </div>

              {/* UPLOAD DA IMAGEM DO CARD DO SERVIÇO */}
              <div className="space-y-3 p-4 bg-slate-950 rounded-xl border border-slate-800">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
                    <Upload className="w-4 h-4 text-amber-400" />
                    <span>Imagem Ilustrativa do Card do Serviço</span>
                  </label>
                  <span className="text-[10px] text-slate-400">
                    Upload por arquivo ou link URL
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                  {/* Pré-visualização da imagem do card */}
                  <div className="relative rounded-xl overflow-hidden border border-slate-700 bg-slate-900 aspect-video group">
                    <img
                      src={serviceForm.imageUrl || 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=600&q=80'}
                      alt="Service Card Preview"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-slate-950/40 flex items-end p-2.5">
                      <span className="text-[10px] font-bold text-amber-300 font-mono bg-slate-950/80 px-2 py-0.5 rounded border border-amber-500/30">
                        {serviceForm.title || 'Novo Serviço'}
                      </span>
                    </div>
                  </div>

                  {/* Drop Zone e Controles de Upload */}
                  <div className="space-y-2">
                    <div
                      onDragOver={(e) => { e.preventDefault(); setIsServiceImageDragOver(true); }}
                      onDragLeave={() => setIsServiceImageDragOver(false)}
                      onDrop={(e) => {
                        e.preventDefault();
                        setIsServiceImageDragOver(false);
                        const file = e.dataTransfer.files?.[0];
                        if (file) processServiceImageFile(file);
                      }}
                      className={`p-3 rounded-xl border-2 border-dashed transition-all text-center space-y-1 cursor-pointer ${
                        isServiceImageDragOver
                          ? 'border-amber-400 bg-amber-500/10'
                          : 'border-slate-800 bg-slate-900 hover:border-slate-700'
                      }`}
                      onClick={() => serviceImageFileInputRef.current?.click()}
                    >
                      <input
                        type="file"
                        ref={serviceImageFileInputRef}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) processServiceImageFile(file);
                        }}
                        accept="image/*"
                        className="hidden"
                      />

                      <FileUp className="w-5 h-5 text-amber-400 mx-auto" />
                      <p className="text-xs font-bold text-white">
                        {isUploadingServiceImage ? 'Processando...' : 'Clique ou arraste uma imagem aqui'}
                      </p>
                      <p className="text-[10px] text-slate-400">JPG, PNG, WEBP</p>
                    </div>

                    <div className="flex gap-1.5">
                      <input
                        type="url"
                        value={serviceForm.imageUrl}
                        onChange={(e) => setServiceForm({ ...serviceForm, imageUrl: e.target.value })}
                        placeholder="Ou informe a URL da foto (http://...)"
                        className="flex-1 px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs focus:ring-1 focus:ring-amber-500 focus:outline-none"
                      />
                      {serviceForm.imageUrl && (
                        <button
                          type="button"
                          onClick={() => setServiceForm({ ...serviceForm, imageUrl: '' })}
                          className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-bold rounded-lg"
                          title="Remover Imagem Customizada"
                        >
                          Limpar
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-amber-400 uppercase tracking-wider mb-1">
                  Descrição Curta (Resumo no Card Principal) *
                </label>
                <textarea
                  rows={2}
                  value={serviceForm.shortDesc}
                  onChange={(e) => setServiceForm({ ...serviceForm, shortDesc: e.target.value })}
                  placeholder="Resumo objetivo do serviço exibido na grade de serviços..."
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-amber-400 uppercase tracking-wider mb-1">
                  Descrição Completa (Exibida no Modal de Detalhes) *
                </label>
                <textarea
                  rows={4}
                  value={serviceForm.fullDesc}
                  onChange={(e) => setServiceForm({ ...serviceForm, fullDesc: e.target.value })}
                  placeholder="Explicação detalhada sobre a metodologia, escopo técnico e utilidade deste serviço..."
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-amber-400 uppercase tracking-wider mb-1">
                    Benefícios Diretos (1 por linha)
                  </label>
                  <textarea
                    rows={4}
                    value={serviceForm.benefitsText}
                    onChange={(e) => setServiceForm({ ...serviceForm, benefitsText: e.target.value })}
                    placeholder={"Identificação precoce de riscos\nEconomia na execução da obra\nGarantia de segurança jurídica"}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none font-mono"
                  />
                  <span className="text-[10px] text-slate-500">Digite um benefício por linha</span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-amber-400 uppercase tracking-wider mb-1">
                    Entregáveis / Documentos (1 por linha)
                  </label>
                  <textarea
                    rows={4}
                    value={serviceForm.deliverablesText}
                    onChange={(e) => setServiceForm({ ...serviceForm, deliverablesText: e.target.value })}
                    placeholder={"Laudo Fotográfico com ART\nPranchas Executivas BIM\nCaderno de Especificações"}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none font-mono"
                  />
                  <span className="text-[10px] text-slate-500">Digite um entregável por linha</span>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsServiceModalOpen(false)}
                  className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs uppercase tracking-wider rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg"
                >
                  {editingService ? 'Atualizar Serviço' : 'Cadastrar Serviço'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* CONFIRMATION MODAL */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-slate-900 border border-red-500/40 rounded-2xl p-6 shadow-2xl space-y-5 text-center my-8">
            <div className="w-14 h-14 bg-red-500/10 border border-red-500/30 text-red-400 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-serif font-bold text-white">
                {confirmModal.type === 'reset_defaults' ? 'Restaurar Dados Padrão?' : 'Confirmar Exclusão'}
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                {confirmModal.type === 'reset_defaults' ? (
                  'Tem certeza que deseja restaurar os projetos e artigos originais de fábrica? Quaisquer edições locais serão substituídas.'
                ) : (
                  <>Tem certeza que deseja excluir <strong>&quot;{confirmModal.title}&quot;</strong>? Esta ação removerá o item imediatamente do site.</>
                )}
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setConfirmModal({ ...confirmModal, isOpen: false })}
                className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold uppercase tracking-wider transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmAction}
                className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold uppercase tracking-wider transition-colors shadow-lg"
              >
                {confirmModal.type === 'reset_defaults' ? 'Sim, Restaurar' : 'Sim, Excluir'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TOAST NOTIFICATION */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-500 text-slate-950 font-bold px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 text-xs uppercase tracking-wider border border-emerald-400 animate-in slide-in-from-bottom-4">
          <Check className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

    </div>
  );
};
