
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, MoreHorizontal, Pencil, Trash2, X, CheckCircle, AlertTriangle, Loader2 } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import PageHeader from '@/components/PageHeader';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

// Tipos para gestores
interface Manager {
  id: number;
  name: string;
  email: string;
  department: string;
  role: string;
  status: 'active' | 'inactive';
}

// Simulated data
const initialManagers: Manager[] = [
  { id: 1, name: 'Carlos Oliveira', email: 'carlos@empresa.com', department: 'Vendas', role: 'Gestor', status: 'active' },
  { id: 2, name: 'Ana Silva', email: 'ana@empresa.com', department: 'Marketing', role: 'Gestora', status: 'active' },
  { id: 3, name: 'Roberto Santos', email: 'roberto@empresa.com', department: 'Financeiro', role: 'Gestor', status: 'active' },
  { id: 4, name: 'Juliana Martins', email: 'juliana@empresa.com', department: 'RH', role: 'Coordenadora', status: 'active' },
  { id: 5, name: 'Fernando Costa', email: 'fernando@empresa.com', department: 'TI', role: 'Diretor', status: 'inactive' },
];

const departmentOptions = [
  'Vendas', 'Marketing', 'Financeiro', 'RH', 'TI', 'Operações', 'Logística', 'Jurídico'
];

const roleOptions = [
  'Diretor', 'Gerente', 'Gestor', 'Coordenador', 'Supervisor'
];

