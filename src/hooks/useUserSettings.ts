
import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from './use-toast';

export interface UserSettings {
  theme: 'light' | 'dark' | 'system';
  density: 'compact' | 'default' | 'comfortable';
  animationsEnabled: boolean;
  notificationPreferences: {
    email: boolean;
    system: boolean;
    alerts: boolean;
  };
}

const DEFAULT_SETTINGS: UserSettings = {
  theme: 'system',
  density: 'default',
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

  // Load settings from database when user logs in
  useEffect(() => {
    async function loadSettings() {
      if (!user) {
        // If not logged in, try to load from localStorage as fallback
        try {
          const savedSettings = localStorage.getItem('userSettings');
          if (savedSettings) {
            setSettings(JSON.parse(savedSettings));
          }
        } catch (error) {
          console.error('Error loading settings from localStorage:', error);
        }
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        // Try to load from the new user_settings table first
        const { data, error } = await supabase
          .from('user_settings')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (error) {
          console.error('Error loading settings from user_settings table:', error);
          
          // Try to load from legacy settings table as fallback
          const { data: legacyData, error: legacyError } = await supabase
            .from('settings')
            .select('*')
            .eq('key', `user_settings_${user.id}`)
            .single();
            
          if (legacyError) {
            console.error('Error loading settings from legacy settings table:', legacyError);
            // Try to load from localStorage as last resort
            const savedSettings = localStorage.getItem(`userSettings_${user.id}`);
            if (savedSettings) {
              setSettings(JSON.parse(savedSettings));
            }
          } else if (legacyData) {
            // Migrate from legacy value format
            const userSettings = legacyData.value as Record<string, any>;
            setSettings({
              theme: userSettings.theme || DEFAULT_SETTINGS.theme,
              density: userSettings.density || DEFAULT_SETTINGS.density,
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
          // Use data from new user_settings table
          setSettings({
            theme: (data.theme as 'light' | 'dark' | 'system') || DEFAULT_SETTINGS.theme,
            density: (data.density as 'compact' | 'default' | 'comfortable') || DEFAULT_SETTINGS.density,
            animationsEnabled: data.animations_enabled !== undefined ? 
              data.animations_enabled : DEFAULT_SETTINGS.animationsEnabled,
            notificationPreferences: data.notification_preferences || DEFAULT_SETTINGS.notificationPreferences
          });
        }
      } catch (error) {
        console.error('Error loading settings:', error);
      } finally {
        setIsLoading(false);
      }
    }

    loadSettings();
  }, [user]);

  // Apply settings effects
  useEffect(() => {
    if (isLoading) return;

    // Apply theme
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
    
    // Apply animations
    if (!settings.animationsEnabled) {
      document.documentElement.classList.add('no-animations');
    } else {
      document.documentElement.classList.remove('no-animations');
    }
    
    // Apply density
    document.body.dataset.density = settings.density;
    console.log('Applied density setting:', settings.density);

    // Save to localStorage as fallback
    if (user) {
      localStorage.setItem(`userSettings_${user.id}`, JSON.stringify(settings));
    } else {
      localStorage.setItem('userSettings', JSON.stringify(settings));
    }
  }, [settings, isLoading, user]);

  // Update settings function
  const updateSettings = async (newSettings: Partial<UserSettings>) => {
    const updatedSettings = { ...settings, ...newSettings };
    setSettings(updatedSettings);
    
    if (!user) return;
    
    setIsSaving(true);
    try {
      // Save to the new user_settings table
      const { error } = await supabase.rpc('save_user_settings', {
        p_user_id: user.id,
        p_theme: updatedSettings.theme,
        p_density: updatedSettings.density,
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
      console.error('Error saving settings:', error);
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
