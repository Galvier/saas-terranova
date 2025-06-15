
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { User, Settings2, Bell, Database } from 'lucide-react';
import { useIsTablet } from '@/hooks/use-tablet';

interface SettingsSidebarProps {
  onTabChange: (tabId: string) => void;
  activeTab: string;
}

const SettingsSidebar = ({ onTabChange, activeTab }: SettingsSidebarProps) => {
  const isTablet = useIsTablet();

  return (
    <Card>
      <CardContent className={isTablet ? 'p-3' : 'p-4'}>
        <div className="space-y-1">
          <h3 className={`font-medium ${isTablet ? 'text-sm' : 'text-sm'}`}>Categorias</h3>
          <Separator className="my-2" />
          <div className={`space-y-1 ${isTablet ? 'py-1' : 'py-2'}`}>
            <Button 
              variant={activeTab === 'profile' ? 'secondary' : 'ghost'} 
              className={`w-full justify-start ${isTablet ? 'gap-3 text-sm' : 'gap-2'}`}
              size={isTablet ? 'default' : 'sm'}
              onClick={() => onTabChange('profile')}
            >
              <User className={isTablet ? 'h-5 w-5' : 'h-4 w-4'} />
              <span>Perfil</span>
            </Button>
            <Button 
              variant={activeTab === 'interface' ? 'secondary' : 'ghost'} 
              className={`w-full justify-start ${isTablet ? 'gap-3 text-sm' : 'gap-2'}`}
              size={isTablet ? 'default' : 'sm'}
              onClick={() => onTabChange('interface')}
            >
              <Settings2 className={isTablet ? 'h-5 w-5' : 'h-4 w-4'} />
              <span>Interface</span>
            </Button>
            <Button 
              variant={activeTab === 'notifications' ? 'secondary' : 'ghost'} 
              className={`w-full justify-start ${isTablet ? 'gap-3 text-sm' : 'gap-2'}`}
              size={isTablet ? 'default' : 'sm'}
              onClick={() => onTabChange('notifications')}
            >
              <Bell className={isTablet ? 'h-5 w-5' : 'h-4 w-4'} />
              <span>Notificações</span>
            </Button>
            <Button 
              variant={activeTab === 'system' ? 'secondary' : 'ghost'} 
              className={`w-full justify-start ${isTablet ? 'gap-3 text-sm' : 'gap-2'}`}
              size={isTablet ? 'default' : 'sm'}
              onClick={() => onTabChange('system')}
            >
              <Database className={isTablet ? 'h-5 w-5' : 'h-4 w-4'} />
              <span>Sistema</span>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SettingsSidebar;
