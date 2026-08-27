import { Form, Head } from '@inertiajs/react';
import { KeyRound } from 'lucide-react';
import { useRef } from 'react';
import SecurityController from '@/actions/App/Http/Controllers/Settings/SecurityController';
import FormField from '@/components/form-field';
import type { Props as ManagePasskeysProps } from '@/components/manage-passkeys';
import ManagePasskeys from '@/components/manage-passkeys';
import type { Props as ManageTwoFactorProps } from '@/components/manage-two-factor';
import ManageTwoFactor from '@/components/manage-two-factor';
import PasswordInput from '@/components/password-input';
import {
    SectionCard,
    SectionCardBody,
    SectionCardHeader,
} from '@/components/section-card';
import { Button } from '@/components/ui/button';
import { edit } from '@/routes/security';

type Props = {
    passwordRules: string;
} & ManagePasskeysProps &
    ManageTwoFactorProps;

export default function Security(props: Props) {
    const passwordInput = useRef<HTMLInputElement>(null);
    const currentPasswordInput = useRef<HTMLInputElement>(null);

    return (
        <>
            <Head title="Security Settings" />

            <h1 className="sr-only">Security Settings</h1>

            <SectionCard>
                <SectionCardHeader
                    title="Update password"
                    description="A long, unguessable password matters more here than a complicated one — this account can read every scan in the archive."
                    icon={KeyRound}
                />

                <SectionCardBody>
                    <Form
                        {...SecurityController.update.form()}
                        options={{ preserveScroll: true }}
                        resetOnError={[
                            'password',
                            'password_confirmation',
                            'current_password',
                        ]}
                        resetOnSuccess
                        onError={(errors) => {
                            if (errors.password) {
                                passwordInput.current?.focus();
                            }

                            if (errors.current_password) {
                                currentPasswordInput.current?.focus();
                            }
                        }}
                        className="grid max-w-xl gap-5"
                    >
                        {({ errors, processing }) => (
                            <>
                                <FormField
                                    label="Current password"
                                    error={errors.current_password}
                                    required
                                >
                                    {({ id, describedBy, invalid }) => (
                                        <PasswordInput
                                            id={id}
                                            ref={currentPasswordInput}
                                            name="current_password"
                                            autoComplete="current-password"
                                            placeholder="Current password"
                                            aria-describedby={describedBy}
                                            aria-invalid={invalid}
                                            className="block w-full bg-card"
                                        />
                                    )}
                                </FormField>

                                <FormField
                                    label="New password"
                                    error={errors.password}
                                    required
                                >
                                    {({ id, describedBy, invalid }) => (
                                        <PasswordInput
                                            id={id}
                                            ref={passwordInput}
                                            name="password"
                                            autoComplete="new-password"
                                            placeholder="New password"
                                            passwordrules={props.passwordRules}
                                            aria-describedby={describedBy}
                                            aria-invalid={invalid}
                                            className="block w-full bg-card"
                                        />
                                    )}
                                </FormField>

                                <FormField
                                    label="Confirm new password"
                                    error={errors.password_confirmation}
                                    required
                                >
                                    {({ id, describedBy, invalid }) => (
                                        <PasswordInput
                                            id={id}
                                            name="password_confirmation"
                                            autoComplete="new-password"
                                            placeholder="Confirm password"
                                            passwordrules={props.passwordRules}
                                            aria-describedby={describedBy}
                                            aria-invalid={invalid}
                                            className="block w-full bg-card"
                                        />
                                    )}
                                </FormField>

                                <Button
                                    type="submit"
                                    pending={processing}
                                    data-test="update-password-button"
                                    className="justify-self-start"
                                >
                                    {!processing && (
                                        <KeyRound className="size-3.5" />
                                    )}
                                    Update password
                                </Button>
                            </>
                        )}
                    </Form>
                </SectionCardBody>
            </SectionCard>

            <ManageTwoFactor
                canManageTwoFactor={props.canManageTwoFactor}
                requiresConfirmation={props.requiresConfirmation}
                twoFactorEnabled={props.twoFactorEnabled}
            />

            <ManagePasskeys
                canManagePasskeys={props.canManagePasskeys}
                passkeys={props.passkeys}
            />
        </>
    );
}

Security.layout = {
    breadcrumbs: [{ title: 'Security Settings', href: edit() }],
};
