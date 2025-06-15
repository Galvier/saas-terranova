
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Check, Calendar, Tag, Info } from 'lucide-react';
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
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-start gap-3">
            <span className="text-2xl flex-shrink-0">
              {getNotificationIcon(notification.type)}
            </span>
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <DialogTitle className="text-lg font-semibold">
                  {notification.title}
                </DialogTitle>
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
        </DialogHeader>

        <div className="space-y-4">
          <Separator />
          
          {/* Mensagem */}
          <div className="space-y-2">
            <h4 className="font-medium flex items-center gap-2">
              <Info className="h-4 w-4" />
              Mensagem
            </h4>
            <p className="text-sm text-muted-foreground leading-relaxed bg-muted/50 p-3 rounded-lg">
              {notification.message}
            </p>
          </div>

          {/* Metadata */}
          {notification.metadata && Object.keys(notification.metadata).length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium flex items-center gap-2">
                <Tag className="h-4 w-4" />
                Detalhes Adicionais
              </h4>
              <div className="bg-muted/50 p-3 rounded-lg">
                <pre className="text-xs text-muted-foreground overflow-x-auto">
                  {JSON.stringify(notification.metadata, null, 2)}
                </pre>
              </div>
            </div>
          )}

          {/* Data */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>
              {formatDistanceToNow(new Date(notification.created_at), { 
                addSuffix: true, 
                locale: ptBR 
              })}
            </span>
            <span className="text-xs">
              ({new Date(notification.created_at).toLocaleString('pt-BR')})
            </span>
          </div>

          {/* Ações */}
          {!notification.is_read && (
            <>
              <Separator />
              <div className="flex justify-end">
                <Button onClick={handleMarkAsRead} className="flex items-center gap-2">
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
