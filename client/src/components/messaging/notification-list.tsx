import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/context/auth-context';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Loader2, Building, MessageSquare, Calendar, Eye, User, Check } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

type Notification = {
  id: number;
  userId: number;
  type: 'message' | 'booking' | 'system' | 'property';
  title: string;
  message: string;
  read: boolean;
  relatedId?: number;
  createdAt: string;
};

export default function NotificationList() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { data: notifications, isLoading } = useQuery({
    queryKey: ['/api/notifications'],
    queryFn: async () => {
      if (!user?.id) return [];
      const res = await fetch(`/api/notifications?userId=${user.id}`);
      if (!res.ok) throw new Error('Failed to fetch notifications');
      return res.json();
    },
    enabled: !!user?.id,
  });
  
  const markAsReadMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/notifications/${id}/read`, {
        method: 'PUT',
      });
      if (!res.ok) throw new Error('Failed to mark notification as read');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
      queryClient.invalidateQueries({ queryKey: ['/api/unread-counts'] });
    },
  });
  
  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/notifications/read-all`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user?.id }),
      });
      if (!res.ok) throw new Error('Failed to mark all notifications as read');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
      queryClient.invalidateQueries({ queryKey: ['/api/unread-counts'] });
      toast({
        title: 'All notifications marked as read',
        description: 'You have no unread notifications',
      });
    },
  });
  
  const handleNotificationClick = (notification: Notification) => {
    // Mark as read
    if (!notification.read) {
      markAsReadMutation.mutate(notification.id);
    }
    
    // Navigate based on notification type
    if (notification.type === 'message' && notification.relatedId) {
      // Open conversation
      window.location.href = `/messages?conversationId=${notification.relatedId}`;
    } else if (notification.type === 'booking' && notification.relatedId) {
      // Open booking details
      window.location.href = `/bookings/${notification.relatedId}`;
    } else if (notification.type === 'property' && notification.relatedId) {
      // Open property details
      window.location.href = `/properties/${notification.relatedId}`;
    }
  };
  
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'message':
        return <MessageSquare className="h-5 w-5 text-blue-500" />;
      case 'booking':
        return <Calendar className="h-5 w-5 text-green-500" />;
      case 'property':
        return <Building className="h-5 w-5 text-purple-500" />;
      case 'system':
        return <User className="h-5 w-5 text-gray-500" />;
      default:
        return <MessageSquare className="h-5 w-5 text-blue-500" />;
    }
  };
  
  const formatNotificationDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    
    if (now.getTime() - date.getTime() < 24 * 60 * 60 * 1000) {
      return formatDistanceToNow(date, { addSuffix: true });
    }
    
    return format(date, 'MMM d, yyyy');
  };
  
  return (
    <div className="flex flex-col h-full">
      <div className="p-3 border-b flex items-center justify-between">
        <h3 className="font-medium text-sm">Notifications</h3>
        
        {notifications && notifications.some((n: Notification) => !n.read) && (
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 px-2 text-xs"
            onClick={() => markAllAsReadMutation.mutate()}
            disabled={markAllAsReadMutation.isPending}
          >
            {markAllAsReadMutation.isPending ? (
              <Loader2 className="h-3 w-3 mr-1 animate-spin" />
            ) : (
              <Check className="h-3 w-3 mr-1" />
            )}
            Mark all as read
          </Button>
        )}
      </div>
      
      <ScrollArea className="flex-1">
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : notifications && notifications.length > 0 ? (
          <div className="divide-y">
            {notifications.map((notification: Notification) => (
              <div 
                key={notification.id}
                className={cn(
                  "p-3 hover:bg-muted/50 cursor-pointer transition-colors",
                  !notification.read && "bg-primary/5"
                )}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="flex gap-3">
                  <div className={cn(
                    "h-10 w-10 rounded-full flex items-center justify-center",
                    notification.read ? "bg-muted" : "bg-primary/10"
                  )}>
                    {getNotificationIcon(notification.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-medium text-sm">{notification.title}</p>
                      {!notification.read && (
                        <Badge variant="default" className="h-[18px] rounded-full px-1.5 text-[10px]">
                          New
                        </Badge>
                      )}
                    </div>
                    
                    <p className="text-muted-foreground text-xs mt-1 line-clamp-2">
                      {notification.message}
                    </p>
                    
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatNotificationDate(notification.createdAt)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-8 h-64">
            <div className="h-12 w-12 bg-muted rounded-full flex items-center justify-center mb-4">
              <Eye className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="font-medium text-center">No notifications</h3>
            <p className="text-sm text-muted-foreground text-center mt-1">
              You're all caught up! We'll let you know when there's something new.
            </p>
          </div>
        )}
      </ScrollArea>
    </div>
  );
}