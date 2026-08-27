import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { Loader2 } from 'lucide-react';
import * as React from 'react';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
    [
        'relative inline-flex shrink-0 items-center justify-center gap-2 rounded-lg text-sm font-medium whitespace-nowrap',
        'transition-[color,background-color,border-color,box-shadow,transform] duration-150',
        // A press that visibly registers. Encoding is repetitive, and a button
        // that does not move under the cursor gets clicked twice.
        'active:scale-[0.98] motion-reduce:active:scale-100',
        'disabled:pointer-events-none disabled:opacity-50',
        'outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50',
        'aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40',
        "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
    ],
    {
        variants: {
            variant: {
                default:
                    'bg-primary text-primary-foreground shadow-xs hover:bg-primary/90 hover:shadow-sm',
                destructive:
                    'bg-destructive text-white shadow-xs hover:bg-destructive/90 hover:shadow-sm focus-visible:ring-destructive/30',
                success:
                    'bg-success text-success-foreground shadow-xs hover:bg-success/90 hover:shadow-sm focus-visible:ring-success/30',
                outline:
                    'border border-input bg-card shadow-2xs hover:border-border hover:bg-accent hover:text-accent-foreground',
                secondary:
                    'bg-secondary text-secondary-foreground shadow-2xs hover:bg-secondary/80',
                ghost: 'hover:bg-accent hover:text-accent-foreground',
                link: 'text-primary underline-offset-4 hover:underline',
            },
            size: {
                default: 'h-9 px-4 py-2 has-[>svg]:px-3.5',
                sm: 'h-8 rounded-md px-3 text-xs has-[>svg]:px-2.5',
                lg: 'h-10 rounded-lg px-6 has-[>svg]:px-5',
                icon: 'size-9',
                'icon-sm': 'size-8 rounded-md',
            },
        },
        defaultVariants: {
            variant: 'default',
            size: 'default',
        },
    },
);

/**
 * Set `pending` on any button that fires a write. It disables the control,
 * swaps the leading icon for a spinner, and marks the element busy for
 * assistive tech -- so a slow save never looks like a click that missed.
 *
 * `pending` is ignored when `asChild` is set, because the child owns its own
 * content in that case (a `<Link>`, typically, which never pends).
 */
function Button({
    className,
    variant,
    size,
    asChild = false,
    pending = false,
    disabled,
    children,
    ...props
}: React.ComponentProps<'button'> &
    VariantProps<typeof buttonVariants> & {
        asChild?: boolean;
        pending?: boolean;
    }) {
    const Comp = asChild ? Slot : 'button';

    return (
        <Comp
            data-slot="button"
            data-pending={!asChild && pending ? '' : undefined}
            aria-busy={!asChild && pending ? true : undefined}
            disabled={asChild ? undefined : disabled || pending}
            className={cn(buttonVariants({ variant, size, className }))}
            {...props}
        >
            {asChild ? (
                children
            ) : (
                <>
                    {pending && <Loader2 aria-hidden className="animate-spin" />}
                    {children}
                </>
            )}
        </Comp>
    );
}

export { Button, buttonVariants };
