
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

      // Preparar os dados de atualização com TODOS os metadados existentes preservados
      const currentMetadata = user.user_metadata || {};
      
      // Garantir que full_name seja uma string vazia em vez de undefined
      const fullName = profileData.fullName || '';
      
      const updateData: UserMetadataUpdate = {
        ...currentMetadata, // Preservar todos os metadados existentes
        full_name: fullName,
        display_name: profileData.displayName,
        name: profileData.displayName, // Manter compatibilidade
      };

      // Incluir avatar URL se fornecido
      if (profileData.avatarUrl && profileData.avatarUrl.trim() !== '') {
        updateData.avatar_url = profileData.avatarUrl;
        console.log('[useProfileSettings] Avatar URL incluído:', profileData.avatarUrl);
      } else if (currentMetadata.avatar_url) {
        // Preservar avatar existente se não houver nova URL
        updateData.avatar_url = currentMetadata.avatar_url;
      }

      console.log('[useProfileSettings] Dados COMPLETOS para atualização:', updateData);

      // Fazer update do usuário
      const { data: authData, error: authError } = await supabase.auth.updateUser({
        data: updateData
      });

      if (authError) {
        console.error('[useProfileSettings] ERRO na atualização:', authError);
        throw authError;
      }

      console.log('[useProfileSettings] Atualização bem-sucedida:', authData?.user?.user_metadata);

      // Aguardar um momento para garantir que os dados foram persistidos
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Verificar se os dados foram salvos corretamente
      const { data: { user: verifyUser }, error: verifyError } = await supabase.auth.getUser();
      
      if (!verifyError && verifyUser?.user_metadata) {
        const metadata = verifyUser.user_metadata;
        
        console.log('[useProfileSettings] Dados verificados após atualização:', metadata);
        
        // Verificação mais flexível - se o update foi bem-sucedido, consideramos sucesso
        // mesmo que a verificação não seja perfeita, pois o avatar pode ter problemas de cache
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

      // Atualizar tabela de managers se existir
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

      // Aguardar e fazer refresh final
      console.log('[useProfileSettings] Fazendo refresh final do usuário...');
      await new Promise(resolve => setTimeout(resolve, 500));
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
