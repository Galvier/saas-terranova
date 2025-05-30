
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface Database {
  public: {
    Tables: {
      backup_settings: {
        Row: {
          id: string
          user_id: string
          auto_backup_enabled: boolean
          backup_frequency: string
          last_auto_backup: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          auto_backup_enabled?: boolean
          backup_frequency?: string
          last_auto_backup?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          auto_backup_enabled?: boolean
          backup_frequency?: string
          last_auto_backup?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient<Database>(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    )

    console.log('Auto-backup function started at:', new Date().toISOString());

    // Get users with auto backup enabled who need backup
    const { data: usersNeedingBackup, error: fetchError } = await supabaseClient
      .from('backup_settings')
      .select('user_id, last_auto_backup')
      .eq('auto_backup_enabled', true)
      .or(`last_auto_backup.is.null,last_auto_backup.lt.${new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()}`);

    if (fetchError) {
      console.error('Error fetching users needing backup:', fetchError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch users needing backup' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log(`Found ${usersNeedingBackup?.length || 0} users needing backup`);

    const backupResults = [];

    // Process each user
    for (const user of usersNeedingBackup || []) {
      try {
        console.log(`Processing backup for user: ${user.user_id}`);

        // Lista de tabelas para backup
        const TABLES_TO_BACKUP = [
          'departments',
          'managers', 
          'metrics_definition',
          'metrics_values',
          'user_settings',
          'logs',
          'admin_dashboard_config'
        ];

        const backupData = {
          metadata: {
            created_at: new Date().toISOString(),
            version: '1.0',
            tables_count: 0,
            total_records: 0,
            user_id: user.user_id,
            type: 'auto_backup'
          },
          data: {} as Record<string, any[]>
        };

        let totalRecords = 0;
        let tablesCount = 0;

        // Export data from each table
        for (const tableName of TABLES_TO_BACKUP) {
          try {
            const { data, error } = await supabaseClient
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

        // Generate filename
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
        const filename = `auto-backup-${timestamp}.json`;

        // Calculate file size
        const jsonString = JSON.stringify(backupData, null, 2);
        const fileSize = new Blob([jsonString]).size;

        // Save backup history
        const { error: historyError } = await supabaseClient
          .from('backup_history')
          .insert({
            filename,
            file_size: fileSize,
            tables_count: tablesCount,
            total_records: totalRecords,
            status: 'completed',
            user_id: user.user_id
          });

        if (historyError) {
          console.error('Error saving backup history:', historyError);
        }

        // Update last backup timestamp
        const { error: updateError } = await supabaseClient
          .from('backup_settings')
          .update({ 
            last_auto_backup: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('user_id', user.user_id);

        if (updateError) {
          console.error('Error updating backup timestamp:', updateError);
        }

        backupResults.push({
          user_id: user.user_id,
          success: true,
          filename,
          tables_count: tablesCount,
          total_records: totalRecords,
          file_size: fileSize
        });

        console.log(`Backup completed for user ${user.user_id}: ${filename}`);

      } catch (userError) {
        console.error(`Error processing backup for user ${user.user_id}:`, userError);
        backupResults.push({
          user_id: user.user_id,
          success: false,
          error: userError instanceof Error ? userError.message : 'Unknown error'
        });
      }
    }

    const successCount = backupResults.filter(r => r.success).length;
    const errorCount = backupResults.filter(r => !r.success).length;

    console.log(`Auto-backup completed. Success: ${successCount}, Errors: ${errorCount}`);

    return new Response(
      JSON.stringify({
        success: true,
        processed_users: backupResults.length,
        successful_backups: successCount,
        failed_backups: errorCount,
        results: backupResults,
        timestamp: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )

  } catch (error) {
    console.error('Auto-backup function error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Auto-backup function failed', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
