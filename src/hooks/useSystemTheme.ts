import {useEffect} from "react";

export const useSystemTheme = () => {
    useEffect(() => {
        if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
            return;
        }

        const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
        if (!mediaQuery) {
            return;
        }
        const rootElement = document.documentElement;

        const applyTheme = (isDark: boolean) => {
            rootElement.classList.toggle("dark", isDark);
        };

        applyTheme(mediaQuery.matches);

        const handleChange = (event: MediaQueryListEvent) => {
            applyTheme(event.matches);
        };

        if (typeof mediaQuery.addEventListener === "function") {
            mediaQuery.addEventListener("change", handleChange);

            return () => {
                mediaQuery.removeEventListener("change", handleChange);
            };
        }

        mediaQuery.addListener(handleChange);

        return () => {
            mediaQuery.removeListener(handleChange);
        };
    }, []);
};
