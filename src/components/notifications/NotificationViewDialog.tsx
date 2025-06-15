
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Check, Calendar, Info } from 'lucide-react';
import { Notification } from '@/hooks/useNotifications';

interface NotificationViewDialogProps {
  notification: Notification | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onMarkAsRead?: (notificationId: string) => void;
}

const NotificationViewDialog: React.FC<NotificationViewDialogProps> = ({
  notification,
  open,
  onOpenChange,
  onMarkAsRead
}) => {
  if (!notification) return null;

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

  const handleMarkAsRead = () => {
    if (onMarkAsRead && !notification.is_read) {
      onMarkAsRead(notification.id);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl sm:max-w-lg w-[95vw] sm:w-full max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start gap-3">
            <span className="text-2xl flex-shrink-0">
              {getNotificationIcon(notification.type)}
            </span>
            <div className="flex-1 space-y-2 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <DialogTitle className="text-lg font-semibold break-words">
                  {notification.title}
                </DialogTitle>
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant={getNotificationBadgeVariant(notification.type) as any}>
                    {notification.type}
                  </Badge>
                  {!notification.is_read && (
                    <Badge variant="default" className="text-xs">
                      Nova
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          <Separator />
          
          {/* Mensagem */}
          <div className="space-y-2">
            <h4 className="font-medium flex items-center gap-2">
              <Info className="h-4 w-4" />
              Mensagem
            </h4>
            <p className="text-sm text-muted-foreground leading-relaxed bg-muted/50 p-3 rounded-lg break-words">
              {notification.message}
            </p>
          </div>

          {/* Data */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 flex-shrink-0" />
              <span>
                {formatDistanceToNow(new Date(notification.created_at), { 
                  addSuffix: true, 
                  locale: ptBR 
                })}
              </span>
            </div>
            <span className="text-xs">
              ({new Date(notification.created_at).toLocaleString('pt-BR')})
            </span>
          </div>

          {/* Ações */}
          {!notification.is_read && (
            <>
              <Separator />
              <div className="flex justify-center sm:justify-end">
                <Button 
                  onClick={handleMarkAsRead} 
                  className="flex items-center gap-2 w-full sm:w-auto"
                  size="sm"
                >
                  <Check className="h-4 w-4" />
                  Marcar como lida
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NotificationViewDialog;
