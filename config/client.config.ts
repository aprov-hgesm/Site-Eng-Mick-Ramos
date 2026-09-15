export type SiteThemeName = 'mick';

const publicEnv = (name: string, fallback: string) => {
  const value = process.env[name];
  return value && value.trim().length > 0 ? value.trim() : fallback;
};

export const clientConfig = {
  theme: publicEnv('NEXT_PUBLIC_SITE_THEME', 'mick') as SiteThemeName,

  identity: {
    companyName: publicEnv('NEXT_PUBLIC_CLIENT_COMPANY_NAME', 'MR Engenharia'),
    brandName: publicEnv('NEXT_PUBLIC_CLIENT_BRAND_NAME', 'MR MICK RAMOS'),
    professionalName: publicEnv('NEXT_PUBLIC_CLIENT_PROFESSIONAL_NAME', 'Mick Ramos'),
    role: publicEnv('NEXT_PUBLIC_CLIENT_ROLE', 'Engenheiro Civil'),
    registration: publicEnv('NEXT_PUBLIC_CLIENT_REGISTRATION', 'CREA 1920983666'),
  },

  contact: {
    email: publicEnv('NEXT_PUBLIC_CLIENT_EMAIL', 'engcivilmickramos@gmail.com'),
    phone: publicEnv('NEXT_PUBLIC_CLIENT_PHONE', '(86) 99927-0261'),
    whatsappUrl: publicEnv(
      'NEXT_PUBLIC_CLIENT_WHATSAPP_URL',
      'https://wa.me/5586999270261?text=Ol%C3%A1%2C%20gostaria%20de%20solicitar%20um%20or%C3%A7amento%20de%20engenharia.',
    ),
  },

  admin: {
    // The UID is not a secret; authorization remains enforced by Firebase/Firestore.
    // Keeping it configurable lets each deployment use a different administrator
    // without changing reusable UI/core code.
    uid: publicEnv('NEXT_PUBLIC_ADMIN_UID', 'hx9EpMe3uhgdaIxlhS8FcsKAhcB2'),
  },

  integrations: {
    emailjs: {
      serviceId: publicEnv('NEXT_PUBLIC_EMAILJS_SERVICE_ID', 'service_xud0pne'),
      templateId: publicEnv('NEXT_PUBLIC_EMAILJS_TEMPLATE_ID', 'template_77p928m'),
      publicKey: publicEnv('NEXT_PUBLIC_EMAILJS_PUBLIC_KEY', 'tf-Z6BFUcuXuEt4BQ'),
    },
  },

  metadata: {
    siteUrl: publicEnv('NEXT_PUBLIC_SITE_URL', 'https://site-eng-mick-ramos.vercel.app'),
    title: publicEnv(
      'NEXT_PUBLIC_SITE_TITLE',
      'MR Engenharia | Mick Ramos - Engenheiro Civil CREA-PI | Parnaíba',
    ),
    description: publicEnv(
      'NEXT_PUBLIC_SITE_DESCRIPTION',
      'Projetos de engenharia civil, laudos técnicos, regularização de imóveis e acompanhamento de obras em Parnaíba e região. Engenheiro Mick Ramos, CREA-PI 1920983666. Solicite um orçamento.',
    ),
    openGraphTitle: publicEnv(
      'NEXT_PUBLIC_SITE_OG_TITLE',
      'MR Engenharia | Mick Ramos - Engenheiro Civil',
    ),
    openGraphDescription: publicEnv(
      'NEXT_PUBLIC_SITE_OG_DESCRIPTION',
      'Soluções completas em engenharia civil em Parnaíba - PI. Projetos, laudos, regularização e gestão de obras.',
    ),
    previewImagePath: publicEnv('NEXT_PUBLIC_SITE_PREVIEW_IMAGE', '/imagem-preview.jpg'),
  },

  persistence: {
    namespace: publicEnv('NEXT_PUBLIC_SITE_STORAGE_NAMESPACE', 'mr_engenharia'),
  },
} as const;

export type ClientConfig = typeof clientConfig;
