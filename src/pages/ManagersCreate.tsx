
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { callRPC } from '@/integrations/supabase/helpers';

interface Department {
  id: string;
  name: string;
}

const managerCreateSchema = z.object({
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

type ManagerCreateValues = z.infer<typeof managerCreateSchema>;

const ManagersCreate = () => {
  const [isSaving, setIsSaving] = useState(false);
  const [departments, setDepartments] = useState<Department[]>([]);
  const navigate = useNavigate();
  const { toast } = useToast();

  const form = useForm<ManagerCreateValues>({
    resolver: zodResolver(managerCreateSchema),
    defaultValues: {
      name: "",
      email: "",
      department_id: "",
      is_active: true,
    },
  });

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const { data, error } = await callRPC('get_all_departments');
      if (error) throw error;
      if (data) setDepartments(data);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar departamentos",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const onSubmit = async (values: ManagerCreateValues) => {
    setIsSaving(true);
    try {
      // Aqui você pode adicionar uma chamada de RPC para criar o gestor (implemente depois conforme necessário)
      toast({
        title: "Gestor criado",
        description: "Gestor criado com sucesso (dummy handler, ajuste o backend).",
      });
      navigate('/managers');
    } catch (error: any) {
      toast({
        title: "Erro ao criar gestor",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader
        title="Novo Gestor"
        subtitle="Cadastro de novo gestor e suas credenciais"
      />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Informações do Gestor</CardTitle>
              <CardDescription>
                Preencha as informações do novo gestor.
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
                    <FormDescription>Nome exibido no sistema.</FormDescription>
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
                    <FormDescription>Email de acesso do gestor.</FormDescription>
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
                          <SelectValue placeholder="Selecione o departamento" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {departments.map((department) => (
                          <SelectItem key={department.id} value={department.id}>{department.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Departamento responsável do gestor.
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
                        Defina se o gestor estará ativo no sistema.
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
            <CardFooter className="flex justify-end space-x-2">
              <Button variant="ghost" type="button" onClick={() => navigate('/managers')}>Cancelar</Button>
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
            </CardFooter>
          </Card>
        </form>
      </Form>
    </div>
  );
};

export default ManagersCreate;
