<script lang="ts">
    import {onMount} from 'svelte';
    import {t} from '$lib/i18n';
    import {CaptivePortalClient, ClientState} from '$lib/api';

    type LoginState = 'loading' | 'password' | 'anonymous' | 'authorized';

    interface WindowWithZoneId extends Window {
        zoneid?: string;
    }

    let username = '';
    let password = '';
    let termsAccepted = false;
    let zoneId = '';
    let loginState: LoginState = 'loading';
    let errorMessage = '';
    let showError = false;
    const client = new CaptivePortalClient();

    const params: URLSearchParams | null =
        typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;

    const getTranslationString = (key: string, fallback: string): string => {
        const value = $t(key);
        return typeof value === 'string' ? value : fallback;
    };

    const getErrorMessage = (error: unknown, fallbackKey: string, fallbackMessage: string): string => {
        if (error instanceof Error && error.message) {
            return error.message;
        }

        return getTranslationString(fallbackKey, fallbackMessage);
    };

    onMount(() => {
        if (typeof window !== 'undefined') {
            zoneId = (window as WindowWithZoneId).zoneid ?? '';
        }
        void checkStatus();
    });

    $: canSubmit = termsAccepted && username.trim().length > 0 && password.trim().length > 0;
    $: isPasswordLoginVisible = loginState === 'password';
    $: isAnonymousLoginVisible = loginState === 'anonymous';
    $: isLogoutVisible = loginState === 'authorized';

    function getRedirectUrl(): string | null {
        if (!params) return null;
        return params.get('redirurl');
    }

    function handleSuccessRedirect(useHttps = true): void {
        const redir = getRedirectUrl();
        if (redir) {
            const protocol = useHttps ? 'https://' : 'http://';
            window.location.href = `${protocol}${redir}?refresh`;
        } else {
            window.location.reload();
        }
    }

    function showErrorMessage(message: string): void {
        errorMessage = message;
        showError = true;
    }

    async function requestWithFallback<T>(
        executor: (currentZoneId: string) => Promise<{ status: number; ok: boolean; data: T | null }>
    ): Promise<{ status: number; ok: boolean; data: T | null }> {
        const zoneCandidates = zoneId ? [zoneId, ''] : [''];
        let lastError: Error | null = null;

        for (let index = 0; index < zoneCandidates.length; index += 1) {
            const currentZoneId = zoneCandidates[index];
            try {
                const response = await executor(currentZoneId);

                if (response.status === 404 && index < zoneCandidates.length - 1) {
                    continue;
                }

                return response;
            } catch (error) {
                lastError = error instanceof Error
                    ? error
                    : new Error(getTranslationString('errors.serverUnavailable', 'Server unavailable.'));

                if (index < zoneCandidates.length - 1) {
                    continue;
                }
            }
        }

        throw lastError ?? new Error(getTranslationString('errors.serverUnavailable', 'Server unavailable.'));
    }

    async function checkStatus(): Promise<void> {
        try {
            const response = await requestWithFallback((currentZoneId) =>
                client.getClientStatus(currentZoneId)
            );

            if (!response.ok || !response.data) {
                throw new Error(getTranslationString('errors.serverUnavailable', 'Server unavailable.'));
            }

            const data = response.data;

            if (data.clientState === ClientState.AUTHORIZED) {
                loginState = 'authorized';
            } else if (data.clientState === ClientState.NOT_AUTHORIZED && data.authType === 'none') {
                loginState = 'anonymous';
            } else {
                loginState = 'password';
            }
        } catch (error) {
            showErrorMessage(getErrorMessage(error, 'errors.serverUnavailable', 'Server unavailable.'));
            loginState = 'password';
        }
    }

    async function handleLogin(event: Event): Promise<void> {
        event.preventDefault();
        showError = false;

        try {
            const response = await requestWithFallback((currentZoneId) =>
                client.logon(currentZoneId, {user: username, password})
            );

            if (!response.ok || !response.data) {
                throw new Error(getTranslationString('errors.serverUnavailable', 'Server unavailable.'));
            }

            const data = response.data;

            if (data.clientState === ClientState.AUTHORIZED) {
                handleSuccessRedirect(true);
            } else {
                username = '';
                password = '';
                showErrorMessage(getTranslationString('errors.authenticationFailed', 'Authentication failed.'));
            }
        } catch (error) {
            showErrorMessage(getErrorMessage(error, 'errors.serverUnavailable', 'Server unavailable.'));
        }
    }

    async function handleAnonymousLogin(event: Event): Promise<void> {
        event.preventDefault();
        showError = false;

        try {
            const response = await requestWithFallback((currentZoneId) =>
                client.logon(currentZoneId, {user: '', password: ''})
            );

            if (!response.ok || !response.data) {
                throw new Error(getTranslationString('errors.serverUnavailable', 'Server unavailable.'));
            }

            const data = response.data;

            if (data.clientState === ClientState.AUTHORIZED) {
                handleSuccessRedirect(false);
            } else {
                showErrorMessage(getTranslationString('errors.anonymousFailed', 'Anonymous login failed.'));
            }
        } catch (error) {
            showErrorMessage(getErrorMessage(error, 'errors.serverUnavailable', 'Server unavailable.'));
        }
    }

    async function handleLogout(event: Event): Promise<void> {
        event.preventDefault();
        showError = false;

        try {
            const response = await requestWithFallback((currentZoneId) =>
                client.logoff(currentZoneId)
            );

            if (!response.ok) {
                throw new Error(getTranslationString('errors.serverUnavailable', 'Server unavailable.'));
            }

            window.location.reload();
        } catch (error) {
            showErrorMessage(getErrorMessage(error, 'errors.serverUnavailable', 'Server unavailable.'));
        }
    }

    function closeError(): void {
        showError = false;
    }
