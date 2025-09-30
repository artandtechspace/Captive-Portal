"use client";

import type { ReactNode } from 'react';

import { LanguageSwitcher } from '@/components/language/LanguageSwitcher';
import { Toaster } from '@/components/ui/toaster';
import { useSystemTheme } from '@/hooks/useSystemTheme';
import { useTranslation } from '@/lib/i18n';

type AppLayoutProps = {
  children: ReactNode;
};

export const AppLayout = ({ children }: AppLayoutProps) => {
  const { t } = useTranslation();
  useSystemTheme();

  return (
    <div className="relative min-h-screen bg-cover bg-center">
      <div className="fixed right-4 top-4 z-50">
        <LanguageSwitcher className="w-fit" />
      </div>

      {children}
      <Toaster />
    </div>
  );
};
