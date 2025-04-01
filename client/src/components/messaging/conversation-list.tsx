import { useState, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/context/auth-context';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Loader2, Search, Building } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { format, formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import useSocket from '@/hooks/use-socket';

type ConversationParticipant = {
  id: number;
  userId: number;
  conversationId: number;
  firstName?: string;
  lastName?: string;
  email?: string;
  profilePicture?: string;
};

type Message = {
  id: number;
  senderId: number;
  conversationId: number;
  content: string;
  read: boolean;
  createdAt: string;
};

type Conversation = {
  id: number;
  propertyId: number;
  propertyTitle?: string;
  lastMessageAt: string;
  participants: ConversationParticipant[];
  messages: Message[];
  unreadCount: number;
};

interface ConversationListProps {
  onSelectConversation: (conversation: Conversation) => void;
  selectedConversationId?: number;
}

export default function ConversationList({ 
  onSelectConversation, 
  selectedConversationId 
}: ConversationListProps) {
  const { user } = useAuth();
  const { isConnected } = useSocket();
  const [searchTerm, setSearchTerm] = useState('');
  
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
  
  const handleSelectConversation = useCallback((conversation: Conversation) => {
    onSelectConversation(conversation);
  }, [onSelectConversation]);
  
  const getOtherParticipant = (conversation: Conversation) => {
    if (!user) return null;
    return conversation.participants.find(p => p.userId !== user.id);
  };
  
  const getLastMessage = (conversation: Conversation) => {
    if (!conversation.messages || conversation.messages.length === 0) {
      return 'No messages yet';
    }
    
    const lastMessage = conversation.messages[conversation.messages.length - 1];
    return lastMessage.content;
  };
  
  const formatConversationDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    
    if (now.getTime() - date.getTime() < 24 * 60 * 60 * 1000) {
      return format(date, 'h:mm a');
    }
    
    return format(date, 'MMM d');
  };
  
  const filteredConversations = conversations 
    ? conversations.filter((conversation: Conversation) => {
        if (!searchTerm) return true;
        
        const otherParticipant = getOtherParticipant(conversation);
        const participantName = otherParticipant 
          ? `${otherParticipant.firstName || ''} ${otherParticipant.lastName || ''}`.trim()
          : '';
        const participantEmail = otherParticipant?.email || '';
        const propertyTitle = conversation.propertyTitle || '';
        
        const searchLower = searchTerm.toLowerCase();
        return (
          participantName.toLowerCase().includes(searchLower) ||
          participantEmail.toLowerCase().includes(searchLower) ||
          propertyTitle.toLowerCase().includes(searchLower)
        );
      })
    : [];
  
  // Sort conversations by lastMessageAt
  const sortedConversations = [...filteredConversations].sort((a: Conversation, b: Conversation) => {
    return new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime();
  });
  
  return (
    <div className="flex flex-col h-full">
      <div className="p-3 border-b">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search conversations..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      
      <ScrollArea className="flex-1">
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : sortedConversations.length > 0 ? (
          <div className="divide-y">
            {sortedConversations.map((conversation: Conversation) => {
              const otherParticipant = getOtherParticipant(conversation);
              const isSelected = selectedConversationId === conversation.id;
              
              return (
                <div 
                  key={conversation.id}
                  className={cn(
                    "p-3 hover:bg-muted/50 cursor-pointer transition-colors",
                    isSelected && "bg-muted"
                  )}
                  onClick={() => handleSelectConversation(conversation)}
                >
                  <div className="flex gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage 
                        src={otherParticipant?.profilePicture || ''} 
                        alt={otherParticipant?.firstName || 'User'} 
                      />
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {otherParticipant?.firstName?.[0] || otherParticipant?.email?.[0]?.toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-medium text-sm truncate">
                          {otherParticipant?.firstName && otherParticipant?.lastName
                            ? `${otherParticipant.firstName} ${otherParticipant.lastName}`
                            : otherParticipant?.email?.split('@')[0] || 'User'}
                        </p>
                        <p className="text-xs text-muted-foreground whitespace-nowrap">
                          {formatConversationDate(conversation.lastMessageAt)}
                        </p>
                      </div>
                      
                      {conversation.propertyTitle && (
                        <p className="text-xs text-primary flex items-center gap-1 truncate mt-0.5">
                          <Building className="h-3 w-3" />
                          {conversation.propertyTitle}
                        </p>
                      )}
                      
                      <div className="flex justify-between items-start mt-1">
                        <p className={cn(
                          "text-xs line-clamp-1 flex-1",
                          conversation.unreadCount > 0 ? "font-medium text-foreground" : "text-muted-foreground"
                        )}>
                          {getLastMessage(conversation)}
                        </p>
                        
                        {conversation.unreadCount > 0 && (
                          <Badge variant="default" className="ml-2 h-5 min-w-[1.25rem] px-1 flex items-center justify-center rounded-full text-[10px]">
                            {conversation.unreadCount}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-8 h-64">
            <div className="h-12 w-12 bg-muted rounded-full flex items-center justify-center mb-4">
              <Building className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="font-medium text-center">No conversations yet</h3>
            <p className="text-sm text-muted-foreground text-center mt-1">
              Start a conversation by visiting a property listing and messaging the owner
            </p>
          </div>
        )}
      </ScrollArea>
      
      {!isConnected && (
        <div className="p-2 border-t">
          <div className="p-2 bg-amber-50 text-amber-800 rounded-md flex items-center text-xs">
            <Loader2 className="h-3 w-3 animate-spin mr-2" />
            <span>Connecting to messaging service...</span>
          </div>
        </div>
      )}
    </div>
  );
}