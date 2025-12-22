"use client";

import * as React from "react";

import TermsContent from "./terms-content";
import { AppLayout } from "@/components/layout/AppLayout";

export default function TermsPage() {
  const [deContent, setDeContent] = React.useState<string>("");
  const [enContent, setEnContent] = React.useState<string>("");
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const [deRes, enRes] = await Promise.all([
          fetch("/terms/terms.de.md", { cache: "force-cache" }),
          fetch("/terms/terms.en.md", { cache: "force-cache" }),
        ]);

        if (!deRes.ok || !enRes.ok) {
          throw new Error(
            `Failed to load terms (de: ${deRes.status}, en: ${enRes.status})`,
          );
        }

        const [de, en] = await Promise.all([deRes.text(), enRes.text()]);

        if (cancelled) return;
        setDeContent(de);
        setEnContent(en);
      } catch (e) {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : "Failed to load terms.");
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <AppLayout contentClassName="max-w-3xl">
      {error ? (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          {error}
        </div>
      ) : (
        <TermsContent deContent={deContent} enContent={enContent} />
      )}
    </AppLayout>
  );
}
