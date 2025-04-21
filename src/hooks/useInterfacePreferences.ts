
import { useState, useEffect } from 'react';

interface InterfacePreferences {
  theme: 'light' | 'dark' | 'system';
  density: 'compact' | 'default' | 'comfortable';
  animationsEnabled: boolean;
}

const DEFAULT_PREFERENCES: InterfacePreferences = {
  theme: 'system',
  density: 'default',
  animationsEnabled: true,
};

export function useInterfacePreferences() {
  const [preferences, setPreferences] = useState<InterfacePreferences>(() => {
    try {
      const saved = localStorage.getItem('interfacePreferences');
      return saved ? JSON.parse(saved) : DEFAULT_PREFERENCES;
    } catch (error) {
      console.error('Error loading preferences:', error);
      return DEFAULT_PREFERENCES;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('interfacePreferences', JSON.stringify(preferences));
      
      // Apply theme
      if (preferences.theme === 'system') {
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        document.documentElement.classList.remove('dark', 'light');
        if (systemPrefersDark) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.add('light');
        }
      } else {
        document.documentElement.classList.remove('dark', 'light');
        document.documentElement.classList.add(preferences.theme);
      }
      
      // Apply animations
      if (!preferences.animationsEnabled) {
        document.documentElement.classList.add('no-animations');
      } else {
        document.documentElement.classList.remove('no-animations');
      }
      
      // Apply density
      document.documentElement.dataset.density = preferences.density;
    } catch (error) {
      console.error('Error saving preferences:', error);
    }
  }, [preferences]);

  const updatePreferences = (newPreferences: Partial<InterfacePreferences>) => {
    setPreferences(prev => ({ ...prev, ...newPreferences }));
  };

  return {
    preferences,
    updatePreferences,
  };
}
