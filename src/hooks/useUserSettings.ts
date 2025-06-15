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
        console.log('[useUserSettings] Sem usuário, carregando do localStorage');
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

      if (error) {
        console.error('[useUserSettings] Erro ao carregar do banco:', error);
        // Fallback para localStorage
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
      } else if (data) {
        console.log('[useUserSettings] Configurações carregadas do banco:', data);
        
        // Fazer parsing seguro das notification_preferences
        let notificationPrefs = DEFAULT_SETTINGS.notificationPreferences;
        if (data.notification_preferences && typeof data.notification_preferences === 'object') {
          const prefs = data.notification_preferences as Record<string, any>;
          notificationPrefs = {
            email: prefs.email ?? DEFAULT_SETTINGS.notificationPreferences.email,
            system: prefs.system ?? DEFAULT_SETTINGS.notificationPreferences.system,
            alerts: prefs.alerts ?? DEFAULT_SETTINGS.notificationPreferences.alerts
          };
        }
        
        const loadedSettings = {
          theme: (data.theme as 'light' | 'dark' | 'system') || DEFAULT_SETTINGS.theme,
          animationsEnabled: data.animations_enabled !== undefined ? 
            data.animations_enabled : DEFAULT_SETTINGS.animationsEnabled,
          notificationPreferences: notificationPrefs
        };
        
        setSettings(loadedSettings);
        applyTheme(loadedSettings.theme);
        applyAnimations(loadedSettings.animationsEnabled);
      } else {
        console.log('[useUserSettings] Nenhuma configuração encontrada, usando padrão');
        // Usar configurações padrão e salvar no banco
        setSettings(DEFAULT_SETTINGS);
        applyTheme(DEFAULT_SETTINGS.theme);
        applyAnimations(DEFAULT_SETTINGS.animationsEnabled);
        
        // Salvar configurações padrão no banco
        try {
          const { error: insertError } = await supabase
            .from('user_settings')
            .insert({
              user_id: user.id,
              theme: DEFAULT_SETTINGS.theme,
              animations_enabled: DEFAULT_SETTINGS.animationsEnabled,
              notification_preferences: DEFAULT_SETTINGS.notificationPreferences
            });
          
          if (insertError) {
            console.error('[useUserSettings] Erro ao inserir configurações padrão:', insertError);
          } else {
            console.log('[useUserSettings] Configurações padrão inseridas no banco');
          }
        } catch (err) {
          console.error('[useUserSettings] Erro inesperado ao inserir padrão:', err);
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

  // Nova função para aplicar mudanças localmente (sem salvar no banco)
  const applyLocalChanges = useCallback((newSettings: Partial<UserSettings>) => {
    console.log('[useUserSettings] Aplicando mudanças locais:', newSettings);
    
    // Aplicar tema imediatamente se mudou
    if (newSettings.theme && newSettings.theme !== settings.theme) {
      console.log('[useUserSettings] Aplicando novo tema:', newSettings.theme);
      applyTheme(newSettings.theme);
    }
    
    // Aplicar animações imediatamente se mudou
    if (newSettings.animationsEnabled !== undefined && newSettings.animationsEnabled !== settings.animationsEnabled) {
      console.log('[useUserSettings] Aplicando configuração de animações:', newSettings.animationsEnabled);
      applyAnimations(newSettings.animationsEnabled);
    }
    
    // Atualizar estado local
    setSettings(prev => ({ ...prev, ...newSettings }));
    
    // Salvar no localStorage imediatamente para persistir preview
    try {
      const key = user ? `userSettings_${user.id}` : 'userSettings';
      const updatedSettings = { ...settings, ...newSettings };
      localStorage.setItem(key, JSON.stringify(updatedSettings));
      console.log('[useUserSettings] Mudanças locais salvas no localStorage');
    } catch (error) {
      console.error('[useUserSettings] Erro ao salvar mudanças locais no localStorage:', error);
    }
  }, [settings, user, applyTheme, applyAnimations]);

  // Nova função para salvar no banco de dados
  const saveToDatabase = useCallback(async (settingsToSave: UserSettings) => {
    if (!user) {
      console.log('[useUserSettings] Sem usuário, não é possível salvar no banco');
      return;
    }
    
    setIsSaving(true);
    try {
      console.log('[useUserSettings] Salvando no banco de dados...');
      
      const { data, error } = await supabase
        .from('user_settings')
        .upsert({
          user_id: user.id,
          theme: settingsToSave.theme,
          animations_enabled: settingsToSave.animationsEnabled,
          notification_preferences: settingsToSave.notificationPreferences
        }, {
          onConflict: 'user_id'
        })
        .select()
        .single();
          
      if (error) {
        console.error('[useUserSettings] ERRO ao salvar no banco:', error);
        throw error;
      } else {
        console.log('[useUserSettings] Configurações salvas no banco com SUCESSO:', data);
        
        toast({
          title: "Configurações salvas",
          description: "Suas configurações foram salvas com sucesso",
        });
      }
    } catch (error: any) {
      console.error('[useUserSettings] Erro inesperado ao salvar:', error);
      
      toast({
        title: "Erro",
        description: "Erro ao salvar configurações: " + (error.message || 'Desconhecido'),
        variant: "destructive"
      });
      
      throw error;
    } finally {
      setIsSaving(false);
    }
  }, [user, toast]);

  return {
    settings,
    isLoading,
    isSaving,
    applyLocalChanges,
    saveToDatabase,
  };
}
