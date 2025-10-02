"use client";

import type {ReactNode} from 'react';

import {useSystemTheme} from '@/hooks/useSystemTheme';
import {useTranslation} from '@/lib/i18n';
import Image from 'next/image';
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
        <div
            className="relative flex min-h-svh flex-col items-center justify-start gap-4 bg-muted px-4 py-6 sm:gap-6 sm:px-6 md:px-10 md:py-10 min-[36rem]:justify-center">
            <div className="flex w-full max-w-sm flex-col gap-4 sm:gap-6">
                <Link href="#" className="flex items-center gap-2 self-center font-medium">
                    <Image
                        alt={logos.atsAlt ?? "ATS"}
                        className="h-20 w-auto object-contain dark:hidden"
                        height={80}
                        priority
                        src="/images/ats-logo-light.svg"
                        width={200}
                    />
                    <Image
                        alt={logos.atsAlt ?? "ATS"}
                        className="hidden h-20 w-auto object-contain dark:block"
                        height={80}
                        priority
                        src="/images/ats-logo-dark.svg"
                        width={200}
                    />
                </Link>
                <main className="flex flex-col gap-4 sm:gap-6">
                    {children}
                </main>
                <div className="text-balance text-center text-xs text-muted-foreground">{platformNote}</div>
            </div>
        </div>
    );
};
