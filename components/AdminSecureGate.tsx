'use client';

import React from 'react';
import { AdminView } from '@/components/views/AdminView';

type AdminTab = 'inicio' | 'sobre' | 'servicos' | 'projetos' | 'blog' | 'contato';

interface AdminSecureGateProps {
  onNavigateToTab: (tab: AdminTab) => void;
}

export const AdminSecureGate: React.FC<AdminSecureGateProps> = ({ onNavigateToTab }) => {
  return <AdminView onNavigateToTab={onNavigateToTab} />;
};
