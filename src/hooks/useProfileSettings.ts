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
      console.log('[useProfileSettings] Metadados atuais do usuário:', user.user_metadata);

      const currentMetadata = user.user_metadata || {};
      const fullName = profileData.fullName || '';
      const updateData: UserMetadataUpdate = {
        ...currentMetadata,
        full_name: fullName,
        display_name: profileData.displayName,
        name: profileData.displayName,
      };

      if (profileData.avatarUrl && profileData.avatarUrl.trim() !== '') {
        updateData.avatar_url = profileData.avatarUrl;
      } else if (currentMetadata.avatar_url) {
        updateData.avatar_url = currentMetadata.avatar_url;
      }

      console.log('[useProfileSettings] Dados COMPLETOS para atualização:', updateData);

      const { data: authData, error: authError } = await supabase.auth.updateUser({
        data: updateData
      });

      if (authError) throw authError;

      await new Promise(resolve => setTimeout(resolve, 2000));

      const { data: { user: verifyUser }, error: verifyError } = await supabase.auth.getUser();
      
      if (!verifyError && verifyUser?.user_metadata) {
        const metadata = verifyUser.user_metadata;
        
        console.log('[useProfileSettings] Dados verificados após atualização:', metadata);
        
        const displayNameOk = metadata.display_name === profileData.displayName;
        const fullNameOk = metadata.full_name === fullName || (fullName === '' && !metadata.full_name);
        
        console.log('[useProfileSettings] Verificação:', {
          displayNameOk,
          fullNameOk,
          avatarPresent: !!metadata.avatar_url,
          expectedAvatar: profileData.avatarUrl,
          actualAvatar: metadata.avatar_url
        });
        
        if (displayNameOk && fullNameOk && authData) {
          console.log('[useProfileSettings] Dados verificados com sucesso');
        } else {
          console.warn('[useProfileSettings] Verificação parcial, mas update foi bem-sucedido');
        }
      }

      console.log('[useProfileSettings] Verificando tabela managers...');
      const { data: managerData, error: managerSelectError } = await supabase
        .from('managers')
        .select('id, name, email')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!managerSelectError && managerData) {
        console.log('[useProfileSettings] Manager encontrado, atualizando...', managerData);
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
      } else {
        console.log('[useProfileSettings] Nenhum manager encontrado para este usuário');
      }

      await new Promise(resolve => setTimeout(resolve, 1500));

      await refreshUser();

      console.log('[useProfileSettings] === SALVAMENTO CONCLUÍDO COM SUCESSO ===');

      toast({
        title: "Sucesso",
        description: "Perfil atualizado com sucesso"
      });

      return true;
    } catch (error: any) {
      console.error('[useProfileSettings] === ERRO NO SALVAMENTO ===');
      console.error('[useProfileSettings] Erro detalhado:', error);
      console.error('[useProfileSettings] Stack trace:', error.stack);
      
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
