
import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Department, MetricDefinition } from '@/integrations/supabase';
import MetricForm from './MetricForm';
import MetricValueForm from './MetricValueForm';

interface MetricsDialogsProps {
  departments: Department[];
  selectedMetric: MetricDefinition | null;
  isCreateDialogOpen: boolean;
  isEditDialogOpen: boolean;
  isValueDialogOpen: boolean;
  isDeleteDialogOpen: boolean;
  onCreateSuccess: () => void;
  onEditSuccess: () => void;
  onValueSuccess: () => void;
  onDeleteConfirm: () => void;
  setIsCreateDialogOpen: (value: boolean) => void;
  setIsEditDialogOpen: (value: boolean) => void;
  setIsValueDialogOpen: (value: boolean) => void;
  setIsDeleteDialogOpen: (value: boolean) => void;
}

const MetricsDialogs: React.FC<MetricsDialogsProps> = ({
  departments,
  selectedMetric,
  isCreateDialogOpen,
  isEditDialogOpen,
  isValueDialogOpen,
  isDeleteDialogOpen,
  onCreateSuccess,
  onEditSuccess,
  onValueSuccess,
  onDeleteConfirm,
  setIsCreateDialogOpen,
  setIsEditDialogOpen,
  setIsValueDialogOpen,
  setIsDeleteDialogOpen,
}) => {
  return (
    <>
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="w-[95vw] max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Criar Métrica</DialogTitle>
            <DialogDescription>
              Adicione uma nova métrica de desempenho para monitoramento.
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[70vh] overflow-y-auto pr-2">
            <MetricForm
              departments={departments}
              onSuccess={onCreateSuccess}
            />
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="w-[95vw] max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Métrica</DialogTitle>
            <DialogDescription>
              Atualize os detalhes da métrica.
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[70vh] overflow-y-auto pr-2">
            {selectedMetric && (
              <MetricForm
                departments={departments}
                onSuccess={onEditSuccess}
                metric={selectedMetric}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isValueDialogOpen} onOpenChange={setIsValueDialogOpen}>
        <DialogContent className="w-[95vw] max-w-[500px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Registrar Valor</DialogTitle>
            <DialogDescription>
              Adicione um novo valor para a métrica {selectedMetric?.name}.
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[70vh] overflow-y-auto pr-2">
            {selectedMetric && (
              <MetricValueForm
                metric={selectedMetric}
                onSuccess={onValueSuccess}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>

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
            <AlertDialogAction onClick={onDeleteConfirm} className="bg-destructive hover:bg-destructive/90">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default MetricsDialogs;
