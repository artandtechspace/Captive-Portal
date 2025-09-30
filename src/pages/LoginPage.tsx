import {FormEvent, useCallback, useEffect, useMemo, useState} from 'react';
import {Link, useLocation} from 'react-router-dom';
import {Eye, EyeOff, Loader2} from 'lucide-react';
import {useTranslations} from "@/lib/i18n";
import {useToast} from "@/components/ui/use-toast";
import {CaptivePortalClient, ClientState, LogonRequest} from "@/lib/api";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {Label} from "@/components/ui/label";
import {Input} from "@/components/ui/input";
import {Checkbox} from "@/components/ui/checkbox";
import {Button} from "@/components/ui/button";

const client = new CaptivePortalClient();

type LoginState = 'checking' | 'password' | 'anonymous' | 'authorized';

type ApiResponse<T> = { status: number; ok: boolean; data: T | null };

type FieldErrors = {
    username?: string;
    password?: string;
    terms?: string;
    general?: string;
};

type TermsAgreement = {
    prefix?: string;
    linkText?: string;
    suffix?: string;
};

type Logos = {
    atsAlt?: string;
    opnsenseAlt?: string;
};

export const LoginPage = () => {
    const location = useLocation();
    const searchParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
    const {t, language, setLanguage, languageOptions} = useTranslations();
    const {toast} = useToast();

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [termsAccepted, setTermsAccepted] = useState(false);
    const [zoneId, setZoneId] = useState('');
    const [state, setState] = useState<LoginState>('checking');
    const [busy, setBusy] = useState(false);
    const [errors, setErrors] = useState<FieldErrors>({});
    const [passwordVisible, setPasswordVisible] = useState(false);

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
        async (event: FormEvent<HTMLFormElement>) => {
            event.preventDefault();
            if (busy) return;

            const trimmedUsername = username.trim();
            const trimmedPassword = password.trim();
            const validationErrors: FieldErrors = {};

            if (!trimmedUsername) {
                validationErrors.username = translateString('errors.usernameRequired', 'Username is required.');
            }

            if (!trimmedPassword) {
                validationErrors.password = translateString('errors.passwordRequired', 'Password is required.');
            }

            if (!termsAccepted) {
                validationErrors.terms = translateString(
                    'errors.termsAcceptanceRequired',
                    'You must accept the terms of use before continuing.'
                );
            }

            if (Object.keys(validationErrors).length > 0) {
                setErrors(validationErrors);
                return;
            }

            setBusy(true);
            setErrors({});
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
                    setErrors({
                        password: translateString('errors.authenticationFailed', 'Authentication failed.'),
                        general: translateString(
                            'errors.authenticationInline',
                            'Please check your credentials and try again.'
                        )
                    });
                }
            } catch (error) {
                toastError(error, 'errors.serverUnavailable', 'Server unavailable.');
            } finally {
                setBusy(false);
            }
        },
        [busy, password, redirect, toast, toastError, translateString, username, withZone]
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

    const termsAgreement = (t('termsAgreement') as TermsAgreement) ?? {};
    const logos = (t('logos') as Logos) ?? {};
    const canSubmit = Boolean(termsAccepted && username.trim() && password.trim());
    const showPassword = state === 'password';
    const showAnonymous = state === 'anonymous';
    const showLogout = state === 'authorized';

    return (
        <div className="relative flex min-h-screen flex-col" aria-busy={busy}>
            {busy && (
                <div
                    aria-live="polite"
                    className="fixed inset-0 z-50 flex items-center justify-center bg-background/70 backdrop-blur-sm"
                    role="status"
                >
                    <div className="flex items-center gap-3 rounded-lg bg-white/90 px-6 py-4 shadow-xl">
                        <Loader2 aria-hidden className="h-5 w-5 animate-spin text-primary"/>
                        <span className="text-sm font-medium text-muted-foreground">
                            {translateString('loadingMessage', 'Processing your request...')}
                        </span>
                    </div>
                </div>
            )}
            <header className="sticky top-0 z-10 bg-white/80 backdrop-blur">
                <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
                    <div className="flex items-center gap-6">
                        <img alt={logos.atsAlt ?? 'ATS'} className="w-24" src="/src/assets/images/ats-logo.png"/>
                        <a
                            aria-label={logos.opnsenseAlt ?? 'OPNsense'}
                            href="https://opnsense.org/"
                            rel="noopener noreferrer"
                            target="_blank"
                        >
                            <img alt={logos.opnsenseAlt ?? 'OPNsense'} className="w-32" src="/src/assets/images/opnsense.png"/>
                        </a>
                    </div>
                    <div className="flex items-center gap-2">
                        <Label className="text-sm font-medium text-muted-foreground" htmlFor="languageSwitcher">
                            {translateString('languageLabel', 'Language')}
                        </Label>
                        <select
                            id="languageSwitcher"
                            className="rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                            value={language}
                            onChange={(event) => {
                                setLanguage(event.target.value);
                            }}
                            disabled={busy}
                        >
                            {languageOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </header>

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
                            <form className="space-y-5" onSubmit={login} autoComplete="off" noValidate>
                                <div className="space-y-2">
                                    <h3 className="text-lg font-semibold">
                                        {translateString('loginFormTitle', 'Sign in to the ATS Network')}
                                    </h3>
                                    <p className="text-sm text-muted-foreground">
                                        {translateString('loginFormDescription', 'Enter your username and password to sign in:')}
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="username">{translateString('usernameLabel', 'Username')}</Label>
                                    <Input
                                        id="username"
                                        type="text"
                                        value={username}
                                        onChange={(event) => {
                                            setUsername(event.target.value);
                                            setErrors((prev) => ({...prev, username: undefined, general: undefined}));
                                        }}
                                        required
                                        autoCapitalize="none"
                                        autoCorrect="off"
                                        inputMode="email"
                                        disabled={busy}
                                        aria-invalid={Boolean(errors.username)}
                                        className="focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                                    />
                                    {errors.username && (
                                        <p className="text-sm text-destructive" role="alert">
                                            {errors.username}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="password">{translateString('passwordLabel', 'Password')}</Label>
                                    <div className="relative">
                                        <Input
                                            id="password"
                                            type={passwordVisible ? 'text' : 'password'}
                                            value={password}
                                            onChange={(event) => {
                                                setPassword(event.target.value);
                                                setErrors((prev) => ({...prev, password: undefined, general: undefined}));
                                            }}
                                            required
                                            autoComplete="current-password"
                                            disabled={busy}
                                            aria-invalid={Boolean(errors.password)}
                                            className="pr-12 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setPasswordVisible((prev) => !prev);
                                            }}
                                            className="absolute inset-y-0 right-2 flex items-center rounded-md px-2 text-muted-foreground transition hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                                            aria-label={passwordVisible
                                                ? translateString('passwordHide', 'Hide password')
                                                : translateString('passwordShow', 'Show password')}
                                            aria-pressed={passwordVisible}
                                        >
                                            {passwordVisible ? (
                                                <EyeOff aria-hidden className="h-4 w-4"/>
                                            ) : (
                                                <Eye aria-hidden className="h-4 w-4"/>
                                            )}
                                        </button>
                                    </div>
                                    {errors.password && (
                                        <p className="text-sm text-destructive" role="alert">
                                            {errors.password}
                                        </p>
                                    )}
                                </div>

                                <div className="flex items-start gap-3 rounded-lg bg-muted/40 p-3">
                                    <Checkbox
                                        id="termsCheckbox"
                                        checked={termsAccepted}
                                        onCheckedChange={(checked) => {
                                            setTermsAccepted(Boolean(checked));
                                            setErrors((prev) => ({...prev, terms: undefined, general: undefined}));
                                        }}
                                        disabled={busy}
                                        required
                                        className="focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                                    />
                                    <Label htmlFor="termsCheckbox"
                                           className="text-sm font-normal leading-6 text-muted-foreground">
                                        {termsAgreement.prefix ?? ''}{' '}
                                        <Link
                                            className="font-medium text-primary underline"
                                            to="/terms"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            {termsAgreement.linkText ?? translateString('termsLinkLabel', 'Terms of Use')}
                                        </Link>{' '}
                                        {termsAgreement.suffix ?? ''}
                                    </Label>
                                </div>
                                {errors.terms && (
                                    <p className="text-sm text-destructive" role="alert">
                                        {errors.terms}
                                    </p>
                                )}

                                {errors.general && (
                                    <p className="text-sm font-medium text-destructive" role="alert">
                                        {errors.general}
                                    </p>
                                )}

                                <Button
                                    type="submit"
                                    className="w-full focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                                    disabled={!canSubmit || busy}
                                >
                                    {busy ? <Loader2 className="h-4 w-4 animate-spin"
                                                     aria-hidden/> : translateString('loginButton', 'Sign in')}
                                </Button>
                            </form>
                        )}

                        {showAnonymous && (
                            <div className="space-y-4">
                                <p className="text-sm text-muted-foreground">
                                    {translateString(
                                        'anonymousDescription',
                                        'Anonymous access is available for short-term guests when no personal credentials are provided.'
                                    )}
                                </p>
                                <Button
                                    className="w-full focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                                    onClick={loginAnonymous}
                                    disabled={busy}
                                >
                                    {busy ? <Loader2 className="h-4 w-4 animate-spin"
                                                     aria-hidden/> : translateString('anonymousButton', 'Sign in anonymously')}
                                </Button>
                            </div>
                        )}

                        {showLogout && (
                            <Button
                                className="w-full focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                                onClick={logout}
                                disabled={busy}
                            >
                                {busy ? <Loader2 className="h-4 w-4 animate-spin"
                                                 aria-hidden/> : translateString('logoutButton', 'Sign out')}
                            </Button>
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
