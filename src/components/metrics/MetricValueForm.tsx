
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { MetricDefinition, recordMetricValue } from '@/integrations/supabase';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const formSchema = z.object({
  value: z.coerce.number().positive('Valor deve ser positivo'),
  date: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: 'Data inválida'
  })
});

interface MetricValueFormProps {
  metric: MetricDefinition;
  onSuccess: () => void;
}

const MetricValueForm: React.FC<MetricValueFormProps> = ({ metric, onSuccess }) => {
  const { toast } = useToast();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      value: 0,
      date: format(new Date(), 'yyyy-MM-dd')
    }
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const result = await recordMetricValue(
        metric.id,
        values.value,
        values.date
      );

      if (result.error) {
        throw new Error(result.message);
      }

      toast({
        title: 'Valor registrado',
        description: `Valor ${values.value} ${metric.unit} registrado para ${format(new Date(values.date), 'dd/MM/yyyy', { locale: ptBR })}`
      });

      onSuccess();
    } catch (error: any) {
      toast({
        title: 'Erro ao registrar valor',
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
          name="value"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Valor</FormLabel>
              <div className="flex items-center gap-2">
                <FormControl>
                  <Input
                    {...field}
                    type="number"
                    step="0.01"
                    onChange={e => field.onChange(parseFloat(e.target.value))}
                  />
                </FormControl>
                <span className="text-muted-foreground">{metric.unit}</span>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Data</FormLabel>
              <FormControl>
                <Input {...field} type="date" max={format(new Date(), 'yyyy-MM-dd')} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full">
          Registrar Valor
        </Button>
      </form>
    </Form>
  );
};

export default MetricValueForm;
