import { Form } from '@inertiajs/react';
import { AlertTriangle, Trash2 } from 'lucide-react';
import { useRef } from 'react';
import ProfileController from '@/actions/App/Http/Controllers/Settings/ProfileController';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import {
    SectionCard,
    SectionCardBody,
    SectionCardHeader,
} from '@/components/section-card';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogBody,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

export default function DeleteUser() {
    const passwordInput = useRef<HTMLInputElement>(null);

    return (
        <SectionCard tone="danger">
            <SectionCardHeader
                title="Delete account"
                description="Removes your account and everything attached to it. There is no undo."
                icon={Trash2}
                tone="danger"
                className="border-destructive/20 bg-destructive/[0.04]"
            />
            <SectionCardBody>
                <Dialog>
                    <DialogTrigger asChild>
                        <Button
                            variant="destructive"
                            data-test="delete-user-button"
                        >
                            <Trash2 className="size-4" />
                            Delete account
                        </Button>
                    </DialogTrigger>
                    <DialogContent size="sm">
                        <Form
                            {...ProfileController.destroy.form()}
                            options={{ preserveScroll: true }}
                            onError={() => passwordInput.current?.focus()}
                            resetOnSuccess
                            className="contents"
                        >
                            {({ resetAndClearErrors, processing, errors }) => (
                                <>
                                    <DialogHeader>
                                        <div className="flex items-start gap-3">
                                            <span className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-destructive/25 bg-destructive/10 text-destructive">
                                                <AlertTriangle className="size-4.5" />
                                            </span>
                                            <div className="min-w-0 space-y-1">
                                                <DialogTitle>
                                                    Delete your account?
                                                </DialogTitle>
                                                <DialogDescription>
                                                    Everything belonging to this
                                                    account is permanently
                                                    removed. Enter your password
                                                    to confirm.
                                                </DialogDescription>
                                            </div>
                                        </div>
                                    </DialogHeader>

                                    <DialogBody className="grid gap-2">
                                        <Label
                                            htmlFor="password"
                                            className="sr-only"
                                        >
                                            Password
                                        </Label>

                                        <PasswordInput
                                            id="password"
                                            name="password"
                                            ref={passwordInput}
                                            placeholder="Password"
                                            autoComplete="current-password"
                                            className="bg-card"
                                        />

                                        <InputError message={errors.password} />
                                    </DialogBody>

                                    <DialogFooter>
                                        <DialogClose asChild>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                onClick={() =>
                                                    resetAndClearErrors()
                                                }
                                            >
                                                Cancel
                                            </Button>
                                        </DialogClose>

                                        <Button
                                            type="submit"
                                            variant="destructive"
                                            pending={processing}
                                            data-test="confirm-delete-user-button"
                                        >
                                            Delete account
                                        </Button>
                                    </DialogFooter>
                                </>
                            )}
                        </Form>
                    </DialogContent>
                </Dialog>
            </SectionCardBody>
        </SectionCard>
    );
}
