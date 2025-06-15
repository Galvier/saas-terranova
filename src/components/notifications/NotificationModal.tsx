
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Check, Clock, AlertCircle, Bell, X } from 'lucide-react';
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
        return <Check className="h-6 w-6 text-green-500" />;
      case 'warning':
        return <AlertCircle className="h-6 w-6 text-yellow-500" />;
      case 'error':
        return <AlertCircle className="h-6 w-6 text-red-500" />;
      default:
        return <Bell className="h-6 w-6 text-blue-500" />;
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

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      'info': 'bg-blue-100 text-blue-800 border-blue-200',
      'success': 'bg-green-100 text-green-800 border-green-200',
      'warning': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'error': 'bg-red-100 text-red-800 border-red-200'
    };
    return colors[type] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const handleMarkAsRead = () => {
    if (!notification.is_read && onMarkAsRead) {
      onMarkAsRead(notification.id);
    }
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-4 max-h-[85vh] overflow-hidden p-0 gap-0 rounded-xl border-0 shadow-2xl">
        {/* Header com gradiente */}
        <div className={`p-6 pb-4 rounded-t-xl bg-gradient-to-br ${
          notification.type === 'success' ? 'from-green-50 to-green-100' :
          notification.type === 'warning' ? 'from-yellow-50 to-yellow-100' :
          notification.type === 'error' ? 'from-red-50 to-red-100' :
          'from-blue-50 to-blue-100'
        }`}>
          <DialogHeader className="space-y-0">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-full bg-white shadow-sm border">
                {getNotificationIcon(notification.type)}
              </div>
              <div className="flex-1 min-w-0">
                <DialogTitle className="text-left text-xl font-bold text-gray-900 leading-tight mb-3">
                  {notification.title}
                </DialogTitle>
                <div className="flex items-center gap-2">
                  <Badge className={`text-xs font-medium border ${getTypeColor(notification.type)}`}>
                    {getTypeLabel(notification.type)}
                  </Badge>
                  {!notification.is_read && (
                    <Badge className="text-xs font-medium bg-blue-500 text-white border-blue-500">
                      Nova
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </DialogHeader>
        </div>

        {/* Conteúdo da mensagem */}
        <div className="px-6 py-4 bg-white overflow-y-auto max-h-[40vh]">
          <DialogDescription className="text-base leading-relaxed text-gray-700 whitespace-pre-wrap font-normal">
            {notification.message}
          </DialogDescription>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 rounded-b-xl">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Clock className="h-4 w-4" />
              <span>
                {formatDistanceToNow(new Date(notification.created_at), {
                  addSuffix: true,
                  locale: ptBR
                })}
              </span>
            </div>

            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-gray-600 hover:text-gray-800"
              >
                <X className="h-4 w-4 mr-1" />
                Fechar
              </Button>
              
              {!notification.is_read && onMarkAsRead && (
                <Button
                  size="sm"
                  onClick={handleMarkAsRead}
                  className="bg-blue-500 hover:bg-blue-600 text-white shadow-sm"
                >
                  <Check className="h-4 w-4 mr-1" />
                  Marcar como lida
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NotificationModal;
