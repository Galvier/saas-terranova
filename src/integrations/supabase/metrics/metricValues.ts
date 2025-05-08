
import { callRPC, formatCrudResult, type CrudResult } from '../core';
import type { MetricHistory } from '../types/metric';

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
