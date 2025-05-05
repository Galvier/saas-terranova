
import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import AppSidebar from '@/components/AppSidebar';

const AppLayout = () => {
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();
  
  // Simulate loading when changing routes
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 400);
    
    return () => clearTimeout(timer);
  }, [location.pathname]);
  
  // Always show content regardless of authentication status
  return (
    <div className="flex h-screen">
      <AppSidebar />
      <main className="flex-1 overflow-auto p-6 relative">
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-50 transition-opacity duration-300">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="h-10 w-10 animate-spin text-terranova-blue" />
              <span className="text-sm text-muted-foreground animate-pulse">Carregando...</span>
            </div>
          </div>
        ) : (
          <div className="animate-fade-in">
            <Outlet />
          </div>
        )}
      </main>
    </div>
  );
};

export default AppLayout;
