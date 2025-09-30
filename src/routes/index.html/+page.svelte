<script lang="ts">
    import { onMount } from 'svelte';
    import { t } from '$lib/i18n';
    import { CaptivePortalClient, ClientState } from '$lib/api';

    // Skeleton v3 (Svelte)
    import { AppBar, Toast, createToaster } from '@skeletonlabs/skeleton-svelte';
    const toaster = createToaster();

    type LoginState = 'checking' | 'password' | 'anonymous' | 'authorized';

    // ----- Local state -----
    let username = '';
    let password = '';
    let termsAccepted = false;
    let zoneId = '';
    let state: LoginState = 'checking';
    let busy = false;

    const client = new CaptivePortalClient();
    const params: URLSearchParams | null =
        typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;

    // i18n helper (nutzt $t Store-Auto-Subscription)
    const tr = (key: string, fallback: string): string => {
        const value = $t(key);
        return typeof value === 'string' ? value : fallback;
    };

    function toastError(error: unknown, fallbackKey: string, fallbackMessage: string): void {
        const message = error instanceof Error && error.message ? error.message : tr(fallbackKey, fallbackMessage);
        toaster.error({ title: message });
    }

    function getRedirectTarget(): URL | null {
        const raw = params?.get('redirurl');
        if (!raw) return null;
        try {
            const url = /^https?:\/\//i.test(raw) ? new URL(raw) : new URL(`https://${raw}`);
            return url;
        } catch {
            return null;
        }
    }

    function redirect(preferHttps = true): void {
        const target = getRedirectTarget();
        if (target) {
            if (preferHttps && target.protocol === 'http:') target.protocol = 'https:';
            target.searchParams.set('refresh', '');
            window.location.href = target.toString();
        } else {
            window.location.reload();
        }
    }

    type ApiResponse<T> = { status: number; ok: boolean; data: T | null };
    async function withZone<T>(exec: (zid: string) => Promise<ApiResponse<T>>): Promise<ApiResponse<T>> {
        const candidates = zoneId ? [zoneId, ''] : [''];
        let lastErr: unknown = null;
        for (let i = 0; i < candidates.length; i += 1) {
            try {
                const res = await exec(candidates[i]);
                if (res.status === 404 && i < candidates.length - 1) continue;
                return res;
            } catch (e) {
                lastErr = e;
                if (i < candidates.length - 1) continue;
            }
        }
        throw (lastErr as Error) ?? new Error(tr('errors.serverUnavailable', 'Server unavailable.'));
    }

    async function checkStatus(): Promise<void> {
        state = 'checking';
        try {
            const res = await withZone((z) => client.getClientStatus(z));
            if (!res.ok || !res.data) throw new Error(tr('errors.serverUnavailable', 'Server unavailable.'));
            const { clientState, authType } = res.data;
            state = clientState === ClientState.AUTHORIZED
                ? 'authorized'
                : clientState === ClientState.NOT_AUTHORIZED && authType === 'none'
                    ? 'anonymous'
                    : 'password';
        } catch (e) {
            toastError(e, 'errors.serverUnavailable', 'Server unavailable.');
            state = 'password';
        }
    }

    async function login(e: Event): Promise<void> {
        e.preventDefault();
        if (busy) return;
        busy = true;
        try {
            const res = await withZone((z) => client.logon(z, { user: username.trim(), password }));
            if (!res.ok || !res.data) throw new Error(tr('errors.serverUnavailable', 'Server unavailable.'));
            if (res.data.clientState === ClientState.AUTHORIZED) {
                redirect(true);
            } else {
                username = '';
                password = '';
                toaster.error({ title: tr('errors.authenticationFailed', 'Authentication failed.') });
            }
        } catch (e) {
            toastError(e, 'errors.serverUnavailable', 'Server unavailable.');
        } finally {
            busy = false;
        }
    }

    async function loginAnonymous(): Promise<void> {
        if (busy) return;
        busy = true;
        try {
            const res = await withZone((z) => client.logon(z, { user: '', password: '' }));
            if (!res.ok || !res.data) throw new Error(tr('errors.serverUnavailable', 'Server unavailable.'));
            if (res.data.clientState === ClientState.AUTHORIZED) {
                redirect(false);
            } else {
                toaster.error({ title: tr('errors.anonymousFailed', 'Anonymous login failed.') });
            }
        } catch (e) {
            toastError(e, 'errors.serverUnavailable', 'Server unavailable.');
        } finally {
            busy = false;
        }
    }

    async function logout(): Promise<void> {
        if (busy) return;
        busy = true;
        try {
            const res = await withZone((z) => client.logoff(z));
            if (!res.ok) throw new Error(tr('errors.serverUnavailable', 'Server unavailable.'));
            window.location.reload();
        } catch (e) {
            toastError(e, 'errors.serverUnavailable', 'Server unavailable.');
        } finally {
            busy = false;
        }
    }

    // Derived flags
    $: canSubmit = Boolean(termsAccepted && username.trim() && password.trim());
    $: showPassword = state === 'password';
    $: showAnonymous = state === 'anonymous';
    $: showLogout = state === 'authorized';

    onMount(() => {
        if (typeof window !== 'undefined') {
            zoneId = (window as Window & { zoneid?: string }).zoneid ?? '';
        }
        void checkStatus();
    });
