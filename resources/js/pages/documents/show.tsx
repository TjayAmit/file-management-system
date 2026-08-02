import { Form, Head, usePage } from '@inertiajs/react';
import InputError from '@/components/input-error';
import AppLayout from '@/layouts/app-layout';
import documents from '@/routes/documents';

interface StorageLocationItem {
    id: number;
    name: string;
}

interface DocumentItem {
    id: number;
    reference: string;
    title: string;
    storage_location_id: number;
    storage_location: StorageLocationItem;
}

function fileUrl(reference: string, action: 'view' | 'download' | 'print') {
    return documents.file.url(reference, { query: { action } });
}

export default function DocumentShow({
    document,
    storageLocations,
}: {
    document: DocumentItem;
    storageLocations: StorageLocationItem[];
}) {
    const { auth } = usePage().props;
    const canUpdateLocation =
        auth.user?.role === 'editor' || auth.user?.role === 'admin';

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Documents', href: '/documents' },
                {
                    title: document.reference,
                    href: `/documents/${document.reference}`,
                },
            ]}
        >
            <Head title={`Document - ${document.title}`} />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <h1 className="text-xl font-bold">{document.title}</h1>
                <p className="font-mono text-sm text-muted-foreground">
                    Reference: {document.reference}
                </p>

                <div className="flex gap-2">
                    <a
                        href={fileUrl(document.reference, 'view')}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-md border px-3 py-2 text-sm font-medium hover:bg-accent"
                    >
                        View
                    </a>
                    <a
                        href={fileUrl(document.reference, 'download')}
                        className="rounded-md border px-3 py-2 text-sm font-medium hover:bg-accent"
                    >
                        Download
                    </a>
                    <a
                        href={fileUrl(document.reference, 'print')}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-md border px-3 py-2 text-sm font-medium hover:bg-accent"
                    >
                        Print
                    </a>
                    <a
                        href={documents.qrCode.url(document.reference)}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-md border px-3 py-2 text-sm font-medium hover:bg-accent"
                    >
                        Print QR Code
                    </a>
                </div>

                <div className="max-w-sm rounded-lg border p-4">
                    <h2 className="text-sm font-medium">Physical location</h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Currently at: {document.storage_location.name}
                    </p>

                    {canUpdateLocation && (
                        <Form
                            {...documents.update.form(document.reference)}
                            className="mt-3 flex items-end gap-2"
                        >
                            {({ processing, errors }) => (
                                <>
                                    <div className="grid gap-1">
                                        <label
                                            htmlFor="storage_location_id"
                                            className="text-sm font-medium"
                                        >
                                            Update location
                                        </label>
                                        <select
                                            id="storage_location_id"
                                            name="storage_location_id"
                                            defaultValue={
                                                document.storage_location_id
                                            }
                                            className="rounded-md border px-3 py-2 text-sm"
                                        >
                                            {storageLocations.map(
                                                (location) => (
                                                    <option
                                                        key={location.id}
                                                        value={location.id}
                                                    >
                                                        {location.name}
                                                    </option>
                                                ),
                                            )}
                                        </select>
                                        <InputError
                                            message={errors.storage_location_id}
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="rounded-md border px-3 py-2 text-sm font-medium hover:bg-accent disabled:opacity-50"
                                    >
                                        Update
                                    </button>
                                </>
                            )}
                        </Form>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