</script>

<svelte:head>
    <title>{$t('pageTitle')}</title>
</svelte:head>

<style>
    @reference "tailwindcss";
</style>

<div class="blur-background relative min-h-screen bg-gray-100">
    <div class="container mx-auto max-w-lg p-5 min-h-screen flex items-center justify-center">
        <div class="bg-white shadow-lg rounded-lg px-8 pt-6 pb-8 mb-4 w-full">
            <div class="flex justify-between items-center mb-6">
                <img alt={$t('logos.atsAlt')} class="w-24" src="/images/ats-logo.png"/>
                <a aria-label={$t('logos.opnsenseAlt')} class="justify-end" href="https://opnsense.org/"
                   rel="noopener noreferrer" target="_blank">
                    <img alt={$t('logos.opnsenseAlt')} class="w-32" src="/images/opnsense.png"/>
                </a>
            </div>
            <header class="mb-10">
                <div class="text-justify">
                    <h1 class="text-2xl font-medium mb-2">{$t('headerTitle')}</h1>
                    <p class="mt-2 text-sm">
                        {$t('headerDescription')}
                    </p>
                </div>
            </header>

            <main>
                {#if isPasswordLoginVisible}
                    <form class="form-signin" on:submit|preventDefault={handleLogin}>
                        <div class="mb-6">
                            <h3 class="font-medium text-xl mb-2">{$t('loginFormTitle')}</h3>
                            <p class="text-sm text-gray-600">
                                {$t('loginFormDescription')}
                            </p>
                        </div>
                        <div class="mb-4">
                            <label for="inputUsername"
                                   class="block text-gray-700 text-sm font-medium mb-2">{$t('usernameLabel')}</label>
                            <input
                                    id="inputUsername"
                                    class="shadow-sm appearance-none border rounded w-full py-2 px-3 text-gray-600 mb-3 focus:outline-none focus:shadow-outline"
                                    bind:value={username}
                                    required
                                    autocomplete="off"
                                    autocapitalize="none"
                                    autocorrect="off"
                                    autofocus
                            />
                        </div>
                        <div class="mb-3">
                            <label for="inputPassword"
                                   class="block text-gray-700 text-sm font-medium mb-2">{$t('passwordLabel')}</label>
                            <input
                                    type="password"
                                    id="inputPassword"
                                    class="shadow-sm appearance-none border rounded w-full py-2 px-3 text-gray-600 mb-3 focus:outline-none focus:shadow-outline"
                                    bind:value={password}
                                    required
                                    autocomplete="current-password"
                            />
                        </div>
                        <div class="mb-6 flex items-start">
                            <input
                                    type="checkbox"
                                    id="termsCheckbox"
                                    class="mt-1"
                                    bind:checked={termsAccepted}
                                    required
                            />
                            <label for="termsCheckbox" class="text-sm ml-2">
                                {$t('termsAgreement.prefix')}{' '}
                                <a aria-label={$t('termsLinkLabel')}
                                   class="text-blue-600 font-semibold hover:text-blue-950 after:content-['_↗']"
                                   href="/terms" target="_blank"
                                >{$t('termsAgreement.linkText')}</a
                                >{' '}
                                {$t('termsAgreement.suffix')}
                            </label>
                        </div>

                        <button
                                class="btn btn-primary w-full py-2 px-4 rounded bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:shadow-outline disabled:opacity-50 disabled:cursor-not-allowed"
                                type="submit"
                                disabled={!canSubmit}
                        >
                            {$t('loginButton')}
                        </button>
                    </form>
                {/if}

                {#if isAnonymousLoginVisible}
                    <div class="mt-6">
                        <button
                                class="btn btn-primary w-full py-2 px-4 rounded bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:shadow-outline"
                                on:click|preventDefault={handleAnonymousLogin}
                        >
                            {$t('anonymousButton')}
                        </button>
                    </div>
                {/if}

                {#if isLogoutVisible}
                    <div class="mt-6">
                        <button
                                class="btn btn-primary w-full py-2 px-4 rounded bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:shadow-outline"
                                on:click|preventDefault={handleLogout}
                        >
                            {$t('logoutButton')}
                        </button>
                    </div>
                {/if}

                {#if showError}
                    <div class="alert bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mt-6"
                         role="alert">
                        <span class="block sm:inline">{errorMessage}</span>
                        <button
                                class="absolute top-0 bottom-0 right-0 px-4 py-3"
                                type="button"
                                aria-label={$t('errors.closeErrorAria')}
                                on:click={closeError}
                        >
                            <svg class="fill-current h-6 w-6 text-red-500" role="img" viewBox="0 0 20 20">
                                <title>{$t('errors.closeErrorTitle')}</title>
                                <path
                                        d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z"
                                />
                            </svg>
                        </button>
                    </div>
                {/if}
            </main>
        </div>
    </div>
</div>

<footer class="deciso-brand">
    <a aria-label="Deciso" href="https://www.deciso.com" rel="noopener noreferrer" target="_blank">
        <img alt="Deciso" class="regular-logo" src="/images/deciso-brand.svg"/>
        <img alt="Deciso" class="hover-logo" src="/images/deciso-brand-hover.svg"/>
    </a>
</footer>
