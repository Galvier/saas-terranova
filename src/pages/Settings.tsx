
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import PageHeader from '@/components/PageHeader';
import { 
  Save, 
  Loader2, 
  Download, 
  Upload, 
  Moon, 
  Sun, 
  Globe, 
  User, 
  Settings2, 
  Bell, 
  Link, 
  Database 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { testConnection, testTables, testDatabaseWrite } from '@/utils/supabaseDiagnostic';
import { useUserSettings } from '@/hooks/useUserSettings';
import { useAuth } from '@/hooks/useAuth';

const Settings = () => {
  const { settings, isLoading: isSettingsLoading, isSaving, updateSettings } = useUserSettings();
  const { user, isLoading: isAuthLoading } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  
  // Form states - user profile
  const [fullName, setFullName] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  
  // Form states - backup
  const [autoBackup, setAutoBackup] = useState(false);
  
  React.useEffect(() => {
    // Initialize form values when user data is loaded
    if (user) {
      setEmail(user.email || '');
      // Use metadata if available
      const metadata = user?.user_metadata;
      if (metadata) {
        setFullName(metadata.full_name || metadata.name || '');
        setDisplayName(metadata.display_name || metadata.name || '');
      }
    }
  }, [user]);
  
  // Handle saving interface settings
  const handleSaveInterfaceSettings = () => {
    updateSettings({
      theme: settings.theme,
      density: settings.density,
      animationsEnabled: settings.animationsEnabled
    });
  };
  
  // Handle saving notification settings
  const handleSaveNotificationSettings = () => {
    setIsLoading(true);
    updateSettings({
      notificationPreferences: {
        email: settings.notificationPreferences.email,
        system: settings.notificationPreferences.system,
        alerts: settings.notificationPreferences.alerts
      }
    });
    setIsLoading(false);
  };
  
  // Handle backup data with visual feedback
  const handleBackupData = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "Backup concluído",
        description: "Seu backup foi gerado e está disponível para download",
      });
    }, 1000);
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
    input.accept = '.json,.sql';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        setIsLoading(true);
        setTimeout(() => {
          setIsLoading(false);
          toast({
            title: "Restauração concluída",
            description: `O arquivo ${file.name} foi restaurado com sucesso`
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
    navigate('/diagnostico');
  };

  // Show loading state while settings are being fetched
  if (isSettingsLoading || isAuthLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-lg font-medium">Carregando configurações...</span>
      </div>
    );
  }
  
  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader 
        title="Configurações do Sistema" 
        subtitle="Personalize suas preferências e configurações do sistema" 
      />
      
      <div className="flex flex-col md:flex-row gap-6">
        <div className="w-full md:w-[240px] shrink-0">
          <Card>
            <CardContent className="p-4">
              <div className="space-y-1">
                <h3 className="text-sm font-medium">Categorias</h3>
                <Separator className="my-2" />
                <div className="space-y-1 py-2">
                  <Button variant="ghost" className="w-full justify-start gap-2" size="sm" 
                    onClick={() => document.getElementById('perfil-tab')?.click()}>
                    <User className="h-4 w-4" />
                    <span>Perfil do Usuário</span>
                  </Button>
                  <Button variant="ghost" className="w-full justify-start gap-2 text-primary" size="sm"
                    onClick={() => document.getElementById('interface-tab')?.click()}>
                    <Settings2 className="h-4 w-4" />
                    <span>Aparência</span>
                  </Button>
                  <Button variant="ghost" className="w-full justify-start gap-2" size="sm"
                    onClick={() => document.getElementById('notifications-tab')?.click()}>
                    <Bell className="h-4 w-4" />
                    <span>Notificações</span>
                  </Button>
                  <Button variant="ghost" className="w-full justify-start gap-2" size="sm"
                    onClick={() => document.getElementById('integrations-tab')?.click()}>
                    <Link className="h-4 w-4" />
                    <span>Integrações</span>
                  </Button>
                  <Button variant="ghost" className="w-full justify-start gap-2" size="sm"
                    onClick={() => document.getElementById('backup-tab')?.click()}>
                    <Database className="h-4 w-4" />
                    <span>Sistema</span>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="flex-1">
          <Tabs defaultValue="interface" className="w-full">
            <TabsList className="mb-6 w-full justify-start">
              <TabsTrigger value="interface" id="interface-tab">Interface</TabsTrigger>
              <TabsTrigger value="notifications" id="notifications-tab">Notificações</TabsTrigger>
              <TabsTrigger value="integrations" id="integrations-tab">Integrações</TabsTrigger>
              <TabsTrigger value="backup" id="backup-tab">Backup de Dados</TabsTrigger>
              <TabsTrigger value="profile" id="perfil-tab">Perfil</TabsTrigger>
            </TabsList>
            
            {/* Interface Settings */}
            <TabsContent value="interface">
              <Card>
                <CardHeader>
                  <CardTitle>Preferências de Interface</CardTitle>
                  <CardDescription>
                    Personalize a aparência e funcionamento da interface
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Tema</Label>
                      <RadioGroup 
                        value={settings.theme} 
                        onValueChange={(value: 'light' | 'dark' | 'system') => 
                          updateSettings({ theme: value })} 
                        className="flex gap-4"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="light" id="theme-light" />
                          <Label htmlFor="theme-light" className="flex items-center gap-2">
                            <Sun className="h-4 w-4" />
                            <span>Claro</span>
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="dark" id="theme-dark" />
                          <Label htmlFor="theme-dark" className="flex items-center gap-2">
                            <Moon className="h-4 w-4" />
                            <span>Escuro</span>
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="system" id="theme-system" />
                          <Label htmlFor="theme-system" className="flex items-center gap-2">
                            <Globe className="h-4 w-4" />
                            <span>Sistema</span>
                          </Label>
                        </div>
                      </RadioGroup>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Densidade de Informações</Label>
                      <RadioGroup 
                        value={settings.density} 
                        onValueChange={(value: 'compact' | 'default' | 'comfortable') => 
                          updateSettings({ density: value })} 
                        className="flex gap-4"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="compact" id="density-compact" />
                          <Label htmlFor="density-compact">Compacto</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="default" id="density-default" />
                          <Label htmlFor="density-default">Padrão</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="comfortable" id="density-comfortable" />
                          <Label htmlFor="density-comfortable">Confortável</Label>
                        </div>
                      </RadioGroup>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Animações</Label>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="animations" className="text-sm text-muted-foreground">
                        Ativar animações na interface
                      </Label>
                      <Switch 
                        id="animations" 
                        checked={settings.animationsEnabled}
                        onCheckedChange={(value) => updateSettings({ animationsEnabled: value })}
                      />
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="border-t bg-muted/50 px-6 py-4">
                  <Button onClick={handleSaveInterfaceSettings} disabled={isSaving}>
                    {isSaving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Salvando...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Salvar Preferências
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
            
            {/* Profile Settings */}
            <TabsContent value="profile">
              <Card>
                <CardHeader>
                  <CardTitle>Perfil do Usuário</CardTitle>
                  <CardDescription>
                    Gerencie suas informações pessoais e preferências
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="md:w-1/3 flex flex-col items-center space-y-4">
                      <div className="relative">
                        <div className="h-32 w-32 rounded-full bg-muted flex items-center justify-center text-2xl font-bold">
                          {displayName?.substring(0, 2).toUpperCase() || 'U'}
                        </div>
                        <Button size="sm" variant="secondary" className="absolute -bottom-2 -right-2 rounded-full p-2">
                          <Upload className="h-4 w-4" />
                        </Button>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Clique para alterar sua foto de perfil
                      </p>
                    </div>
                    <div className="md:w-2/3 space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="fullName">Nome completo</Label>
                          <Input 
                            id="fullName" 
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="displayName">Nome de exibição</Label>
                          <Input 
                            id="displayName" 
                            value={displayName}
                            onChange={(e) => setDisplayName(e.target.value)}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input 
                          id="email" 
                          type="email" 
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          readOnly={!!user} // Email is readonly if logged in
                          className={user ? "bg-muted" : ""}
                        />
                        {user && (
                          <p className="text-xs text-muted-foreground">
                            O email não pode ser alterado depois do registro
                          </p>
                        )}
                      </div>
                      {user?.app_metadata?.role && (
                        <div className="space-y-2">
                          <Label htmlFor="role">Função</Label>
                          <Input 
                            id="role" 
                            defaultValue={user.app_metadata.role} 
                            readOnly 
                            className="bg-muted" 
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="border-t bg-muted/50 px-6 py-4">
                  <Button onClick={() => {
                    setIsLoading(true);
                    setTimeout(() => {
                      setIsLoading(false);
                      toast({
                        title: "Perfil atualizado",
                        description: "Suas informações de perfil foram atualizadas com sucesso"
                      });
                    }, 1000);
                  }} disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Salvando...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Salvar Perfil
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
            
            {/* Notifications Settings */}
            <TabsContent value="notifications">
              <Card>
                <CardHeader>
                  <CardTitle>Configurações de Notificações</CardTitle>
                  <CardDescription>
                    Gerencie como e quando você recebe notificações
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="email-notifications">Notificações por E-mail</Label>
                        <p className="text-sm text-muted-foreground">
                          Receba atualizações importantes por e-mail
                        </p>
                      </div>
                      <Switch 
                        id="email-notifications" 
                        checked={settings.notificationPreferences.email}
                        onCheckedChange={(value) => updateSettings({
                          notificationPreferences: {
                            ...settings.notificationPreferences,
                            email: value
                          }
                        })}
                      />
                    </div>
                    
                    <Separator />
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="system-notifications">Notificações do Sistema</Label>
                        <p className="text-sm text-muted-foreground">
                          Notificações no navegador sobre atualizações do sistema
                        </p>
                      </div>
                      <Switch 
                        id="system-notifications" 
                        checked={settings.notificationPreferences.system}
                        onCheckedChange={(value) => updateSettings({
                          notificationPreferences: {
                            ...settings.notificationPreferences,
                            system: value
                          }
                        })}
                      />
                    </div>
                    
                    <Separator />
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="alert-notifications">Alertas de Métricas</Label>
                        <p className="text-sm text-muted-foreground">
                          Receba alertas quando métricas atingirem limites críticos
                        </p>
                      </div>
                      <Switch 
                        id="alert-notifications" 
                        checked={settings.notificationPreferences.alerts}
                        onCheckedChange={(value) => updateSettings({
                          notificationPreferences: {
                            ...settings.notificationPreferences,
                            alerts: value
                          }
                        })}
                      />
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="border-t bg-muted/50 px-6 py-4">
                  <Button onClick={handleSaveNotificationSettings} disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Salvando...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Salvar Preferências
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
            
            {/* Integrations Settings */}
            <TabsContent value="integrations">
              <Card>
                <CardHeader>
                  <CardTitle>Integrações</CardTitle>
                  <CardDescription>
                    Configure integrações com serviços externos
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="api-key">Chave de API</Label>
                      <Input 
                        id="api-key" 
                        type="password" 
                        placeholder="Insira sua chave de API"
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="export-enabled">Exportação Automática</Label>
                        <p className="text-sm text-muted-foreground">
                          Exportar dados automaticamente para sistemas externos
                        </p>
                      </div>
                      <Switch 
                        id="export-enabled" 
                      />
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-2">
                      <Label>Formatos de Exportação</Label>
                      <div className="flex flex-wrap gap-2">
                        <Button variant="outline" size="sm" onClick={() => toast({ title: "Formato selecionado", description: "Exportação em CSV configurada" })}>
                          CSV
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => toast({ title: "Formato selecionado", description: "Exportação em Excel configurada" })}>
                          Excel
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => toast({ title: "Formato selecionado", description: "Exportação em PDF configurada" })}>
                          PDF
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => toast({ title: "Formato selecionado", description: "Exportação em JSON configurada" })}>
                          JSON
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="border-t bg-muted/50 px-6 py-4">
                  <Button onClick={() => {
                    setIsLoading(true);
                    setTimeout(() => {
                      setIsLoading(false);
                      toast({
                        title: "Configurações salvas",
                        description: "Suas configurações de integração foram atualizadas"
                      });
                    }, 1000);
                  }} disabled={isLoading}>
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
            </TabsContent>
            
            {/* Backup Settings */}
            <TabsContent value="backup">
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
                              Processando...
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
                      <div className="p-4 flex items-center justify-between">
                        <div>
                          <p className="font-medium">Backup Completo</p>
                          <p className="text-sm text-muted-foreground">20/04/2025, 15:30</p>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => toast({
                            title: "Download iniciado",
                            description: "O download do seu backup foi iniciado"
                          })}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                      <Separator />
                      <div className="p-4 flex items-center justify-between">
                        <div>
                          <p className="font-medium">Backup Completo</p>
                          <p className="text-sm text-muted-foreground">19/04/2025, 15:30</p>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => toast({
                            title: "Download iniciado",
                            description: "O download do seu backup foi iniciado"
                          })}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="border-t bg-muted/50 px-6 py-4">
                  <Button onClick={() => {
                    setIsLoading(true);
                    setTimeout(() => {
                      setIsLoading(false);
                      toast({
                        title: "Configurações salvas",
                        description: "Suas configurações de backup foram atualizadas"
                      });
                    }, 1000);
                  }} disabled={isLoading}>
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
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Settings;
