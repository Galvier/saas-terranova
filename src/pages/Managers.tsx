
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, MoreHorizontal } from 'lucide-react';
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

// Simulated data
const initialManagers = [
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
  const [managers, setManagers] = useState(initialManagers);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newManager, setNewManager] = useState({
    name: '',
    email: '',
    department: '',
    role: '',
    status: 'active'
  });
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const id = managers.length + 1;
    const managerToAdd = {
      ...newManager,
      id
    };
    
    setManagers([...managers, managerToAdd]);
    setIsDialogOpen(false);
    
    toast({
      title: "Gestor adicionado",
      description: `${newManager.name} foi adicionado com sucesso`,
    });
    
    // Reset form
    setNewManager({
      name: '',
      email: '',
      department: '',
      role: '',
      status: 'active'
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
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Novo Gestor
            </Button>
          </DialogTrigger>
          <DialogContent>
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>Adicionar Gestor</DialogTitle>
                <DialogDescription>
                  Adicione um novo gestor à empresa.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome Completo</Label>
                  <Input 
                    id="name" 
                    value={newManager.name}
                    onChange={e => setNewManager({...newManager, name: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    type="email"
                    value={newManager.email}
                    onChange={e => setNewManager({...newManager, email: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="department">Departamento</Label>
                  <Select 
                    onValueChange={value => setNewManager({...newManager, department: value})}
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
                    onValueChange={value => setNewManager({...newManager, role: value})}
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
                    defaultValue={newManager.status}
                    onValueChange={value => setNewManager({...newManager, status: value})}
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
                <Button type="submit">Salvar</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
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
              <TableHead className="w-[70px]"></TableHead>
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
                  <Badge variant={manager.status === 'active' ? 'default' : 'secondary'}>
                    {manager.status === 'active' ? 'Ativo' : 'Inativo'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>Editar</DropdownMenuItem>
                      <DropdownMenuItem>Ver detalhes</DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">
                        Desativar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default Managers;
