import React from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useIsMobile } from "@/hooks/use-mobile";
import { useIsTablet } from "@/hooks/use-tablet";

export function AppSidebar() {
  const { user, manager, logout } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();
  const { setOpenMobile } = useSidebar();
  const [avatarSrc, setAvatarSrc] = React.useState("/lovable-uploads/28956acd-6e94-4125-8e46-702bdeef77b5.png");

  // Observar mudanças no tema para trocar o avatar
  React.useEffect(() => {
    const observer = new MutationObserver(() => {
      const isDark = document.documentElement.classList.contains('dark');
      setAvatarSrc(
        isDark
          ? "/lovable-uploads/3efaf253-28c6-44f9-b580-bf1291deca16.png" // Logo para tema escuro
          : "/lovable-uploads/28956acd-6e94-4125-8e46-702bdeef77b5.png"  // Logo para tema claro
      );
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });
    
    // Set initial value
    const isDark = document.documentElement.classList.contains('dark');
    setAvatarSrc(
      isDark
        ? "/lovable-uploads/3efaf253-28c6-44f9-b580-bf1291deca16.png"
        : "/lovable-uploads/28956acd-6e94-4125-8e46-702bdeef77b5.png"
    );

    return () => observer.disconnect();
  }, []);

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

  const handleNavigation = (url: string) => {
    // Fechar sidebar em mobile após navegação
    if (isMobile) {
      setOpenMobile(false);
    }
    navigate(url);
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

  // Função para obter as iniciais do nome
  const getNameInitials = () => {
    const displayName = getDisplayName();
    if (!displayName || displayName === "Usuário") {
      return "U";
    }
    const names = displayName.split(' ').filter(Boolean);
    if (names.length >= 2) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    if (names.length === 1) {
      return names[0].substring(0, 2).toUpperCase();
    }
    return "U";
  };

  const displayName = getDisplayName();
  const nameInitials = getNameInitials();

  console.log('[AppSidebar] Renderizando com dados:', {
    displayName,
    avatarSrc,
    nameInitials,
    userMetadata: user?.user_metadata,
    managerName: manager?.name
  });

  return (
    <Sidebar>
      <SidebarContent className="safe-area-inset">
        <SidebarGroup>
          <SidebarGroupContent>
            {/* Logo da Terranova */}
            <div className={`border-b ${isTablet ? 'p-5' : 'p-4'}`}>
              <AppLogo />
            </div>
            
            <div className={isTablet ? 'py-5' : 'py-4'}>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className={`justify-start w-full font-normal transition-colors hover:bg-sidebar-accent ${
                    isTablet ? 'px-3 py-4 h-auto' : 'px-2 h-auto py-3'
                  }`}>
                    <Avatar className={`flex-shrink-0 ${
                      isTablet ? 'mr-4 h-12 w-12' : 'mr-3 h-10 w-10'
                    }`}>
                      <AvatarImage 
                        src={avatarSrc} 
                        alt={displayName}
                        className="object-contain"
                      />
                      <AvatarFallback className={`font-semibold ${
                        isTablet ? 'text-base' : 'text-sm'
                      }`}>{nameInitials}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col text-left min-w-0 flex-1">
                      <span className={`font-semibold truncate leading-tight ${
                        isTablet ? 'text-base' : 'text-sm'
                      }`}>{displayName}</span>
                      <span className={`text-muted-foreground truncate leading-tight mt-0.5 ${
                        isTablet ? 'text-sm' : 'text-xs'
                      }`}>{user?.email}</span>
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-56">
                  <DropdownMenuLabel>Minha conta</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="text-red-600 focus:text-red-600">
                    Sair
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <SidebarMenu className={isTablet ? 'px-3' : 'px-2'}>
              {navigation.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild className={`transition-all hover:bg-sidebar-accent focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1 ${
                    isTablet ? 'h-14 text-base' : 'h-12 text-base'
                  }`}>
                    <NavLink
                      to={item.url}
                      onClick={(e) => {
                        e.preventDefault();
                        handleNavigation(item.url);
                      }}
                      className={({ isActive }) =>
                        `flex items-center rounded-lg font-medium ${
                          isTablet ? 'gap-4 px-4 py-4' : 'gap-3 px-3 py-3'
                        } text-sm ${isActive ? "bg-sidebar-accent text-sidebar-accent-foreground" : ""}`
                      }
                    >
                      <item.icon className={isTablet ? 'h-6 w-6' : 'h-5 w-5'} />
                      <span className="truncate">{item.title}</span>
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
