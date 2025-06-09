import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Settings, Save, RefreshCw } from 'lucide-react';

interface NotificationConfig {
  monthly_deadline_day: number;
  reminder_days_before: number[];
  admin_summary_frequency: string;
  business_hours_start: string;
  business_hours_end: string;
  enable_achievement_notifications: boolean;
  enable_reminder_notifications: boolean;
}

const NotificationSettings: React.FC = () => {
  const { toast } = useToast();
  const [config, setConfig] = useState<NotificationConfig>({
    monthly_deadline_day: 25,
    reminder_days_before: [3, 5, 7],
    admin_summary_frequency: 'weekly',
    business_hours_start: '08:00',
    business_hours_end: '18:00',
    enable_achievement_notifications: true,
    enable_reminder_notifications: true,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setIsLoading(true);
      
      // Buscar todas as configurações
      const configKeys = Object.keys(config);
      const promises = configKeys.map(key => 
        supabase.rpc('get_notification_setting', { setting_key_param: key })
      );
      
      const results = await Promise.all(promises);
      const newConfig = { ...config };
      
      results.forEach((result, index) => {
        const key = configKeys[index] as keyof NotificationConfig;
        if (result.data && result.data !== null) {
          const value = result.data;
          
          if (key === 'reminder_days_before') {
            // Garantir que é um array de números
            if (Array.isArray(value)) {
              (newConfig as any)[key] = value.map(v => typeof v === 'number' ? v : parseInt(String(v), 10)).filter(v => !isNaN(v));
            } else {
              (newConfig as any)[key] = [3, 5, 7];
            }
          } else if (typeof config[key] === 'boolean') {
            (newConfig as any)[key] = value === true || value === 'true' || value === '1';
          } else if (typeof config[key] === 'number') {
            (newConfig as any)[key] = typeof value === 'number' ? value : parseInt(String(value), 10) || config[key];
          } else {
            (newConfig as any)[key] = String(value) || config[key];
          }
        }
      });
      
      setConfig(newConfig);
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as configurações.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const saveSetting = async (key: string, value: any) => {
    try {
      const { error } = await supabase.rpc('update_notification_setting', {
        setting_key_param: key,
        new_value: value
      });

      if (error) throw error;
    } catch (error) {
      console.error(`Erro ao salvar configuração ${key}:`, error);
      throw error;
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      
      // Salvar cada configuração
      await Promise.all([
        saveSetting('monthly_deadline_day', config.monthly_deadline_day),
        saveSetting('reminder_days_before', config.reminder_days_before),
        saveSetting('admin_summary_frequency', config.admin_summary_frequency),
        saveSetting('business_hours_start', config.business_hours_start),
        saveSetting('business_hours_end', config.business_hours_end),
        saveSetting('enable_achievement_notifications', config.enable_achievement_notifications),
        saveSetting('enable_reminder_notifications', config.enable_reminder_notifications),
      ]);

      toast({
        title: "Configurações salvas",
        description: "As configurações de notificação foram atualizadas com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível salvar as configurações.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleProcessNotifications = async () => {
    try {
      setIsProcessing(true);
      
      const { data, error } = await supabase.functions.invoke('automatic-notifications');
      
      if (error) throw error;
      
      toast({
        title: "Processamento concluído",
        description: `${data.result.notifications_sent} notificações foram enviadas.`,
      });
    } catch (error) {
      console.error('Erro ao processar notificações:', error);
      toast({
        title: "Erro",
        description: "Não foi possível processar as notificações automáticas.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">Carregando configurações...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Configurações de Notificação
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Configurações de Prazo */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Configurações de Prazo</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="deadline">Dia limite mensal</Label>
                <Input
                  id="deadline"
                  type="number"
                  min="1"
                  max="31"
                  value={config.monthly_deadline_day}
                  onChange={(e) => setConfig(prev => ({
                    ...prev,
                    monthly_deadline_day: parseInt(e.target.value) || 25
                  }))}
                />
                <p className="text-sm text-muted-foreground">
                  Dia do mês limite para preenchimento das métricas mensais
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="frequency">Frequência de resumos</Label>
                <Select 
                  value={config.admin_summary_frequency} 
                  onValueChange={(value) => setConfig(prev => ({
                    ...prev,
                    admin_summary_frequency: value
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Diário</SelectItem>
                    <SelectItem value="weekly">Semanal</SelectItem>
                    <SelectItem value="monthly">Mensal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Horário Comercial */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Horário Comercial</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start-time">Início</Label>
                <Input
                  id="start-time"
                  type="time"
                  value={config.business_hours_start}
                  onChange={(e) => setConfig(prev => ({
                    ...prev,
                    business_hours_start: e.target.value
                  }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end-time">Fim</Label>
                <Input
                  id="end-time"
                  type="time"
                  value={config.business_hours_end}
                  onChange={(e) => setConfig(prev => ({
                    ...prev,
                    business_hours_end: e.target.value
                  }))}
                />
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Notificações só serão enviadas dentro do horário comercial
            </p>
          </div>

          {/* Tipos de Notificação */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Tipos de Notificação</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="achievement-notifications">Notificações de metas atingidas</Label>
                  <p className="text-sm text-muted-foreground">
                    Enviar parabenizações quando métricas atingem suas metas
                  </p>
                </div>
                <Switch
                  id="achievement-notifications"
                  checked={config.enable_achievement_notifications}
                  onCheckedChange={(checked) => setConfig(prev => ({
                    ...prev,
                    enable_achievement_notifications: checked
                  }))}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="reminder-notifications">Lembretes de preenchimento</Label>
                  <p className="text-sm text-muted-foreground">
                    Enviar lembretes quando métricas estão próximas do vencimento
                  </p>
                </div>
                <Switch
                  id="reminder-notifications"
                  checked={config.enable_reminder_notifications}
                  onCheckedChange={(checked) => setConfig(prev => ({
                    ...prev,
                    enable_reminder_notifications: checked
                  }))}
                />
              </div>
            </div>
          </div>

          {/* Ações */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t">
            <Button 
              onClick={handleSave} 
              disabled={isSaving}
              className="flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              {isSaving ? 'Salvando...' : 'Salvar Configurações'}
            </Button>
            <Button 
              variant="outline" 
              onClick={handleProcessNotifications}
              disabled={isProcessing}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isProcessing ? 'animate-spin' : ''}`} />
              {isProcessing ? 'Processando...' : 'Processar Agora'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotificationSettings;
