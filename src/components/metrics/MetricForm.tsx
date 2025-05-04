
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Department, MetricDefinition, createMetricDefinition, updateMetricDefinition } from '@/integrations/supabase';
import { formSchema, FrequencyEnum, VisualizationTypeEnum, PriorityEnum, DefaultPeriodEnum } from './form/metricFormSchema';
import BasicMetricFields from './form/BasicMetricFields';
import MetricValueFields from './form/MetricValueFields';
import MetricConfigFields from './form/MetricConfigFields';
import VisualizationConfigFields from './form/VisualizationConfigFields';
import { z } from 'zod';

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
      unit: metric?.unit || 'R$',
      target: metric?.target || 0,
      department_id: metric?.department_id || '',
      frequency: (metric?.frequency as z.infer<typeof FrequencyEnum>) || 'monthly',
      is_active: metric?.is_active ?? true,
      lower_is_better: metric?.lower_is_better ?? false,
      visualization_type: (metric?.visualization_type as z.infer<typeof VisualizationTypeEnum>) || 'card',
      priority: (metric?.priority as z.infer<typeof PriorityEnum>) || 'normal',
      default_period: (metric?.default_period as z.infer<typeof DefaultPeriodEnum>) || 'month'
    }
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      console.log("Submitting form with values:", values);
      
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
          lower_is_better: values.lower_is_better,
          icon_name: 'chart-line', // Default icon
          visualization_type: values.visualization_type,
          priority: values.priority,
          default_period: values.default_period
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
          lower_is_better: values.lower_is_better,
          icon_name: 'chart-line', // Default icon
          visualization_type: values.visualization_type,
          priority: values.priority,
          default_period: values.default_period
        });
      }

      if (result.error) {
        console.error("Error from API:", result.error);
        throw new Error(result.error.message || "Erro ao processar operação");
      }

      toast({
        title: isEditing ? 'Métrica atualizada' : 'Métrica criada',
        description: isEditing ? 'Métrica atualizada com sucesso' : 'Métrica criada com sucesso'
      });

      onSuccess();
    } catch (error: any) {
      console.error("Exception in form submission:", error);
      toast({
        title: `Erro ao ${isEditing ? 'atualizar' : 'criar'} métrica`,
        description: error.message || "Erro desconhecido ao processar a operação",
        variant: 'destructive'
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <BasicMetricFields form={form} />
        <MetricValueFields form={form} />
        <MetricConfigFields form={form} departments={departments} />
        <VisualizationConfigFields form={form} />
        
        <Button type="submit" className="w-full">
          {isEditing ? 'Atualizar Métrica' : 'Criar Métrica'}
        </Button>
      </form>
    </Form>
  );
};

export default MetricForm;
