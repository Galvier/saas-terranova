
import { callRPC, formatCrudResult, type CrudResult } from './core';
import type { MetricDefinition, MetricHistory } from './types/metric';

// Function to get metrics by department
export const getMetricsByDepartment = async (departmentId?: string, date?: string): Promise<CrudResult<MetricDefinition[]>> => {
  try {
    // If departmentId is "all", pass undefined to get all metrics
    const actualDepartmentId = departmentId === "all" ? undefined : departmentId;
    
    const { data, error } = await callRPC<MetricDefinition[]>('get_metrics_by_department', {
      department_id_param: actualDepartmentId,
      date_param: date || new Date().toISOString().split('T')[0]
    });
    return formatCrudResult(data, error);
  } catch (error) {
    console.error('Error fetching metrics:', error);
    return formatCrudResult(null, error);
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
      metric_lower_is_better: metric.lower_is_better
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
      metric_lower_is_better: metric.lower_is_better
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
