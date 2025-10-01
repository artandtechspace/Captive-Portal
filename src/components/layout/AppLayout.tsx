"use client";

import type {ReactNode} from 'react';

import {LanguageSwitcher} from '@/components/language/LanguageSwitcher';
import {Toaster} from '@/components/ui/toaster';
import {useSystemTheme} from '@/hooks/useSystemTheme';
import {useTranslation} from '@/lib/i18n';
import Link from "next/link";

type AppLayoutProps = {
    children: ReactNode;
};

export const AppLayout = ({children}: AppLayoutProps) => {
    const {t} = useTranslation();
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
    useSystemTheme();

    return (
        <div className="relative min-h-screen bg-cover bg-center">
            <div className="fixed right-4 top-4 z-50">
                <LanguageSwitcher className="w-fit"/>
            </div>

            <div
                className="relative flex min-h-svh flex-col items-center justify-start gap-4 bg-muted px-4 py-6 sm:gap-6 sm:px-6 md:px-10 md:py-10 min-[36rem]:justify-center">
                <LanguageSwitcher className="self-end min-[36rem]:absolute min-[36rem]:right-4 min-[36rem]:top-4"/>
                <div className="flex w-full max-w-sm flex-col gap-4 sm:gap-6">
                    <Link href="#" className="flex items-center gap-2 self-center font-medium">
                        <img
                            src="/images/ats-logo-light.svg"
                            alt={logos.atsAlt ?? "ATS"}
                            width={140}
                            height={56}
                            className="h-20 w-auto object-contain dark:hidden"
                        />
                        <img
                            src="/images/ats-logo-dark.svg"
                            alt={logos.atsAlt ?? "ATS"}
                            width={160}
                            height={64}
                            className="h-20 w-auto object-contain hidden dark:block"
                        />
                    </Link>
                    <main className="flex flex-col gap-4 sm:gap-6">
                        {children}
                    </main>
                    <div className="text-balance text-center text-xs text-muted-foreground">{platformNote}</div>
                </div>
            </div>
            <Toaster/>
        </div>
    );
};
