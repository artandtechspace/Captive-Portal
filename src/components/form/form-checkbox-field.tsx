"use client";

import React from "react";
import {Control, FieldPath, FieldValues} from "react-hook-form";

import {Checkbox} from "@/components/ui/checkbox";
import {
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from "@/components/ui/form";

interface FormCheckboxFieldProps<TFieldValues extends FieldValues> {
    control: Control<TFieldValues>;
    name: FieldPath<TFieldValues>;
    label: string;
    children?: React.ReactNode;
    isDanger?: boolean;
    disabled?: boolean;
    onChange?: (checked: boolean) => void;
}

export function FormCheckboxField<TFieldValues extends FieldValues>({
                                                                         control,
                                                                         name,
                                                                         label,
                                                                         children,
                                                                         isDanger = false,
                                                                         disabled = false,
                                                                         onChange
                                                                     }: FormCheckboxFieldProps<TFieldValues>) {
    return (
        <FormField
            control={control}
            name={name}
            render={({field}) => (
                <FormItem>
                    <div
                        className={`flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow ${
                            isDanger ? "border-destructive" : "border-input"
                        } ${isDanger ? "text-destructive" : ""}`}
                    >
                        <FormControl>
                            <Checkbox
                                checked={field.value}
                                onCheckedChange={(value) => {
                                    field.onChange(value);
                                    onChange?.(Boolean(value));
                                }}
                                disabled={disabled}
                            />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                            <FormLabel className={isDanger ? "text-destructive" : undefined}>{label}</FormLabel>
                            {children && <FormDescription>{children}</FormDescription>}
                        </div>
                    </div>
                    <FormMessage/>
                </FormItem>
            )}
        />
    );
}
