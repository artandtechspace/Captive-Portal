import { Outlet } from 'react-router-dom';

import { Toaster } from 'src/components/ui/toaster';
import { Label } from 'src/components/ui/label';
import { useTranslations } from 'src/lib/i18n';

export const AppLayout = () => {
  const { language, setLanguage, languageOptions, t } = useTranslations();

  return (
    <div className="relative min-h-screen bg-cover bg-center">
      <div className="fixed right-4 top-4 z-50 flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 shadow">
        <Label htmlFor="language-select" className="text-sm font-medium text-slate-700">
          {String(t('languageLabel') ?? '')}
        </Label>
        <select
          id="language-select"
          value={language}
          onChange={(event) => setLanguage(event.target.value)}
          className="rounded-full border border-slate-300 bg-white px-3 py-1 text-sm text-slate-700 shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
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
