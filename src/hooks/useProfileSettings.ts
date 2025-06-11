
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from './use-toast';
import { useAuth } from './useAuth';

interface ProfileData {
  fullName: string;
  displayName: string;
  email: string;
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

      // Update user metadata with both full name and display name
      const { error: authError } = await supabase.auth.updateUser({
        data: {
          full_name: profileData.fullName,
          display_name: profileData.displayName,
          name: profileData.displayName // Keep name for backward compatibility
        }
      });

      if (authError) {
        throw authError;
      }

      // Update manager record if exists
      const { error: managerError } = await supabase
        .from('managers')
        .update({
          name: profileData.displayName,
          email: profileData.email
        })
        .eq('user_id', user.id);

      // Note: We don't throw on manager error as the user might not be a manager
      if (managerError) {
        console.warn('Manager update failed:', managerError);
      }

      // Refresh user data to get updated metadata
      await refreshUser();

      toast({
        title: "Sucesso",
        description: "Perfil atualizado com sucesso"
      });

      return true;
    } catch (error: any) {
      console.error('Error saving profile:', error);
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
