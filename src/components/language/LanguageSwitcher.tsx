import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { LanguageOption } from '@/lib/i18n';
import { cn } from '@/lib/utils';

export type LanguageSwitcherProps = {
  id?: string;
  label: string;
  value: string;
  options: LanguageOption[];
  onChange: (value: string) => void;
  disabled?: boolean;
  className?: string;
  labelClassName?: string;
  triggerClassName?: string;
};

export const LanguageSwitcher = ({
  id = 'language-select',
  label,
  value,
  options,
  onChange,
  disabled = false,
  className,
  labelClassName,
  triggerClassName,
}: LanguageSwitcherProps) => {
  const hasOptions = options.length > 0;

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <Label
        htmlFor={id}
        className={cn('text-sm font-medium text-muted-foreground', labelClassName)}
      >
        {label}
      </Label>
      <Select value={value} onValueChange={onChange} disabled={disabled}>
        <SelectTrigger
          id={id}
          className={cn(
            'w-[160px] rounded-md border border-input bg-background text-sm',
            triggerClassName,
          )}
        >
          <SelectValue placeholder={label} />
        </SelectTrigger>
        <SelectContent>
          {hasOptions
            ? options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))
            : null}
        </SelectContent>
      </Select>
    </div>
  );
};
