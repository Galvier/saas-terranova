import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { Manager, ManagerStatus } from '@/types/manager';
import { CustomBadge } from '@/components/ui/custom-badge';

const Managers = () => {
  const [managers, setManagers] = useState<Manager[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [managerToDelete, setManagerToDelete] = useState<Manager | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const dummyManagers: Manager[] = [
      {
        id: 1,
        name: 'João Silva',
        email: 'joao.silva@empresa.com',
        department: 'Vendas',
        role: 'Gerente Regional',
        status: 'active'
      },
      {
        id: 2,
        name: 'Maria Oliveira',
        email: 'maria.oliveira@empresa.com',
        department: 'Marketing',
        role: 'Diretora de Marketing',
        status: 'active'
      },
      {
        id: 3,
        name: 'Carlos Santos',
        email: 'carlos.santos@empresa.com',
        department: 'Finanças',
        role: 'Controller',
        status: 'inactive'
      },
      {
        id: 4,
        name: 'Ana Rodrigues',
        email: 'ana.rodrigues@empresa.com',
        department: 'Recursos Humanos',
        role: 'Gerente de RH',
        status: 'active'
      },
      {
        id: 5,
        name: 'Paulo Mendes',
        email: 'paulo.mendes@empresa.com',
        department: 'Operações',
        role: 'Coordenador de Operações',
        status: 'active'
      }
    ];
    
    setManagers(dummyManagers);
  }, []);

  const filteredManagers = managers.filter(manager => 
    manager.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    manager.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    manager.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
    manager.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddManager = () => {
    navigate('/managers/new');
  };

  const handleEditManager = (id: number) => {
    navigate(`/managers/edit/${id}`);
  };

  const confirmDelete = () => {
    if (managerToDelete) {
      setManagers(managers.filter(manager => manager.id !== managerToDelete.id));
      
      toast({
        title: "Gestor removido",
        description: `${managerToDelete.name} foi removido com sucesso.`
      });
      
      setManagerToDelete(null);
      setIsDeleteDialogOpen(false);
    }
  };

  const openDeleteDialog = (manager: Manager) => {
    setManagerToDelete(manager);
    setIsDeleteDialogOpen(true);
  };

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
              <TableHead>Departamento</TableHead>
              <TableHead>Função</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredManagers.length > 0 ? (
              filteredManagers.map((manager) => (
                <TableRow key={manager.id}>
                  <TableCell className="font-medium">{manager.name}</TableCell>
                  <TableCell>{manager.email}</TableCell>
                  <TableCell>{manager.department}</TableCell>
                  <TableCell>{manager.role}</TableCell>
                  <TableCell>
                    <CustomBadge variant={manager.status === 'active' ? "success" : "secondary"}>
                      {manager.status === 'active' ? 'Ativo' : 'Inativo'}
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
                <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
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
