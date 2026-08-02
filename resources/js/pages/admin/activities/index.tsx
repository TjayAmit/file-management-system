import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';

interface ActivityUser {
    id: number;
    name: string;
}

interface ActivityItem {
    id: number;
    user: ActivityUser | null;
    subject_type: string | null;
    subject_id: number | null;
    action: string;
    details: Record<string, unknown> | null;
    created_at: string;
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface ActivitiesPage {
    data: ActivityItem[];
    links: PaginationLink[];
}

function subjectLabel(subjectType: string | null): string {
    if (!subjectType) {
        return '—';
    }

    return subjectType.split('\\').pop() ?? subjectType;
}

function paginationLabel(label: string): string {
    return label.replace(/&laquo;/g, '«').replace(/&raquo;/g, '»');
}

export default function ActivityIndex({
    activities,
}: {
    activities: ActivitiesPage;
}) {
    return (
        <AppLayout
            breadcrumbs={[{ title: 'Activity Log', href: '/admin/activities' }]}
        >
            <Head title="Activity Log" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <h1 className="text-xl font-bold">Activity Log</h1>
                <div className="overflow-x-auto rounded-lg border">
                    <table className="w-full text-left text-sm">
                        <thead>
                            <tr className="border-b">
                                <th className="p-2">When</th>
                                <th className="p-2">User</th>
                                <th className="p-2">Action</th>
                                <th className="p-2">Subject</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {activities.data.map((activity) => (
                                <tr key={activity.id}>
                                    <td className="p-2 whitespace-nowrap">
                                        {activity.created_at}
                                    </td>
                                    <td className="p-2">
                                        {activity.user?.name ?? 'System'}
                                    </td>
                                    <td className="p-2 font-mono">
                                        {activity.action}
                                    </td>
                                    <td className="p-2">
                                        {subjectLabel(activity.subject_type)}
                                        {activity.subject_id !== null
                                            ? ` #${activity.subject_id}`
                                            : ''}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="flex gap-2">
                    {activities.links.map((link, index) => (
                        <Link
                            key={index}
                            href={link.url ?? '#'}
                            preserveScroll
                            className={`rounded px-2 py-1 text-sm ${
                                link.active
                                    ? 'bg-primary text-primary-foreground'
                                    : 'text-muted-foreground'
                            } ${link.url === null ? 'pointer-events-none opacity-50' : ''}`}
                        >
                            {paginationLabel(link.label)}
                        </Link>
                    ))}
                </div>
            </div>
        </AppLayout>
    );
}
