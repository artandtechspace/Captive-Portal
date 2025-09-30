import {Loader2} from "lucide-react";
import {Button} from "@/components/ui/button";

type AnonymousLoginSectionProps = {
    description: string;
    buttonLabel: string;
    busy: boolean;
    onLogin: () => void;
};

export function AnonymousLoginSection({description, buttonLabel, busy, onLogin}: AnonymousLoginSectionProps) {
    return (
        <div className="space-y-4">
            <p className="text-sm text-muted-foreground">{description}</p>
            <Button
                className="w-full focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                onClick={onLogin}
                disabled={busy}
            >
                {busy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden/> : buttonLabel}
            </Button>
        </div>
    );
}
