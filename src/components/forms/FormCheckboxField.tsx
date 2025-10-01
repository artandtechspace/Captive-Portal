import React from "react";
import {Control, FieldValues, Path} from "react-hook-form";
import {Checkbox} from "@/components/ui/checkbox";
import {FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {cn} from "@/lib/utils";

interface FormCheckboxFieldProps<TFieldValues extends FieldValues> {
    control: Control<TFieldValues>;
    name: Path<TFieldValues>;
    label: string;
    children?: React.ReactNode;
    isDanger?: boolean;
    onCheckedChange?: (value: boolean) => void;
}

export function FormCheckboxField<TFieldValues extends FieldValues>({
                                                                        control,
                                                                        name,
                                                                        label,
                                                                        children,
                                                                        isDanger = false,
                                                                        onCheckedChange
                                                                    }: FormCheckboxFieldProps<TFieldValues>) {
    return (
        <FormField
            control={control}
            name={name}
            render={({field}) => (
                <FormItem className="space-y-2">
                    <div
                        className={cn(
                            "flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow",
                            isDanger ? "border-destructive" : "border-input"
                        )}
                    >
                        <FormControl>
                            <Checkbox
                                checked={field.value}
                                onCheckedChange={(checked) => {
                                    field.onChange(checked);
                                    onCheckedChange?.(Boolean(checked));
                                }}
                            />
                        </FormControl>
                        <div className={cn("space-y-1 leading-none", isDanger && "text-destructive")}
                             aria-live="polite">
                            <FormLabel>{label}</FormLabel>
                            {children && <FormDescription>{children}</FormDescription>}
                        </div>
                    </div>
                    <FormMessage/>
                </FormItem>
            )}
        />
    );
}
