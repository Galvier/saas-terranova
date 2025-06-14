
import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import NotificationsDropdown from '@/components/notifications/NotificationsDropdown';
import AuthGuard from '@/components/auth/AuthGuard';
import { useIsMobile } from '@/hooks/use-mobile';

const AppLayout = () => {
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();
  const isMobile = useIsMobile();
  
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 400);
    
    return () => clearTimeout(timer);
  }, [location.pathname]);
  
  return (
    <AuthGuard>
      <SidebarProvider defaultOpen={!isMobile}>
        <div className="min-h-screen flex w-full">
          <AppSidebar />
          <SidebarInset className="flex-1">
            <header className="flex h-14 md:h-16 shrink-0 items-center justify-between gap-2 px-4 md:px-6 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40">
              <div className="flex items-center gap-2">
                <SidebarTrigger className="-ml-1 h-10 w-10 md:h-8 md:w-8" />
                <div className="md:hidden">
                  <h1 className="text-lg font-semibold text-foreground">Terranova</h1>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <NotificationsDropdown />
              </div>
            </header>
            <main className="flex-1 overflow-auto p-3 md:p-6 lg:p-8 relative safe-area-inset">
              {isLoading ? (
                <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-50 transition-opacity duration-300">
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 className="h-8 w-8 md:h-10 md:w-10 animate-spin text-terranova-blue" />
                    <span className="text-sm md:text-base text-muted-foreground animate-pulse">Carregando...</span>
                  </div>
                </div>
              ) : (
                <div className="animate-fade-in">
                  <Outlet />
                </div>
              )}
            </main>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </AuthGuard>
  );
};

export default AppLayout;
