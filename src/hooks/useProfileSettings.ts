
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from './use-toast';
import { useAuth } from './useAuth';

interface ProfileData {
  fullName: string;
  displayName: string;
  email: string;
  avatarUrl?: string;
}

export const useProfileSettings = () => {
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  const { user, refreshUser } = useAuth();

  const saveProfile = async (profileData: ProfileData): Promise<boolean> => {
    try {
      setIsSaving(true);

      if (!user) {
        throw new Error('Usuário não encontrado');
      }

      console.log('[useProfileSettings] Iniciando salvamento do perfil:', profileData);

      // Primeiro, atualizar os metadados do usuário com TODOS os dados
      const updateData: any = {
        full_name: profileData.fullName,
        display_name: profileData.displayName,
        name: profileData.displayName // Manter compatibilidade
      };

      // Incluir avatar URL se fornecido
      if (profileData.avatarUrl) {
        updateData.avatar_url = profileData.avatarUrl;
        console.log('[useProfileSettings] Incluindo avatar URL nos metadados:', profileData.avatarUrl);
      }

      console.log('[useProfileSettings] Dados completos para atualização:', updateData);

      // Atualizar metadados do usuário
      const { error: authError } = await supabase.auth.updateUser({
        data: updateData
      });

      if (authError) {
        console.error('[useProfileSettings] Erro ao atualizar metadados:', authError);
        throw authError;
      }

      console.log('[useProfileSettings] Metadados atualizados com sucesso');

      // Atualizar tabela de managers se existir
      const { data: managerData, error: managerSelectError } = await supabase
        .from('managers')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!managerSelectError && managerData) {
        console.log('[useProfileSettings] Atualizando registro do manager');
        const { error: managerError } = await supabase
          .from('managers')
          .update({
            name: profileData.displayName,
            email: profileData.email
          })
          .eq('user_id', user.id);

        if (managerError) {
          console.warn('[useProfileSettings] Aviso ao atualizar manager:', managerError);
        } else {
          console.log('[useProfileSettings] Manager atualizado com sucesso');
        }
      }

      // Aguardar um pouco antes de fazer refresh para garantir que os dados foram persistidos
      await new Promise(resolve => setTimeout(resolve, 500));

      // Fazer refresh dos dados do usuário
      console.log('[useProfileSettings] Fazendo refresh dos dados do usuário...');
      await refreshUser();

      // Aguardar mais um pouco para garantir que a UI seja atualizada
      await new Promise(resolve => setTimeout(resolve, 300));

      toast({
        title: "Sucesso",
        description: "Perfil atualizado com sucesso"
      });

      return true;
    } catch (error: any) {
      console.error('[useProfileSettings] Erro ao salvar perfil:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao salvar perfil",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  return { saveProfile, isSaving };
};
