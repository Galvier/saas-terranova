
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import SettingsSidebar from '@/components/settings/SettingsSidebar';
import ProfileTab from '@/components/settings/tabs/ProfileTab';
import NotificationsTab from '@/components/settings/tabs/NotificationsTab';
import InterfaceTab from '@/components/settings/tabs/InterfaceTab';
import IntegrationsTab from '@/components/settings/tabs/IntegrationsTab';
import BackupTab from '@/components/settings/tabs/BackupTab';
import PageHeader from '@/components/PageHeader';
import { useIsMobile } from '@/hooks/use-mobile';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <div className="animate-fade-in mobile-container">
        <PageHeader 
          title="Configurações" 
          subtitle="Gerencie suas preferências e configurações do sistema"
        />
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5 mb-6">
            <TabsTrigger value="profile" className="mobile-text">Perfil</TabsTrigger>
            <TabsTrigger value="notifications" className="mobile-text">Notificações</TabsTrigger>
            <TabsTrigger value="interface" className="mobile-text hidden sm:block">Interface</TabsTrigger>
            <TabsTrigger value="integrations" className="mobile-text hidden sm:block">Integrações</TabsTrigger>
            <TabsTrigger value="backup" className="mobile-text hidden sm:block">Backup</TabsTrigger>
          </TabsList>
          
          <div className="mobile-card">
            <TabsContent value="profile" className="mt-0">
              <ProfileTab />
            </TabsContent>
            
            <TabsContent value="notifications" className="mt-0">
              <NotificationsTab />
            </TabsContent>
            
            <TabsContent value="interface" className="mt-0">
              <InterfaceTab />
            </TabsContent>
            
            <TabsContent value="integrations" className="mt-0">
              <IntegrationsTab />
            </TabsContent>
            
            <TabsContent value="backup" className="mt-0">
              <BackupTab />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <PageHeader 
        title="Configurações" 
        subtitle="Gerencie suas preferências e configurações do sistema"
      />
      
      <div className="flex gap-6">
        <div className="w-64 flex-shrink-0">
          <SettingsSidebar activeTab={activeTab} onTabChange={setActiveTab} />
        </div>
        
        <div className="flex-1 min-w-0">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsContent value="profile">
              <ProfileTab />
            </TabsContent>
            
            <TabsContent value="notifications">
              <NotificationsTab />
            </TabsContent>
            
            <TabsContent value="interface">
              <InterfaceTab />
            </TabsContent>
            
            <TabsContent value="integrations">
              <IntegrationsTab />
            </TabsContent>
            
            <TabsContent value="backup">
              <BackupTab />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Settings;
