
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from './use-toast';

export const useAvatarUpload = () => {
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const uploadAvatar = async (file: File, userId: string): Promise<string | null> => {
    try {
      setIsUploading(true);
      
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
      const fileName = `${userId}/avatar.${fileExt}`;

      console.log('[useAvatarUpload] Fazendo upload:', fileName);

      // Delete existing avatar if it exists
      const { error: deleteError } = await supabase.storage
        .from('avatars')
        .remove([fileName]);
      
      if (deleteError) {
        console.log('[useAvatarUpload] Erro ao deletar arquivo existente (normal se não existir):', deleteError);
      }

      // Upload new avatar
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

      toast({
        title: "Sucesso",
        description: "Imagem carregada. Clique em 'Salvar Perfil' para confirmar as alterações"
      });

      return publicUrl;
    } catch (error: any) {
      console.error('[useAvatarUpload] Erro no upload:', error);
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
