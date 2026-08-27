import { Head } from '@inertiajs/react';
import {
    Check,
    Eye,
    FileEdit,
    KeyRound,
    Pencil,
    Shield,
    ShieldCheck,
    UserPlus,
    Users,
    UserX,
} from 'lucide-react';
import type { ComponentType, SVGProps } from 'react';
import Callout from '@/components/callout';
import ConfirmDialog from '@/components/confirm-dialog';
import FormDialog from '@/components/form-dialog';
import FormField from '@/components/form-field';
import PageContainer from '@/components/page-container';
import PageHeader from '@/components/page-header';
import { SectionCard, SectionCardHeader } from '@/components/section-card';
import type { StatusTone } from '@/components/status-badge';
import StatusBadge from '@/components/status-badge';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { NativeSelect } from '@/components/ui/native-select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import admin from '@/routes/admin';

type UserItem = {
    id: number;
    name: string;
    email: string;
    role: string;
    is_active: boolean;
};

type RoleInfo = {
    title: string;
    description: string;
    icon: ComponentType<SVGProps<SVGSVGElement>>;
    tone: StatusTone;
};

const roleInfo: Record<string, RoleInfo> = {
    viewer: {
        title: 'Viewer',
        description:
            'Search, read, and print scans. Cannot edit metadata or relocate files.',
        icon: Eye,
        tone: 'neutral',
    },
    editor: {
        title: 'Editor',
        description:
            'Encode new documents, correct metadata, replace scans, and stage batch moves.',
        icon: FileEdit,
        tone: 'info',
    },
    admin: {
        title: 'Administrator',
        description:
            'Provision staff, approve permanent deletions, and manage facilities.',
        icon: ShieldCheck,
        tone: 'primary',
    },
};

function infoFor(role: string): RoleInfo {
    return (
        roleInfo[role] ?? {
            title: role,
            description: 'Authorised municipal staff member.',
            icon: Shield,
            tone: 'primary',
        }
    );
}

function titleCase(value: string): string {
    return value.charAt(0).toUpperCase() + value.slice(1);
}

function RoleSelect({
    name,
    roles,
    defaultValue,
    id,
    describedBy,
    invalid,
}: {
    name: string;
    roles: string[];
    defaultValue?: string;
    id: string;
    describedBy?: string;
    invalid?: boolean;
}) {
    return (
        <NativeSelect
            id={id}
            name={name}
            defaultValue={defaultValue}
            aria-describedby={describedBy}
            aria-invalid={invalid}
            className="bg-card"
        >
            {roles.map((role) => (
                <option key={role} value={role}>
                    {titleCase(role)}
                </option>
            ))}
        </NativeSelect>
    );
}

