
export interface Department {
  id: string;
  name: string;
  description?: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
  manager_id?: string;
  manager_name?: string;
}
