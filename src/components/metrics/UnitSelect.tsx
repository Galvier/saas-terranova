
import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const units = [
  { value: '%', label: 'Porcentagem' },
  { value: 'R$', label: 'Reais' },
  { value: 'USD', label: 'Dólares' },
  { value: 'un', label: 'Unidades' },
  { value: 'pts', label: 'Pontos' },
  { value: 'hrs', label: 'Horas' },
  { value: 'dias', label: 'Dias' },
] as const;

export type MetricUnit = typeof units[number]['value'];

interface UnitSelectProps {
  value: string;
  onChange: (value: string) => void;
}

export const UnitSelect: React.FC<UnitSelectProps> = ({ value, onChange }) => {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger>
        <SelectValue placeholder="Selecione a unidade" />
      </SelectTrigger>
      <SelectContent>
        {units.map((unit) => (
          <SelectItem key={unit.value} value={unit.value}>
            {unit.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
