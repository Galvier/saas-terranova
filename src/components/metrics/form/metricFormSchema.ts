
import { z } from 'zod';

// Define enums for various options
export const FrequencyEnum = z.enum(['daily', 'weekly', 'monthly', 'quarterly', 'yearly']);
export type Frequency = z.infer<typeof FrequencyEnum>;

export const VisualizationTypeEnum = z.enum(['card', 'bar', 'line', 'pie', 'area', 'table']);
export type VisualizationType = z.infer<typeof VisualizationTypeEnum>;

export const PriorityEnum = z.enum(['normal', 'high', 'critical']);
export type Priority = z.infer<typeof PriorityEnum>;

export const DefaultPeriodEnum = z.enum(['day', 'week', 'month', 'quarter', 'year']);
export type DefaultPeriod = z.infer<typeof DefaultPeriodEnum>;

// Define the form schema with validation rules
export const formSchema = z.object({
  name: z.string()
    .min(3, { message: 'O nome deve ter pelo menos 3 caracteres' })
    .max(100, { message: 'O nome não pode ter mais de 100 caracteres' }),
  
  description: z.string().optional(),
  
  unit: z.string()
    .min(1, { message: 'A unidade de medida é obrigatória' }),
  
  target: z.number()
    .nonnegative({ message: 'O valor da meta não pode ser negativo' }),
  
  department_id: z.string()
    .min(1, { message: 'Selecione um departamento' }),
  
  frequency: FrequencyEnum,
  
  is_active: z.boolean().default(true),
  
  lower_is_better: z.boolean().default(false),
  
  visualization_type: VisualizationTypeEnum.default('card'),
  
  priority: PriorityEnum.default('normal'),
  
  default_period: DefaultPeriodEnum.default('month')
});
