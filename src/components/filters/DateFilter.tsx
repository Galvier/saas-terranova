
import React, { useState } from 'react';
import { format, subDays, startOfMonth, endOfMonth, subMonths, subWeeks } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar as CalendarIcon, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

export type DateRangeType = 'day' | 'week' | 'month' | 'quarter' | 'year';

export type DatePreset = {
  label: string;
  startDate: Date;
  endDate: Date;
};

interface DateFilterProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  dateRangeType: DateRangeType;
  onDateRangeTypeChange: (type: DateRangeType) => void;
  className?: string;
}

const DateFilter: React.FC<DateFilterProps> = ({
  selectedDate,
  onDateChange,
  dateRangeType,
  onDateRangeTypeChange,
  className = ''
}) => {
  const [open, setOpen] = useState(false);
  
  // Date presets for quick selection
  const datePresets: DatePreset[] = [
    {
      label: "Hoje",
      startDate: new Date(),
      endDate: new Date(),
    },
    {
      label: "Ontem",
      startDate: subDays(new Date(), 1),
      endDate: subDays(new Date(), 1),
    },
    {
      label: "Últimos 7 dias",
      startDate: subDays(new Date(), 6),
      endDate: new Date(),
    },
    {
      label: "Último mês",
      startDate: startOfMonth(subMonths(new Date(), 1)),
      endDate: endOfMonth(subMonths(new Date(), 1)),
    },
    {
      label: "Este mês",
      startDate: startOfMonth(new Date()),
      endDate: new Date(),
    },
  ];
  
  // Apply date preset
  const handleDatePreset = (preset: DatePreset) => {
    onDateChange(preset.endDate);
    setOpen(false);
  };
  
  // Format the date display based on range type
  const getFormattedDateDisplay = () => {
    switch (dateRangeType) {
      case 'day':
        return format(selectedDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
      case 'week':
        const weekStart = subDays(selectedDate, 6);
        return `${format(weekStart, "dd/MM", { locale: ptBR })} - ${format(selectedDate, "dd/MM/yyyy", { locale: ptBR })}`;
      case 'month':
        return format(selectedDate, "MMMM 'de' yyyy", { locale: ptBR });
      case 'quarter':
        const quarter = Math.floor(selectedDate.getMonth() / 3) + 1;
        return `${quarter}º Trimestre de ${selectedDate.getFullYear()}`;
      case 'year':
        return format(selectedDate, "yyyy", { locale: ptBR });
      default:
        return format(selectedDate, "dd/MM/yyyy", { locale: ptBR });
    }
  };

  // Save preferences
  React.useEffect(() => {
    try {
      localStorage.setItem('dateFilterPreferences', JSON.stringify({
        date: selectedDate.toISOString(),
        type: dateRangeType,
      }));
    } catch (error) {
      console.error("Error saving date preferences", error);
    }
  }, [selectedDate, dateRangeType]);

  return (
    <div className={`flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-2 ${className}`}>
      <Select
        value={dateRangeType}
        onValueChange={(value) => onDateRangeTypeChange(value as DateRangeType)}
      >
        <SelectTrigger className="w-[120px]">
          <SelectValue placeholder="Período" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="day">Diário</SelectItem>
          <SelectItem value="week">Semanal</SelectItem>
          <SelectItem value="month">Mensal</SelectItem>
          <SelectItem value="quarter">Trimestral</SelectItem>
          <SelectItem value="year">Anual</SelectItem>
        </SelectContent>
      </Select>
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="h-10 w-full sm:w-auto">
            <span>Períodos predefinidos</span>
            <ChevronDown className="ml-2 h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-[200px]">
          {datePresets.map((preset) => (
            <DropdownMenuItem 
              key={preset.label}
              onClick={() => handleDatePreset(preset)}
            >
              {preset.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
      
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="w-full sm:w-auto justify-start text-left"
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {getFormattedDateDisplay()}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="end">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(date) => {
              if (date) {
                onDateChange(date);
                setOpen(false);
              }
            }}
            initialFocus
            className="p-3"
          />
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default DateFilter;
