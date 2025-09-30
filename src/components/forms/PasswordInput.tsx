import * as React from "react";
import {Input} from "@/components/ui/input";
import {Eye, EyeOff} from "lucide-react";
import {cn} from "@/lib/utils";

export type PasswordInputProps = React.ComponentPropsWithoutRef<"input">;

export const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
    ({className, ...props}, ref) => {
        const [isVisible, setIsVisible] = React.useState(false);

        return (
            <div className="relative">
                <Input
                    type={isVisible ? "text" : "password"}
                    className={cn("pr-10", className)}
                    ref={ref}
                    {...props}
                />
                <button
                    type="button"
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted"
                    onMouseDown={() => setIsVisible(true)}
                    onMouseUp={() => setIsVisible(false)}
                    onMouseLeave={() => setIsVisible(false)}
                    onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                            event.preventDefault();
                            setIsVisible((prev) => !prev);
                        }
                    }}
                    aria-label={isVisible ? "Hide password" : "Show password"}
                    tabIndex={0}
                >
                    {isVisible ? <Eye className="w-4"/> : <EyeOff className="w-4"/>}
                </button>
            </div>
        );
    },
);
PasswordInput.displayName = "PasswordInput";
