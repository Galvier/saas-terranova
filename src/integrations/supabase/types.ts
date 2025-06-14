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
      admin_dashboard_config: {
        Row: {
          created_at: string
          id: string
          metric_ids: string[]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          metric_ids?: string[]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          metric_ids?: string[]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      backup_data: {
        Row: {
          backup_content: Json
          backup_history_id: string
          compressed: boolean
          created_at: string
          id: string
        }
        Insert: {
          backup_content: Json
          backup_history_id: string
          compressed?: boolean
          created_at?: string
          id?: string
        }
        Update: {
          backup_content?: Json
          backup_history_id?: string
          compressed?: boolean
          created_at?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "backup_data_backup_history_id_fkey"
            columns: ["backup_history_id"]
            isOneToOne: false
            referencedRelation: "backup_history"
            referencedColumns: ["id"]
          },
        ]
      }
      backup_history: {
        Row: {
          created_at: string
          file_size: number
          filename: string
          id: string
          status: string
          tables_count: number
          total_records: number
          user_id: string | null
        }
        Insert: {
          created_at?: string
          file_size: number
          filename: string
          id?: string
          status?: string
          tables_count: number
          total_records: number
          user_id?: string | null
        }
        Update: {
          created_at?: string
          file_size?: number
          filename?: string
          id?: string
          status?: string
          tables_count?: number
          total_records?: number
          user_id?: string | null
        }
        Relationships: []
      }
      backup_settings: {
        Row: {
          auto_backup_enabled: boolean
          backup_frequency: string
          created_at: string
          id: string
          last_auto_backup: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          auto_backup_enabled?: boolean
          backup_frequency?: string
          created_at?: string
          id?: string
          last_auto_backup?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          auto_backup_enabled?: boolean
          backup_frequency?: string
          created_at?: string
          id?: string
          last_auto_backup?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      department_managers: {
        Row: {
          created_at: string
          department_id: string
          id: string
          is_primary: boolean
          manager_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          department_id: string
          id?: string
          is_primary?: boolean
          manager_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          department_id?: string
          id?: string
          is_primary?: boolean
          manager_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "department_managers_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "department_managers_manager_id_fkey"
            columns: ["manager_id"]
            isOneToOne: false
            referencedRelation: "managers"
            referencedColumns: ["id"]
          },
        ]
      }
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
          avatar_url: string | null
          created_at: string | null
          department_id: string | null
          email: string
          id: string
          is_active: boolean | null
          name: string
          role: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          department_id?: string | null
          email: string
          id?: string
          is_active?: boolean | null
          name: string
          role?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          department_id?: string | null
          email?: string
          id?: string
          is_active?: boolean | null
          name?: string
          role?: string | null
          updated_at?: string | null
          user_id?: string | null
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
      managers_backup: {
        Row: {
          created_at: string | null
          department_id: string | null
          email: string | null
          id: string | null
          is_active: boolean | null
          name: string | null
          role: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          department_id?: string | null
          email?: string | null
          id?: string | null
          is_active?: boolean | null
          name?: string | null
          role?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          department_id?: string | null
          email?: string | null
          id?: string | null
          is_active?: boolean | null
          name?: string | null
          role?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      metric_justifications: {
        Row: {
          action_plan: string
          admin_feedback: string | null
          created_at: string
          id: string
          justification: string
          metric_definition_id: string
          period_date: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          action_plan: string
          admin_feedback?: string | null
          created_at?: string
          id?: string
          justification: string
          metric_definition_id: string
          period_date: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          action_plan?: string
          admin_feedback?: string | null
          created_at?: string
          id?: string
          justification?: string
          metric_definition_id?: string
          period_date?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "metric_justifications_metric_definition_id_fkey"
            columns: ["metric_definition_id"]
            isOneToOne: false
            referencedRelation: "metrics_definition"
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
          default_period: string
          department_id: string | null
          description: string | null
          frequency: string
          icon_name: string | null
          id: string
          is_active: boolean | null
          lower_is_better: boolean
          name: string
          priority: string
          target: number
          unit: string
          updated_at: string | null
          visualization_type: string
        }
        Insert: {
          created_at?: string | null
          default_period?: string
          department_id?: string | null
          description?: string | null
          frequency?: string
          icon_name?: string | null
          id?: string
          is_active?: boolean | null
          lower_is_better?: boolean
          name: string
          priority?: string
          target: number
          unit: string
          updated_at?: string | null
          visualization_type?: string
        }
        Update: {
          created_at?: string | null
          default_period?: string
          department_id?: string | null
          description?: string | null
          frequency?: string
          icon_name?: string | null
          id?: string
          is_active?: boolean | null
          lower_is_better?: boolean
          name?: string
          priority?: string
          target?: number
          unit?: string
          updated_at?: string | null
          visualization_type?: string
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
      notification_settings: {
        Row: {
          created_at: string
          description: string | null
          id: string
          setting_key: string
          setting_value: Json
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          setting_key: string
          setting_value: Json
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          setting_key?: string
          setting_value?: Json
          updated_at?: string
        }
        Relationships: []
      }
      notification_templates: {
        Row: {
          category: string
          created_at: string | null
          id: string
          is_active: boolean | null
          message: string
          name: string
          title: string
          type: string
          updated_at: string | null
        }
        Insert: {
          category: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          message: string
          name: string
          title: string
          type?: string
          updated_at?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          message?: string
          name?: string
          title?: string
          type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean
          message: string
          metadata: Json | null
          title: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean
          message: string
          metadata?: Json | null
          title: string
          type?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string
          metadata?: Json | null
          title?: string
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
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
      push_subscriptions: {
        Row: {
          auth: string
          created_at: string | null
          endpoint: string
          id: string
          is_active: boolean | null
          p256dh: string
          user_id: string
        }
        Insert: {
          auth: string
          created_at?: string | null
          endpoint: string
          id?: string
          is_active?: boolean | null
          p256dh: string
          user_id: string
        }
        Update: {
          auth?: string
          created_at?: string | null
          endpoint?: string
          id?: string
          is_active?: boolean | null
          p256dh?: string
          user_id?: string
        }
        Relationships: []
      }
      scheduled_notifications: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          last_sent_at: string | null
          schedule_day: number | null
          schedule_time: string | null
          schedule_type: string
          scheduled_for: string | null
          target_id: string | null
          target_type: string
          template_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          last_sent_at?: string | null
          schedule_day?: number | null
          schedule_time?: string | null
          schedule_type: string
          scheduled_for?: string | null
          target_id?: string | null
          target_type: string
          template_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          last_sent_at?: string | null
          schedule_day?: number | null
          schedule_time?: string | null
          schedule_type?: string
          scheduled_for?: string | null
          target_id?: string | null
          target_type?: string
          template_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "scheduled_notifications_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "notification_templates"
            referencedColumns: ["id"]
          },
        ]
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
      user_settings: {
        Row: {
          animations_enabled: boolean
          created_at: string
          density: string
          id: string
          notification_preferences: Json
          theme: string
          updated_at: string
          user_id: string
        }
        Insert: {
          animations_enabled?: boolean
          created_at?: string
          density?: string
          id?: string
          notification_preferences?: Json
          theme?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          animations_enabled?: boolean
          created_at?: string
          density?: string
          id?: string
          notification_preferences?: Json
          theme?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      add_manager_to_department: {
        Args: {
          department_id_param: string
          manager_id_param: string
          is_primary_param?: boolean
        }
        Returns: string
      }
      broadcast_notification_from_template: {
        Args: {
          template_id_param: string
          target_type?: string
          department_id_param?: string
          variables?: Json
        }
        Returns: number
      }
      check_function_exists: {
        Args: { function_name: string }
        Returns: Json
      }
      check_table_exists_and_count: {
        Args: { table_name: string }
        Returns: Json
      }
      create_auth_for_manager: {
        Args: { manager_id_param: string; temp_password: string }
        Returns: Json
      }
      create_department: {
        Args:
          | {
              department_name: string
              department_description: string
              department_is_active: boolean
              department_manager_id?: string
            }
          | {
              department_name: string
              department_description: string
              department_is_active: boolean
              department_manager_id?: string
              manager_ids?: string[]
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
              metric_visualization_type?: string
              metric_priority?: string
              metric_default_period?: string
            }
        Returns: string
      }
      create_notification: {
        Args: {
          target_user_id: string
          notification_title: string
          notification_message: string
          notification_type?: string
          notification_metadata?: Json
        }
        Returns: string
      }
      create_notification_from_template: {
        Args: {
          template_id_param: string
          target_user_id: string
          variables?: Json
        }
        Returns: string
      }
      create_or_update_metric_justification: {
        Args: {
          metric_id: string
          period_date_param: string
          justification_text: string
          action_plan_text: string
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
      diagnose_auth_sync_issues: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      fix_user_manager_inconsistencies: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      get_admin_dashboard_config: {
        Args: { user_id_param: string }
        Returns: {
          id: string
          user_id: string
          metric_ids: string[]
          created_at: string
          updated_at: string
        }[]
      }
      get_all_departments: {
        Args: Record<PropertyKey, never>
        Returns: {
          id: string
          name: string
          description: string
          is_active: boolean
          manager_id: string
          created_at: string
          updated_at: string
          manager_name: string
          managers: Json
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
          user_id: string
        }[]
      }
      get_current_user_manager: {
        Args: Record<PropertyKey, never>
        Returns: {
          avatar_url: string | null
          created_at: string | null
          department_id: string | null
          email: string
          id: string
          is_active: boolean | null
          name: string
          role: string | null
          updated_at: string | null
          user_id: string | null
        }[]
      }
      get_manager_by_id: {
        Args: { manager_id: string }
        Returns: {
          avatar_url: string | null
          created_at: string | null
          department_id: string | null
          email: string
          id: string
          is_active: boolean | null
          name: string
          role: string | null
          updated_at: string | null
          user_id: string | null
        }[]
      }
      get_metric_history: {
        Args: { metric_id_param: string; limit_param?: number }
        Returns: {
          date: string
          value: number
        }[]
      }
      get_metric_justification: {
        Args: { metric_id: string; period_date_param: string }
        Returns: {
          id: string
          metric_definition_id: string
          user_id: string
          period_date: string
          justification: string
          action_plan: string
          status: string
          admin_feedback: string
          reviewed_by: string
          reviewed_at: string
          created_at: string
          updated_at: string
          user_name: string
        }[]
      }
      get_metrics_by_department: {
        Args:
          | { department_id_param?: string }
          | { department_id_param?: string; date_param?: string }
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
          visualization_type: string
          priority: string
          default_period: string
          last_value_date: string
        }[]
      }
      get_notification_setting: {
        Args: { setting_key_param: string }
        Returns: Json
      }
      get_pending_justifications: {
        Args: Record<PropertyKey, never>
        Returns: {
          id: string
          metric_definition_id: string
          metric_name: string
          department_name: string
          user_id: string
          user_name: string
          period_date: string
          justification: string
          action_plan: string
          created_at: string
        }[]
      }
      get_user_settings: {
        Args: { user_id_param: string }
        Returns: {
          animations_enabled: boolean
          created_at: string
          density: string
          id: string
          notification_preferences: Json
          theme: string
          updated_at: string
          user_id: string
        }[]
      }
      mark_all_notifications_as_read: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      mark_notification_as_read: {
        Args: { notification_id: string }
        Returns: boolean
      }
      postgres_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      process_automatic_notifications: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      record_metric_value: {
        Args: { metric_id: string; metric_value: number; metric_date?: string }
        Returns: string
      }
      remove_manager_from_department: {
        Args: { department_id_param: string; manager_id_param: string }
        Returns: boolean
      }
      restore_backup_data: {
        Args: { backup_history_id_param: string }
        Returns: Json
      }
      review_metric_justification: {
        Args: {
          justification_id: string
          new_status: string
          feedback_text?: string
        }
        Returns: string
      }
      run_auto_backup: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      run_diagnostic_write_test: {
        Args: { test_id_param: string }
        Returns: Json
      }
      save_admin_dashboard_config: {
        Args: { metrics_ids: string[]; user_id: string }
        Returns: string
      }
      save_user_settings: {
        Args:
          | {
              p_user_id: string
              p_theme: string
              p_animations_enabled?: boolean
              p_notification_preferences?: Json
            }
          | {
              p_user_id: string
              p_theme: string
              p_density?: string
              p_animations_enabled?: boolean
              p_notification_preferences?: Json
            }
        Returns: string
      }
      update_manager: {
        Args:
          | {
              manager_id: string
              manager_name: string
              manager_email: string
              manager_department_id: string
              manager_is_active: boolean
            }
          | {
              manager_id: string
              manager_name: string
              manager_email: string
              manager_department_id: string
              manager_is_active: boolean
              manager_role?: string
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
              metric_visualization_type?: string
              metric_priority?: string
              metric_default_period?: string
            }
        Returns: string
      }
      update_notification_setting: {
        Args: { setting_key_param: string; new_value: Json }
        Returns: undefined
      }
      validate_current_password: {
        Args: { current_password: string }
        Returns: boolean
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
