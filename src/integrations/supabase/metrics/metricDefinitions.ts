
import { supabase } from '../client';
import { callRPC, formatCrudResult, type CrudResult } from '../core';
import type { MetricDefinition } from '../types/metric';

// Function to get metrics by department
export const getMetricsByDepartment = async (departmentId?: string, date?: string): Promise<CrudResult<MetricDefinition[]>> => {
  try {
    console.log("Fetching metrics with params - departmentId:", departmentId, "date:", date);
    
    // Call the RPC function instead of a direct query
    const { data, error } = await supabase.rpc('get_metrics_by_department', {
      department_id_param: departmentId === 'all' ? null : departmentId,
      date_param: date || new Date().toISOString().split('T')[0]
    });
    
    if (error) {
      console.error("Error fetching metrics:", error);
      return formatCrudResult([], error);
    }
    
    console.log("Successfully fetched metrics:", data?.length || 0);
    return formatCrudResult(data as MetricDefinition[], null);
  } catch (error) {
    console.error('Error in getMetricsByDepartment:', error);
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
      metric_lower_is_better: metric.lower_is_better !== undefined ? metric.lower_is_better : false
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
      metric_lower_is_better: metric.lower_is_better !== undefined ? metric.lower_is_better : false
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
