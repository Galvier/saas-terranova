
import { User } from '@supabase/supabase-js';

export const authRoles = {
  isAdmin: (user: User | null): boolean => {
    if (!user) return false;
    const isAdmin = user.user_metadata?.role === 'admin';
    console.log('[AuthRoles] Verificação de admin para usuário:', user.id, 'Resultado:', isAdmin);
    return isAdmin;
  }
};
