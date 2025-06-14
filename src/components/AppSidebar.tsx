
import React from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  Home,
  BarChart3,
  Building2,
  Users,
  Settings,
  Bell,
} from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import AppLogo from "@/components/AppLogo";

export function AppSidebar() {
  const { user, manager, logout } = useAuth();
  const navigate = useNavigate();

  const navigation = [
    {
      title: "Dashboard",
      url: "/",
      icon: Home,
    },
    {
      title: "Métricas",
      url: "/metrics",
      icon: BarChart3,
    },
    {
      title: "Departamentos",
      url: "/departments",
      icon: Building2,
    },
    {
      title: "Gestores",
      url: "/managers",
      icon: Users,
    },
    {
      title: "Notificações",
      url: "/notifications",
      icon: Bell,
    },
    {
      title: "Configurações",
      url: "/settings",
      icon: Settings,
    },
  ];

  const handleSignOut = async () => {
    await logout();
    navigate('/login');
  };

  // Função melhorada para obter o nome de exibição
  const getDisplayName = () => {
    // Ordem de prioridade: display_name > name > full_name > manager name > fallback
    if (user?.user_metadata?.display_name) {
      return user.user_metadata.display_name;
    }
    if (user?.user_metadata?.name) {
      return user.user_metadata.name;
    }
    if (user?.user_metadata?.full_name) {
      return user.user_metadata.full_name;
    }
    if (manager?.name) {
      return manager.name;
    }
    return "Usuário";
  };

  // Verificar se está no tema dark
  const isDarkTheme = document.documentElement.classList.contains('dark');
  
  // Selecionar logo baseado no tema
  const logoSrc = isDarkTheme 
    ? "/lovable-uploads/3efaf253-28c6-44f9-b580-bf1291deca16.png" // Logo para tema escuro
    : "/lovable-uploads/28956acd-6e94-4125-8e46-702bdeef77b5.png"; // Logo para tema claro

  const displayName = getDisplayName();

  console.log('[AppSidebar] Renderizando com dados:', {
    displayName,
    isDarkTheme,
    logoSrc,
    userMetadata: user?.user_metadata,
    managerName: manager?.name
  });

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            {/* Logo da Terranova */}
            <div className="p-4 border-b">
              <AppLogo />
            </div>
            
            <div className="py-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="justify-start px-2 w-full font-normal">
                    <div className="mr-2 h-8 w-8 rounded-full bg-terranova-blue flex items-center justify-center overflow-hidden">
                      <img 
                        src={logoSrc}
                        alt="Logo"
                        className="h-6 w-6 object-contain"
                        onError={(e) => {
                          // Fallback para iniciais se a imagem falhar
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.parentElement!.innerHTML = '<span class="text-white text-xs font-semibold">A2</span>';
                        }}
                      />
                    </div>
                    <div className="flex flex-col text-left">
                      <span className="font-semibold text-sm">{displayName}</span>
                      <span className="text-muted-foreground text-xs">{user?.email}</span>
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  <DropdownMenuLabel>Minha conta</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}>Sair</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <SidebarMenu>
              {navigation.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      className={({ isActive }) =>
                        `flex items-center gap-2 rounded-md px-2 py-1.5 text-sm font-medium transition-colors hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1 ${isActive ? "bg-secondary" : ""}`
                      }
                    >
                      <item.icon className="h-4 w-4" />
                      {item.title}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
