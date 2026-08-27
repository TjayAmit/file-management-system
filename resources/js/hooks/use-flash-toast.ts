import { router } from '@inertiajs/react';
import { useEffect } from 'react';
import { toast } from 'sonner';
import type { FlashToast } from '@/types/ui';

/**
 * Turns server feedback into a toast.
 *
 * Two channels feed this. `Inertia::flash('toast', ...)` carries an explicit
 * type and message; `back()->with('status', ...)` -- which is what every
 * domain controller uses after a write -- carries a bare success string.
 *
 * Both used to be handled differently: the status string was rendered as a
 * banner that each page had to remember to place, which pushed the content
 * down by a row and left the confirmation sitting on screen long after it
 * stopped being news. Every write now confirms itself the same way, in the
 * same corner, and gets out of the way.
 *
 * A `status` value only exists on the response that immediately follows the
 * write -- the session flash is consumed on read -- so an ordinary GET
 * navigation never re-announces an old one.
 */
export function useFlashToast(): void {
    useEffect(() => {
        const stopFlash = router.on('flash', (event) => {
            const flash = (event as CustomEvent).detail?.flash;
            const data = flash?.toast as FlashToast | undefined;

            if (!data) {
                return;
            }

            toast[data.type](data.message);
        });

        const stopSuccess = router.on('success', (event) => {
            const status = (event as CustomEvent).detail?.page?.props?.status;

            if (typeof status !== 'string' || status === '') {
                return;
            }

            toast.success(status);
        });

        return () => {
            stopFlash();
            stopSuccess();
        };
    }, []);
}
