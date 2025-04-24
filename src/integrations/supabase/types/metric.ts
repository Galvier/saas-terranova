export interface MetricDefinition {
  id: string;
  name: string;
  description: string | null;
  unit: string;
  target: number;
  current: number;
  department_id: string | null;
  department_name: string | null;
  frequency: string;
  trend: 'up' | 'down' | 'neutral';
  status: 'success' | 'warning' | 'danger';
  is_active: boolean;
  icon_name: string | null;
}

export interface MetricHistory {
  date: string;
  value: number;
}
