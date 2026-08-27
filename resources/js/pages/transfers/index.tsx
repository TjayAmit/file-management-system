import { Head } from '@inertiajs/react';
import {
    ArrowRight,
    Calendar,
    MapPin,
    PackageCheck,
    Search,
    Truck,
    User,
    X,
} from 'lucide-react';
import { useState } from 'react';
import Callout from '@/components/callout';
import EmptyState from '@/components/empty-state';
import FormDialog from '@/components/form-dialog';
import FormField from '@/components/form-field';
import PageContainer from '@/components/page-container';
import PageHeader from '@/components/page-header';
import type { Paginated } from '@/components/paginator';
import Paginator from '@/components/paginator';
import { SectionCard, SectionCardHeader } from '@/components/section-card';
import StatusBadge from '@/components/status-badge';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
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

function formatTransferDate(timestamp: string): string {
    const date = new Date(timestamp);

    if (Number.isNaN(date.getTime())) {
        return timestamp.slice(0, 10);
    }

    return date.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
}

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
    const [selected, setSelected] = useState<string[]>([]);
    const [pickerQuery, setPickerQuery] = useState('');

    const term = pickerQuery.trim().toLocaleLowerCase();

    const visibleDocuments =
        term === ''
            ? documents
            : documents.filter((document) =>
                  [
                      document.title,
                      document.reference,
                      document.branch?.location,
                      document.branch?.business?.name,
                  ]
                      .filter(Boolean)
                      .some((value) =>
                          String(value).toLocaleLowerCase().includes(term),
                      ),
              );

    function toggle(reference: string, checked: boolean) {
        setSelected((current) =>
            checked
                ? [...current, reference]
                : current.filter((item) => item !== reference),
        );
    }

    function resetPicker() {
        setSelected([]);
        setPickerQuery('');
    }

    return (
        <>
            <Head title="Physical Transfers" />
            <PageContainer>
                <PageHeader
                    title="Physical Transfers"
                    icon={Truck}
                    description="Documents are consolidated into a batch, then moved. Every move is logged so staff always know which building the paper is sitting in."
                    badge={
                        <Badge variant="secondary" className="rounded-full">
                            {page.total} recorded
                        </Badge>
                    }
                    actions={
                        can.transfer &&
                        documents.length > 0 && (
                            <FormDialog
                                trigger={
                                    <Button>
                                        <PackageCheck className="size-4" />
                                        Stage a transfer
                                    </Button>
                                }
                                title="Stage a transfer batch"
                                description="Tick every document physically travelling together, then name where the batch is going."
                                icon={PackageCheck}
                                form={transfers.store.form()}
                                submitLabel="Record transfer"
                                submitIcon={Truck}
                                size="xl"
                                onOpenChange={(open) => {
                                    if (!open) {
                                        resetPicker();
                                    }
                                }}
                                footerNote={
                                    selected.length === 0
                                        ? 'Select at least one document.'
                                        : `${selected.length} document${selected.length === 1 ? '' : 's'} in this batch.`
                                }
                            >
                                {({ errors }) => (
                                    <>
                                        {/*
                                         * Selection lives in React rather than
                                         * in the checkboxes themselves, so
                                         * filtering the list cannot silently
                                         * drop a document the operator already
                                         * ticked.
                                         */}
                                        {selected.map((reference) => (
                                            <input
                                                key={reference}
                                                type="hidden"
                                                name="references[]"
                                                value={reference}
                                            />
                                        ))}

                                        <fieldset className="grid gap-2.5">
                                            <div className="flex flex-wrap items-end justify-between gap-3">
                                                <legend className="text-xs font-semibold tracking-wide text-foreground uppercase">
                                                    Documents in this batch
                                                </legend>
                                                <div className="flex items-center gap-2">
                                                    <StatusBadge
                                                        tone={
                                                            selected.length > 0
                                                                ? 'primary'
                                                                : 'neutral'
                                                        }
                                                    >
                                                        {selected.length}{' '}
                                                        selected
                                                    </StatusBadge>
                                                    {selected.length > 0 && (
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() =>
                                                                setSelected([])
                                                            }
                                                        >
                                                            <X className="size-3.5" />
                                                            Clear
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="relative">
                                                <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                                                <Input
                                                    value={pickerQuery}
                                                    onChange={(event) =>
                                                        setPickerQuery(
                                                            event.target.value,
                                                        )
                                                    }
                                                    placeholder={`Filter ${documents.length} available documents…`}
                                                    className="bg-card pl-9"
                                                />
                                            </div>

                                            <div className="scroll-slim max-h-80 divide-y divide-border/60 overflow-y-auto rounded-xl border border-border bg-muted/10">
                                                {visibleDocuments.length ===
                                                0 ? (
                                                    <p className="px-4 py-8 text-center text-xs text-muted-foreground">
                                                        No document matches
                                                        &ldquo;{pickerQuery}
                                                        &rdquo;.
                                                    </p>
                                                ) : (
                                                    visibleDocuments.map(
                                                        (document) => (
                                                            <label
                                                                key={
                                                                    document.id
                                                                }
                                                                className="flex cursor-pointer items-center gap-3.5 p-3.5 transition-colors hover:bg-muted/40"
                                                            >
                                                                <Checkbox
                                                                    checked={selected.includes(
                                                                        document.reference,
                                                                    )}
                                                                    onCheckedChange={(
                                                                        checked,
                                                                    ) =>
                                                                        toggle(
                                                                            document.reference,
                                                                            checked ===
                                                                                true,
                                                                        )
                                                                    }
                                                                />
                                                                <span className="min-w-0 flex-1 space-y-0.5">
                                                                    <span className="block truncate text-sm font-medium text-foreground">
                                                                        {document.title ??
                                                                            'Untitled document'}
                                                                    </span>
                                                                    <span className="block truncate text-xs text-muted-foreground">
                                                                        {document
                                                                            .branch
                                                                            ?.business
                                                                            ?.name ??
                                                                            'Unknown business'}
                                                                        {' · '}
                                                                        {document
                                                                            .branch
                                                                            ?.location ??
                                                                            'No branch'}
                                                                    </span>
                                                                </span>
                                                                <StatusBadge
                                                                    tone="info"
                                                                    icon={
                                                                        <MapPin className="size-3" />
                                                                    }
                                                                    className="shrink-0"
                                                                >
                                                                    {document
                                                                        .storage_location
                                                                        ?.name ??
                                                                        'Unknown'}
                                                                </StatusBadge>
                                                            </label>
                                                        ),
                                                    )
                                                )}
                                            </div>

                                            {errors.references && (
                                                <p
                                                    role="alert"
                                                    className="text-sm text-destructive"
                                                >
                                                    {errors.references}
                                                </p>
                                            )}
                                        </fieldset>

                                        <div className="grid gap-4 sm:grid-cols-2">
                                            <FormField
                                                label="Destination location"
                                                error={
                                                    errors.to_storage_location_id
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
                                                        name="to_storage_location_id"
                                                        aria-describedby={
                                                            describedBy
                                                        }
                                                        aria-invalid={invalid}
                                                        className="bg-card"
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
                                                                    {
                                                                        location.name
                                                                    }
                                                                </option>
                                                            ),
                                                        )}
                                                    </NativeSelect>
                                                )}
                                            </FormField>

                                            <FormField
                                                label="Batch note"
                                                error={errors.note}
                                                optional
                                                hint="Why the batch moved — the log reads better a year from now."
                                            >
                                                {({
                                                    id,
                                                    describedBy,
                                                    invalid,
                                                }) => (
                                                    <Input
                                                        id={id}
                                                        name="note"
                                                        aria-describedby={
                                                            describedBy
                                                        }
                                                        aria-invalid={invalid}
                                                        placeholder="e.g. Annual warehouse consolidation"
                                                        className="bg-card"
                                                    />
                                                )}
                                            </FormField>
                                        </div>
                                    </>
                                )}
                            </FormDialog>
                        )
                    }
                />

                {can.transfer && documents.length === 0 && (
                    <Callout
                        tone="info"
                        icon={Truck}
                        title="Nothing available to transfer yet"
                    >
                        Encode physical documents into the index before staging
                        a batch — a transfer moves records the archive already
                        knows about.
                    </Callout>
                )}

                <SectionCard>
                    <SectionCardHeader
                        title="Transfer history"
                        description="Audited record of every physical batch relocation, newest first."
                        icon={Truck}
                    />

                    {page.data.length === 0 ? (
                        <EmptyState
                            icon={Truck}
                            title="No transfers recorded yet"
                            description="Batches appear here once staff relocate paper records between storage locations."
                        />
                    ) : (
                        <ul className="stagger divide-y divide-border/60">
                            {page.data.map((transfer) => (
                                <li
                                    key={transfer.id}
                                    className="flex flex-col gap-3 px-5 py-4 transition-colors hover:bg-muted/25 sm:px-6"
                                >
                                    <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2.5">
                                        <div className="flex min-w-0 flex-wrap items-center gap-2">
                                            <Badge
                                                variant="secondary"
                                                className="rounded-lg px-2.5 py-1 font-medium"
                                            >
                                                {transfer.items?.[0]
                                                    ?.from_storage_location
                                                    ?.name ?? 'Various'}
                                            </Badge>
                                            <ArrowRight className="size-3.5 shrink-0 text-muted-foreground" />
                                            <Badge className="rounded-lg px-2.5 py-1 font-semibold">
                                                {transfer.target_location
                                                    ?.name ?? 'Unknown'}
                                            </Badge>
                                            <StatusBadge tone="primary">
                                                {transfer.items_count} document
                                                {transfer.items_count === 1
                                                    ? ''
                                                    : 's'}
                                            </StatusBadge>
                                        </div>

                                        <div className="flex shrink-0 flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                                            <span className="flex items-center gap-1 tabular-nums">
                                                <Calendar className="size-3" />
                                                {formatTransferDate(
                                                    transfer.transferred_at,
                                                )}
                                            </span>
                                            <span className="flex items-center gap-1 font-medium text-foreground">
                                                <User className="size-3 text-muted-foreground" />
                                                {transfer.performer?.name ??
                                                    'System'}
                                            </span>
                                        </div>
                                    </div>

                                    {transfer.note && (
                                        <p className="rounded-lg border border-border/60 bg-muted/35 px-3 py-2 text-xs text-pretty text-muted-foreground">
                                            &ldquo;{transfer.note}&rdquo;
                                        </p>
                                    )}
                                </li>
                            ))}
                        </ul>
                    )}

                    <Paginator page={page} noun="transfer" />
                </SectionCard>
            </PageContainer>
        </>
    );
}

TransferIndex.layout = {
    breadcrumbs: [{ title: 'Transfers', href: transfers.index() }],
};
