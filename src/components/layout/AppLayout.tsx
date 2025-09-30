import { Outlet } from 'react-router-dom';

import { LanguageSwitcher } from '@/components/language/LanguageSwitcher';
import { Toaster } from '@/components/ui/toaster';
import { useTranslations } from '@/lib/i18n';
import { useSystemTheme } from '@/hooks/useSystemTheme';

export const AppLayout = () => {
  const { language, setLanguage, languageOptions, t } = useTranslations();
  useSystemTheme();

  return (
    <div className="relative min-h-screen bg-cover bg-center">
      <div className="fixed right-4 top-4 z-50 rounded-full border border-border bg-background/80 px-4 py-2 shadow">
        <LanguageSwitcher
          label={String(t('languageLabel') ?? '')}
          value={language}
          options={languageOptions}
          onChange={setLanguage}
          triggerClassName="w-[150px] border-0 bg-transparent px-0 text-sm focus-visible:ring-0"
          labelClassName="text-sm font-medium text-foreground"
        />
      </div>

      <Outlet />
      <Toaster />
    </div>
  );
};
