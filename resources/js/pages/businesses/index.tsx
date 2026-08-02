import { Head, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import type { FormEvent } from 'react';
import businesses from '@/actions/App/Http/Controllers/BusinessController';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';

interface BranchItem {
    id: number;
    location: string;
}

interface BusinessItem {
    id: number;
    name: string;
    branches?: BranchItem[];
}

export default function BusinessIndex({
    businesses: businessList,
}: {
    businesses: BusinessItem[];
}) {
    const { status, errors } = usePage<{
        status?: string;
        errors: Record<string, string>;
    }>().props;
    const [rowsText, setRowsText] = useState('');
    const [processing, setProcessing] = useState(false);

    function submit(e: FormEvent) {
        e.preventDefault();

        const rows = rowsText
            .split('\n')
            .map((line) => line.trim())
            .filter((line) => line !== '')
            .map((line) => {
                const [name, branch] = line
                    .split('|')
                    .map((part) => part.trim());

                return { name, branch: branch || null };
            });

        setProcessing(true);
        router.post(
            businesses.bulkSeed.url(),
            { rows },
            {
                onFinish: () => setProcessing(false),
                onSuccess: () => setRowsText(''),
            },
        );
    }

    return (
        <AppLayout breadcrumbs={[{ title: 'Businesses', href: '/businesses' }]}>
            <Head title="Businesses" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <h1 className="text-xl font-bold">Business Vocabulary</h1>

                <div className="rounded-lg border p-4">
                    <h2 className="mb-2 font-semibold">
                        Bulk seed known businesses
                    </h2>
                    <p className="mb-2 text-sm text-muted-foreground">
                        One entry per line: <code>Business Name</code> or{' '}
                        <code>Business Name | Branch Location</code>. Existing
                        businesses and branches (matched by exact name) are left
                        untouched.
                    </p>
                    {status && (
                        <p className="mb-2 text-sm text-green-600">{status}</p>
                    )}
                    <form onSubmit={submit} className="flex flex-col gap-2">
                        <textarea
                            className="min-h-32 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                            value={rowsText}
                            onChange={(e) => setRowsText(e.target.value)}
                            placeholder={'Acme Corp | Main St\nJollibee'}
                        />
                        {errors?.rows && (
                            <p className="text-sm text-destructive">
                                {errors.rows}
                            </p>
                        )}
                        <Button
                            type="submit"
                            disabled={processing}
                            className="self-start"
                        >
                            Seed businesses
                        </Button>
                    </form>
                </div>

                <div className="rounded-lg border p-4">
                    <ul className="divide-y">
                        {businessList?.map((business) => (
                            <li
                                key={business.id}
                                className="flex justify-between py-2"
                            >
                                <span>{business.name}</span>
                                <span className="text-sm text-muted-foreground">
                                    {business.branches?.length ?? 0} branches
                                </span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </AppLayout>
    );
}
