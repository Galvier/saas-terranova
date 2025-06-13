
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from './use-toast';

export const useAvatarUpload = () => {
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const uploadAvatar = async (file: File, userId: string): Promise<string | null> => {
    try {
      setIsUploading(true);
      
      console.log('[useAvatarUpload] === INICIANDO UPLOAD ===');
      console.log('[useAvatarUpload] Arquivo:', {
        name: file.name,
        size: file.size,
        type: file.type
      });
      console.log('[useAvatarUpload] User ID:', userId);
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Erro",
          description: "Por favor, selecione um arquivo de imagem",
          variant: "destructive"
        });
        return null;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Erro", 
          description: "A imagem deve ter no máximo 5MB",
          variant: "destructive"
        });
        return null;
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/avatar-${Date.now()}.${fileExt}`;

      console.log('[useAvatarUpload] Nome do arquivo gerado:', fileName);

      // Delete existing avatars for this user (clean up)
      console.log('[useAvatarUpload] Limpando avatars antigos...');
      const { data: existingFiles } = await supabase.storage
        .from('avatars')
        .list(userId);

      if (existingFiles && existingFiles.length > 0) {
        const filesToDelete = existingFiles.map(f => `${userId}/${f.name}`);
        const { error: deleteError } = await supabase.storage
          .from('avatars')
          .remove(filesToDelete);
        
        if (deleteError) {
          console.log('[useAvatarUpload] Aviso ao deletar arquivos antigos:', deleteError);
        } else {
          console.log('[useAvatarUpload] Arquivos antigos removidos:', filesToDelete);
        }
      }

      // Upload new avatar
      console.log('[useAvatarUpload] Fazendo upload...');
      const { error: uploadError, data: uploadData } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) {
        console.error('[useAvatarUpload] Erro no upload:', uploadError);
        throw uploadError;
      }

      console.log('[useAvatarUpload] Upload bem-sucedido:', uploadData);

      // Get public URL
      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      const publicUrl = data.publicUrl;
      console.log('[useAvatarUpload] URL pública gerada:', publicUrl);

      // Verify the URL is accessible
      try {
        const response = await fetch(publicUrl, { method: 'HEAD' });
        if (!response.ok) {
          console.warn('[useAvatarUpload] Aviso: URL pode não estar acessível ainda');
        } else {
          console.log('[useAvatarUpload] URL verificada e acessível');
        }
      } catch (e) {
        console.warn('[useAvatarUpload] Não foi possível verificar a URL:', e);
      }

      console.log('[useAvatarUpload] === UPLOAD CONCLUÍDO ===');

      toast({
        title: "Sucesso",
        description: "Imagem carregada. Salve o perfil para confirmar as alterações"
      });

      return publicUrl;
    } catch (error: any) {
      console.error('[useAvatarUpload] === ERRO NO UPLOAD ===');
      console.error('[useAvatarUpload] Erro detalhado:', error);
      
      toast({
        title: "Erro",
        description: error.message || "Erro ao fazer upload da foto",
        variant: "destructive"
      });
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  return { uploadAvatar, isUploading };
};
