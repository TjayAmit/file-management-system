import { Form } from '@inertiajs/react';
import { AlertTriangle, Info, ShieldAlert } from 'lucide-react';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

type FormRoute = { action: string; method: 'get' | 'post' };

export type ConfirmTone = 'danger' | 'warning' | 'primary';

const toneConfig: Record<
    ConfirmTone,
    {
        icon: ComponentType<SVGProps<SVGSVGElement>>;
        chip: string;
        confirm: 'destructive' | 'default';
        panel: string;
    }
> = {
    danger: {
        icon: ShieldAlert,
        chip: 'border-destructive/25 bg-destructive/10 text-destructive',
        confirm: 'destructive',
        panel: 'border-destructive/25 bg-destructive/[0.05]',
    },
    warning: {
        icon: AlertTriangle,
        chip: 'border-warning/35 bg-warning/15 text-warning-foreground dark:text-warning',
        confirm: 'default',
        panel: 'border-warning/35 bg-warning-muted/50',
    },
    primary: {
        icon: Info,
        chip: 'border-primary/20 bg-primary/10 text-primary',
        confirm: 'default',
        panel: 'border-border/70 bg-muted/40',
    },
};

/**
 * The stop before an action that cannot be walked back.
 *
 * Approving a deletion, merging two businesses, deactivating a staff account
 * and reverting a scan were all one unguarded click away from happening.
 * Each of those now states plainly what is about to change and to which
 * record, and waits.
 *
 * `confirmPhrase` raises the bar further: the operator retypes a short
 * string -- normally the name of the record being destroyed -- before the
 * confirm button unlocks. Reserve it for the genuinely irreversible; asking
 * for it on routine work only teaches people to type past it.
 */
export default function ConfirmDialog({
    trigger,
    title,
    description,
    tone = 'danger',
    icon,
    form,
    confirmLabel = 'Confirm',
    confirmIcon: ConfirmIcon,
    cancelLabel = 'Cancel',
    confirmPhrase,
    confirmPhraseLabel,
    details,
    fields,
    size = 'sm',
}: {
    trigger: ReactNode;
    title: string;
    description?: ReactNode;
    tone?: ConfirmTone;
    icon?: ComponentType<SVGProps<SVGSVGElement>>;
    form: FormRoute;
    confirmLabel?: string;
    confirmIcon?: ComponentType<SVGProps<SVGSVGElement>>;
    cancelLabel?: string;
    confirmPhrase?: string;
    confirmPhraseLabel?: ReactNode;
    details?: ReactNode;
    fields?: ReactNode;
    size?: 'sm' | 'md' | 'lg';
}) {
    const [open, setOpen] = useState(false);
    const [typed, setTyped] = useState('');

    const config = toneConfig[tone];
    const Icon = icon ?? config.icon;

    const locked =
        confirmPhrase !== undefined &&
        typed.trim().toLowerCase() !== confirmPhrase.trim().toLowerCase();

    function handleOpenChange(next: boolean) {
        setOpen(next);

        if (!next) {
            setTyped('');
        }
    }

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>{trigger}</DialogTrigger>
            <DialogContent size={size}>
                <Form
                    {...form}
                    onSuccess={() => handleOpenChange(false)}
                    className="contents"
                >
                    {({ processing }) => (
                        <>
                            <DialogHeader>
                                <div className="flex items-start gap-3">
                                    <span
                                        className={cn(
                                            'flex size-9 shrink-0 items-center justify-center rounded-xl border',
                                            config.chip,
                                        )}
                                    >
                                        <Icon className="size-4.5" />
                                    </span>
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
                                {details && (
                                    <div
                                        className={cn(
                                            'min-w-0 rounded-xl border px-4 py-3 text-sm break-words',
                                            config.panel,
                                        )}
                                    >
                                        {details}
                                    </div>
                                )}

                                {fields}

                                {confirmPhrase !== undefined && (
                                    <div className="grid gap-1.5">
                                        <Label
                                            htmlFor="confirm-phrase"
                                            className="text-xs font-semibold tracking-wide text-muted-foreground"
                                        >
                                            {confirmPhraseLabel ?? (
                                                <>
                                                    Type{' '}
                                                    <span className="font-mono text-foreground">
                                                        {confirmPhrase}
                                                    </span>{' '}
                                                    to confirm
                                                </>
                                            )}
                                        </Label>
                                        <Input
                                            id="confirm-phrase"
                                            value={typed}
                                            autoComplete="off"
                                            spellCheck={false}
                                            onChange={(event) =>
                                                setTyped(event.target.value)
                                            }
                                            placeholder={confirmPhrase}
                                            className="bg-card font-mono text-sm"
                                        />
                                    </div>
                                )}
                            </DialogBody>

                            <DialogFooter>
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
                                    variant={config.confirm}
                                    disabled={locked}
                                    pending={processing}
                                >
                                    {!processing && ConfirmIcon && (
                                        <ConfirmIcon className="size-4" />
                                    )}
                                    {confirmLabel}
                                </Button>
                            </DialogFooter>
                        </>
                    )}
                </Form>
            </DialogContent>
        </Dialog>
    );
}
