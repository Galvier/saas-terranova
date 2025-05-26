
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Department } from '@/integrations/supabase';
import { UseFormReturn } from 'react-hook-form';
import { z } from 'zod';
import { formSchema } from './metricFormSchema';

interface MetricConfigFieldsProps {
  form: UseFormReturn<z.infer<typeof formSchema>>;
  departments: Department[];
  isAdmin?: boolean;
  userDepartmentId?: string | null;
}

const MetricConfigFields: React.FC<MetricConfigFieldsProps> = ({ 
  form, 
  departments, 
  isAdmin = true, 
  userDepartmentId 
}) => {
  // Filter departments for non-admin users
  const availableDepartments = !isAdmin && userDepartmentId 
    ? departments.filter(dept => dept.id === userDepartmentId)
    : departments;

  return (
    <>
      <FormField
        control={form.control}
        name="department_id"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Departamento</FormLabel>
            <Select 
              onValueChange={field.onChange} 
              defaultValue={field.value}
              disabled={!isAdmin && userDepartmentId} // Disable for non-admin users
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um departamento" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {availableDepartments.map((dept) => (
                  <SelectItem key={dept.id} value={dept.id}>
                    {dept.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {!isAdmin && userDepartmentId && (
              <FormDescription>
                Como gestor, você só pode criar métricas para o seu departamento
              </FormDescription>
            )}
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="frequency"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Frequência</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="daily">Diária</SelectItem>
                <SelectItem value="weekly">Semanal</SelectItem>
                <SelectItem value="monthly">Mensal</SelectItem>
                <SelectItem value="quarterly">Trimestral</SelectItem>
                <SelectItem value="yearly">Anual</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="lower_is_better"
        render={({ field }) => (
          <FormItem className="flex items-center justify-between">
            <div className="space-y-0.5">
              <FormLabel>Valores menores são melhores</FormLabel>
              <FormDescription>
                Ative quando o objetivo é manter esta métrica abaixo da meta (ex: rotatividade, reclamações)
              </FormDescription>
            </div>
            <FormControl>
              <Switch
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            </FormControl>
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="is_active"
        render={({ field }) => (
          <FormItem className="flex items-center justify-between">
            <div className="space-y-0.5">
              <FormLabel>Ativo</FormLabel>
              <FormDescription>
                Determina se esta métrica está ativa para monitoramento
              </FormDescription>
            </div>
            <FormControl>
              <Switch
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            </FormControl>
          </FormItem>
        )}
      />
    </>
  );
};

export default MetricConfigFields;
