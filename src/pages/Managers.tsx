
import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import PageHeader from '@/components/PageHeader';
import { UserPlus } from 'lucide-react';
import { deleteManager, getAllManagers } from '@/integrations/supabase';
import { ManagerSearch } from '@/components/managers/ManagerSearch';
import { ManagerActions } from '@/components/managers/ManagerActions';
import { ManagersTable } from '@/components/managers/ManagersTable';
import { DeleteManagerDialog } from '@/components/managers/DeleteManagerDialog';
import { useNavigate } from 'react-router-dom';
import type { Manager } from '@/integrations/supabase';
import { useAuth } from '@/hooks/useAuth';

const Managers = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [managerToDelete, setManagerToDelete] = useState<Manager | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();

  const { data: managersData, isLoading, error } = useQuery({
    queryKey: ['managers'],
    queryFn: async () => {
      const result = await getAllManagers();
      if (result.error) throw new Error(result.message);
      return result.data || [];
    }
  });

  const managers = managersData || [];
  const filteredManagers = managers.filter(manager => 
    manager.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    manager.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const confirmDelete = async () => {
    if (managerToDelete && isAdmin) {
      try {
        const result = await deleteManager(managerToDelete.id);
        if (result.error) {
          throw new Error(result.message);
        }
        
        toast({
          title: "Gestor removido",
          description: `${managerToDelete.name} foi removido com sucesso.`
        });
        
        queryClient.invalidateQueries({queryKey: ['managers']});
      } catch (error: any) {
        toast({
          title: "Erro ao remover gestor",
          description: error.message,
          variant: "destructive"
        });
      }
      
      setManagerToDelete(null);
      setIsDeleteDialogOpen(false);
    }
  };

  const handleDeleteManager = (manager: Manager) => {
    if (isAdmin) {
      setManagerToDelete(manager);
      setIsDeleteDialogOpen(true);
    } else {
      toast({
        title: "Acesso negado",
        description: "Você não tem permissão para remover gestores",
        variant: "destructive"
      });
    }
  };

  if (error) {
    return (
      <div className="p-4 text-red-500">
        Erro ao carregar gestores: {error.message}
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader 
        title="Gestores" 
        subtitle="Gerencie os gestores e suas permissões"
        actionButton={
          isAdmin ? (
            <Button onClick={() => navigate('/managers/new')}>
              <UserPlus className="mr-2 h-4 w-4" />
              Novo Gestor
            </Button>
          ) : undefined
        }
      />
      
      <div className="flex items-center justify-between">
        <ManagerSearch 
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
        />
        {isAdmin && <ManagerActions />}
      </div>
      
      <ManagersTable 
        managers={filteredManagers}
        isLoading={isLoading}
        onDeleteManager={handleDeleteManager}
        isAdmin={isAdmin}
      />
      
      {isAdmin && (
        <DeleteManagerDialog 
          isOpen={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
          onConfirm={confirmDelete}
          manager={managerToDelete}
        />
      )}
    </div>
  );
};

export default Managers;
