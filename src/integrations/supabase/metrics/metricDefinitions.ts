
import { supabase } from '../client';
import { callRPC, formatCrudResult, type CrudResult } from '../core';
import type { MetricDefinition } from '../types/metric';

// Function to get metrics by department
export const getMetricsByDepartment = async (departmentId?: string, date?: string): Promise<CrudResult<MetricDefinition[]>> => {
  try {
    console.log("[getMetricsByDepartment] Starting request with params:", { 
      departmentId, 
      date,
      effectiveDepartmentId: departmentId === 'all' ? null : departmentId,
      effectiveDate: date || new Date().toISOString().split('T')[0]
    });
    
    // Check current user session
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    console.log("[getMetricsByDepartment] Current user:", {
      user: user ? { id: user.id, email: user.email } : null,
      userError
    });
    
    if (userError) {
      console.error("[getMetricsByDepartment] User authentication error:", userError);
      return formatCrudResult([], userError);
    }
    
    if (!user) {
      console.error("[getMetricsByDepartment] No authenticated user found");
      return formatCrudResult([], new Error("No authenticated user"));
    }
    
    // Call the RPC function instead of a direct query
    const { data, error } = await supabase.rpc('get_metrics_by_department', {
      department_id_param: departmentId === 'all' ? null : departmentId,
      date_param: date || new Date().toISOString().split('T')[0]
    });
    
    if (error) {
      console.error("[getMetricsByDepartment] RPC error:", error);
      return formatCrudResult([], error);
    }
    
    console.log("[getMetricsByDepartment] Successfully fetched metrics:", {
      count: data?.length || 0,
      sample: data?.length > 0 ? data[0] : null
    });
    
    return formatCrudResult(data as MetricDefinition[], null);
  } catch (error) {
    console.error('[getMetricsByDepartment] Unexpected error:', error);
    return formatCrudResult([], error);
  }
};

// Function to create a new metric
export const createMetricDefinition = async (metric: {
  name: string;
  description: string;
  unit: string;
  target: number;
  department_id: string;
  frequency?: string;
  is_active?: boolean;
  icon_name?: string;
  lower_is_better?: boolean;
  visualization_type?: string;
  priority?: string;
  default_period?: string;
}): Promise<CrudResult<string>> => {
  try {
    // Use the RPC function with SECURITY DEFINER to bypass RLS
    const { data, error } = await supabase.rpc('create_metric_definition', {
      metric_name: metric.name,
      metric_description: metric.description,
      metric_unit: metric.unit,
      metric_target: metric.target,
      metric_department_id: metric.department_id,
      metric_frequency: metric.frequency || 'monthly',
      metric_is_active: metric.is_active !== undefined ? metric.is_active : true,
      metric_icon_name: metric.icon_name || null,
      metric_lower_is_better: metric.lower_is_better !== undefined ? metric.lower_is_better : false,
      metric_visualization_type: metric.visualization_type || 'card',
      metric_priority: metric.priority || 'normal',
      metric_default_period: metric.default_period || 'month'
    });
      
    return formatCrudResult(data, error);
  } catch (error) {
    console.error('Error creating metric:', error);
    return formatCrudResult(null, error);
  }
};

// Function to update a metric
export const updateMetricDefinition = async (metricId: string, metric: {
  name: string;
  description: string;
  unit: string;
  target: number;
  department_id: string;
  frequency?: string;
  is_active?: boolean;
  icon_name?: string;
  lower_is_better?: boolean;
  visualization_type?: string; 
  priority?: string;
  default_period?: string;
}): Promise<CrudResult<string>> => {
  try {
    // Use the RPC function with SECURITY DEFINER to bypass RLS
    const { data, error } = await supabase.rpc('update_metric_definition', {
      metric_id: metricId,
      metric_name: metric.name,
      metric_description: metric.description,
      metric_unit: metric.unit,
      metric_target: metric.target,
      metric_department_id: metric.department_id,
      metric_frequency: metric.frequency || 'monthly',
      metric_is_active: metric.is_active !== undefined ? metric.is_active : true,
      metric_icon_name: metric.icon_name || null,
      metric_lower_is_better: metric.lower_is_better !== undefined ? metric.lower_is_better : false,
      metric_visualization_type: metric.visualization_type || 'card',
      metric_priority: metric.priority || 'normal',
      metric_default_period: metric.default_period || 'month'
    });
    
    return formatCrudResult(data, error);
  } catch (error) {
    console.error('Error updating metric:', error);
    return formatCrudResult(null, error);
  }
};

// Function to delete a metric
export const deleteMetricDefinition = async (metricId: string): Promise<CrudResult<string>> => {
  try {
    // Use the RPC function with SECURITY DEFINER to bypass RLS
    const { data, error } = await supabase.rpc('delete_metric_definition', {
      metric_id: metricId
    });
    
    return formatCrudResult(data, error);
  } catch (error) {
    console.error('Error deleting metric:', error);
    return formatCrudResult(null, error);
  }
};
