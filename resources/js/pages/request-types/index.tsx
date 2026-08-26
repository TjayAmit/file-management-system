import { Form, Head } from '@inertiajs/react';
import { GitMerge, Plus, Tags } from 'lucide-react';
import { useState } from 'react';
import EmptyState from '@/components/empty-state';
import FlashMessage from '@/components/flash-message';
import InputError from '@/components/input-error';
import PageHeader from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import requestTypes from '@/routes/request-types';

type RequestTypeItem = { id: number; name: string };

const selectClass =
    'h-9 rounded-md border border-input bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 dark:bg-input/30';

export default function RequestTypeIndex({
    requestTypes: typeList,
    can,
}: {
    requestTypes: RequestTypeItem[];
    can: { manage: boolean; merge: boolean };
}) {
    const [editing, setEditing] = useState<number | null>(null);

    return (
        <>
            <Head title="Request types" />
            <div className="flex flex-1 flex-col gap-6 p-6">
                <PageHeader
                    title="Request types"
                    description="The second-stage narrowing filter. Free text here would fragment the filter, so the list stays controlled."
                />

                <FlashMessage />

                {can.manage && (
                    <section className="grid gap-6 lg:grid-cols-2">
                        <div className="rounded-xl border border-border bg-card">
                            <header className="border-b border-border px-5 py-4">
                                <h2 className="font-semibold">
                                    Add a request type
                                </h2>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    Only when the kind of request is genuinely
                                    new.
                                </p>
                            </header>
                            <Form
                                {...requestTypes.store.form()}
                                resetOnSuccess
                                className="grid gap-2 p-5"
                            >
                                {({ processing, errors }) => (
                                    <>
                                        <Label htmlFor="name">Name</Label>
                                        <Input
                                            id="name"
                                            name="name"
                                            placeholder="e.g. Setback inspection request"
                                            aria-invalid={Boolean(errors.name)}
                                        />
                                        <InputError message={errors.name} />
                                        <Button
                                            type="submit"
                                            disabled={processing}
                                            className="justify-self-start"
                                        >
                                            <Plus />
                                            Create request type
                                        </Button>
                                    </>
                                )}
                            </Form>
                        </div>

                        {can.merge && typeList.length > 1 && (
                            <div className="rounded-xl border border-border bg-card">
                                <header className="border-b border-border px-5 py-4">
                                    <h2 className="font-semibold">
                                        Merge duplicates
                                    </h2>
                                    <p className="mt-1 text-sm text-muted-foreground">
                                        Documents move to the type you keep.
                                    </p>
                                </header>
                                <Form
                                    {...requestTypes.merge.form()}
                                    className="grid gap-3 p-5 sm:grid-cols-2"
                                >
                                    {({ processing, errors }) => (
                                        <>
                                            <div className="grid gap-1.5">
                                                <Label htmlFor="source_request_type_id">
                                                    Duplicate
                                                </Label>
                                                <select
                                                    id="source_request_type_id"
                                                    name="source_request_type_id"
                                                    className={selectClass}
                                                >
                                                    {typeList.map((type) => (
                                                        <option
                                                            key={type.id}
                                                            value={type.id}
                                                        >
                                                            {type.name}
                                                        </option>
                                                    ))}
                                                </select>
                                                <InputError
                                                    message={
                                                        errors.source_request_type_id
                                                    }
                                                />
                                            </div>
                                            <div className="grid gap-1.5">
                                                <Label htmlFor="target_request_type_id">
                                                    Keep
                                                </Label>
                                                <select
                                                    id="target_request_type_id"
                                                    name="target_request_type_id"
                                                    className={selectClass}
                                                >
                                                    {typeList.map((type) => (
                                                        <option
                                                            key={type.id}
                                                            value={type.id}
                                                        >
                                                            {type.name}
                                                        </option>
                                                    ))}
                                                </select>
                                                <InputError
                                                    message={
                                                        errors.target_request_type_id
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
                    {typeList.length === 0 ? (
                        <EmptyState
                            icon={Tags}
                            title="No request types yet"
                            description="Types are created from what staff actually encounter, so the system is never blocked by an unforeseen one."
                        />
                    ) : (
                        <ul className="divide-y divide-border">
                            {typeList.map((type) => (
                                <li key={type.id} className="px-5 py-3">
                                    <div className="flex items-center justify-between gap-3">
                                        <span className="truncate font-medium">
                                            {type.name}
                                        </span>
                                        {can.manage && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() =>
                                                    setEditing(
                                                        editing === type.id
                                                            ? null
                                                            : type.id,
                                                    )
                                                }
                                            >
                                                {editing === type.id
                                                    ? 'Cancel'
                                                    : 'Rename'}
                                            </Button>
                                        )}
                                    </div>

                                    {can.manage && editing === type.id && (
                                        <Form
                                            {...requestTypes.update.form(
                                                type.id,
                                            )}
                                            onSuccess={() => setEditing(null)}
                                            className="mt-3 flex items-end gap-2"
                                        >
                                            {({ processing, errors }) => (
                                                <>
                                                    <div className="grid flex-1 gap-1.5">
                                                        <Label
                                                            htmlFor={`name-${type.id}`}
                                                        >
                                                            New name
                                                        </Label>
                                                        <Input
                                                            id={`name-${type.id}`}
                                                            name="name"
                                                            defaultValue={
                                                                type.name
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

RequestTypeIndex.layout = {
    breadcrumbs: [{ title: 'Request types', href: requestTypes.index() }],
};
