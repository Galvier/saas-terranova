
import { supabase } from '../client';
import { callRPC, formatCrudResult, type CrudResult } from '../core';
import type { DashboardConfig } from '../types/metric';
import { toast } from '@/hooks/use-toast';

export const getAdminDashboardConfig = async (userId: string): Promise<CrudResult<DashboardConfig | null>> => {
  try {
    console.log("Fetching admin dashboard config for user:", userId);
    
    const { data, error } = await supabase.rpc('get_admin_dashboard_config', {
      user_id_param: userId
    });
    
    if (error) {
      console.error("Error fetching admin dashboard config:", error);
      return formatCrudResult(null, error);
    }
    
    if (!data || data.length === 0) {
      console.log("No admin dashboard config found for user");
      return formatCrudResult(null, null);
    }
    
    console.log("Successfully fetched admin dashboard config:", data[0]);
    return formatCrudResult(data[0] as DashboardConfig, null);
  } catch (error) {
    console.error('Error in getAdminDashboardConfig:', error);
    return formatCrudResult(null, error);
  }
};

export const saveAdminDashboardConfig = async (
  metricIds: string[], 
  userId: string
): Promise<CrudResult<string>> => {
  try {
    console.log("Saving admin dashboard config:", { metricIds, userId });
    
    // Convert string IDs to UUIDs by casting them
    const uuidMetricIds = metricIds; // The RPC function will handle the conversion properly
    
    const { data, error } = await supabase.rpc('save_admin_dashboard_config', {
      metrics_ids: uuidMetricIds,
      user_id: userId
    });
    
    if (error) {
      console.error("Error saving admin dashboard config:", error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar a configuração do dashboard",
        variant: "destructive",
      });
      return formatCrudResult(null, error);
    }
    
    console.log("Successfully saved admin dashboard config:", data);
    toast({
      title: "Configuração salva",
      description: "Suas preferências do dashboard foram salvas",
    });
    return formatCrudResult(data, null);
  } catch (error) {
    console.error('Error in saveAdminDashboardConfig:', error);
    toast({
      title: "Erro",
      description: "Ocorreu um erro ao salvar a configuração do dashboard",
      variant: "destructive",
    });
    return formatCrudResult(null, error);
  }
};
