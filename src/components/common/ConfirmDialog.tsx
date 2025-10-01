"use client";

import React from "react";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger
} from "@/components/ui/alert-dialog";
import {Button, buttonVariants} from "@/components/ui/button";
import {AlertTriangle} from "lucide-react";
import {cn} from "@/lib/utils";

type ConfirmDialogProps = {
    children?: React.ReactNode;
    title?: string;
    description?: string;
    onConfirmAction: () => void;
    danger?: boolean;
    confirmText?: string;
    cancelText?: string;
    confirmDisabled?: boolean;
};

export function ConfirmDialog({
                                  children,
                                  title,
                                  description,
                                  onConfirmAction,
                                  danger = false,
                                  confirmText,
                                  cancelText,
                                  confirmDisabled = false
                              }: ConfirmDialogProps) {
    const computedTitle = title ?? "Bist du dir sicher?";
    const computedDescription = description ?? "Diese Aktion kann nicht rückgängig gemacht werden.";
    const computedConfirmText = confirmText ?? "Löschen";
    const computedCancelText = cancelText ?? "Abbrechen";
    const trigger = children ?? <Button variant="destructive">Aktion bestätigen</Button>;

    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <div className="flex items-center gap-2">
                        {danger && <AlertTriangle className="text-destructive h-5 w-5"/>}
                        <AlertDialogTitle>{computedTitle}</AlertDialogTitle>
                    </div>
                    <AlertDialogDescription>{computedDescription}</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>{computedCancelText}</AlertDialogCancel>
                    <AlertDialogAction
                        className={cn(buttonVariants({variant: danger ? "destructive" : "default"}))}
                        onClick={onConfirmAction}
                        disabled={confirmDisabled}
                    >
                        {computedConfirmText}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
