
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function AppSidebar() {
  const { user, manager, logout } = useAuth();
  const navigate = useNavigate();
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
                    <Avatar className="mr-2 h-8 w-8 flex-shrink-0">
                      <AvatarImage 
                        src={avatarSrc} 
                        alt={displayName}
                        className="object-contain"
                      />
                      <AvatarFallback>{nameInitials}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col text-left min-w-0 flex-1">
                      <span className="font-semibold text-sm truncate">{displayName}</span>
                      <span className="text-muted-foreground text-xs truncate">{user?.email}</span>
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
