import Link from "next/link";
import {Loader2} from "lucide-react";
import {UseFormReturn} from "react-hook-form";
import {Button} from "@/components/ui/button";
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {Input} from "@/components/ui/input";
import {PasswordInput} from "@/components/forms/PasswordInput";
import {FormCheckboxField} from "@/components/forms/FormCheckboxField";

export type LoginFormValues = {
    username: string;
    password: string;
    terms: boolean;
};

type TermsAgreement = {
    prefix?: string;
    linkText?: string;
    suffix?: string;
};

type PasswordLoginFormProps = {
    form: UseFormReturn<LoginFormValues>;
    busy: boolean;
    translateString: (key: string, fallback: string) => string;
    termsAgreement: TermsAgreement;
    onSubmit: (values: LoginFormValues) => Promise<void> | void;
};

export function PasswordLoginForm({form, busy, translateString, termsAgreement, onSubmit}: PasswordLoginFormProps) {
    const username = form.watch("username");
    const password = form.watch("password");
    const termsAccepted = form.watch("terms");
    const canSubmit = Boolean(termsAccepted && username.trim() && password.trim());
    const rootError = form.formState.errors.root?.message;

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
                        <FormItem className="space-y-2">
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
                                    disabled={busy}
                                    className="focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                                    {...field}
                                    onChange={(event) => {
                                        field.onChange(event);
                                        if (form.formState.errors.username) {
                                            form.clearErrors('username');
                                            form.clearErrors('root');
                                        }
                                    }}
                                />
                            </FormControl>
                            <FormMessage/>
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="password"
                    render={({field}) => (
                        <FormItem className="space-y-2">
                            <FormLabel htmlFor="password">
                                {translateString('passwordLabel', 'Password')}
                            </FormLabel>
                            <FormControl>
                                <PasswordInput
                                    id="password"
                                    autoComplete="current-password"
                                    disabled={busy}
                                    className="focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                                    {...field}
                                    onChange={(event) => {
                                        field.onChange(event);
                                        if (form.formState.errors.password) {
                                            form.clearErrors('password');
                                            form.clearErrors('root');
                                        }
                                    }}
                                />
                            </FormControl>
                            <FormMessage/>
                        </FormItem>
                    )}
                />

                <FormCheckboxField
                    control={form.control}
                    name="terms"
                    label={translateString('termsLabel', 'Terms of Use')}
                    onCheckedChange={() => {
                        if (form.formState.errors.terms) {
                            form.clearErrors('terms');
                            form.clearErrors('root');
                        }
                    }}
                    isDanger={Boolean(form.formState.errors.terms)}
                >
                    <span className="text-sm text-muted-foreground">
                        {termsAgreement.prefix ?? ''}{' '}
                        <Link
                            className="font-medium text-primary underline"
                            href="/terms"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            {termsAgreement.linkText ?? translateString('termsLinkLabel', 'Terms of Use')}
                        </Link>{' '}
                        {termsAgreement.suffix ?? ''}
                    </span>
                </FormCheckboxField>

                {rootError && (
                    <p className="text-sm font-medium text-destructive" role="alert">
                        {rootError}
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
        </Form>
    );
}
