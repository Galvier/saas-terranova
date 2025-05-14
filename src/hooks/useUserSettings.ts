
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from './use-toast';
import { useTableSubscription } from './useRealTimeSubscription';

export interface UserSettings {
  theme: 'light' | 'dark' | 'system';
  animationsEnabled: boolean;
  notificationPreferences: {
    email: boolean;
    system: boolean;
    alerts: boolean;
  };
}

const DEFAULT_SETTINGS: UserSettings = {
  theme: 'system',
  animationsEnabled: true,
  notificationPreferences: {
    email: true,
    system: true,
    alerts: true
  }
};

export function useUserSettings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Carregar configurações do banco de dados quando o usuário fizer login
  const loadSettings = useCallback(async () => {
    if (!user) {
      // Se não estiver logado, tenta carregar do localStorage como fallback
      try {
        const savedSettings = localStorage.getItem('userSettings');
        if (savedSettings) {
          setSettings(JSON.parse(savedSettings));
        }
      } catch (error) {
        console.error('Erro ao carregar configurações do localStorage:', error);
      }
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      // Tenta carregar da nova tabela user_settings primeiro
      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Erro ao carregar configurações da tabela user_settings:', error);
        
        // Tenta carregar da tabela de configurações legacy como fallback
        const { data: legacyData, error: legacyError } = await supabase
          .from('settings')
          .select('*')
          .eq('key', `user_settings_${user.id}`)
          .single();
          
        if (legacyError) {
          console.error('Erro ao carregar configurações da tabela legacy settings:', legacyError);
          // Tenta carregar do localStorage como último recurso
          const savedSettings = localStorage.getItem(`userSettings_${user.id}`);
          if (savedSettings) {
            setSettings(JSON.parse(savedSettings));
          }
        } else if (legacyData) {
          // Migra do formato legacy value
          const userSettings = legacyData.value as Record<string, any>;
          setSettings({
            theme: userSettings.theme || DEFAULT_SETTINGS.theme,
            animationsEnabled: userSettings.animationsEnabled !== undefined ? 
              userSettings.animationsEnabled : DEFAULT_SETTINGS.animationsEnabled,
            notificationPreferences: {
              email: userSettings.notificationPreferences?.email !== undefined ? 
                userSettings.notificationPreferences.email : DEFAULT_SETTINGS.notificationPreferences.email,
              system: userSettings.notificationPreferences?.system !== undefined ? 
                userSettings.notificationPreferences.system : DEFAULT_SETTINGS.notificationPreferences.system,
              alerts: userSettings.notificationPreferences?.alerts !== undefined ? 
                userSettings.notificationPreferences.alerts : DEFAULT_SETTINGS.notificationPreferences.alerts
            }
          });
        }
      } else if (data) {
        // Usa dados da nova tabela user_settings
        const notificationPrefs = data.notification_preferences as Record<string, boolean>;
        setSettings({
          theme: (data.theme as 'light' | 'dark' | 'system') || DEFAULT_SETTINGS.theme,
          animationsEnabled: data.animations_enabled !== undefined ? 
            data.animations_enabled : DEFAULT_SETTINGS.animationsEnabled,
          notificationPreferences: {
            email: notificationPrefs?.email ?? DEFAULT_SETTINGS.notificationPreferences.email,
            system: notificationPrefs?.system ?? DEFAULT_SETTINGS.notificationPreferences.system,
            alerts: notificationPrefs?.alerts ?? DEFAULT_SETTINGS.notificationPreferences.alerts
          }
        });
      }
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Carregar configurações quando o usuário mudar
  useEffect(() => {
    loadSettings();
  }, [user, loadSettings]);

  // Escutar atualizações em tempo real para as configurações do usuário
  const handleRealtimeUpdate = useCallback((payload: any) => {
    if (!user || payload.new.user_id !== user.id) return;
    
    console.log('Configurações atualizadas em tempo real:', payload);
    const data = payload.new;
    const notificationPrefs = data.notification_preferences as Record<string, boolean>;
    
    setSettings({
      theme: (data.theme as 'light' | 'dark' | 'system') || DEFAULT_SETTINGS.theme,
      animationsEnabled: data.animations_enabled !== undefined ? 
        data.animations_enabled : DEFAULT_SETTINGS.animationsEnabled,
      notificationPreferences: {
        email: notificationPrefs?.email ?? DEFAULT_SETTINGS.notificationPreferences.email,
        system: notificationPrefs?.system ?? DEFAULT_SETTINGS.notificationPreferences.system,
        alerts: notificationPrefs?.alerts ?? DEFAULT_SETTINGS.notificationPreferences.alerts
      }
    });
  }, [user]);

  // Inscrever para atualizações em tempo real quando o usuário estiver logado
  useTableSubscription(
    'public', 
    'user_settings', 
    'UPDATE', 
    user ? handleRealtimeUpdate : () => {}
  );

  // Aplicar efeitos das configurações
  useEffect(() => {
    if (isLoading) return;

    // Aplicar tema
    if (settings.theme === 'system') {
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.documentElement.classList.remove('dark', 'light');
      if (systemPrefersDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.add('light');
      }
    } else {
      document.documentElement.classList.remove('dark', 'light');
      document.documentElement.classList.add(settings.theme);
    }
    
    // Aplicar animações
    if (!settings.animationsEnabled) {
      document.documentElement.classList.add('no-animations');
    } else {
      document.documentElement.classList.remove('no-animations');
    }
    
    // Salvar no localStorage como fallback
    if (user) {
      localStorage.setItem(`userSettings_${user.id}`, JSON.stringify(settings));
    } else {
      localStorage.setItem('userSettings', JSON.stringify(settings));
    }
  }, [settings, isLoading, user]);

  // Função para atualizar configurações
  const updateSettings = async (newSettings: Partial<UserSettings>) => {
    const updatedSettings = { ...settings, ...newSettings };
    setSettings(updatedSettings);
    
    if (!user) return;
    
    setIsSaving(true);
    try {
      // Salvar na nova tabela user_settings
      const { error } = await supabase.rpc('save_user_settings', {
        p_user_id: user.id,
        p_theme: updatedSettings.theme,
        p_density: 'default', // Valor padrão já que removemos a opção
        p_animations_enabled: updatedSettings.animationsEnabled,
        p_notification_preferences: updatedSettings.notificationPreferences
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Configurações salvas",
        description: "Suas preferências foram atualizadas com sucesso"
      });
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar suas preferências",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  return {
    settings,
    isLoading,
    isSaving,
    updateSettings,
  };
}
