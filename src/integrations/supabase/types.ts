export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      departments: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          manager_id: string | null
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          manager_id?: string | null
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          manager_id?: string | null
          name?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "departments_manager_id_fkey"
            columns: ["manager_id"]
            isOneToOne: false
            referencedRelation: "managers"
            referencedColumns: ["id"]
          },
        ]
      }
      diagnostic_tests: {
        Row: {
          created_at: string | null
          id: string
          test_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          test_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          test_id?: string
        }
        Relationships: []
      }
      logs: {
        Row: {
          created_at: string | null
          details: Json | null
          id: string
          level: string
          message: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          details?: Json | null
          id?: string
          level: string
          message: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          details?: Json | null
          id?: string
          level?: string
          message?: string
          user_id?: string | null
        }
        Relationships: []
      }
      managers: {
        Row: {
          created_at: string | null
          department_id: string | null
          email: string
          id: string
          is_active: boolean | null
          name: string
          role: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          department_id?: string | null
          email: string
          id?: string
          is_active?: boolean | null
          name: string
          role?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          department_id?: string | null
          email?: string
          id?: string
          is_active?: boolean | null
          name?: string
          role?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "managers_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
        ]
      }
      metrics: {
        Row: {
          created_at: string | null
          date: string
          department_id: string | null
          id: string
          name: string
          value: number
        }
        Insert: {
          created_at?: string | null
          date: string
          department_id?: string | null
          id?: string
          name: string
          value: number
        }
        Update: {
          created_at?: string | null
          date?: string
          department_id?: string | null
          id?: string
          name?: string
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "metrics_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
        ]
      }
      metrics_definition: {
        Row: {
          created_at: string | null
          department_id: string | null
          description: string | null
          frequency: string
          icon_name: string | null
          id: string
          is_active: boolean | null
          lower_is_better: boolean
          name: string
          target: number
          unit: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          department_id?: string | null
          description?: string | null
          frequency?: string
          icon_name?: string | null
          id?: string
          is_active?: boolean | null
          lower_is_better?: boolean
          name: string
          target: number
          unit: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          department_id?: string | null
          description?: string | null
          frequency?: string
          icon_name?: string | null
          id?: string
          is_active?: boolean | null
          lower_is_better?: boolean
          name?: string
          target?: number
          unit?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "metrics_definition_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
        ]
      }
      metrics_values: {
        Row: {
          created_at: string | null
          date: string
          id: string
          metrics_definition_id: string
          value: number
        }
        Insert: {
          created_at?: string | null
          date?: string
          id?: string
          metrics_definition_id: string
          value: number
        }
        Update: {
          created_at?: string | null
          date?: string
          id?: string
          metrics_definition_id?: string
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "metrics_values_metrics_definition_id_fkey"
            columns: ["metrics_definition_id"]
            isOneToOne: false
            referencedRelation: "metrics_definition"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          first_name: string | null
          id: string
          last_name: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          first_name?: string | null
          id: string
          last_name?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      settings: {
        Row: {
          created_at: string | null
          id: string
          key: string
          updated_at: string | null
          value: Json
        }
        Insert: {
          created_at?: string | null
          id?: string
          key: string
          updated_at?: string | null
          value: Json
        }
        Update: {
          created_at?: string | null
          id?: string
          key?: string
          updated_at?: string | null
          value?: Json
        }
        Relationships: []
      }
      users: {
        Row: {
          created_at: string | null
          email: string
          id: string
          name: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          name?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          name?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_table_exists_and_count: {
        Args: { table_name: string }
        Returns: Json
      }
      create_department: {
        Args:
          | {
              department_name: string
              department_description: string
              department_is_active: boolean
            }
          | {
              department_name: string
              department_description: string
              department_is_active: boolean
              department_manager_id?: string
            }
        Returns: Json
      }
      create_diagnostic_table_if_not_exists: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      create_manager: {
        Args:
          | {
              manager_name: string
              manager_email: string
              manager_department_id: string
              manager_is_active: boolean
              manager_password?: string
            }
          | {
              manager_name: string
              manager_email: string
              manager_department_id: string
              manager_is_active: boolean
              manager_password?: string
              manager_role?: string
            }
        Returns: Json
      }
      create_metric_definition: {
        Args:
          | {
              metric_name: string
              metric_description: string
              metric_unit: string
              metric_target: number
              metric_department_id: string
              metric_frequency?: string
              metric_is_active?: boolean
              metric_icon_name?: string
            }
          | {
              metric_name: string
              metric_description: string
              metric_unit: string
              metric_target: number
              metric_department_id: string
              metric_frequency?: string
              metric_is_active?: boolean
              metric_icon_name?: string
              metric_lower_is_better?: boolean
            }
        Returns: string
      }
      delete_manager: {
        Args: { manager_id: string }
        Returns: Json
      }
      delete_metric_definition: {
        Args: { metric_id: string }
        Returns: string
      }
      get_all_departments: {
        Args: Record<PropertyKey, never>
        Returns: {
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          manager_id: string | null
          name: string
          updated_at: string | null
        }[]
      }
      get_all_managers: {
        Args: Record<PropertyKey, never>
        Returns: {
          id: string
          name: string
          email: string
          department_id: string
          department_name: string
          is_active: boolean
          role: string
          created_at: string
          updated_at: string
        }[]
      }
      get_manager_by_id: {
        Args: { manager_id: string }
        Returns: {
          created_at: string | null
          department_id: string | null
          email: string
          id: string
          is_active: boolean | null
          name: string
          role: string | null
          updated_at: string | null
        }[]
      }
      get_metric_history: {
        Args: { metric_id_param: string; limit_param?: number }
        Returns: {
          date: string
          value: number
        }[]
      }
      get_metrics_by_department: {
        Args: { department_id_param?: string }
        Returns: {
          id: string
          name: string
          description: string
          unit: string
          target: number
          current: number
          department_id: string
          department_name: string
          frequency: string
          trend: string
          status: string
          is_active: boolean
          icon_name: string
          lower_is_better: boolean
        }[]
      }
      postgres_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      record_metric_value: {
        Args: { metric_id: string; metric_value: number; metric_date?: string }
        Returns: string
      }
      run_diagnostic_write_test: {
        Args: { test_id_param: string }
        Returns: Json
      }
      update_manager: {
        Args: {
          manager_id: string
          manager_name: string
          manager_email: string
          manager_department_id: string
          manager_is_active: boolean
        }
        Returns: Json
      }
      update_metric_definition: {
        Args:
          | {
              metric_id: string
              metric_name: string
              metric_description: string
              metric_unit: string
              metric_target: number
              metric_department_id: string
              metric_frequency?: string
              metric_is_active?: boolean
              metric_icon_name?: string
            }
          | {
              metric_id: string
              metric_name: string
              metric_description: string
              metric_unit: string
              metric_target: number
              metric_department_id: string
              metric_frequency?: string
              metric_is_active?: boolean
              metric_icon_name?: string
              metric_lower_is_better?: boolean
            }
        Returns: string
      }
      validate_metric_value_date: {
        Args: { metric_id: string; value_date: string }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
