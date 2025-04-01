import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/context/auth-context';
import { Bell, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import MessagingModal from './messaging-modal';

export default function MessageIndicator() {
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const { data: counts } = useQuery({
    queryKey: ['/api/unread-counts'],
    queryFn: async () => {
      if (!user?.id) return { messages: 0, notifications: 0 };
      const res = await fetch(`/api/unread-counts?userId=${user.id}`);
      if (!res.ok) throw new Error('Failed to fetch unread counts');
      return res.json();
    },
    enabled: !!user?.id,
    refetchInterval: 30000, // Refetch every 30 seconds
  });
  
  const totalUnread = (counts?.messages || 0) + (counts?.notifications || 0);
  
  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="relative"
        onClick={() => setIsModalOpen(true)}
      >
        <MessageSquare className="h-5 w-5" />
        {totalUnread > 0 && (
          <Badge 
            variant="destructive" 
            className="h-5 min-w-[1.25rem] px-1 absolute -top-2 -right-2 flex items-center justify-center rounded-full text-[10px]"
          >
            {totalUnread > 99 ? '99+' : totalUnread}
          </Badge>
        )}
      </Button>
      
      <MessagingModal 
        open={isModalOpen} 
        onOpenChange={setIsModalOpen} 
      />
    </>
  );
}