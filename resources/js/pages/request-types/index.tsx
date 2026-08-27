import { Head } from '@inertiajs/react';
import { Check, GitMerge, Pencil, Plus, Tag, Tags } from 'lucide-react';
import Callout from '@/components/callout';
import EmptyState from '@/components/empty-state';
import FormDialog from '@/components/form-dialog';
import FormField from '@/components/form-field';
import PageContainer from '@/components/page-container';
import PageHeader from '@/components/page-header';
import { SectionCard, SectionCardHeader } from '@/components/section-card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { NativeSelect } from '@/components/ui/native-select';
import requestTypes from '@/routes/request-types';

type RequestTypeItem = { id: number; name: string };

export default function RequestTypeIndex({
    requestTypes: typeList,
    can,
}: {
    requestTypes: RequestTypeItem[];
    can: { manage: boolean; merge: boolean };
}) {
    return (
        <>
            <Head title="Request Types" />
            <PageContainer>
                <PageHeader
                    title="Request Types"
                    icon={Tags}
                    description="The second-stage classification filter for municipal documents. Standardised categories are what keep a search for one kind of filing from fragmenting across four spellings of it."
                    badge={
                        <Badge variant="secondary" className="rounded-full">
                            {typeList.length} defined
                        </Badge>
                    }
                    actions={
                        can.manage && (
                            <div className="flex flex-wrap items-center gap-2">
                                {can.merge && typeList.length > 1 && (
                                    <FormDialog
                                        trigger={
                                            <Button variant="outline">
                                                <GitMerge className="size-4" />
                                                Merge duplicates
                                            </Button>
                                        }
                                        title="Merge duplicate request types"
                                        description="Consolidate two categories that mean the same thing."
                                        icon={GitMerge}
                                        form={requestTypes.merge.form()}
                                        submitLabel="Merge classifications"
                                        submitIcon={GitMerge}
                                        submitVariant="destructive"
                                        size="md"
                                        footerNote="This cannot be undone."
                                    >
                                        {({ errors }) => (
                                            <>
                                                <Callout
                                                    tone="warning"
                                                    title="Every document on the retired type is reclassified"
                                                >
                                                    The duplicate disappears
                                                    from the directory and its
                                                    documents move onto the type
                                                    you keep. Check the
                                                    direction before you
                                                    confirm.
                                                </Callout>

                                                <FormField
                                                    label="Duplicate to retire"
                                                    error={
                                                        errors.source_request_type_id
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
                                                            name="source_request_type_id"
                                                            aria-describedby={
                                                                describedBy
                                                            }
                                                            aria-invalid={
                                                                invalid
                                                            }
                                                            className="bg-card"
                                                        >
                                                            {typeList.map(
                                                                (type) => (
                                                                    <option
                                                                        key={
                                                                            type.id
                                                                        }
                                                                        value={
                                                                            type.id
                                                                        }
                                                                    >
                                                                        {
                                                                            type.name
                                                                        }
                                                                    </option>
                                                                ),
                                                            )}
                                                        </NativeSelect>
                                                    )}
                                                </FormField>

                                                <FormField
                                                    label="Primary to retain"
                                                    error={
                                                        errors.target_request_type_id
                                                    }
                                                    required
                                                    hint="The name that survives, and the one every reclassified document will carry."
                                                >
                                                    {({
                                                        id,
                                                        describedBy,
                                                        invalid,
                                                    }) => (
                                                        <NativeSelect
                                                            id={id}
                                                            name="target_request_type_id"
                                                            aria-describedby={
                                                                describedBy
                                                            }
                                                            aria-invalid={
                                                                invalid
                                                            }
                                                            className="bg-card"
                                                        >
                                                            {typeList.map(
                                                                (type) => (
                                                                    <option
                                                                        key={
                                                                            type.id
                                                                        }
                                                                        value={
                                                                            type.id
                                                                        }
                                                                    >
                                                                        {
                                                                            type.name
                                                                        }
                                                                    </option>
                                                                ),
                                                            )}
                                                        </NativeSelect>
                                                    )}
                                                </FormField>
                                            </>
                                        )}
                                    </FormDialog>
                                )}

                                <FormDialog
                                    trigger={
                                        <Button>
                                            <Plus className="size-4" />
                                            Create type
                                        </Button>
                                    }
                                    title="Create request type"
                                    description="Define a new category only when the nature of the filing is genuinely new. A near-duplicate splits future searches in two."
                                    icon={Tags}
                                    form={requestTypes.store.form()}
                                    submitLabel="Create type"
                                    submitIcon={Plus}
                                    resetOnSuccess
                                >
                                    {({ errors }) => (
                                        <FormField
                                            label="Classification name"
                                            error={errors.name}
                                            required
                                            hint="Word it the way a clerk would describe the request out loud."
                                        >
                                            {({ id, describedBy, invalid }) => (
                                                <Input
                                                    id={id}
                                                    name="name"
                                                    autoFocus
                                                    aria-describedby={
                                                        describedBy
                                                    }
                                                    aria-invalid={invalid}
                                                    placeholder="e.g. Setback Inspection Clearance"
                                                    className="bg-card"
                                                />
                                            )}
                                        </FormField>
                                    )}
                                </FormDialog>
                            </div>
                        )
                    }
                />

                <SectionCard>
                    <SectionCardHeader
                        title="Standard classification directory"
                        description="Every category a document can be filed under."
                        icon={Tag}
                    />

                    {typeList.length === 0 ? (
                        <EmptyState
                            icon={Tags}
                            title="No request types defined"
                            description="Create request types so staff can classify permits, clearances, and petitions consistently."
                        />
                    ) : (
                        <ul className="stagger grid gap-3 p-5 sm:grid-cols-2 sm:p-6 lg:grid-cols-3 2xl:grid-cols-4">
                            {typeList.map((type) => (
                                <li
                                    key={type.id}
                                    className="group flex min-w-0 items-center justify-between gap-3 rounded-xl border border-border/80 bg-muted/15 px-4 py-3.5 transition-all duration-200 hover:border-primary/35 hover:bg-card hover:shadow-sm"
                                >
                                    <div className="flex min-w-0 items-center gap-3">
                                        <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                            <Tag className="size-3.5" />
                                        </span>
                                        <div className="min-w-0">
                                            <p className="truncate text-sm font-semibold text-foreground">
                                                {type.name}
                                            </p>
                                            <p className="font-mono text-[11px] text-muted-foreground">
                                                #{type.id}
                                            </p>
                                        </div>
                                    </div>

                                    {can.manage && (
                                        <FormDialog
                                            trigger={
                                                <Button
                                                    variant="ghost"
                                                    size="icon-sm"
                                                    aria-label={`Rename ${type.name}`}
                                                    className="shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
                                                >
                                                    <Pencil className="size-3.5" />
                                                </Button>
                                            }
                                            title="Rename request type"
                                            description="Documents already classified under this type follow the new name."
                                            icon={Pencil}
                                            form={requestTypes.update.form(
                                                type.id,
                                            )}
                                            submitLabel="Save name"
                                            submitIcon={Check}
                                        >
                                            {({ errors }) => (
                                                <FormField
                                                    label="Classification name"
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
                                                                type.name
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
                                </li>
                            ))}
                        </ul>
                    )}
                </SectionCard>
            </PageContainer>
        </>
    );
}

RequestTypeIndex.layout = {
    breadcrumbs: [{ title: 'Request Types', href: requestTypes.index() }],
};
