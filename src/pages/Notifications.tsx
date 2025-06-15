
import React from 'react';
import { Bell, Check, Clock, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import PageHeader from '@/components/PageHeader';
import { useNotifications } from '@/hooks/useNotifications';
import { useIsMobile } from '@/hooks/use-mobile';

const Notifications = () => {
  const { notifications, markAsRead, markAllAsRead } = useNotifications();
  const isMobile = useIsMobile();

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <Check className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Bell className="h-4 w-4 text-blue-500" />;
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className="animate-fade-in">
      <div className="mobile-container">
        <PageHeader 
          title="Notificações" 
          subtitle="Gerencie suas notificações e alertas do sistema"
        />
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="flex items-center gap-2">
            <Badge variant="secondary">
              {unreadCount} não lidas
            </Badge>
          </div>
          
          {unreadCount > 0 && (
            <Button 
              variant="outline" 
              onClick={markAllAsRead}
              className="w-full sm:w-auto mobile-touch"
            >
              Marcar todas como lidas
            </Button>
          )}
        </div>
      </div>

      <div className="mobile-container space-y-4">
        {notifications.length === 0 ? (
          <Card className="mobile-card">
            <CardContent className="p-6 text-center">
              <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Nenhuma notificação encontrada</p>
            </CardContent>
          </Card>
        ) : (
          notifications.map((notification) => (
            <Card 
              key={notification.id} 
              className={`mobile-card cursor-pointer transition-colors ${
                !notification.is_read ? 'border-l-4 border-l-blue-500 bg-blue-50/50' : ''
              }`}
              onClick={() => !notification.is_read && markAsRead(notification.id)}
            >
              <CardHeader className={`pb-2 ${isMobile ? 'p-4' : 'p-6'}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="mt-0.5">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-base font-medium line-clamp-2">
                        {notification.title}
                      </CardTitle>
                      <CardDescription className="text-sm line-clamp-3 mt-1">
                        {notification.message}
                      </CardDescription>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    {!notification.is_read && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full" />
                    )}
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>{new Date(notification.created_at).toLocaleDateString('pt-BR')}</span>
                    </div>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default Notifications;
