
import { supabase } from '../client';
import { callRPC, formatCrudResult, type CrudResult } from '../core';
import type { MetricDefinition } from '../types/metric';

// Function to get metrics by department
export const getMetricsByDepartment = async (departmentId?: string, date?: string): Promise<CrudResult<MetricDefinition[]>> => {
  try {
    console.log("Fetching metrics with params - departmentId:", departmentId, "date:", date);
    
    // Use direct database query instead of RPC to avoid function not found errors
    let query = supabase
      .from('metrics_definition')
      .select(`
        id,
        name,
        description,
        unit,
        target,
        department_id,
        departments:department_id(name),
        frequency,
        is_active,
        icon_name,
        lower_is_better,
        created_at,
        updated_at
      `);
    
    // Apply department filter if provided
    if (departmentId && departmentId !== 'all') {
      query = query.eq('department_id', departmentId);
    }
    
    const { data, error } = await query.order('name');
    
    if (error) {
      console.error("Error fetching metrics:", error);
      return formatCrudResult([], error);
    }
    
    // Transform metrics to match expected format
    const transformedData = data?.map(metric => ({
      ...metric,
      department_name: metric.departments?.name || null,
      current: 0, // Default value when no measurement
      trend: 'neutral',
      status: 'warning',
      visualization_type: 'card',
      priority: 'normal',
      default_period: 'month',
      last_value_date: null
    }));
    
    console.log("Successfully fetched metrics:", transformedData?.length || 0);
    return formatCrudResult(transformedData as MetricDefinition[], null);
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
    const { data, error } = await supabase
      .from('metrics_definition')
      .insert({
        name: metric.name,
        description: metric.description,
        unit: metric.unit,
        target: metric.target,
        department_id: metric.department_id,
        frequency: metric.frequency || 'monthly',
        is_active: metric.is_active !== undefined ? metric.is_active : true,
        icon_name: metric.icon_name || null,
        lower_is_better: metric.lower_is_better !== undefined ? metric.lower_is_better : false
        // Note: Additional fields like visualization_type, priority, and default_period
        // are handled in the UI layer but not stored in the database
      })
      .select('id')
      .single();
      
    return formatCrudResult(data?.id, error);
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
    // We only update the fields that the database table actually has
    const { data, error } = await supabase
      .from('metrics_definition')
      .update({
        name: metric.name,
        description: metric.description,
        unit: metric.unit,
        target: metric.target,
        department_id: metric.department_id,
        frequency: metric.frequency || 'monthly',
        is_active: metric.is_active !== undefined ? metric.is_active : true,
        icon_name: metric.icon_name || null,
        lower_is_better: metric.lower_is_better !== undefined ? metric.lower_is_better : false,
        updated_at: new Date().toISOString()
      })
      .eq('id', metricId)
      .select('id')
      .single();
    
    return formatCrudResult(data?.id, error);
  } catch (error) {
    console.error('Error updating metric:', error);
    return formatCrudResult(null, error);
  }
};

// Function to delete a metric
export const deleteMetricDefinition = async (metricId: string): Promise<CrudResult<string>> => {
  try {
    // First delete related metric values
    await supabase
      .from('metrics_values')
      .delete()
      .eq('metrics_definition_id', metricId);
    
    // Then delete the metric definition
    const { data, error } = await supabase
      .from('metrics_definition')
      .delete()
      .eq('id', metricId)
      .select('id')
      .single();
    
    return formatCrudResult(data?.id, error);
  } catch (error) {
    console.error('Error deleting metric:', error);
    return formatCrudResult(null, error);
  }
};
