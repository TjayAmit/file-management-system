import * as DialogPrimitive from '@radix-ui/react-dialog';
import { XIcon } from 'lucide-react';
import * as React from 'react';
import { cn } from '@/lib/utils';

type DialogSize = 'sm' | 'md' | 'lg' | 'xl';

const sizeClasses: Record<DialogSize, string> = {
    sm: 'sm:max-w-md',
    md: 'sm:max-w-lg',
    lg: 'sm:max-w-2xl',
    xl: 'sm:max-w-4xl',
};

function Dialog({
    ...props
}: React.ComponentProps<typeof DialogPrimitive.Root>) {
    return <DialogPrimitive.Root data-slot="dialog" {...props} />;
}

function DialogTrigger({
    ...props
}: React.ComponentProps<typeof DialogPrimitive.Trigger>) {
    return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />;
}

function DialogPortal({
    ...props
}: React.ComponentProps<typeof DialogPrimitive.Portal>) {
    return <DialogPrimitive.Portal data-slot="dialog-portal" {...props} />;
}

function DialogClose({
    ...props
}: React.ComponentProps<typeof DialogPrimitive.Close>) {
    return <DialogPrimitive.Close data-slot="dialog-close" {...props} />;
}

function DialogOverlay({
    className,
    ...props
}: React.ComponentProps<typeof DialogPrimitive.Overlay>) {
    return (
        <DialogPrimitive.Overlay
            data-slot="dialog-overlay"
            className={cn(
                'fixed inset-0 z-50 bg-foreground/35 backdrop-blur-[2px] duration-200',
                'data-[state=open]:animate-in data-[state=open]:fade-in-0',
                'data-[state=closed]:animate-out data-[state=closed]:fade-out-0',
                className,
            )}
            {...props}
        />
    );
}

/**
 * The content shell is a three-row grid -- header, scrolling body, footer --
 * so a long form scrolls inside the dialog while its title and its action
 * bar stay put. A modal whose "Save" button scrolls off the bottom is worse
 * than no modal at all.
 */
function DialogContent({
    className,
    children,
    size = 'md',
    showClose = true,
    ...props
}: React.ComponentProps<typeof DialogPrimitive.Content> & {
    size?: DialogSize;
    showClose?: boolean;
}) {
    return (
        <DialogPortal data-slot="dialog-portal">
            <DialogOverlay />
            <DialogPrimitive.Content
                data-slot="dialog-content"
                className={cn(
                    'fixed top-1/2 left-1/2 z-50 grid max-h-[calc(100dvh-2rem)] w-full max-w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 grid-rows-[auto_minmax(0,1fr)_auto] overflow-hidden rounded-2xl border border-border bg-card text-card-foreground shadow-2xl duration-200',
                    'data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[state=open]:slide-in-from-bottom-2',
                    'data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95',
                    sizeClasses[size],
                    className,
                )}
                {...props}
            >
                {children}
                {showClose && (
                    <DialogPrimitive.Close
                        aria-label="Close"
                        className="absolute top-4 right-4 rounded-lg p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none disabled:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0"
                    >
                        <XIcon />
                        <span className="sr-only">Close</span>
                    </DialogPrimitive.Close>
                )}
            </DialogPrimitive.Content>
        </DialogPortal>
    );
}

function DialogHeader({ className, ...props }: React.ComponentProps<'div'>) {
    return (
        <div
            data-slot="dialog-header"
            className={cn(
                'flex flex-col gap-1.5 border-b border-border/70 bg-muted/25 px-6 py-5 pr-12 text-left',
                className,
            )}
            {...props}
        />
    );
}

/** The scrolling middle of the dialog. Always the form body, never the actions. */
function DialogBody({ className, ...props }: React.ComponentProps<'div'>) {
    return (
        <div
            data-slot="dialog-body"
            className={cn('scroll-slim overflow-y-auto px-6 py-5', className)}
            {...props}
        />
    );
}

function DialogFooter({ className, ...props }: React.ComponentProps<'div'>) {
    return (
        <div
            data-slot="dialog-footer"
            className={cn(
                'flex flex-col-reverse gap-2.5 border-t border-border/70 bg-muted/25 px-6 py-4 sm:flex-row sm:items-center sm:justify-end',
                className,
            )}
            {...props}
        />
    );
}

function DialogTitle({
    className,
    ...props
}: React.ComponentProps<typeof DialogPrimitive.Title>) {
    return (
        <DialogPrimitive.Title
            data-slot="dialog-title"
            className={cn(
                'text-base font-semibold tracking-tight text-foreground',
                className,
            )}
            {...props}
        />
    );
}

function DialogDescription({
    className,
    ...props
}: React.ComponentProps<typeof DialogPrimitive.Description>) {
    return (
        <DialogPrimitive.Description
            data-slot="dialog-description"
            className={cn(
                'text-sm leading-relaxed text-pretty text-muted-foreground',
                className,
            )}
            {...props}
        />
    );
}

export {
    Dialog,
    DialogBody,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogOverlay,
    DialogPortal,
    DialogTitle,
    DialogTrigger,
};
