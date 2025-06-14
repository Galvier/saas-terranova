
import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import ManagerDashboard from '@/components/dashboard/ManagerDashboard';
import AnalyticsDashboard from '@/components/dashboard/AnalyticsDashboard';

const Dashboard = () => {
  const { isAdmin } = useAuth();

  return (
    <div className="animate-fade-in mobile-container">
      <div className="space-y-4 md:space-y-6">
        {isAdmin ? (
          <AnalyticsDashboard metrics={[]} />
        ) : (
          <ManagerDashboard metrics={[]} departmentName="" />
        )}
      </div>
    </div>
  );
};

export default Dashboard;
