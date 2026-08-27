import { Form } from '@inertiajs/react';
import { ShieldCheck, ShieldOff } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import ConfirmDialog from '@/components/confirm-dialog';
import {
    SectionCard,
    SectionCardBody,
    SectionCardHeader,
} from '@/components/section-card';
import StatusBadge from '@/components/status-badge';
import TwoFactorRecoveryCodes from '@/components/two-factor-recovery-codes';
import TwoFactorSetupModal from '@/components/two-factor-setup-modal';
import { Button } from '@/components/ui/button';
import { useTwoFactorAuth } from '@/hooks/use-two-factor-auth';
import { disable, enable } from '@/routes/two-factor';

export type Props = {
    canManageTwoFactor?: boolean;
    requiresConfirmation?: boolean;
    twoFactorEnabled?: boolean;
};

export default function ManageTwoFactor(props: Props) {
    const requiresConfirmation = props.requiresConfirmation ?? false;
    const twoFactorEnabled = props.twoFactorEnabled ?? false;

    const {
        qrCodeSvg,
        hasSetupData,
        manualSetupKey,
        clearSetupData,
        clearTwoFactorAuthData,
        fetchSetupData,
        recoveryCodesList,
        fetchRecoveryCodes,
        errors,
    } = useTwoFactorAuth();
    const [showSetupModal, setShowSetupModal] = useState<boolean>(false);
    const prevTwoFactorEnabled = useRef(twoFactorEnabled);

    useEffect(() => {
        if (prevTwoFactorEnabled.current && !twoFactorEnabled) {
            clearTwoFactorAuthData();
        }

        prevTwoFactorEnabled.current = twoFactorEnabled;
    }, [twoFactorEnabled, clearTwoFactorAuthData]);

    if (!(props.canManageTwoFactor ?? false)) {
        return null;
    }

    return (
        <SectionCard>
            <SectionCardHeader
                title="Two-factor authentication"
                description="A rotating pin from your phone, on top of the password."
                icon={ShieldCheck}
                actions={
                    <StatusBadge
                        tone={twoFactorEnabled ? 'success' : 'warning'}
                        dot
                        pulse={!twoFactorEnabled}
                    >
                        {twoFactorEnabled ? 'Enabled' : 'Not enabled'}
                    </StatusBadge>
                }
            />

            <SectionCardBody className="space-y-5">
                {twoFactorEnabled ? (
                    <>
                        <p className="max-w-2xl text-sm leading-relaxed text-pretty text-muted-foreground">
                            You are prompted for a secure, random pin at every
                            sign-in. Retrieve it from the TOTP-capable
                            application on your phone.
                        </p>

                        <ConfirmDialog
                            trigger={
                                <Button variant="destructive" size="sm">
                                    <ShieldOff className="size-3.5" />
                                    Disable 2FA
                                </Button>
                            }
                            tone="danger"
                            icon={ShieldOff}
                            title="Turn off two-factor authentication?"
                            description="Your account falls back to password-only sign-in, and the existing recovery codes stop working."
                            form={disable.form()}
                            confirmLabel="Disable 2FA"
                            confirmIcon={ShieldOff}
                        />

                        <TwoFactorRecoveryCodes
                            recoveryCodesList={recoveryCodesList}
                            fetchRecoveryCodes={fetchRecoveryCodes}
                            errors={errors}
                        />
                    </>
                ) : (
                    <>
                        <p className="max-w-2xl text-sm leading-relaxed text-pretty text-muted-foreground">
                            Once enabled, sign-in asks for a pin from a
                            TOTP-capable application on your phone as well as
                            your password.
                        </p>

                        {hasSetupData ? (
                            <Button onClick={() => setShowSetupModal(true)}>
                                <ShieldCheck className="size-4" />
                                Continue setup
                            </Button>
                        ) : (
                            <Form
                                {...enable.form()}
                                onSuccess={() => setShowSetupModal(true)}
                            >
                                {({ processing }) => (
                                    <Button type="submit" pending={processing}>
                                        {!processing && (
                                            <ShieldCheck className="size-4" />
                                        )}
                                        Enable 2FA
                                    </Button>
                                )}
                            </Form>
                        )}
                    </>
                )}
            </SectionCardBody>

            <TwoFactorSetupModal
                isOpen={showSetupModal}
                onClose={() => setShowSetupModal(false)}
                requiresConfirmation={requiresConfirmation}
                twoFactorEnabled={twoFactorEnabled}
                qrCodeSvg={qrCodeSvg}
                manualSetupKey={manualSetupKey}
                clearSetupData={clearSetupData}
                fetchSetupData={fetchSetupData}
                errors={errors}
            />
        </SectionCard>
    );
}
