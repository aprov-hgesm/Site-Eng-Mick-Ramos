import type { Metadata } from 'next';
import { clientConfig } from '@/config/client.config';
import './globals.css';

const previewImageUrl = `${clientConfig.metadata.siteUrl}${clientConfig.metadata.previewImagePath}`;

export const metadata: Metadata = {
  metadataBase: new URL(clientConfig.metadata.siteUrl),
  title: clientConfig.metadata.title,
  description: clientConfig.metadata.description,
  openGraph: {
    title: clientConfig.metadata.openGraphTitle,
    description: clientConfig.metadata.openGraphDescription,
    url: clientConfig.metadata.siteUrl,
    images: [
      {
        url: previewImageUrl,
      },
    ],
    type: 'website',
    locale: 'pt_BR',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" data-theme={clientConfig.theme}>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
