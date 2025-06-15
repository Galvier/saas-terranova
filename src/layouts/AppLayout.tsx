
import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import NotificationsDropdown from '@/components/notifications/NotificationsDropdown';
import AuthGuard from '@/components/auth/AuthGuard';
import { useIsMobile } from '@/hooks/use-mobile';
import { useIsTablet } from '@/hooks/use-tablet';

const AppLayout = () => {
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();
  
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
        <div className="min-h-screen flex w-full overflow-x-hidden">
          <AppSidebar />
          <SidebarInset className="flex-1 w-full min-w-0 max-w-full">
            <header className={`flex shrink-0 items-center justify-between gap-2 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40 ${
              isTablet ? 'h-16 px-4' : 'h-14 md:h-16 px-3 md:px-6'
            }`}>
              <div className="flex items-center gap-2 min-w-0">
                <SidebarTrigger className={`flex-shrink-0 ${
                  isTablet ? 'h-10 w-10' : '-ml-1 h-10 w-10 md:h-8 md:w-8'
                }`} />
                <div className={`truncate ${isTablet ? 'block' : 'md:hidden'}`}>
                  <h1 className={`font-semibold text-foreground ${
                    isTablet ? 'text-xl' : 'text-lg'
                  }`}>Terranova</h1>
                </div>
              </div>
              
              <div className="flex items-center gap-2 flex-shrink-0">
                <NotificationsDropdown />
              </div>
            </header>
            <main className={`flex-1 overflow-auto relative safe-area-inset w-full min-w-0 max-w-full ${
              isTablet ? 'p-4 lg:p-8' : 'p-2 md:p-6 lg:p-8'
            }`}>
              {isLoading ? (
                <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-50 transition-opacity duration-300">
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 className={`animate-spin text-terranova-blue ${
                      isTablet ? 'h-10 w-10' : 'h-8 w-8 md:h-10 md:w-10'
                    }`} />
                    <span className={`text-muted-foreground animate-pulse ${
                      isTablet ? 'text-base' : 'text-sm md:text-base'
                    }`}>Carregando...</span>
                  </div>
                </div>
              ) : (
                <div className="animate-fade-in w-full min-w-0 max-w-full">
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
