import { Head } from '@inertiajs/react';
import { Palette } from 'lucide-react';
import AppearanceTabs from '@/components/appearance-tabs';
import {
    SectionCard,
    SectionCardBody,
    SectionCardHeader,
} from '@/components/section-card';
import { edit as editAppearance } from '@/routes/appearance';

export default function Appearance() {
    return (
        <>
            <Head title="Theme & Appearance" />

            <h1 className="sr-only">Theme & Appearance Settings</h1>

            <SectionCard>
                <SectionCardHeader
                    title="Theme and colour mode"
                    description="Saved per device. System follows whatever this machine is set to."
                    icon={Palette}
                />
                <SectionCardBody>
                    <AppearanceTabs />
                </SectionCardBody>
            </SectionCard>
        </>
    );
}

Appearance.layout = {
    breadcrumbs: [{ title: 'Theme & Appearance', href: editAppearance() }],
};
