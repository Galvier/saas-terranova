
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { Department } from '@/integrations/supabase/helpers';

interface DepartmentsSelectProps {
  departments: Department[];
  value?: string;
  onChange?: (value: string) => void;
  label?: string;
  description?: string;
  form?: ReturnType<typeof useForm>;
  name?: string;
  required?: boolean;
  error?: string;
}

export const DepartmentsSelect: React.FC<DepartmentsSelectProps> = ({
  departments,
  value,
  onChange,
  label = "Departamento",
  description = "Selecione o departamento",
  form,
  name = "department_id",
  required = false,
  error,
}) => {
  // If used as a standalone component
  if (!form || !name) {
    return (
      <div className="space-y-2">
        <label className="text-sm font-medium">{label}{required && <span className="text-destructive ml-1">*</span>}</label>
        <Select value={value} onValueChange={onChange}>
          <SelectTrigger className={error ? "border-destructive" : ""}>
            <SelectValue placeholder="Selecione um departamento" />
          </SelectTrigger>
          <SelectContent>
            {departments.map((department) => (
              <SelectItem key={department.id} value={department.id}>{department.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {description && <p className="text-xs text-muted-foreground">{description}</p>}
        {error && <p className="text-xs text-destructive">{error}</p>}
      </div>
    );
  }

  // If used with React Hook Form
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}{required && <span className="text-destructive ml-1">*</span>}</FormLabel>
          <Select onValueChange={field.onChange} defaultValue={field.value}>
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um departamento" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {departments.map((department) => (
                <SelectItem key={department.id} value={department.id}>{department.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormDescription>
            {description}
          </FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default DepartmentsSelect;
