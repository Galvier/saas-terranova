
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
      
      // Verificar se existe uma sessão antes de tentar logout
      const { data: sessionData } = await supabase.auth.getSession();
      
      if (!sessionData.session) {
        console.log('[AuthCore] Nenhuma sessão ativa para fazer logout');
        
        await createLog('info', 'Tentativa de logout sem sessão ativa', { 
          timestamp: new Date().toISOString() 
        });
        
        return formatCrudResult(null, null);
      }
      
      // Criar log antes do logout para ter acesso ao usuário atual
      try {
        if (sessionData.session.user) {
          await createLog('info', 'Iniciando logout', { 
            user_id: sessionData.session.user.id,
            email: sessionData.session.user.email,
            timestamp: new Date().toISOString() 
          }, sessionData.session.user.id);
        }
      } catch (logError) {
        console.warn('[AuthCore] Erro ao criar log de logout:', logError);
      }
      
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('[AuthCore] Erro ao realizar logout:', error);
        
        // Tratar "Session not found" como sucesso
        if (error.message?.includes('Session not found') || 
            error.message?.includes('session_not_found')) {
          console.log('[AuthCore] Erro de sessão tratado como logout bem-sucedido');
          
          await createLog('info', 'Logout bem-sucedido (sessão já invalidada)', { 
            timestamp: new Date().toISOString() 
          });
          
          return formatCrudResult(null, null);
        }
        
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
      
      // Tratar erros de sessão como sucesso
      if (error instanceof Error && 
          (error.message?.includes('Session not found') || 
           error.message?.includes('Auth session missing'))) {
        console.log('[AuthCore] Erro de sessão tratado como logout bem-sucedido');
        
        await createLog('info', 'Logout bem-sucedido (erro de sessão tratado)', { 
          error: error.message,
          timestamp: new Date().toISOString() 
        });
        
        return formatCrudResult(null, null);
      }
      
      await createLog('error', 'Erro não tratado no logout', { 
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString() 
      });
      
      return formatCrudResult(null, error);
    }
  }
};
