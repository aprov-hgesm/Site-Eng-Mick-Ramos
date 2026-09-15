export type SiteThemeName = 'mick';

const withFallback = (value: string | undefined, fallback: string) => {
  return value && value.trim().length > 0 ? value.trim() : fallback;
};

export const clientConfig = {
  theme: withFallback(process.env.NEXT_PUBLIC_SITE_THEME, 'mick') as SiteThemeName,

  identity: {
    companyName: withFallback(process.env.NEXT_PUBLIC_CLIENT_COMPANY_NAME, 'MR Engenharia'),
    brandName: withFallback(process.env.NEXT_PUBLIC_CLIENT_BRAND_NAME, 'MR MICK RAMOS'),
    professionalName: withFallback(process.env.NEXT_PUBLIC_CLIENT_PROFESSIONAL_NAME, 'Mick Ramos'),
    role: withFallback(process.env.NEXT_PUBLIC_CLIENT_ROLE, 'Engenheiro Civil'),
    registration: withFallback(process.env.NEXT_PUBLIC_CLIENT_REGISTRATION, 'CREA 1920983666'),
  },

  contact: {
    email: withFallback(process.env.NEXT_PUBLIC_CLIENT_EMAIL, 'engcivilmickramos@gmail.com'),
    phone: withFallback(process.env.NEXT_PUBLIC_CLIENT_PHONE, '(86) 99927-0261'),
    whatsappDisplay: withFallback(process.env.NEXT_PUBLIC_CLIENT_WHATSAPP_DISPLAY, '+55 86 99927-0261'),
    whatsappUrl: withFallback(
      process.env.NEXT_PUBLIC_CLIENT_WHATSAPP_URL,
      'https://wa.me/5586999270261?text=Ol%C3%A1%2C%20gostaria%20de%20solicitar%20um%20or%C3%A7amento%20de%20engenharia.',
    ),
  },

  admin: {
    // The UID is not a secret; authorization remains enforced by Firebase/Firestore.
    // Keeping it configurable lets each deployment use a different administrator
    // without changing reusable UI/core code.
    uid: withFallback(process.env.NEXT_PUBLIC_ADMIN_UID, 'hx9EpMe3uhgdaIxlhS8FcsKAhcB2'),
  },

  integrations: {
    emailjs: {
      serviceId: withFallback(process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID, 'service_xud0pne'),
      templateId: withFallback(process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID, 'template_77p928m'),
      publicKey: withFallback(process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY, 'tf-Z6BFUcuXuEt4BQ'),
    },
  },

  metadata: {
    siteUrl: withFallback(process.env.NEXT_PUBLIC_SITE_URL, 'https://site-eng-mick-ramos.vercel.app'),
    title: withFallback(
      process.env.NEXT_PUBLIC_SITE_TITLE,
      'MR Engenharia | Mick Ramos - Engenheiro Civil CREA-PI | Parnaíba',
    ),
    description: withFallback(
      process.env.NEXT_PUBLIC_SITE_DESCRIPTION,
      'Projetos de engenharia civil, laudos técnicos, regularização de imóveis e acompanhamento de obras em Parnaíba e região. Engenheiro Mick Ramos, CREA-PI 1920983666. Solicite um orçamento.',
    ),
    openGraphTitle: withFallback(
      process.env.NEXT_PUBLIC_SITE_OG_TITLE,
      'MR Engenharia | Mick Ramos - Engenheiro Civil',
    ),
    openGraphDescription: withFallback(
      process.env.NEXT_PUBLIC_SITE_OG_DESCRIPTION,
      'Soluções completas em engenharia civil em Parnaíba - PI. Projetos, laudos, regularização e gestão de obras.',
    ),
    previewImagePath: withFallback(process.env.NEXT_PUBLIC_SITE_PREVIEW_IMAGE, '/imagem-preview.jpg'),
  },

  persistence: {
    namespace: withFallback(process.env.NEXT_PUBLIC_SITE_STORAGE_NAMESPACE, 'mr_engenharia'),
  },
} as const;

export type ClientConfig = typeof clientConfig;
