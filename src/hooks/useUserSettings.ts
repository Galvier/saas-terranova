
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from './use-toast';

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

  // Load settings - com fallback robusto
  const loadSettings = useCallback(async () => {
    setIsLoading(true);
    
    try {
      // Se não há usuário, carregar do localStorage
      if (!user) {
        const savedSettings = localStorage.getItem('userSettings');
        if (savedSettings) {
          setSettings(JSON.parse(savedSettings));
        }
        setIsLoading(false);
        return;
      }

      // Primeiro tentar carregar do banco de dados
      console.log('[useUserSettings] Tentando carregar configurações do banco...');
      
      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (!error && data) {
        console.log('[useUserSettings] Configurações carregadas do banco:', data);
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
      } else {
        console.log('[useUserSettings] Erro ao carregar do banco, usando localStorage:', error);
        // Fallback para localStorage
        const savedSettings = localStorage.getItem(`userSettings_${user.id}`);
        if (savedSettings) {
          setSettings(JSON.parse(savedSettings));
        } else {
          // Se nem localStorage tem, usar padrões
          setSettings(DEFAULT_SETTINGS);
        }
      }
    } catch (error) {
      console.error('[useUserSettings] Erro inesperado:', error);
      // Fallback final para localStorage
      try {
        const key = user ? `userSettings_${user.id}` : 'userSettings';
        const savedSettings = localStorage.getItem(key);
        if (savedSettings) {
          setSettings(JSON.parse(savedSettings));
        }
      } catch (e) {
        console.error('[useUserSettings] Erro ao carregar localStorage:', e);
      }
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Load settings when user changes
  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  // Save to localStorage whenever settings change
  useEffect(() => {
    if (isLoading) return;
    
    try {
      const key = user ? `userSettings_${user.id}` : 'userSettings';
      localStorage.setItem(key, JSON.stringify(settings));
      console.log('[useUserSettings] Configurações salvas no localStorage');
    } catch (error) {
      console.error('[useUserSettings] Erro ao salvar no localStorage:', error);
    }
  }, [settings, isLoading, user]);

  // Function to update settings
  const updateSettings = async (newSettings: Partial<UserSettings>) => {
    const updatedSettings = { ...settings, ...newSettings };
    
    // Atualizar estado imediatamente para UI responsiva
    setSettings(updatedSettings);
    
    // Salvar no localStorage imediatamente
    try {
      const key = user ? `userSettings_${user.id}` : 'userSettings';
      localStorage.setItem(key, JSON.stringify(updatedSettings));
    } catch (error) {
      console.error('[useUserSettings] Erro ao salvar no localStorage:', error);
    }
    
    // Tentar salvar no banco se há usuário
    if (!user) return;
    
    setIsSaving(true);
    try {
      console.log('[useUserSettings] Tentando salvar no banco:', updatedSettings);
      
      // Tentar usando a função RPC
      const { error: rpcError } = await supabase.rpc('save_user_settings', {
        p_user_id: user.id,
        p_theme: updatedSettings.theme,
        p_animations_enabled: updatedSettings.animationsEnabled,
        p_notification_preferences: updatedSettings.notificationPreferences
      });

      if (rpcError) {
        console.warn('[useUserSettings] RPC falhou, tentando upsert direto:', rpcError);
        
        // Fallback: upsert direto na tabela
        const { error: upsertError } = await supabase
          .from('user_settings')
          .upsert({
            user_id: user.id,
            theme: updatedSettings.theme,
            animations_enabled: updatedSettings.animationsEnabled,
            notification_preferences: updatedSettings.notificationPreferences
          }, {
            onConflict: 'user_id'
          });
          
        if (upsertError) {
          console.error('[useUserSettings] Upsert também falhou:', upsertError);
          // Não mostrar erro se localStorage funcionou
          console.log('[useUserSettings] Continuando com localStorage apenas');
        } else {
          console.log('[useUserSettings] Salvo com upsert direto');
        }
      } else {
        console.log('[useUserSettings] Salvo com RPC');
      }
    } catch (error) {
      console.error('[useUserSettings] Erro inesperado ao salvar:', error);
      // Não mostrar erro se localStorage funcionou
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