</script>

<svelte:head>
    <title>{$t('pageTitle')}</title>
</svelte:head>

<!-- Toaster für Fehlermeldungen -->
<Toast {toaster} />

<div class="flex min-h-screen flex-col">
    <header class="sticky top-0 z-10">
        <!-- Skeleton v3 AppBar API: gridCols/centerClasses/trailClasses -->
        <AppBar toolbarGridCols="grid-cols-2" centerClasses="place-content-center" trailClasses="place-content-end">
            {#snippet lead()}
                <img alt={$t('logos.atsAlt')} class="w-24" src="/images/ats-logo.png" />
            {/snippet}
            {#snippet trail()}
                <a
                        aria-label={$t('logos.opnsenseAlt')}
                        href="https://opnsense.org/"
                        rel="noopener noreferrer"
                        target="_blank"
                >
                    <img alt={$t('logos.opnsenseAlt')} class="w-32" src="/images/opnsense.png" />
                </a>
            {/snippet}
        </AppBar>
    </header>

    <main class="flex-grow">
        <div class="container mx-auto flex h-full max-w-lg items-center justify-center p-5">
            <div class="card w-full p-8 shadow-lg" aria-busy={busy} aria-live="polite">
                <header class="mb-10 text-justify">
                    <h1 class="h1 mb-2">{$t('headerTitle')}</h1>
                    <p class="mt-2">{$t('headerDescription')}</p>
                </header>

                <section>
                    {#if state === 'checking'}
                        <div class="flex justify-center py-8">
                        </div>
                    {/if}

                    {#if showPassword}
                        <form class="space-y-6" onsubmit={login} autocomplete="off">
                            <div>
                                <h3 class="h3 mb-2">{$t('loginFormTitle')}</h3>
                                <p class="text-sm text-surface-500">{$t('loginFormDescription')}</p>
                            </div>

                            <label class="label">
                                <span>{$t('usernameLabel')}</span>
                                <input
                                        class="input"
                                        type="text"
                                        bind:value={username}
                                        required
                                        autocapitalize="none"
                                        autocorrect="off"
                                        inputmode="email"
                                        disabled={busy}
                                />
                            </label>

                            <label class="label">
                                <span>{$t('passwordLabel')}</span>
                                <input
                                        class="input"
                                        type="password"
                                        bind:value={password}
                                        required
                                        autocomplete="current-password"
                                        disabled={busy}
                                />
                            </label>

                            <div class="flex items-start gap-2">
                                <input
                                        id="termsCheckbox"
                                        class="checkbox"
                                        type="checkbox"
                                        bind:checked={termsAccepted}
                                        required
                                        disabled={busy}
                                />
                                <label for="termsCheckbox" class="text-sm">
                                    {$t('termsAgreement.prefix')} <a class="anchor" href="/terms" target="_blank">{$t('termsAgreement.linkText')}</a> {$t('termsAgreement.suffix')}
                                </label>
                            </div>

                            <button class="btn preset-filled-primary w-full" type="submit" disabled={!canSubmit || busy}>
                                {#if busy}
                                {:else}
                                    {$t('loginButton')}
                                {/if}
                            </button>
                        </form>
                    {/if}

                    {#if showAnonymous}
                        <div class="mt-6">
                            <button class="btn preset-filled-primary w-full" onclick={loginAnonymous} disabled={busy}>
                                {#if busy}
                                {:else}
                                    {$t('anonymousButton')}
                                {/if}
                            </button>
                        </div>
                    {/if}

                    {#if showLogout}
                        <div class="mt-6">
                            <button class="btn preset-filled-primary w-full" onclick={logout} disabled={busy}>
                                {#if busy}
                                {:else}
                                    {$t('logoutButton')}
                                {/if}
                            </button>
                        </div>
                    {/if}
                </section>
            </div>
        </div>
    </main>

    <footer class="deciso-brand fixed bottom-4 right-4">
        <a aria-label="Deciso" href="https://www.deciso.com" rel="noopener noreferrer" target="_blank">
            <img alt="Deciso" class="regular-logo" src="/images/deciso-brand.svg" />
            <img alt="Deciso" class="hover-logo" src="/images/deciso-brand-hover.svg" />
        </a>
    </footer>
</div>
