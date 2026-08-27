import { Head, router } from '@inertiajs/react';
import {
    Building2,
    Check,
    GitMerge,
    MapPin,
    MoveRight,
    Pencil,
    Plus,
    Search,
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
import TypeaheadInput from '@/components/typeahead-input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { NativeSelect } from '@/components/ui/native-select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import branches from '@/routes/branches';

type BusinessItem = { id: number; name: string };

type BranchItem = {
    id: number;
    location: string;
    business?: BusinessItem | null;
};

export default function BranchIndex({
    branches: branchList,
    businesses,
    filters,
    can,
}: {
    branches: BranchItem[];
    businesses: BusinessItem[];
    filters: { business_id: number | null; query: string };
    can: { manage: boolean; merge: boolean };
}) {
    const [locationDraft, setLocationDraft] = useState('');
    const [query, setQuery] = useState(filters.query);

    const suggestions = branchList.map((branch) => ({
        id: branch.id,
        label: branch.location,
        hint: branch.business?.name,
    }));

    const hasFilters = filters.business_id !== null || filters.query !== '';

    function applyFilters(overrides: Record<string, string | number | null>) {
        const merged: Record<string, string | number | null> = {
            business_id: filters.business_id,
            query,
            ...overrides,
        };

        const next: Record<string, string | number> = {};

        for (const [key, value] of Object.entries(merged)) {
            if (value !== null && value !== '') {
                next[key] = value;
            }
        }

        router.get(branches.index.url(), next, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    }

    function submitSearch(event: FormEvent) {
        event.preventDefault();
        applyFilters({});
    }

    return (
        <>
            <Head title="Branch Locations" />
            <PageContainer>
                <PageHeader
                    title="Branch Locations"
                    icon={MapPin}
                    description="A branch is one physical premises at a fixed address — the municipal entity individual documents file under."
                    badge={
                        <Badge variant="secondary" className="rounded-full">
                            {branchList.length} branch
                            {branchList.length === 1 ? '' : 'es'}
                        </Badge>
                    }
                    actions={
                        can.manage && (
                            <div className="flex flex-wrap items-center gap-2">
                                {can.merge && branchList.length > 1 && (
                                    <FormDialog
                                        trigger={
                                            <Button variant="outline">
                                                <GitMerge className="size-4" />
                                                Merge duplicates
                                            </Button>
                                        }
                                        title="Merge duplicate branches"
                                        description="Two records for one building split its paper trail in half. Merging puts it back together."
                                        icon={GitMerge}
                                        form={branches.merge.form()}
                                        submitLabel="Merge branches"
                                        submitIcon={GitMerge}
                                        submitVariant="destructive"
                                        size="md"
                                        footerNote="This cannot be undone."
                                    >
                                        {({ errors }) => (
                                            <>
                                                <Callout
                                                    tone="warning"
                                                    title="Documents move to the branch you keep"
                                                >
                                                    The duplicate is retired and
                                                    every document registered
                                                    under it transfers to the
                                                    primary. Confirm the
                                                    direction before you submit.
                                                </Callout>

                                                <FormField
                                                    label="Duplicate to retire"
                                                    error={
                                                        errors.source_branch_id
                                                    }
                                                    required
                                                >
                                                    {({
                                                        id,
                                                        describedBy,
                                                        invalid,
                                                    }) => (
                                                        <NativeSelect
                                                            id={id}
                                                            name="source_branch_id"
                                                            aria-describedby={
                                                                describedBy
                                                            }
                                                            aria-invalid={
                                                                invalid
                                                            }
                                                            className="bg-card"
                                                        >
                                                            {branchList.map(
                                                                (branch) => (
                                                                    <option
                                                                        key={
                                                                            branch.id
                                                                        }
                                                                        value={
                                                                            branch.id
                                                                        }
                                                                    >
                                                                        {
                                                                            branch.location
                                                                        }
                                                                    </option>
                                                                ),
                                                            )}
                                                        </NativeSelect>
                                                    )}
                                                </FormField>

                                                <FormField
                                                    label="Primary to keep"
                                                    error={
                                                        errors.target_branch_id
                                                    }
                                                    required
                                                >
                                                    {({
                                                        id,
                                                        describedBy,
                                                        invalid,
                                                    }) => (
                                                        <NativeSelect
                                                            id={id}
                                                            name="target_branch_id"
                                                            aria-describedby={
                                                                describedBy
                                                            }
                                                            aria-invalid={
                                                                invalid
                                                            }
                                                            className="bg-card"
                                                        >
                                                            {branchList.map(
                                                                (branch) => (
                                                                    <option
                                                                        key={
                                                                            branch.id
                                                                        }
                                                                        value={
                                                                            branch.id
                                                                        }
                                                                    >
                                                                        {
                                                                            branch.location
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
                                            Register branch
                                        </Button>
                                    }
                                    title="Register new branch"
                                    description="Existing addresses suggest as you type, so the same building does not end up filed twice."
                                    icon={MapPin}
                                    form={branches.store.form()}
                                    submitLabel="Create branch"
                                    submitIcon={Plus}
                                    resetOnSuccess
                                    onOpenChange={(open) => {
                                        if (!open) {
                                            setLocationDraft('');
                                        }
                                    }}
                                >
                                    {({ errors }) => (
                                        <>
                                            <FormField
                                                label="Parent business"
                                                error={errors.business_id}
                                                required
                                            >
                                                {({
                                                    id,
                                                    describedBy,
                                                    invalid,
                                                }) => (
                                                    <NativeSelect
                                                        id={id}
                                                        name="business_id"
                                                        defaultValue={
                                                            filters.business_id ??
                                                            undefined
                                                        }
                                                        aria-describedby={
                                                            describedBy
                                                        }
                                                        aria-invalid={invalid}
                                                        className="bg-card"
                                                    >
                                                        {businesses.map(
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
                                                label="Address or location"
                                                error={errors.location}
                                                required
                                                hint="Street and building, as it appears on the paperwork."
                                            >
                                                {({ id, invalid }) => (
                                                    <TypeaheadInput
                                                        id={id}
                                                        name="location"
                                                        options={suggestions}
                                                        value={locationDraft}
                                                        selectedId={null}
                                                        onChange={
                                                            setLocationDraft
                                                        }
                                                        onSelect={() => {}}
                                                        placeholder="e.g. 14 Rizal Street, Building B"
                                                        invalid={invalid}
                                                    />
                                                )}
                                            </FormField>
                                        </>
                                    )}
                                </FormDialog>
                            </div>
                        )
                    }
                />

                <SectionCard>
                    <SectionCardHeader
                        title="Registered premises"
                        description="Filter down to one business, or search the addresses directly."
                        icon={Building2}
                    />

                    <SectionToolbar>
                        <form
                            onSubmit={submitSearch}
                            className="flex min-w-64 flex-1 items-end gap-3"
                        >
                            <div className="grid min-w-56 flex-1 gap-1.5">
                                <Label
                                    htmlFor="branch-query"
                                    className="text-xs font-semibold tracking-wide text-muted-foreground uppercase"
                                >
                                    Search addresses
                                </Label>
                                <div className="relative">
                                    <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        id="branch-query"
                                        value={query}
                                        onChange={(event) =>
                                            setQuery(event.target.value)
                                        }
                                        placeholder="Street, building, or landmark…"
                                        className="bg-card pl-9"
                                    />
                                </div>
                            </div>
                            <Button type="submit" variant="outline">
                                <Search className="size-4" />
                                Search
                            </Button>
                        </form>

                        <div className="grid min-w-56 gap-1.5">
                            <Label
                                htmlFor="business_filter"
                                className="text-xs font-semibold tracking-wide text-muted-foreground uppercase"
                            >
                                Parent business
                            </Label>
                            <NativeSelect
                                id="business_filter"
                                value={filters.business_id ?? ''}
                                onChange={(event) =>
                                    applyFilters({
                                        business_id: event.target.value || null,
                                    })
                                }
                                className="bg-card"
                            >
                                <option value="">
                                    All businesses ({businesses.length})
                                </option>
                                {businesses.map((business) => (
                                    <option
                                        key={business.id}
                                        value={business.id}
                                    >
                                        {business.name}
                                    </option>
                                ))}
                            </NativeSelect>
                        </div>

                        {hasFilters && (
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => {
                                    setQuery('');
                                    router.get(
                                        branches.index.url(),
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
                    </SectionToolbar>

                    {branchList.length === 0 ? (
                        <EmptyState
                            icon={MapPin}
                            title={
                                hasFilters
                                    ? 'No branch matches these filters'
                                    : 'No branches registered'
                            }
                            description={
                                hasFilters
                                    ? 'Broaden the address search, or clear the business filter to see every premises on file.'
                                    : 'Branches are created as staff encode physical papers or assign buildings to businesses.'
                            }
                        />
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader className="bg-muted/30">
                                    <TableRow className="hover:bg-transparent">
                                        <TableHead className="min-w-72 px-5 text-xs font-semibold tracking-wide text-muted-foreground uppercase sm:px-6">
                                            Address
                                        </TableHead>
                                        <TableHead className="min-w-56 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                                            Parent business
                                        </TableHead>
                                        <TableHead className="w-24 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                                            Ref
                                        </TableHead>
                                        {can.manage && (
                                            <TableHead className="w-56 px-5 text-right text-xs font-semibold tracking-wide text-muted-foreground uppercase sm:px-6">
                                                Actions
                                            </TableHead>
                                        )}
                                    </TableRow>
                                </TableHeader>
                                <TableBody className="stagger">
                                    {branchList.map((branch) => (
                                        <TableRow
                                            key={branch.id}
                                            className="border-border/60 transition-colors hover:bg-muted/40"
                                        >
                                            <TableCell className="px-5 py-3.5 sm:px-6">
                                                <div className="flex min-w-0 items-center gap-3">
                                                    <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                                        <MapPin className="size-3.5" />
                                                    </span>
                                                    <span className="truncate font-medium text-foreground">
                                                        {branch.location}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                                    <Building2 className="size-3.5 shrink-0" />
                                                    <span className="truncate">
                                                        {branch.business
                                                            ?.name ??
                                                            'Unassigned'}
                                                    </span>
                                                </span>
                                            </TableCell>
                                            <TableCell className="font-mono text-xs text-muted-foreground">
                                                #{branch.id}
                                            </TableCell>
                                            {can.manage && (
                                                <TableCell className="px-5 py-3.5 text-right sm:px-6">
                                                    <div className="flex items-center justify-end gap-1.5">
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
                                                            title="Rename branch"
                                                            description="Correct the street address. Every document filed here follows it."
                                                            icon={Pencil}
                                                            form={branches.update.form(
                                                                branch.id,
                                                            )}
                                                            submitLabel="Save address"
                                                            submitIcon={Check}
                                                        >
                                                            {({ errors }) => (
                                                                <FormField
                                                                    label="Street address"
                                                                    error={
                                                                        errors.location
                                                                    }
                                                                    required
                                                                >
                                                                    {({
                                                                        id,
                                                                        describedBy,
                                                                        invalid,
                                                                    }) => (
                                                                        <Input
                                                                            id={
                                                                                id
                                                                            }
                                                                            name="location"
                                                                            autoFocus
                                                                            defaultValue={
                                                                                branch.location
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

                                                        <FormDialog
                                                            trigger={
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                >
                                                                    <MoveRight className="size-3.5" />
                                                                    Re-parent
                                                                </Button>
                                                            }
                                                            title="Move branch to another business"
                                                            description={`"${branch.location}" and every document filed under it will move.`}
                                                            icon={MoveRight}
                                                            form={branches.reparent.form(
                                                                branch.id,
                                                            )}
                                                            submitLabel="Confirm move"
                                                            submitIcon={
                                                                MoveRight
                                                            }
                                                        >
                                                            {({ errors }) => (
                                                                <>
                                                                    <Callout
                                                                        tone="warning"
                                                                        title="Currently filed under"
                                                                    >
                                                                        {branch
                                                                            .business
                                                                            ?.name ??
                                                                            'No business'}
                                                                    </Callout>

                                                                    <FormField
                                                                        label="New parent business"
                                                                        error={
                                                                            errors.new_business_id
                                                                        }
                                                                        required
                                                                    >
                                                                        {({
                                                                            id,
                                                                            describedBy,
                                                                            invalid,
                                                                        }) => (
                                                                            <NativeSelect
                                                                                id={
                                                                                    id
                                                                                }
                                                                                name="new_business_id"
                                                                                defaultValue={
                                                                                    branch
                                                                                        .business
                                                                                        ?.id
                                                                                }
                                                                                aria-describedby={
                                                                                    describedBy
                                                                                }
                                                                                aria-invalid={
                                                                                    invalid
                                                                                }
                                                                                className="bg-card"
                                                                            >
                                                                                {businesses.map(
                                                                                    (
                                                                                        business,
                                                                                    ) => (
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
                                                    </div>
                                                </TableCell>
                                            )}
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </SectionCard>
            </PageContainer>
        </>
    );
}

BranchIndex.layout = {
    breadcrumbs: [{ title: 'Branches', href: branches.index() }],
};
