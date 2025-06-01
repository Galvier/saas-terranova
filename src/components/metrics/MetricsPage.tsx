
import React from 'react';
import { useMetricsData } from '@/hooks/useMetricsData';
import MetricsHeader from '@/components/metrics/MetricsHeader';
import MetricsTable from '@/components/metrics/MetricsTable';
import MetricsDialogs from '@/components/metrics/MetricsDialogs';
import JustificationsAdminPanel from '@/components/metrics/JustificationsAdminPanel';
import DateFilter from '@/components/filters/DateFilter';
import UserProfileIndicator from '@/components/UserProfileIndicator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';

const MetricsPage = () => {
  const { isAdmin } = useAuth();
  
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
        <MetricsHeader 
          departments={departments}
          selectedDepartment={selectedDepartment}
          setSelectedDepartment={setSelectedDepartment}
          setIsCreateDialogOpen={dialogStates.setIsCreateDialogOpen}
          isAdmin={isAdmin}
        />
        
        <Tabs defaultValue="metrics" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="metrics">Métricas</TabsTrigger>
            <TabsTrigger value="justifications">Justificativas</TabsTrigger>
          </TabsList>
          
          <TabsContent value="metrics">
            <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
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
              <div className="text-center py-8">Carregando métricas...</div>
            ) : metrics.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Nenhuma métrica encontrada. Crie uma nova métrica para começar.
              </div>
            ) : (
              <MetricsTable 
                metrics={metrics}
                onAddValue={handleMetricActions.handleAddValueClick}
                onEdit={handleMetricActions.handleEditClick}
                onDelete={handleMetricActions.handleDeleteClick}
              />
            )}
          </TabsContent>
          
          <TabsContent value="justifications">
            <JustificationsAdminPanel />
          </TabsContent>
        </Tabs>

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
      <MetricsHeader 
        departments={departments}
        selectedDepartment={selectedDepartment}
        setSelectedDepartment={setSelectedDepartment}
        setIsCreateDialogOpen={dialogStates.setIsCreateDialogOpen}
        isAdmin={isAdmin}
      />
      
      <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
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
        <div className="text-center py-8">Carregando métricas...</div>
      ) : metrics.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          Nenhuma métrica encontrada. Crie uma nova métrica para começar.
        </div>
      ) : (
        <MetricsTable 
          metrics={metrics}
          onAddValue={handleMetricActions.handleAddValueClick}
          onEdit={handleMetricActions.handleEditClick}
          onDelete={handleMetricActions.handleDeleteClick}
        />
      )}

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
