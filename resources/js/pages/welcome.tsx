import { Head, Link, usePage } from '@inertiajs/react';
import {
    ArrowRight,
    Building2,
    Check,
    Clock,
    Download,
    FileText,
    History,
    KeyRound,
    Lock,
    MapPin,
    QrCode,
    Search,
    ShieldCheck,
    Tags,
    UserCog,
    Users,
    WifiOff,
} from 'lucide-react';
import type { ComponentType, ReactNode, SVGProps } from 'react';
import LogoMark from '@/components/logo-mark';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { dashboard, login } from '@/routes';

type IconType = ComponentType<SVGProps<SVGSVGElement>>;

const features: { icon: IconType; title: string; description: string }[] = [
    {
        icon: Search,
        title: 'Search that never says no',
        description:
            'Every search ends in one of three answers — found, known business with nothing encoded, or not in the list. A blank result that reads as a denial is the one outcome the system will not produce.',
    },
    {
        icon: MapPin,
        title: 'Address-first search',
        description:
            'When a matter arrives with the building known but the owner unknown, search the address instead. Location is a way in, not just a filter under a business name.',
    },
    {
        icon: QrCode,
        title: 'Know where the paper is',
        description:
            'Each document carries a printed QR code. Scan it with the companion Android app to record a move, so nobody crosses the city on a guess.',
    },
    {
        icon: Tags,
        title: 'Vocabularies that stay clean',
        description:
            'Business, branch, and request type suggest what already exists as you type — so one building never fragments into "Rizal St", "Rizal Street", and "Rizal".',
    },
    {
        icon: History,
        title: 'Every correction is reversible',
        description:
            'Metadata changes are recorded and can be reverted. Replacing a poor scan supersedes the old one rather than destroying it.',
    },
    {
        icon: Clock,
        title: 'Deletion takes two people',
        description:
            'An editor files a request with a reason; an admin decides. Approved documents are held for 90 days before they are purged for good.',
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
        tagline: 'Read-only, like the storage room',
        permissions: [
            'Search by business or by address',
            'Open, download, and print any scan',
            'See where each paper original is',
            'Zero risk of accidental changes',
        ],
    },
    {
        icon: FileText,
        name: 'Editor',
        tagline: 'The people who fill the archive',
        highlight: true,
        permissions: [
            'Everything a viewer can do',
            'Encode documents and correct metadata',
            'Create businesses, branches, and request types',
            'Move paper between locations and file deletion requests',
        ],
    },
    {
        icon: UserCog,
        name: 'Admin',
        tagline: 'The office head',
        permissions: [
            'Everything an editor can do',
            'Provision accounts and reset passwords in person',
            'Approve or reject deletion requests',
            'Read the activity log and the search hit-rate report',
        ],
    },
];

const securityPoints: { icon: IconType; title: string; description: string }[] =
    [
        {
            icon: Lock,
            title: 'Private storage, logged access',
            description:
                'Scans live on a private disk with no public URLs. Every view, download, and print is served through an authenticated route and recorded against the person who asked for it.',
        },
        {
            icon: WifiOff,
            title: 'On the office network only',
            description:
                'The server sits inside the office and is unreachable from outside it. Searching, viewing, printing, and QR updates all keep working with the internet down.',
        },
        {
            icon: KeyRound,
            title: 'Two-factor and passkeys',
            description:
                'Protect sign-in with TOTP two-factor authentication, or go passwordless with a passkey.',
        },
        {
            icon: ShieldCheck,
            title: 'Managed accounts',
            description:
                'No self-signup. An administrator provisions every account and assigns its role, so access is always intentional.',
        },
    ];

