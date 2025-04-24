
import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Plus, ChartLine, Gauge, Thermometer, Activity, TrendingUp, TrendingDown, 
         CircleArrowUp, CircleArrowDown, Pencil, Trash2, BarChartHorizontal } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Department, MetricDefinition, getAllDepartments, getMetricsByDepartment, updateMetricDefinition, deleteMetricDefinition } from '@/integrations/supabase';
import MetricForm from '@/components/metrics/MetricForm';
import MetricValueForm from '@/components/metrics/MetricValueForm';
import { 
  Table,
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader,
  TableRow 
} from '@/components/ui/table';
import { CustomBadge } from '@/components/ui/custom-badge';
import { ArrowDown, ArrowUp } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useToast } from '@/hooks/use-toast';

const icons = [
  { name: 'chart-line', component: ChartLine },
  { name: 'bar-chart', component: BarChartHorizontal },
  { name: 'gauge', component: Gauge },
  { name: 'thermometer', component: Thermometer },
  { name: 'activity', component: Activity },
  { name: 'trending-up', component: TrendingUp },
  { name: 'trending-down', component: TrendingDown },
  { name: 'circle-arrow-up', component: CircleArrowUp },
  { name: 'circle-arrow-down', component: CircleArrowDown },
] as const;

const Metrics = () => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isValueDialogOpen, setIsValueDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all");
  const [selectedMetric, setSelectedMetric] = useState<MetricDefinition | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

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
    setIsCreateDialogOpen(false);
    setIsEditDialogOpen(false);
    queryClient.invalidateQueries({ queryKey: ['metrics'] });
  };

  const handleValueSuccess = () => {
    setIsValueDialogOpen(false);
    queryClient.invalidateQueries({ queryKey: ['metrics'] });
  };

  const handleAddValueClick = (metric: MetricDefinition) => {
    setSelectedMetric(metric);
    setIsValueDialogOpen(true);
  };

  const handleEditClick = (metric: MetricDefinition) => {
    setSelectedMetric(metric);
    setIsEditDialogOpen(true);
  };

  const handleDeleteClick = (metric: MetricDefinition) => {
    setSelectedMetric(metric);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedMetric) return;

    try {
      const result = await deleteMetricDefinition(selectedMetric.id);
      if (result.error) {
        toast({
          title: "Erro",
          description: `Não foi possível excluir a métrica: ${result.message}`,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Métrica excluída",
        description: "Métrica excluída com sucesso",
        variant: "default",
      });

      queryClient.invalidateQueries({ queryKey: ['metrics'] });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao excluir a métrica",
        variant: "destructive",
      });
    } finally {
      setIsDeleteDialogOpen(false);
      setSelectedMetric(null);
    }
  };

  const isLoading = isLoadingDepartments || isLoadingMetrics;

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'success': return 'success';
      case 'warning': return 'secondary';
      case 'danger': return 'destructive';
      default: return 'default';
    }
  };

  const getFrequencyLabel = (frequency: string) => {
    switch (frequency) {
      case 'daily': return 'Diária';
      case 'weekly': return 'Semanal';
      case 'monthly': return 'Mensal';
      case 'quarterly': return 'Trimestral';
      case 'yearly': return 'Anual';
      default: return frequency;
    }
  };

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

        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
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
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Métrica</TableHead>
                <TableHead>Departamento</TableHead>
                <TableHead>Meta</TableHead>
                <TableHead>Atual</TableHead>
                <TableHead className="text-center">Tendência</TableHead>
                <TableHead>Frequência</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-center">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {metrics.map((metric) => {
                const Icon = ChartLine; // Default icon
                const isCurrencyUnit = metric.unit === 'R$';

                return (
                  <TableRow key={metric.id} className="hover:bg-muted/50">
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        {metric.name}
                      </div>
                    </TableCell>
                    <TableCell>{metric.department_name || 'Sem departamento'}</TableCell>
                    <TableCell>
                      {isCurrencyUnit ? `R$ ${metric.target}` : `${metric.target} ${metric.unit}`}
                    </TableCell>
                    <TableCell>
                      {isCurrencyUnit ? `R$ ${metric.current}` : `${metric.current} ${metric.unit}`}
                    </TableCell>
                    <TableCell className="text-center">
                      {metric.trend !== 'neutral' ? (
                        <div className={`inline-flex ${
                          metric.trend === 'up' ? 'text-success' : 'text-destructive'
                        }`}>
                          {metric.trend === 'up' ? (
                            <ArrowUp className="h-4 w-4" />
                          ) : (
                            <ArrowDown className="h-4 w-4" />
                          )}
                        </div>
                      ) : (
                        <span>—</span>
                      )}
                    </TableCell>
                    <TableCell>{getFrequencyLabel(metric.frequency)}</TableCell>
                    <TableCell className="text-center">
                      <CustomBadge variant={getStatusVariant(metric.status)}>
                        {metric.status === 'success' ? 'Ótimo' : 
                         metric.status === 'warning' ? 'Atenção' : 'Crítico'}
                      </CustomBadge>
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-center gap-2">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-7 w-7"
                                onClick={() => handleAddValueClick(metric)}
                              >
                                <Plus className="h-3.5 w-3.5" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Registrar valor</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>

                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-7 w-7"
                                onClick={() => handleEditClick(metric)}
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Editar métrica</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-7 w-7 text-destructive hover:text-destructive"
                                onClick={() => handleDeleteClick(metric)}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Excluir métrica</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Edit Metric Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Editar Métrica</DialogTitle>
            <DialogDescription>
              Atualize os detalhes da métrica.
            </DialogDescription>
          </DialogHeader>
          {selectedMetric && (
            <MetricForm
              departments={departments}
              onSuccess={handleMetricSuccess}
              metric={selectedMetric}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Add Value Dialog */}
      <Dialog open={isValueDialogOpen} onOpenChange={setIsValueDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Registrar Valor</DialogTitle>
            <DialogDescription>
              Adicione um novo valor para a métrica {selectedMetric?.name}.
            </DialogDescription>
          </DialogHeader>
          {selectedMetric && (
            <MetricValueForm
              metric={selectedMetric}
              onSuccess={handleValueSuccess}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir a métrica "{selectedMetric?.name}"? 
              Todos os valores históricos associados serão excluídos permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive hover:bg-destructive/90">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Metrics;
