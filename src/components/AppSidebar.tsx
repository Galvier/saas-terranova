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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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

  // Função melhorada para obter o avatar URL
  const getAvatarUrl = () => {
    // Tentar obter do metadata do usuário
    const avatarUrl = user?.user_metadata?.avatar_url;
    if (avatarUrl && avatarUrl.trim() !== '') {
      return avatarUrl;
    }
    return "";
  };

  // Função para obter as iniciais
  const getNameInitials = () => {
    const displayName = getDisplayName();
    if (displayName === "Usuário") {
      return "U";
    }
    const names = displayName.split(' ').filter(name => name.length > 0);
    if (names.length >= 2) {
      return `${names[0].charAt(0)}${names[names.length - 1].charAt(0)}`.toUpperCase();
    } else if (names.length === 1) {
      return names[0].substring(0, 2).toUpperCase();
    }
    return "U";
  };

  const displayName = getDisplayName();
  const avatarUrl = getAvatarUrl();
  const nameInitials = getNameInitials();

  console.log('[AppSidebar] Dados do usuário:', {
    displayName,
    avatarUrl,
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
                    <Avatar className="mr-2 h-8 w-8">
                      <AvatarImage src={avatarUrl} alt={displayName} />
                      <AvatarFallback>{nameInitials}</AvatarFallback>
                    </Avatar>
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
