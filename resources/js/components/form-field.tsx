import type { ReactNode } from 'react';
import { useId } from 'react';
import InputError from '@/components/input-error';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

/**
 * Label, control, hint, and error in one consistent block.
 *
 * The children callback receives the ids the field owns, so the control is
 * always wired to its label and to whichever of hint/error is showing --
 * a screen reader then announces the requirement and the failure together.
 */
export default function FormField({
    label,
    hint,
    error,
    required = false,
    optional = false,
    className,
    children,
}: {
    label: string;
    hint?: string;
    error?: string;
    required?: boolean;
    optional?: boolean;
    className?: string;
    children: (ids: {
        id: string;
        describedBy: string | undefined;
        invalid: boolean;
    }) => ReactNode;
}) {
    const id = useId();
    const hintId = `${id}-hint`;
    const errorId = `${id}-error`;

    const describedBy =
        [error ? errorId : null, hint ? hintId : null]
            .filter(Boolean)
            .join(' ') || undefined;

    return (
        <div className={cn('grid gap-1.5', className)}>
            <div className="flex items-baseline justify-between gap-2">
                <Label htmlFor={id}>
                    {label}
                    {required && (
                        <span
                            aria-hidden
                            className="ml-0.5 text-destructive"
                            title="Required"
                        >
                            *
                        </span>
                    )}
                </Label>
                {optional && (
                    <span className="text-xs text-muted-foreground">
                        Optional
                    </span>
                )}
            </div>

            {children({ id, describedBy, invalid: Boolean(error) })}

            {hint && !error && (
                <p
                    id={hintId}
                    className="text-xs leading-relaxed text-muted-foreground"
                >
                    {hint}
                </p>
            )}

            <InputError id={errorId} message={error} />
        </div>
    );
}
