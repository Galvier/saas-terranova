
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

  // Função para aplicar o tema imediatamente
  const applyTheme = useCallback((theme: 'light' | 'dark' | 'system') => {
    console.log('[useUserSettings] Aplicando tema:', theme);
    
    const root = document.documentElement;
    root.classList.remove('dark', 'light');
    
    if (theme === 'system') {
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (systemPrefersDark) {
        root.classList.add('dark');
      } else {
        root.classList.add('light');
      }
    } else {
      root.classList.add(theme);
    }
    
    console.log('[useUserSettings] Tema aplicado. Classes atuais:', root.className);
  }, []);

  // Função para aplicar animações
  const applyAnimations = useCallback((enabled: boolean) => {
    const root = document.documentElement;
    if (!enabled) {
      root.classList.add('no-animations');
    } else {
      root.classList.remove('no-animations');
    }
  }, []);

  // Carregar configurações
  const loadSettings = useCallback(async () => {
    setIsLoading(true);
    
    try {
      if (!user) {
        // Carregar do localStorage se não há usuário
        const savedSettings = localStorage.getItem('userSettings');
        if (savedSettings) {
          const parsed = JSON.parse(savedSettings);
          setSettings(parsed);
          applyTheme(parsed.theme);
          applyAnimations(parsed.animationsEnabled);
        } else {
          setSettings(DEFAULT_SETTINGS);
          applyTheme(DEFAULT_SETTINGS.theme);
          applyAnimations(DEFAULT_SETTINGS.animationsEnabled);
        }
        setIsLoading(false);
        return;
      }

      console.log('[useUserSettings] Carregando configurações do banco para usuário:', user.id);
      
      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!error && data) {
        console.log('[useUserSettings] Configurações carregadas do banco:', data);
        const loadedSettings = {
          theme: (data.theme as 'light' | 'dark' | 'system') || DEFAULT_SETTINGS.theme,
          animationsEnabled: data.animations_enabled !== undefined ? 
            data.animations_enabled : DEFAULT_SETTINGS.animationsEnabled,
          notificationPreferences: {
            email: data.notification_preferences?.email ?? DEFAULT_SETTINGS.notificationPreferences.email,
            system: data.notification_preferences?.system ?? DEFAULT_SETTINGS.notificationPreferences.system,
            alerts: data.notification_preferences?.alerts ?? DEFAULT_SETTINGS.notificationPreferences.alerts
          }
        };
        
        setSettings(loadedSettings);
        applyTheme(loadedSettings.theme);
        applyAnimations(loadedSettings.animationsEnabled);
      } else {
        console.log('[useUserSettings] Usando configurações padrão ou do localStorage');
        const key = `userSettings_${user.id}`;
        const savedSettings = localStorage.getItem(key);
        if (savedSettings) {
          const parsed = JSON.parse(savedSettings);
          setSettings(parsed);
          applyTheme(parsed.theme);
          applyAnimations(parsed.animationsEnabled);
        } else {
          setSettings(DEFAULT_SETTINGS);
          applyTheme(DEFAULT_SETTINGS.theme);
          applyAnimations(DEFAULT_SETTINGS.animationsEnabled);
        }
      }
    } catch (error) {
      console.error('[useUserSettings] Erro ao carregar configurações:', error);
      setSettings(DEFAULT_SETTINGS);
      applyTheme(DEFAULT_SETTINGS.theme);
      applyAnimations(DEFAULT_SETTINGS.animationsEnabled);
    } finally {
      setIsLoading(false);
    }
  }, [user, applyTheme, applyAnimations]);

  // Carregar configurações quando o usuário muda
  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  // Salvar no localStorage sempre que as configurações mudam
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

  // Função para atualizar configurações
  const updateSettings = async (newSettings: Partial<UserSettings>) => {
    const updatedSettings = { ...settings, ...newSettings };
    
    // Aplicar tema imediatamente se mudou
    if (newSettings.theme && newSettings.theme !== settings.theme) {
      applyTheme(newSettings.theme);
    }
    
    // Aplicar animações imediatamente se mudou
    if (newSettings.animationsEnabled !== undefined && newSettings.animationsEnabled !== settings.animationsEnabled) {
      applyAnimations(newSettings.animationsEnabled);
    }
    
    // Atualizar estado imediatamente
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
      console.log('[useUserSettings] Salvando no banco:', updatedSettings);
      
      const { error } = await supabase
        .from('user_settings')
        .upsert({
          user_id: user.id,
          theme: updatedSettings.theme,
          animations_enabled: updatedSettings.animationsEnabled,
          notification_preferences: updatedSettings.notificationPreferences
        }, {
          onConflict: 'user_id'
        });
          
      if (error) {
        console.error('[useUserSettings] Erro ao salvar no banco:', error);
        toast({
          title: "Aviso",
          description: "Configurações aplicadas mas podem não ter sido salvas no servidor",
          variant: "default"
        });
      } else {
        console.log('[useUserSettings] Configurações salvas no banco com sucesso');
        toast({
          title: "Sucesso",
          description: "Configurações salvas com sucesso",
        });
      }
    } catch (error) {
      console.error('[useUserSettings] Erro inesperado ao salvar:', error);
      toast({
        title: "Aviso",
        description: "Configurações aplicadas localmente",
        variant: "default"
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
