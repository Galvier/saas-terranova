
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import PageHeader from '@/components/PageHeader';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

// Simulated data
const initialDepartments = [
  { id: 1, name: 'Vendas', description: 'Departamento de vendas', manager: 'Carlos Oliveira', employees: 12, status: 'active' },
  { id: 2, name: 'Marketing', description: 'Departamento de marketing', manager: 'Ana Silva', employees: 8, status: 'active' },
  { id: 3, name: 'Financeiro', description: 'Departamento financeiro', manager: 'Roberto Santos', employees: 5, status: 'active' },
  { id: 4, name: 'RH', description: 'Recursos Humanos', manager: 'Juliana Martins', employees: 4, status: 'active' },
  { id: 5, name: 'TI', description: 'Tecnologia da Informação', manager: 'Fernando Costa', employees: 10, status: 'inactive' },
];

const Departments = () => {
  const [departments, setDepartments] = useState(initialDepartments);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newDepartment, setNewDepartment] = useState({
    name: '',
    description: '',
    manager: '',
    status: 'active'
  });
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const id = departments.length + 1;
    const departmentToAdd = {
      ...newDepartment,
      id,
      employees: 0
    };
    
    setDepartments([...departments, departmentToAdd]);
    setIsDialogOpen(false);
    
    toast({
      title: "Departamento criado",
      description: `${newDepartment.name} foi adicionado com sucesso`,
    });
    
    // Reset form
    setNewDepartment({
      name: '',
      description: '',
      manager: '',
      status: 'active'
    });
  };

  return (
    <div className="animate-fade-in">
      <PageHeader title="Departamentos" subtitle="Gerencie os departamentos da empresa" />
      
      <div className="flex justify-end mb-6">
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Novo Departamento
            </Button>
          </DialogTrigger>
          <DialogContent>
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>Criar Departamento</DialogTitle>
                <DialogDescription>
                  Adicione um novo departamento à empresa.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome</Label>
                  <Input 
                    id="name" 
                    value={newDepartment.name}
                    onChange={e => setNewDepartment({...newDepartment, name: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea 
                    id="description" 
                    value={newDepartment.description}
                    onChange={e => setNewDepartment({...newDepartment, description: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="manager">Gestor Responsável</Label>
                  <Input 
                    id="manager" 
                    value={newDepartment.manager}
                    onChange={e => setNewDepartment({...newDepartment, manager: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select 
                    defaultValue={newDepartment.status}
                    onValueChange={value => setNewDepartment({...newDepartment, status: value})}
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
              <TableHead>Departamento</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead>Gestor</TableHead>
              <TableHead className="text-center">Funcionários</TableHead>
              <TableHead className="text-center">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {departments.map((dept) => (
              <TableRow key={dept.id}>
                <TableCell className="font-medium">{dept.name}</TableCell>
                <TableCell>{dept.description}</TableCell>
                <TableCell>{dept.manager}</TableCell>
                <TableCell className="text-center">{dept.employees}</TableCell>
                <TableCell className="text-center">
                  <Badge variant={dept.status === 'active' ? 'default' : 'secondary'}>
                    {dept.status === 'active' ? 'Ativo' : 'Inativo'}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default Departments;
