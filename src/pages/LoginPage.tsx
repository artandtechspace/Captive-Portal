import {useCallback, useEffect, useMemo, useState} from 'react';
import {useLocation} from 'react-router-dom';
import {Loader2} from 'lucide-react';
import {useTranslations} from "@/lib/i18n";
import {useToast} from "@/components/ui/use-toast";
import {CaptivePortalClient, ClientState, LogonRequest} from "@/lib/api";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {useForm} from "react-hook-form";
import {
    LoginFormValues,
    PasswordLoginForm,
    TermsAgreement
} from "@/components/login/password-login-form";
import {LoginBusyOverlay} from "@/components/login/login-busy-overlay";
import {LoginBrandingHeader} from "@/components/login/login-branding-header";
import {ConfirmDialog} from "@/components/ui/confirm-dialog";

const client = new CaptivePortalClient();

type LoginState = 'checking' | 'password' | 'anonymous' | 'authorized';

type ApiResponse<T> = { status: number; ok: boolean; data: T | null };

type Logos = {
    atsAlt?: string;
    opnsenseAlt?: string;
};

export const LoginPage = () => {
    const location = useLocation();
    const searchParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
    const {t} = useTranslations();
    const {toast} = useToast();

    const form = useForm<LoginFormValues>({
        defaultValues: {
            username: '',
            password: '',
            terms: false
        }
    });
    const [zoneId, setZoneId] = useState('');
    const [state, setState] = useState<LoginState>('checking');
    const [busy, setBusy] = useState(false);
    const [generalError, setGeneralError] = useState<string | undefined>();

    const translateString = useCallback(
        (key: string, fallback: string) => {
            const value = t(key);
            return typeof value === 'string' ? value : fallback;
        },
        [t]
    );

    const toastError = useCallback(
        (error: unknown, fallbackKey: string, fallbackMessage: string) => {
            const message =
                error instanceof Error && error.message
                    ? error.message
                    : translateString(fallbackKey, fallbackMessage);
            toast({
                title: message,
                className: 'border-destructive bg-destructive text-destructive-foreground'
            });
        },
        [toast, translateString]
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
        [getRedirectTarget]
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
        [translateString, zoneId]
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
        async ({username, password, terms}: LoginFormValues) => {
            if (busy) return;

            const trimmedUsername = username.trim();
            const trimmedPassword = password.trim();

            form.clearErrors();
            setGeneralError(undefined);

            let hasError = false;

            if (!trimmedUsername) {
                form.setError('username', {
                    type: 'manual',
                    message: translateString('errors.usernameRequired', 'Username is required.')
                });
                hasError = true;
            }

            if (!trimmedPassword) {
                form.setError('password', {
                    type: 'manual',
                    message: translateString('errors.passwordRequired', 'Password is required.')
                });
                hasError = true;
            }

            if (!terms) {
                form.setError('terms', {
                    type: 'manual',
                    message: translateString(
                        'errors.termsAcceptanceRequired',
                        'You must accept the terms of use before continuing.'
                    )
                });
                hasError = true;
            }

            if (hasError) {
                return;
            }

            setBusy(true);
            try {
                const credentials: LogonRequest = {
                    user: trimmedUsername,
                    password: trimmedPassword
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
                        message: translateString('errors.authenticationFailed', 'Authentication failed.')
                    });
                    setGeneralError(
                        translateString(
                            'errors.authenticationInline',
                            'Please check your credentials and try again.'
                        )
                    );
                }
            } catch (error) {
                toastError(error, 'errors.serverUnavailable', 'Server unavailable.');
            } finally {
                setBusy(false);
            }
        },
        [busy, form, redirect, toastError, translateString, withZone]
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
                    className: 'border-destructive bg-destructive text-destructive-foreground'
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
            const globalZoneId = (window as Window & { zoneid?: string }).zoneid;
            setZoneId(typeof globalZoneId === 'string' ? globalZoneId : '');
        }
        void checkStatus();
    }, [checkStatus]);

    useEffect(() => {
        const pageTitle = translateString('pageTitle', 'WiFi Login');
        document.title = pageTitle;
        const description = translateString('metaDescription', 'Sign in to the ATS WiFi portal for secure internet access.');
        const meta = document.querySelector('meta[name="description"]');
        if (meta) {
            meta.setAttribute('content', description);
        }
    }, [translateString]);

    const handleFormInteraction = useCallback(() => {
        form.clearErrors();
        setGeneralError(undefined);
    }, [form, setGeneralError]);

    const termsAgreement = (t('termsAgreement') as TermsAgreement) ?? {};
    const logos = (t('logos') as Logos) ?? {};
    const showPassword = state === 'password';
    const showAnonymous = state === 'anonymous';
    const showLogout = state === 'authorized';

    return (
        <div className="relative flex min-h-screen flex-col" aria-busy={busy}>
            <LoginBusyOverlay
                busy={busy}
                message={translateString('loadingMessage', 'Processing your request...')}
            />
            <LoginBrandingHeader atsAlt={logos.atsAlt} opnsenseAlt={logos.opnsenseAlt}/>

            <main className="flex grow items-center justify-center px-4 py-10">
                <Card className="w-full max-w-lg border border-white/40 bg-white/90 backdrop-blur shadow-xl">
                    <CardHeader>
                        <CardTitle>{translateString('headerTitle', 'Welcome to the ATS Network')}</CardTitle>
                        <CardDescription className="text-justify text-base text-muted-foreground">
                            {translateString(
                                'headerDescription',
                                'By using this network you agree to comply with the following terms of use. If you do not agree, you may not use the network.'
                            )}
                        </CardDescription>
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
                                onSubmit={login}
                                isBusy={busy}
                                translateString={translateString}
                                termsAgreement={termsAgreement}
                                onFieldInteraction={handleFormInteraction}
                                generalError={generalError}
                            />
                        )}

                        {showAnonymous && (
                            <Button
                                className="w-full focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                                onClick={() => {
                                    handleFormInteraction();
                                    void loginAnonymous();
                                }}
                                disabled={busy}
                            >
                                {busy ? (
                                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden/>
                                ) : (
                                    translateString('anonymousButton', 'Sign in anonymously')
                                )}
                            </Button>
                        )}

                        {showLogout && (
                            <ConfirmDialog
                                danger
                                title={translateString('logoutConfirmTitle', 'Sign out from the ATS Network?')}
                                description={translateString(
                                    'logoutConfirmDescription',
                                    'You will need to sign in again to regain access.'
                                )}
                                confirmText={translateString('logoutButton', 'Sign out')}
                                cancelText={translateString('logoutCancelButton', 'Stay signed in')}
                                onConfirmAction={() => {
                                    handleFormInteraction();
                                    void logout();
                                }}
                            >
                                <Button
                                    type="button"
                                    className="w-full focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                                    disabled={busy}
                                >
                                    {busy ? (
                                        <Loader2 className="h-4 w-4 animate-spin" aria-hidden/>
                                    ) : (
                                        translateString('logoutButton', 'Sign out')
                                    )}
                                </Button>
                            </ConfirmDialog>
                        )}
                    </CardContent>
                </Card>
            </main>

            <footer className="pointer-events-none fixed bottom-4 right-4">
                <a
                    aria-label="Deciso"
                    className="pointer-events-auto block group"
                    href="https://www.deciso.com"
                    rel="noopener noreferrer"
                    target="_blank"
                >
                    <img alt="Deciso" className="hidden w-96 group-hover:block" src="/src/assets/images/deciso-brand-hover.svg"/>
                    <img alt="Deciso" className="block w-96 group-hover:hidden" src="/src/assets/images/deciso-brand.svg"/>
                </a>
            </footer>
        </div>
    );
};
