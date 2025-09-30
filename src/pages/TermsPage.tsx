import { useEffect, useMemo } from 'react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslations } from '@/lib/i18n';

type TermsSection = {
  title?: string;
  paragraphs?: string[];
  list?: string[];
};

type TermsContent = {
  pageTitle?: string;
  heading?: string;
  sections?: TermsSection[];
};

const emptyTerms: TermsContent = { pageTitle: '', heading: '', sections: [] };

export const TermsPage = () => {
  const { t } = useTranslations();
  const terms = useMemo(() => (t('terms') as TermsContent | undefined) ?? emptyTerms, [t]);
  const sections = terms.sections ?? [];

  useEffect(() => {
    if (terms.pageTitle) {
      document.title = terms.pageTitle;
    }
  }, [terms.pageTitle]);

  return (
    <div className="blur-background relative min-h-screen bg-slate-100/90">
      <div className="container mx-auto flex min-h-screen items-center justify-center px-4 py-16">
        <Card className="w-full max-w-3xl border border-white/60 bg-white/90 backdrop-blur shadow-xl">
          <CardHeader className="flex flex-row items-center justify-between">
            <img alt={String((t('logos.atsAlt') as string) ?? 'ATS')} className="w-24" src="/images/ats-logo.png" />
            <img alt={String((t('logos.opnsenseAlt') as string) ?? 'OPNsense')} className="w-32" src="/images/opnsense.png" />
          </CardHeader>
          <CardContent className="space-y-6">
            <CardTitle className="text-2xl font-medium text-foreground">
              {terms.heading}
            </CardTitle>
            <div className="space-y-6 text-sm leading-6 text-muted-foreground">
              {sections.map((section, index) => (
                <section key={section.title ?? `section-${index}`} className="space-y-3">
                  {section.title ? <h2 className="text-lg font-semibold text-foreground">{section.title}</h2> : null}
                  {section.paragraphs?.map((paragraph, paragraphIndex) => (
                    <p key={`${section.title ?? 'paragraph'}-${paragraphIndex}`}>{paragraph}</p>
                  ))}
                  {section.list ? (
                    <ol className="list-decimal space-y-2 pl-5">
                      {section.list.map((item, itemIndex) => (
                        <li key={`${section.title ?? 'item'}-${itemIndex}`}>{item}</li>
                      ))}
                    </ol>
                  ) : null}
                </section>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
