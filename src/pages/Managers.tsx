
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from '@/hooks/use-toast';
import PageHeader from '@/components/PageHeader';
import { Edit, MoreHorizontal, Plus, Search, Trash2, UserPlus } from 'lucide-react';
import { getAllManagers } from '@/integrations/supabase';
import { CustomBadge } from '@/components/ui/custom-badge';

const Managers = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [managerToDelete, setManagerToDelete] = useState<any>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Fetch managers using react-query
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

  const handleAddManager = () => {
    navigate('/managers/new');
  };

  const handleEditManager = (id: string) => {
    navigate(`/managers/edit/${id}`);
  };

  const confirmDelete = () => {
    if (managerToDelete) {
      // TODO: Implement delete functionality when backend is ready
      toast({
        title: "Gestor removido",
        description: `${managerToDelete.name} foi removido com sucesso.`
      });
      
      setManagerToDelete(null);
      setIsDeleteDialogOpen(false);
    }
  };

  const openDeleteDialog = (manager: any) => {
    setManagerToDelete(manager);
    setIsDeleteDialogOpen(true);
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
          <Button onClick={handleAddManager}>
            <UserPlus className="mr-2 h-4 w-4" />
            Novo Gestor
          </Button>
        }
      />
      
      <div className="flex items-center justify-between">
        <div className="flex w-full max-w-sm items-center space-x-2">
          <Input
            placeholder="Buscar gestores..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-[300px]"
          />
          <Button variant="secondary" size="icon">
            <Search className="h-4 w-4" />
          </Button>
        </div>
        
        <Button variant="outline" onClick={handleAddManager}>
          <Plus className="mr-2 h-4 w-4" />
          Adicionar
        </Button>
      </div>
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-6">
                  Carregando gestores...
                </TableCell>
              </TableRow>
            ) : filteredManagers.length > 0 ? (
              filteredManagers.map((manager) => (
                <TableRow key={manager.id}>
                  <TableCell className="font-medium">{manager.name}</TableCell>
                  <TableCell>{manager.email}</TableCell>
                  <TableCell>
                    <CustomBadge variant={manager.is_active ? "success" : "secondary"}>
                      {manager.is_active ? 'Ativo' : 'Inativo'}
                    </CustomBadge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEditManager(manager.id)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => openDeleteDialog(manager)}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">
                  Nenhum gestor encontrado
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o gestor{" "}
              <span className="font-medium">{managerToDelete?.name}</span>?
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Managers;
