import { Form } from '@inertiajs/react';
import type { ComponentType, ReactNode, SVGProps } from 'react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogBody,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

type FormRoute = { action: string; method: 'get' | 'post' };

type RenderArgs = {
    processing: boolean;
    errors: Record<string, string>;
};

/**
 * A create/edit form that lives in a modal instead of on the page.
 *
 * Registration panels used to sit permanently above every directory listing,
 * pushing the actual records below the fold for the ninety-nine percent of
 * visits that only wanted to read them. The form is one click away now, and
 * the list gets the screen.
 *
 * The `<Form>` is `display: contents` so its header, scrolling body, and
 * footer land directly in the dialog's grid -- the submit button stays inside
 * the form element while staying pinned to the bottom of the dialog.
 */
export default function FormDialog({
    trigger,
    title,
    description,
    icon: Icon,
    form,
    size = 'md',
    submitLabel = 'Save',
    submitIcon: SubmitIcon,
    submitVariant = 'default',
    cancelLabel = 'Cancel',
    encType,
    resetOnSuccess = false,
    footerNote,
    open: controlledOpen,
    onOpenChange: controlledOnOpenChange,
    children,
}: {
    trigger?: ReactNode;
    title: string;
    description?: string;
    icon?: ComponentType<SVGProps<SVGSVGElement>>;
    form: FormRoute;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    submitLabel?: string;
    submitIcon?: ComponentType<SVGProps<SVGSVGElement>>;
    submitVariant?: 'default' | 'destructive' | 'outline' | 'secondary';
    cancelLabel?: string;
    encType?: string;
    resetOnSuccess?: boolean;
    footerNote?: ReactNode;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    children: (args: RenderArgs) => ReactNode;
}) {
    const [uncontrolledOpen, setUncontrolledOpen] = useState(false);

    const open = controlledOpen ?? uncontrolledOpen;

    /*
     * Tracked internally even when a parent passes `open`, so a caller can
     * subscribe to open/close (to reset a draft, say) without also taking on
     * ownership of the state.
     */
    function setOpen(next: boolean) {
        setUncontrolledOpen(next);
        controlledOnOpenChange?.(next);
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
            <DialogContent size={size}>
                <Form
                    {...form}
                    encType={encType}
                    resetOnSuccess={resetOnSuccess}
                    onSuccess={() => setOpen(false)}
                    className="contents"
                >
                    {({ processing, errors }) => (
                        <>
                            <DialogHeader>
                                <div className="flex items-start gap-3">
                                    {Icon && (
                                        <span className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary">
                                            <Icon className="size-4.5" />
                                        </span>
                                    )}
                                    <div className="min-w-0 space-y-1">
                                        <DialogTitle>{title}</DialogTitle>
                                        {description && (
                                            <DialogDescription>
                                                {description}
                                            </DialogDescription>
                                        )}
                                    </div>
                                </div>
                            </DialogHeader>

                            <DialogBody className="grid grid-cols-[minmax(0,1fr)] gap-4">
                                {children({
                                    processing,
                                    errors: errors as Record<string, string>,
                                })}
                            </DialogBody>

                            <DialogFooter
                                className={cn(
                                    footerNote && 'sm:justify-between',
                                )}
                            >
                                {footerNote && (
                                    <p className="text-xs text-muted-foreground">
                                        {footerNote}
                                    </p>
                                )}
                                <div className="flex flex-col-reverse gap-2.5 sm:flex-row sm:items-center">
                                    <DialogClose asChild>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            disabled={processing}
                                        >
                                            {cancelLabel}
                                        </Button>
                                    </DialogClose>
                                    <Button
                                        type="submit"
                                        variant={submitVariant}
                                        pending={processing}
                                    >
                                        {!processing && SubmitIcon && (
                                            <SubmitIcon className="size-4" />
                                        )}
                                        {submitLabel}
                                    </Button>
                                </div>
                            </DialogFooter>
                        </>
                    )}
                </Form>
            </DialogContent>
        </Dialog>
    );
}
