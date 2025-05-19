
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Settings2, Bell, Database } from 'lucide-react';

interface SettingsSidebarProps {
  onTabChange: (tabId: string) => void;
  activeTab: string;
}

const SettingsSidebar = ({ onTabChange, activeTab }: SettingsSidebarProps) => {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="space-y-1">
          <h3 className="text-sm font-medium">Categorias</h3>
          <Separator className="my-2" />
          <div className="space-y-1 py-2">
            <Button 
              variant={activeTab === 'interface' ? 'secondary' : 'ghost'} 
              className="w-full justify-start gap-2" 
              size="sm"
              onClick={() => onTabChange('interface')}
            >
              <Settings2 className="h-4 w-4" />
              <span>Interface</span>
            </Button>
            <Button 
              variant={activeTab === 'notifications' ? 'secondary' : 'ghost'} 
              className="w-full justify-start gap-2" 
              size="sm"
              onClick={() => onTabChange('notifications')}
            >
              <Bell className="h-4 w-4" />
              <span>Notificações</span>
            </Button>
            <Button 
              variant={activeTab === 'system' ? 'secondary' : 'ghost'} 
              className="w-full justify-start gap-2" 
              size="sm"
              onClick={() => onTabChange('system')}
            >
              <Database className="h-4 w-4" />
              <span>Sistema</span>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SettingsSidebar;
