
import React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import PageHeader from '@/components/PageHeader';
import { useToast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';
import DepartmentsSelect from '@/components/DepartmentsSelect';
import { createManager, getAllDepartments } from '@/integrations/supabase/helpers';

// Define form validation schema
const formSchema = z.object({
  name: z.string().min(2, 'O nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  department_id: z.string().uuid('Selecione um departamento'),
  is_active: z.boolean().default(true),
});

type FormValues = z.infer<typeof formSchema>;

const ManagersCreate = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  
  // Query to fetch departments for the select dropdown
  const { data: departments = [] } = useQuery({
    queryKey: ['departments'],
    queryFn: async () => {
      const result = await getAllDepartments();
      if (result.error) throw new Error(result.message);
      return result.data || [];
    }
  });

  // Initialize form with react-hook-form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      is_active: true,
    },
  });

  // Handle form submission
  const onSubmit = async (values: FormValues) => {
    try {
      const result = await createManager({
        name: values.name,
        email: values.email,
        department_id: values.department_id,
        is_active: values.is_active
      });

      if (result.error) {
        throw new Error(result.message);
      }

      toast({
        title: 'Gestor criado com sucesso',
        description: `${values.name} foi adicionado como gestor.`,
      });

      navigate('/managers');
    } catch (error: any) {
      toast({
        title: 'Erro ao criar gestor',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Novo Gestor"
        subtitle="Adicione um novo gestor ao sistema"
        backButton={
          <Button variant="outline" size="sm" onClick={() => navigate('/managers')}>
            Voltar
          </Button>
        }
      />

      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Dados do Gestor</CardTitle>
          <CardDescription>
            Preencha os dados abaixo para adicionar um novo gestor.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome</FormLabel>
                    <FormControl>
                      <Input placeholder="Nome do gestor" {...field} />
                    </FormControl>
                    <FormDescription>
                      O nome completo do gestor.
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
                      <Input type="email" placeholder="email@exemplo.com" {...field} />
                    </FormControl>
                    <FormDescription>
                      O email será usado para login e comunicações.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DepartmentsSelect
                departments={departments}
                form={form}
                name="department_id"
                required
              />

              <FormField
                control={form.control}
                name="is_active"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel>Ativo</FormLabel>
                      <FormDescription>
                        Determina se o gestor está ativo no sistema.
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

              <Button type="submit" className="w-full">Criar Gestor</Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ManagersCreate;
