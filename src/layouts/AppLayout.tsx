
import React, { useState, useEffect } from 'react';
import AppSidebar from '@/components/AppSidebar';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

const AppLayout = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(true); // Simulação de autenticação
  const location = useLocation();
  const navigate = useNavigate();
  
  // Verificar autenticação (simulação)
  useEffect(() => {
    // Em uma implementação real, verificaria o token de autenticação
    const checkAuth = () => {
      // Simulação: usuário autenticado
      const hasToken = localStorage.getItem('auth_token');
      setIsAuthenticated(!!hasToken);
      
      if (!hasToken) {
        navigate('/login');
      }
    };
    
    checkAuth();
  }, [navigate]);
  
  // Simular carregamento ao mudar de página
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 400);
    
    return () => clearTimeout(timer);
  }, [location.pathname]);
  
  return (
    <div className="flex h-screen">
      <AppSidebar />
      <main className="flex-1 overflow-auto p-6 relative">
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-50 transition-opacity duration-300">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
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
