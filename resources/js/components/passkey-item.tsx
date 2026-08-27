import { KeyRound, Trash2 } from 'lucide-react';
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
import type { Passkey } from '@/types/auth';

type Props = {
    passkey: Passkey;
    onDelete: (id: number, onError: () => void) => void;
};

export default function PasskeyItem({ passkey, onDelete }: Props) {
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = () => {
        setIsDeleting(true);
        onDelete(passkey.id, () => setIsDeleting(false));
    };

    return (
        <div className="flex items-center justify-between gap-3 px-5 py-4 transition-colors hover:bg-muted/25 sm:px-6">
            <div className="flex min-w-0 items-center gap-4">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/10">
                    <KeyRound className="size-4.5 text-primary" />
                </div>
                <div className="min-w-0 space-y-1">
                    <div className="flex items-center gap-2.5">
                        <p className="font-medium tracking-tight">
                            {passkey.name}
                        </p>
                        {passkey.authenticator && (
                            <span className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 text-[11px] font-medium tracking-wide text-muted-foreground uppercase ring-1 ring-border ring-inset">
                                {passkey.authenticator}
                            </span>
                        )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                        Added {passkey.created_at_diff}
                        {passkey.last_used_at_diff && (
                            <>
                                <span className="mx-1 text-muted-foreground/50">
                                    /
                                </span>
                                Last used {passkey.last_used_at_diff}
                            </>
                        )}
                    </p>
                </div>
            </div>

            <Dialog>
                <DialogTrigger asChild>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                    >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Remove</span>
                    </Button>
                </DialogTrigger>
                <DialogContent size="sm">
                    <DialogHeader>
                        <div className="flex items-start gap-3">
                            <span className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-destructive/25 bg-destructive/10 text-destructive">
                                <Trash2 className="size-4.5" />
                            </span>
                            <div className="min-w-0 space-y-1">
                                <DialogTitle>Remove passkey</DialogTitle>
                                <DialogDescription>
                                    You will no longer be able to sign in with
                                    this device.
                                </DialogDescription>
                            </div>
                        </div>
                    </DialogHeader>

                    <DialogBody>
                        <div className="rounded-xl border border-destructive/25 bg-destructive/[0.05] px-4 py-3">
                            <p className="font-medium text-foreground">
                                {passkey.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                Added {passkey.created_at_diff}
                            </p>
                        </div>
                    </DialogBody>

                    <DialogFooter>
                        <DialogClose asChild>
                            <Button type="button" variant="ghost">
                                Cancel
                            </Button>
                        </DialogClose>
                        <Button
                            variant="destructive"
                            onClick={handleDelete}
                            pending={isDeleting}
                        >
                            {!isDeleting && <Trash2 className="size-4" />}
                            Remove passkey
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
