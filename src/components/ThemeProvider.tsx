
import { ReactNode, useEffect } from 'react';
import { useUserSettings } from '@/hooks/useUserSettings';

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  const { settings, isLoading } = useUserSettings();

  // Aplicar tema quando carregado ou quando muda
  useEffect(() => {
    if (isLoading) return;

    console.log('[ThemeProvider] Aplicando tema:', settings.theme);
    
    const root = document.documentElement;
    
    // Limpar classes existentes
    root.classList.remove('dark', 'light');
    
    // Aplicar novo tema
    if (settings.theme === 'system') {
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (systemPrefersDark) {
        root.classList.add('dark');
      } else {
        root.classList.add('light');
      }
    } else {
      root.classList.add(settings.theme);
    }
    
    // Aplicar animações
    if (!settings.animationsEnabled) {
      root.classList.add('no-animations');
    } else {
      root.classList.remove('no-animations');
    }
    
    console.log('[ThemeProvider] Tema aplicado. Classes atuais:', root.className);
  }, [settings, isLoading]);

  // Listener para mudanças do sistema
  useEffect(() => {
    if (settings.theme !== 'system') return;
    
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      const root = document.documentElement;
      root.classList.remove('dark', 'light');
      if (mediaQuery.matches) {
        root.classList.add('dark');
      } else {
        root.classList.add('light');
      }
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [settings.theme]);

  return <>{children}</>;
};
