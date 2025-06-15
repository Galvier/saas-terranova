
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useNotificationsDialog } from '@/hooks/useNotificationsDialog';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import { 
  Search, 
  Filter, 
  CheckCheck, 
  Loader2, 
  Calendar,
  Bell,
  X
} from 'lucide-react';

interface NotificationsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const NotificationsDialog: React.FC<NotificationsDialogProps> = ({
  open,
  onOpenChange
}) => {
  const { toast } = useToast();
  const {
    notifications,
    isLoading,
    hasMore,
    totalCount,
    fetchNotifications,
    markAsRead,
    markMultipleAsRead
  } = useNotificationsDialog();

  const [filters, setFilters] = useState({
    type: 'all' as const,
    status: 'all' as const,
    search: ''
  });
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>([]);
  const [page, setPage] = useState(0);

  useEffect(() => {
    if (open) {
      setPage(0);
      fetchNotifications(0, 20, filters, true);
    }
  }, [open, filters, fetchNotifications]);

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchNotifications(nextPage * 20, 20, filters, false);
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(0);
  };

  const handleSelectAll = () => {
    const unreadIds = notifications.filter(n => !n.is_read).map(n => n.id);
    setSelectedNotifications(prev => 
      prev.length === unreadIds.length ? [] : unreadIds
    );
  };

  const handleMarkSelectedAsRead = async () => {
    if (selectedNotifications.length === 0) return;

    try {
      await markMultipleAsRead(selectedNotifications);
      setSelectedNotifications([]);
      toast({
        title: "Notificações marcadas como lidas",
        description: `${selectedNotifications.length} notificações foram marcadas como lidas.`,
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível marcar as notificações como lidas.",
        variant: "destructive",
      });
    }
  };

  const handleNotificationClick = async (notification: any) => {
    if (!notification.is_read) {
      await markAsRead(notification.id);
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

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Todas as Notificações
            <Badge variant="outline" className="ml-2">
              {totalCount} total
            </Badge>
            {unreadCount > 0 && (
              <Badge variant="destructive">
                {unreadCount} não lidas
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        {/* Filtros */}
        <div className="flex flex-col gap-4 p-4 border rounded-lg bg-muted/50">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-2 flex-1 min-w-[200px]">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar notificações..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="flex-1"
              />
            </div>
            
            <Select value={filters.type} onValueChange={(value) => handleFilterChange('type', value)}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os tipos</SelectItem>
                <SelectItem value="info">Informações</SelectItem>
                <SelectItem value="success">Sucesso</SelectItem>
                <SelectItem value="warning">Avisos</SelectItem>
                <SelectItem value="error">Erros</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.status} onValueChange={(value) => handleFilterChange('status', value)}>
              <SelectTrigger className="w-[130px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="unread">Não lidas</SelectItem>
                <SelectItem value="read">Lidas</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Ações em massa */}
          {unreadCount > 0 && (
            <div className="flex items-center gap-2 pt-2 border-t">
              <Checkbox
                checked={selectedNotifications.length === unreadCount && unreadCount > 0}
                onCheckedChange={handleSelectAll}
              />
              <span className="text-sm text-muted-foreground">
                Selecionar todas não lidas ({unreadCount})
              </span>
              {selectedNotifications.length > 0 && (
                <Button
                  size="sm"
                  onClick={handleMarkSelectedAsRead}
                  className="ml-auto"
                >
                  <CheckCheck className="h-4 w-4 mr-2" />
                  Marcar como lidas ({selectedNotifications.length})
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Lista de notificações */}
        <ScrollArea className="flex-1">
          <div className="space-y-2 p-1">
            {notifications.length === 0 && !isLoading ? (
              <div className="text-center py-8">
                <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-lg font-medium">Nenhuma notificação encontrada</p>
                <p className="text-muted-foreground">
                  Nenhuma notificação corresponde aos filtros selecionados.
                </p>
              </div>
            ) : (
              notifications.map((notification, index) => (
                <div key={notification.id}>
                  <div 
                    className={`p-3 rounded-lg border cursor-pointer transition-all hover:shadow-sm ${
                      !notification.is_read 
                        ? 'border-l-4 border-l-primary bg-primary/5' 
                        : 'bg-background hover:bg-muted/50'
                    }`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex items-start gap-3">
                      {!notification.is_read && (
                        <Checkbox
                          checked={selectedNotifications.includes(notification.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedNotifications(prev => [...prev, notification.id]);
                            } else {
                              setSelectedNotifications(prev => prev.filter(id => id !== notification.id));
                            }
                          }}
                          onClick={(e) => e.stopPropagation()}
                          className="mt-1"
                        />
                      )}
                      
                      <span className="text-lg flex-shrink-0">
                        {getNotificationIcon(notification.type)}
                      </span>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className={`font-medium truncate ${
                            !notification.is_read ? 'font-semibold' : ''
                          }`}>
                            {notification.title}
                          </h3>
                          <Badge variant={getNotificationBadgeVariant(notification.type) as any}>
                            {notification.type}
                          </Badge>
                          {!notification.is_read && (
                            <Badge variant="default" className="text-xs">
                              Nova
                            </Badge>
                          )}
                        </div>
                        
                        <p className="text-sm text-muted-foreground mb-2">
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
                  </div>
                  {index < notifications.length - 1 && <Separator className="my-2" />}
                </div>
              ))
            )}

            {/* Botão Carregar Mais */}
            {hasMore && notifications.length > 0 && (
              <div className="text-center py-4">
                <Button
                  variant="outline"
                  onClick={loadMore}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Carregando...
                    </>
                  ) : (
                    'Carregar mais notificações'
                  )}
                </Button>
              </div>
            )}

            {/* Loading inicial */}
            {isLoading && notifications.length === 0 && (
              <div className="text-center py-8">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                <p className="text-muted-foreground">Carregando notificações...</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default NotificationsDialog;
