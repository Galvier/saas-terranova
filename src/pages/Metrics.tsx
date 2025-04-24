import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Department, getAllDepartments, getMetricsByDepartment } from '@/integrations/supabase';
import MetricForm from '@/components/metrics/MetricForm';
import MetricCard from '@/components/metrics/MetricCard';

const Metrics = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all");

  const { data: departments = [], isLoading: isLoadingDepartments } = useQuery({
    queryKey: ['departments'],
    queryFn: async () => {
      const result = await getAllDepartments();
      if (result.error) throw new Error(result.message);
      return result.data || [];
    }
  });

  const { data: metrics = [], isLoading: isLoadingMetrics } = useQuery({
    queryKey: ['metrics', selectedDepartment],
    queryFn: async () => {
      const result = await getMetricsByDepartment(selectedDepartment);
      if (result.error) throw new Error(result.message);
      return result.data || [];
    }
  });

  const handleMetricSuccess = () => {
    setIsDialogOpen(false);
  };

  const isLoading = isLoadingDepartments || isLoadingMetrics;

  return (
    <div className="animate-fade-in">
      <PageHeader 
        title="Métricas" 
        subtitle="Gerencie as métricas de desempenho da empresa"
      />
      
      <div className="flex justify-between items-center gap-4 mb-6">
        <Select
          value={selectedDepartment}
          onValueChange={setSelectedDepartment}
        >
          <SelectTrigger className="w-[280px]">
            <SelectValue placeholder="Todos os departamentos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os departamentos</SelectItem>
            {departments.map((dept) => (
              <SelectItem key={dept.id} value={dept.id}>
                {dept.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Nova Métrica
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Criar Métrica</DialogTitle>
              <DialogDescription>
                Adicione uma nova métrica de desempenho para monitoramento.
              </DialogDescription>
            </DialogHeader>
            <MetricForm
              departments={departments}
              onSuccess={handleMetricSuccess}
            />
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="text-center py-8">Carregando métricas...</div>
      ) : metrics.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          Nenhuma métrica encontrada. Crie uma nova métrica para começar.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {metrics.map((metric) => (
            <MetricCard
              key={metric.id}
              metric={metric}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Metrics;
