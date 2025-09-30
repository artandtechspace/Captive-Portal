"use client";

import type { ReactNode } from 'react';

import { AppLayout } from '@/components/layout/AppLayout';
import { I18nProvider } from '@/lib/i18n';

export const Providers = ({ children }: { children: ReactNode }) => {
  return (
    <I18nProvider>
      <AppLayout>{children}</AppLayout>
    </I18nProvider>
  );
};
