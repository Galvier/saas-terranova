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

interface UserMetadataUpdate {
  full_name: string;
  display_name: string;
  name: string;
  avatar_url?: string;
  [key: string]: any;
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

      console.log('[useProfileSettings] === INICIANDO SALVAMENTO ===');
      console.log('[useProfileSettings] User ID:', user.id);
      console.log('[useProfileSettings] Dados recebidos:', profileData);

      // Atualiza metadados do usuário do auth
      const updateData: UserMetadataUpdate = {
        ...(user.user_metadata || {}),
        full_name: profileData.fullName,
        display_name: profileData.displayName,
        name: profileData.displayName,
        avatar_url: profileData.avatarUrl,
      };

      const { error: authError } = await supabase.auth.updateUser({
        data: updateData
      });

      if (authError) throw authError;

      // Atualiza registro na tabela 'managers'
      // Busca manager pelo user_id
      const { data: existingManager, error: selectManagerErr } = await supabase
        .from('managers')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (selectManagerErr) {
        // Tenta criar se erro ou não existe ainda
        throw selectManagerErr;
      }

      if (existingManager && existingManager.id) {
        // Atualiza se existe
        const { error: updateError } = await supabase
          .from('managers')
          .update({
            name: profileData.displayName,
            email: profileData.email,
            avatar_url: profileData.avatarUrl
          })
          .eq('id', existingManager.id);

        if (updateError) throw updateError;
      } else {
        // Cria novo registro manager se não existir (situação rara)
        const { error: insertError } = await supabase
          .from('managers')
          .insert({
            name: profileData.displayName,
            email: profileData.email,
            avatar_url: profileData.avatarUrl,
            user_id: user.id,
            is_active: true
          });

        if (insertError) throw insertError;
      }

      // Pequena pausa e refresh do usuário/auth
      await new Promise(resolve => setTimeout(resolve, 1800));
      await refreshUser();

      toast({
        title: "Sucesso",
        description: "Perfil atualizado com sucesso"
      });

      return true;
    } catch (error: any) {
      console.error('[useProfileSettings] === ERRO NO SALVAMENTO ===');
      console.error('[useProfileSettings] Erro detalhado:', error);

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
