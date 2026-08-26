import { Form, Head } from '@inertiajs/react';
import { KeyRound, ShieldCheck, UserPlus, UserX } from 'lucide-react';
import { useState } from 'react';
import FlashMessage from '@/components/flash-message';
import InputError from '@/components/input-error';
import PageHeader from '@/components/page-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { NativeSelect } from '@/components/ui/native-select';
import admin from '@/routes/admin';

type UserItem = {
    id: number;
    name: string;
    email: string;
    role: string;
    is_active: boolean;
};

const roleCopy: Record<string, string> = {
    viewer: 'Reads and prints. Changes nothing.',
    editor: 'Encodes, corrects, and moves paper.',
    admin: 'Runs the office: accounts, deletions, reports.',
};

export default function UserIndex({
    users,
    roles,
}: {
    users: UserItem[];
    roles: string[];
}) {
    const [panel, setPanel] = useState<{
        id: number;
        kind: 'edit' | 'password';
    } | null>(null);

    return (
        <>
            <Head title="Users" />
            <div className="flex flex-1 flex-col gap-6 p-6">
                <PageHeader
                    title="Staff accounts"
                    description="There is no self-registration. Every account is provisioned here, so access is always intentional."
                />

                <FlashMessage />

                <div className="grid gap-4 sm:grid-cols-3">
                    {roles.map((role) => (
                        <div
                            key={role}
                            className="rounded-xl border border-border bg-card p-5"
                        >
                            <div className="flex items-center gap-2.5">
                                <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10">
                                    <ShieldCheck className="size-4" />
                                </span>
                                <h2 className="font-semibold capitalize">
                                    {role}
                                </h2>
                            </div>
                            <p className="mt-3 text-sm text-muted-foreground">
                                {roleCopy[role] ?? ''}
                            </p>
                        </div>
                    ))}
                </div>

                <section className="rounded-xl border border-border bg-card">
                    <header className="border-b border-border px-5 py-4">
                        <h2 className="font-semibold">Create an account</h2>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Set a strong temporary password and hand it over in
                            person.
                        </p>
                    </header>
                    <Form
                        {...admin.users.store.form()}
                        resetOnSuccess
                        className="grid gap-4 p-5 sm:grid-cols-2"
                    >
                        {({ processing, errors }) => (
                            <>
                                <div className="grid gap-1.5">
                                    <Label htmlFor="name">Full name</Label>
                                    <Input
                                        id="name"
                                        name="name"
                                        aria-invalid={Boolean(errors.name)}
                                    />
                                    <InputError message={errors.name} />
                                </div>

                                <div className="grid gap-1.5">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        name="email"
                                        type="email"
                                        aria-invalid={Boolean(errors.email)}
                                    />
                                    <InputError message={errors.email} />
                                </div>

                                <div className="grid gap-1.5">
                                    <Label htmlFor="password">
                                        Temporary password
                                    </Label>
                                    <Input
                                        id="password"
                                        name="password"
                                        type="text"
                                        autoComplete="off"
                                        aria-invalid={Boolean(errors.password)}
                                    />
                                    <InputError message={errors.password} />
                                </div>

                                <div className="grid gap-1.5">
                                    <Label htmlFor="role">Role</Label>
                                    <NativeSelect
                                        id="role"
                                        name="role"
                                        defaultValue="viewer"
                                    >
                                        {roles.map((role) => (
                                            <option key={role} value={role}>
                                                {role}
                                            </option>
                                        ))}
                                    </NativeSelect>
                                    <InputError message={errors.role} />
                                </div>

                                <div className="sm:col-span-2">
                                    <Button type="submit" disabled={processing}>
                                        <UserPlus />
                                        Create account
                                    </Button>
                                </div>
                            </>
                        )}
                    </Form>
                </section>

                <section className="rounded-xl border border-border bg-card">
                    <header className="border-b border-border px-5 py-4">
                        <h2 className="font-semibold">Accounts</h2>
                    </header>
                    <ul className="divide-y divide-border">
                        {users.map((user) => (
                            <li key={user.id} className="px-5 py-4">
                                <div className="flex flex-wrap items-center justify-between gap-3">
                                    <div className="min-w-0">
                                        <p className="truncate font-medium">
                                            {user.name}
                                        </p>
                                        <p className="truncate text-sm text-muted-foreground">
                                            {user.email}
                                        </p>
                                    </div>
                                    <div className="flex shrink-0 flex-wrap items-center gap-2">
                                        <Badge className="rounded-full capitalize">
                                            {user.role}
                                        </Badge>
                                        {!user.is_active && (
                                            <Badge
                                                variant="secondary"
                                                className="rounded-full"
                                            >
                                                Deactivated
                                            </Badge>
                                        )}
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() =>
                                                setPanel(
                                                    panel?.id === user.id &&
                                                        panel.kind === 'edit'
                                                        ? null
                                                        : {
                                                              id: user.id,
                                                              kind: 'edit',
                                                          },
                                                )
                                            }
                                        >
                                            Edit
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() =>
                                                setPanel(
                                                    panel?.id === user.id &&
                                                        panel.kind ===
                                                            'password'
                                                        ? null
                                                        : {
                                                              id: user.id,
                                                              kind: 'password',
                                                          },
                                                )
                                            }
                                        >
                                            <KeyRound />
                                            Reset password
                                        </Button>
                                        {user.is_active && (
                                            <Form
                                                {...admin.users.deactivate.form(
                                                    user.id,
                                                )}
                                            >
                                                {({ processing }) => (
                                                    <Button
                                                        type="submit"
                                                        variant="outline"
                                                        size="sm"
                                                        disabled={processing}
                                                    >
                                                        <UserX />
                                                        Deactivate
                                                    </Button>
                                                )}
                                            </Form>
                                        )}
                                    </div>
                                </div>

                                {panel?.id === user.id &&
                                    panel.kind === 'edit' && (
                                        <Form
                                            {...admin.users.update.form(
                                                user.id,
                                            )}
                                            onSuccess={() => setPanel(null)}
                                            className="mt-4 grid gap-3 rounded-lg border border-border p-4 sm:grid-cols-3"
                                        >
                                            {({ processing, errors }) => (
                                                <>
                                                    <div className="grid gap-1.5">
                                                        <Label
                                                            htmlFor={`name-${user.id}`}
                                                        >
                                                            Name
                                                        </Label>
                                                        <Input
                                                            id={`name-${user.id}`}
                                                            name="name"
                                                            defaultValue={
                                                                user.name
                                                            }
                                                        />
                                                        <InputError
                                                            message={
                                                                errors.name
                                                            }
                                                        />
                                                    </div>
                                                    <div className="grid gap-1.5">
                                                        <Label
                                                            htmlFor={`email-${user.id}`}
                                                        >
                                                            Email
                                                        </Label>
                                                        <Input
                                                            id={`email-${user.id}`}
                                                            name="email"
                                                            type="email"
                                                            defaultValue={
                                                                user.email
                                                            }
                                                        />
                                                        <InputError
                                                            message={
                                                                errors.email
                                                            }
                                                        />
                                                    </div>
                                                    <div className="grid gap-1.5">
                                                        <Label
                                                            htmlFor={`role-${user.id}`}
                                                        >
                                                            Role
                                                        </Label>
                                                        <NativeSelect
                                                            id={`role-${user.id}`}
                                                            name="role"
                                                            defaultValue={
                                                                user.role
                                                            }
                                                        >
                                                            {roles.map(
                                                                (role) => (
                                                                    <option
                                                                        key={
                                                                            role
                                                                        }
                                                                        value={
                                                                            role
                                                                        }
                                                                    >
                                                                        {role}
                                                                    </option>
                                                                ),
                                                            )}
                                                        </NativeSelect>
                                                        <InputError
                                                            message={
                                                                errors.role
                                                            }
                                                        />
                                                    </div>
                                                    <div className="sm:col-span-3">
                                                        <Button
                                                            type="submit"
                                                            size="sm"
                                                            disabled={
                                                                processing
                                                            }
                                                        >
                                                            Save changes
                                                        </Button>
                                                    </div>
                                                </>
                                            )}
                                        </Form>
                                    )}

                                {panel?.id === user.id &&
                                    panel.kind === 'password' && (
                                        <Form
                                            {...admin.users.resetPassword.form(
                                                user.id,
                                            )}
                                            onSuccess={() => setPanel(null)}
                                            className="mt-4 flex items-end gap-2 rounded-lg border border-border p-4"
                                        >
                                            {({ processing, errors }) => (
                                                <>
                                                    <div className="grid flex-1 gap-1.5">
                                                        <Label
                                                            htmlFor={`password-${user.id}`}
                                                        >
                                                            New temporary
                                                            password
                                                        </Label>
                                                        <Input
                                                            id={`password-${user.id}`}
                                                            name="password"
                                                            type="text"
                                                            autoComplete="off"
                                                        />
                                                        <InputError
                                                            message={
                                                                errors.password
                                                            }
                                                        />
                                                    </div>
                                                    <Button
                                                        type="submit"
                                                        size="sm"
                                                        disabled={processing}
                                                    >
                                                        Set password
                                                    </Button>
                                                </>
                                            )}
                                        </Form>
                                    )}
                            </li>
                        ))}
                    </ul>
                </section>
            </div>
        </>
    );
}

UserIndex.layout = {
    breadcrumbs: [{ title: 'Users', href: admin.users.index() }],
};
