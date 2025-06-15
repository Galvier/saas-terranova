
import React, { useState } from 'react';
import { Database, Download, Upload, Loader2, CheckCircle, AlertTriangle, Clock, Play } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import MobileSwitchControl from '@/components/settings/MobileSwitchControl';

const BackupTab: React.FC = () => {
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [isLoading, setIsLoading] = useState(false);
  const [autoBackupEnabled, setAutoBackupEnabled] = useState(true);
  const [lastBackup] = useState('2024-06-15 14:30:00');

  const handleManualBackup = async () => {
    setIsLoading(true);
    try {
      // Simular backup
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Backup realizado",
        description: "O backup dos dados foi concluído com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro no backup",
        description: "Não foi possível realizar o backup. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAutoBackupToggle = (enabled: boolean) => {
    setAutoBackupEnabled(enabled);
    toast({
      title: enabled ? "Backup automático ativado" : "Backup automático desativado",
      description: enabled 
        ? "Os backups serão realizados automaticamente a cada 24 horas."
        : "Você precisará fazer backups manuais.",
    });
  };

  return (
    <div className="space-y-6">
      {/* Status do Backup */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Status do Backup
          </CardTitle>
          <CardDescription>
            Informações sobre o último backup realizado
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg border">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <h4 className="font-medium">Último Backup</h4>
                <p className="text-sm text-muted-foreground">
                  {new Date(lastBackup).toLocaleString('pt-BR')}
                </p>
              </div>
            </div>
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              Sucesso
            </Badge>
          </div>

          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              Sistema de backup funcionando normalmente. Próximo backup automático em aproximadamente 18 horas.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Configurações de Backup */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Configurações de Backup
          </CardTitle>
          <CardDescription>
            Configure como e quando os backups são realizados
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isMobile ? (
            <MobileSwitchControl
              id="auto-backup"
              title="Backup Automático"
              description="Realizar backup automaticamente a cada 24 horas"
              checked={autoBackupEnabled}
              onCheckedChange={handleAutoBackupToggle}
              icon={Clock}
            />
          ) : (
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-blue-500" />
                <div>
                  <h4 className="font-medium">Backup Automático</h4>
                  <p className="text-sm text-muted-foreground">
                    Realizar backup automaticamente a cada 24 horas
                  </p>
                </div>
              </div>
              <Switch
                checked={autoBackupEnabled}
                onCheckedChange={handleAutoBackupToggle}
              />
            </div>
          )}

          {!autoBackupEnabled && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Atenção:</strong> Com o backup automático desativado, você deve realizar backups manuais regularmente para proteger seus dados.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Ações de Backup */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Play className="h-5 w-5" />
            Ações de Backup
          </CardTitle>
          <CardDescription>
            Realize backups manuais ou restaure dados
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button 
              onClick={handleManualBackup}
              disabled={isLoading}
              className="w-full justify-start"
              variant="outline"
            >
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Download className="mr-2 h-4 w-4" />
              )}
              {isLoading ? 'Realizando Backup...' : 'Backup Manual'}
            </Button>

            <Button 
              disabled={true}
              className="w-full justify-start"
              variant="outline"
            >
              <Upload className="mr-2 h-4 w-4" />
              Restaurar Backup
            </Button>
          </div>

          <Alert>
            <Database className="h-4 w-4" />
            <AlertDescription>
              <strong>Dica:</strong> Os backups incluem todas as métricas, departamentos, usuários e configurações do sistema. 
              O processo pode levar alguns minutos dependendo da quantidade de dados.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
};

export default BackupTab;
