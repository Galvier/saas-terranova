
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2 } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import { useUserSettings } from '@/hooks/useUserSettings';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

// Import refactored components
import SettingsSidebar from '@/components/settings/SettingsSidebar';
import InterfaceTab from '@/components/settings/tabs/InterfaceTab';
import NotificationsTab from '@/components/settings/tabs/NotificationsTab';
import BackupTab from '@/components/settings/tabs/BackupTab';

const Settings = () => {
  const { toast } = useToast();
  const { settings, isLoading: isSettingsLoading, isSaving, updateSettings } = useUserSettings();
  const { isLoading: isAuthLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('interface');
  
  // Handle tab changes from sidebar
  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    // Find and click the tab trigger to ensure proper tab activation
    document.getElementById(`${tabId}-tab`)?.click();
  };
  
  // Handle saving interface settings
  const handleSaveInterfaceSettings = () => {
    updateSettings({
      theme: settings.theme,
      animationsEnabled: settings.animationsEnabled
    });
    
    toast({
      title: "Configurações salvas",
      description: "Suas preferências de interface foram atualizadas"
    });
  };
  
  // Handle saving notification settings
  const handleSaveNotificationSettings = () => {
    updateSettings({
      notificationPreferences: {
        email: settings.notificationPreferences.email,
        system: settings.notificationPreferences.system,
        alerts: settings.notificationPreferences.alerts
      }
    });
    
    toast({
      title: "Configurações salvas",
      description: "Suas preferências de notificação foram atualizadas"
    });
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
    <div className="animate-fade-in space-y-6">
      <PageHeader 
        title="Configurações do Sistema" 
        subtitle="Personalize suas preferências e configurações do sistema" 
      />
      
      <div className="flex flex-col md:flex-row gap-6">
        <div className="w-full md:w-[240px] shrink-0">
          <SettingsSidebar 
            onTabChange={handleTabChange} 
            activeTab={activeTab}
          />
        </div>
        
        <div className="flex-1">
          <Tabs defaultValue={activeTab} value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="mb-6 w-full overflow-x-auto justify-start">
              <TabsTrigger value="interface" id="interface-tab">Interface</TabsTrigger>
              <TabsTrigger value="notifications" id="notifications-tab">Notificações</TabsTrigger>
              <TabsTrigger value="system" id="system-tab">Sistema</TabsTrigger>
            </TabsList>
            
            {/* Interface Settings */}
            <TabsContent value="interface">
              <InterfaceTab 
                settings={settings} 
                isSaving={isSaving} 
                onSave={handleSaveInterfaceSettings}
                onUpdateSettings={updateSettings}
              />
            </TabsContent>
            
            {/* Notifications Settings */}
            <TabsContent value="notifications">
              <NotificationsTab 
                settings={settings} 
                isLoading={isSaving}
                onUpdateSettings={updateSettings}
              />
            </TabsContent>
            
            {/* System Settings */}
            <TabsContent value="system">
              <BackupTab />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Settings;
