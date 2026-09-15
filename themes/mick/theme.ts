export const mickTheme = {
  name: 'mick',
  colors: {
    page: '#0F172A',
    header: '#0A1128',
    headerMobile: '#0D182E',
    footer: '#070D1E',
    footerBottom: '#040813',
    accent: '#F59E0B',
    accentDark: '#D97706',
    accentDeep: '#B45309',
  },
  typography: {
    sans: 'Plus Jakarta Sans',
    serif: 'Playfair Display',
  },
} as const;

export type MickTheme = typeof mickTheme;
