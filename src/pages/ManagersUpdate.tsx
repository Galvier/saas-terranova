import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import PageHeader from '@/components/PageHeader';
import { Loader2, User, Mail, Lock, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { Progress } from '@/components/ui/custom-progress';
import { callRPC, Manager } from '@/integrations/supabase/helpers';

interface Department {
  id: string;
  name: string;
}

const managerUpdateSchema = z.object({
  name: z.string().min(3, {
    message: "Nome deve ter pelo menos 3 caracteres.",
  }),
  email: z.string().email({
    message: "Email inválido.",
  }),
  department_id: z.string().uuid({
    message: "Selecione um departamento.",
  }),
  is_active: z.boolean().default(true),
});

type ManagerUpdateValues = z.infer<typeof managerUpdateSchema>

const ManagersUpdate = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [manager, setManager] = useState<Manager | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isNewUser, setIsNewUser] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { id } = useParams();

  const form = useForm<ManagerUpdateValues>({
    resolver: zodResolver(managerUpdateSchema),
    defaultValues: {
      name: "",
      email: "",
      department_id: "",
      is_active: true,
    },
  })

  const { watch } = form;
  const emailFieldValue = watch("email");

  useEffect(() => {
    if (id) {
      fetchManager(id);
    }
  }, [id]);

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchManager = async (managerId: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await callRPC<Manager>('get_manager_by_id', { 
        manager_id: managerId 
      });

      if (error) {
        throw error;
      }

      if (data) {
        setManager(data);
        form.setValue("name", data.name);
        form.setValue("email", data.email);
        form.setValue("department_id", data.department_id);
        form.setValue("is_active", data.is_active);
      }
    } catch (error: any) {
      toast({
        title: "Erro ao carregar gerente",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const { data, error } = await callRPC<Department[]>('get_all_departments');

      if (error) {
        throw error;
      }

      if (data) {
        setDepartments(data);
      }
    } catch (error: any) {
      toast({
        title: "Erro ao carregar departamentos",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const updateManager = async (values: ManagerUpdateValues) => {
    setIsSaving(true);
    try {
      const { error } = await callRPC('update_manager', {
        manager_id: id,
        manager_name: values.name,
        manager_email: values.email,
        manager_department_id: values.department_id,
        manager_is_active: values.is_active
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Gerente atualizado",
        description: "Gerente atualizado com sucesso.",
      });
      navigate('/managers');
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar gerente",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const onSubmit = async (values: ManagerUpdateValues) => {
    updateManager(values);
  }

  const handleNewUserToggle = () => {
    setIsNewUser(!isNewUser);
  };

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>;
  }

  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader
        title="Editar Gerente"
        subtitle="Atualize as informações do gerente"
      />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Informações do Gerente</CardTitle>
              <CardDescription>
                Atualize as informações básicas do gerente.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome</FormLabel>
                    <FormControl>
                      <Input placeholder="Nome completo" {...field} />
                    </FormControl>
                    <FormDescription>
                      Este é o nome que será exibido no sistema.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="seu.email@empresa.com" {...field} />
                    </FormControl>
                    <FormDescription>
                      Este será o email de acesso do gerente.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="department_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Departamento</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um departamento" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {departments.map((department) => (
                          <SelectItem key={department.id} value={department.id}>{department.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Selecione o departamento ao qual o gerente pertence.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="is_active"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel>Ativo</FormLabel>
                      <FormDescription>
                        Defina se o gerente está ativo no sistema.
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Credenciais</CardTitle>
              <CardDescription>
                Informações de acesso do usuário.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <Switch id="new-user" onCheckedChange={handleNewUserToggle} />
                <label
                  htmlFor="new-user"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {isNewUser ? 'Criar credenciais de acesso' : 'Manter credenciais existentes'}
                </label>
              </div>
              {isNewUser && (
                <CredentialsSection isEdit={true} email={emailFieldValue} />
              )}
            </CardContent>
          </Card>

          <div className="flex justify-end space-x-2">
            <Button variant="ghost" onClick={() => navigate('/managers')}>Cancelar</Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                "Salvar"
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

interface CredentialsSectionProps {
  isEdit: boolean;
  email?: string;
}

const CredentialsSection: React.FC<CredentialsSectionProps> = ({ isEdit, email }) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    if (!password) {
      setPasswordStrength(0);
      return;
    }

    let strength = 0;

    if (password.length >= 8) strength += 25;

    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength += 25;

    if (/[0-9]/.test(password)) strength += 25;

    if (/[^a-zA-Z0-9]/.test(password)) strength += 25;

    setPasswordStrength(strength);
  }, [password]);

  const getStrengthColor = () => {
    if (passwordStrength < 50) return 'bg-red-500';
    if (passwordStrength < 75) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getStrengthText = () => {
    if (passwordStrength < 50) return 'Fraca';
    if (passwordStrength < 75) return 'Média';
    return 'Forte';
  };

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleCreateUser = async () => {
    if (!email || !password) {
      toast({
        title: "Campos incompletos",
        description: "Email e senha são obrigatórios",
        variant: "destructive"
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: "Senhas não conferem",
        description: "A senha e a confirmação precisam ser idênticas",
        variant: "destructive"
      });
      return;
    }

    if (password.length < 8) {
      toast({
        title: "Senha muito curta",
        description: "A senha deve ter pelo menos 8 caracteres",
        variant: "destructive"
      });
      return;
    }

    if (passwordStrength < 50) {
      toast({
        title: "Senha fraca",
        description: "Use uma combinação de letras, números e símbolos",
        variant: "destructive"
      });
      return;
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email: email,
        password: password,
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Usuário criado",
        description: "Usuário criado com sucesso.",
      });
    } catch (error: any) {
      toast({
        title: "Erro ao criar usuário",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="seu.email@empresa.com"
          value={email}
          disabled={!isEdit}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Senha</Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="Mínimo 8 caracteres"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="pr-10"
            minLength={8}
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-0 top-0 h-full px-3 py-1 text-muted-foreground"
            onClick={toggleShowPassword}
          >
            {showPassword ? <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-4 h-4"
            >
              <path d="M3.53 2.47a1.25 1.25 0 0 1 0 1.77l1.1 1.1c.16.16.25.38.25.61v1.54c0 .23-.09.45-.25.61l-1.1 1.1a1.25 1.25 0 0 1 0 1.77l1.1 1.1c.16.16.38.25.61.25h1.54c.23 0 .45-.09.61-.25l1.1-1.1a1.25 1.25 0 0 1 1.77 0l2.82 2.83a3.75 3.75 0 0 1 0 5.3l-.88.87c-.11.11-.27.18-.44.18H4.88c-.17 0-.33-.07-.44-.18l-.88-.87a3.75 3.75 0 0 1 0-5.3l2.83-2.82a1.25 1.25 0 0 1 1.77 0l1.1 1.1c.16.16.38.25.61.25h1.54c.23 0 .45.09.61.25l1.1 1.1a1.25 1.25 0 0 1 1.77 0l2.83-2.82a3.75 3.75 0 0 1 5.3 0l-2.83-2.82a1.25 1.25 0 0 1 1.77 0l1.1 1.1c.16.16.38.25.61.25h1.54c.23 0 .45-.09.61-.25l1.1-1.1a1.25 1.25 0 0 1 0-1.77l-1.1-1.1c-.16-.16-.25-.38-.25-.61V9.52c0-.23-.09-.45-.25-.61l-1.1-1.1a1.25 1.25 0 0 1 0-1.77l1.1-1.1c-.16-.16-.25-.38-.25-.61V3.52c0-.23-.09-.45-.25-.61l1.1-1.1a1.25 1.25 0 0 1 1.77 0Z" />
            </svg> : <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-4 h-4"
            >
              <path d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25ZM12.75 6a.75.75 0 0 1 1.5 0v2.25a.75.75 0 0 1-1.5 0V6Zm-3 3.75a.75.75 0 0 1 1.5 0v4.5a.75.75 0 0 1-1.5 0v-4.5ZM12 15.75a.75.75 0 0 1 .75-.75h4.5a.75.75 0 0 1 0 1.5h-4.5a.75.75 0 0 1-.75-.75Z" />
            </svg>}
          </Button>
        </div>

        {password && (
          <div className="space-y-1 mt-2">
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">Força da senha:</span>
              <span className={`text-xs font-medium ${passwordStrength < 50 ? 'text-red-500' :
                passwordStrength < 75 ? 'text-yellow-500' : 'text-green-500'
                }`}>
                {getStrengthText()}
              </span>
            </div>
            <Progress value={passwordStrength} className={getStrengthColor()} />

            <div className="grid grid-cols-2 gap-2 mt-2">
              <div className="flex items-center gap-1 text-xs">
                <div className={`h-2 w-2 rounded-full ${password.length >= 8 ? 'bg-green-500' : 'bg-gray-300'}`} />
                <span className={password.length >= 8 ? 'text-green-700' : 'text-muted-foreground'}>
                  Mínimo 8 caracteres
                </span>
              </div>
              <div className="flex items-center gap-1 text-xs">
                <div className={`h-2 w-2 rounded-full ${/[A-Z]/.test(password) && /[a-z]/.test(password) ? 'bg-green-500' : 'bg-gray-300'}`} />
                <span className={/[A-Z]/.test(password) && /[a-z]/.test(password) ? 'text-green-700' : 'text-muted-foreground'}>
                  Maiúsculas e minúsculas
                </span>
              </div>
              <div className="flex items-center gap-1 text-xs">
                <div className={`h-2 w-2 rounded-full ${/[0-9]/.test(password) ? 'bg-green-500' : 'bg-gray-300'}`} />
                <span className={/[0-9]/.test(password) ? 'text-green-700' : 'text-muted-foreground'}>
                  Números
                </span>
              </div>
              <div className="flex items-center gap-1 text-xs">
                <div className={`h-2 w-2 rounded-full ${/[^a-zA-Z0-9]/.test(password) ? 'bg-green-500' : 'bg-gray-300'}`} />
                <span className={/[^a-zA-Z0-9]/.test(password) ? 'text-green-700' : 'text-muted-foreground'}>
                  Símbolos
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirme a senha</Label>
        <Input
          id="confirmPassword"
          type="password"
          placeholder="Digite a senha novamente"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          minLength={8}
        />
        {password && confirmPassword && password !== confirmPassword && (
          <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
            <AlertTriangle className="h-3 w-3" /> As senhas não conferem
          </p>
        )}
      </div>

      <Button onClick={handleCreateUser}>Criar Usuário</Button>
    </div>
  );
};

export default ManagersUpdate;
