
import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';

interface MobileSwitchControlProps {
  id: string;
  title: string;
  description: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  icon?: React.ComponentType<{ className?: string }>;
}

const MobileSwitchControl: React.FC<MobileSwitchControlProps> = ({
  id,
  title,
  description,
  checked,
  onCheckedChange,
  disabled = false,
  icon: Icon
}) => {
  return (
    <button
      onClick={() => !disabled && onCheckedChange(!checked)}
      disabled={disabled}
      className="w-full flex items-center justify-between p-3 rounded-lg border transition-all duration-200 min-h-[48px] touch-manipulation hover:bg-muted/50 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {Icon && <Icon className="h-4 w-4 flex-shrink-0 text-muted-foreground" />}
        <div className="flex flex-col items-start gap-0.5 min-w-0">
          <span className="text-sm font-medium text-left">{title}</span>
          <span className="text-xs text-muted-foreground text-left line-clamp-2">
            {description}
          </span>
        </div>
      </div>
      <div className="flex items-center flex-shrink-0 ml-3">
        <Checkbox 
          id={id}
          checked={checked}
          onCheckedChange={onCheckedChange}
          disabled={disabled}
          className={cn(
            "h-4 w-4",
            checked && "bg-primary border-primary data-[state=checked]:bg-primary data-[state=checked]:border-primary"
          )}
        />
      </div>
    </button>
  );
};

export default MobileSwitchControl;
