
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
      }

      console.log('[useProfileSettings] Dados COMPLETOS para atualização:', updateData);

      // 1. Atualizar metadados do usuário no auth.users
      console.log('[useProfileSettings] Atualizando auth.users...');
      const { data: authData, error: authError } = await supabase.auth.updateUser({
        data: updateData
      });

      if (authError) {
        console.error('[useProfileSettings] ERRO ao atualizar auth.users:', authError);
        throw authError;
      }

      console.log('[useProfileSettings] Auth.users atualizado com sucesso:', authData?.user?.user_metadata);

      // 2. Verificar se os dados foram realmente salvos com retry
      console.log('[useProfileSettings] Verificando persistência...');
      let verificationAttempts = 0;
      const maxAttempts = 3;
      let dataVerified = false;

      while (!dataVerified && verificationAttempts < maxAttempts) {
        verificationAttempts++;
        console.log('[useProfileSettings] Tentativa de verificação:', verificationAttempts);
        
        // Pequena pausa antes da verificação
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const { data: { user: updatedUser }, error: getUserError } = await supabase.auth.getUser();
        
        if (!getUserError && updatedUser) {
          console.log('[useProfileSettings] Metadados após atualização:', updatedUser.user_metadata);
          
          // Verificar se os dados principais foram salvos
          const savedCorrectly = 
            updatedUser.user_metadata?.display_name === profileData.displayName &&
            (updatedUser.user_metadata?.full_name === fullName || 
             (fullName === '' && updatedUser.user_metadata?.full_name === undefined)) &&
            (!profileData.avatarUrl || updatedUser.user_metadata?.avatar_url === profileData.avatarUrl);
            
          if (savedCorrectly) {
            console.log('[useProfileSettings] Dados verificados com sucesso');
            dataVerified = true;
          } else {
            console.warn('[useProfileSettings] AVISO: Dados não verificados na tentativa', verificationAttempts);
            console.warn('[useProfileSettings] Esperado:', { 
              display_name: profileData.displayName, 
              full_name: fullName,
              avatar_url: profileData.avatarUrl 
            });
            console.warn('[useProfileSettings] Encontrado:', {
              display_name: updatedUser.user_metadata?.display_name,
              full_name: updatedUser.user_metadata?.full_name,
              avatar_url: updatedUser.user_metadata?.avatar_url
            });
          }
        }
      }

      if (!dataVerified) {
        console.warn('[useProfileSettings] AVISO: Não foi possível verificar se os dados foram salvos após', maxAttempts, 'tentativas');
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

      // 4. Aguardar e fazer refresh dos dados
      console.log('[useProfileSettings] Aguardando antes do refresh...');
      await new Promise(resolve => setTimeout(resolve, 1000));

      console.log('[useProfileSettings] Fazendo refresh do usuário...');
      await refreshUser();

      // 5. Aguardar mais um pouco para garantir que a UI seja atualizada
      await new Promise(resolve => setTimeout(resolve, 800));

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
