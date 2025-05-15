
import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import MetricsPage from '@/components/metrics/MetricsPage';

const Metrics = () => {
  const { isAdmin, manager } = useAuth();
  
  // Se não for admin nem gestor de departamento, redirecionar para o dashboard
  if (!isAdmin && !manager) {
    return <Navigate to="/dashboard" replace />;
  }

  return <MetricsPage />;
};

export default Metrics;
