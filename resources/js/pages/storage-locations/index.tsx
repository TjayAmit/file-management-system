import { Form, Head } from '@inertiajs/react';
import { Plus, Warehouse } from 'lucide-react';
import { useState } from 'react';
import EmptyState from '@/components/empty-state';
import FlashMessage from '@/components/flash-message';
import InputError from '@/components/input-error';
import PageHeader from '@/components/page-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import admin from '@/routes/admin';
import storageLocations from '@/routes/storage-locations';

type StorageLocationItem = {
    id: number;
    name: string;
    documents_count?: number;
};

export default function StorageLocationIndex({
    storageLocations: locations,
    can,
}: {
    storageLocations: StorageLocationItem[];
    can: { manage: boolean };
}) {
    const [editing, setEditing] = useState<number | null>(null);

    return (
        <>
            <Head title="Storage locations" />
            <div className="flex flex-1 flex-col gap-6 p-6">
                <PageHeader
                    title="Storage locations"
                    description="The places a paper original can be: the office itself, or the central storage building across the city."
                />

                <FlashMessage />

                {can.manage && (
                    <section className="rounded-xl border border-border bg-card lg:max-w-xl">
                        <header className="border-b border-border px-5 py-4">
                            <h2 className="font-semibold">Add a location</h2>
                            <p className="mt-1 text-sm text-muted-foreground">
                                Only an admin defines where paper can live.
                            </p>
                        </header>
                        <Form
                            {...admin.storageLocations.store.form()}
                            resetOnSuccess
                            className="grid gap-2 p-5"
                        >
                            {({ processing, errors }) => (
                                <>
                                    <Label htmlFor="name">Location name</Label>
                                    <Input
                                        id="name"
                                        name="name"
                                        placeholder="e.g. Central storage building"
                                        aria-invalid={Boolean(errors.name)}
                                    />
                                    <InputError message={errors.name} />
                                    <Button
                                        type="submit"
                                        disabled={processing}
                                        className="justify-self-start"
                                    >
                                        <Plus />
                                        Create location
                                    </Button>
                                </>
                            )}
                        </Form>
                    </section>
                )}

                <section className="rounded-xl border border-border bg-card">
                    {locations.length === 0 ? (
                        <EmptyState
                            icon={Warehouse}
                            title="No storage locations defined"
                            description="Without at least one location, a document cannot say where its paper original is."
                        />
                    ) : (
                        <ul className="divide-y divide-border">
                            {locations.map((location) => (
                                <li key={location.id} className="px-5 py-3">
                                    <div className="flex items-center justify-between gap-3">
                                        <div className="flex min-w-0 items-center gap-3">
                                            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                                                <Warehouse className="size-4" />
                                            </span>
                                            <span className="truncate font-medium">
                                                {location.name}
                                            </span>
                                        </div>
                                        <div className="flex shrink-0 items-center gap-2">
                                            {location.documents_count !==
                                                undefined && (
                                                <Badge
                                                    variant="secondary"
                                                    className="rounded-full font-normal"
                                                >
                                                    {location.documents_count}{' '}
                                                    documents
                                                </Badge>
                                            )}
                                            {can.manage && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() =>
                                                        setEditing(
                                                            editing ===
                                                                location.id
                                                                ? null
                                                                : location.id,
                                                        )
                                                    }
                                                >
                                                    {editing === location.id
                                                        ? 'Cancel'
                                                        : 'Rename'}
                                                </Button>
                                            )}
                                        </div>
                                    </div>

                                    {can.manage && editing === location.id && (
                                        <Form
                                            {...admin.storageLocations.update.form(
                                                location.id,
                                            )}
                                            onSuccess={() => setEditing(null)}
                                            className="mt-3 flex items-end gap-2"
                                        >
                                            {({ processing, errors }) => (
                                                <>
                                                    <div className="grid flex-1 gap-1.5">
                                                        <Label
                                                            htmlFor={`name-${location.id}`}
                                                        >
                                                            New name
                                                        </Label>
                                                        <Input
                                                            id={`name-${location.id}`}
                                                            name="name"
                                                            defaultValue={
                                                                location.name
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

StorageLocationIndex.layout = {
    breadcrumbs: [
        { title: 'Storage locations', href: storageLocations.index() },
    ],
};
