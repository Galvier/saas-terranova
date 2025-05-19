
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';
import { formatCrudResult } from '@/integrations/supabase';
import { createLog } from '@/services/logService';

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
      
      // Criar log antes do logout para ter acesso ao usuário atual
      try {
        const session = await supabase.auth.getSession();
        if (session.data?.session?.user) {
          await createLog('info', 'Iniciando logout', { 
            user_id: session.data.session.user.id,
            email: session.data.session.user.email,
            timestamp: new Date().toISOString() 
          }, session.data.session.user.id);
        }
      } catch (logError) {
        console.warn('[AuthCore] Erro ao criar log de logout:', logError);
      }
      
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('[AuthCore] Erro ao realizar logout:', error);
        
        await createLog('error', 'Erro no logout', { 
          error: error.message,
          timestamp: new Date().toISOString() 
        });
        
        return formatCrudResult(null, error);
      }
      
      console.log('[AuthCore] Logout realizado com sucesso');
      
      await createLog('info', 'Logout bem-sucedido', { 
        timestamp: new Date().toISOString() 
      });
      
      return formatCrudResult(null, null);
    } catch (error) {
      console.error('[AuthCore] Erro não tratado no logout:', error);
      
      await createLog('error', 'Erro não tratado no logout', { 
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString() 
      });
      
      return formatCrudResult(null, error);
    }
  }
};
