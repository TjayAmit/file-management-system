import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';

interface UserItem {
    id: number;
    name: string;
    email: string;
    role: string;
    is_active: boolean;
}

export default function UserIndex({ users }: { users: UserItem[] }) {
    return (
        <AppLayout
            breadcrumbs={[{ title: 'User Management', href: '/admin/users' }]}
        >
            <Head title="User Management" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <h1 className="text-xl font-bold">User Management</h1>
                <div className="rounded-lg border p-4">
                    <ul className="divide-y">
                        {users?.map((user) => (
                            <li
                                key={user.id}
                                className="flex justify-between py-2"
                            >
                                <span>
                                    {user.name} ({user.email})
                                </span>
                                <span className="font-semibold capitalize">
                                    {user.role}
                                </span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </AppLayout>
    );
}
