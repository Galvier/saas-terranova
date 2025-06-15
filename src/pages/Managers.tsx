
import React, { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import PageHeader from '@/components/PageHeader';
import { UserPlus, RefreshCcw, WrenchIcon } from 'lucide-react';
import { deleteManager, getAllManagers, fixAuthManagerInconsistencies } from '@/integrations/supabase';
import { ManagerSearch } from '@/components/managers/ManagerSearch';
import { ManagersTable } from '@/components/managers/ManagersTable';
import { DeleteManagerDialog } from '@/components/managers/DeleteManagerDialog';
import { useNavigate } from 'react-router-dom';
import type { Manager } from '@/integrations/supabase';
import { useAuth } from '@/hooks/useAuth';

const Managers = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [managerToDelete, setManagerToDelete] = useState<Manager | null>(null);
  const [isFixingInconsistencies, setIsFixingInconsistencies] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { isAdmin, user, refreshUser } = useAuth();

  const { data: managersData, isLoading, error, refetch } = useQuery({
    queryKey: ['managers'],
    queryFn: async () => {
      console.log('[Managers] Fetching managers data...');
      const result = await getAllManagers();
      if (result.error) throw new Error(result.message);
      console.log('[Managers] Raw managers data:', result.data);
      return result.data || [];
    }
  });

  const managers = managersData || [];
  
  // Debug: Log sync status calculation
  useEffect(() => {
    if (managers.length > 0) {
      console.log('[Managers] Sync status analysis:');
      managers.forEach(manager => {
        const hasAuthUser = !!manager.user_id;
        console.log(`- ${manager.name} (${manager.email}): user_id=${manager.user_id}, synced=${hasAuthUser}`);
      });
    }
  }, [managers]);
  
  const filteredManagers = managers.filter(manager => 
    manager.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    manager.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Count managers without user_id (apenas para admins)
  const unsyncedManagersCount = isAdmin ? managers.filter(m => !m.user_id).length : 0;
  
  console.log('[Managers] Unsynced managers count:', unsyncedManagersCount);

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

  const handleRefreshData = async () => {
    try {
      console.log('[Managers] Refreshing all data...');
      
      toast({
        title: "Atualizando dados",
        description: "Carregando informações mais recentes..."
      });
      
      // Force a complete refresh of managers data
      await queryClient.invalidateQueries({ queryKey: ['managers'] });
      await Promise.all([
        refetch(),
        refreshUser()
      ]);
      
      // Add a small delay to ensure database changes are reflected
      setTimeout(() => {
        toast({
          title: "Dados atualizados",
          description: "Lista de gestores e permissões atualizadas com sucesso"
        });
      }, 500);
    } catch (error) {
      console.error("Erro ao atualizar dados:", error);
      toast({
        title: "Erro na atualização",
        description: "Não foi possível atualizar os dados",
        variant: "destructive" 
      });
    }
  };

  const handleFixInconsistencies = async () => {
    if (!isAdmin) {
      toast({
        title: "Acesso negado",
        description: "Apenas administradores podem executar funções de diagnóstico",
        variant: "destructive"
      });
      return;
    }

    setIsFixingInconsistencies(true);
    
    toast({
      title: "Diagnóstico iniciado",
      description: "Corrigindo inconsistências entre gestores e contas de usuários..."
    });
    
    try {
      console.log('[Managers] Iniciando correção de inconsistências');
      const result = await fixAuthManagerInconsistencies();
      
      if (result.error) {
        console.error('[Managers] Erro ao corrigir inconsistências:', result.error);
        throw new Error(result.message);
      }
      
      const updatedCount = result.data?.managers_updated || 0;
      const managersWithoutAuth = result.data?.managers_without_auth || 0;
      
      console.log('[Managers] Resultado da correção:', { updatedCount, managersWithoutAuth });
      
      // Force immediate refresh of data after fix
      console.log('[Managers] Forçando atualização dos dados após correção...');
      await queryClient.invalidateQueries({ queryKey: ['managers'] });
      
      // Wait a moment for the database to settle, then refetch
      setTimeout(async () => {
        await refetch();
        console.log('[Managers] Dados atualizados após correção');
      }, 1000);
      
      if (updatedCount > 0) {
        toast({
          title: "Diagnóstico concluído",
          description: `${updatedCount} gestores foram sincronizados com contas existentes.${managersWithoutAuth > 0 ? ` ${managersWithoutAuth} gestores ainda precisam de conta de acesso.` : ''}`
        });
      } else if (managersWithoutAuth > 0) {
        toast({
          title: "Diagnóstico concluído",
          description: `${managersWithoutAuth} gestores precisam de conta de acesso. Use "Criar conta de acesso" no menu de ações.`
        });
      } else {
        toast({
          title: "Diagnóstico concluído",
          description: "Todos os gestores estão sincronizados corretamente."
        });
      }
    } catch (error: any) {
      console.error('[Managers] Erro capturado durante o diagnóstico:', error);
      toast({
        title: "Erro durante diagnóstico",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsFixingInconsistencies(false);
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
        subtitle={isAdmin ? "Gerencie os gestores e suas permissões" : "Visualize a lista de gestores"}
        actionButton={
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={handleRefreshData}
              className="flex items-center gap-1"
            >
              <RefreshCcw className="h-4 w-4" />
              <span className="hidden sm:inline">Atualizar</span>
            </Button>
            
            {isAdmin && (
              <>
                <Button 
                  variant="outline" 
                  onClick={handleFixInconsistencies}
                  disabled={isFixingInconsistencies}
                  className="flex items-center gap-1"
                >
                  <WrenchIcon className={`h-4 w-4 ${isFixingInconsistencies ? 'animate-spin' : ''}`} />
                  <span className="hidden sm:inline">
                    {isFixingInconsistencies ? 'Corrigindo...' : 
                      unsyncedManagersCount > 0 
                        ? `Corrigir (${unsyncedManagersCount})`
                        : 'Corrigir Inconsistências'}
                  </span>
                </Button>
                <Button onClick={() => navigate('/managers/new')}>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Novo Gestor
                </Button>
              </>
            )}
          </div>
        }
      />
      
      <div className="flex items-center justify-between">
        <ManagerSearch 
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
        />
      </div>
      
      <ManagersTable 
        managers={filteredManagers}
        isLoading={isLoading}
        onDeleteManager={handleDeleteManager}
        isAdmin={isAdmin}
        onRefreshData={handleRefreshData}
        isFixingInconsistencies={isFixingInconsistencies}
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
