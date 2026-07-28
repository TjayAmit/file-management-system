import { Head } from '@inertiajs/react';
import TextLink from '@/components/text-link';
import { login } from '@/routes';

export default function Register() {
    return (
        <>
            <Head title="Registration Disabled" />
            <div className="flex flex-col gap-6 text-center">
                <h1 className="text-xl font-bold">
                    Public Registration Disabled
                </h1>
                <p className="text-sm text-muted-foreground">
                    Self-registration is disabled. Account creation is managed
                    by an administrator.
                </p>
                <div className="text-sm text-muted-foreground">
                    <TextLink href={login()}>Return to Log in</TextLink>
                </div>
            </div>
        </>
    );
}

Register.layout = {
    title: 'Registration Disabled',
    description: 'Account creation is managed by an administrator.',
};
