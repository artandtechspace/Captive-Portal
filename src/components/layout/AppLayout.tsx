import Image from "next/image";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type AppLayoutProps = {
  children: ReactNode;
  /** Optional note shown under the content. */
  platformNote?: string;
  /** Outer container classes (centering, padding, min-height). */
  className?: string;
  /** Inner content wrapper classes (width / max-width). */
  contentClassName?: string;
};

export const AppLayout = ({
  children,
  platformNote,
  className,
  contentClassName,
}: AppLayoutProps) => {
  return (
    <div
      className={cn(
        "relative flex min-h-svh flex-col items-center justify-start gap-4 px-4 py-6 sm:gap-6 sm:px-6 md:px-10 md:py-10 min-[36rem]:justify-center",
        className,
      )}
    >
      <div
        className={cn(
          // Allow variable sizing: full width by default, caller can override max width.
          "flex w-full flex-col gap-4 sm:gap-6",
          // Sensible default max-width that still allows larger layouts when overridden.
          "max-w-md",
          contentClassName,
        )}
      >
        <div className="flex items-center gap-2 self-center font-medium">
          <Image
            alt="ATS"
            className="h-20 w-auto object-contain dark:hidden"
            height={80}
            priority
            src="/images/ats-logo-light.svg"
            width={200}
          />
          <Image
            alt="ATS"
            className="hidden h-20 w-auto object-contain dark:block"
            height={80}
            priority
            src="/images/ats-logo-dark.svg"
            width={200}
          />
        </div>

        <main className="flex flex-col gap-4 sm:gap-6">{children}</main>

        {platformNote ? (
          <div className="text-balance text-center text-xs text-muted-foreground">
            {platformNote}
          </div>
        ) : null}
      </div>
    </div>
  );
};
