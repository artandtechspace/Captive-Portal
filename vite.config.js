import {sveltekit} from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import {defineConfig} from 'vitest/config';
export default defineConfig({
    plugins: [tailwindcss(), sveltekit()],
    test: {
        environment: 'jsdom',
        setupFiles: ['src/setupTests.ts'],
        include: ['src/**/*.{test,spec}.{js,ts}']
    },
    resolve: process.env?.VITEST
        ? {
            conditions: ['browser']
        } : undefined
});
