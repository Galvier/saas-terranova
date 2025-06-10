import { supabase } from '../client';
import { callRPC, formatCrudResult, type CrudResult } from '../core';
import type { MetricDefinition } from '../types/metric';

// Function to get metrics by department
export const getMetricsByDepartment = async (departmentId?: string, date?: string): Promise<CrudResult<MetricDefinition[]>> => {
  try {
    console.log("[getMetricsByDepartment] Iniciando requisição:", { 
      departmentId, 
      date,
      effectiveDepartmentId: departmentId === 'all' ? null : departmentId,
      effectiveDate: date || new Date().toISOString().split('T')[0]
    });
    
    // Check current user session
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      console.error("[getMetricsByDepartment] Erro de autenticação:", userError);
      return formatCrudResult([], userError);
    }
    
    if (!user) {
      console.error("[getMetricsByDepartment] Usuário não autenticado");
      return formatCrudResult([], new Error("Usuário não autenticado"));
    }
    
    console.log("[getMetricsByDepartment] Usuário autenticado:", { id: user.id, email: user.email });
    
    // Primeiro tentar com a função RPC
    console.log("[getMetricsByDepartment] Tentando função RPC...");
    const { data: rpcData, error: rpcError } = await supabase.rpc('get_metrics_by_department', {
      department_id_param: departmentId === 'all' ? null : departmentId,
      date_param: date || new Date().toISOString().split('T')[0]
    });
    
    if (!rpcError && rpcData) {
      console.log("[getMetricsByDepartment] RPC bem-sucedida:", {
        count: rpcData?.length || 0,
        sample: rpcData?.length > 0 ? rpcData[0] : null
      });
      return formatCrudResult(rpcData as MetricDefinition[], null);
    }
    
    console.warn("[getMetricsByDepartment] RPC falhou, tentando query direta:", rpcError);
    
    // Fallback: query direta (mais simples)
    let query = supabase
      .from('metrics_definition')
      .select(`
        *,
        department:departments(name)
      `);
    
    // Filtrar por departamento se especificado
    if (departmentId && departmentId !== 'all') {
      query = query.eq('department_id', departmentId);
    }
    
    const { data: directData, error: directError } = await query;
    
    if (directError) {
      console.error("[getMetricsByDepartment] Query direta também falhou:", directError);
      return formatCrudResult([], directError);
    }
    
    // Transformar dados para o formato esperado
    const transformedData = (directData || []).map(metric => ({
      ...metric,
      department_name: metric.department?.name || 'Sem departamento',
      current: 0, // Placeholder - seria necessário buscar valores separadamente
      trend: 'neutral' as const,
      status: 'neutral' as const,
      last_value_date: null
    }));
    
    console.log("[getMetricsByDepartment] Query direta bem-sucedida:", {
      count: transformedData.length,
      sample: transformedData.length > 0 ? transformedData[0] : null
    });
    
    return formatCrudResult(transformedData as MetricDefinition[], null);
  } catch (error) {
    console.error('[getMetricsByDepartment] Erro inesperado:', error);
    return formatCrudResult([], error instanceof Error ? error : new Error(String(error)));
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
