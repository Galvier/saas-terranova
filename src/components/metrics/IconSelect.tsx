
import React from 'react';
import { Button } from '@/components/ui/button';
import { ChartLine, Gauge, Thermometer, Activity, TrendingUp, TrendingDown, CircleArrowUp, CircleArrowDown } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

const icons = [
  { name: 'chart-line', component: ChartLine },
  { name: 'gauge', component: Gauge },
  { name: 'thermometer', component: Thermometer },
  { name: 'activity', component: Activity },
  { name: 'trending-up', component: TrendingUp },
  { name: 'trending-down', component: TrendingDown },
  { name: 'circle-arrow-up', component: CircleArrowUp },
  { name: 'circle-arrow-down', component: CircleArrowDown },
] as const;

export type MetricIcon = typeof icons[number]['name'];

interface IconSelectProps {
  value?: MetricIcon;
  onChange: (value: MetricIcon) => void;
}

export const IconSelect: React.FC<IconSelectProps> = ({ value, onChange }) => {
  const selectedIcon = icons.find(icon => icon.name === value);
  const IconComponent = selectedIcon?.component || ChartLine;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="w-[240px] justify-start"
        >
          <IconComponent className="mr-2 h-4 w-4" />
          {value ? value.split('-').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
          ).join(' ') : 'Select an icon'}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[240px] p-0">
        <div className="grid grid-cols-4 gap-2 p-2">
          {icons.map((icon) => {
            const Icon = icon.component;
            return (
              <Button
                key={icon.name}
                variant="ghost"
                className="flex h-9 w-9 p-0 justify-center items-center data-[state=selected]:bg-muted"
                onClick={() => onChange(icon.name)}
                data-state={value === icon.name ? 'selected' : 'idle'}
              >
                <Icon className="h-4 w-4" />
              </Button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
};
