
export type ManagerStatus = "active" | "inactive";

export interface Manager {
  id: number;
  name: string;
  email: string;
  department: string;
  role: string;
  status: ManagerStatus;
}
