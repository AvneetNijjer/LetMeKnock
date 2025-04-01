import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/context/auth-context';
import { Loader2 } from 'lucide-react';
import ConversationList from '@/components/messaging/conversation-list';
import ConversationView from '@/components/messaging/conversation-view';
import useSocket from '@/hooks/use-socket';

type Conversation = {
  id: number;
  propertyId: number;
  propertyTitle?: string;
  lastMessageAt: string;
  participants: any[];
  messages: any[];
  unreadCount: number;
};

export default function MessagesPage() {
  const { user } = useAuth();
  const { isConnected } = useSocket();
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  const { data: conversations, isLoading } = useQuery({
    queryKey: ['/api/conversations'],
    queryFn: async () => {
      if (!user?.id) return [];
      const res = await fetch(`/api/conversations?userId=${user.id}`);
      if (!res.ok) throw new Error('Failed to fetch conversations');
      return res.json();
    },
    enabled: !!user?.id,
  });
  
  useEffect(() => {
    // If we have conversations but no selected one, select the first one
    if (conversations && conversations.length > 0 && !selectedConversation) {
      setSelectedConversation(conversations[0]);
    }
  }, [conversations, selectedConversation]);
  
  const handleConversationSelect = (conversation: Conversation) => {
    setSelectedConversation(conversation);
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-8 px-4 lg:px-8 mb-16">
      <h1 className="text-3xl font-bold mb-8">Messages</h1>
      
      <div className="border rounded-lg overflow-hidden bg-white shadow-sm flex h-[calc(80vh-120px)]">
        {(!selectedConversation || !isMobile) && (
          <div className={`${isMobile && selectedConversation ? 'hidden' : ''} ${isMobile ? 'w-full' : 'w-1/3'} h-full border-r`}>
            <ConversationList 
              onSelectConversation={handleConversationSelect}
              selectedConversationId={selectedConversation?.id}
            />
          </div>
        )}
        
        {selectedConversation ? (
          <div className={`${isMobile ? 'w-full' : 'w-2/3'} h-full flex flex-col`}>
            <ConversationView 
              conversation={selectedConversation}
              onBack={() => setSelectedConversation(null)}
            />
          </div>
        ) : (
          <div className="w-2/3 hidden md:flex items-center justify-center">
            <div className="text-center p-8">
              <h3 className="text-xl font-medium text-gray-700 mb-2">Select a conversation</h3>
              <p className="text-muted-foreground">
                Choose a conversation from the list or start a new one by messaging a property owner
              </p>
            </div>
          </div>
        )}
      </div>
      
      {!isConnected && (
        <div className="mt-4 p-3 bg-amber-50 text-amber-800 rounded-md flex items-center">
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
          <span>Connecting to real-time messaging...</span>
        </div>
      )}
      
      {conversations && conversations.length === 0 && (
        <div className="mt-8 text-center">
          <h3 className="text-xl font-medium text-gray-700 mb-2">No conversations yet</h3>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Start a conversation by visiting a property listing and sending a message to the owner
          </p>
        </div>
      )}
    </div>
  );
}