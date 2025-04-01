import { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MessageSquare, Bell } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/context/auth-context';
import ConversationList from './conversation-list';
import NotificationList from './notification-list';
import ConversationView from './conversation-view';

interface MessagingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type Conversation = {
  id: number;
  propertyId: number;
  propertyTitle?: string;
  lastMessageAt: string;
  participants: any[];
  messages: any[];
  unreadCount: number;
};

export default function MessagingModal({ open, onOpenChange }: MessagingModalProps) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('messages');
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  
  const { data: counts } = useQuery({
    queryKey: ['/api/unread-counts'],
    queryFn: async () => {
      if (!user?.id) return { messages: 0, notifications: 0 };
      const res = await fetch(`/api/unread-counts?userId=${user.id}`);
      if (!res.ok) throw new Error('Failed to fetch unread counts');
      return res.json();
    },
    enabled: !!user?.id,
  });
  
  const unreadMessages = counts?.messages || 0;
  const unreadNotifications = counts?.notifications || 0;
  
  const handleConversationSelect = (conversation: Conversation) => {
    setSelectedConversation(conversation);
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl h-[80vh] p-0 overflow-hidden">
        <div className="flex h-full">
          {!selectedConversation || window.innerWidth >= 768 ? (
            <div className={`${selectedConversation && window.innerWidth < 768 ? 'hidden' : ''} ${selectedConversation ? 'w-1/3 border-r' : 'w-full'} h-full flex flex-col`}>
              <Tabs
                defaultValue="messages"
                value={activeTab}
                onValueChange={setActiveTab}
                className="h-full flex flex-col"
              >
                <TabsList className="justify-start px-4 pt-4 bg-transparent border-b rounded-none">
                  <TabsTrigger value="messages" className="relative">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Messages
                    {unreadMessages > 0 && (
                      <Badge variant="destructive" className="h-5 min-w-[1.25rem] px-1 absolute -top-2 -right-2 flex items-center justify-center rounded-full text-[10px]">
                        {unreadMessages > 99 ? '99+' : unreadMessages}
                      </Badge>
                    )}
                  </TabsTrigger>
                  <TabsTrigger value="notifications" className="relative">
                    <Bell className="h-4 w-4 mr-2" />
                    Notifications
                    {unreadNotifications > 0 && (
                      <Badge variant="destructive" className="h-5 min-w-[1.25rem] px-1 absolute -top-2 -right-2 flex items-center justify-center rounded-full text-[10px]">
                        {unreadNotifications > 99 ? '99+' : unreadNotifications}
                      </Badge>
                    )}
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="messages" className="flex-1 overflow-hidden m-0 border-0">
                  <ConversationList 
                    onSelectConversation={handleConversationSelect}
                    selectedConversationId={selectedConversation?.id}
                  />
                </TabsContent>
                
                <TabsContent value="notifications" className="flex-1 overflow-hidden m-0 border-0">
                  <NotificationList />
                </TabsContent>
              </Tabs>
            </div>
          ) : null}
          
          {selectedConversation && (
            <div className={`${window.innerWidth < 768 ? 'w-full' : 'w-2/3'} h-full flex flex-col`}>
              <ConversationView 
                conversation={selectedConversation}
                onBack={() => setSelectedConversation(null)}
              />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}