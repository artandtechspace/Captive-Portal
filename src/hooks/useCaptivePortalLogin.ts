'use client';

import {useCallback, useEffect, useMemo, useState} from 'react';
import {useForm, type UseFormReturn} from 'react-hook-form';

import type {LoginFormValues} from '@/components/login/PasswordLoginForm';
import {useToast} from '@/components/ui/use-toast';
import {
    CaptivePortalClient,
    ClientState,
    type AuthorizedClientStatusResponse,
    type ClientStatusResponse,
    type LogonRequest,
} from '@/lib/api';
import {useTranslations} from '@/lib/i18n';

const client = new CaptivePortalClient();

function isAuthorizedStatus(
    status: ClientStatusResponse | null,
): status is AuthorizedClientStatusResponse {
    return !!status && status.clientState === ClientState.AUTHORIZED;
}

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

type UseCaptivePortalLoginResult = {
    state: LoginState;
    busy: boolean;
    form: UseFormReturn<LoginFormValues>;
    translateString: (key: string, fallback: string) => string;
    termsAgreement: TermsAgreement;
    headerContent: HeaderContent;
    showPassword: boolean;
    showAnonymous: boolean;
    showLogout: boolean;
    authorizedStatus: AuthorizedClientStatusResponse | null;
    login: (values: LoginFormValues) => Promise<void>;
    loginAnonymous: () => Promise<void>;
    logout: () => Promise<void>;
};

export function useCaptivePortalLogin(): UseCaptivePortalLoginResult {
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
    const [clientStatus, setClientStatus] = useState<ClientStatusResponse | null>(null);
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
            setClientStatus(res.data);
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
            setClientStatus(null);
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
                setClientStatus(res.data);
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
            setClientStatus(res.data);
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
            setClientStatus(null);
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
    const authorizedStatus: AuthorizedClientStatusResponse | null = isAuthorizedStatus(clientStatus)
        ? clientStatus
        : null;

    return {
        state,
        busy,
        form,
        translateString,
        termsAgreement,
        headerContent,
        showPassword,
        showAnonymous,
        showLogout,
        authorizedStatus,
        login,
        loginAnonymous,
        logout,
    };
}
