import { usePage } from '@inertiajs/react';
import { CheckCircle2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

/**
 * Renders the `status` a controller flashed after a successful write, so a
 * clerk gets confirmation without hunting for what changed.
 */
export default function FlashMessage() {
    const { status } = usePage<{ status?: string }>().props;

    if (!status) {
        return null;
    }

    return (
        <Alert
            className="border-primary/30 bg-primary/5"
            data-testid="flash-message"
        >
            <CheckCircle2 className="text-primary" />
            <AlertDescription className="text-foreground">
                {status}
            </AlertDescription>
        </Alert>
    );
}
