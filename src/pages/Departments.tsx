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
import { Department, createDepartment, getAllDepartments } from '@/integrations/supabase/helpers';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const Departments = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newDepartment, setNewDepartment] = useState({
    name: '',
    description: '',
    status: 'active'
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Query to load departments from Supabase
  const { data: departmentsData, isLoading, error } = useQuery({
    queryKey: ['departments'],
    queryFn: async () => {
      const result = await getAllDepartments();
      if (result.error) {
        throw new Error(result.message);
      }
      return result.data || [];
    }
  });

  // Mutation to create a new department
  const createDepartmentMutation = useMutation({
    mutationFn: async (departmentData: { name: string; description: string; is_active: boolean }) => {
      const result = await createDepartment(departmentData);
      if (result.error) {
        throw new Error(result.message);
      }
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      setIsDialogOpen(false);
      
      toast({
        title: "Departamento criado",
        description: `${newDepartment.name} foi adicionado com sucesso`,
      });
      
      // Reset form
      setNewDepartment({
        name: '',
        description: '',
        status: 'active'
      });
    },
    onError: (error) => {
      console.error('Erro ao criar departamento:', error);
      toast({
        title: "Erro ao criar departamento",
        description: error instanceof Error ? error.message : "Ocorreu um erro ao salvar o departamento",
        variant: "destructive"
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    createDepartmentMutation.mutate({
      name: newDepartment.name,
      description: newDepartment.description,
      is_active: newDepartment.status === 'active'
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
                <Button type="submit" disabled={createDepartmentMutation.isPending}>
                  {createDepartmentMutation.isPending ? 'Salvando...' : 'Salvar'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center p-8">Carregando departamentos...</div>
      ) : error ? (
        <div className="text-center p-8 text-red-500">Erro ao carregar departamentos</div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Departamento</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead className="text-center">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {departmentsData && departmentsData.length > 0 ? (
                departmentsData.map((dept) => (
                  <TableRow key={dept.id}>
                    <TableCell className="font-medium">{dept.name}</TableCell>
                    <TableCell>{dept.description || '-'}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant={dept.is_active ? 'default' : 'secondary'}>
                        {dept.is_active ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-6">
                    Nenhum departamento encontrado
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default Departments;
