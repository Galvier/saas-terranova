
import { callRPC, formatCrudResult, type CrudResult } from '../core';
import type { DashboardConfig } from '../types/metric';

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
): Promise<CrudResult<DashboardConfig>> => {
  try {
    console.log("Loading dashboard config for user ID:", userId);
    const timestamp = new Date().getTime();
    const { data, error } = await callRPC<DashboardConfig>('get_admin_dashboard_config', {
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
