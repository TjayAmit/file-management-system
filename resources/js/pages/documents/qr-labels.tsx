import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Printer, QrCode, Scissors } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import documents from '@/routes/documents';

type Label = {
    reference: string;
    title: string | null;
    business: string;
    branch: string;
    request_type: string;
    storage_location: string;
    main_date: string | null;
    qr: string;
};

/**
 * High-precision print sheet styling.
 * The sheet is the physical deliverable taped to physical documents.
 */
const printStyles = `
@media print {
    @page {
        size: A4;
        margin: 8mm;
    }

    html, body {
        background: #fff !important;
        color: #000 !important;
    }

    .label-sheet {
        color: #000;
        gap: 0;
        display: grid !important;
        grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
    }

    .label {
        border-color: #94a3b8 !important;
        border-style: dashed !important;
        break-inside: avoid;
        page-break-inside: avoid;
        background: transparent !important;
    }

    .label-muted {
        color: #475569 !important;
    }
}
`;

export default function DocumentQrLabels({ labels }: { labels: Label[] }) {
    return (
        <>
            <Head title="QR Tracking Labels" />
            <style>{printStyles}</style>

            <div className="min-h-screen bg-background text-foreground">
                {/* Screen Preview Toolbar */}
                <header className="sticky top-0 z-10 border-b border-border/80 bg-background/90 px-4 py-4 shadow-2xs backdrop-blur-md sm:px-6 lg:px-8 print:hidden">
                    <div className="mx-auto flex w-full max-w-[112rem] flex-wrap items-center justify-between gap-4">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2">
                                <span className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                    <QrCode className="size-4" />
                                </span>
                                <h1 className="text-base font-bold text-foreground sm:text-lg">
                                    Physical QR Label Sheet
                                </h1>
                                <Badge
                                    variant="secondary"
                                    className="rounded-full"
                                >
                                    {labels.length} label
                                    {labels.length === 1 ? '' : 's'}
                                </Badge>
                            </div>
                            <p className="max-w-2xl text-xs text-muted-foreground">
                                Print on standard A4 paper, cut along the dashed
                                guidelines, and affix to physical paper folders.
                                The QR code contains the internal document
                                reference.
                            </p>
                        </div>

                        <div className="flex shrink-0 items-center gap-2.5">
                            <Button
                                asChild
                                variant="outline"
                                size="sm"
                                className="shadow-2xs"
                            >
                                <Link href={documents.index()}>
                                    <ArrowLeft className="size-3.5" />
                                    Back to Documents
                                </Link>
                            </Button>
                            <Button
                                onClick={() => window.print()}
                                size="sm"
                                className="gap-1.5 shadow-xs"
                            >
                                <Printer className="size-3.5" />
                                Print Label Sheet
                            </Button>
                        </div>
                    </div>
                </header>

                {/* Print Sheet Grid */}
                <main className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 lg:px-8 print:max-w-none print:p-0">
                    <div className="label-sheet grid gap-4 sm:grid-cols-2 print:gap-0 print:border-none">
                        {labels.map((label) => (
                            <article
                                key={label.reference}
                                className="label relative flex items-center gap-4 rounded-xl border border-dashed border-border bg-card p-4.5 shadow-2xs transition-all print:rounded-none print:p-3.5 print:shadow-none"
                            >
                                <div
                                    className="w-24 shrink-0 rounded-lg bg-white p-1 text-black shadow-2xs print:shadow-none [&>svg]:h-auto [&>svg]:w-full"
                                    aria-hidden
                                    dangerouslySetInnerHTML={{
                                        __html: label.qr,
                                    }}
                                />

                                <div className="min-w-0 flex-1 space-y-1 text-xs leading-snug">
                                    <div className="flex items-center justify-between gap-1">
                                        <p className="truncate text-sm font-bold text-foreground">
                                            {label.business}
                                        </p>
                                        <Scissors className="size-3 text-muted-foreground/50 print:hidden" />
                                    </div>
                                    <p className="label-muted truncate font-medium text-muted-foreground">
                                        {label.branch}
                                    </p>
                                    <p className="truncate pt-0.5 font-semibold text-foreground">
                                        {label.title ?? 'Untitled Document'}
                                    </p>
                                    <p className="label-muted truncate text-[11px] text-muted-foreground">
                                        <span>{label.request_type}</span>
                                        {' · '}
                                        <span className="tabular-nums">
                                            {label.main_date ??
                                                'No date on file'}
                                        </span>
                                    </p>
                                    <div className="flex items-center justify-between gap-1 pt-1">
                                        <span className="label-muted font-mono text-[10px] font-medium text-muted-foreground/90">
                                            {label.reference}
                                        </span>
                                        <span className="label-muted text-[10px] text-muted-foreground/80">
                                            {label.storage_location}
                                        </span>
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>
                </main>
            </div>
        </>
    );
}