const Managers = () => {
  const [managers, setManagers] = useState<Manager[]>(initialManagers);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [managerToDelete, setManagerToDelete] = useState<Manager | null>(null);
  const [currentManager, setCurrentManager] = useState<Manager>({
    id: 0,
    name: '',
    email: '',
    department: '',
    role: '',
    status: 'active'
  });
  
  const { toast } = useToast();

  const resetForm = () => {
    setCurrentManager({
      id: 0,
      name: '',
      email: '',
      department: '',
      role: '',
      status: 'active'
    });
    setEditMode(false);
  };

  const openAddDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const openEditDialog = (manager: Manager) => {
    setCurrentManager(manager);
    setEditMode(true);
    setIsDialogOpen(true);
  };

  const openDeleteDialog = (manager: Manager) => {
    setManagerToDelete(manager);
    setIsDeleteDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    
    // Simulate API call delay
    setTimeout(() => {
      if (editMode) {
        // Update existing manager
        const updatedManagers = managers.map(manager => 
          manager.id === currentManager.id ? currentManager : manager
        );
        setManagers(updatedManagers);
        
        toast({
          title: "Gestor atualizado",
          description: `Dados de ${currentManager.name} foram atualizados com sucesso`,
        });
      } else {
        // Add new manager
        const id = managers.length > 0 ? Math.max(...managers.map(m => m.id)) + 1 : 1;
        const managerToAdd = {
          ...currentManager,
          id
        };
        
        setManagers([...managers, managerToAdd]);
        
        toast({
          title: "Gestor adicionado",
          description: `${currentManager.name} foi adicionado com sucesso`,
        });
      }
      
      setIsProcessing(false);
      setIsDialogOpen(false);
      resetForm();
    }, 1000);
  };

  const handleDeleteManager = () => {
    if (!managerToDelete) return;
    
    setIsProcessing(true);
    
    // Simulate API call delay
    setTimeout(() => {
      const updatedManagers = managers.filter(manager => manager.id !== managerToDelete.id);
      setManagers(updatedManagers);
      
      toast({
        title: "Gestor removido",
        description: `${managerToDelete.name} foi removido com sucesso`,
      });
      
      setIsProcessing(false);
      setIsDeleteDialogOpen(false);
      setManagerToDelete(null);
    }, 1000);
  };

  const toggleStatus = (id: number) => {
    const updatedManagers = managers.map(manager => {
      if (manager.id === id) {
        return { 
          ...manager, 
          status: manager.status === 'active' ? 'inactive' : 'active' 
        };
      }
      return manager;
    });
    
    setManagers(updatedManagers);
    
    const manager = managers.find(m => m.id === id);
    const newStatus = manager?.status === 'active' ? 'inactive' : 'active';
    
    toast({
      title: `Status atualizado`,
      description: `${manager?.name} agora está ${newStatus === 'active' ? 'ativo' : 'inativo'}`,
    });
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div className="animate-fade-in">
      <PageHeader title="Gestores" subtitle="Gerencie os gestores da empresa" />
      
      <div className="flex justify-end mb-6">
        <Button 
          className="flex items-center gap-2" 
          onClick={openAddDialog}
        >
          <Plus className="h-4 w-4" />
          Novo Gestor
        </Button>
      </div>
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Departamento</TableHead>
              <TableHead>Cargo</TableHead>
              <TableHead className="text-center">Status</TableHead>
              <TableHead className="w-[100px] text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {managers.map((manager) => (
              <TableRow key={manager.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback>{getInitials(manager.name)}</AvatarFallback>
                    </Avatar>
                    <span className="font-medium">{manager.name}</span>
                  </div>
                </TableCell>
                <TableCell>{manager.email}</TableCell>
                <TableCell>{manager.department}</TableCell>
                <TableCell>{manager.role}</TableCell>
                <TableCell className="text-center">
                  <Badge 
                    variant={manager.status === 'active' ? 'default' : 'secondary'}
                    className="cursor-pointer"
                    onClick={() => toggleStatus(manager.id)}
                  >
                    {manager.status === 'active' ? 'Ativo' : 'Inativo'}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => openEditDialog(manager)}
                      className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => openDeleteDialog(manager)}
                      className="text-red-600 hover:text-red-800 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      
      {/* Dialog para adicionar/editar gestor */}
      <Dialog open={isDialogOpen} onOpenChange={(open) => {
        if (!open) resetForm();
        setIsDialogOpen(open);
      }}>
        <DialogContent>
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>{editMode ? 'Editar Gestor' : 'Adicionar Gestor'}</DialogTitle>
              <DialogDescription>
                {editMode 
                  ? 'Edite as informações do gestor abaixo.' 
                  : 'Adicione um novo gestor à empresa.'
                }
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome Completo</Label>
                <Input 
                  id="name" 
                  value={currentManager.name}
                  onChange={e => setCurrentManager({...currentManager, name: e.target.value})}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  type="email"
                  value={currentManager.email}
                  onChange={e => setCurrentManager({...currentManager, email: e.target.value})}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="department">Departamento</Label>
                <Select 
                  value={currentManager.department}
                  onValueChange={value => setCurrentManager({...currentManager, department: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um departamento" />
                  </SelectTrigger>
                  <SelectContent>
                    {departmentOptions.map(dept => (
                      <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Cargo</Label>
                <Select 
                  value={currentManager.role}
                  onValueChange={value => setCurrentManager({...currentManager, role: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um cargo" />
                  </SelectTrigger>
                  <SelectContent>
                    {roleOptions.map(role => (
                      <SelectItem key={role} value={role}>{role}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select 
                  value={currentManager.status}
                  onValueChange={value => setCurrentManager({
                    ...currentManager, 
                    status: value as 'active' | 'inactive'
                  })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Ativo</SelectItem>
                    <SelectItem value="inactive">Inativo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsDialogOpen(false)}
                disabled={isProcessing}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isProcessing}>
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {editMode ? 'Atualizando...' : 'Salvando...'}
                  </>
                ) : (
                  <>{editMode ? 'Atualizar' : 'Salvar'}</>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Dialog de confirmação para exclusão */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja remover <strong>{managerToDelete?.name}</strong>? 
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isProcessing}>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteManager}
              disabled={isProcessing}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Excluindo...
                </>
              ) : (
                <>Excluir</>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Managers;
