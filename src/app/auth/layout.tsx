"use client";

import Link from "next/link";
import type { ReactNode } from "react";

import { LanguageSwitcher } from "@/components/language/LanguageSwitcher";
import { useTranslation } from "@/lib/i18n";

export default function AuthLayout({ children }: { children: ReactNode }) {
    const { t } = useTranslation();
    const rawLogos = t("logos");
    const logos = (rawLogos && typeof rawLogos === "object" ? rawLogos : {}) as {
        atsAlt?: string;
        opnsenseAlt?: string;
    };
    const rawNote = t("serverChange.platformNote");
    const platformNote =
        typeof rawNote === "string"
            ? rawNote
            : "This platform is part of the ATS infrastructure upgrade programme.";

    return (
        <div className="relative flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
            <LanguageSwitcher className="absolute right-4 top-4" />
            <div className="flex w-full max-w-sm flex-col gap-6">
                <Link href="/" className="flex items-center justify-center gap-4">
                    <img
                        src="/images/ats-logo.png"
                        alt={logos.atsAlt ?? "ATS"}
                        width={140}
                        height={56}
                        className="h-12 w-auto object-contain"
                    />
                    <img
                        src="/images/opnsense.png"
                        alt={logos.opnsenseAlt ?? "OPNsense"}
                        width={160}
                        height={64}
                        className="h-12 w-auto object-contain"
                    />
                </Link>
                <main className="flex flex-col gap-6">
                    {children}
                </main>
                <div className="text-balance text-center text-xs text-muted-foreground">{platformNote}</div>
            </div>
        </div>
    );
}
