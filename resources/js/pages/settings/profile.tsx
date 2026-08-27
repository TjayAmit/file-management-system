import { Form, Head, Link, usePage } from '@inertiajs/react';
import { MailWarning, Save, User } from 'lucide-react';
import ProfileController from '@/actions/App/Http/Controllers/Settings/ProfileController';
import Callout from '@/components/callout';
import DeleteUser from '@/components/delete-user';
import FormField from '@/components/form-field';
import {
    SectionCard,
    SectionCardBody,
    SectionCardHeader,
} from '@/components/section-card';
import StatusBadge from '@/components/status-badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { edit } from '@/routes/profile';
import { send } from '@/routes/verification';
import type { Auth } from '@/types';

type PageProps = {
    auth: Auth;
};

export default function Profile({
    mustVerifyEmail,
    status,
}: {
    mustVerifyEmail: boolean;
    status?: string;
}) {
    const { auth } = usePage<PageProps>().props;

    return (
        <>
            <Head title="Profile Settings" />

            <h1 className="sr-only">Profile Settings</h1>

            <SectionCard>
                <SectionCardHeader
                    title="Profile information"
                    description="The name and address other staff see against your entries in the audit log."
                    icon={User}
                    actions={
                        <StatusBadge tone="primary" className="capitalize">
                            {auth.user.role}
                        </StatusBadge>
                    }
                />

                <SectionCardBody>
                    <Form
                        {...ProfileController.update.form()}
                        options={{ preserveScroll: true }}
                        className="grid max-w-xl gap-5"
                    >
                        {({ processing, errors }) => (
                            <>
                                <FormField
                                    label="Full name"
                                    error={errors.name}
                                    required
                                >
                                    {({ id, describedBy, invalid }) => (
                                        <Input
                                            id={id}
                                            name="name"
                                            required
                                            autoComplete="name"
                                            defaultValue={auth.user.name}
                                            aria-describedby={describedBy}
                                            aria-invalid={invalid}
                                            className="bg-card"
                                        />
                                    )}
                                </FormField>

                                <FormField
                                    label="Email address"
                                    error={errors.email}
                                    required
                                >
                                    {({ id, describedBy, invalid }) => (
                                        <Input
                                            id={id}
                                            name="email"
                                            type="email"
                                            required
                                            autoComplete="username"
                                            defaultValue={auth.user.email}
                                            aria-describedby={describedBy}
                                            aria-invalid={invalid}
                                            className="bg-card"
                                        />
                                    )}
                                </FormField>

                                {mustVerifyEmail &&
                                    auth.user.email_verified_at === null && (
                                        <Callout
                                            tone="warning"
                                            icon={MailWarning}
                                            title="Your email address is unverified"
                                        >
                                            <Link
                                                href={send()}
                                                as="button"
                                                className="font-medium text-foreground underline underline-offset-4 transition-colors hover:text-primary"
                                            >
                                                Resend the verification email
                                            </Link>
                                            {status ===
                                                'verification-link-sent' && (
                                                <span className="mt-2 block font-medium text-success">
                                                    A new verification link has
                                                    been sent.
                                                </span>
                                            )}
                                        </Callout>
                                    )}

                                <Button
                                    type="submit"
                                    pending={processing}
                                    data-test="update-profile-button"
                                    className="justify-self-start"
                                >
                                    {!processing && (
                                        <Save className="size-3.5" />
                                    )}
                                    Save profile changes
                                </Button>
                            </>
                        )}
                    </Form>
                </SectionCardBody>
            </SectionCard>

            <DeleteUser />
        </>
    );
}

Profile.layout = {
    breadcrumbs: [{ title: 'Profile Settings', href: edit() }],
};
