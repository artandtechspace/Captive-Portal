"use client";

import Image from "next/image";
import Link from "next/link";
import {useEffect, useMemo} from "react";
import Markdown from "react-markdown";

import {Button} from "@/components/ui/button";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {type Locale, useTranslation, useTranslations} from "@/lib/i18n";

const TERMS_DICTIONARY: Record<
    Locale,
    {
        pageTitle: string;
        heading: string;
        backLabel: string;
        effectiveLabel: string;
        updatedLabel: string;
        changedDate: string;
        dateLocale: string;
        logoAlts: {
            ats: string;
            opnsense: string;
        };
    }
> = {
    de: {
        pageTitle: "WiFi-Nutzungsbedingungen ATS",
        heading: "Nutzungsbedingungen für WLAN-Zugriff",
        backLabel: "Zurück zur Startseite",
        effectiveLabel: "Stand",
        updatedLabel: "Zuletzt geändert",
        changedDate: "20.08.2025",
        dateLocale: "de-DE",
        logoAlts: {
            ats: "ATS Logo",
            opnsense: "OPNsense Logo",
        },
    },
    en: {
        pageTitle: "ATS WiFi Terms of Use",
        heading: "Terms of Use for WiFi Access",
        backLabel: "Back to home page",
        effectiveLabel: "Effective",
        updatedLabel: "Last updated",
        changedDate: "20 August 2025",
        dateLocale: "en-GB",
        logoAlts: {
            ats: "ATS logo",
            opnsense: "OPNsense logo",
        },
    },
};

function resolveDictionary(locale: Locale) {
    return TERMS_DICTIONARY[locale] ?? TERMS_DICTIONARY.de;
}

export default function TermsContent({deContent, enContent}: { deContent: string; enContent: string }) {
    const {locale} = useTranslations();
    const dictionary = resolveDictionary(locale);
    const {t} = useTranslation();
    const rawLogos = t("logos");
    const logos = (rawLogos && typeof rawLogos === "object" ? rawLogos : {}) as {
        atsAlt?: string;
        opnsenseAlt?: string;
    };
    useEffect(() => {
        if (dictionary.pageTitle) {
            document.title = dictionary.pageTitle;
        }
    }, [dictionary.pageTitle]);

    const today = useMemo(
        () =>
            new Intl.DateTimeFormat(dictionary.dateLocale, {
                dateStyle: "long",
                timeZone: "Europe/Berlin",
            }).format(new Date()),
        [dictionary.dateLocale],
    );

    const termsContent = locale === "en" ? enContent : deContent;

    return (
        <main className="blur-background relative min-h-screen bg-background/90">
            <div className="container mx-auto flex min-h-screen items-center justify-center px-4 py-16">
                <Card className="w-full max-w-3xl border border-border bg-card/90 shadow-xl backdrop-blur">
                    <CardHeader className="flex flex-row items-center justify-between">
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
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <BackButton label={dictionary.backLabel}/>
                            <div className="text-sm text-muted-foreground sm:text-right">
                                <p>
                                    {dictionary.effectiveLabel}: {today}
                                </p>
                                <p>
                                    {dictionary.updatedLabel}: {dictionary.changedDate}
                                </p>
                            </div>
                        </div>
                        <CardTitle className="text-2xl font-medium text-foreground">
                            {dictionary.heading}
                        </CardTitle>
                        <article className="prose prose-sm max-w-none text-muted-foreground dark:prose-invert">
                            <Markdown>{termsContent}</Markdown>
                        </article>
                        <div className="flex justify-center">
                            <BackButton label={dictionary.backLabel}/>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </main>
    );
}

function BackButton({label}: { label: string }) {
    return (
        <Button asChild variant="outline">
            <Link href="/">{label}</Link>
        </Button>
    );
}
