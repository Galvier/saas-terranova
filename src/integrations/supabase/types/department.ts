
export interface DepartmentManager {
  id: string;
  name: string;
  email: string;
  is_primary: boolean;
}

export interface Department {
  id: string;
  name: string;
  description?: string | null;
  is_active: boolean;
  manager_id?: string | null;
  created_at?: string;
  updated_at?: string;
  manager_name?: string | null;
  managers?: DepartmentManager[] | null;
}
