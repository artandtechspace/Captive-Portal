"use client";

import {createContext, type ReactNode, useCallback, useContext, useEffect, useMemo, useRef, useState,} from "react";

import de from "@/locales/de.json";
import en from "@/locales/en.json";

const messages = {en, de} as const;

export type Locale = keyof typeof messages;

export type MessageValue =
    | string
    | number
    | boolean
    | MessageValue[]
    | { [key: string]: MessageValue };

type TranslationMap = Record<string, MessageValue>;

interface I18nContextValue {
    locale: Locale;
    setLocale: (locale: Locale) => void;
    t: (key: string, params?: Record<string, string | number>) => MessageValue | string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

const DEFAULT_LOCALE: Locale = "de";
const SUPPORTED_LOCALES = Object.keys(messages) as Locale[];

function getInitialLocale(): Locale {
    return DEFAULT_LOCALE;
}

function readLocaleFromCookie(): Locale | null {
    if (typeof document === "undefined") {
        return null;
    }

    const match = document.cookie.match(/(?:^|; )locale=([^;]+)/);
    if (!match) {
        return null;
    }

    try {
        const value = decodeURIComponent(match[1]) as Locale;
        return SUPPORTED_LOCALES.includes(value) ? value : null;
    } catch {
        return null;
    }
}

function resolveMessage(map: TranslationMap | MessageValue, key: string): MessageValue | undefined {
    const segments = key.split(".");
    let current: MessageValue | TranslationMap | undefined = map;

    for (const segment of segments) {
        if (current && typeof current === "object" && !Array.isArray(current) && segment in current) {
            current = (current as TranslationMap)[segment];
        } else {
            return undefined;
        }
    }

    return current;
}

function formatMessage(value: MessageValue | undefined, params?: Record<string, string | number>) {
    if (typeof value !== "string" || !params) return value ?? "";

    return Object.entries(params).reduce(
        (acc, [paramKey, paramValue]) => acc.replace(`{${paramKey}}`, String(paramValue)),
        value,
    );
}

export function I18nProvider({children, initialLocale}: { children: ReactNode; initialLocale?: Locale }) {
    const [locale, setLocaleState] = useState<Locale>(initialLocale ?? getInitialLocale());
    const localeRef = useRef(locale);

    useEffect(() => {
        const cookieLocale = readLocaleFromCookie();
        const navigatorLocale =
            typeof window !== "undefined" && window.navigator.language?.startsWith("de") ? "de" : DEFAULT_LOCALE;
        const preferred = cookieLocale ?? navigatorLocale;

        if (preferred && preferred !== localeRef.current && SUPPORTED_LOCALES.includes(preferred)) {
            setLocaleState(preferred);
        }
    }, []);

    useEffect(() => {
        if (typeof document === "undefined") {
            localeRef.current = locale;
            return;
        }

        try {
            document.cookie = `locale=${encodeURIComponent(locale)}; Path=/; Max-Age=${60 * 60 * 24 * 365}; SameSite=Lax`;
            document.documentElement.setAttribute("lang", locale);
        } catch {
            // ignore persistence errors
        }

        localeRef.current = locale;
    }, [locale]);

    const setLocale = useCallback((nextLocale: Locale) => {
        if (!SUPPORTED_LOCALES.includes(nextLocale) || localeRef.current === nextLocale) {
            return;
        }

        localeRef.current = nextLocale;
        setLocaleState(nextLocale);
    }, []);

    const t = useCallback(
        (key: string, params?: Record<string, string | number>) => {
            const messageMap = messages[locale] as TranslationMap;
            const fallbackMap = messages[DEFAULT_LOCALE] as TranslationMap;
            const value = resolveMessage(messageMap, key) ?? resolveMessage(fallbackMap, key);
            if (typeof value === "string") {
                return formatMessage(value, params);
            }
            return value ?? key;
        },
        [locale],
    );

    const value = useMemo<I18nContextValue>(() => ({locale, setLocale, t}), [locale, setLocale, t]);

    return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useTranslation() {
    const ctx = useContext(I18nContext);
    if (!ctx) {
        throw new Error("useTranslation must be used within I18nProvider");
    }
    return ctx;
}

export const useTranslations = useTranslation;
