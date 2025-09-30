"use client";

import React from "react";

type LoginBrandingHeaderProps = {
    atsAlt?: string;
    opnsenseAlt?: string;
};

export function LoginBrandingHeader({atsAlt, opnsenseAlt}: LoginBrandingHeaderProps) {
    return (
        <header className="sticky top-0 z-10 bg-white/80 backdrop-blur">
            <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
                <img alt={atsAlt ?? "ATS"} className="w-24" src="/src/assets/images/ats-logo.png"/>
                <a
                    aria-label={opnsenseAlt ?? "OPNsense"}
                    className="transition-opacity hover:opacity-80"
                    href="https://opnsense.org/"
                    rel="noopener noreferrer"
                    target="_blank"
                >
                    <img alt={opnsenseAlt ?? "OPNsense"} className="w-32" src="/src/assets/images/opnsense.png"/>
                </a>
            </div>
        </header>
    );
}
