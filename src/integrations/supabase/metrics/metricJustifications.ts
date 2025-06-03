
import { supabase } from '../client';
import { callRPC, formatCrudResult, CrudResult } from '../core';

export interface MetricJustification {
  id: string;
  metric_definition_id: string;
  user_id: string;
  period_date: string;
  justification: string;
  action_plan: string;
  status: 'pending' | 'reviewed' | 'approved' | 'needs_revision';
  admin_feedback?: string;
  reviewed_by?: string;
  reviewed_at?: string;
  created_at: string;
  updated_at: string;
  user_name?: string;
}

export interface PendingJustification {
  id: string;
  metric_definition_id: string;
  metric_name: string;
  department_name: string;
  user_id: string;
  user_name: string;
  period_date: string;
  justification: string;
  action_plan: string;
  created_at: string;
}

// Criar ou atualizar justificativa
export const createOrUpdateMetricJustification = async (
  metricId: string,
  periodDate: string,
  justification: string,
  actionPlan: string
): Promise<CrudResult<string>> => {
  try {
    const { data, error } = await callRPC<string>('create_or_update_metric_justification', {
      metric_id: metricId,
      period_date_param: periodDate,
      justification_text: justification,
      action_plan_text: actionPlan
    });

    if (error) return formatCrudResult(null, error);
    return formatCrudResult(data, null);
  } catch (error: any) {
    return formatCrudResult(null, error);
  }
};

// Buscar justificativa por métrica e período
export const getMetricJustification = async (
  metricId: string,
  periodDate: string
): Promise<CrudResult<MetricJustification[]>> => {
  try {
    const { data, error } = await callRPC<MetricJustification[]>('get_metric_justification', {
      metric_id: metricId,
      period_date_param: periodDate
    });

    if (error) return formatCrudResult(null, error);
    return formatCrudResult(data || [], null);
  } catch (error: any) {
    return formatCrudResult(null, error);
  }
};

// Revisar justificativa (admin)
export const reviewMetricJustification = async (
  justificationId: string,
  newStatus: 'reviewed' | 'approved' | 'needs_revision',
  feedback?: string
): Promise<CrudResult<string>> => {
  try {
    const { data, error } = await callRPC<string>('review_metric_justification', {
      justification_id: justificationId,
      new_status: newStatus,
      feedback_text: feedback
    });

    if (error) return formatCrudResult(null, error);
    return formatCrudResult(data, null);
  } catch (error: any) {
    return formatCrudResult(null, error);
  }
};

// Buscar justificativas pendentes (admin)
export const getPendingJustifications = async (): Promise<CrudResult<PendingJustification[]>> => {
  try {
    const { data, error } = await callRPC<PendingJustification[]>('get_pending_justifications');

    if (error) return formatCrudResult(null, error);
    return formatCrudResult(data || [], null);
  } catch (error: any) {
    return formatCrudResult(null, error);
  }
};
