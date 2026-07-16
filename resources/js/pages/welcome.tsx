import { Head, Link, usePage } from '@inertiajs/react';
import {
    ArrowRight,
    Check,
    CloudUpload,
    Download,
    FileSpreadsheet,
    FileText,
    Folder,
    FolderTree,
    KeyRound,
    Lock,
    Search,
    ShieldCheck,
    Trash2,
    UserCog,
    Users,
} from 'lucide-react';
import type { ComponentType, ReactNode, SVGProps } from 'react';
import LogoMark from '@/components/logo-mark';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { dashboard, login } from '@/routes';

type IconType = ComponentType<SVGProps<SVGSVGElement>>;

const features: { icon: IconType; title: string; description: string }[] = [
    {
        icon: FolderTree,
        title: 'Nested folders',
        description:
            'Build the folder tree your department already thinks in. Rename and move anything without ever breaking a download link.',
    },
    {
        icon: CloudUpload,
        title: 'Multi-file upload',
        description:
            'Drop in several files at once and watch real-time progress bars. Duplicate names are auto-suffixed, never overwritten.',
    },
    {
        icon: Search,
        title: 'Instant search',
        description:
            'Find any file by name across your whole workspace. Results stay scoped to your team and never surface trashed items.',
    },
    {
        icon: Trash2,
        title: 'Trash & restore',
        description:
            'Deletes are soft by default. Restore a single file or an entire folder subtree — only admins can delete forever.',
    },
    {
        icon: Users,
        title: 'Team workspaces',
        description:
            'Every department gets an isolated workspace. Belong to several teams and switch between them in a single click.',
    },
    {
        icon: ShieldCheck,
        title: 'Role-based access',
        description:
            'Admins, editors, and viewers per team. Read-only members can browse and download but never change a thing.',
    },
];

const roles: {
    icon: IconType;
    name: string;
    tagline: string;
    highlight?: boolean;
    permissions: string[];
}[] = [
    {
        icon: Download,
        name: 'Viewer',
        tagline: 'Read-only peace of mind',
        permissions: [
            'Browse the full folder tree',
            'Search across the workspace',
            'Download any file',
            'Zero risk of accidental changes',
        ],
    },
    {
        icon: FileText,
        name: 'Editor',
        tagline: 'Everyday file work',
        highlight: true,
        permissions: [
            'Everything a viewer can do',
            'Upload, rename, and move files',
            'Create and organize folders',
            'Move items to trash and restore them',
        ],
    },
    {
        icon: UserCog,
        name: 'Team admin',
        tagline: 'Full control of the workspace',
        permissions: [
            'Everything an editor can do',
            'Add members and assign roles',
            'Delete files forever',
            'Empty the team trash',
        ],
    },
];

const securityPoints: { icon: IconType; title: string; description: string }[] =
    [
        {
            icon: Lock,
            title: 'Private storage',
            description:
                'Files live on a private disk — there are no public URLs. Every download is served through an authenticated route.',
        },
        {
            icon: KeyRound,
            title: 'Two-factor & passkeys',
            description:
                'Protect sign-in with TOTP two-factor authentication or go passwordless with modern passkeys.',
        },
        {
            icon: ShieldCheck,
            title: 'Managed accounts',
            description:
                'No self-signup. An administrator provisions every account and team, so access is always intentional.',
        },
    ];

function BrowserRow({
    icon,
    name,
    meta,
    muted = false,
}: {
    icon: ReactNode;
    name: string;
    meta: string;
    muted?: boolean;
}) {
    return (
        <div className="flex items-center justify-between gap-3 rounded-md px-3 py-2 hover:bg-muted/60">
            <div className="flex min-w-0 items-center gap-2.5">
                {icon}
                <span
                    className={`truncate text-sm ${muted ? 'text-muted-foreground' : 'text-foreground'}`}
                >
                    {name}
                </span>
            </div>
            <span className="shrink-0 text-xs text-muted-foreground">
                {meta}
            </span>
        </div>
    );
}

