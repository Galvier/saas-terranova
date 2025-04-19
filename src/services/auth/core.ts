
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';
import { formatCrudResult } from '@/integrations/supabase/helpers';

export interface AuthSession {
  user: User | null;
  session: Session | null;
}

export const authCore = {
  getSession: async (): Promise<AuthSession> => {
    try {
      console.log('[AuthCore] Verificando sessão ativa');
      const { data } = await supabase.auth.getSession();
      
      console.log('[AuthCore] Sessão encontrada:', data.session ? 'Sim' : 'Não');
      
      return {
        session: data.session,
        user: data.session?.user || null
      };
    } catch (error) {
      console.error('[AuthCore] Erro ao verificar sessão:', error);
      return { session: null, user: null };
    }
  },

  onAuthStateChange: (callback: (event: string, session: Session | null) => void) => {
    console.log('[AuthCore] Configurando listener para mudanças de autenticação');
    
    return supabase.auth.onAuthStateChange((event, session) => {
      console.log('[AuthCore] Mudança no estado de autenticação:', event);
      callback(event, session);
    });
  },

  logout: async () => {
    try {
      console.log('[AuthCore] Iniciando processo de logout');
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('[AuthCore] Erro ao realizar logout:', error);
        return formatCrudResult(null, error);
      }
      
      console.log('[AuthCore] Logout realizado com sucesso');
      return formatCrudResult(null, null);
    } catch (error) {
      console.error('[AuthCore] Erro não tratado no logout:', error);
      return formatCrudResult(null, error);
    }
  }
};
