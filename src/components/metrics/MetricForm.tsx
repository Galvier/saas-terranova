
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Department, MetricDefinition, createMetricDefinition, updateMetricDefinition } from '@/integrations/supabase';
import { IconSelect, type MetricIcon } from './IconSelect';
import { UnitSelect, units, type MetricUnit } from './UnitSelect';

const formSchema = z.object({
  name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  description: z.string().optional(),
  unit: z.string().min(1, 'Unidade é obrigatória'),
  target: z.coerce.number().positive('Meta deve ser um número positivo'),
  department_id: z.string().uuid('Departamento é obrigatório'),
  frequency: z.string(),
  is_active: z.boolean(),
  icon_name: z.string()
});

interface MetricFormProps {
  departments: Department[];
  onSuccess: () => void;
  metric?: MetricDefinition;
}

const MetricForm: React.FC<MetricFormProps> = ({ departments, onSuccess, metric }) => {
  const { toast } = useToast();
  const isEditing = !!metric;
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: metric?.name || '',
      description: metric?.description || '',
      unit: metric?.unit || '%',
      target: metric?.target || 0,
      department_id: metric?.department_id || '',
      frequency: metric?.frequency || 'monthly',
      is_active: metric?.is_active ?? true,
      icon_name: metric?.icon_name || 'chart-line'
    }
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      let result;
      
      if (isEditing && metric) {
        result = await updateMetricDefinition(metric.id, {
          name: values.name,
          description: values.description || '',
          unit: values.unit,
          target: values.target,
          department_id: values.department_id,
          frequency: values.frequency,
          is_active: values.is_active,
          icon_name: values.icon_name
        });
      } else {
        result = await createMetricDefinition({
          name: values.name,
          description: values.description || '',
          unit: values.unit,
          target: values.target,
          department_id: values.department_id,
          frequency: values.frequency,
          is_active: values.is_active,
          icon_name: values.icon_name
        });
      }

      if (result.error) {
        throw new Error(result.message);
      }

      toast({
        title: isEditing ? 'Métrica atualizada' : 'Métrica criada',
        description: isEditing ? 'Métrica atualizada com sucesso' : 'Métrica criada com sucesso'
      });

      onSuccess();
    } catch (error: any) {
      toast({
        title: `Erro ao ${isEditing ? 'atualizar' : 'criar'} métrica`,
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrição</FormLabel>
              <FormControl>
                <Textarea {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="icon_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ícone</FormLabel>
              <FormControl>
                <IconSelect 
                  value={field.value as MetricIcon} 
                  onChange={(value) => field.onChange(value)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="unit"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Unidade</FormLabel>
                <FormControl>
                  <UnitSelect {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="target"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Meta</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="number"
                    step="0.01"
                    onChange={e => field.onChange(parseFloat(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="department_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Departamento</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um departamento" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {departments.map((dept) => (
                    <SelectItem key={dept.id} value={dept.id}>
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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

        <Button type="submit" className="w-full">
          {isEditing ? 'Atualizar Métrica' : 'Criar Métrica'}
        </Button>
      </form>
    </Form>
  );
};

export default MetricForm;
