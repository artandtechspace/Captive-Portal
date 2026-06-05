"use client";

import * as React from "react";

import TermsContent from "./terms-content";
import { AppLayout } from "@/components/layout/AppLayout";
import { useTranslations } from "@/lib/i18n";

export default function TermsPage() {
  const { locale } = useTranslations();
  const [content, setContent] = React.useState<string>("");
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const res = await fetch(`/terms/terms.${locale}.md`, { cache: "force-cache" });

        if (!res.ok) {
          throw new Error(
            `Failed to load terms (${locale}: ${res.status})`,
          );
        }

        const text = await res.text();

        if (cancelled) return;
        setContent(text);
        setError(null);
      } catch (e) {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : "Failed to load terms.");
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, [locale]);

  return (
    <AppLayout contentClassName="max-w-3xl">
      {error ? (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          {error}
        </div>
      ) : (
        <TermsContent content={content} />
      )}
    </AppLayout>
  );
}
