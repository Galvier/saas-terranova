
import React, { useState } from 'react';
import { Bell, BellDot, Check, CheckCheck, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useNotifications, Notification } from '@/hooks/useNotifications';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const NotificationItem: React.FC<{
  notification: Notification;
  onMarkAsRead: (id: string) => void;
}> = ({ notification, onMarkAsRead }) => {
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'success': return 'text-green-600 dark:text-green-400';
      case 'warning': return 'text-yellow-600 dark:text-yellow-400';
      case 'error': return 'text-red-600 dark:text-red-400';
      default: return 'text-blue-600 dark:text-blue-400';
    }
  };

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'success': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'warning': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'error': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      default: return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
    }
  };

  return (
    <div
      className={`p-3 hover:bg-muted/50 cursor-pointer border-l-2 ${
        !notification.is_read 
          ? 'bg-blue-50 dark:bg-blue-950/30 border-l-blue-500' 
          : 'bg-background border-l-transparent'
      } transition-colors`}
      onClick={() => !notification.is_read && onMarkAsRead(notification.id)}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className={`text-sm font-medium truncate ${
              !notification.is_read ? 'text-foreground' : 'text-muted-foreground'
            }`}>
              {notification.title}
            </h4>
            <Badge 
              variant="secondary" 
              className={`text-xs ${getTypeBadgeColor(notification.type)}`}
            >
              {notification.type}
            </Badge>
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
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
          </div>
        )}
      </div>
    </div>
  );
};

const NotificationsDropdown: React.FC = () => {
  const { notifications, unreadCount, isLoading, markAsRead, markAllAsRead } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="relative h-9 w-9 p-0"
        >
          {unreadCount > 0 ? (
            <BellDot className="h-5 w-5" />
          ) : (
            <Bell className="h-5 w-5" />
          )}
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent 
        align="end" 
        className="w-80 p-0 bg-background border border-border shadow-lg z-50"
        sideOffset={5}
      >
        <div className="p-3 border-b border-border">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-sm text-foreground">Notificações</h3>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMarkAllAsRead}
                className="h-auto p-1 text-xs hover:bg-muted"
              >
                <CheckCheck className="h-3 w-3 mr-1" />
                Marcar todas como lidas
              </Button>
            )}
          </div>
          {unreadCount > 0 && (
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
              {notifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onMarkAsRead={markAsRead}
                />
              ))}
            </div>
          )}
        </ScrollArea>

        {notifications.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <div className="p-2">
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-xs hover:bg-muted"
                onClick={() => setIsOpen(false)}
              >
                Ver todas as notificações
              </Button>
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationsDropdown;
