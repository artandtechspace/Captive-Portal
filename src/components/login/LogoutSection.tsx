// src/components/login/LogoutSection.tsx
import React, {useMemo} from "react";
import {ChevronDown, ChevronUp, Loader2} from "lucide-react";
import {Button} from "@/components/ui/button";
import {ConfirmDialog} from "@/components/common/ConfirmDialog";
import {Collapsible, CollapsibleContent, CollapsibleTrigger} from "@/components/ui/collapsible";
import ManualMetadataView from "@/components/forms/ManualMetadataView";
import type {AuthorizedClientStatusResponse} from "@/lib/api";

type LogoutSectionProps = {
    busy: boolean;
    triggerLabel: string;
    confirmTitle: string;
    confirmDescription: string;
    confirmText: string;
    cancelText: string;
    onConfirm: () => void;
    status?: AuthorizedClientStatusResponse | null;
};

export function LogoutSection({
                                  busy,
                                  triggerLabel,
                                  confirmTitle,
                                  confirmDescription,
                                  confirmText,
                                  cancelText,
                                  onConfirm,
                                  status
                              }: LogoutSectionProps) {
    const [showManualDetails, setShowManualDetails] = React.useState(false);

    const details = useMemo(() => {
        if (!status) return null;
        return {
            Benutzername: status.userName,
            "IP-Adresse": status.ipAddress,
            "MAC-Adresse": status.macAddress,
            "Session-ID": status.sessionId,
            "Startzeit": new Date(status.startTime * 1000).toLocaleString(),
        };
    }, [status]);

    const hasDetails = Boolean(details);

    return (
        <div className="w-full space-y-4">
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
                    variant="default"
                >
                    {busy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden/> : triggerLabel}
                </Button>
            </ConfirmDialog>

            {hasDetails && details && (
                <Collapsible
                    open={showManualDetails}
                    onOpenChange={setShowManualDetails}
                    className="w-full"
                >
                    <CollapsibleTrigger asChild>
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="w-full flex items-center justify-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                        >
                            {showManualDetails ? (
                                <ChevronUp className="h-4 w-4"/>
                            ) : (
                                <ChevronDown className="h-4 w-4"/>
                            )}
                            <span>Verbindungsdetails anzeigen</span>
                        </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent
                        className="mt-2 space-y-3 rounded-md border border-dashed border-muted-foreground/40 p-3 text-xs text-muted-foreground animate-in slide-in-from-top-2 fade-in duration-200"
                    >
                        <ManualMetadataView
                            metadata={details.toString()}
                            label={undefined}
                        />
                    </CollapsibleContent>
                </Collapsible>
            )}
        </div>
    );
}