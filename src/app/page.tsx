'use client';

import {Loader2} from 'lucide-react';
import {useCallback, useEffect, useMemo, useState} from 'react';
import {useForm} from 'react-hook-form';

import {AnonymousLoginSection} from '@/components/login/AnonymousLoginSection';
import {LoginFormValues, PasswordLoginForm} from '@/components/login/PasswordLoginForm';
import {LogoutSection} from '@/components/login/LogoutSection';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {useToast} from '@/components/ui/use-toast';
import {CaptivePortalClient, ClientState, type LogonRequest} from '@/lib/api';
import {useTranslations} from '@/lib/i18n';

const client = new CaptivePortalClient();

type LoginState = 'checking' | 'password' | 'anonymous' | 'authorized';

type ApiResponse<T> = { status: number; ok: boolean; data: T | null };

type TermsAgreement = {
    prefix?: string;
    linkText?: string;
    suffix?: string;
};

type HeaderContent = {
    title: string;
    description?: string;
};

export default function LoginPage() {
    const [searchParams, setSearchParams] = useState<URLSearchParams>(() => {
        if (typeof window !== 'undefined') {
            return new URLSearchParams(window.location.search);
        }
        return new URLSearchParams();
    });
    const {t} = useTranslations();
    const {toast} = useToast();

    const [zoneId, setZoneId] = useState('');
    const [state, setState] = useState<LoginState>('checking');
    const [busy, setBusy] = useState(false);

    const form = useForm<LoginFormValues>({
        defaultValues: {
            username: '',
            password: '',
            terms: false,
        },
    });

    const translateString = useCallback(
        (key: string, fallback: string) => {
            const value = t(key);
            return typeof value === 'string' ? value : fallback;
        },
        [t],
    );

    const toastError = useCallback(
        (error: unknown, fallbackKey: string, fallbackMessage: string) => {
            const message =
                error instanceof Error && error.message
                    ? error.message
                    : translateString(fallbackKey, fallbackMessage);
            toast({
                title: message,
                className: 'border-destructive bg-destructive text-destructive-foreground',
            });
        },
        [toast, translateString],
    );

    const getRedirectTarget = useCallback((): URL | null => {
        const raw = searchParams.get('redirurl');
        if (!raw) return null;
        try {
            const url = /^https?:\/\//i.test(raw) ? new URL(raw) : new URL(`https://${raw}`);
            return url;
        } catch {
            return null;
        }
    }, [searchParams]);

    const redirect = useCallback(
        (preferHttps = true) => {
            const target = getRedirectTarget();
            if (target) {
                if (preferHttps && target.protocol === 'http:') {
                    target.protocol = 'https:';
                }
                target.searchParams.set('refresh', '');
                window.location.href = target.toString();
            } else {
                window.location.reload();
            }
        },
        [getRedirectTarget],
    );

    const withZone = useCallback(
        async <T, >(exec: (zid: string) => Promise<ApiResponse<T>>): Promise<ApiResponse<T>> => {
            const candidates = zoneId ? [zoneId, ''] : [''];
            let lastError: unknown = null;
            for (let i = 0; i < candidates.length; i += 1) {
                try {
                    const res = await exec(candidates[i]);
                    if (res.status === 404 && i < candidates.length - 1) {
                        continue;
                    }
                    return res;
                } catch (error) {
                    lastError = error;
                    if (i < candidates.length - 1) {
                        continue;
                    }
                }
            }
            throw (lastError as Error) ?? new Error(translateString('errors.serverUnavailable', 'Server unavailable.'));
        },
        [translateString, zoneId],
    );

    const checkStatus = useCallback(async () => {
        setState('checking');
        try {
            const res = await withZone((z) => client.getClientStatus(z));
            if (!res.ok || !res.data) {
                throw new Error(translateString('errors.serverUnavailable', 'Server unavailable.'));
            }
            const {clientState} = res.data;
            const authType = (res.data as { authType?: string }).authType;
            if (clientState === ClientState.AUTHORIZED) {
                setState('authorized');
            } else if (clientState === ClientState.NOT_AUTHORIZED && authType === 'none') {
                setState('anonymous');
            } else {
                setState('password');
            }
        } catch (error) {
            toastError(error, 'errors.serverUnavailable', 'Server unavailable.');
            setState('password');
        }
    }, [toastError, translateString, withZone]);

    const login = useCallback(
        async (values: LoginFormValues) => {
            if (busy) return;

            const trimmedUsername = values.username.trim();
            const trimmedPassword = values.password.trim();
            let hasError = false;

            if (!trimmedUsername) {
                form.setError('username', {
                    type: 'manual',
                    message: translateString('errors.usernameRequired', 'Username is required.'),
                });
                hasError = true;
            }

            if (!trimmedPassword) {
                form.setError('password', {
                    type: 'manual',
                    message: translateString('errors.passwordRequired', 'Password is required.'),
                });
                hasError = true;
            }

            if (!values.terms) {
                form.setError('terms', {
                    type: 'manual',
                    message: translateString(
                        'errors.termsAcceptanceRequired',
                        'You must accept the terms of use before continuing.',
                    ),
                });
                hasError = true;
            }

            if (hasError) {
                return;
            }

            setBusy(true);
            form.clearErrors();
            try {
                const credentials: LogonRequest = {
                    user: trimmedUsername,
                    password: trimmedPassword,
                };
                const res = await withZone((z) => client.logon(z, credentials));
                if (!res.ok || !res.data) {
                    throw new Error(translateString('errors.serverUnavailable', 'Server unavailable.'));
                }
                if (res.data.clientState === ClientState.AUTHORIZED) {
                    redirect(true);
                } else {
                    form.setError('password', {
                        type: 'manual',
                        message: translateString('errors.authenticationFailed', 'Authentication failed.'),
                    });
                    form.setError('root', {
                        type: 'manual',
                        message: translateString(
                            'errors.authenticationInline',
                            'Please check your credentials and try again.',
                        ),
                    });
                }
            } catch (error) {
                toastError(error, 'errors.serverUnavailable', 'Server unavailable.');
            } finally {
                setBusy(false);
            }
        },
        [busy, form, redirect, toastError, translateString, withZone],
    );

    const loginAnonymous = useCallback(async () => {
        if (busy) return;
        setBusy(true);
        try {
            const res = await withZone((z) => client.logon(z, {user: '', password: ''}));
            if (!res.ok || !res.data) {
                throw new Error(translateString('errors.serverUnavailable', 'Server unavailable.'));
            }
            if (res.data.clientState === ClientState.AUTHORIZED) {
                redirect(false);
            } else {
                toast({
                    title: translateString('errors.anonymousFailed', 'Anonymous login failed.'),
                    className: 'border-destructive bg-destructive text-destructive-foreground',
                });
            }
        } catch (error) {
            toastError(error, 'errors.serverUnavailable', 'Server unavailable.');
        } finally {
            setBusy(false);
        }
    }, [busy, redirect, toast, toastError, translateString, withZone]);

    const logout = useCallback(async () => {
        if (busy) return;
        setBusy(true);
        try {
            const res = await withZone((z) => client.logoff(z));
            if (!res.ok) {
                throw new Error(translateString('errors.serverUnavailable', 'Server unavailable.'));
            }
            window.location.reload();
        } catch (error) {
            toastError(error, 'errors.serverUnavailable', 'Server unavailable.');
        } finally {
            setBusy(false);
        }
    }, [busy, toastError, translateString, withZone]);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            setSearchParams(new URLSearchParams(window.location.search));
        }
        if (typeof window !== 'undefined') {
            const globalZoneId = (window as Window & { zoneid?: string }).zoneid;
            setZoneId(typeof globalZoneId === 'string' ? globalZoneId : '');
        }
        void checkStatus();
    }, [checkStatus]);

    useEffect(() => {
        const pageTitle = translateString('pageTitle', 'WiFi Login');
        document.title = pageTitle;
        const description = translateString(
            'metaDescription',
            'Sign in to the ATS WiFi portal for secure internet access.',
        );
        const meta = document.querySelector('meta[name="description"]');
        if (meta) {
            meta.setAttribute('content', description);
        }
    }, [translateString]);

    const termsAgreement = useMemo(() => (t('termsAgreement') as TermsAgreement | undefined) ?? {}, [t]);
    const headerContent = useMemo<HeaderContent>(
        () => {
            switch (state) {
                case 'checking':
                    return {
                        title: translateString('headerTitleChecking', 'Checking your connection...'),
                        description: translateString(
                            'headerDescriptionChecking',
                            'Please wait while we verify the current network status of this device.',
                        ),
                    };
                case 'anonymous':
                    return {
                        title: translateString('headerTitleAnonymous', 'Guest access available'),
                        description: translateString(
                            'headerDescriptionAnonymous',
                            'You can continue with temporary access or sign in with your personal credentials below.',
                        ),
                    };
                case 'authorized':
                    return {
                        title: translateString('headerTitleAuthorized', 'You are connected to the ATS Network'),
                        description: translateString(
                            'headerDescriptionAuthorized',
                            'This device already has internet access. You can close this window or sign out below if you are finished.',
                        ),
                    };
                default:
                    return {
                        title: translateString('headerTitle', 'Welcome to the ATS Network'),
                        description: translateString(
                            'headerDescription',
                            'By using this network you agree to comply with the following terms of use. If you do not agree, you may not use the network.',
                        ),
                    };
            }
        },
        [state, translateString],
    );
    const showPassword = state === 'password';
    const showAnonymous = state === 'anonymous';
    const showLogout = state === 'authorized';

    return (
        <Card className="border border-border/80 bg-background/95 shadow-xl">
            <CardHeader className="space-y-3">
                <CardTitle className="text-2xl font-semibold  text-center">{headerContent.title}</CardTitle>
                {headerContent.description ? (
                    <CardDescription className="text-justify text-sm text-muted-foreground">
                        {headerContent.description}
                    </CardDescription>
                ) : null}
            </CardHeader>
            <CardContent className="space-y-6">
                {state === 'checking' && (
                    <div className="flex items-center justify-center py-8 text-muted-foreground">
                        <Loader2 className="h-6 w-6 animate-spin" aria-label="Loading"/>
                    </div>
                )}

                {showPassword && (
                    <PasswordLoginForm
                        form={form}
                        busy={busy}
                        translateString={translateString}
                        termsAgreement={termsAgreement}
                        onSubmit={login}
                    />
                )}

                {showAnonymous && (
                    <AnonymousLoginSection
                        description={translateString(
                            'anonymousDescription',
                            'Anonymous access is available for short-term guests when no personal credentials are provided.',
                        )}
                        buttonLabel={translateString('anonymousButton', 'Sign in anonymously')}
                        busy={busy}
                        onLogin={loginAnonymous}
                    />
                )}

                {showLogout && (
                    <LogoutSection
                        busy={busy}
                        triggerLabel={translateString('logoutButton', 'Sign out')}
                        confirmTitle={translateString('logoutConfirmTitle', 'Sign out from the network?')}
                        confirmDescription={translateString(
                            'logoutConfirmDescription',
                            'This will end your current session and disconnect you from the ATS network.',
                        )}
                        confirmText={translateString('logoutConfirmButton', 'Sign out')}
                        cancelText={translateString('logoutCancelButton', 'Stay connected')}
                        onConfirm={logout}
                    />
                )}
            </CardContent>
        </Card>
    );
}
