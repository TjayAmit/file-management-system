import { Form, Head } from '@inertiajs/react';
import {
    Building2,
    Calendar,
    CheckCircle2,
    CloudUpload,
    Circle,
    FilePlus2,
    FileText,
    Info,
    MapPin,
    QrCode,
    Tag,
    Warehouse,
} from 'lucide-react';
import type { ComponentType, SVGProps } from 'react';
import { useState } from 'react';
import Callout from '@/components/callout';
import FormField from '@/components/form-field';
import PageContainer from '@/components/page-container';
import PageHeader from '@/components/page-header';
import {
    SectionCard,
    SectionCardBody,
    SectionCardFooter,
    SectionCardHeader,
} from '@/components/section-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { NativeSelect } from '@/components/ui/native-select';
import { cn } from '@/lib/utils';
import documents from '@/routes/documents';

type BusinessItem = { id: number; name: string };

type BranchItem = {
    id: number;
    location: string;
    business?: BusinessItem | null;
};

type Named = { id: number; name: string };

function StepHeading({
    step,
    title,
    hint,
}: {
    step: number;
    title: string;
    hint?: string;
}) {
    return (
        <div className="mb-5 flex items-start gap-3">
            <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary tabular-nums">
                {step}
            </span>
            <div className="min-w-0">
                <h2 className="text-sm font-semibold text-foreground sm:text-base">
                    {title}
                </h2>
                {hint && (
                    <p className="text-xs leading-relaxed text-muted-foreground">
                        {hint}
                    </p>
                )}
            </div>
        </div>
    );
}

/**
 * One line of the index card being built, mirrored back as the clerk fills
 * the form. Encoding is done with the paper still in hand and the point of
 * the card is that it is the only way back to the document -- seeing it
 * assemble catches a wrong branch before the file is put away, not after.
 */
function PreviewRow({
    icon: Icon,
    label,
    value,
}: {
    icon: ComponentType<SVGProps<SVGSVGElement>>;
    label: string;
    value: string | null;
}) {
    const filled = value !== null && value !== '';

    return (
        <div className="flex items-start gap-2.5">
            <Icon
                aria-hidden
                className={cn(
                    'mt-0.5 size-3.5 shrink-0',
                    filled ? 'text-primary' : 'text-muted-foreground/50',
                )}
            />
            <div className="min-w-0 flex-1">
                <p className="text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
                    {label}
                </p>
                <p
                    className={cn(
                        'truncate text-xs',
                        filled
                            ? 'font-medium text-foreground'
                            : 'text-muted-foreground/70 italic',
                    )}
                >
                    {filled ? value : 'Not set'}
                </p>
            </div>
            {filled ? (
                <CheckCircle2
                    aria-hidden
                    className="mt-0.5 size-3.5 shrink-0 text-success"
                />
            ) : (
                <Circle
                    aria-hidden
                    className="mt-0.5 size-3.5 shrink-0 text-muted-foreground/30"
                />
            )}
        </div>
    );
}

