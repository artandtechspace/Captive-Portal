<script lang="ts">
    import "../app.css";
    import {language, type LanguageCode, languageOptions, setLanguage, t} from '$lib/i18n';

    let currentLanguage: LanguageCode = 'de';
    $: currentLanguage = $language;

    function handleLanguageChange(event: Event) {
        const target = event.target as HTMLSelectElement | null;
        if (target) {
            setLanguage(target.value as LanguageCode);
        }
    }
</script>

<svelte:head>
    <meta content="IE=edge,chrome=1" http-equiv="X-UA-Compatible"/>
    <meta content="index, follow, noodp, noydir" name="robots"/>
    <meta content="" name="keywords"/>
    <meta content={$t('metaDescription')} name="description"/>
    <meta content="" name="copyright"/>
    <link href="/favicon/favicon.ico" rel="icon"/>
    <script src="/js/zone.js"></script>
</svelte:head>

<div class="language-switcher">
    <label class="language-switcher__label" for="language-select">{$t('languageLabel')}</label>
    <select
            bind:value={currentLanguage}
            class="language-switcher__select"
            id="language-select"
            on:change={handleLanguageChange}
    >
        {#each $languageOptions as option}
            <option value={option.value}>{option.label}</option>
        {/each}
    </select>
</div>

<slot/>

<style>
    :global(body) {
        background-image: url('/images/landscape_poli.jpg');
        background-size: cover;
        background-repeat: no-repeat;
        background-position: center center;
        min-height: 100vh;
    }

    :global(.blur-background::before) {
        content: "";
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: inherit;
        filter: blur(4px);
        z-index: -1;
    }

    .language-switcher {
        position: fixed;
        top: 1rem;
        right: 1rem;
        z-index: 10;
        display: flex;
        gap: 0.5rem;
        align-items: center;
        background: rgba(255, 255, 255, 0.8);
        padding: 0.5rem 0.75rem;
        border-radius: 9999px;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
        font-size: 0.875rem;
    }

    .language-switcher__label {
        font-weight: 500;
        color: #1f2937;
    }

    .language-switcher__select {
        border: 1px solid #d1d5db;
        border-radius: 9999px;
        padding: 0.25rem 0.75rem;
        background-color: white;
        color: #1f2937;
        font-size: 0.875rem;
    }

    .language-switcher__select:focus {
        outline: none;
        box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.3);
        border-color: #3b82f6;
    }
</style>
