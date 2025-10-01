import {Loader2} from "lucide-react";
import {Button} from "@/components/ui/button";
import {ConfirmDialog} from "@/components/common/ConfirmDialog";

type LogoutSectionProps = {
    busy: boolean;
    triggerLabel: string;
    confirmTitle: string;
    confirmDescription: string;
    confirmText: string;
    cancelText: string;
    onConfirm: () => void;
};

export function LogoutSection({
                                  busy,
                                  triggerLabel,
                                  confirmTitle,
                                  confirmDescription,
                                  confirmText,
                                  cancelText,
                                  onConfirm
                              }: LogoutSectionProps) {
    return (
        <ConfirmDialog
            title={confirmTitle}
            description={confirmDescription}
            confirmText={confirmText}
            cancelText={cancelText}
            onConfirmAction={onConfirm}
            danger
            confirmDisabled={busy}
        >
            <Button
                className="w-full focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                disabled={busy}
            >
                {busy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden/> : triggerLabel}
            </Button>
        </ConfirmDialog>
    );
}
