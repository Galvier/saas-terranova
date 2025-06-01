
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UseFormReturn } from 'react-hook-form';

interface VisualizationConfigFieldsProps {
  form: UseFormReturn<any>;
}

const VisualizationConfigFields: React.FC<VisualizationConfigFieldsProps> = ({ form }) => {
  return (
    <div className="space-y-3">
      <div className="text-sm font-medium pb-1 border-b">Configurações de visualização</div>
      
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <FormField
          control={form.control}
          name="visualization_type"
          render={({ field }) => (
            <FormItem className="space-y-1">
              <FormLabel className="text-xs">Tipo de visualização</FormLabel>
              <FormControl>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Selecione" />
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
              <FormDescription className="text-xs">
                Como será exibida no dashboard
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="priority"
          render={({ field }) => (
            <FormItem className="space-y-1">
              <FormLabel className="text-xs">Prioridade</FormLabel>
              <FormControl>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Prioridade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="high">Alta</SelectItem>
                    <SelectItem value="critical">Crítica</SelectItem>
                  </SelectContent>
                </Select>
              </FormControl>
              <FormDescription className="text-xs">
                Importância no dashboard
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="default_period"
          render={({ field }) => (
            <FormItem className="space-y-1">
              <FormLabel className="text-xs">Período padrão</FormLabel>
              <FormControl>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                >
                  <SelectTrigger className="h-9">
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
              </FormControl>
              <FormDescription className="text-xs">
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
