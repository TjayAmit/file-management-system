import { Check, CornerDownLeft, Plus, Search } from 'lucide-react';
import type { KeyboardEvent } from 'react';
import { useId, useRef, useState } from 'react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

export type TypeaheadOption = {
    id: number;
    label: string;
    hint?: string;
};

const MAX_SUGGESTIONS = 8;

/**
 * The controlled-vocabulary input from PLAN.md 3.3: as the clerk types, the
 * values that already exist surface so an established one gets picked
 * instead of a new variant being born. Creating a genuinely new value is
 * still allowed -- the suggestion is a nudge, never a gate.
 *
 * Fully keyboard-driven, because encoding is: arrows move through matches,
 * Enter takes the highlighted one, Escape closes without choosing.
 */
export default function TypeaheadInput({
    options,
    value,
    selectedId,
    onChange,
    onSelect,
    placeholder,
    id,
    name,
    describedBy,
    allowCreate = true,
    disabled = false,
    invalid = false,
}: {
    options: TypeaheadOption[];
    value: string;
    selectedId: number | null;
    onChange: (value: string) => void;
    onSelect: (option: TypeaheadOption | null) => void;
    placeholder?: string;
    id?: string;
    name?: string;
    describedBy?: string;
    allowCreate?: boolean;
    disabled?: boolean;
    invalid?: boolean;
}) {
    const generatedId = useId();
    const inputId = id ?? generatedId;
    const listId = `${inputId}-listbox`;

    const [open, setOpen] = useState(false);
    const [highlighted, setHighlighted] = useState(0);
    const blurTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

    const term = value.trim().toLocaleLowerCase();

    const matches = (
        term
            ? options.filter((option) =>
                  option.label.toLocaleLowerCase().includes(term),
              )
            : options
    ).slice(0, MAX_SUGGESTIONS);

    const exactMatch = options.find(
        (option) => option.label.toLocaleLowerCase() === term,
    );
    const showCreateHint = allowCreate && term !== '' && !exactMatch;
    const isOpen = open && (matches.length > 0 || showCreateHint);

    function choose(option: TypeaheadOption) {
        onChange(option.label);
        onSelect(option);
        setOpen(false);
    }

    function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
        if (event.key === 'Escape') {
            setOpen(false);

            return;
        }

        if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
            event.preventDefault();

            if (!open) {
                setOpen(true);
                setHighlighted(0);

                return;
            }

            if (matches.length === 0) {
                return;
            }

            const step = event.key === 'ArrowDown' ? 1 : -1;
            setHighlighted(
                (current) => (current + step + matches.length) % matches.length,
            );

            return;
        }

        if (event.key === 'Enter' && isOpen && matches[highlighted]) {
            event.preventDefault();
            choose(matches[highlighted]);
        }
    }

    return (
        <div className="relative">
            <div className="relative">
                <Search
                    aria-hidden
                    className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
                />
                <Input
                    id={inputId}
                    name={name}
                    value={value}
                    disabled={disabled}
                    autoComplete="off"
                    role="combobox"
                    aria-expanded={isOpen}
                    aria-controls={isOpen ? listId : undefined}
                    aria-activedescendant={
                        isOpen && matches[highlighted]
                            ? `${listId}-option-${matches[highlighted].id}`
                            : undefined
                    }
                    aria-autocomplete="list"
                    aria-invalid={invalid}
                    aria-describedby={describedBy}
                    placeholder={placeholder}
                    className="pl-9"
                    onChange={(event) => {
                        onChange(event.target.value);
                        onSelect(null);
                        setHighlighted(0);
                        setOpen(true);
                    }}
                    onFocus={() => setOpen(true)}
                    onBlur={() => {
                        blurTimeout.current = setTimeout(
                            () => setOpen(false),
                            120,
                        );
                    }}
                    onKeyDown={handleKeyDown}
                />
            </div>

            {isOpen && (
                <div
                    className="absolute z-50 mt-1 w-full overflow-hidden rounded-lg border border-border bg-popover shadow-lg"
                    onMouseDown={() => {
                        if (blurTimeout.current) {
                            clearTimeout(blurTimeout.current);
                        }
                    }}
                >
                    <ul
                        id={listId}
                        role="listbox"
                        aria-label="Matching entries"
                        className="max-h-64 overflow-y-auto p-1"
                    >
                        {matches.map((option, index) => (
                            <li key={option.id}>
                                <button
                                    type="button"
                                    id={`${listId}-option-${option.id}`}
                                    role="option"
                                    aria-selected={option.id === selectedId}
                                    tabIndex={-1}
                                    onMouseEnter={() => setHighlighted(index)}
                                    onClick={() => choose(option)}
                                    className={cn(
                                        'flex w-full items-center justify-between gap-2 rounded-md px-2.5 py-2 text-left text-sm transition-colors',
                                        index === highlighted
                                            ? 'bg-accent text-accent-foreground'
                                            : 'hover:bg-accent/60',
                                    )}
                                >
                                    <span className="min-w-0 truncate">
                                        {option.label}
                                    </span>
                                    <span className="flex shrink-0 items-center gap-2">
                                        {option.hint && (
                                            <span className="text-xs text-muted-foreground">
                                                {option.hint}
                                            </span>
                                        )}
                                        {option.id === selectedId && (
                                            <Check className="size-4 text-primary" />
                                        )}
                                        {index === highlighted && (
                                            <CornerDownLeft
                                                aria-hidden
                                                className="size-3.5 text-muted-foreground"
                                            />
                                        )}
                                    </span>
                                </button>
                            </li>
                        ))}
                    </ul>

                    {showCreateHint && (
                        <p className="flex items-start gap-2 border-t border-border bg-muted/40 px-2.5 py-2 text-xs text-muted-foreground">
                            <Plus
                                aria-hidden
                                className="mt-0.5 size-3.5 shrink-0"
                            />
                            <span>
                                No exact match — saving will create{' '}
                                <span className="font-medium text-foreground">
                                    {value.trim()}
                                </span>{' '}
                                as a new entry.
                            </span>
                        </p>
                    )}
                </div>
            )}
        </div>
    );
}
