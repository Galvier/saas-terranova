
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Check, Clock, AlertCircle, Bell } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Notification } from '@/hooks/useNotifications';

interface NotificationModalProps {
  notification: Notification | null;
  isOpen: boolean;
  onClose: () => void;
  onMarkAsRead?: (id: string) => void;
}

const NotificationModal: React.FC<NotificationModalProps> = ({
  notification,
  isOpen,
  onClose,
  onMarkAsRead
}) => {
  if (!notification) return null;

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <Check className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Bell className="h-5 w-5 text-blue-500" />;
    }
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'info': 'Informação',
      'success': 'Sucesso',
      'warning': 'Aviso',
      'error': 'Erro'
    };
    return labels[type] || 'Notificação';
  };

  const handleMarkAsRead = () => {
    if (!notification.is_read && onMarkAsRead) {
      onMarkAsRead(notification.id);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-4 max-h-[80vh] overflow-y-auto">
        <DialogHeader className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="mt-0.5">
              {getNotificationIcon(notification.type)}
            </div>
            <div className="flex-1 min-w-0">
              <DialogTitle className="text-left text-lg font-semibold">
                {notification.title}
              </DialogTitle>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="secondary" className="text-xs">
                  {getTypeLabel(notification.type)}
                </Badge>
                {!notification.is_read && (
                  <Badge variant="default" className="text-xs bg-blue-500">
                    Não lida
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          <DialogDescription className="text-base leading-relaxed whitespace-pre-wrap">
            {notification.message}
          </DialogDescription>

          <div className="flex items-center gap-2 text-sm text-muted-foreground pt-2 border-t">
            <Clock className="h-4 w-4" />
            <span>
              {formatDistanceToNow(new Date(notification.created_at), {
                addSuffix: true,
                locale: ptBR
              })}
            </span>
          </div>

          {!notification.is_read && onMarkAsRead && (
            <div className="flex justify-end pt-2">
              <Button
                variant="default"
                size="sm"
                onClick={handleMarkAsRead}
                className="flex items-center gap-2"
              >
                <Check className="h-4 w-4" />
                Marcar como lida
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NotificationModal;
