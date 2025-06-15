
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, User, Settings2, Bell, Database } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import { useUserSettings } from '@/hooks/useUserSettings';
import { usePendingSettings } from '@/hooks/usePendingSettings';
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
  const { settings, isLoading: isSettingsLoading, isSaving, applyLocalChanges, saveToDatabase } = useUserSettings();
  const { isLoading: isAuthLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const isMobile = useIsMobile();
  
  // Gerenciar mudanças pendentes
  const {
    pendingSettings,
    pendingChanges,
    updatePendingSettings,
    clearPendingChanges,
    resetPendingSettings
  } = usePendingSettings(settings);

  // Sincronizar settings com pendingSettings quando settings mudam
  React.useEffect(() => {
    if (!pendingChanges.hasChanges) {
      resetPendingSettings(settings);
    }
  }, [settings, pendingChanges.hasChanges, resetPendingSettings]);
  
  // Handle tab changes from sidebar
  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
  };
  
  // Handle updating pending settings (aplicar localmente para preview)
  const handleUpdatePendingSettings = (newSettings: Partial<typeof settings>) => {
    updatePendingSettings(newSettings);
    applyLocalChanges(newSettings);
  };
  
  // Handle saving interface settings
  const handleSaveInterfaceSettings = async () => {
    try {
      await saveToDatabase(pendingSettings);
      clearPendingChanges();
    } catch (error) {
      // Error handling is done in saveToDatabase
    }
  };
  
  // Handle saving notification settings
  const handleSaveNotificationSettings = async () => {
    try {
      await saveToDatabase(pendingSettings);
      clearPendingChanges();
    } catch (error) {
      // Error handling is done in saveToDatabase
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
    <div className="animate-fade-in space-y-4 md:space-y-6 w-full min-w-0 max-w-full overflow-x-hidden">
      <PageHeader 
        title="Configurações do Sistema" 
        subtitle="Personalize suas preferências e configurações do sistema" 
      />
      
      {isMobile ? (
        // Mobile: tabs responsivas em grid 2x2
        <div className="w-full min-w-0 max-w-full">
          <Tabs defaultValue={activeTab} value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="mb-4 w-full grid grid-cols-2 gap-1 h-auto p-1 bg-muted rounded-md">
              <TabsTrigger 
                value="profile" 
                className="flex flex-col items-center gap-1 py-3 px-2 text-xs rounded-sm min-h-[60px] data-[state=active]:bg-background"
              >
                <User className="h-4 w-4" />
                <span>Perfil</span>
              </TabsTrigger>
              <TabsTrigger 
                value="interface" 
                className="flex flex-col items-center gap-1 py-3 px-2 text-xs rounded-sm min-h-[60px] data-[state=active]:bg-background"
              >
                <Settings2 className="h-4 w-4" />
                <span>Interface</span>
              </TabsTrigger>
              <TabsTrigger 
                value="notifications" 
                className="flex flex-col items-center gap-1 py-3 px-2 text-xs rounded-sm min-h-[60px] data-[state=active]:bg-background"
              >
                <Bell className="h-4 w-4" />
                <span>Notificações</span>
              </TabsTrigger>
              <TabsTrigger 
                value="system" 
                className="flex flex-col items-center gap-1 py-3 px-2 text-xs rounded-sm min-h-[60px] data-[state=active]:bg-background"
              >
                <Database className="h-4 w-4" />
                <span>Sistema</span>
              </TabsTrigger>
            </TabsList>
            
            <div className="w-full min-w-0 max-w-full">
              <TabsContent value="profile" className="mt-0">
                <ProfileTab />
              </TabsContent>
              
              <TabsContent value="interface" className="mt-0">
                <InterfaceTab 
                  settings={pendingSettings} 
                  isSaving={isSaving} 
                  hasChanges={pendingChanges.hasChanges}
                  onSave={handleSaveInterfaceSettings}
                  onUpdateSettings={handleUpdatePendingSettings}
                />
              </TabsContent>
              
              <TabsContent value="notifications" className="mt-0">
                <NotificationsTab 
                  settings={pendingSettings} 
                  isLoading={isSaving}
                  hasChanges={pendingChanges.hasChanges}
                  onSave={handleSaveNotificationSettings}
                  onUpdateSettings={handleUpdatePendingSettings}
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
                  settings={pendingSettings} 
                  isSaving={isSaving} 
                  hasChanges={pendingChanges.hasChanges}
                  onSave={handleSaveInterfaceSettings}
                  onUpdateSettings={handleUpdatePendingSettings}
                />
              </TabsContent>
              
              <TabsContent value="notifications">
                <NotificationsTab 
                  settings={pendingSettings} 
                  isLoading={isSaving}
                  hasChanges={pendingChanges.hasChanges}
                  onSave={handleSaveNotificationSettings}
                  onUpdateSettings={handleUpdatePendingSettings}
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
