import type { Metadata } from 'next';
import './globals.css'; // Global styles

export const metadata: Metadata = {
  title: 'MR Engenharia | Mick Ramos - Engenheiro Civil CREA-PI | Parnaíba',
  description: 'Projetos de engenharia civil, laudos técnicos, regularização de imóveis e acompanhamento de obras em Parnaíba e região. Engenheiro Mick Ramos, CREA-PI 1920983666. Solicite um orçamento.',
  openGraph: {
    title: 'MR Engenharia | Mick Ramos - Engenheiro Civil',
    description: 'Soluções completas em engenharia civil em Parnaíba - PI. Projetos, laudos, regularização e gestão de obras.',
    url: 'https://site-eng-mick-ramos.vercel.app/',
    images: [
      {
        url: 'https://site-eng-mick-ramos.vercel.app/imagem-preview.jpg',
      },
    ],
    type: 'website',
    locale: 'pt_BR',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}

