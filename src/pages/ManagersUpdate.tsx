
import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import { useManagerData } from '@/hooks/useManagerData';
import { ManagerInfoForm, type ManagerUpdateValues } from '@/components/managers/ManagerInfoForm';
import { useToast } from '@/hooks/use-toast';

const ManagersUpdate = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const {
    isLoading,
    isSaving,
    manager,
    departments,
    fetchManager,
    fetchDepartments,
    handleUpdateManager
  } = useManagerData(id || '');

  useEffect(() => {
    if (id) {
      fetchManager(id);
    } else {
      toast({
        title: "Erro",
        description: "ID do gerente não fornecido",
        variant: "destructive"
      });
      navigate('/managers');
    }
  }, [id]);

  useEffect(() => {
    fetchDepartments();
  }, []);

  const handleSubmit = async (values: ManagerUpdateValues) => {
    console.log("Submitting manager update:", values);
    
    const success = await handleUpdateManager({
      name: values.name,
      email: values.email,
      department_id: values.department_id,
      is_active: values.is_active,
      role: values.role
    });
    
    if (success) {
      toast({
        title: "Sucesso",
        description: "Gerente atualizado com sucesso"
      });
      navigate('/managers');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader
        title="Editar Gerente"
        subtitle="Atualize as informações do gerente"
      />
      
      <ManagerInfoForm
        manager={manager}
        departments={departments}
        isSaving={isSaving}
        onSubmit={handleSubmit}
        onCancel={() => navigate('/managers')}
      />
    </div>
  );
};

export default ManagersUpdate;
