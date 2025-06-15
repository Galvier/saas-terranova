
import React, { useState } from 'react';
import { Bell, BellDot, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useNotifications, Notification } from '@/hooks/useNotifications';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';
import NotificationViewDialog from './NotificationViewDialog';

const NotificationsDropdown: React.FC = () => {
  const { notifications, unreadCount, isLoading, markAsRead } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const navigate = useNavigate();

  // Destacar quando há notificações não lidas
  const hasUnread = unreadCount > 0;

  const handleNotificationClick = (notification: Notification) => {
    setSelectedNotification(notification);
    setShowViewDialog(true);
    setIsOpen(false);
  };

  const handleMarkAsRead = async (notificationId: string) => {
    await markAsRead(notificationId);
  };

  const handleViewAll = () => {
    navigate('/notifications');
    setIsOpen(false);
  };

  return (
    <>
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className={`relative h-9 w-9 p-0 transition-colors ${
              hasUnread ? 'text-blue-600 hover:text-blue-700' : ''
            }`}
          >
            {hasUnread ? (
              <BellDot className={`h-5 w-5 ${hasUnread ? 'animate-pulse' : ''}`} />
            ) : (
              <Bell className="h-5 w-5" />
            )}
            {hasUnread && (
              <Badge 
                variant="destructive" 
                className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs animate-bounce"
              >
                {unreadCount > 99 ? '99+' : unreadCount}
              </Badge>
            )}
          </Button>
        </DropdownMenuTrigger>
        
        <DropdownMenuContent 
          align="end" 
          className="w-80 p-0"
          sideOffset={5}
        >
          <div className="p-3 border-b">
            <h3 className="font-semibold text-sm">Notificações</h3>
            {hasUnread && (
              <p className="text-xs text-muted-foreground mt-1">
                {unreadCount} {unreadCount === 1 ? 'não lida' : 'não lidas'}
              </p>
            )}
          </div>

          <ScrollArea className="max-h-96">
            {isLoading ? (
              <div className="p-4 text-center text-sm text-muted-foreground">
                Carregando notificações...
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-4 text-center text-sm text-muted-foreground">
                Nenhuma notificação encontrada
              </div>
            ) : (
              <div>
                {notifications.slice(0, 10).map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-3 hover:bg-muted/50 cursor-pointer border-l-2 transition-all ${
                      !notification.is_read 
                        ? 'bg-blue-50 dark:bg-blue-950/30 border-l-blue-500 shadow-sm' 
                        : 'bg-background border-l-transparent'
                    }`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className={`text-sm font-medium truncate ${
                            !notification.is_read ? 'text-foreground font-semibold' : 'text-muted-foreground'
                          }`}>
                            {notification.title}
                          </h4>
                          {!notification.is_read && (
                            <Badge variant="default" className="text-xs">
                              Nova
                            </Badge>
                          )}
                        </div>
                        <p className={`text-xs ${
                          !notification.is_read ? 'text-foreground/80' : 'text-muted-foreground'
                        } line-clamp-2`}>
                          {notification.message}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatDistanceToNow(new Date(notification.created_at), {
                            addSuffix: true,
                            locale: ptBR
                          })}
                        </p>
                      </div>
                      
                      {!notification.is_read && (
                        <div className="flex-shrink-0">
                          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>

          <div className="p-2 border-t bg-muted/20">
            <Button 
              variant="ghost" 
              size="sm" 
              className="w-full text-xs justify-between"
              onClick={handleViewAll}
            >
              Ver todas as notificações
              <ExternalLink className="h-3 w-3" />
            </Button>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      <NotificationViewDialog
        notification={selectedNotification}
        open={showViewDialog}
        onOpenChange={setShowViewDialog}
        onMarkAsRead={handleMarkAsRead}
      />
    </>
  );
};

export default NotificationsDropdown;
