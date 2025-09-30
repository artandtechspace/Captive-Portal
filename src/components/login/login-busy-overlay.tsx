"use client";

import {Loader2} from "lucide-react";
import React from "react";

type LoginBusyOverlayProps = {
    busy: boolean;
    message: string;
};

export function LoginBusyOverlay({busy, message}: LoginBusyOverlayProps) {
    if (!busy) {
        return null;
    }

    return (
        <div
            aria-live="polite"
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/70 backdrop-blur-sm"
            role="status"
        >
            <div className="flex items-center gap-3 rounded-lg bg-white/90 px-6 py-4 shadow-xl">
                <Loader2 aria-hidden className="h-5 w-5 animate-spin text-primary"/>
                <span className="text-sm font-medium text-muted-foreground">{message}</span>
            </div>
        </div>
    );
}
