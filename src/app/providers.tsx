"use client";

import React, {ReactNode} from 'react';
import {I18nProvider} from '@/lib/i18n';
import {useSystemTheme} from "@/hooks/useSystemTheme";
import {LanguageSwitcher} from "@/components/language/LanguageSwitcher";
import {Toaster} from "@/components/ui/toaster";

export const Providers = ({children}: { children: ReactNode }) => {
    useSystemTheme();

    return (
        <I18nProvider>
            <div className="relative min-h-screen bg-cover bg-center">
                <div className="fixed right-4 top-4 z-50">
                    <LanguageSwitcher className="w-fit"/>
                </div>
                {children}
                <Toaster/>
            </div>
        </I18nProvider>
    );
};
