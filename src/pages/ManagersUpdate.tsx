
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import PageHeader from '@/components/PageHeader';
import { ArrowLeft, Loader2, Save, User } from 'lucide-react';
import { Manager, ManagerStatus } from '@/types/manager';
import CredentialsSection from '@/components/managers/CredentialsSection';

const ManagersUpdate = () => {
  const { id } = useParams();
  const isEditing = id !== 'new';
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [department, setDepartment] = useState('');
  const [role, setRole] = useState('');
  const [status, setStatus] = useState<ManagerStatus>('active');
  
  // Available departments (in a real app, these would come from an API)
  const departments = [
    { id: 1, name: 'Vendas' },
    { id: 2, name: 'Marketing' },
    { id: 3, name: 'Finanças' },
    { id: 4, name: 'Operações' },
    { id: 5, name: 'Recursos Humanos' },
    { id: 6, name: 'Tecnologia' },
  ];
  
  // Fetch manager data for editing
  useEffect(() => {
    if (isEditing) {
      setIsLoading(true);
      
      // In a real app, this would be an API call
      setTimeout(() => {
        // Dummy data based on id
        const managers: Manager[] = [
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
          }
        ];
        
        const manager = managers.find(m => m.id === parseInt(id as string));
        
        if (manager) {
          setName(manager.name);
          setEmail(manager.email);
          setDepartment(manager.department);
          setRole(manager.role);
          setStatus(manager.status);
        } else {
          toast({
            title: "Gestor não encontrado",
            description: "Não foi possível encontrar os dados do gestor.",
            variant: "destructive"
          });
          navigate('/managers');
        }
        
        setIsLoading(false);
      }, 1000);
    }
  }, [id, isEditing, navigate, toast]);
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    // Validate form
    if (!name || !email || !department || !role) {
      toast({
        title: "Formulário incompleto",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive"
      });
      setIsSaving(false);
      return;
    }
    
    // In a real app, this would be an API call
    setTimeout(() => {
      // Simulate success
      setIsSaving(false);
      
      toast({
        title: isEditing ? "Gestor atualizado" : "Gestor criado",
        description: isEditing
          ? `As informações de ${name} foram atualizadas com sucesso.`
          : `${name} foi adicionado(a) como novo gestor.`
      });
      
      navigate('/managers');
    }, 1500);
  };
  
  // Go back to managers list
  const handleCancel = () => {
    navigate('/managers');
  };
  
  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader 
        title={isEditing ? "Editar Gestor" : "Novo Gestor"} 
        subtitle={isEditing ? "Atualize as informações do gestor" : "Adicione um novo gestor ao sistema"}
        backButton={
          <Button variant="outline" size="sm" onClick={handleCancel}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
        }
      />
      
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="text-sm text-muted-foreground">Carregando informações...</span>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-8">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-10 w-10 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium">Informações Pessoais</h3>
                    <p className="text-sm text-muted-foreground">
                      Dados básicos do gestor no sistema
                    </p>
                  </div>
                </div>
                
                <Separator className="my-4" />
                
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome completo</Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Nome do gestor"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="email@empresa.com"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="department">Departamento</Label>
                    <Select
                      value={department}
                      onValueChange={setDepartment}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um departamento" />
                      </SelectTrigger>
                      <SelectContent>
                        {departments.map((dept) => (
                          <SelectItem key={dept.id} value={dept.name}>
                            {dept.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="role">Função</Label>
                    <Input
                      id="role"
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      placeholder="Cargo ou função"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={status}
                      onValueChange={(value) => setStatus(value as ManagerStatus)}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Ativo</SelectItem>
                        <SelectItem value="inactive">Inativo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Credentials Section - For managing user credentials */}
          <CredentialsSection isEditing={isEditing} />
          
          <div className="flex justify-end gap-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleCancel}
            >
              Cancelar
            </Button>
            <Button 
              type="submit"
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isEditing ? 'Salvando...' : 'Criando...'}
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  {isEditing ? 'Salvar Alterações' : 'Criar Gestor'}
                </>
              )}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
};

export default ManagersUpdate;
