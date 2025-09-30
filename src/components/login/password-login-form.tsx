"use client";

import React from "react";
import {UseFormReturn} from "react-hook-form";
import {Link} from "react-router-dom";
import {Loader2} from "lucide-react";

import {Form, FormField, FormItem, FormLabel, FormControl, FormMessage} from "@/components/ui/form";
import {Input} from "@/components/ui/input";
import {PasswordInput} from "@/components/ui/password-input";
import {FormCheckboxField} from "@/components/form/form-checkbox-field";
import {Button} from "@/components/ui/button";

export type TermsAgreement = {
    prefix?: string;
    linkText?: string;
    suffix?: string;
};

export type LoginFormValues = {
    username: string;
    password: string;
    terms: boolean;
};

type PasswordLoginFormProps = {
    form: UseFormReturn<LoginFormValues>;
    onSubmit: (values: LoginFormValues) => void | Promise<void>;
    isBusy: boolean;
    translateString: (key: string, fallback: string) => string;
    termsAgreement: TermsAgreement;
    onFieldInteraction?: () => void;
    generalError?: string;
};

export function PasswordLoginForm({
                                       form,
                                       onSubmit,
                                       isBusy,
                                       translateString,
                                       termsAgreement,
                                       onFieldInteraction,
                                       generalError
                                   }: PasswordLoginFormProps) {
    const values = form.watch();
    const canSubmit = Boolean(values.terms && values.username.trim() && values.password.trim());
    const handleInteraction = React.useCallback(() => {
        onFieldInteraction?.();
    }, [onFieldInteraction]);

    return (
        <Form {...form}>
            <form className="space-y-5" onSubmit={form.handleSubmit(onSubmit)} autoComplete="off" noValidate>
                <div className="space-y-2">
                    <h3 className="text-lg font-semibold">
                        {translateString('loginFormTitle', 'Sign in to the ATS Network')}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                        {translateString('loginFormDescription', 'Enter your username and password to sign in:')}
                    </p>
                </div>

                <FormField
                    control={form.control}
                    name="username"
                    render={({field}) => (
                        <FormItem>
                            <FormLabel htmlFor="username">
                                {translateString('usernameLabel', 'Username')}
                            </FormLabel>
                            <FormControl>
                                <Input
                                    id="username"
                                    type="text"
                                    autoCapitalize="none"
                                    autoCorrect="off"
                                    inputMode="email"
                                    disabled={isBusy}
                                    {...field}
                                    onChange={(event) => {
                                        field.onChange(event);
                                        handleInteraction();
                                    }}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="password"
                    render={({field}) => (
                        <FormItem>
                            <FormLabel htmlFor="password">
                                {translateString('passwordLabel', 'Password')}
                            </FormLabel>
                            <FormControl>
                                <PasswordInput
                                    id="password"
                                    autoComplete="current-password"
                                    disabled={isBusy}
                                    {...field}
                                    onChange={(event) => {
                                        field.onChange(event);
                                        handleInteraction();
                                    }}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormCheckboxField
                    control={form.control}
                    name="terms"
                    label={translateString('termsCheckboxLabel', 'Terms of Use agreement')}
                    disabled={isBusy}
                    isDanger={Boolean(form.formState.errors.terms)}
                    onChange={handleInteraction}
                >
                    <span className="text-sm font-normal leading-6 text-muted-foreground">
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
                    </span>
                </FormCheckboxField>

                {generalError && (
                    <p className="text-sm font-medium text-destructive" role="alert">
                        {generalError}
                    </p>
                )}

                <Button
                    type="submit"
                    className="w-full focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                    disabled={!canSubmit || isBusy}
                >
                    {isBusy ? (
                        <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                    ) : (
                        translateString('loginButton', 'Sign in')
                    )}
                </Button>
            </form>
        </Form>
    );
}
