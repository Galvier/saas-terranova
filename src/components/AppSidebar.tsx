
import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { BarChart3, ClipboardList, Home, LogOut, Settings, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AppLogo from './AppLogo';
import { useAuth } from '@/hooks/useAuth';

type SidebarItem = {
  title: string;
  path: string;
  icon: React.ElementType;
};

const navItems: SidebarItem[] = [
  { title: 'Dashboard', path: '/dashboard', icon: Home },
  { title: 'Departamentos', path: '/departments', icon: ClipboardList },
  { title: 'Gestores', path: '/managers', icon: Users },
  { title: 'Métricas', path: '/metrics', icon: BarChart3 },
  { title: 'Configurações', path: '/settings', icon: Settings },
];

const AppSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user, isAdmin } = useAuth();
  
  // Format user display name from user metadata or email
  const getUserDisplayName = () => {
    if (!user) return '';
    
    // First try to get display name from user_metadata
    if (user.user_metadata && user.user_metadata.display_name) {
      return user.user_metadata.display_name;
    }
    
    // Then try to get name from user_metadata
    if (user.user_metadata && (user.user_metadata.name || user.user_metadata.full_name)) {
      return user.user_metadata.name || user.user_metadata.full_name;
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
    return isAdmin ? 'Administrador' : 'Gestor';
  };
  
  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      // Redirect to login even if there's an error
      navigate('/login');
    }
  };

  return (
    <div className="h-screen w-64 flex flex-col bg-terranova-blue text-white border-r border-terranova-blue-light">
      <div className="p-4 border-b border-terranova-blue-light bg-white">
        <AppLogo />
      </div>
      
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            
            return (
              <li key={item.path}>
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
              </li>
            );
          })}
        </ul>
      </nav>
      
      <div className="p-4 border-t border-terranova-blue-light mt-auto">
        <div className="mb-4">
          <div className="text-sm font-medium">{getUserDisplayName()}</div>
          <div className="text-xs text-gray-300">{getUserRole()}</div>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="w-full flex items-center gap-2 bg-white hover:bg-gray-100 text-terranova-blue"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4" />
          Sair
        </Button>
      </div>
    </div>
  );
};

export default AppSidebar;
