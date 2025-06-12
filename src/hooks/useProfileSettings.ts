
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

      console.log('[useProfileSettings] Salvando dados do perfil:', profileData);

      // Update user metadata with all profile data including avatar
      const updateData: any = {
        full_name: profileData.fullName,
        display_name: profileData.displayName,
        name: profileData.displayName // Keep name for backward compatibility
      };

      // Include avatar URL if provided
      if (profileData.avatarUrl) {
        updateData.avatar_url = profileData.avatarUrl;
        console.log('[useProfileSettings] Incluindo avatar URL:', profileData.avatarUrl);
      }

      console.log('[useProfileSettings] Atualizando metadados do usuário:', updateData);

      const { error: authError } = await supabase.auth.updateUser({
        data: updateData
      });

      if (authError) {
        console.error('[useProfileSettings] Erro ao atualizar auth:', authError);
        throw authError;
      }

      console.log('[useProfileSettings] Metadados do usuário atualizados com sucesso');

      // Update manager record if exists
      const { data: managerData, error: managerSelectError } = await supabase
        .from('managers')
        .select('id')
        .eq('user_id', user.id)
        .single();

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
          console.warn('[useProfileSettings] Erro ao atualizar manager:', managerError);
        } else {
          console.log('[useProfileSettings] Manager atualizado com sucesso');
        }
      } else {
        console.log('[useProfileSettings] Usuário não é um manager ou erro ao buscar:', managerSelectError);
      }

      // Refresh user data to get updated metadata
      console.log('[useProfileSettings] Refreshing user data...');
      await refreshUser();

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
