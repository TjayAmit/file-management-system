import { Form, Head } from '@inertiajs/react';
import { CloudUpload, Info } from 'lucide-react';
import { useState } from 'react';
import InputError from '@/components/input-error';
import PageHeader from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import documents from '@/routes/documents';

type BusinessItem = { id: number; name: string };

type BranchItem = {
    id: number;
    location: string;
    business?: BusinessItem | null;
};

type Named = { id: number; name: string };

const selectClass =
    'h-9 rounded-md border border-input bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-input/30';

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

    const branchesForBusiness =
        businessId === ''
            ? branches
            : branches.filter((branch) => branch.business?.id === businessId);

    const today = new Date().toISOString().slice(0, 10);

    return (
        <>
            <Head title="Encode document" />
            <div className="flex flex-1 flex-col gap-6 p-6">
                <PageHeader
                    title="Encode a document"
                    description="Scan the paper, then file its metadata card here. The card is the only way back to this document, so the four narrowing fields are required."
                />

                <div className="flex items-start gap-3 rounded-xl border border-border bg-muted/40 px-4 py-3 text-sm">
                    <Info className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                    <p className="text-muted-foreground">
                        Upload before printing the client&rsquo;s copy — the
                        archive fills through the retrieval workflow itself,
                        while the paper is already in your hands.
                    </p>
                </div>

                <Form
                    {...documents.store.form()}
                    encType="multipart/form-data"
                    className="rounded-xl border border-border bg-card"
                >
                    {({ processing, errors }) => (
                        <>
                            <div className="grid gap-5 p-6 sm:grid-cols-2">
                                <div className="grid gap-1.5">
                                    <Label htmlFor="business_filter">
                                        Business
                                    </Label>
                                    <select
                                        id="business_filter"
                                        value={businessId}
                                        onChange={(event) =>
                                            setBusinessId(
                                                event.target.value === ''
                                                    ? ''
                                                    : Number(
                                                          event.target.value,
                                                      ),
                                            )
                                        }
                                        className={selectClass}
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
                                    </select>
                                    <p className="text-xs text-muted-foreground">
                                        Picking a business narrows the branch
                                        list below.
                                    </p>
                                </div>

                                <div className="grid gap-1.5">
                                    <Label htmlFor="branch_id">
                                        Branch (the filing unit)
                                    </Label>
                                    <select
                                        id="branch_id"
                                        name="branch_id"
                                        required
                                        defaultValue={filters.branch_id ?? ''}
                                        className={selectClass}
                                        aria-invalid={Boolean(errors.branch_id)}
                                    >
                                        <option value="" disabled>
                                            Select a branch
                                        </option>
                                        {branchesForBusiness.map((branch) => (
                                            <option
                                                key={branch.id}
                                                value={branch.id}
                                            >
                                                {branch.business?.name
                                                    ? `${branch.business.name} — ${branch.location}`
                                                    : branch.location}
                                            </option>
                                        ))}
                                    </select>
                                    <InputError message={errors.branch_id} />
                                </div>

                                <div className="grid gap-1.5">
                                    <Label htmlFor="request_type_id">
                                        Request type
                                    </Label>
                                    <select
                                        id="request_type_id"
                                        name="request_type_id"
                                        required
                                        defaultValue=""
                                        className={selectClass}
                                        aria-invalid={Boolean(
                                            errors.request_type_id,
                                        )}
                                    >
                                        <option value="" disabled>
                                            Select a request type
                                        </option>
                                        {requestTypes.map((requestType) => (
                                            <option
                                                key={requestType.id}
                                                value={requestType.id}
                                            >
                                                {requestType.name}
                                            </option>
                                        ))}
                                    </select>
                                    <InputError
                                        message={errors.request_type_id}
                                    />
                                </div>

                                <div className="grid gap-1.5">
                                    <Label htmlFor="storage_location_id">
                                        Where the paper will be kept
                                    </Label>
                                    <select
                                        id="storage_location_id"
                                        name="storage_location_id"
                                        required
                                        defaultValue=""
                                        className={selectClass}
                                        aria-invalid={Boolean(
                                            errors.storage_location_id,
                                        )}
                                    >
                                        <option value="" disabled>
                                            Select a storage location
                                        </option>
                                        {storageLocations.map((location) => (
                                            <option
                                                key={location.id}
                                                value={location.id}
                                            >
                                                {location.name}
                                            </option>
                                        ))}
                                    </select>
                                    <InputError
                                        message={errors.storage_location_id}
                                    />
                                </div>

                                <div className="grid gap-1.5 sm:col-span-2">
                                    <Label htmlFor="title">
                                        Title / subject
                                    </Label>
                                    <Input
                                        id="title"
                                        name="title"
                                        required
                                        maxLength={255}
                                        placeholder="e.g. Setback inspection request — 2nd floor extension"
                                        aria-invalid={Boolean(errors.title)}
                                    />
                                    <InputError message={errors.title} />
                                </div>

                                <div className="grid gap-1.5">
                                    <Label htmlFor="document_date">
                                        Main date on the document
                                    </Label>
                                    <Input
                                        id="document_date"
                                        name="document_date"
                                        type="date"
                                        required
                                        max={today}
                                        aria-invalid={Boolean(
                                            errors.document_date,
                                        )}
                                    />
                                    <InputError
                                        message={errors.document_date}
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        Read it off the paper — never
                                        today&rsquo;s date.
                                    </p>
                                </div>

                                <div className="grid gap-1.5">
                                    <Label htmlFor="approval_date">
                                        Approval date (optional)
                                    </Label>
                                    <Input
                                        id="approval_date"
                                        name="approval_date"
                                        type="date"
                                        max={today}
                                        aria-invalid={Boolean(
                                            errors.approval_date,
                                        )}
                                    />
                                    <InputError
                                        message={errors.approval_date}
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        The approving officer&rsquo;s date, when
                                        the document carries one.
                                    </p>
                                </div>

                                <div className="grid gap-1.5">
                                    <Label htmlFor="request_date">
                                        Request date (optional)
                                    </Label>
                                    <Input
                                        id="request_date"
                                        name="request_date"
                                        type="date"
                                        max={today}
                                        aria-invalid={Boolean(
                                            errors.request_date,
                                        )}
                                    />
                                    <InputError message={errors.request_date} />
                                </div>

                                <div className="grid gap-1.5 sm:col-span-2">
                                    <Label htmlFor="file">Scanned PDF</Label>
                                    <Input
                                        id="file"
                                        name="file"
                                        type="file"
                                        accept="application/pdf"
                                        required
                                        aria-invalid={Boolean(errors.file)}
                                    />
                                    <InputError message={errors.file} />
                                    <p className="text-xs text-muted-foreground">
                                        PDF only, up to 20 MB. The file is
                                        stored on a private disk and served only
                                        through an authenticated route.
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 border-t border-border px-6 py-4">
                                <Button type="submit" disabled={processing}>
                                    <CloudUpload />
                                    {processing
                                        ? 'Uploading…'
                                        : 'Upload document'}
                                </Button>
                                <p className="text-xs text-muted-foreground">
                                    A QR code is generated for the paper as soon
                                    as this saves.
                                </p>
                            </div>
                        </>
                    )}
                </Form>
            </div>
        </>
    );
}

DocumentCreate.layout = {
    breadcrumbs: [
        { title: 'Documents', href: documents.index() },
        { title: 'Encode document', href: documents.create() },
    ],
};
