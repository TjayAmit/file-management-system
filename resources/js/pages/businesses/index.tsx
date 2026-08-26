import { Form, Head, router } from '@inertiajs/react';
import { Building2, GitMerge, Plus, Search, Upload } from 'lucide-react';
import type { FormEvent } from 'react';
import { useState } from 'react';
import EmptyState from '@/components/empty-state';
import FlashMessage from '@/components/flash-message';
import InputError from '@/components/input-error';
import PageHeader from '@/components/page-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
    const [showSeed, setShowSeed] = useState(false);
    const [editing, setEditing] = useState<number | null>(null);

    function runSearch(event: FormEvent) {
        event.preventDefault();
        router.get(businesses.index.url(), query ? { query } : {}, {
            preserveState: true,
            replace: true,
        });
    }

    function seed(event: FormEvent) {
        event.preventDefault();

        const rows = rowsText
            .split('\n')
            .map((line) => line.trim())
            .filter((line) => line !== '')
            .map((line) => {
                const [name, branch] = line
                    .split('|')
                    .map((part) => part.trim());

                return { name, branch: branch || null };
            });

        setSeeding(true);
        router.post(
            businesses.bulkSeed.url(),
            { rows },
            {
                onFinish: () => setSeeding(false),
                onSuccess: () => setRowsText(''),
            },
        );
    }

    return (
        <>
            <Head title="Businesses" />
            <div className="flex flex-1 flex-col gap-6 p-6">
                <PageHeader
                    title="Known businesses"
                    description="The list that turns a blank search into a directive: if a business is here, its papers exist somewhere."
                    actions={
                        can.manage && (
                            <Button
                                variant="outline"
                                onClick={() => setShowSeed((open) => !open)}
                            >
                                <Upload />
                                Bulk seed
                            </Button>
                        )
                    }
                />

                <FlashMessage />

                {can.manage && showSeed && (
                    <section className="rounded-xl border border-border bg-card">
                        <header className="border-b border-border px-5 py-4">
                            <h2 className="font-semibold">
                                Seed the known-business list
                            </h2>
                            <p className="mt-1 text-sm text-muted-foreground">
                                One entry per line:{' '}
                                <code className="rounded bg-muted px-1 py-0.5 text-xs">
                                    Business Name
                                </code>{' '}
                                or{' '}
                                <code className="rounded bg-muted px-1 py-0.5 text-xs">
                                    Business Name | Branch Location
                                </code>
                                . Entries that already exist are left untouched.
                            </p>
                        </header>
                        <form onSubmit={seed} className="grid gap-2 p-5">
                            <Textarea
                                value={rowsText}
                                onChange={(event) =>
                                    setRowsText(event.target.value)
                                }
                                rows={6}
                                placeholder={'Acme Corp | Main St\nJollibee'}
                            />
                            <Button
                                type="submit"
                                disabled={seeding}
                                className="justify-self-start"
                            >
                                Seed businesses
                            </Button>
                        </form>
                    </section>
                )}

                {can.manage && (
                    <section className="grid gap-6 lg:grid-cols-2">
                        <div className="rounded-xl border border-border bg-card">
                            <header className="border-b border-border px-5 py-4">
                                <h2 className="font-semibold">
                                    Add a business
                                </h2>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    Search the list first — a variant spelling
                                    splits one business into two.
                                </p>
                            </header>
                            <Form
                                {...businesses.store.form()}
                                resetOnSuccess
                                className="grid gap-2 p-5"
                            >
                                {({ processing, errors }) => (
                                    <>
                                        <Label htmlFor="name">
                                            Business name
                                        </Label>
                                        <Input
                                            id="name"
                                            name="name"
                                            placeholder="e.g. ABC Corporation"
                                            aria-invalid={Boolean(errors.name)}
                                        />
                                        <InputError message={errors.name} />
                                        <Button
                                            type="submit"
                                            disabled={processing}
                                            className="justify-self-start"
                                        >
                                            <Plus />
                                            Create business
                                        </Button>
                                    </>
                                )}
                            </Form>
                        </div>

                        {can.merge && businessList.length > 1 && (
                            <div className="rounded-xl border border-border bg-card">
                                <header className="border-b border-border px-5 py-4">
                                    <h2 className="font-semibold">
                                        Merge duplicates
                                    </h2>
                                    <p className="mt-1 text-sm text-muted-foreground">
                                        The duplicate is retired and its
                                        branches move to the one you keep.
                                    </p>
                                </header>
                                <Form
                                    {...businesses.merge.form()}
                                    className="grid gap-3 p-5 sm:grid-cols-2"
                                >
                                    {({ processing, errors }) => (
                                        <>
                                            <div className="grid gap-1.5">
                                                <Label htmlFor="source_id">
                                                    Duplicate
                                                </Label>
                                                <NativeSelect
                                                    id="source_id"
                                                    name="source_id"
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
                                                                {business.name}
                                                            </option>
                                                        ),
                                                    )}
                                                </NativeSelect>
                                                <InputError
                                                    message={errors.source_id}
                                                />
                                            </div>
                                            <div className="grid gap-1.5">
                                                <Label htmlFor="target_id">
                                                    Keep
                                                </Label>
                                                <NativeSelect
                                                    id="target_id"
                                                    name="target_id"
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
                                                                {business.name}
                                                            </option>
                                                        ),
                                                    )}
                                                </NativeSelect>
                                                <InputError
                                                    message={errors.target_id}
                                                />
                                            </div>
                                            <div className="sm:col-span-2">
                                                <Button
                                                    type="submit"
                                                    variant="outline"
                                                    disabled={processing}
                                                >
                                                    <GitMerge />
                                                    Merge
                                                </Button>
                                            </div>
                                        </>
                                    )}
                                </Form>
                            </div>
                        )}
                    </section>
                )}

                <section className="rounded-xl border border-border bg-card">
                    <form
                        onSubmit={runSearch}
                        className="flex items-end gap-2 border-b border-border p-4"
                    >
                        <div className="grid flex-1 gap-1.5">
                            <Label htmlFor="query">Find a business</Label>
                            <Input
                                id="query"
                                value={query}
                                onChange={(event) =>
                                    setQuery(event.target.value)
                                }
                                placeholder="Start typing a name"
                            />
                        </div>
                        <Button type="submit" variant="outline">
                            <Search />
                            Search
                        </Button>
                    </form>

                    {businessList.length === 0 ? (
                        <EmptyState
                            icon={Building2}
                            title={
                                filters.query
                                    ? 'Not in the known list'
                                    : 'No businesses yet'
                            }
                            description={
                                filters.query
                                    ? 'This is not a denial — the business may be older or inactive. Check the ledger.'
                                    : 'Seed the list before launch, then let it grow from what staff actually encounter.'
                            }
                        />
                    ) : (
                        <ul className="divide-y divide-border">
                            {businessList.map((business) => (
                                <li key={business.id} className="px-5 py-3">
                                    <div className="flex items-center justify-between gap-3">
                                        <div className="min-w-0">
                                            <p className="truncate font-medium">
                                                {business.name}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {business.branches?.length ?? 0}{' '}
                                                branch
                                                {business.branches?.length === 1
                                                    ? ''
                                                    : 'es'}
                                            </p>
                                        </div>
                                        <div className="flex shrink-0 items-center gap-2">
                                            <Badge
                                                variant="secondary"
                                                className="rounded-full font-normal"
                                            >
                                                #{business.id}
                                            </Badge>
                                            {can.manage && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() =>
                                                        setEditing(
                                                            editing ===
                                                                business.id
                                                                ? null
                                                                : business.id,
                                                        )
                                                    }
                                                >
                                                    {editing === business.id
                                                        ? 'Cancel'
                                                        : 'Rename'}
                                                </Button>
                                            )}
                                        </div>
                                    </div>

                                    {can.manage && editing === business.id && (
                                        <Form
                                            {...businesses.update.form(
                                                business.id,
                                            )}
                                            onSuccess={() => setEditing(null)}
                                            className="mt-3 flex items-end gap-2"
                                        >
                                            {({ processing, errors }) => (
                                                <>
                                                    <div className="grid flex-1 gap-1.5">
                                                        <Label
                                                            htmlFor={`name-${business.id}`}
                                                        >
                                                            New name
                                                        </Label>
                                                        <Input
                                                            id={`name-${business.id}`}
                                                            name="name"
                                                            defaultValue={
                                                                business.name
                                                            }
                                                        />
                                                        <InputError
                                                            message={
                                                                errors.name
                                                            }
                                                        />
                                                    </div>
                                                    <Button
                                                        type="submit"
                                                        size="sm"
                                                        disabled={processing}
                                                    >
                                                        Save
                                                    </Button>
                                                </>
                                            )}
                                        </Form>
                                    )}
                                </li>
                            ))}
                        </ul>
                    )}
                </section>
            </div>
        </>
    );
}

BusinessIndex.layout = {
    breadcrumbs: [{ title: 'Businesses', href: businesses.index() }],
};
