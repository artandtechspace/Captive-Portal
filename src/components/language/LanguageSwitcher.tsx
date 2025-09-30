"use client";

import { useCallback, useMemo, useRef } from "react";

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

function useLanguageSelection() {
  const { locale, setLocale, t } = useTranslation();
  const localeRef = useRef(locale);
  localeRef.current = locale;

  const options = useMemo<LanguageOption[]>(
    () => [
      { value: "en", label: String(t("lang.english")), short: "EN" },
      { value: "de", label: String(t("lang.german")), short: "DE" },
    ],
    [t],
  );

  const handleLocaleChange = useCallback(
    (value: string) => {
      const nextLocale = value as Locale;
      if (nextLocale === localeRef.current) {
        return;
      }
      setLocale(nextLocale);
    },
    [setLocale],
  );

  return { locale, t, options, handleLocaleChange };
}

export function LanguageSwitcher({ className }: { className?: string }) {
  const { locale, t, options, handleLocaleChange } = useLanguageSelection();

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Select value={locale} onValueChange={handleLocaleChange}>
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
  const { locale, t, options, handleLocaleChange } = useLanguageSelection();

  return (
    <>
      <DropdownMenuLabel inset>{t("nav.language") as string}</DropdownMenuLabel>
      <DropdownMenuRadioGroup value={locale} onValueChange={handleLocaleChange}>
        {options.map((opt) => (
          <DropdownMenuRadioItem key={opt.value} value={opt.value}>
            {opt.label}
          </DropdownMenuRadioItem>
        ))}
      </DropdownMenuRadioGroup>
    </>
  );
}
