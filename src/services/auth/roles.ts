
import { User } from '@supabase/supabase-js';

export const authRoles = {
  isAdmin: (user: User | null): boolean => {
    if (!user) return false;
    
    // Verificação explícita se o papel é 'admin'
    const isAdmin = user.user_metadata?.role === 'admin';
    console.log('[AuthRoles] Verificação de admin para usuário:', user.id, 'Papel:', user.user_metadata?.role, 'Resultado:', isAdmin);
    
    // Garantir que retorne false para qualquer outro papel que não seja explicitamente 'admin'
    return isAdmin === true;
  },
  
  // Adicionar função para verificar papel de gestor
  isManager: (user: User | null): boolean => {
    if (!user) return false;
    
    // Verificar se o papel é 'manager' ou 'gestor'
    const isManager = user.user_metadata?.role === 'manager' || user.user_metadata?.role === 'gestor';
    console.log('[AuthRoles] Verificação de manager para usuário:', user.id, 'Papel:', user.user_metadata?.role, 'Resultado:', isManager);
    
    return isManager === true;
  }
};
