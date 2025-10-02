import type {Metadata} from "next";
import fs from "fs/promises";
import path from "path";

import TermsContent from "./terms-content";

type TermsLocale = "de" | "en";

const TERMS_FILES: Record<TermsLocale, string> = {
    de: "terms.de.md",
    en: "terms.en.md",
};

async function readTermsMarkdown(locale: TermsLocale): Promise<string> {
    const filePath = path.join(process.cwd(), "content", "terms", TERMS_FILES[locale]);
    return fs.readFile(filePath, "utf8");
}

export const metadata: Metadata = {
    title: "Nutzungsbedingungen",
    description: "Regeln für die WLAN-Nutzung im ATS Netzwerk.",
};

export default async function TermsPage() {
    const [deContent, enContent] = await Promise.all([
        readTermsMarkdown("de"),
        readTermsMarkdown("en"),
    ]);

    return <TermsContent deContent={deContent} enContent={enContent}/>;
}
