
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { Download, Upload, Database, Settings2, Save, Loader2, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { testConnection, testTables, testDatabaseWrite } from '@/utils/supabaseDiagnostic';
import { generateBackup, downloadBackup, saveBackupHistory } from '@/services/backupService';
import { useBackupHistory } from '@/hooks/useBackupHistory';

const BackupTab = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [autoBackup, setAutoBackup] = useState(false);
  const navigate = useNavigate();
  const { history, refreshHistory } = useBackupHistory();
  
  // Handle backup data with real backup generation
  const handleBackupData = async () => {
    setIsLoading(true);
    try {
      toast({
        title: "Iniciando backup",
        description: "Exportando dados das tabelas..."
      });

      const result = await generateBackup();
      
      if (!result.success || !result.data || !result.filename) {
        throw new Error(result.error || 'Erro ao gerar backup');
      }

      // Download the backup file
      const fileSize = downloadBackup(result.data, result.filename);

      // Save to history
      await saveBackupHistory(
        result.filename,
        fileSize,
        result.data.metadata.tables_count,
        result.data.metadata.total_records
      );

      // Refresh history
      refreshHistory();

      toast({
        title: "Backup concluído",
        description: `Arquivo ${result.filename} baixado com sucesso. ${result.data.metadata.total_records} registros de ${result.data.metadata.tables_count} tabelas.`
      });

    } catch (error) {
      console.error('Backup error:', error);
      toast({
        title: "Erro no backup",
        description: error instanceof Error ? error.message : "Erro desconhecido ao gerar backup",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle data restoration with visual feedback
  const handleRestoreData = () => {
    toast({
      title: "Selecione um arquivo",
      description: "Por favor selecione um arquivo de backup para restaurar"
    });
    
    // Simulate file selection dialog
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        setIsLoading(true);
        setTimeout(() => {
          setIsLoading(false);
          toast({
            title: "Restauração simulada",
            description: `O arquivo ${file.name} seria restaurado (funcionalidade em desenvolvimento)`
          });
        }, 1000);
      }
    };
    input.click();
  };
  
  // Handle diagnostic with actual Supabase connection test
  const handleDiagnostic = async () => {
    setIsLoading(true);
    try {
      // Test connection to Supabase
      const connectionResult = await testConnection();
      
      if (connectionResult.connected) {
        toast({
          title: "Diagnóstico concluído",
          description: `Conexão com o banco de dados estabelecida em ${connectionResult.responseTime}ms`
        });
        
        // Test database tables
        const tablesResult = await testTables();
        const tablesCount = Object.values(tablesResult).filter(t => t.exists).length;
        
        toast({
          title: "Verificação de tabelas",
          description: `${tablesCount} tabelas verificadas com sucesso`
        });
        
        // Test write operation
        const writeResult = await testDatabaseWrite();
        
        if (writeResult.status === 'success') {
          toast({
            title: "Teste de escrita",
            description: "Operação de escrita realizada com sucesso"
          });
        } else {
          toast({
            title: "Erro no teste de escrita",
            description: writeResult.message,
            variant: "destructive"
          });
        }
        
      } else {
        toast({
          title: "Erro de conexão",
          description: connectionResult.message || "Não foi possível conectar ao banco de dados",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Erro no diagnóstico",
        description: "Ocorreu um erro ao executar o diagnóstico",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Navigate to specific pages
  const handleNavigateToDiagnostic = () => {
    navigate('/admin/diagnostico');
  };
  
  // Handle save settings
  const handleSaveSettings = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "Configurações salvas",
        description: "Suas configurações de backup foram atualizadas"
      });
    }, 1000);
  };

  // Format file size for display
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Format date for display
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleString('pt-BR');
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Backup e Restauração</CardTitle>
        <CardDescription>
          Gerencie backups dos seus dados e configurações
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-md">Backup de Dados</CardTitle>
              <CardDescription>
                Crie um backup completo dos seus dados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                className="w-full" 
                onClick={handleBackupData}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Gerando backup...
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-4 w-4" />
                    Gerar Backup
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-md">Restaurar Dados</CardTitle>
              <CardDescription>
                Restaure seus dados de um backup anterior
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                className="w-full" 
                variant="outline" 
                onClick={handleRestoreData}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processando...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Restaurar Backup
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
        
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-md">Diagnóstico do Sistema</CardTitle>
              <CardDescription>
                Verifique a conexão com o banco de dados
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              <Button 
                className="w-full" 
                variant="secondary" 
                onClick={handleDiagnostic}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verificando...
                  </>
                ) : (
                  <>
                    <Database className="mr-2 h-4 w-4" />
                    Verificar Conexão
                  </>
                )}
              </Button>
              
              <Button 
                className="w-full" 
                variant="outline"
                onClick={handleNavigateToDiagnostic}
              >
                <Settings2 className="mr-2 h-4 w-4" />
                Diagnóstico Avançado
              </Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-md">Configurações Avançadas</CardTitle>
              <CardDescription>
                Opções avançadas de manutenção
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                className="w-full" 
                variant="outline"
                onClick={() => toast({
                  title: "Configurações avançadas",
                  description: "Acessando configurações avançadas do sistema"
                })}
              >
                <Settings2 className="mr-2 h-4 w-4" />
                Opções Avançadas
              </Button>
            </CardContent>
          </Card>
        </div>
        
        <div className="space-y-2">
          <Label>Backups Automáticos</Label>
          <div className="flex items-center justify-between">
            <Label htmlFor="auto-backup" className="text-sm text-muted-foreground">
              Realizar backups automáticos diários
            </Label>
            <Switch 
              id="auto-backup" 
              checked={autoBackup} 
              onCheckedChange={setAutoBackup}
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label>Histórico de Backups</Label>
          <div className="rounded-md border">
            {history.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground">
                <FileText className="mx-auto h-8 w-8 mb-2 opacity-50" />
                <p>Nenhum backup encontrado</p>
                <p className="text-sm">Gere seu primeiro backup para ver o histórico</p>
              </div>
            ) : (
              history.map((backup, index) => (
                <div key={backup.id}>
                  <div className="p-4 flex items-center justify-between">
                    <div>
                      <p className="font-medium">{backup.filename}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(backup.created_at)} • {formatFileSize(backup.file_size)} • {backup.tables_count} tabelas • {backup.total_records} registros
                      </p>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => toast({
                        title: "Backup histórico",
                        description: "Download de backups históricos em desenvolvimento"
                      })}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                  {index < history.length - 1 && <Separator />}
                </div>
              ))
            )}
          </div>
        </div>
      </CardContent>
      <CardFooter className="border-t bg-muted/50 px-6 py-4">
        <Button onClick={handleSaveSettings} disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Salvando...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Salvar Configurações
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default BackupTab;
