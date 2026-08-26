import { Form, Head, router } from '@inertiajs/react';
import { GitMerge, MapPin, MoveRight, Plus } from 'lucide-react';
import { useState } from 'react';
import EmptyState from '@/components/empty-state';
import FlashMessage from '@/components/flash-message';
import InputError from '@/components/input-error';
import PageHeader from '@/components/page-header';
import TypeaheadInput from '@/components/typeahead-input';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { NativeSelect } from '@/components/ui/native-select';
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
    const [editing, setEditing] = useState<number | null>(null);
    const [reparenting, setReparenting] = useState<number | null>(null);
    const [locationDraft, setLocationDraft] = useState('');

    const suggestions = branchList.map((branch) => ({
        id: branch.id,
        label: branch.location,
        hint: branch.business?.name,
    }));

    return (
        <>
            <Head title="Branches" />
            <div className="flex flex-1 flex-col gap-6 p-6">
                <PageHeader
                    title="Branches"
                    description="A branch is one building at a fixed address — the unit a document actually files under."
                />

                <FlashMessage />

                {can.manage && (
                    <section className="grid gap-6 lg:grid-cols-2">
                        <div className="rounded-xl border border-border bg-card">
                            <header className="border-b border-border px-5 py-4">
                                <h2 className="font-semibold">Add a branch</h2>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    Existing branches surface as you type, so
                                    &ldquo;Rizal St&rdquo; and &ldquo;Rizal
                                    Street&rdquo; do not become two buildings.
                                </p>
                            </header>
                            <Form
                                {...branches.store.form()}
                                resetOnSuccess
                                onSuccess={() => setLocationDraft('')}
                                className="grid gap-4 p-5"
                            >
                                {({ processing, errors }) => (
                                    <>
                                        <div className="grid gap-1.5">
                                            <Label htmlFor="business_id">
                                                Business
                                            </Label>
                                            <NativeSelect
                                                id="business_id"
                                                name="business_id"
                                            >
                                                {businesses.map((business) => (
                                                    <option
                                                        key={business.id}
                                                        value={business.id}
                                                    >
                                                        {business.name}
                                                    </option>
                                                ))}
                                            </NativeSelect>
                                            <InputError
                                                message={errors.business_id}
                                            />
                                        </div>

                                        <div className="grid gap-1.5">
                                            <Label htmlFor="location">
                                                Address / location
                                            </Label>
                                            <TypeaheadInput
                                                id="location"
                                                name="location"
                                                options={suggestions}
                                                value={locationDraft}
                                                selectedId={null}
                                                onChange={setLocationDraft}
                                                onSelect={() => {}}
                                                placeholder="e.g. 14 Rizal Street"
                                                invalid={Boolean(
                                                    errors.location,
                                                )}
                                            />
                                            <InputError
                                                message={errors.location}
                                            />
                                        </div>

                                        <Button
                                            type="submit"
                                            disabled={processing}
                                            className="justify-self-start"
                                        >
                                            <Plus />
                                            Create branch
                                        </Button>
                                    </>
                                )}
                            </Form>
                        </div>

                        {can.merge && branchList.length > 1 && (
                            <div className="rounded-xl border border-border bg-card">
                                <header className="border-b border-border px-5 py-4">
                                    <h2 className="font-semibold">
                                        Merge duplicate branches
                                    </h2>
                                    <p className="mt-1 text-sm text-muted-foreground">
                                        Documents move to the branch you keep.
                                    </p>
                                </header>
                                <Form
                                    {...branches.merge.form()}
                                    className="grid gap-3 p-5 sm:grid-cols-2"
                                >
                                    {({ processing, errors }) => (
                                        <>
                                            <div className="grid gap-1.5">
                                                <Label htmlFor="source_branch_id">
                                                    Duplicate
                                                </Label>
                                                <NativeSelect
                                                    id="source_branch_id"
                                                    name="source_branch_id"
                                                >
                                                    {branchList.map(
                                                        (branch) => (
                                                            <option
                                                                key={branch.id}
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
                                                <InputError
                                                    message={
                                                        errors.source_branch_id
                                                    }
                                                />
                                            </div>
                                            <div className="grid gap-1.5">
                                                <Label htmlFor="target_branch_id">
                                                    Keep
                                                </Label>
                                                <NativeSelect
                                                    id="target_branch_id"
                                                    name="target_branch_id"
                                                >
                                                    {branchList.map(
                                                        (branch) => (
                                                            <option
                                                                key={branch.id}
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
                                                <InputError
                                                    message={
                                                        errors.target_branch_id
                                                    }
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
                    <header className="flex flex-wrap items-end gap-3 border-b border-border p-4">
                        <div className="grid gap-1.5">
                            <Label htmlFor="business_filter">
                                Filter by business
                            </Label>
                            <NativeSelect
                                id="business_filter"
                                value={filters.business_id ?? ''}
                                onChange={(event) =>
                                    router.get(
                                        branches.index.url(),
                                        event.target.value
                                            ? {
                                                  business_id:
                                                      event.target.value,
                                              }
                                            : {},
                                        { preserveState: true, replace: true },
                                    )
                                }
                            >
                                <option value="">All businesses</option>
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
                    </header>

                    {branchList.length === 0 ? (
                        <EmptyState
                            icon={MapPin}
                            title="No branches on file"
                            description="A branch is born the first time a document from that building is encoded."
                        />
                    ) : (
                        <ul className="divide-y divide-border">
                            {branchList.map((branch) => (
                                <li key={branch.id} className="px-5 py-3">
                                    <div className="flex items-center justify-between gap-3">
                                        <div className="min-w-0">
                                            <p className="truncate font-medium">
                                                {branch.location}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {branch.business?.name ??
                                                    'No business'}
                                            </p>
                                        </div>
                                        {can.manage && (
                                            <div className="flex shrink-0 items-center gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => {
                                                        setReparenting(null);
                                                        setEditing(
                                                            editing ===
                                                                branch.id
                                                                ? null
                                                                : branch.id,
                                                        );
                                                    }}
                                                >
                                                    Rename
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => {
                                                        setEditing(null);
                                                        setReparenting(
                                                            reparenting ===
                                                                branch.id
                                                                ? null
                                                                : branch.id,
                                                        );
                                                    }}
                                                >
                                                    <MoveRight />
                                                    Move
                                                </Button>
                                            </div>
                                        )}
                                    </div>

                                    {can.manage && editing === branch.id && (
                                        <Form
                                            {...branches.update.form(branch.id)}
                                            onSuccess={() => setEditing(null)}
                                            className="mt-3 flex items-end gap-2"
                                        >
                                            {({ processing, errors }) => (
                                                <>
                                                    <div className="grid flex-1 gap-1.5">
                                                        <Label
                                                            htmlFor={`location-${branch.id}`}
                                                        >
                                                            New address
                                                        </Label>
                                                        <Input
                                                            id={`location-${branch.id}`}
                                                            name="location"
                                                            defaultValue={
                                                                branch.location
                                                            }
                                                        />
                                                        <InputError
                                                            message={
                                                                errors.location
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

                                    {can.manage &&
                                        reparenting === branch.id && (
                                            <Form
                                                {...branches.reparent.form(
                                                    branch.id,
                                                )}
                                                onSuccess={() =>
                                                    setReparenting(null)
                                                }
                                                className="mt-3 flex items-end gap-2"
                                            >
                                                {({ processing, errors }) => (
                                                    <>
                                                        <div className="grid flex-1 gap-1.5">
                                                            <Label
                                                                htmlFor={`new_business_id-${branch.id}`}
                                                            >
                                                                Move under
                                                            </Label>
                                                            <NativeSelect
                                                                id={`new_business_id-${branch.id}`}
                                                                name="new_business_id"
                                                                defaultValue={
                                                                    branch
                                                                        .business
                                                                        ?.id
                                                                }
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
                                                            <InputError
                                                                message={
                                                                    errors.new_business_id
                                                                }
                                                            />
                                                        </div>
                                                        <Button
                                                            type="submit"
                                                            size="sm"
                                                            disabled={
                                                                processing
                                                            }
                                                        >
                                                            Re-parent
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

BranchIndex.layout = {
    breadcrumbs: [{ title: 'Branches', href: branches.index() }],
};
