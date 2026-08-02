import { Form, Head } from '@inertiajs/react';
import InputError from '@/components/input-error';
import AppLayout from '@/layouts/app-layout';
import documents from '@/routes/documents';

interface BusinessItem {
    id: number;
    name: string;
}

interface BranchItem {
    id: number;
    location: string;
    business: BusinessItem;
}

interface RequestTypeItem {
    id: number;
    name: string;
}

interface StorageLocationItem {
    id: number;
    name: string;
}

interface Filters {
    branch_id: number | null;
}

export default function DocumentCreate({
    branches,
    requestTypes,
    storageLocations,
    filters,
}: {
    branches: BranchItem[];
    requestTypes: RequestTypeItem[];
    storageLocations: StorageLocationItem[];
    filters: Filters;
}) {
    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Documents', href: '/documents' },
                { title: 'Encode document', href: '/documents/create' },
            ]}
        >
            <Head title="Encode document" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div>
                    <h1 className="text-xl font-bold">Encode document</h1>
                    <p className="text-sm text-muted-foreground">
                        Not in the system yet — scan the original, then upload
                        it here before printing the client's copy (PLAN.md
                        §6.3).
                    </p>
                </div>

                <Form
                    {...documents.store.form()}
                    encType="multipart/form-data"
                    className="max-w-xl space-y-4 rounded-lg border p-4"
                >
                    {({ processing, errors }) => (
                        <>
                            <div className="grid gap-1">
                                <label
                                    htmlFor="branch_id"
                                    className="text-sm font-medium"
                                >
                                    Business branch
                                </label>
                                <select
                                    id="branch_id"
                                    name="branch_id"
                                    required
                                    defaultValue={filters.branch_id ?? ''}
                                    className="rounded-md border px-3 py-2 text-sm"
                                >
                                    <option value="" disabled>
                                        Select a branch
                                    </option>
                                    {branches.map((branch) => (
                                        <option
                                            key={branch.id}
                                            value={branch.id}
                                        >
                                            {branch.business.name} —{' '}
                                            {branch.location}
                                        </option>
                                    ))}
                                </select>
                                <InputError message={errors.branch_id} />
                            </div>

                            <div className="grid gap-1">
                                <label
                                    htmlFor="request_type_id"
                                    className="text-sm font-medium"
                                >
                                    Request type
                                </label>
                                <select
                                    id="request_type_id"
                                    name="request_type_id"
                                    required
                                    defaultValue=""
                                    className="rounded-md border px-3 py-2 text-sm"
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
                                <InputError message={errors.request_type_id} />
                            </div>

                            <div className="grid gap-1">
                                <label
                                    htmlFor="storage_location_id"
                                    className="text-sm font-medium"
                                >
                                    Storage location
                                </label>
                                <select
                                    id="storage_location_id"
                                    name="storage_location_id"
                                    required
                                    defaultValue=""
                                    className="rounded-md border px-3 py-2 text-sm"
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

                            <div className="grid gap-1">
                                <label
                                    htmlFor="title"
                                    className="text-sm font-medium"
                                >
                                    Title
                                </label>
                                <input
                                    id="title"
                                    name="title"
                                    type="text"
                                    required
                                    maxLength={255}
                                    className="rounded-md border px-3 py-2 text-sm"
                                />
                                <InputError message={errors.title} />
                            </div>

                            <div className="grid gap-1">
                                <label
                                    htmlFor="document_date"
                                    className="text-sm font-medium"
                                >
                                    Document date
                                </label>
                                <input
                                    id="document_date"
                                    name="document_date"
                                    type="date"
                                    required
                                    className="rounded-md border px-3 py-2 text-sm"
                                />
                                <InputError message={errors.document_date} />
                            </div>

                            <div className="grid gap-1">
                                <label
                                    htmlFor="remarks"
                                    className="text-sm font-medium"
                                >
                                    Remarks (optional)
                                </label>
                                <textarea
                                    id="remarks"
                                    name="remarks"
                                    rows={3}
                                    className="rounded-md border px-3 py-2 text-sm"
                                />
                                <InputError message={errors.remarks} />
                            </div>

                            <div className="grid gap-1">
                                <label
                                    htmlFor="file"
                                    className="text-sm font-medium"
                                >
                                    Scanned PDF
                                </label>
                                <input
                                    id="file"
                                    name="file"
                                    type="file"
                                    accept="application/pdf"
                                    required
                                    className="text-sm"
                                />
                                <InputError message={errors.file} />
                            </div>

                            <button
                                type="submit"
                                disabled={processing}
                                className="rounded-md border px-3 py-2 text-sm font-medium hover:bg-accent disabled:opacity-50"
                            >
                                Upload document
                            </button>
                        </>
                    )}
                </Form>
            </div>
        </AppLayout>
    );
}
