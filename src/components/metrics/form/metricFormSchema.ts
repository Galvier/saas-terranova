
import * as z from 'zod';

export const formSchema = z.object({
  name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  description: z.string().optional(),
  unit: z.string().min(1, 'Unidade é obrigatória'),
  target: z.coerce.number().positive('Meta deve ser um número positivo'),
  department_id: z.string().uuid('Departamento é obrigatório'),
  frequency: z.string(),
  is_active: z.boolean(),
  lower_is_better: z.boolean().default(false)
});
