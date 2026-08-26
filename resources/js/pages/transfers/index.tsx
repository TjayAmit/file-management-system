import { Form, Head } from '@inertiajs/react';
import { ArrowRight, PackageCheck, Truck } from 'lucide-react';
import EmptyState from '@/components/empty-state';
import FlashMessage from '@/components/flash-message';
import InputError from '@/components/input-error';
import PageHeader from '@/components/page-header';
import type { Paginated } from '@/components/paginator';
import Paginator from '@/components/paginator';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { NativeSelect } from '@/components/ui/native-select';
import transfers from '@/routes/transfers';

type Named = { id: number; name: string };

type DocumentOption = {
    id: number;
    reference: string;
    title: string | null;
    branch?: {
        location: string;
        business?: { name: string } | null;
    } | null;
    storage_location?: Named | null;
};

type TransferItem = {
    id: number;
    document?: DocumentOption | null;
    from_storage_location?: Named | null;
};

type TransferRow = {
    id: number;
    note: string | null;
    transferred_at: string;
    items_count: number;
    target_location?: Named | null;
    performer?: { name: string } | null;
    items?: TransferItem[];
};

export default function TransferIndex({
    transfers: page,
    storageLocations,
    documents,
    can,
}: {
    transfers: Paginated<TransferRow>;
    storageLocations: Named[];
    documents: DocumentOption[];
    can: { transfer: boolean };
}) {
    return (
        <>
            <Head title="Transfers" />
            <div className="flex flex-1 flex-col gap-6 p-6">
                <PageHeader
                    title="Physical transfers"
                    description="Documents are consolidated into a batch, then moved. Each move is recorded so nobody has to remember where the paper went."
                />

                <FlashMessage />

                {can.transfer && (
                    <section className="rounded-xl border border-border bg-card">
                        <header className="flex items-center gap-2.5 border-b border-border px-5 py-4">
                            <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10">
                                <PackageCheck className="size-4" />
                            </span>
                            <div>
                                <h2 className="font-semibold">
                                    Stage a transfer batch
                                </h2>
                                <p className="text-sm text-muted-foreground">
                                    Tick the documents leaving, choose where
                                    they are going. A single document is a batch
                                    of one.
                                </p>
                            </div>
                        </header>

                        {documents.length === 0 ? (
                            <EmptyState
                                icon={Truck}
                                title="Nothing to move yet"
                                description="Encode a document before it can be transferred."
                            />
                        ) : (
                            <Form
                                {...transfers.store.form()}
                                className="grid gap-4 p-5"
                            >
                                {({ processing, errors }) => (
                                    <>
                                        <fieldset className="grid gap-2">
                                            <legend className="mb-2 text-sm font-medium">
                                                Documents in this batch
                                            </legend>
                                            <div className="max-h-72 divide-y divide-border overflow-y-auto rounded-lg border border-border">
                                                {documents.map((document) => (
                                                    <label
                                                        key={document.id}
                                                        className="flex cursor-pointer items-center gap-3 px-3 py-2.5 hover:bg-muted/50"
                                                    >
                                                        <Checkbox
                                                            name="references[]"
                                                            value={
                                                                document.reference
                                                            }
                                                        />
                                                        <span className="min-w-0 flex-1">
                                                            <span className="block truncate text-sm font-medium">
                                                                {document.title ??
                                                                    'Untitled'}
                                                            </span>
                                                            <span className="block truncate text-xs text-muted-foreground">
                                                                {document.branch
                                                                    ?.business
                                                                    ?.name ??
                                                                    'Unknown business'}{' '}
                                                                &middot;{' '}
                                                                {document.branch
                                                                    ?.location ??
                                                                    'no branch'}
                                                            </span>
                                                        </span>
                                                        <Badge
                                                            variant="secondary"
                                                            className="shrink-0 rounded-full font-normal"
                                                        >
                                                            {document
                                                                .storage_location
                                                                ?.name ??
                                                                'Unknown'}
                                                        </Badge>
                                                    </label>
                                                ))}
                                            </div>
                                            <InputError
                                                message={errors.references}
                                            />
                                        </fieldset>

                                        <div className="grid gap-4 sm:grid-cols-2">
                                            <div className="grid gap-1.5">
                                                <Label htmlFor="to_storage_location_id">
                                                    Moving to
                                                </Label>
                                                <NativeSelect
                                                    id="to_storage_location_id"
                                                    name="to_storage_location_id"
                                                >
                                                    {storageLocations.map(
                                                        (location) => (
                                                            <option
                                                                key={
                                                                    location.id
                                                                }
                                                                value={
                                                                    location.id
                                                                }
                                                            >
                                                                {location.name}
                                                            </option>
                                                        ),
                                                    )}
                                                </NativeSelect>
                                                <InputError
                                                    message={
                                                        errors.to_storage_location_id
                                                    }
                                                />
                                            </div>

                                            <div className="grid gap-1.5">
                                                <Label htmlFor="note">
                                                    Note (optional)
                                                </Label>
                                                <Input
                                                    id="note"
                                                    name="note"
                                                    placeholder="e.g. Q1 2022 consolidation"
                                                />
                                                <InputError
                                                    message={errors.note}
                                                />
                                            </div>
                                        </div>

                                        <Button
                                            type="submit"
                                            disabled={processing}
                                            className="justify-self-start"
                                        >
                                            <Truck />
                                            Record the transfer
                                        </Button>
                                    </>
                                )}
                            </Form>
                        )}
                    </section>
                )}

                <section className="rounded-xl border border-border bg-card">
                    <header className="border-b border-border px-5 py-4">
                        <h2 className="font-semibold">Transfer history</h2>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Every batch the office has moved, most recent first.
                        </p>
                    </header>

                    {page.data.length === 0 ? (
                        <EmptyState
                            icon={Truck}
                            title="No transfers recorded"
                            description="Batches appear here once an editor moves documents — from the web, or by scanning QR codes with the companion app."
                        />
                    ) : (
                        <ul className="divide-y divide-border">
                            {page.data.map((transfer) => (
                                <li key={transfer.id} className="px-5 py-4">
                                    <div className="flex flex-wrap items-center justify-between gap-3">
                                        <div className="flex items-center gap-2 text-sm">
                                            <Badge
                                                variant="secondary"
                                                className="rounded-full font-normal"
                                            >
                                                {transfer.items?.[0]
                                                    ?.from_storage_location
                                                    ?.name ?? 'Various'}
                                            </Badge>
                                            <ArrowRight className="size-3.5 text-muted-foreground" />
                                            <Badge className="rounded-full">
                                                {transfer.target_location
                                                    ?.name ?? 'Unknown'}
                                            </Badge>
                                        </div>
                                        <p className="text-sm text-muted-foreground">
                                            {transfer.items_count} document
                                            {transfer.items_count === 1
                                                ? ''
                                                : 's'}{' '}
                                            &middot;{' '}
                                            {transfer.transferred_at.slice(
                                                0,
                                                10,
                                            )}{' '}
                                            &middot;{' '}
                                            {transfer.performer?.name ??
                                                'Unknown'}
                                        </p>
                                    </div>
                                    {transfer.note && (
                                        <p className="mt-2 text-sm text-muted-foreground">
                                            {transfer.note}
                                        </p>
                                    )}
                                </li>
                            ))}
                        </ul>
                    )}

                    <Paginator page={page} noun="transfer" />
                </section>
            </div>
        </>
    );
}

TransferIndex.layout = {
    breadcrumbs: [{ title: 'Transfers', href: transfers.index() }],
};
