
import React, { useState, useEffect } from 'react';
import AppSidebar from '@/components/AppSidebar';
import { Outlet, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

const AppLayout = () => {
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();
  
  // Simular carregamento ao mudar de página
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 300);
    
    return () => clearTimeout(timer);
  }, [location.pathname]);
  
  return (
    <div className="flex h-screen">
      <AppSidebar />
      <main className="flex-1 overflow-auto p-6 relative">
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-50">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <Outlet />
        )}
      </main>
    </div>
  );
};

export default AppLayout;
