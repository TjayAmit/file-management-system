import { Head } from '@inertiajs/react';
import { Check, Pencil, Plus, Warehouse } from 'lucide-react';
import EmptyState from '@/components/empty-state';
import FormDialog from '@/components/form-dialog';
import FormField from '@/components/form-field';
import PageContainer from '@/components/page-container';
import PageHeader from '@/components/page-header';
import { SectionCard, SectionCardHeader } from '@/components/section-card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
    return (
        <>
            <Head title="Storage Facilities" />
            <PageContainer>
                <PageHeader
                    title="Storage Locations"
                    icon={Warehouse}
                    description="The authorised municipal facilities and file rooms where paper originals reside. Staff use these identifiers during physical tracking and batch transfers."
                    badge={
                        <Badge variant="secondary" className="rounded-full">
                            {locations.length} designated
                        </Badge>
                    }
                    actions={
                        can.manage && (
                            <FormDialog
                                trigger={
                                    <Button>
                                        <Plus className="size-4" />
                                        Register facility
                                    </Button>
                                }
                                title="Register storage facility"
                                description="Only administrators can designate authorised archival facilities. The name is what staff will read off a transfer slip, so make it unambiguous."
                                icon={Warehouse}
                                form={admin.storageLocations.store.form()}
                                submitLabel="Register facility"
                                submitIcon={Plus}
                                resetOnSuccess
                            >
                                {({ errors }) => (
                                    <FormField
                                        label="Facility or room name"
                                        error={errors.name}
                                        required
                                        hint="Include the building when a room name alone could match two places."
                                    >
                                        {({ id, describedBy, invalid }) => (
                                            <Input
                                                id={id}
                                                name="name"
                                                autoFocus
                                                aria-describedby={describedBy}
                                                aria-invalid={invalid}
                                                placeholder="e.g. Central Records Archive, Room 2B"
                                                className="bg-card"
                                            />
                                        )}
                                    </FormField>
                                )}
                            </FormDialog>
                        )
                    }
                />

                <SectionCard>
                    <SectionCardHeader
                        title="Designated paper repositories"
                        description="Every location a scanned document can name as the home of its physical original."
                        icon={Warehouse}
                    />

                    {locations.length === 0 ? (
                        <EmptyState
                            icon={Warehouse}
                            title="No storage locations defined"
                            description="At least one storage facility is required before a scanned document can record where its physical original lives."
                        />
                    ) : (
                        <ul className="stagger grid gap-4 p-5 sm:grid-cols-2 sm:p-6 xl:grid-cols-3 2xl:grid-cols-4">
                            {locations.map((location) => (
                                <li
                                    key={location.id}
                                    className="group flex min-w-0 flex-col justify-between gap-4 rounded-xl border border-border/80 bg-muted/15 p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/35 hover:bg-card hover:shadow-sm motion-reduce:hover:translate-y-0"
                                >
                                    <div className="flex min-w-0 items-start gap-3">
                                        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary transition-colors group-hover:border-primary/35">
                                            <Warehouse className="size-4.5" />
                                        </span>
                                        <div className="min-w-0 space-y-0.5">
                                            <p className="truncate font-semibold text-foreground">
                                                {location.name}
                                            </p>
                                            <p className="font-mono text-xs text-muted-foreground">
                                                Facility #{location.id}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between gap-2 border-t border-border/60 pt-3">
                                        {location.documents_count !==
                                        undefined ? (
                                            <span className="text-xs font-medium text-muted-foreground tabular-nums">
                                                {location.documents_count}{' '}
                                                document
                                                {location.documents_count === 1
                                                    ? ''
                                                    : 's'}{' '}
                                                held
                                            </span>
                                        ) : (
                                            <span />
                                        )}

                                        {can.manage && (
                                            <FormDialog
                                                trigger={
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                    >
                                                        <Pencil className="size-3.5" />
                                                        Rename
                                                    </Button>
                                                }
                                                title="Rename storage facility"
                                                description="Documents already pointing at this facility follow the new name; nothing is moved."
                                                icon={Pencil}
                                                form={admin.storageLocations.update.form(
                                                    location.id,
                                                )}
                                                submitLabel="Save name"
                                                submitIcon={Check}
                                            >
                                                {({ errors }) => (
                                                    <FormField
                                                        label="Facility name"
                                                        error={errors.name}
                                                        required
                                                    >
                                                        {({
                                                            id,
                                                            describedBy,
                                                            invalid,
                                                        }) => (
                                                            <Input
                                                                id={id}
                                                                name="name"
                                                                autoFocus
                                                                defaultValue={
                                                                    location.name
                                                                }
                                                                aria-describedby={
                                                                    describedBy
                                                                }
                                                                aria-invalid={
                                                                    invalid
                                                                }
                                                                className="bg-card"
                                                            />
                                                        )}
                                                    </FormField>
                                                )}
                                            </FormDialog>
                                        )}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </SectionCard>
            </PageContainer>
        </>
    );
}

StorageLocationIndex.layout = {
    breadcrumbs: [
        { title: 'Storage Locations', href: storageLocations.index() },
    ],
};
