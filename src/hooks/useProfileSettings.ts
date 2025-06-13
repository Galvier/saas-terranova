
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

      // 1. Fazer múltiplas tentativas de atualização para garantir persistência
      let updateSuccess = false;
      let attempts = 0;
      const maxUpdateAttempts = 3;

      while (!updateSuccess && attempts < maxUpdateAttempts) {
        attempts++;
        console.log('[useProfileSettings] Tentativa de atualização:', attempts);

        const { data: authData, error: authError } = await supabase.auth.updateUser({
          data: updateData
        });

        if (authError) {
          console.error('[useProfileSettings] ERRO na tentativa', attempts, ':', authError);
          if (attempts === maxUpdateAttempts) {
            throw authError;
          }
          await new Promise(resolve => setTimeout(resolve, 1000)); // Aguardar 1s antes da próxima tentativa
          continue;
        }

        console.log('[useProfileSettings] Tentativa', attempts, 'bem-sucedida:', authData?.user?.user_metadata);

        // 2. Verificar imediatamente se os dados foram persistidos
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const { data: { user: verifyUser }, error: verifyError } = await supabase.auth.getUser();
        
        if (!verifyError && verifyUser?.user_metadata) {
          const metadata = verifyUser.user_metadata;
          
          // Verificar se os dados críticos foram salvos
          const displayNameOk = metadata.display_name === profileData.displayName;
          const fullNameOk = metadata.full_name === fullName || (fullName === '' && !metadata.full_name);
          const avatarOk = !profileData.avatarUrl || metadata.avatar_url === profileData.avatarUrl;
          
          console.log('[useProfileSettings] Verificação na tentativa', attempts, ':', {
            displayNameOk,
            fullNameOk, 
            avatarOk,
            metadata
          });
          
          if (displayNameOk && fullNameOk && avatarOk) {
            updateSuccess = true;
            console.log('[useProfileSettings] Dados verificados com sucesso na tentativa', attempts);
          } else {
            console.warn('[useProfileSettings] Dados não verificados na tentativa', attempts);
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }
      }

      if (!updateSuccess) {
        console.error('[useProfileSettings] Falha após', maxUpdateAttempts, 'tentativas de atualização');
        throw new Error('Não foi possível salvar os dados após múltiplas tentativas');
      }

      // 3. Atualizar tabela de managers se existir
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

      // 4. Aguardar e fazer refresh final
      console.log('[useProfileSettings] Aguardando antes do refresh final...');
      await new Promise(resolve => setTimeout(resolve, 1500));

      console.log('[useProfileSettings] Fazendo refresh final do usuário...');
      await refreshUser();

      // 5. Aguardar mais um pouco para garantir que a UI seja atualizada
      await new Promise(resolve => setTimeout(resolve, 1000));

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
