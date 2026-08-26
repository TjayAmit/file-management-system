import { Check, Plus, Search } from 'lucide-react';
import { useId, useRef, useState } from 'react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

export type TypeaheadOption = {
    id: number;
    label: string;
    hint?: string;
};

/**
 * The controlled-vocabulary input from PLAN.md 3.3: as the clerk types, the
 * values that already exist surface so an established one gets picked instead
 * of a new variant being born. Creating a genuinely new value is still
 * allowed — the suggestion is a nudge, never a gate.
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
    allowCreate?: boolean;
    disabled?: boolean;
    invalid?: boolean;
}) {
    const generatedId = useId();
    const inputId = id ?? generatedId;
    const [open, setOpen] = useState(false);
    const blurTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

    const term = value.trim().toLocaleLowerCase();
    const matches = term
        ? options
              .filter((option) =>
                  option.label.toLocaleLowerCase().includes(term),
              )
              .slice(0, 8)
        : options.slice(0, 8);

    const exactMatch = options.find(
        (option) => option.label.toLocaleLowerCase() === term,
    );
    const showCreateHint = allowCreate && term !== '' && !exactMatch;

    function handleSelect(option: TypeaheadOption) {
        onChange(option.label);
        onSelect(option);
        setOpen(false);
    }

    return (
        <div className="relative">
            <div className="relative">
                <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                    id={inputId}
                    name={name}
                    value={value}
                    disabled={disabled}
                    autoComplete="off"
                    role="combobox"
                    aria-expanded={open}
                    aria-autocomplete="list"
                    aria-invalid={invalid}
                    placeholder={placeholder}
                    className="pl-9"
                    onChange={(event) => {
                        onChange(event.target.value);
                        onSelect(null);
                        setOpen(true);
                    }}
                    onFocus={() => setOpen(true)}
                    onBlur={() => {
                        blurTimeout.current = setTimeout(
                            () => setOpen(false),
                            120,
                        );
                    }}
                    onKeyDown={(event) => {
                        if (event.key === 'Escape') {
                            setOpen(false);
                        }
                    }}
                />
            </div>

            {open && (matches.length > 0 || showCreateHint) && (
                <ul
                    role="listbox"
                    className="absolute z-50 mt-1 max-h-64 w-full overflow-y-auto rounded-lg border border-border bg-popover p-1 shadow-lg"
                    onMouseDown={() => {
                        if (blurTimeout.current) {
                            clearTimeout(blurTimeout.current);
                        }
                    }}
                >
                    {matches.map((option) => (
                        <li key={option.id}>
                            <button
                                type="button"
                                role="option"
                                aria-selected={option.id === selectedId}
                                onClick={() => handleSelect(option)}
                                className={cn(
                                    'flex w-full items-center justify-between gap-2 rounded-md px-2.5 py-2 text-left text-sm transition-colors hover:bg-accent',
                                    option.id === selectedId && 'bg-accent',
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
                                        <Check className="size-4" />
                                    )}
                                </span>
                            </button>
                        </li>
                    ))}

                    {showCreateHint && (
                        <li className="mt-1 flex items-start gap-2 rounded-md border-t border-border px-2.5 pt-2 pb-1.5 text-xs text-muted-foreground">
                            <Plus className="mt-0.5 size-3.5 shrink-0" />
                            <span>
                                No exact match. Keep typing to create{' '}
                                <span className="font-medium text-foreground">
                                    {value.trim()}
                                </span>{' '}
                                as a new entry.
                            </span>
                        </li>
                    )}
                </ul>
            )}
        </div>
    );
}
