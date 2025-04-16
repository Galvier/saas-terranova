
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import PageHeader from '@/components/PageHeader';
import { Save, Loader2, Download, Upload, BellRing, Globe, Moon, Sun, UploadCloud } from 'lucide-react';

const Settings = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [theme, setTheme] = useState('light');
  const [density, setDensity] = useState('default');
  
  // Notification states
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [systemNotifications, setSystemNotifications] = useState(true);
  const [alertNotifications, setAlertNotifications] = useState(true);
  
  // Integration states
  const [apiKey, setApiKey] = useState('');
  
  const handleSaveSettings = () => {
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "Configurações salvas",
        description: "Suas configurações foram atualizadas com sucesso",
      });
    }, 1000);
  };
  
  const handleBackupData = () => {
    toast({
      title: "Backup iniciado",
      description: "Seu backup está sendo gerado. Você será notificado quando estiver pronto para download."
    });
  };
  
  const handleRestoreData = () => {
    toast({
      title: "Restauração de dados",
      description: "Selecione um arquivo de backup para restaurar os dados."
    });
  };
  
  return (
    <div className="animate-fade-in">
      <PageHeader title="Configurações" subtitle="Personalize suas preferências e configurações do sistema" />
      
      <div className="mt-6">
        <Tabs defaultValue="interface">
          <TabsList className="mb-6">
            <TabsTrigger value="interface">Interface</TabsTrigger>
            <TabsTrigger value="notifications">Notificações</TabsTrigger>
            <TabsTrigger value="integrations">Integrações</TabsTrigger>
            <TabsTrigger value="backup">Backup de Dados</TabsTrigger>
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
                    <RadioGroup value={theme} onValueChange={setTheme} className="flex gap-4">
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
                    <RadioGroup value={density} onValueChange={setDensity} className="flex gap-4">
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
                    <Switch id="animations" defaultChecked />
                  </div>
                </div>
                
                <Button onClick={handleSaveSettings} disabled={isLoading}>
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
              </CardContent>
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
                      checked={emailNotifications}
                      onCheckedChange={setEmailNotifications}
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
                      checked={systemNotifications}
                      onCheckedChange={setSystemNotifications}
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
                      checked={alertNotifications}
                      onCheckedChange={setAlertNotifications}
                    />
                  </div>
                </div>
                
                <Button onClick={handleSaveSettings} disabled={isLoading}>
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
              </CardContent>
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
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="export-enabled">Exportação Automática</Label>
                      <p className="text-sm text-muted-foreground">
                        Exportar dados automaticamente para sistemas externos
                      </p>
                    </div>
                    <Switch id="export-enabled" defaultChecked />
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-2">
                    <Label>Formatos de Exportação</Label>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        CSV
                      </Button>
                      <Button variant="outline" size="sm">
                        Excel
                      </Button>
                      <Button variant="outline" size="sm">
                        PDF
                      </Button>
                      <Button variant="outline" size="sm">
                        JSON
                      </Button>
                    </div>
                  </div>
                </div>
                
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
              </CardContent>
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
                      <Button className="w-full" onClick={handleBackupData}>
                        <Download className="mr-2 h-4 w-4" />
                        Gerar Backup
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
                      <Button className="w-full" variant="outline" onClick={handleRestoreData}>
                        <UploadCloud className="mr-2 h-4 w-4" />
                        Restaurar Backup
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
                    <Switch id="auto-backup" defaultChecked />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Histórico de Backups</Label>
                  <div className="rounded-md border">
                    <div className="p-4 flex items-center justify-between">
                      <div>
                        <p className="font-medium">Backup Completo</p>
                        <p className="text-sm text-muted-foreground">16/04/2025, 15:30</p>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                    <Separator />
                    <div className="p-4 flex items-center justify-between">
                      <div>
                        <p className="font-medium">Backup Completo</p>
                        <p className="text-sm text-muted-foreground">15/04/2025, 15:30</p>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                    <Separator />
                    <div className="p-4 flex items-center justify-between">
                      <div>
                        <p className="font-medium">Backup Completo</p>
                        <p className="text-sm text-muted-foreground">14/04/2025, 15:30</p>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Settings;
