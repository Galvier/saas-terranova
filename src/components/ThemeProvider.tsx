
import { ReactNode, useEffect } from 'react';
import { useUserSettings } from '@/hooks/useUserSettings';
import { useAuth } from '@/hooks/useAuth';

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  const { settings, isLoading } = useUserSettings();
  const { isAuthenticated } = useAuth();

  // Apply theme whenever settings change or auth state changes
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
    
    console.log(`[ThemeProvider] Applied theme: ${settings.theme}, animations: ${settings.animationsEnabled ? 'enabled' : 'disabled'}`);
  }, [settings, isLoading, isAuthenticated]);

  return <>{children}</>;
};
