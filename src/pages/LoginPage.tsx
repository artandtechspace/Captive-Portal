import {FormEvent, useCallback, useEffect, useMemo, useState} from 'react';
import {Link, useLocation} from 'react-router-dom';
import {Loader2} from 'lucide-react';
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
    const {t} = useTranslations();
    const {toast} = useToast();

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [termsAccepted, setTermsAccepted] = useState(false);
    const [zoneId, setZoneId] = useState('');
    const [state, setState] = useState<LoginState>('checking');
    const [busy, setBusy] = useState(false);

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
            setBusy(true);
            try {
                const credentials: LogonRequest = {
                    user: username.trim(),
                    password
                };
                const res = await withZone((z) => client.logon(z, credentials));
                if (!res.ok || !res.data) {
                    throw new Error(translateString('errors.serverUnavailable', 'Server unavailable.'));
                }
                if (res.data.clientState === ClientState.AUTHORIZED) {
                    redirect(true);
                } else {
                    setUsername('');
                    setPassword('');
                    toast({
                        title: translateString('errors.authenticationFailed', 'Authentication failed.'),
                        className: 'border-destructive bg-destructive text-destructive-foreground'
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
        <div className="flex min-h-screen flex-col">
            <header className="sticky top-0 z-10 bg-white/80 backdrop-blur">
                <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
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
                            <form className="space-y-5" onSubmit={login} autoComplete="off">
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
                                        onChange={(event) => setUsername(event.target.value)}
                                        required
                                        autoCapitalize="none"
                                        autoCorrect="off"
                                        inputMode="email"
                                        disabled={busy}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="password">{translateString('passwordLabel', 'Password')}</Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        value={password}
                                        onChange={(event) => setPassword(event.target.value)}
                                        required
                                        autoComplete="current-password"
                                        disabled={busy}
                                    />
                                </div>

                                <div className="flex items-start gap-3 rounded-lg bg-muted/40 p-3">
                                    <Checkbox
                                        id="termsCheckbox"
                                        checked={termsAccepted}
                                        onCheckedChange={(checked) => setTermsAccepted(Boolean(checked))}
                                        disabled={busy}
                                        required
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

                                <Button type="submit" className="w-full" disabled={!canSubmit || busy}>
                                    {busy ? <Loader2 className="h-4 w-4 animate-spin"
                                                     aria-hidden/> : translateString('loginButton', 'Sign in')}
                                </Button>
                            </form>
                        )}

                        {showAnonymous && (
                            <Button className="w-full" onClick={loginAnonymous} disabled={busy}>
                                {busy ? <Loader2 className="h-4 w-4 animate-spin"
                                                 aria-hidden/> : translateString('anonymousButton', 'Sign in anonymously')}
                            </Button>
                        )}

                        {showLogout && (
                            <Button className="w-full" onClick={logout} disabled={busy}>
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
