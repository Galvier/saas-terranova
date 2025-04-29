
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UseFormReturn } from 'react-hook-form';

interface VisualizationConfigFieldsProps {
  form: UseFormReturn<any>;
}

const VisualizationConfigFields: React.FC<VisualizationConfigFieldsProps> = ({ form }) => {
  return (
    <div className="space-y-4">
      <div className="text-sm font-medium pb-2 border-b">Configurações de visualização</div>
      
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <FormField
          control={form.control}
          name="visualization_type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tipo de visualização</FormLabel>
              <FormControl>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="card">Cartão KPI</SelectItem>
                    <SelectItem value="bar">Gráfico de barras</SelectItem>
                    <SelectItem value="line">Gráfico de linha</SelectItem>
                    <SelectItem value="pie">Gráfico de pizza</SelectItem>
                    <SelectItem value="area">Gráfico de área</SelectItem>
                    <SelectItem value="table">Tabela</SelectItem>
                  </SelectContent>
                </Select>
              </FormControl>
              <FormDescription>
                Como esta métrica será exibida no dashboard
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="priority"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Prioridade</FormLabel>
              <FormControl>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a prioridade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="high">Alta</SelectItem>
                    <SelectItem value="critical">Crítica</SelectItem>
                  </SelectContent>
                </Select>
              </FormControl>
              <FormDescription>
                Importância desta métrica no dashboard
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="default_period"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Período padrão</FormLabel>
              <FormControl>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o período" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="day">Diário</SelectItem>
                    <SelectItem value="week">Semanal</SelectItem>
                    <SelectItem value="month">Mensal</SelectItem>
                    <SelectItem value="quarter">Trimestral</SelectItem>
                    <SelectItem value="year">Anual</SelectItem>
                  </SelectContent>
                </Select>
              </FormControl>
              <FormDescription>
                Período inicial para visualização
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
};

export default VisualizationConfigFields;