function ResultRow({
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
                Open the archive
                <ArrowRight />
            </Link>
        </Button>
    ) : (
        <Button asChild size="lg">
            <Link href={login()}>
                Sign in to the archive
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
                                    <Building2 />A searchable index over a paper
                                    archive
                                </Badge>
                                <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
                                    Thirty minutes in the storage room. Or
                                    thirty seconds at your desk.
                                </h1>
                                <p className="max-w-xl text-lg text-pretty text-muted-foreground">
                                    The office keeps its records on paper, and
                                    after three or four years those papers leave
                                    for a storage building across the city. This
                                    system is the index: it tells you whether a
                                    document exists, lets you read the scan, and
                                    says where the original physically is —
                                    before anyone walks anywhere.
                                </p>
                                <div className="flex flex-wrap items-center gap-3">
                                    {primaryCta}
                                    <Button asChild variant="outline" size="lg">
                                        <a href="#features">See how it works</a>
                                    </Button>
                                </div>
                                <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
                                    {[
                                        'Never a false "no record"',
                                        'QR-tracked locations',
                                        'Works offline',
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

                            {/* Mock search result */}
                            <div className="relative">
                                <div className="rounded-xl border border-border bg-card shadow-xl shadow-primary/5">
                                    <div className="flex items-center gap-2 border-b border-border px-4 py-3">
                                        <span className="size-2.5 rounded-full bg-muted-foreground/30" />
                                        <span className="size-2.5 rounded-full bg-muted-foreground/30" />
                                        <span className="size-2.5 rounded-full bg-muted-foreground/30" />
                                        <div className="ml-3 flex min-w-0 items-center gap-1.5 text-xs text-muted-foreground">
                                            <span className="font-medium text-foreground">
                                                ABC Corporation
                                            </span>
                                            <span>/</span>
                                            <span>14 Rizal Street</span>
                                            <span>/</span>
                                            <span>Setback inspection</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 border-b border-border px-4 py-2.5">
                                        <Search className="size-4 text-muted-foreground" />
                                        <span className="text-sm text-muted-foreground">
                                            Search by business or address…
                                        </span>
                                    </div>
                                    <div className="space-y-0.5 p-2">
                                        <ResultRow
                                            icon={
                                                <FileText className="size-4 shrink-0 text-muted-foreground" />
                                            }
                                            name="Setback inspection request"
                                            meta="Approved 12 Mar 2024"
                                        />
                                        <ResultRow
                                            icon={
                                                <FileText className="size-4 shrink-0 text-muted-foreground" />
                                            }
                                            name="Occupancy permit application"
                                            meta="Approved 08 Aug 2023"
                                        />
                                        <ResultRow
                                            icon={
                                                <FileText className="size-4 shrink-0 text-muted-foreground" />
                                            }
                                            name="Building plan endorsement"
                                            meta="Approved 21 Jan 2023"
                                        />
                                        <ResultRow
                                            icon={
                                                <FileText className="size-4 shrink-0 text-muted-foreground" />
                                            }
                                            name="Fire safety clearance"
                                            meta="Approved 04 Nov 2022"
                                            muted
                                        />
                                    </div>
                                </div>

                                {/* Floating location chip */}
                                <div className="absolute -bottom-10 left-2 w-60 rounded-lg border border-border bg-card p-3 shadow-lg sm:-left-8">
                                    <div className="flex items-center gap-2">
                                        <MapPin className="size-4 text-muted-foreground" />
                                        <span className="truncate text-xs font-medium">
                                            Paper original
                                        </span>
                                    </div>
                                    <p className="mt-1.5 text-xs text-muted-foreground">
                                        Central storage building — moved 4 Feb
                                        2026
                                    </p>
                                </div>

                                {/* Floating role chip */}
                                <div className="absolute -top-4 -right-2 flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 shadow-lg sm:-right-6">
                                    <ShieldCheck className="size-4 text-muted-foreground" />
                                    <span className="text-xs font-medium">
                                        Editor
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                        Records section
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
                                    Built to make work findable, not to
                                    eliminate work
                                </h2>
                                <p className="mt-4 text-lg text-muted-foreground">
                                    Where the choice was between less staff
                                    effort and more reliable data, this system
                                    chose reliable data.
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
                                    Reading is open. Changing is not.
                                </h2>
                                <p className="mt-4 text-lg text-muted-foreground">
                                    Any staff account can read anything — the
                                    storage room was never locked to
                                    individuals. Every change, though, has a
                                    named owner.
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
                                        The records never leave the building
                                    </h2>
                                    <p className="mt-4 text-lg text-muted-foreground">
                                        This is sensitive business information
                                        the office wants kept physically on
                                        site. The server runs on the office
                                        network, and nothing is ever public.
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
                                        Stop searching the room. Start searching
                                        the index.
                                    </h2>
                                    <p className="text-lg text-primary-foreground/80">
                                        Sign in with the account your
                                        administrator set up, and find out in
                                        seconds what used to take half an hour.
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
                                                ? 'Open the archive'
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
                        <p className="flex items-center gap-1.5">
                            <Users className="size-4" />
                            An index over the office&rsquo;s paper archive.
                        </p>
                    </div>
                </footer>
            </div>
        </>
    );
}
