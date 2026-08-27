import { router } from '@inertiajs/react';
import { KeyRound } from 'lucide-react';
import { destroy } from '@/actions/Laravel/Passkeys/Http/Controllers/PasskeyRegistrationController';
import EmptyState from '@/components/empty-state';
import PasskeyItem from '@/components/passkey-item';
import PasskeyRegistration from '@/components/passkey-register';
import {
    SectionCard,
    SectionCardBody,
    SectionCardHeader,
} from '@/components/section-card';
import { Badge } from '@/components/ui/badge';
import type { Passkey } from '@/types/auth';

export type Props = {
    canManagePasskeys?: boolean;
    passkeys?: Passkey[];
};

export default function ManagePasskeys(props: Props) {
    const passkeys = props.passkeys ?? [];

    const handleDelete = (id: number, onError: () => void) => {
        router.delete(destroy.url(id), {
            preserveScroll: true,
            onError,
        });
    };

    const handleRegisterSuccess = () => {
        router.reload();
    };

    if (!(props.canManagePasskeys ?? false)) {
        return null;
    }

    return (
        <SectionCard>
            <SectionCardHeader
                title="Passkeys"
                description="Sign in with the device you already unlock — no password to type or leak."
                icon={KeyRound}
                actions={
                    <Badge variant="secondary" className="rounded-full">
                        {passkeys.length} registered
                    </Badge>
                }
            />

            {passkeys.length > 0 ? (
                <ul className="stagger divide-y divide-border/60">
                    {passkeys.map((passkey) => (
                        <li key={passkey.id}>
                            <PasskeyItem
                                passkey={passkey}
                                onDelete={handleDelete}
                            />
                        </li>
                    ))}
                </ul>
            ) : (
                <EmptyState
                    icon={KeyRound}
                    title="No passkeys yet"
                    description="Add one to sign in without a password on this device."
                />
            )}

            <SectionCardBody className="border-t border-border/70 bg-muted/15">
                <PasskeyRegistration onSuccess={handleRegisterSuccess} />
            </SectionCardBody>
        </SectionCard>
    );
}
