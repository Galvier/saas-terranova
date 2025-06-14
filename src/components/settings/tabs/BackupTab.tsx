import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { Download, Upload, Database, Settings2, Save, Loader2, FileText, RotateCcw, AlertTriangle, Trash2, Archive } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { testConnection, testTables, testDatabaseWrite } from '@/utils/supabaseDiagnostic';
import { 
  generateBackup, 
  downloadBackup, 
  saveBackupToDatabase, 
  restoreBackupFromDatabase 
} from '@/services/backupService';
import { useBackupHistory } from '@/hooks/useBackupHistory';
import { useBackupSettings } from '@/hooks/useBackupSettings';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const BackupTab = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [isAdvancedOptionsOpen, setIsAdvancedOptionsOpen] = useState(false);
  const navigate = useNavigate();
  const { history, refreshHistory, isLoading: isHistoryLoading } = useBackupHistory();
  const { settings: backupSettings, updateSettings: updateBackupSettings, isLoading: isSettingsLoading } = useBackupSettings();
  
  // Handle backup data - now saves to database and optionally downloads
  const handleBackupData = async (downloadFile: boolean = false) => {
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

      // Save to database
      const saveResult = await saveBackupToDatabase(result.data, result.filename);
      
      if (!saveResult.success) {
        throw new Error(saveResult.error || 'Erro ao salvar backup no banco');
      }

      let message = `Backup salvo com sucesso no banco de dados. ${result.data.metadata.total_records} registros de ${result.data.metadata.tables_count} tabelas.`;

      // Optional download
      if (downloadFile) {
        downloadBackup(result.data, result.filename);
        message += ` Arquivo ${result.filename} também foi baixado.`;
      }

      // Refresh history
      refreshHistory();

      toast({
        title: "Backup concluído",
        description: message
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

  // Handle restore from database
  const handleRestoreBackup = async (backupId: string, backupFilename: string) => {
    setIsRestoring(true);
    try {
      toast({
        title: "Iniciando restauração",
        description: `Restaurando dados do backup ${backupFilename}...`
      });

      const result = await restoreBackupFromDatabase(backupId);
      
      if (!result.success) {
        throw new Error(result.error || 'Erro ao restaurar backup');
      }

      toast({
        title: "Restauração concluída",
        description: result.message || "Dados restaurados com sucesso. Recarregue a página para ver as alterações.",
      });

      // Suggest page reload to see changes
      setTimeout(() => {
        toast({
          title: "Atualização recomendada",
          description: "Recarregue a página para ver todas as alterações aplicadas.",
          action: (
            <Button 
              onClick={() => window.location.reload()}
              variant="outline"
              size="sm"
            >
              Recarregar
            </Button>
          )
        });
      }, 2000);

    } catch (error) {
      console.error('Restore error:', error);
      toast({
        title: "Erro na restauração",
        description: error instanceof Error ? error.message : "Erro desconhecido ao restaurar backup",
        variant: "destructive"
      });
    } finally {
      setIsRestoring(false);
    }
  };
  
  // Handle data restoration with file upload (legacy)
  const handleRestoreFromFile = () => {
    toast({
      title: "Selecione um arquivo",
      description: "Por favor selecione um arquivo de backup para restaurar"
    });
    
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
            title: "Restauração de arquivo",
            description: `Restauração de arquivos locais será implementada em breve. Use a restauração do histórico para backups salvos no sistema.`
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
      const connectionResult = await testConnection();
      
      if (connectionResult.connected) {
        toast({
          title: "Diagnóstico concluído",
          description: `Conexão com o banco de dados estabelecida em ${connectionResult.responseTime}ms`
        });
        
        const tablesResult = await testTables();
        const tablesCount = Object.values(tablesResult).filter(t => t.exists).length;
        
        toast({
          title: "Verificação de tabelas",
          description: `${tablesCount} tabelas verificadas com sucesso`
        });
        
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
  
  const handleNavigateToDiagnostic = () => {
    navigate('/diagnostico');
  };
  
  const handleAutoBackupToggle = async (enabled: boolean) => {
    const success = await updateBackupSettings(enabled);
    if (success) {
      toast({
        title: enabled ? "Backup automático ativado" : "Backup automático desativado",
        description: enabled ? "Backups serão realizados automaticamente diariamente" : "Backups automáticos foram desativados"
      });
    } else {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar as configurações de backup",
        variant: "destructive"
      });
    }
  };

  const handleClearAllBackups = async () => {
    toast({
      title: "Limpeza de backups",
      description: "Funcionalidade de limpeza será implementada em breve"
    });
  };

  const handleExportAllBackups = async () => {
    toast({
      title: "Exportação de backups",
      description: "Funcionalidade de exportação será implementada em breve"
    });
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleString('pt-BR');
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Backup e Restauração</CardTitle>
        <CardDescription>
          Gerencie backups dos seus dados e configurações. Os backups são salvos automaticamente no sistema com limite de 30 backups por usuário.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-md">Backup de Dados</CardTitle>
              <CardDescription>
                Crie um backup completo dos seus dados no sistema
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button 
                className="w-full" 
                onClick={() => handleBackupData(false)}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Gerando backup...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Salvar Backup
                  </>
                )}
              </Button>
              
              <Button 
                className="w-full" 
                variant="outline"
                onClick={() => handleBackupData(true)}
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
                    Salvar e Baixar
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
                onClick={handleRestoreFromFile}
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
                    Restaurar de Arquivo
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
              <Dialog open={isAdvancedOptionsOpen} onOpenChange={setIsAdvancedOptionsOpen}>
                <DialogTrigger asChild>
                  <Button 
                    className="w-full" 
                    variant="outline"
                  >
                    <Settings2 className="mr-2 h-4 w-4" />
                    Opções Avançadas
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Configurações Avançadas</DialogTitle>
                    <DialogDescription>
                      Opções avançadas para gerenciamento de backups e manutenção do sistema
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="grid gap-2">
                      <Button 
                        variant="outline"
                        onClick={handleExportAllBackups}
                        className="w-full justify-start"
                      >
                        <Archive className="mr-2 h-4 w-4" />
                        Exportar Todos os Backups
                      </Button>
                      <Button 
                        variant="destructive"
                        onClick={handleClearAllBackups}
                        className="w-full justify-start"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Limpar Todos os Backups
                      </Button>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button 
                      variant="outline" 
                      onClick={() => setIsAdvancedOptionsOpen(false)}
                    >
                      Fechar
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        </div>
        
        <div className="space-y-2">
          <Label>Backups Automáticos</Label>
          <div className="flex items-center justify-between">
            <Label htmlFor="auto-backup" className="text-sm text-muted-foreground">
              Realizar backups automáticos diários
              {backupSettings?.auto_backup_enabled && (
                <span className="ml-2 text-green-600 font-medium">• Ativo</span>
              )}
            </Label>
            <Switch 
              id="auto-backup" 
              checked={backupSettings?.auto_backup_enabled || false}
              onCheckedChange={handleAutoBackupToggle}
              disabled={isSettingsLoading}
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label>Histórico de Backups</Label>
          <div className="rounded-md border">
            {isHistoryLoading ? (
              <div className="p-4 text-center">
                <Loader2 className="mx-auto h-6 w-6 animate-spin mb-2" />
                <p className="text-muted-foreground">Carregando histórico...</p>
              </div>
            ) : history.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground">
                <FileText className="mx-auto h-8 w-8 mb-2 opacity-50" />
                <p>Nenhum backup encontrado</p>
                <p className="text-sm">Gere seu primeiro backup para ver o histórico</p>
              </div>
            ) : (
              history.map((backup, index) => (
                <div key={backup.id}>
                  <div className="p-4 flex items-center justify-between">
                    <div className="flex-1">
                      <p className="font-medium">{backup.filename}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(backup.created_at)} • {formatFileSize(backup.file_size)} • {backup.tables_count} tabelas • {backup.total_records} registros
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm"
                            disabled={isRestoring}
                          >
                            <RotateCcw className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle className="flex items-center gap-2">
                              <AlertTriangle className="h-5 w-5 text-amber-500" />
                              Confirmar Restauração
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              Você tem certeza que deseja restaurar o backup "<strong>{backup.filename}</strong>"?
                              <br /><br />
                              <strong>Atenção:</strong> Esta ação irá substituir suas configurações atuais pelos dados do backup selecionado. Esta ação não pode ser desfeita.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleRestoreBackup(backup.id, backup.filename)}
                              disabled={isRestoring}
                              className="bg-amber-500 hover:bg-amber-600"
                            >
                              {isRestoring ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  Restaurando...
                                </>
                              ) : (
                                'Confirmar Restauração'
                              )}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                  {index < history.length - 1 && <Separator />}
                </div>
              ))
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BackupTab;
