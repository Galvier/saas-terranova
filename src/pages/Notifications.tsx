
import React, { useState } from 'react';
import PageHeader from '@/components/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useNotifications } from '@/hooks/useNotifications';
import { useAuth } from '@/hooks/useAuth';
import { Bell, Check, CheckCheck, Filter, Calendar, Tag } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import NotificationSettings from '@/components/notifications/NotificationSettings';
import { useIsMobile } from '@/hooks/use-mobile';

const Notifications: React.FC = () => {
  const { notifications, isLoading, markAsRead, markAllAsRead } = useNotifications();
  const { user } = useAuth();
  const { toast } = useToast();
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const isMobile = useIsMobile();

  // Verificar se o usuário é admin
  const isAdmin = user?.user_metadata?.role === 'admin';

  const filteredNotifications = notifications.filter(notification => {
    const typeMatch = filterType === 'all' || notification.type === filterType;
    const statusMatch = filterStatus === 'all' || 
      (filterStatus === 'read' && notification.is_read) ||
      (filterStatus === 'unread' && !notification.is_read);
    return typeMatch && statusMatch;
  });

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await markAsRead(notificationId);
      toast({
        title: "Notificação marcada como lida",
        description: "A notificação foi marcada como lida com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível marcar a notificação como lida.",
        variant: "destructive",
      });
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
      toast({
        title: "Todas as notificações foram marcadas como lidas",
        description: `${unreadCount} notificações foram marcadas como lidas.`,
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível marcar todas as notificações como lidas.",
        variant: "destructive",
      });
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success': return '✅';
      case 'warning': return '⚠️';
      case 'error': return '❌';
      default: return '📢';
    }
  };

  const getNotificationBadgeVariant = (type: string) => {
    switch (type) {
      case 'success': return 'default';
      case 'warning': return 'secondary';
      case 'error': return 'destructive';
      default: return 'outline';
    }
  };

  return (
    <div className="w-full min-w-0 max-w-full overflow-x-hidden">
      <div className="mobile-container space-y-4 md:space-y-6">
        <PageHeader title="Notificações" />

        <Tabs defaultValue="notifications" className="space-y-4 w-full">
          <TabsList className={`${isMobile ? 'grid w-full grid-cols-1 gap-1 h-auto' : 'grid w-full grid-cols-2'}`}>
            <TabsTrigger value="notifications" className={`flex items-center gap-2 ${isMobile ? 'justify-center py-3' : ''}`}>
              <Bell className="h-4 w-4" />
              Notificações
              {unreadCount > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {unreadCount}
                </Badge>
              )}
            </TabsTrigger>
            {isAdmin && (
              <TabsTrigger value="settings" className={`flex items-center gap-2 ${isMobile ? 'justify-center py-3 mt-1' : ''}`}>
                <Tag className="h-4 w-4" />
                Configurações
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="notifications" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex flex-col gap-4">
                  <CardTitle className="flex items-center gap-2">
                    <Filter className="h-5 w-5" />
                    Filtros
                  </CardTitle>
                  {unreadCount > 0 && (
                    <div className="flex justify-center sm:justify-end">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={handleMarkAllAsRead}
                        className="flex items-center gap-2 w-full sm:w-auto"
                      >
                        <CheckCheck className="h-4 w-4" />
                        Marcar todas como lidas
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="mobile-stack">
                  <div className="w-full">
                    <Select value={filterType} onValueChange={setFilterType}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Filtrar por tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos os tipos</SelectItem>
                        <SelectItem value="info">Informações</SelectItem>
                        <SelectItem value="success">Sucesso</SelectItem>
                        <SelectItem value="warning">Avisos</SelectItem>
                        <SelectItem value="error">Erros</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="w-full">
                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Filtrar por status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todas</SelectItem>
                        <SelectItem value="unread">Não lidas</SelectItem>
                        <SelectItem value="read">Lidas</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-3">
              {isLoading ? (
                <Card>
                  <CardContent className="p-6">
                    <p className="text-center text-muted-foreground">Carregando notificações...</p>
                  </CardContent>
                </Card>
              ) : filteredNotifications.length === 0 ? (
                <Card>
                  <CardContent className="p-6">
                    <div className="text-center">
                      <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-lg font-medium">Nenhuma notificação encontrada</p>
                      <p className="text-muted-foreground">
                        {notifications.length === 0 
                          ? "Você não possui notificações ainda."
                          : "Nenhuma notificação corresponde aos filtros selecionados."
                        }
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                filteredNotifications.map((notification) => (
                  <Card 
                    key={notification.id} 
                    className={`transition-all hover:shadow-md mobile-card ${
                      !notification.is_read ? 'border-l-4 border-l-primary bg-primary/5' : ''
                    }`}
                  >
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-start gap-3">
                          <span className="text-lg flex-shrink-0">
                            {getNotificationIcon(notification.type)}
                          </span>
                          <div className="flex-1 space-y-2 min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className={`font-medium truncate-mobile ${!notification.is_read ? 'font-semibold' : ''}`}>
                                {notification.title}
                              </h3>
                              <Badge variant={getNotificationBadgeVariant(notification.type) as any} className="flex-shrink-0">
                                {notification.type}
                              </Badge>
                              {!notification.is_read && (
                                <Badge variant="default" className="text-xs flex-shrink-0">
                                  Nova
                                </Badge>
                              )}
                            </div>
                            <p className="text-muted-foreground text-sm line-clamp-2">
                              {notification.message}
                            </p>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {formatDistanceToNow(new Date(notification.created_at), { 
                                  addSuffix: true, 
                                  locale: ptBR 
                                })}
                              </span>
                            </div>
                          </div>
                        </div>
                        {!notification.is_read && (
                          <div className="flex justify-center pt-2 border-t">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleMarkAsRead(notification.id)}
                              className="flex items-center gap-1 w-full sm:w-auto"
                            >
                              <Check className="h-3 w-3" />
                              Marcar como lida
                            </Button>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {isAdmin && (
            <TabsContent value="settings">
              <NotificationSettings />
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
};

export default Notifications;
