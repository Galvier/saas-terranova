
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, User, Settings2, Bell, Database } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import { useUserSettings } from '@/hooks/useUserSettings';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';

// Import refactored components
import SettingsSidebar from '@/components/settings/SettingsSidebar';
import ProfileTab from '@/components/settings/tabs/ProfileTab';
import InterfaceTab from '@/components/settings/tabs/InterfaceTab';
import NotificationsTab from '@/components/settings/tabs/NotificationsTab';
import BackupTab from '@/components/settings/tabs/BackupTab';

const Settings = () => {
  const { toast } = useToast();
  const { settings, isLoading: isSettingsLoading, isSaving, updateSettings } = useUserSettings();
  const { isLoading: isAuthLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const isMobile = useIsMobile();
  
  // Handle tab changes from sidebar
  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
  };
  
  // Handle saving interface settings
  const handleSaveInterfaceSettings = async () => {
    try {
      await updateSettings({
        theme: settings.theme,
        animationsEnabled: settings.animationsEnabled
      });
      
      toast({
        title: "Configurações salvas",
        description: "Suas preferências de interface foram atualizadas"
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao salvar configurações de interface",
        variant: "destructive"
      });
    }
  };
  
  // Handle saving notification settings
  const handleSaveNotificationSettings = async () => {
    try {
      await updateSettings({
        notificationPreferences: settings.notificationPreferences
      });
      
      toast({
        title: "Configurações salvas",
        description: "Suas preferências de notificação foram atualizadas"
      });
    } catch (error) {
      toast({
        title: "Erro", 
        description: "Erro ao salvar configurações de notificação",
        variant: "destructive"
      });
    }
  };

  // Show loading state while settings are being fetched
  if (isSettingsLoading || isAuthLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-lg font-medium">Carregando configurações...</span>
      </div>
    );
  }
  
  return (
    <div className="animate-fade-in space-y-4 md:space-y-6 w-full min-w-0">
      <PageHeader 
        title="Configurações do Sistema" 
        subtitle="Personalize suas preferências e configurações do sistema" 
      />
      
      {isMobile ? (
        // Mobile: apenas tabs horizontais
        <div className="w-full min-w-0">
          <Tabs defaultValue={activeTab} value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="mb-4 w-full grid grid-cols-2 h-auto p-1">
              <TabsTrigger value="profile" className="flex items-center gap-1 py-2 px-2 text-xs">
                <User className="h-3 w-3" />
                <span className="hidden xs:inline">Perfil</span>
              </TabsTrigger>
              <TabsTrigger value="interface" className="flex items-center gap-1 py-2 px-2 text-xs">
                <Settings2 className="h-3 w-3" />
                <span className="hidden xs:inline">Interface</span>
              </TabsTrigger>
              <TabsTrigger value="notifications" className="flex items-center gap-1 py-2 px-2 text-xs">
                <Bell className="h-3 w-3" />
                <span className="hidden xs:inline">Notificações</span>
              </TabsTrigger>
              <TabsTrigger value="system" className="flex items-center gap-1 py-2 px-2 text-xs">
                <Database className="h-3 w-3" />
                <span className="hidden xs:inline">Sistema</span>
              </TabsTrigger>
            </TabsList>
            
            <div className="w-full min-w-0">
              <TabsContent value="profile" className="mt-0">
                <ProfileTab />
              </TabsContent>
              
              <TabsContent value="interface" className="mt-0">
                <InterfaceTab 
                  settings={settings} 
                  isSaving={isSaving} 
                  onSave={handleSaveInterfaceSettings}
                  onUpdateSettings={updateSettings}
                />
              </TabsContent>
              
              <TabsContent value="notifications" className="mt-0">
                <NotificationsTab 
                  settings={settings} 
                  isLoading={isSaving}
                  onUpdateSettings={updateSettings}
                />
              </TabsContent>
              
              <TabsContent value="system" className="mt-0">
                <BackupTab />
              </TabsContent>
            </div>
          </Tabs>
        </div>
      ) : (
        // Desktop: sidebar + tabs
        <div className="flex flex-col md:flex-row gap-6">
          <div className="w-full md:w-[240px] shrink-0">
            <SettingsSidebar 
              onTabChange={handleTabChange} 
              activeTab={activeTab}
            />
          </div>
          
          <div className="flex-1 min-w-0">
            <Tabs defaultValue={activeTab} value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="mb-6 w-full overflow-x-auto justify-start">
                <TabsTrigger value="profile" id="profile-tab">Perfil</TabsTrigger>
                <TabsTrigger value="interface" id="interface-tab">Interface</TabsTrigger>
                <TabsTrigger value="notifications" id="notifications-tab">Notificações</TabsTrigger>
                <TabsTrigger value="system" id="system-tab">Sistema</TabsTrigger>
              </TabsList>
              
              <TabsContent value="profile">
                <ProfileTab />
              </TabsContent>
              
              <TabsContent value="interface">
                <InterfaceTab 
                  settings={settings} 
                  isSaving={isSaving} 
                  onSave={handleSaveInterfaceSettings}
                  onUpdateSettings={updateSettings}
                />
              </TabsContent>
              
              <TabsContent value="notifications">
                <NotificationsTab 
                  settings={settings} 
                  isLoading={isSaving}
                  onUpdateSettings={updateSettings}
                />
              </TabsContent>
              
              <TabsContent value="system">
                <BackupTab />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
