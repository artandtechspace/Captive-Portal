import {Label} from "@/components/ui/label";
import {LanguageOption} from "@/lib/i18n";

type Logos = {
    atsAlt?: string;
    opnsenseAlt?: string;
};

type LoginHeaderProps = {
    logos: Logos;
    language: string;
    languageLabel: string;
    options: LanguageOption[];
    onLanguageChange: (value: string) => void;
    disabled?: boolean;
};

export function LoginHeader({
                                 logos,
                                 language,
                                 languageLabel,
                                 options,
                                 onLanguageChange,
                                 disabled = false
                             }: LoginHeaderProps) {
    return (
        <header className="sticky top-0 z-10 border-b border-border bg-background/80 backdrop-blur">
            <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
                <div className="flex items-center gap-6">
                    <img alt={logos.atsAlt ?? "ATS"} className="w-24" src="/src/assets/images/ats-logo.png"/>
                    <a
                        aria-label={logos.opnsenseAlt ?? "OPNsense"}
                        href="https://opnsense.org/"
                        rel="noopener noreferrer"
                        target="_blank"
                    >
                        <img alt={logos.opnsenseAlt ?? "OPNsense"} className="w-32"
                             src="/src/assets/images/opnsense.png"/>
                    </a>
                </div>
                <div className="flex items-center gap-2">
                    <Label className="text-sm font-medium text-muted-foreground" htmlFor="languageSwitcher">
                        {languageLabel}
                    </Label>
                    <select
                        id="languageSwitcher"
                        className="rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                        value={language}
                        onChange={(event) => onLanguageChange(event.target.value)}
                        disabled={disabled}
                    >
                        {options.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </div>
            </div>
        </header>
    );
}
