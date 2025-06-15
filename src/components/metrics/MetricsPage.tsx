
import React from 'react';
import { useMetricsData } from '@/hooks/useMetricsData';
import { usePendingJustifications } from '@/hooks/usePendingJustifications';
import MetricsHeader from '@/components/metrics/MetricsHeader';
import MetricsTable from '@/components/metrics/MetricsTable';
import MetricsDialogs from '@/components/metrics/MetricsDialogs';
import JustificationsAdminPanel from '@/components/metrics/JustificationsAdminPanel';
import DateFilter from '@/components/filters/DateFilter';
import UserProfileIndicator from '@/components/UserProfileIndicator';
import { EnhancedTabs, EnhancedTabsList, EnhancedTabsTrigger, EnhancedTabsContent } from '@/components/ui/enhanced-tabs';
import { useAuth } from '@/hooks/useAuth';
import { useIsMobile } from '@/hooks/use-mobile';

const MetricsPage = () => {
  const { isAdmin } = useAuth();
  const isMobile = useIsMobile();
  const { count: pendingJustificationsCount } = usePendingJustifications();
  
  const {
    departments,
    metrics,
    isLoading,
    selectedDepartment,
    setSelectedDepartment,
    selectedDate,
    setSelectedDate,
    dateRangeType,
    setDateRangeType,
    departmentName,
    dialogStates,
    handleDialogActions,
    selectedMetric,
    handleMetricActions,
  } = useMetricsData();

  if (isAdmin) {
    return (
      <div className="animate-fade-in">
        <div className="mobile-container">
          <MetricsHeader 
            departments={departments}
            selectedDepartment={selectedDepartment}
            setSelectedDepartment={setSelectedDepartment}
            setIsCreateDialogOpen={dialogStates.setIsCreateDialogOpen}
            isAdmin={isAdmin}
          />
          
          <EnhancedTabs defaultValue="metrics" className="w-full">
            <EnhancedTabsList className={`grid w-full grid-cols-2 mb-6 ${isMobile ? 'mobile-touch' : ''}`}>
              <EnhancedTabsTrigger value="metrics" className={isMobile ? 'mobile-text' : ''}>
                Métricas
              </EnhancedTabsTrigger>
              <EnhancedTabsTrigger value="justifications" badge={pendingJustificationsCount} className={isMobile ? 'mobile-text' : ''}>
                Justificativas
              </EnhancedTabsTrigger>
            </EnhancedTabsList>
            
            <EnhancedTabsContent value="metrics">
              <div className={`flex ${isMobile ? 'flex-col' : 'flex-wrap'} justify-between items-start gap-4 mb-6`}>
                <UserProfileIndicator 
                  selectedDepartment={selectedDepartment}
                  departmentName={departmentName}
                />
                
                <DateFilter
                  selectedDate={selectedDate}
                  onDateChange={setSelectedDate}
                  dateRangeType={dateRangeType}
                  onDateRangeTypeChange={setDateRangeType}
                  className="w-full sm:w-auto"
                />
              </div>

              {isLoading ? (
                <div className="text-center py-8 mobile-text">Carregando métricas...</div>
              ) : metrics.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground mobile-card">
                  <p className="mobile-text">Nenhuma métrica encontrada. Crie uma nova métrica para começar.</p>
                </div>
              ) : (
                <MetricsTable 
                  metrics={metrics}
                  onAddValue={handleMetricActions.handleAddValueClick}
                  onEdit={handleMetricActions.handleEditClick}
                  onDelete={handleMetricActions.handleDeleteClick}
                />
              )}
            </EnhancedTabsContent>
            
            <EnhancedTabsContent value="justifications">
              <JustificationsAdminPanel />
            </EnhancedTabsContent>
          </EnhancedTabs>
        </div>

        <MetricsDialogs 
          departments={departments}
          selectedMetric={selectedMetric}
          isCreateDialogOpen={dialogStates.isCreateDialogOpen}
          isEditDialogOpen={dialogStates.isEditDialogOpen}
          isValueDialogOpen={dialogStates.isValueDialogOpen}
          isDeleteDialogOpen={dialogStates.isDeleteDialogOpen}
          onCreateSuccess={handleDialogActions.handleMetricSuccess}
          onEditSuccess={handleDialogActions.handleMetricSuccess}
          onValueSuccess={handleDialogActions.handleValueSuccess}
          onDeleteConfirm={handleDialogActions.handleDeleteConfirm}
          setIsCreateDialogOpen={dialogStates.setIsCreateDialogOpen}
          setIsEditDialogOpen={dialogStates.setIsEditDialogOpen}
          setIsValueDialogOpen={dialogStates.setIsValueDialogOpen}
          setIsDeleteDialogOpen={dialogStates.setIsDeleteDialogOpen}
        />
      </div>
    );
  }

  // Para gestores (não admin), mostrar apenas a aba de métricas
  return (
    <div className="animate-fade-in">
      <div className="mobile-container">
        <MetricsHeader 
          departments={departments}
          selectedDepartment={selectedDepartment}
          setSelectedDepartment={setSelectedDepartment}
          setIsCreateDialogOpen={dialogStates.setIsCreateDialogOpen}
          isAdmin={isAdmin}
        />
        
        <div className={`flex ${isMobile ? 'flex-col' : 'flex-wrap'} justify-between items-start gap-4 mb-6`}>
          <UserProfileIndicator 
            selectedDepartment={selectedDepartment}
            departmentName={departmentName}
          />
          
          <DateFilter
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
            dateRangeType={dateRangeType}
            onDateRangeTypeChange={setDateRangeType}
            className="w-full sm:w-auto"
          />
        </div>

        {isLoading ? (
          <div className="text-center py-8 mobile-text">Carregando métricas...</div>
        ) : metrics.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground mobile-card">
            <p className="mobile-text">Nenhuma métrica encontrada. Crie uma nova métrica para começar.</p>
          </div>
        ) : (
          <MetricsTable 
            metrics={metrics}
            onAddValue={handleMetricActions.handleAddValueClick}
            onEdit={handleMetricActions.handleEditClick}
            onDelete={handleMetricActions.handleDeleteClick}
          />
        )}
      </div>

      <MetricsDialogs 
        departments={departments}
        selectedMetric={selectedMetric}
        isCreateDialogOpen={dialogStates.isCreateDialogOpen}
        isEditDialogOpen={dialogStates.isEditDialogOpen}
        isValueDialogOpen={dialogStates.isValueDialogOpen}
        isDeleteDialogOpen={dialogStates.isDeleteDialogOpen}
        onCreateSuccess={handleDialogActions.handleMetricSuccess}
        onEditSuccess={handleDialogActions.handleMetricSuccess}
        onValueSuccess={handleDialogActions.handleValueSuccess}
        onDeleteConfirm={handleDialogActions.handleDeleteConfirm}
        setIsCreateDialogOpen={dialogStates.setIsCreateDialogOpen}
        setIsEditDialogOpen={dialogStates.setIsEditDialogOpen}
        setIsValueDialogOpen={dialogStates.setIsValueDialogOpen}
        setIsDeleteDialogOpen={dialogStates.setIsDeleteDialogOpen}
      />
    </div>
  );
};

export default MetricsPage;
