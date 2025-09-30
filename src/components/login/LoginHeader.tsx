type Logos = {
    atsAlt?: string;
    opnsenseAlt?: string;
};

type LoginHeaderProps = {
    logos: Logos;
};

export function LoginHeader({
                                 logos,
                             }: LoginHeaderProps) {
    return (
        <header className="sticky top-0 z-10 border-b border-border bg-background/80 backdrop-blur">
            <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
                <div className="flex items-center gap-6">
                    <img alt={logos.atsAlt ?? "ATS"} className="w-24" src="/images/ats-logo.png"/>
                    <a
                        aria-label={logos.opnsenseAlt ?? "OPNsense"}
                        href="https://opnsense.org/"
                        rel="noopener noreferrer"
                        target="_blank"
                    >
                        <img
                            alt={logos.opnsenseAlt ?? "OPNsense"}
                            className="w-32"
                            src="/images/opnsense.png"
                        />
                    </a>
                </div>
            </div>
        </header>
    );
}
