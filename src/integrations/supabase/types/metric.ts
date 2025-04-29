
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
  lower_is_better: boolean;
  visualization_type?: string;
  priority?: string;
  default_period?: string;
}

export interface MetricHistory {
  date: string;
  value: number;
}

export interface AdminDashboardConfig {
  id: string;
  user_id: string;
  metric_ids: string[];
  created_at: string;
  updated_at: string;
}
