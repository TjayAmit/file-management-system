import { Head, router } from '@inertiajs/react';
import {
    Building2,
    Check,
    GitMerge,
    MapPin,
    Pencil,
    Plus,
    Search,
    Upload,
    X,
} from 'lucide-react';
import type { FormEvent } from 'react';
import { useState } from 'react';
import Callout from '@/components/callout';
import EmptyState from '@/components/empty-state';
import FormDialog from '@/components/form-dialog';
import FormField from '@/components/form-field';
import PageContainer from '@/components/page-container';
import PageHeader from '@/components/page-header';
import {
    SectionCard,
    SectionCardHeader,
    SectionToolbar,
} from '@/components/section-card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogBody,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { NativeSelect } from '@/components/ui/native-select';
import { Textarea } from '@/components/ui/textarea';
import businesses from '@/routes/businesses';

type BranchItem = { id: number; location: string };

type BusinessItem = {
    id: number;
    name: string;
    branches?: BranchItem[];
};

export default function BusinessIndex({
    businesses: businessList,
    filters,
    can,
}: {
    businesses: BusinessItem[];
    filters: { query: string };
    can: { manage: boolean; merge: boolean };
}) {
    const [query, setQuery] = useState(filters.query);
    const [rowsText, setRowsText] = useState('');
    const [seeding, setSeeding] = useState(false);
    const [seedOpen, setSeedOpen] = useState(false);

    const parsedSeedRows = rowsText
        .split('\n')
        .map((line) => line.trim())
        .filter((line) => line !== '')
        .map((line) => {
            const [name, branch] = line.split('|').map((part) => part.trim());

            return { name, branch: branch || null };
        });

    function runSearch(event: FormEvent) {
        event.preventDefault();
        router.get(businesses.index.url(), query ? { query } : {}, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    }

    function seed(event: FormEvent) {
        event.preventDefault();
        setSeeding(true);

        router.post(
            businesses.bulkSeed.url(),
            { rows: parsedSeedRows },
            {
                onFinish: () => setSeeding(false),
                onSuccess: () => {
                    setRowsText('');
                    setSeedOpen(false);
                },
            },
        );
    }

    return (
        <>
            <Head title="Registered Businesses" />
            <PageContainer>
                <PageHeader
                    title="Known Businesses"
                    icon={Building2}
                    description="The authoritative registry behind every search verdict: if a business is listed here, records for it exist somewhere — on disk or on paper."
                    badge={
                        <Badge variant="secondary" className="rounded-full">
                            {businessList.length} registered
                        </Badge>
                    }
                    actions={
                        can.manage && (
                            <div className="flex flex-wrap items-center gap-2">
                                <Dialog
                                    open={seedOpen}
                                    onOpenChange={setSeedOpen}
                                >
                                    <DialogTrigger asChild>
                                        <Button variant="outline">
                                            <Upload className="size-4" />
                                            Bulk seed
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent size="lg">
                                        <form
                                            onSubmit={seed}
                                            className="contents"
                                        >
                                            <DialogHeader>
                                                <div className="flex items-start gap-3">
                                                    <span className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary">
                                                        <Upload className="size-4.5" />
                                                    </span>
                                                    <div className="min-w-0 space-y-1">
                                                        <DialogTitle>
                                                            Bulk seed businesses
                                                            and branches
                                                        </DialogTitle>
                                                        <DialogDescription>
                                                            Paste one entry per
                                                            line. Existing
                                                            entries are left
                                                            untouched, so a
                                                            re-run is safe.
                                                        </DialogDescription>
                                                    </div>
                                                </div>
                                            </DialogHeader>

                                            <DialogBody className="grid gap-4">
                                                <Callout
                                                    tone="primary"
                                                    title="Line format"
                                                >
                                                    <code className="rounded bg-muted px-1.5 py-0.5 font-mono">
                                                        Business Name
                                                    </code>{' '}
                                                    on its own, or{' '}
                                                    <code className="rounded bg-muted px-1.5 py-0.5 font-mono">
                                                        Business Name | Branch
                                                        Location
                                                    </code>{' '}
                                                    to create the branch at the
                                                    same time.
                                                </Callout>

                                                <div className="grid gap-1.5">
                                                    <Label htmlFor="seed-rows">
                                                        Entries
                                                    </Label>
                                                    <Textarea
                                                        id="seed-rows"
                                                        value={rowsText}
                                                        onChange={(event) =>
                                                            setRowsText(
                                                                event.target
                                                                    .value,
                                                            )
                                                        }
                                                        rows={10}
                                                        placeholder={
                                                            'Acme Corporation | Main Branch\nGlobal Logistics | Warehouse Annex\nMetro Properties'
                                                        }
                                                        className="scroll-slim bg-card font-mono text-xs"
                                                    />
                                                </div>
                                            </DialogBody>

                                            <DialogFooter className="sm:justify-between">
                                                <p className="text-xs text-muted-foreground tabular-nums">
                                                    {parsedSeedRows.length} entr
                                                    {parsedSeedRows.length === 1
                                                        ? 'y'
                                                        : 'ies'}{' '}
                                                    ready
                                                </p>
                                                <div className="flex flex-col-reverse gap-2.5 sm:flex-row sm:items-center">
                                                    <DialogClose asChild>
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            disabled={seeding}
                                                        >
                                                            Cancel
                                                        </Button>
                                                    </DialogClose>
                                                    <Button
                                                        type="submit"
                                                        pending={seeding}
                                                        disabled={
                                                            parsedSeedRows.length ===
                                                            0
                                                        }
                                                    >
                                                        {!seeding && (
                                                            <Upload className="size-4" />
                                                        )}
                                                        Seed businesses
                                                    </Button>
                                                </div>
                                            </DialogFooter>
                                        </form>
                                    </DialogContent>
                                </Dialog>

                                {can.merge && businessList.length > 1 && (
                                    <FormDialog
                                        trigger={
                                            <Button variant="outline">
                                                <GitMerge className="size-4" />
                                                Merge duplicates
                                            </Button>
                                        }
                                        title="Merge duplicate business records"
                                        description="One business filed twice means half its documents are invisible to a search for the other spelling."
                                        icon={GitMerge}
                                        form={businesses.merge.form()}
                                        submitLabel="Merge businesses"
                                        submitIcon={GitMerge}
                                        submitVariant="destructive"
                                        size="md"
                                        footerNote="This cannot be undone."
                                    >
                                        {({ errors }) => (
                                            <>
                                                <Callout
                                                    tone="warning"
                                                    title="Branches transfer to the record you keep"
                                                >
                                                    The duplicate is
                                                    consolidated away and every
                                                    branch beneath it — with all
                                                    of their documents — moves
                                                    to the primary record.
                                                </Callout>

                                                <FormField
                                                    label="Duplicate to retire"
                                                    error={errors.source_id}
                                                    required
                                                >
                                                    {({
                                                        id,
                                                        describedBy,
                                                        invalid,
                                                    }) => (
                                                        <NativeSelect
                                                            id={id}
                                                            name="source_id"
                                                            aria-describedby={
                                                                describedBy
                                                            }
                                                            aria-invalid={
                                                                invalid
                                                            }
                                                            className="bg-card"
                                                        >
                                                            {businessList.map(
                                                                (business) => (
                                                                    <option
                                                                        key={
                                                                            business.id
                                                                        }
                                                                        value={
                                                                            business.id
                                                                        }
                                                                    >
                                                                        {
                                                                            business.name
                                                                        }
                                                                    </option>
                                                                ),
                                                            )}
                                                        </NativeSelect>
                                                    )}
                                                </FormField>

                                                <FormField
                                                    label="Primary record to keep"
                                                    error={errors.target_id}
                                                    required
                                                >
                                                    {({
                                                        id,
                                                        describedBy,
                                                        invalid,
                                                    }) => (
                                                        <NativeSelect
                                                            id={id}
                                                            name="target_id"
                                                            aria-describedby={
                                                                describedBy
                                                            }
                                                            aria-invalid={
                                                                invalid
                                                            }
                                                            className="bg-card"
                                                        >
                                                            {businessList.map(
                                                                (business) => (
                                                                    <option
                                                                        key={
                                                                            business.id
                                                                        }
                                                                        value={
                                                                            business.id
                                                                        }
                                                                    >
                                                                        {
                                                                            business.name
                                                                        }
                                                                    </option>
                                                                ),
                                                            )}
                                                        </NativeSelect>
                                                    )}
                                                </FormField>
                                            </>
                                        )}
                                    </FormDialog>
                                )}

                                <FormDialog
                                    trigger={
                                        <Button>
                                            <Plus className="size-4" />
                                            Register business
                                        </Button>
                                    }
                                    title="Register single business"
                                    description="Check the spelling against the list first — a near-duplicate splits the record in two and both halves go missing."
                                    icon={Building2}
                                    form={businesses.store.form()}
                                    submitLabel="Register business"
                                    submitIcon={Plus}
                                    resetOnSuccess
                                >
                                    {({ errors }) => (
                                        <FormField
                                            label="Business legal name"
                                            error={errors.name}
                                            required
                                        >
                                            {({ id, describedBy, invalid }) => (
                                                <Input
                                                    id={id}
                                                    name="name"
                                                    autoFocus
                                                    aria-describedby={
                                                        describedBy
                                                    }
                                                    aria-invalid={invalid}
                                                    placeholder="e.g. Apex Universal Holdings"
                                                    className="bg-card"
                                                />
                                            )}
                                        </FormField>
                                    )}
                                </FormDialog>
                            </div>
                        )
                    }
                />

                <SectionCard>
                    <SectionCardHeader
                        title="Business registry"
                        description="Each card shows how many premises file beneath the business."
                        icon={Building2}
                    />

                    <SectionToolbar>
                        <form
                            onSubmit={runSearch}
                            className="flex min-w-64 flex-1 items-end gap-3"
                        >
                            <div className="grid min-w-56 flex-1 gap-1.5">
                                <Label
                                    htmlFor="query"
                                    className="text-xs font-semibold tracking-wide text-muted-foreground uppercase"
                                >
                                    Filter registered businesses
                                </Label>
                                <div className="relative">
                                    <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        id="query"
                                        value={query}
                                        onChange={(event) =>
                                            setQuery(event.target.value)
                                        }
                                        placeholder="Type a business name…"
                                        className="bg-card pl-9"
                                    />
                                </div>
                            </div>
                            <Button type="submit" variant="outline">
                                <Search className="size-4" />
                                Search
                            </Button>
                            {filters.query !== '' && (
                                <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={() => {
                                        setQuery('');
                                        router.get(
                                            businesses.index.url(),
                                            {},
                                            { replace: true },
                                        );
                                    }}
                                    className="text-muted-foreground hover:text-foreground"
                                >
                                    <X className="size-4" />
                                    Clear
                                </Button>
                            )}
                        </form>
                    </SectionToolbar>

                    {businessList.length === 0 ? (
                        <EmptyState
                            icon={Building2}
                            title={
                                filters.query
                                    ? 'No business matches this search'
                                    : 'No registered businesses on file'
                            }
                            description={
                                filters.query
                                    ? 'This is not a denial of existence — the business may be archived in paper ledgers under an older spelling.'
                                    : 'Seed or create businesses to build the municipal filing hierarchy.'
                            }
                        />
                    ) : (
                        <ul className="stagger grid gap-4 p-5 sm:grid-cols-2 sm:p-6 xl:grid-cols-3 2xl:grid-cols-4">
                            {businessList.map((business) => {
                                const branchCount =
                                    business.branches?.length ?? 0;

                                return (
                                    <li
                                        key={business.id}
                                        className="group flex min-w-0 flex-col justify-between gap-4 rounded-xl border border-border/80 bg-muted/15 p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/35 hover:bg-card hover:shadow-sm motion-reduce:hover:translate-y-0"
                                    >
                                        <div className="flex min-w-0 items-start gap-3">
                                            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary transition-colors group-hover:border-primary/35">
                                                <Building2 className="size-4.5" />
                                            </span>
                                            <div className="min-w-0 space-y-0.5">
                                                <p className="truncate font-semibold text-foreground">
                                                    {business.name}
                                                </p>
                                                <p className="font-mono text-xs text-muted-foreground">
                                                    #{business.id}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between gap-2 border-t border-border/60 pt-3">
                                            <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground tabular-nums">
                                                <MapPin className="size-3.5" />
                                                {branchCount} branch
                                                {branchCount === 1 ? '' : 'es'}
                                            </span>

                                            {can.manage && (
                                                <FormDialog
                                                    trigger={
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                        >
                                                            <Pencil className="size-3.5" />
                                                            Rename
                                                        </Button>
                                                    }
                                                    title="Rename business"
                                                    description="Branches and documents stay attached; only the name on the record changes."
                                                    icon={Pencil}
                                                    form={businesses.update.form(
                                                        business.id,
                                                    )}
                                                    submitLabel="Save name"
                                                    submitIcon={Check}
                                                >
                                                    {({ errors }) => (
                                                        <FormField
                                                            label="Legal name"
                                                            error={errors.name}
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
                                                                        business.name
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
                                                    )}
                                                </FormDialog>
                                            )}
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </SectionCard>
            </PageContainer>
        </>
    );
}

BusinessIndex.layout = {
    breadcrumbs: [{ title: 'Businesses', href: businesses.index() }],
};