export default function UserIndex({
    users,
    roles,
}: {
    users: UserItem[];
    roles: string[];
}) {
    const activeCount = users.filter((user) => user.is_active).length;

    return (
        <>
            <Head title="Staff Accounts" />
            <PageContainer>
                <PageHeader
                    title="Staff & Access"
                    icon={Users}
                    description="Self-registration is deliberately disabled. Every account is provisioned by an administrator, which is what makes the audit log a chain of custody rather than a list of guesses."
                    badge={
                        <Badge variant="secondary" className="rounded-full">
                            {activeCount} active of {users.length}
                        </Badge>
                    }
                    actions={
                        <FormDialog
                            trigger={
                                <Button>
                                    <UserPlus className="size-4" />
                                    Provision account
                                </Button>
                            }
                            title="Provision new staff account"
                            description="Hand the temporary password over in person — it is shown here in the clear precisely once."
                            icon={UserPlus}
                            form={admin.users.store.form()}
                            submitLabel="Provision account"
                            submitIcon={UserPlus}
                            size="md"
                            resetOnSuccess
                        >
                            {({ errors }) => (
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
                                                autoFocus
                                                aria-describedby={describedBy}
                                                aria-invalid={invalid}
                                                placeholder="e.g. Maria Santos"
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
                                                aria-describedby={describedBy}
                                                aria-invalid={invalid}
                                                placeholder="e.g. msantos@city.gov"
                                                className="bg-card"
                                            />
                                        )}
                                    </FormField>

                                    <FormField
                                        label="Temporary password"
                                        error={errors.password}
                                        required
                                        hint="At least 8 characters. The holder should change it on first sign-in."
                                    >
                                        {({ id, describedBy, invalid }) => (
                                            <Input
                                                id={id}
                                                name="password"
                                                type="text"
                                                autoComplete="off"
                                                aria-describedby={describedBy}
                                                aria-invalid={invalid}
                                                className="bg-card font-mono"
                                            />
                                        )}
                                    </FormField>

                                    <FormField
                                        label="Assigned role"
                                        error={errors.role}
                                        required
                                        hint="Start at the least privilege the work needs; roles are easy to raise later."
                                    >
                                        {({ id, describedBy, invalid }) => (
                                            <RoleSelect
                                                id={id}
                                                name="role"
                                                roles={roles}
                                                defaultValue="viewer"
                                                describedBy={describedBy}
                                                invalid={invalid}
                                            />
                                        )}
                                    </FormField>
                                </>
                            )}
                        </FormDialog>
                    }
                />

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {roles.map((role) => {
                        const info = infoFor(role);
                        const Icon = info.icon;
                        const count = users.filter(
                            (user) => user.role === role,
                        ).length;

                        return (
                            <div
                                key={role}
                                className="animate-rise flex min-w-0 items-start gap-3 rounded-2xl border border-border bg-card p-5 shadow-2xs"
                            >
                                <span className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary">
                                    <Icon className="size-4.5" />
                                </span>
                                <div className="min-w-0 space-y-1">
                                    <div className="flex items-center gap-2">
                                        <h2 className="font-semibold text-foreground">
                                            {info.title}
                                        </h2>
                                        <StatusBadge tone={info.tone}>
                                            {count}
                                        </StatusBadge>
                                    </div>
                                    <p className="text-xs leading-relaxed text-pretty text-muted-foreground">
                                        {info.description}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <SectionCard>
                    <SectionCardHeader
                        title="Staff directory"
                        description="Deactivated accounts keep their history; they simply cannot sign in."
                        icon={Users}
                    />

                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader className="bg-muted/30">
                                <TableRow className="hover:bg-transparent">
                                    <TableHead className="min-w-64 px-5 text-xs font-semibold tracking-wide text-muted-foreground uppercase sm:px-6">
                                        Staff member
                                    </TableHead>
                                    <TableHead className="min-w-32 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                                        Role
                                    </TableHead>
                                    <TableHead className="min-w-28 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                                        Status
                                    </TableHead>
                                    <TableHead className="w-72 px-5 text-right text-xs font-semibold tracking-wide text-muted-foreground uppercase sm:px-6">
                                        Actions
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody className="stagger">
                                {users.map((user) => (
                                    <TableRow
                                        key={user.id}
                                        className="border-border/60 transition-colors hover:bg-muted/40"
                                    >
                                        <TableCell className="px-5 py-3.5 sm:px-6">
                                            <div className="min-w-0 space-y-0.5">
                                                <p className="truncate font-medium text-foreground">
                                                    {user.name}
                                                </p>
                                                <p className="truncate font-mono text-xs text-muted-foreground">
                                                    {user.email}
                                                </p>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <StatusBadge
                                                tone={infoFor(user.role).tone}
                                                className="capitalize"
                                            >
                                                {user.role}
                                            </StatusBadge>
                                        </TableCell>
                                        <TableCell>
                                            {user.is_active ? (
                                                <StatusBadge tone="success" dot>
                                                    Active
                                                </StatusBadge>
                                            ) : (
                                                <StatusBadge tone="danger" dot>
                                                    Deactivated
                                                </StatusBadge>
                                            )}
                                        </TableCell>
                                        <TableCell className="px-5 py-3.5 text-right sm:px-6">
                                            <div className="flex items-center justify-end gap-1.5">
                                                <FormDialog
                                                    trigger={
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                        >
                                                            <Pencil className="size-3.5" />
                                                            Edit
                                                        </Button>
                                                    }
                                                    title={`Edit ${user.name}`}
                                                    description="Name, address, and security role for this account."
                                                    icon={Pencil}
                                                    form={admin.users.update.form(
                                                        user.id,
                                                    )}
                                                    submitLabel="Save changes"
                                                    submitIcon={Check}
                                                >
                                                    {({ errors }) => (
                                                        <>
                                                            <FormField
                                                                label="Full name"
                                                                error={
                                                                    errors.name
                                                                }
                                                                required
                                                            >
                                                                {({
                                                                    id,
                                                                    describedBy,
                                                                    invalid,
                                                                }) => (
                                                                    <Input
                                                                        id={id}
                                                                        name="name"
                                                                        autoFocus
                                                                        defaultValue={
                                                                            user.name
                                                                        }
                                                                        aria-describedby={
                                                                            describedBy
                                                                        }
                                                                        aria-invalid={
                                                                            invalid
                                                                        }
                                                                        className="bg-card"
                                                                    />
                                                                )}
                                                            </FormField>

                                                            <FormField
                                                                label="Email address"
                                                                error={
                                                                    errors.email
                                                                }
                                                                required
                                                            >
                                                                {({
                                                                    id,
                                                                    describedBy,
                                                                    invalid,
                                                                }) => (
                                                                    <Input
                                                                        id={id}
                                                                        name="email"
                                                                        type="email"
                                                                        defaultValue={
                                                                            user.email
                                                                        }
                                                                        aria-describedby={
                                                                            describedBy
                                                                        }
                                                                        aria-invalid={
                                                                            invalid
                                                                        }
                                                                        className="bg-card"
                                                                    />
                                                                )}
                                                            </FormField>

                                                            <FormField
                                                                label="Security role"
                                                                error={
                                                                    errors.role
                                                                }
                                                                required
                                                            >
                                                                {({
                                                                    id,
                                                                    describedBy,
                                                                    invalid,
                                                                }) => (
                                                                    <RoleSelect
                                                                        id={id}
                                                                        name="role"
                                                                        roles={
                                                                            roles
                                                                        }
                                                                        defaultValue={
                                                                            user.role
                                                                        }
                                                                        describedBy={
                                                                            describedBy
                                                                        }
                                                                        invalid={
                                                                            invalid
                                                                        }
                                                                    />
                                                                )}
                                                            </FormField>
                                                        </>
                                                    )}
                                                </FormDialog>

                                                <FormDialog
                                                    trigger={
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                        >
                                                            <KeyRound className="size-3.5" />
                                                            Password
                                                        </Button>
                                                    }
                                                    title={`Reset password for ${user.name}`}
                                                    description="Any active session keeps working; the new password applies at the next sign-in."
                                                    icon={KeyRound}
                                                    form={admin.users.resetPassword.form(
                                                        user.id,
                                                    )}
                                                    submitLabel="Set password"
                                                    submitIcon={KeyRound}
                                                >
                                                    {({ errors }) => (
                                                        <>
                                                            <Callout
                                                                tone="warning"
                                                                title="Deliver this in person"
                                                            >
                                                                A temporary
                                                                password sent
                                                                over email or
                                                                chat is a
                                                                credential
                                                                sitting in
                                                                someone
                                                                else&rsquo;s
                                                                inbox.
                                                            </Callout>

                                                            <FormField
                                                                label="New temporary password"
                                                                error={
                                                                    errors.password
                                                                }
                                                                required
                                                                hint="At least 8 characters."
                                                            >
                                                                {({
                                                                    id,
                                                                    describedBy,
                                                                    invalid,
                                                                }) => (
                                                                    <Input
                                                                        id={id}
                                                                        name="password"
                                                                        type="text"
                                                                        autoFocus
                                                                        autoComplete="off"
                                                                        aria-describedby={
                                                                            describedBy
                                                                        }
                                                                        aria-invalid={
                                                                            invalid
                                                                        }
                                                                        className="bg-card font-mono"
                                                                    />
                                                                )}
                                                            </FormField>
                                                        </>
                                                    )}
                                                </FormDialog>

                                                {user.is_active && (
                                                    <ConfirmDialog
                                                        trigger={
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                                                            >
                                                                <UserX className="size-3.5" />
                                                                Deactivate
                                                            </Button>
                                                        }
                                                        tone="danger"
                                                        icon={UserX}
                                                        title="Deactivate this account?"
                                                        description="They lose access immediately. Their name stays on every audit entry they created."
                                                        form={admin.users.deactivate.form(
                                                            user.id,
                                                        )}
                                                        confirmLabel="Deactivate account"
                                                        confirmIcon={UserX}
                                                        details={
                                                            <div className="space-y-0.5">
                                                                <p className="font-medium text-foreground">
                                                                    {user.name}
                                                                </p>
                                                                <p className="font-mono text-xs text-muted-foreground">
                                                                    {user.email}
                                                                </p>
                                                                <p className="text-xs text-muted-foreground capitalize">
                                                                    {user.role}
                                                                </p>
                                                            </div>
                                                        }
                                                    />
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </SectionCard>
            </PageContainer>
        </>
    );
}

UserIndex.layout = {
    breadcrumbs: [{ title: 'Staff Users', href: admin.users.index() }],
};
