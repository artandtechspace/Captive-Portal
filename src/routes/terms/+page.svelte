<script lang="ts">
    import {t} from '$lib/i18n';

    interface TermsSection {
        title?: string;
        paragraphs?: string[];
        list?: string[];
    }

    interface TermsContent {
        pageTitle?: string;
        heading?: string;
        sections?: TermsSection[];
    }

    const emptyTerms: TermsContent = {pageTitle: '', heading: '', sections: []};

    $: terms = ($t('terms') as TermsContent | undefined) ?? emptyTerms;
    $: sections = terms.sections ?? [];
</script>

<svelte:head>
    <title>{terms.pageTitle}</title>
</svelte:head>

<div class="blur-background relative min-h-screen bg-gray-100">
    <div class="container mx-auto max-w-2xl p-5 min-h-screen flex items-center justify-center">
        <div class="bg-white shadow-lg rounded-lg px-8 pt-6 pb-8 mb-4">
            <div class="flex justify-between items-center mb-6">
                <img alt={$t('logos.atsAlt')} class="w-24" src="/images/ats-logo.png"/>
                <img alt={$t('logos.opnsenseAlt')} class="w-32 justify-end" src="/images/opnsense.png"/>
            </div>

            <header class="mb-10">
                <div class="prose">
                    <h1 class="text-2xl font-medium mb-4">{terms.heading}</h1>

                    {#each sections as section (section.title)}
                        <div class="mb-4">
                            <h2 class="text-xl font-semibold">{section.title}</h2>

                            {#if section.paragraphs}
                                {#each section.paragraphs as paragraph}
                                    <p>{paragraph}</p>
                                {/each}
                            {/if}

                            {#if section.list}
                                <ol class="list-decimal pl-5">
                                    {#each section.list as item}
                                        <li>{item}</li>
                                    {/each}
                                </ol>
                            {/if}
                        </div>
                    {/each}
                </div>
            </header>
        </div>
    </div>
</div>
