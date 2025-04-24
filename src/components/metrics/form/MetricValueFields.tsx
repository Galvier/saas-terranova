
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { UnitSelect } from '../UnitSelect';
import { UseFormReturn } from 'react-hook-form';
import { z } from 'zod';
import { formSchema } from './metricFormSchema';

interface MetricValueFieldsProps {
  form: UseFormReturn<z.infer<typeof formSchema>>;
}

const MetricValueFields: React.FC<MetricValueFieldsProps> = ({ form }) => {
  const isCurrencyUnit = form.watch('unit') === 'R$';

  return (
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
            <div className="flex items-center gap-2">
              {isCurrencyUnit && <span className="text-muted-foreground">R$</span>}
              <FormControl>
                <Input
                  {...field}
                  type="number"
                  step="0.01"
                  onChange={e => field.onChange(parseFloat(e.target.value))}
                />
              </FormControl>
              {!isCurrencyUnit && <span className="text-muted-foreground">{form.watch('unit')}</span>}
            </div>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

export default MetricValueFields;
