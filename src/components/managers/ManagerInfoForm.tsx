
import React from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from '@/components/ui/input';
import { Switch } from "@/components/ui/switch";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { Department } from '@/integrations/supabase/types/department';
import { Manager } from '@/integrations/supabase/types/manager';

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
  role: z.enum(['admin', 'manager', 'viewer'], {
    required_error: "Selecione uma função",
  }).default('manager'),
});

export type ManagerUpdateValues = z.infer<typeof managerUpdateSchema>;

interface ManagerInfoFormProps {
  manager: Manager | null;
  departments: Department[];
  isSaving: boolean;
  onSubmit: (values: ManagerUpdateValues) => void;
  onCancel: () => void;
}

export const ManagerInfoForm: React.FC<ManagerInfoFormProps> = ({
  manager,
  departments,
  isSaving,
  onSubmit,
  onCancel
}) => {
  const form = useForm<ManagerUpdateValues>({
    resolver: zodResolver(managerUpdateSchema),
    defaultValues: {
      name: manager?.name || "",
      email: manager?.email || "",
      department_id: manager?.department_id || "",
      is_active: manager?.is_active ?? true,
      role: (manager?.role as 'admin' | 'manager' | 'viewer') || "manager",
    },
  });

  return (
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
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Função</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma função" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="admin">Administrador</SelectItem>
                      <SelectItem value="manager">Gestor</SelectItem>
                      <SelectItem value="viewer">Visualizador</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Defina o nível de acesso do gerente no sistema.
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

        <div className="flex justify-end space-x-2">
          <Button variant="ghost" onClick={onCancel}>Cancelar</Button>
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
  );
};
