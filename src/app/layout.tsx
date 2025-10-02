import type {Metadata} from 'next';
import './globals.css';
import {Providers} from './providers';

const themeInitializer = `(() => {
    try {
        const root = document.documentElement;
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

        root.classList.toggle('dark', prefersDark);
    } catch (error) {}
})();`;

export const metadata: Metadata = {
    title: 'WiFi Login',
    description: 'Sign in to the ATS WiFi portal for secure internet access.',
};

export default function RootLayout({children}: { children: React.ReactNode }) {
    return (
        <html lang="en" suppressHydrationWarning>
        <head>
            <script dangerouslySetInnerHTML={{__html: themeInitializer}}/>
        </head>
        <body className="min-h-screen bg-background text-foreground antialiased">
        <Providers>{children}</Providers>
        </body>
        </html>
    );
}
