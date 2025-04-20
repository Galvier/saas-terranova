
import React from 'react';
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
  const { logout } = useAuth();
  
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
    <div className="h-screen w-64 flex flex-col bg-sidebar border-r border-border">
      <div className="p-4 border-b border-border">
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
                      ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                      : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
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
      
      <div className="p-4 border-t border-border mt-auto">
        <div className="mb-4">
          <div className="text-sm font-medium">Maria Silva</div>
          <div className="text-xs text-muted-foreground">Administradora</div>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="w-full flex items-center gap-2"
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
