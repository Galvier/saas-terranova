
import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { BarChart3, ClipboardList, Home, LogOut, Settings, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import AppLogo from './AppLogo';
import { useAuth } from '@/hooks/useAuth';

type SidebarItem = {
  title: string;
  path: string;
  icon: React.ElementType;
};

const navItems: SidebarItem[] = [
  { title: 'Dashboard', path: '/dashboard', icon: Home },
  { title: 'Setores', path: '/departments', icon: ClipboardList },
  { title: 'Gestores', path: '/managers', icon: Users },
  { title: 'Métricas', path: '/metrics', icon: BarChart3 },
  { title: 'Configurações', path: '/settings', icon: Settings },
];

const AppSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user, manager, isAdmin, isLoading } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  
  // Format user display name from manager data, user metadata, or email
  const getUserDisplayName = () => {
    // First prioritize manager name if available
    if (manager && manager.name) {
      return manager.name;
    }
    
    if (!user) return '';
    
    // Then try display_name from user_metadata
    if (user.user_metadata && user.user_metadata.display_name) {
      return user.user_metadata.display_name;
    }
    
    // Then try other name fields from user_metadata
    if (user.user_metadata) {
      if (user.user_metadata.full_name) return user.user_metadata.full_name;
      if (user.user_metadata.name) return user.user_metadata.name;
    }
    
    // If no name in metadata, use email and extract the part before @
    if (user.email) {
      const namePart = user.email.split('@')[0];
      // Capitalize first letter of each word separated by dot, underscore, or hyphen
      return namePart
        .split(/[._-]/)
        .map(part => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ');
    }
    
    return 'Usuário';
  };

  // Get user role text
  const getUserRole = () => {
    if (manager && manager.role) {
      return manager.role === 'admin' ? 'Administrador' : 
             manager.role === 'manager' ? 'Gestor' : 'Visualizador';
    }
    return isAdmin ? 'Administrador' : 'Usuário';
  };
  
  const handleLogout = async () => {
    // Prevenir múltiplos cliques durante o logout
    if (isLoggingOut || isLoading) {
      console.log('[AppSidebar] Logout já em progresso ou carregando, ignorando tentativa');
      return;
    }

    try {
      setIsLoggingOut(true);
      console.log('[AppSidebar] Iniciando processo de logout');
      
      await logout();
      
      // Navegar para login após logout bem-sucedido
      console.log('[AppSidebar] Redirecionando para login');
      navigate('/login', { replace: true });
    } catch (error) {
      console.error('[AppSidebar] Erro ao fazer logout:', error);
      
      // Mesmo com erro, redirecionar para login para garantir que o usuário saia
      console.log('[AppSidebar] Redirecionando para login mesmo com erro');
      navigate('/login', { replace: true });
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <Sidebar className="border-r border-terranova-blue-light">
      <SidebarHeader className="border-b border-terranova-blue-light bg-white p-4">
        <AppLogo />
      </SidebarHeader>
      
      <SidebarContent className="bg-terranova-blue">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                
                return (
                  <SidebarMenuItem key={item.path}>
                    <SidebarMenuButton asChild isActive={isActive}>
                      <Link
                        to={item.path}
                        className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                          isActive
                            ? 'bg-white text-terranova-blue'
                            : 'text-white hover:bg-terranova-blue-light hover:text-white'
                        }`}
                      >
                        <item.icon className="h-5 w-5" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter className="bg-terranova-blue border-t border-terranova-blue-light p-4">
        <div className="mb-4">
          <div className="text-sm font-medium text-white">{getUserDisplayName()}</div>
          <div className="text-xs text-gray-300">{getUserRole()}</div>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="w-full flex items-center gap-2 bg-white hover:bg-gray-100 text-terranova-blue"
          onClick={handleLogout}
          disabled={isLoggingOut || isLoading}
        >
          <LogOut className={`h-4 w-4 ${isLoggingOut ? 'animate-spin' : ''}`} />
          {isLoggingOut ? 'Saindo...' : 'Sair'}
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;
