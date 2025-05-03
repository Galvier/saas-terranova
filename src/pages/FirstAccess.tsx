import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { Loader2, CheckCircle2 } from 'lucide-react';
import { createUserProfile } from '@/integrations/supabase';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getAllDepartments } from '@/integrations/supabase';

const FirstAccess = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [name, setName] = useState('');
  const [department, setDepartment] = useState('');
  const [role, setRole] = useState('user');
  const [isLoading, setIsLoading] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [departments, setDepartments] = useState<any[]>([]);
  const [isLoadingDepartments, setIsLoadingDepartments] = useState(true);
  
  useEffect(() => {
    const loadDepartments = async () => {
      try {
        const result = await getAllDepartments();
        if (result.error) {
          throw new Error(result.message || 'Erro ao carregar departamentos');
        }
        setDepartments(result.data || []);
      } catch (error) {
        console.error('Erro ao carregar departamentos:', error);
        toast({
          title: 'Erro ao carregar departamentos',
          description: 'Não foi possível carregar a lista de departamentos',
          variant: 'destructive',
        });
      } finally {
        setIsLoadingDepartments(false);
      }
    };
    
    loadDepartments();
  }, [toast]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: 'Erro de autenticação',
        description: 'Você precisa estar logado para completar seu perfil',
        variant: 'destructive',
      });
      return;
    }
    
    if (!name.trim()) {
      toast({
        title: 'Nome obrigatório',
        description: 'Por favor, informe seu nome completo',
        variant: 'destructive',
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await createUserProfile({
        user_id: user.id,
        full_name: name,
        department_id: department || null,
        role: role || 'user',
        email: user.email || '',
      });
      
      if (response.error) {
        throw new Error(response.message || 'Erro ao criar perfil');
      }
      
      setIsCompleted(true);
      
      toast({
        title: 'Perfil criado com sucesso!',
        description: 'Seu perfil foi configurado e você já pode acessar o sistema',
      });
      
      // Redirect after a short delay
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
      
    } catch (error: any) {
      console.error('Erro ao criar perfil:', error);
      toast({
        title: 'Erro ao criar perfil',
        description: error.message || 'Ocorreu um erro ao criar seu perfil',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Acesso não autorizado</CardTitle>
            <CardDescription>
              Você precisa estar logado para acessar esta página
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button onClick={() => navigate('/login')} className="w-full">
              Ir para o login
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="flex items-center justify-center min-h-screen bg-muted/40">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Complete seu perfil</CardTitle>
          <CardDescription>
            Precisamos de algumas informações para configurar seu acesso
          </CardDescription>
        </CardHeader>
        
        {isCompleted ? (
          <CardContent className="space-y-4 pt-4">
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="rounded-full bg-primary/10 p-3 mb-4">
                <CheckCircle2 className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Perfil criado com sucesso!</h3>
              <p className="text-muted-foreground mt-2">
                Você será redirecionado para o dashboard em instantes...
              </p>
            </div>
          </CardContent>
        ) : (
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome completo</Label>
                <Input
                  id="name"
                  placeholder="Digite seu nome completo"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={isLoading}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  value={user.email || ''}
                  disabled
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground">
                  Email associado à sua conta
                </p>
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <Label htmlFor="department">Departamento</Label>
                <Select
                  value={department}
                  onValueChange={setDepartment}
                  disabled={isLoading || isLoadingDepartments}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione seu departamento" />
                  </SelectTrigger>
                  <SelectContent>
                    {isLoadingDepartments ? (
                      <SelectItem value="loading" disabled>
                        Carregando departamentos...
                      </SelectItem>
                    ) : (
                      <>
                        <SelectItem value="">Sem departamento</SelectItem>
                        {departments.map((dept) => (
                          <SelectItem key={dept.id} value={dept.id}>
                            {dept.name}
                          </SelectItem>
                        ))}
                      </>
                    )}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="role">Função</Label>
                <Select value={role} onValueChange={setRole} disabled={isLoading}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione sua função" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">Usuário</SelectItem>
                    <SelectItem value="manager">Gerente</SelectItem>
                    <SelectItem value="admin">Administrador</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Sua função determina suas permissões no sistema
                </p>
              </div>
            </CardContent>
            
            <CardFooter>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Criando perfil...
                  </>
                ) : (
                  'Concluir cadastro'
                )}
              </Button>
            </CardFooter>
          </form>
        )}
      </Card>
    </div>
  );
};

export default FirstAccess;
