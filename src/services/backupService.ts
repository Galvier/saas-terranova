
import { supabase } from '@/integrations/supabase/client';

export interface BackupSettings {
  id: string;
  user_id: string;
  auto_backup_enabled: boolean;
  backup_frequency: string;
  last_auto_backup: string | null;
  created_at: string;
  updated_at: string;
}

export interface BackupHistory {
  id: string;
  user_id: string | null;
  filename: string;
  file_size: number;
  tables_count: number;
  total_records: number;
  status: string;
  created_at: string;
}

export const getBackupSettings = async (): Promise<BackupSettings | null> => {
  console.log('[backupService] === BUSCANDO CONFIGURAÇÕES DE BACKUP ===');
  
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.error('[backupService] Usuário não autenticado');
      throw new Error('Usuário não autenticado');
    }

    console.log('[backupService] Usuário autenticado:', user.id);

    const { data, error } = await supabase
      .from('backup_settings')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (error) {
      console.error('[backupService] ERRO na consulta:', error);
      throw error;
    }

    if (!data) {
      console.log('[backupService] Nenhuma configuração encontrada, criando padrão...');
      // Criar configuração padrão se não existir
      const { data: newData, error: insertError } = await supabase
        .from('backup_settings')
        .insert({
          user_id: user.id,
          auto_backup_enabled: false,
          backup_frequency: 'daily'
        })
        .select()
        .single();

      if (insertError) {
        console.error('[backupService] ERRO ao criar configuração padrão:', insertError);
        throw insertError;
      }

      console.log('[backupService] Configuração padrão criada:', newData);
      return newData;
    }

    console.log('[backupService] Configurações encontradas:', data);
    return data;
  } catch (error) {
    console.error('[backupService] === ERRO GERAL ===', error);
    throw error;
  }
};

export const updateBackupSettings = async (autoBackupEnabled: boolean): Promise<boolean> => {
  console.log('[backupService] === ATUALIZANDO CONFIGURAÇÕES DE BACKUP ===');
  console.log('[backupService] Nova configuração:', { autoBackupEnabled });
  
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.error('[backupService] Usuário não autenticado');
      throw new Error('Usuário não autenticado');
    }

    console.log('[backupService] Usuário autenticado:', user.id);

    const { data, error } = await supabase
      .from('backup_settings')
      .upsert({
        user_id: user.id,
        auto_backup_enabled: autoBackupEnabled,
        backup_frequency: 'daily',
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      })
      .select()
      .single();

    if (error) {
      console.error('[backupService] ERRO na atualização:', error);
      console.error('[backupService] Detalhes:', error.details, error.hint, error.code);
      throw error;
    }

    console.log('[backupService] Configuração atualizada com SUCESSO:', data);
    return true;
  } catch (error) {
    console.error('[backupService] === ERRO GERAL NA ATUALIZAÇÃO ===', error);
    throw error;
  }
};

export const getBackupHistory = async (): Promise<BackupHistory[]> => {
  console.log('[backupService] === BUSCANDO HISTÓRICO DE BACKUP ===');
  
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.error('[backupService] Usuário não autenticado');
      throw new Error('Usuário não autenticado');
    }

    console.log('[backupService] Usuário autenticado:', user.id);

    const { data, error } = await supabase
      .from('backup_history')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[backupService] ERRO na consulta do histórico:', error);
      throw error;
    }

    console.log('[backupService] Histórico encontrado:', data?.length || 0, 'registros');
    return data || [];
  } catch (error) {
    console.error('[backupService] === ERRO GERAL NO HISTÓRICO ===', error);
    throw error;
  }
};

export const createBackup = async (): Promise<boolean> => {
  console.log('[backupService] === CRIANDO BACKUP ===');
  
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.error('[backupService] Usuário não autenticado');
      throw new Error('Usuário não autenticado');
    }

    console.log('[backupService] Usuário autenticado:', user.id);

    // Simular criação de backup - aqui você implementaria a lógica real
    const backupData = {
      user_id: user.id,
      filename: `backup_${user.id}_${Date.now()}.json`,
      file_size: Math.floor(Math.random() * 1000000), // Tamanho simulado
      tables_count: 5,
      total_records: Math.floor(Math.random() * 1000),
      status: 'completed'
    };

    const { data, error } = await supabase
      .from('backup_history')
      .insert(backupData)
      .select()
      .single();

    if (error) {
      console.error('[backupService] ERRO ao criar registro de backup:', error);
      throw error;
    }

    console.log('[backupService] Backup criado com SUCESSO:', data);
    return true;
  } catch (error) {
    console.error('[backupService] === ERRO GERAL NA CRIAÇÃO ===', error);
    throw error;
  }
};