export default function DocumentCreate({
    businesses,
    branches,
    requestTypes,
    storageLocations,
    filters,
}: {
    businesses: BusinessItem[];
    branches: BranchItem[];
    requestTypes: Named[];
    storageLocations: Named[];
    filters: { branch_id: number | null };
}) {
    const preselectedBranch = branches.find(
        (branch) => branch.id === filters.branch_id,
    );

    const [businessId, setBusinessId] = useState<number | ''>(
        preselectedBranch?.business?.id ?? '',
    );
    const [branchId, setBranchId] = useState<number | ''>(
        filters.branch_id ?? '',
    );
    const [requestTypeId, setRequestTypeId] = useState<number | ''>('');
    const [storageLocationId, setStorageLocationId] = useState<number | ''>('');
    const [title, setTitle] = useState('');
    const [documentDate, setDocumentDate] = useState('');
    const [fileName, setFileName] = useState<string | null>(null);

    const branchesForBusiness =
        businessId === ''
            ? branches
            : branches.filter((branch) => branch.business?.id === businessId);

    const today = new Date().toISOString().slice(0, 10);

    const selectedBranch = branches.find((branch) => branch.id === branchId);
    const selectedType = requestTypes.find((type) => type.id === requestTypeId);
    const selectedLocation = storageLocations.find(
        (location) => location.id === storageLocationId,
    );

    const preview = [
        {
            icon: Building2,
            label: 'Business',
            value: selectedBranch?.business?.name ?? null,
        },
        {
            icon: MapPin,
            label: 'Branch',
            value: selectedBranch?.location ?? null,
        },
        { icon: Tag, label: 'Request type', value: selectedType?.name ?? null },
        {
            icon: Warehouse,
            label: 'Paper kept at',
            value: selectedLocation?.name ?? null,
        },
        { icon: FileText, label: 'Title', value: title || null },
        { icon: Calendar, label: 'Document date', value: documentDate || null },
        { icon: CloudUpload, label: 'Scan', value: fileName },
    ];

    const completed = preview.filter(
        (row) => row.value !== null && row.value !== '',
    ).length;

    return (
        <>
            <Head title="Encode document" />
            <PageContainer>
                <PageHeader
                    title="Encode Document"
                    icon={FilePlus2}
                    description="Scan the physical document, then file its metadata card here. The card is the only way back to this document, so the four narrowing fields are required."
                />

                <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
                    <Form
                        {...documents.store.form()}
                        encType="multipart/form-data"
                        className="min-w-0"
                    >
                        {({ processing, errors }) => (
                            <SectionCard>
                                <div className="divide-y divide-border/70">
                                    <SectionCardBody>
                                        <StepHeading
                                            step={1}
                                            title="Organisation and branch"
                                            hint="The primary filing unit. Everything else narrows from here."
                                        />

                                        <div className="grid gap-5 sm:grid-cols-2">
                                            <FormField
                                                label="Business filter"
                                                optional
                                                hint="Picking a business narrows the branch list below."
                                            >
                                                {({ id, describedBy }) => (
                                                    <NativeSelect
                                                        id={id}
                                                        value={businessId}
                                                        aria-describedby={
                                                            describedBy
                                                        }
                                                        onChange={(event) => {
                                                            setBusinessId(
                                                                event.target
                                                                    .value ===
                                                                    ''
                                                                    ? ''
                                                                    : Number(
                                                                          event
                                                                              .target
                                                                              .value,
                                                                      ),
                                                            );
                                                            setBranchId('');
                                                        }}
                                                        className="bg-card"
                                                    >
                                                        <option value="">
                                                            All businesses (
                                                            {businesses.length})
                                                        </option>
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
                                                label="Branch"
                                                error={errors.branch_id}
                                                required
                                            >
                                                {({
                                                    id,
                                                    describedBy,
                                                    invalid,
                                                }) => (
                                                    <NativeSelect
                                                        id={id}
                                                        name="branch_id"
                                                        required
                                                        value={branchId}
                                                        onChange={(event) =>
                                                            setBranchId(
                                                                event.target
                                                                    .value ===
                                                                    ''
                                                                    ? ''
                                                                    : Number(
                                                                          event
                                                                              .target
                                                                              .value,
                                                                      ),
                                                            )
                                                        }
                                                        aria-describedby={
                                                            describedBy
                                                        }
                                                        aria-invalid={invalid}
                                                        className="bg-card"
                                                    >
                                                        <option
                                                            value=""
                                                            disabled
                                                        >
                                                            Select branch
                                                            location…
                                                        </option>
                                                        {branchesForBusiness.map(
                                                            (branch) => (
                                                                <option
                                                                    key={
                                                                        branch.id
                                                                    }
                                                                    value={
                                                                        branch.id
                                                                    }
                                                                >
                                                                    {branch
                                                                        .business
                                                                        ?.name
                                                                        ? `${branch.business.name} — ${branch.location}`
                                                                        : branch.location}
                                                                </option>
                                                            ),
                                                        )}
                                                    </NativeSelect>
                                                )}
                                            </FormField>
                                        </div>
                                    </SectionCardBody>

                                    <SectionCardBody>
                                        <StepHeading
                                            step={2}
                                            title="Classification and storage"
                                            hint="What kind of filing this is, and which room the paper goes back to."
                                        />

                                        <div className="grid gap-5 sm:grid-cols-2">
                                            <FormField
                                                label="Request type"
                                                error={errors.request_type_id}
                                                required
                                            >
                                                {({
                                                    id,
                                                    describedBy,
                                                    invalid,
                                                }) => (
                                                    <NativeSelect
                                                        id={id}
                                                        name="request_type_id"
                                                        required
                                                        value={requestTypeId}
                                                        onChange={(event) =>
                                                            setRequestTypeId(
                                                                event.target
                                                                    .value ===
                                                                    ''
                                                                    ? ''
                                                                    : Number(
                                                                          event
                                                                              .target
                                                                              .value,
                                                                      ),
                                                            )
                                                        }
                                                        aria-describedby={
                                                            describedBy
                                                        }
                                                        aria-invalid={invalid}
                                                        className="bg-card"
                                                    >
                                                        <option
                                                            value=""
                                                            disabled
                                                        >
                                                            Select
                                                            classification…
                                                        </option>
                                                        {requestTypes.map(
                                                            (requestType) => (
                                                                <option
                                                                    key={
                                                                        requestType.id
                                                                    }
                                                                    value={
                                                                        requestType.id
                                                                    }
                                                                >
                                                                    {
                                                                        requestType.name
                                                                    }
                                                                </option>
                                                            ),
                                                        )}
                                                    </NativeSelect>
                                                )}
                                            </FormField>

                                            <FormField
                                                label="Where the paper is kept"
                                                error={
                                                    errors.storage_location_id
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
                                                        name="storage_location_id"
                                                        required
                                                        value={
                                                            storageLocationId
                                                        }
                                                        onChange={(event) =>
                                                            setStorageLocationId(
                                                                event.target
                                                                    .value ===
                                                                    ''
                                                                    ? ''
                                                                    : Number(
                                                                          event
                                                                              .target
                                                                              .value,
                                                                      ),
                                                            )
                                                        }
                                                        aria-describedby={
                                                            describedBy
                                                        }
                                                        aria-invalid={invalid}
                                                        className="bg-card"
                                                    >
                                                        <option
                                                            value=""
                                                            disabled
                                                        >
                                                            Select storage
                                                            location…
                                                        </option>
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
                                        </div>
                                    </SectionCardBody>

                                    <SectionCardBody>
                                        <StepHeading
                                            step={3}
                                            title="Metadata and dates"
                                            hint="Read the dates off the paper — today's date makes the document unfindable by the date anyone remembers."
                                        />

                                        <div className="grid gap-5 sm:grid-cols-2">
                                            <FormField
                                                label="Document title or subject"
                                                error={errors.title}
                                                required
                                                className="sm:col-span-2"
                                            >
                                                {({
                                                    id,
                                                    describedBy,
                                                    invalid,
                                                }) => (
                                                    <Input
                                                        id={id}
                                                        name="title"
                                                        required
                                                        maxLength={255}
                                                        value={title}
                                                        onChange={(event) =>
                                                            setTitle(
                                                                event.target
                                                                    .value,
                                                            )
                                                        }
                                                        aria-describedby={
                                                            describedBy
                                                        }
                                                        aria-invalid={invalid}
                                                        placeholder="e.g. Setback inspection request — 2nd floor extension"
                                                        className="bg-card"
                                                    />
                                                )}
                                            </FormField>

                                            <FormField
                                                label="Main document date"
                                                error={errors.document_date}
                                                required
                                                hint="As printed on the paper."
                                            >
                                                {({
                                                    id,
                                                    describedBy,
                                                    invalid,
                                                }) => (
                                                    <Input
                                                        id={id}
                                                        name="document_date"
                                                        type="date"
                                                        required
                                                        max={today}
                                                        value={documentDate}
                                                        onChange={(event) =>
                                                            setDocumentDate(
                                                                event.target
                                                                    .value,
                                                            )
                                                        }
                                                        aria-describedby={
                                                            describedBy
                                                        }
                                                        aria-invalid={invalid}
                                                        className="bg-card"
                                                    />
                                                )}
                                            </FormField>

                                            <FormField
                                                label="Approval date"
                                                error={errors.approval_date}
                                                optional
                                                hint="The approving officer's signature date."
                                            >
                                                {({
                                                    id,
                                                    describedBy,
                                                    invalid,
                                                }) => (
                                                    <Input
                                                        id={id}
                                                        name="approval_date"
                                                        type="date"
                                                        max={today}
                                                        aria-describedby={
                                                            describedBy
                                                        }
                                                        aria-invalid={invalid}
                                                        className="bg-card"
                                                    />
                                                )}
                                            </FormField>

                                            <FormField
                                                label="Request date"
                                                error={errors.request_date}
                                                optional
                                                className="sm:col-span-2 sm:max-w-[calc(50%-0.625rem)]"
                                            >
                                                {({
                                                    id,
                                                    describedBy,
                                                    invalid,
                                                }) => (
                                                    <Input
                                                        id={id}
                                                        name="request_date"
                                                        type="date"
                                                        max={today}
                                                        aria-describedby={
                                                            describedBy
                                                        }
                                                        aria-invalid={invalid}
                                                        className="bg-card"
                                                    />
                                                )}
                                            </FormField>
                                        </div>
                                    </SectionCardBody>

                                    <SectionCardBody>
                                        <StepHeading
                                            step={4}
                                            title="Digital PDF attachment"
                                            hint="Stored privately; only signed-in staff can retrieve it, and every retrieval is logged."
                                        />

                                        <FormField
                                            label="Scanned PDF document"
                                            error={errors.file}
                                            required
                                        >
                                            {({ id, describedBy, invalid }) => (
                                                <div
                                                    className={cn(
                                                        'flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 text-center transition-colors',
                                                        fileName
                                                            ? 'border-success/40 bg-success-muted/25'
                                                            : 'border-border/80 bg-muted/20 hover:border-primary/50 hover:bg-muted/40',
                                                    )}
                                                >
                                                    {fileName ? (
                                                        <CheckCircle2 className="mb-2 size-8 text-success" />
                                                    ) : (
                                                        <CloudUpload className="mb-2 size-8 text-muted-foreground" />
                                                    )}
                                                    <p className="text-sm font-medium text-foreground">
                                                        {fileName ??
                                                            'Select the PDF scan'}
                                                    </p>
                                                    <p className="mt-1 text-xs text-muted-foreground">
                                                        PDF only, up to 20 MB.
                                                    </p>
                                                    <Input
                                                        id={id}
                                                        name="file"
                                                        type="file"
                                                        accept="application/pdf"
                                                        required
                                                        onChange={(event) =>
                                                            setFileName(
                                                                event.target
                                                                    .files?.[0]
                                                                    ?.name ??
                                                                    null,
                                                            )
                                                        }
                                                        aria-describedby={
                                                            describedBy
                                                        }
                                                        aria-invalid={invalid}
                                                        className="mt-3 max-w-sm cursor-pointer bg-card"
                                                    />
                                                </div>
                                            )}
                                        </FormField>
                                    </SectionCardBody>
                                </div>

                                <SectionCardFooter>
                                    <p className="flex items-center gap-2 text-xs text-muted-foreground">
                                        <QrCode className="size-4 text-primary" />
                                        A QR tracking code is generated
                                        automatically on save.
                                    </p>
                                    <Button
                                        type="submit"
                                        pending={processing}
                                        className="ml-auto"
                                    >
                                        {!processing && (
                                            <CloudUpload className="size-4" />
                                        )}
                                        {processing
                                            ? 'Encoding…'
                                            : 'Upload and index document'}
                                    </Button>
                                </SectionCardFooter>
                            </SectionCard>
                        )}
                    </Form>

                    <div className="flex flex-col gap-6 xl:sticky xl:top-22">
                        <Callout
                            tone="primary"
                            icon={Info}
                            title="Upload before printing the client's copy"
                        >
                            The archive fills through the retrieval workflow
                            itself — while the paper is already in your hands.
                            Encoding it later almost always means never.
                        </Callout>

                        <SectionCard>
                            <SectionCardHeader
                                title="Index card preview"
                                description="What a future search will have to find this by."
                                icon={FileText}
                                actions={
                                    <span className="text-xs font-medium text-muted-foreground tabular-nums">
                                        {completed}/{preview.length}
                                    </span>
                                }
                            />
                            <SectionCardBody className="space-y-3.5">
                                {preview.map((row) => (
                                    <PreviewRow
                                        key={row.label}
                                        icon={row.icon}
                                        label={row.label}
                                        value={row.value}
                                    />
                                ))}
                            </SectionCardBody>
                        </SectionCard>
                    </div>
                </div>
            </PageContainer>
        </>
    );
}

DocumentCreate.layout = {
    breadcrumbs: [
        { title: 'Documents', href: documents.index() },
        { title: 'Encode document', href: documents.create() },
    ],
};
