'use client';

import React from 'react';
import { SiteProvider } from '@/lib/SiteContext';
import { BlogEditorSecureGate } from '@/components/BlogEditorSecureGate';

export default function AdminBlogPage() {
  return (
    <SiteProvider>
      <BlogEditorSecureGate />
    </SiteProvider>
  );
}
