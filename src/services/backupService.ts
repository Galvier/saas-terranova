
import { supabase } from '@/integrations/supabase/client';

export interface BackupData {
  metadata: {
    created_at: string;
    version: string;
    tables_count: number;
    total_records: number;
  };
  data: {
    [tableName: string]: any[];
  };
}

export interface BackupHistoryItem {
  id: string;
  filename: string;
  file_size: number;
  tables_count: number;
  total_records: number;
  status: string;
  created_at: string;
}

// List of tables to backup (excluding system tables)
const TABLES_TO_BACKUP = [
  'departments',
  'managers', 
  'metrics_definition',
  'metrics_values',
  'user_settings',
  'logs',
  'admin_dashboard_config'
];

export const generateBackup = async (): Promise<{ 
  success: boolean; 
  data?: BackupData; 
  filename?: string; 
  error?: string 
}> => {
  try {
    const backupData: BackupData = {
      metadata: {
        created_at: new Date().toISOString(),
        version: '1.0',
        tables_count: 0,
        total_records: 0
      },
      data: {}
    };

    let totalRecords = 0;
    let tablesCount = 0;

    // Export data from each table
    for (const tableName of TABLES_TO_BACKUP) {
      try {
        const { data, error } = await supabase
          .from(tableName)
          .select('*');

        if (error) {
          console.warn(`Warning: Could not backup table ${tableName}:`, error);
          continue;
        }

        if (data && data.length > 0) {
          backupData.data[tableName] = data;
          totalRecords += data.length;
          tablesCount++;
        }
      } catch (tableError) {
        console.warn(`Warning: Error backing up table ${tableName}:`, tableError);
      }
    }

    // Update metadata
    backupData.metadata.tables_count = tablesCount;
    backupData.metadata.total_records = totalRecords;

    // Generate filename with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const filename = `backup-${timestamp}.json`;

    return {
      success: true,
      data: backupData,
      filename
    };

  } catch (error) {
    console.error('Error generating backup:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};

export const downloadBackup = (data: BackupData, filename: string): number => {
  try {
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up the object URL
    setTimeout(() => URL.revokeObjectURL(url), 100);
    
    return blob.size;
  } catch (error) {
    console.error('Error downloading backup:', error);
    throw error;
  }
};

export const saveBackupHistory = async (
  filename: string, 
  fileSize: number, 
  tablesCount: number, 
  totalRecords: number
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('backup_history')
      .insert({
        filename,
        file_size: fileSize,
        tables_count: tablesCount,
        total_records: totalRecords,
        status: 'completed'
      });

    if (error) {
      console.error('Error saving backup history:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error saving backup history:', error);
    return false;
  }
};

export const getBackupHistory = async (): Promise<BackupHistoryItem[]> => {
  try {
    const { data, error } = await supabase
      .from('backup_history')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) {
      console.error('Error fetching backup history:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching backup history:', error);
    return [];
  }
};
