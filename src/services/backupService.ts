
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

export interface BackupData {
  metadata: {
    created_at: string;
    tables_count: number;
    total_records: number;
  };
  data: {
    [tableName: string]: any[];
  };
}

export interface BackupResult {
  success: boolean;
  data?: BackupData;
  filename?: string;
  error?: string;
}

// Tipo para o retorno da função RPC de restauração
interface RestoreBackupResult {
  success: boolean;
  error?: string;
  restored_tables?: string[];
  message?: string;
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

export const generateBackup = async (): Promise<BackupResult> => {
  console.log('[backupService] === GERANDO BACKUP ===');
  
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.error('[backupService] Usuário não autenticado');
      return { success: false, error: 'Usuário não autenticado' };
    }

    console.log('[backupService] Usuário autenticado:', user.id);

    // Obter dados das principais tabelas do usuário
    const backupData: BackupData = {
      metadata: {
        created_at: new Date().toISOString(),
        tables_count: 0,
        total_records: 0
      },
      data: {}
    };

    let totalRecords = 0;

    // Backup das configurações do usuário
    const { data: userSettings } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', user.id);

    if (userSettings) {
      backupData.data.user_settings = userSettings;
      totalRecords += userSettings.length;
    }

    // Backup das configurações de backup
    const { data: backupSettings } = await supabase
      .from('backup_settings')
      .select('*')
      .eq('user_id', user.id);

    if (backupSettings) {
      backupData.data.backup_settings = backupSettings;
      totalRecords += backupSettings.length;
    }

    // Backup de notificações (últimas 100)
    const { data: notifications } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(100);

    if (notifications) {
      backupData.data.notifications = notifications;
      totalRecords += notifications.length;
    }

    backupData.metadata.tables_count = Object.keys(backupData.data).length;
    backupData.metadata.total_records = totalRecords;

    const filename = `backup_${user.id}_${Date.now()}.json`;

    console.log('[backupService] Backup gerado com sucesso:', {
      filename,
      tables: backupData.metadata.tables_count,
      records: backupData.metadata.total_records
    });

    return {
      success: true,
      data: backupData,
      filename
    };
  } catch (error) {
    console.error('[backupService] === ERRO NA GERAÇÃO DO BACKUP ===', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    };
  }
};

export const saveBackupToDatabase = async (
  backupData: BackupData,
  filename: string
): Promise<{ success: boolean; backupId?: string; error?: string }> => {
  console.log('[backupService] === SALVANDO BACKUP NO BANCO ===');
  
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.error('[backupService] Usuário não autenticado');
      return { success: false, error: 'Usuário não autenticado' };
    }

    // Calcular tamanho do arquivo JSON
    const jsonString = JSON.stringify(backupData);
    const fileSize = new Blob([jsonString]).size;

    // Salvar histórico primeiro
    const { data: historyData, error: historyError } = await supabase
      .from('backup_history')
      .insert({
        user_id: user.id,
        filename,
        file_size: fileSize,
        tables_count: backupData.metadata.tables_count,
        total_records: backupData.metadata.total_records,
        status: 'completed'
      })
      .select()
      .single();

    if (historyError) {
      console.error('[backupService] ERRO ao salvar histórico:', historyError);
      return { success: false, error: historyError.message };
    }

    // Salvar dados do backup - usando type assertion para Json
    const { data: backupDataRecord, error: backupError } = await supabase
      .from('backup_data')
      .insert({
        backup_history_id: historyData.id,
        backup_content: backupData as any, // Type assertion para Json
        compressed: false
      })
      .select()
      .single();

    if (backupError) {
      console.error('[backupService] ERRO ao salvar dados do backup:', backupError);
      
      // Limpar histórico se falhou ao salvar os dados
      await supabase
        .from('backup_history')
        .delete()
        .eq('id', historyData.id);
        
      return { success: false, error: backupError.message };
    }

    console.log('[backupService] Backup salvo com SUCESSO no banco');
    return { success: true, backupId: historyData.id };
  } catch (error) {
    console.error('[backupService] === ERRO GERAL AO SALVAR NO BANCO ===', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Erro desconhecido' 
    };
  }
};

export const downloadBackup = (backupData: BackupData, filename: string): number => {
  console.log('[backupService] === FAZENDO DOWNLOAD DO BACKUP ===');
  
  try {
    const jsonString = JSON.stringify(backupData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    const fileSize = blob.size;
    console.log('[backupService] Download realizado com sucesso, tamanho:', fileSize);
    
    return fileSize;
  } catch (error) {
    console.error('[backupService] === ERRO NO DOWNLOAD ===', error);
    return 0;
  }
};

export const restoreBackupFromDatabase = async (
  backupHistoryId: string
): Promise<{ success: boolean; message?: string; error?: string }> => {
  console.log('[backupService] === RESTAURANDO BACKUP DO BANCO ===');
  
  try {
    const { data, error } = await supabase.rpc('restore_backup_data', {
      backup_history_id_param: backupHistoryId
    });

    if (error) {
      console.error('[backupService] ERRO na restauração:', error);
      return { success: false, error: error.message };
    }

    // Type assertion para o resultado da função RPC
    const result = data as RestoreBackupResult;

    if (!result.success) {
      console.error('[backupService] Falha na restauração:', result.error);
      return { success: false, error: result.error };
    }

    console.log('[backupService] Backup restaurado com SUCESSO:', result);
    return { 
      success: true, 
      message: `Backup restaurado com sucesso. Tabelas: ${result.restored_tables?.join(', ')}` 
    };
  } catch (error) {
    console.error('[backupService] === ERRO GERAL NA RESTAURAÇÃO ===', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Erro desconhecido' 
    };
  }
};

// Manter função para compatibilidade, mas agora também salva no banco
export const saveBackupHistory = async (
  filename: string,
  fileSize: number,
  tablesCount: number,
  totalRecords: number
): Promise<boolean> => {
  console.log('[backupService] === SALVANDO HISTÓRICO DE BACKUP (LEGADO) ===');
  
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.error('[backupService] Usuário não autenticado para salvar histórico');
      return false;
    }

    console.log('[backupService] Salvando histórico para usuário:', user.id);

    const { data, error } = await supabase
      .from('backup_history')
      .insert({
        user_id: user.id,
        filename,
        file_size: fileSize,
        tables_count: tablesCount,
        total_records: totalRecords,
        status: 'completed'
      })
      .select()
      .single();

    if (error) {
      console.error('[backupService] ERRO ao salvar histórico:', error);
      return false;
    }

    console.log('[backupService] Histórico salvo com SUCESSO:', data);
    return true;
  } catch (error) {
    console.error('[backupService] === ERRO GERAL NO HISTÓRICO ===', error);
    return false;
  }
};
