"use client";

import type { ReactNode } from 'react';

import { AppLayout } from '@/components/layout/AppLayout';
import { TranslationProvider } from '@/lib/i18n';

export const Providers = ({ children }: { children: ReactNode }) => {
  return (
    <TranslationProvider>
      <AppLayout>{children}</AppLayout>
    </TranslationProvider>
  );
};
