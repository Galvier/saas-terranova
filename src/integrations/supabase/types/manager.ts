
export interface Manager {
  id: string;
  name: string;
  email: string;
  department_id?: string;
  department_name?: string;
  is_active: boolean;
  role?: string;
  user_id?: string;
  created_at?: string;
  updated_at?: string;
}