export default function Welcome() {
    const { auth } = usePage().props;

    const primaryCta = auth.user ? (
        <Button asChild size="lg">
            <Link href={dashboard()}>
                Open your workspace
                <ArrowRight />
            </Link>
        </Button>
    ) : (
        <Button asChild size="lg">
            <Link href={login()}>
                Sign in to your workspace
                <ArrowRight />
            </Link>
        </Button>
    );

    return (
        <>
            <Head title="Welcome" />
            <div className="min-h-screen bg-background text-foreground">
                {/* Navigation */}
                <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur">
                    <nav className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-6">
                        <a href="#top" className="flex items-center gap-2.5">
                            <LogoMark />
                            <span className="text-sm font-semibold tracking-tight">
                                File Management System
                            </span>
                        </a>
                        <div className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
                            <a
                                href="#features"
                                className="transition-colors hover:text-foreground"
                            >
                                Features
                            </a>
                            <a
                                href="#roles"
                                className="transition-colors hover:text-foreground"
                            >
                                Roles
                            </a>
                            <a
                                href="#security"
                                className="transition-colors hover:text-foreground"
                            >
                                Security
                            </a>
                        </div>
                        {auth.user ? (
                            <Button asChild variant="outline" size="sm">
                                <Link href={dashboard()}>Dashboard</Link>
                            </Button>
                        ) : (
                            <Button asChild size="sm">
                                <Link href={login()}>Log in</Link>
                            </Button>
                        )}
                    </nav>
                </header>

                <main id="top">
                    {/* Hero */}
                    <section className="relative overflow-hidden">
                        <div
                            aria-hidden
                            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,--theme(--color-primary/8%),transparent_60%)]"
                        />
                        <div className="relative mx-auto grid w-full max-w-6xl items-center gap-14 px-6 pt-20 pb-16 lg:grid-cols-2 lg:pt-28 lg:pb-24">
                            <div className="flex flex-col items-start gap-6">
                                <Badge
                                    variant="secondary"
                                    className="rounded-full px-3 py-1"
                                >
                                    <Users />
                                    Built for departments and their teams
                                </Badge>
                                <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
                                    All your department&rsquo;s files. One
                                    secure home.
                                </h1>
                                <p className="max-w-xl text-lg text-pretty text-muted-foreground">
                                    Organize folders, upload with live progress,
                                    and control exactly who can view, edit, or
                                    manage — with a trash that lets you undo
                                    mistakes before they matter.
                                </p>
                                <div className="flex flex-wrap items-center gap-3">
                                    {primaryCta}
                                    <Button asChild variant="outline" size="lg">
                                        <a href="#features">Explore features</a>
                                    </Button>
                                </div>
                                <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
                                    {[
                                        'Role-based access',
                                        'Private storage',
                                        'Trash & restore',
                                    ].map((item) => (
                                        <span
                                            key={item}
                                            className="flex items-center gap-1.5"
                                        >
                                            <Check className="size-4 text-foreground" />
                                            {item}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Mock file browser */}
                            <div className="relative">
                                <div className="rounded-xl border border-border bg-card shadow-xl shadow-primary/5">
                                    <div className="flex items-center gap-2 border-b border-border px-4 py-3">
                                        <span className="size-2.5 rounded-full bg-muted-foreground/30" />
                                        <span className="size-2.5 rounded-full bg-muted-foreground/30" />
                                        <span className="size-2.5 rounded-full bg-muted-foreground/30" />
                                        <div className="ml-3 flex min-w-0 items-center gap-1.5 text-xs text-muted-foreground">
                                            <span className="font-medium text-foreground">
                                                Finance
                                            </span>
                                            <span>/</span>
                                            <span>Reports</span>
                                            <span>/</span>
                                            <span>2026</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 border-b border-border px-4 py-2.5">
                                        <Search className="size-4 text-muted-foreground" />
                                        <span className="text-sm text-muted-foreground">
                                            Search files…
                                        </span>
                                    </div>
                                    <div className="space-y-0.5 p-2">
                                        <BrowserRow
                                            icon={
                                                <Folder className="size-4 shrink-0 text-muted-foreground" />
                                            }
                                            name="Quarterly reports"
                                            meta="12 items"
                                        />
                                        <BrowserRow
                                            icon={
                                                <Folder className="size-4 shrink-0 text-muted-foreground" />
                                            }
                                            name="Invoices"
                                            meta="48 items"
                                        />
                                        <BrowserRow
                                            icon={
                                                <FileText className="size-4 shrink-0 text-muted-foreground" />
                                            }
                                            name="Q3-summary.pdf"
                                            meta="2.4 MB"
                                        />
                                        <BrowserRow
                                            icon={
                                                <FileSpreadsheet className="size-4 shrink-0 text-muted-foreground" />
                                            }
                                            name="annual-budget.xlsx"
                                            meta="1.1 MB"
                                        />
                                        <BrowserRow
                                            icon={
                                                <FileText className="size-4 shrink-0 text-muted-foreground" />
                                            }
                                            name="board-minutes.docx"
                                            meta="380 KB"
                                            muted
                                        />
                                    </div>
                                </div>

                                {/* Floating upload progress */}
                                <div className="absolute -bottom-6 -left-4 w-64 rounded-lg border border-border bg-card p-3 shadow-lg sm:-left-8">
                                    <div className="flex items-center gap-2">
                                        <CloudUpload className="size-4 text-muted-foreground" />
                                        <span className="truncate text-xs font-medium">
                                            Uploading annual-report.pdf
                                        </span>
                                        <span className="ml-auto text-xs text-muted-foreground">
                                            72%
                                        </span>
                                    </div>
                                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
                                        <div className="h-full w-[72%] rounded-full bg-primary" />
                                    </div>
                                </div>

                                {/* Floating role chip */}
                                <div className="absolute -top-4 -right-2 flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 shadow-lg sm:-right-6">
                                    <ShieldCheck className="size-4 text-muted-foreground" />
                                    <span className="text-xs font-medium">
                                        Editor
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                        Finance team
                                    </span>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Features */}
                    <section
                        id="features"
                        className="border-t border-border/60 bg-muted/30"
                    >
                        <div className="mx-auto w-full max-w-6xl px-6 py-20 lg:py-24">
                            <div className="mx-auto max-w-2xl text-center">
                                <h2 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
                                    Everything a shared drive should have been
                                </h2>
                                <p className="mt-4 text-lg text-muted-foreground">
                                    No more email attachments and mystery
                                    folders. One organized, searchable place per
                                    team.
                                </p>
                            </div>
                            <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                                {features.map(
                                    ({ icon: Icon, title, description }) => (
                                        <div
                                            key={title}
                                            className="rounded-xl border border-border bg-card p-6 transition-shadow hover:shadow-md"
                                        >
                                            <span className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
                                                <Icon className="size-5" />
                                            </span>
                                            <h3 className="mt-4 font-semibold">
                                                {title}
                                            </h3>
                                            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                                                {description}
                                            </p>
                                        </div>
                                    ),
                                )}
                            </div>
                        </div>
                    </section>

                    {/* Roles */}
                    <section id="roles" className="border-t border-border/60">
                        <div className="mx-auto w-full max-w-6xl px-6 py-20 lg:py-24">
                            <div className="mx-auto max-w-2xl text-center">
                                <h2 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
                                    The right access for every teammate
                                </h2>
                                <p className="mt-4 text-lg text-muted-foreground">
                                    Assign a role per team member — from
                                    read-only viewers to admins who run the
                                    workspace.
                                </p>
                            </div>
                            <div className="mt-14 grid gap-6 lg:grid-cols-3">
                                {roles.map(
                                    ({
                                        icon: Icon,
                                        name,
                                        tagline,
                                        highlight,
                                        permissions,
                                    }) => (
                                        <div
                                            key={name}
                                            className={`relative flex flex-col rounded-xl border bg-card p-6 ${
                                                highlight
                                                    ? 'border-primary shadow-lg shadow-primary/5'
                                                    : 'border-border'
                                            }`}
                                        >
                                            {highlight && (
                                                <Badge className="absolute -top-2.5 left-6 rounded-full">
                                                    Most common
                                                </Badge>
                                            )}
                                            <div className="flex items-center gap-3">
                                                <span className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
                                                    <Icon className="size-5" />
                                                </span>
                                                <div>
                                                    <h3 className="font-semibold">
                                                        {name}
                                                    </h3>
                                                    <p className="text-sm text-muted-foreground">
                                                        {tagline}
                                                    </p>
                                                </div>
                                            </div>
                                            <ul className="mt-6 space-y-3">
                                                {permissions.map(
                                                    (permission) => (
                                                        <li
                                                            key={permission}
                                                            className="flex items-start gap-2.5 text-sm"
                                                        >
                                                            <Check className="mt-0.5 size-4 shrink-0 text-foreground" />
                                                            <span className="text-muted-foreground">
                                                                {permission}
                                                            </span>
                                                        </li>
                                                    ),
                                                )}
                                            </ul>
                                        </div>
                                    ),
                                )}
                            </div>
                        </div>
                    </section>

                    {/* Security */}
                    <section
                        id="security"
                        className="border-t border-border/60 bg-muted/30"
                    >
                        <div className="mx-auto w-full max-w-6xl px-6 py-20 lg:py-24">
                            <div className="grid items-start gap-12 lg:grid-cols-[1fr_1.2fr]">
                                <div>
                                    <Badge
                                        variant="secondary"
                                        className="rounded-full px-3 py-1"
                                    >
                                        <Lock />
                                        Security first
                                    </Badge>
                                    <h2 className="mt-5 text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
                                        Your files never leave the building
                                    </h2>
                                    <p className="mt-4 text-lg text-muted-foreground">
                                        Designed for organizations that keep
                                        sensitive documents in-house. Access is
                                        provisioned, authenticated, and scoped
                                        to your team — nothing is ever public.
                                    </p>
                                </div>
                                <div className="grid gap-4">
                                    {securityPoints.map(
                                        ({
                                            icon: Icon,
                                            title,
                                            description,
                                        }) => (
                                            <div
                                                key={title}
                                                className="flex gap-4 rounded-xl border border-border bg-card p-5"
                                            >
                                                <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                                                    <Icon className="size-5" />
                                                </span>
                                                <div>
                                                    <h3 className="font-semibold">
                                                        {title}
                                                    </h3>
                                                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                                                        {description}
                                                    </p>
                                                </div>
                                            </div>
                                        ),
                                    )}
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* CTA */}
                    <section className="border-t border-border/60">
                        <div className="mx-auto w-full max-w-6xl px-6 py-20 lg:py-24">
                            <div className="relative overflow-hidden rounded-2xl bg-primary px-8 py-14 text-center text-primary-foreground sm:px-14">
                                <div
                                    aria-hidden
                                    className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,--theme(--color-primary-foreground/12%),transparent_60%)]"
                                />
                                <div className="relative mx-auto flex max-w-xl flex-col items-center gap-5">
                                    <h2 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
                                        Ready to get your team&rsquo;s files in
                                        order?
                                    </h2>
                                    <p className="text-lg text-primary-foreground/80">
                                        Sign in with the account your
                                        administrator set up and start
                                        organizing today.
                                    </p>
                                    <Button
                                        asChild
                                        size="lg"
                                        variant="secondary"
                                        className="mt-2"
                                    >
                                        <Link
                                            href={
                                                auth.user
                                                    ? dashboard()
                                                    : login()
                                            }
                                        >
                                            {auth.user
                                                ? 'Open your workspace'
                                                : 'Sign in'}
                                            <ArrowRight />
                                        </Link>
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </section>
                </main>

                <footer className="border-t border-border/60">
                    <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-4 px-6 py-8 text-sm text-muted-foreground sm:flex-row">
                        <div className="flex items-center gap-2">
                            <LogoMark
                                className="size-6 rounded-md"
                                iconClassName="size-3.5"
                            />
                            <span>File Management System</span>
                        </div>
                        <p>
                            Secure, team-based file management for your
                            organization.
                        </p>
                    </div>
                </footer>
            </div>
        </>
    );
}
