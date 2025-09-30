import { Outlet } from 'react-router-dom';

import { Toaster } from '@/components/ui/toaster';
import { Label } from '@/components/ui/label';
import { useTranslations } from '@/lib/i18n';
import { useSystemTheme } from '@/hooks/useSystemTheme';

export const AppLayout = () => {
  const { language, setLanguage, languageOptions, t } = useTranslations();
  useSystemTheme();

  return (
    <div className="relative min-h-screen bg-cover bg-center">
      <div className="fixed right-4 top-4 z-50 flex items-center gap-2 rounded-full border border-border bg-background/80 px-4 py-2 text-foreground shadow">
        <Label htmlFor="language-select" className="text-sm font-medium text-foreground">
          {String(t('languageLabel') ?? '')}
        </Label>
        <select
          id="language-select"
          value={language}
          onChange={(event) => setLanguage(event.target.value)}
          className="rounded-full border border-border bg-background px-3 py-1 text-sm text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          {languageOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <Outlet />
      <Toaster />
    </div>
  );
};
