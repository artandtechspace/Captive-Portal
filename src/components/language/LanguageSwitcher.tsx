"use client";

import { Locale, useTranslation } from "@/lib/i18n";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

type LanguageOption = { value: Locale; label: string; short: string };

function useLanguageOptions(): LanguageOption[] {
  const { t } = useTranslation();
  return [
    { value: "en", label: String(t("lang.english")), short: "EN" },
    { value: "de", label: String(t("lang.german")), short: "DE" },
  ];
}

export function LanguageSwitcher({ className }: { className?: string }) {
  const { locale, setLocale, t } = useTranslation();
  const options = useLanguageOptions();

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Select value={locale} onValueChange={(value) => setLocale(value as Locale)}>
        <SelectTrigger aria-label={String(t("nav.language"))} className="h-8 w-full">
          <SelectValue placeholder={t("nav.language") as string} />
        </SelectTrigger>
        <SelectContent>
          {options.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              <span className="flex items-center gap-2">
                <span className="font-medium">{opt.short}</span>
                <span className="text-sm">{opt.label}</span>
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

export function LanguageMenuSection() {
  const { locale, setLocale, t } = useTranslation();
  const options = useLanguageOptions();

  return (
    <>
      <DropdownMenuLabel inset>{t("nav.language") as string}</DropdownMenuLabel>
      <DropdownMenuRadioGroup value={locale} onValueChange={(value) => setLocale(value as Locale)}>
        {options.map((opt) => (
          <DropdownMenuRadioItem key={opt.value} value={opt.value}>
            {opt.label}
          </DropdownMenuRadioItem>
        ))}
      </DropdownMenuRadioGroup>
    </>
  );
}
