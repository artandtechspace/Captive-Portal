import {join} from 'path'
import type {Config} from 'tailwindcss'
import forms from '@tailwindcss/forms';
import typography from '@tailwindcss/typography';
import defaultTheme from 'tailwindcss/defaultTheme';

export default {
    darkMode: 'class',
    content: ['./src/**/*.{html,js,svelte,ts}', join(require.resolve('@skeletonlabs/skeleton'), '../**/*.{html,js,svelte,ts}')],
    theme: {
        extend: {},
        screens: {
            ...defaultTheme.screens,
        },
    },
    plugins: [
        forms,
        typography,
    ],
} satisfies Config;
