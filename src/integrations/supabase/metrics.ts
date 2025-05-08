import { callRPC, formatCrudResult, type CrudResult } from './core';
import type { MetricDefinition, MetricHistory, AdminDashboardConfig } from './types/metric';

// Function to get metrics by department
export const getMetricsByDepartment = async (departmentId?: string, date?: string): Promise<CrudResult<MetricDefinition[]>> => {
  try {
    console.log("Fetching metrics with params - departmentId:", departmentId, "date:", date);
    
    // If departmentId is "all", pass undefined to get all metrics
    const actualDepartmentId = departmentId === "all" ? undefined : departmentId;
    
    // Add timestamp to prevent caching issues
    const timestamp = new Date().getTime();
    
    const { data, error } = await callRPC<MetricDefinition[]>('get_metrics_by_department', {
      department_id_param: actualDepartmentId,
      date_param: date || new Date().toISOString().split('T')[0],
      _cache_buster: timestamp // Add cache buster to prevent stale data
    });
    
    console.log("Metrics API response:", { data: data?.length || 0, error });
    
    return formatCrudResult(data || [], error);  // Garantir que data sempre seja um array
  } catch (error) {
    console.error('Error fetching metrics:', error);
    return formatCrudResult([], error);  // Retornar array vazio em caso de erro
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
    const { data, error } = await callRPC<string>('create_metric_definition', {
      metric_name: metric.name,
      metric_description: metric.description,
      metric_unit: metric.unit,
      metric_target: metric.target,
      metric_department_id: metric.department_id,
      metric_frequency: metric.frequency,
      metric_is_active: metric.is_active,
      metric_icon_name: metric.icon_name,
      metric_lower_is_better: metric.lower_is_better,
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
    const { data, error } = await callRPC<string>('update_metric_definition', {
      metric_id: metricId,
      metric_name: metric.name,
      metric_description: metric.description,
      metric_unit: metric.unit,
      metric_target: metric.target,
      metric_department_id: metric.department_id,
      metric_frequency: metric.frequency,
      metric_is_active: metric.is_active,
      metric_icon_name: metric.icon_name,
      metric_lower_is_better: metric.lower_is_better,
      metric_visualization_type: metric.visualization_type,
      metric_priority: metric.priority,
      metric_default_period: metric.default_period
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
    const { data, error } = await callRPC<string>('delete_metric_definition', {
      metric_id: metricId
    });
    return formatCrudResult(data, error);
  } catch (error) {
    console.error('Error deleting metric:', error);
    return formatCrudResult(null, error);
  }
};

// Function to record a metric value
export const recordMetricValue = async (
  metricId: string,
  value: number,
  date?: string
): Promise<CrudResult<string>> => {
  try {
    const { data, error } = await callRPC<string>('record_metric_value', {
      metric_id: metricId,
      metric_value: value,
      metric_date: date
    });
    return formatCrudResult(data, error);
  } catch (error) {
    console.error('Error recording metric value:', error);
    return formatCrudResult(null, error);
  }
};

// Function to get metric history
export const getMetricHistory = async (
  metricId: string,
  limit?: number
): Promise<CrudResult<MetricHistory[]>> => {
  try {
    const { data, error } = await callRPC<MetricHistory[]>('get_metric_history', {
      metric_id_param: metricId,
      limit_param: limit
    });
    return formatCrudResult(data, error);
  } catch (error) {
    console.error('Error fetching metric history:', error);
    return formatCrudResult(null, error);
  }
};

// Function to save admin dashboard configuration
export const saveAdminDashboardConfig = async (
  metricIds: string[],
  userId: string
): Promise<CrudResult<string>> => {
  try {
    console.log("Sending to server - metrics:", metricIds, "user:", userId);
    const timestamp = new Date().getTime();
    const { data, error } = await callRPC<string>('save_admin_dashboard_config', {
      metrics_ids: metricIds,
      user_id: userId,
      _cache_buster: timestamp
    });
    console.log("Server response:", { data, error });
    return formatCrudResult(data, error);
  } catch (error) {
    console.error('Error saving admin dashboard config:', error);
    return formatCrudResult(null, error);
  }
};

// Function to get admin dashboard configuration
export const getAdminDashboardConfig = async (
  userId: string
): Promise<CrudResult<AdminDashboardConfig>> => {
  try {
    console.log("Loading dashboard config for user ID:", userId);
    const timestamp = new Date().getTime();
    const { data, error } = await callRPC<AdminDashboardConfig>('get_admin_dashboard_config', {
      user_id_param: userId,
      _cache_buster: timestamp 
    });
    
    if (error) {
      console.error("Error fetching dashboard config:", error);
      return formatCrudResult(null, error);
    }
    
    if (!data) {
      console.log("No dashboard config found for user:", userId);
      return formatCrudResult({ 
        id: "", 
        user_id: userId, 
        metric_ids: [], 
        created_at: "", 
        updated_at: "" 
      }, null);
    }
    
    console.log("Found dashboard config:", data);
    return formatCrudResult(data, null);
  } catch (error) {
    console.error('Error fetching admin dashboard config:', error);
    return formatCrudResult(null, error);
  }
};
