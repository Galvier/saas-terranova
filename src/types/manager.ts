
export type ManagerStatus = "active" | "inactive";

export interface Manager {
  id: string;
  name: string;
  email: string;
  department_id?: string;
  department_name?: string;
  role?: string;
  is_active: boolean;
  user_id?: string;
  created_at?: string;
  updated_at?: string;
}
