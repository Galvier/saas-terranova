
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from './use-toast';
import { useRealTimeSubscription } from './useRealTimeSubscription';

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

  // Load settings from database when user logs in
  const loadSettings = useCallback(async () => {
    if (!user) {
      // If not logged in, try to load from localStorage as a fallback
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
      console.log('[useUserSettings] Loading settings for user:', user.id);
      // Try to load from the new user_settings table first
      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Error loading settings from user_settings table:', error);
        
        // Try to load from the legacy settings table as a fallback
        const { data: legacyData, error: legacyError } = await supabase
          .from('settings')
          .select('*')
          .eq('key', `user_settings_${user.id}`)
          .single();
          
        if (legacyError) {
          console.error('Error loading settings from legacy settings table:', legacyError);
          // Try to load from localStorage as the last resort
          const savedSettings = localStorage.getItem(`userSettings_${user.id}`);
          if (savedSettings) {
            setSettings(JSON.parse(savedSettings));
          }
        } else if (legacyData) {
          // Migrate from legacy value format
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
        console.log('[useUserSettings] Settings loaded successfully:', data);
        // Use data from the new user_settings table
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
      console.error('Error loading settings:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Load settings when user changes
  useEffect(() => {
    loadSettings();
  }, [user, loadSettings]);

  // Listen for real-time updates for user settings
  const handleRealtimeUpdate = useCallback((payload: any) => {
    if (!user || payload.new.user_id !== user.id) return;
    
    console.log('[useUserSettings] Settings updated in real-time:', payload);
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

  // Subscribe for real-time updates when user is logged in
  useRealTimeSubscription(
    {
      schema: 'public', 
      table: 'user_settings', 
      event: 'UPDATE'
    }, 
    user ? handleRealtimeUpdate : () => {}
  );

  // Save to localStorage whenever settings change
  useEffect(() => {
    if (isLoading) return;
    
    // Save to localStorage as a fallback
    if (user) {
      localStorage.setItem(`userSettings_${user.id}`, JSON.stringify(settings));
    } else {
      localStorage.setItem('userSettings', JSON.stringify(settings));
    }
  }, [settings, isLoading, user]);

  // Function to update settings
  const updateSettings = async (newSettings: Partial<UserSettings>) => {
    const updatedSettings = { ...settings, ...newSettings };
    setSettings(updatedSettings);
    
    if (!user) return;
    
    setIsSaving(true);
    try {
      console.log('[useUserSettings] Saving settings:', updatedSettings);
      // Save to the new user_settings table
      const { error } = await supabase.rpc('save_user_settings', {
        p_user_id: user.id,
        p_theme: updatedSettings.theme,
        p_animations_enabled: updatedSettings.animationsEnabled,
        p_notification_preferences: updatedSettings.notificationPreferences
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Settings saved",
        description: "Your preferences were updated successfully"
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: "Error saving",
        description: "Failed to save your preferences",
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
