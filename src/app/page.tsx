'use client';

import {Loader2} from 'lucide-react';

import {AnonymousLoginSection} from '@/components/login/AnonymousLoginSection';
import {AuthorizedClientDetails} from '@/components/login/AuthorizedClientDetails';
import {PasswordLoginForm} from '@/components/login/PasswordLoginForm';
import {LogoutSection} from '@/components/login/LogoutSection';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {AppLayout} from '@/components/layout/AppLayout';
import {useCaptivePortalLogin} from '@/hooks/useCaptivePortalLogin';

export default function LoginPage() {
    const {
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
    } = useCaptivePortalLogin();

    return (
        <AppLayout>
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

                    {authorizedStatus ? (
                        <AuthorizedClientDetails status={authorizedStatus} translateString={translateString}/>
                    ) : null}
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
                            status={authorizedStatus}
                        />
                    )}
                </CardContent>
            </Card>
        </AppLayout>
    );
}
