import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { useAuth } from '@/context/auth-context';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  ArrowLeft, 
  Send,
  Loader2,
  Building,
  Info,
  User
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import useFirebaseMessaging from '@/hooks/use-firebase-messaging';
import firebaseMessagingService, { FirebaseMessage } from '@/lib/firebase';
import { cn } from '@/lib/utils';

type Message = {
  id: number;
  senderId: number;
  conversationId: number;
  content: string;
  read: boolean;
  createdAt: string;
};

type ConversationParticipant = {
  id: number;
  userId: number;
  conversationId: number;
  firstName?: string;
  lastName?: string;
  email?: string;
  profilePicture?: string;
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

type Property = {
  id: number;
  title: string;
  description: string;
  price: number;
  propertyType: string;
  bedrooms: number;
  bathrooms: number;
  address: string;
  city: string;
  state: string;
  zip: string;
  latitude: number;
  longitude: number;
  images: string[];
  featured: boolean;
};

interface ConversationViewProps {
  conversation: Conversation;
  onBack: () => void;
}

export default function ConversationView({ conversation, onBack }: ConversationViewProps) {
  const { user } = useAuth();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typingUserId, setTypingUserId] = useState<number | null>(null);
  const [property, setProperty] = useState<Property | null>(null);
  const [firebaseMessages, setFirebaseMessages] = useState<FirebaseMessage[]>([]);
  
  // Use Firebase messaging hook
  const { 
    sendMessage: sendFirebaseMessage, 
    setTypingStatus, 
    subscribeToMessages,
    unsubscribeFromMessages,
    subscribeToTypingStatus,
    unsubscribeFromTypingStatus,
    markMessageAsRead,
    isInitialized
  } = useFirebaseMessaging();
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const { data: conversationData, isLoading } = useQuery({
    queryKey: ['/api/conversations', conversation.id],
    queryFn: async () => {
      const res = await fetch(`/api/conversations/${conversation.id}`);
      if (!res.ok) throw new Error('Failed to fetch conversation');
      return res.json();
    },
    initialData: conversation
  });
  
  useQuery({
    queryKey: ['/api/properties', conversation.propertyId],
    queryFn: async () => {
      const res = await fetch(`/api/properties/${conversation.propertyId}`);
      if (!res.ok) throw new Error('Failed to fetch property');
      const data = await res.json();
      setProperty(data);
      return data;
    },
    enabled: !!conversation.propertyId,
  });
  
  const sendMessageMutation = useMutation({
    mutationFn: async () => {
      if (!user || !message.trim()) return;
      
      // Store the message content before clearing it
      const messageContent = message.trim();
      
      const res = await fetch(`/api/conversations/${conversation.id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: messageContent,
          senderId: user.id
        })
      });
      
      if (!res.ok) throw new Error('Failed to send message');
      
      // Return both API response and message content
      return { 
        apiResponse: await res.json(),
        messageContent
      };
    },
    onSuccess: (data) => {
      setMessage('');
      queryClient.invalidateQueries({ queryKey: ['/api/conversations', conversation.id] });
      
      // Get the message content from the returned data
      const messageContent = data?.messageContent;
      
      // Also send via Firebase for real-time delivery
      if (user && isInitialized && messageContent) {
        // Log that we're sending a message
        console.log('In-app message submitted:', {
          message: messageContent,
          propertyId: conversation.propertyId,
          ownerId: otherParticipant?.userId,
          senderId: user.id
        });
        
        // Send to Firebase
        sendFirebaseMessage({
          conversationId: conversation.id,
          senderId: user.id,
          content: messageContent,
          read: false
        });
      }
    }
  });
  
  const getOtherParticipant = () => {
    if (!user) return null;
    return conversationData.participants.find((p: ConversationParticipant) => p.userId !== user.id);
  };
  
  const otherParticipant = getOtherParticipant();
  
  // Subscribe to Firebase messages
  useEffect(() => {
    if (!isInitialized || !user) return;
    
    console.log('Setting up Firebase message subscription for conversation:', conversation.id);
    
    // Initial message load
    const loadMessages = async () => {
      try {
        // Clear existing messages first to avoid duplicates
        setFirebaseMessages([]);
        
        // Use firebaseMessagingService directly
        const messages = await firebaseMessagingService.getConversationMessages(conversation.id);
        console.log(`Loaded ${messages.length} messages for conversation ${conversation.id}`);
        
        // Set all messages at once
        setFirebaseMessages(messages);
      } catch (error) {
        console.error('Error loading messages:', error);
      }
    };
    
    loadMessages();
    
    // Subscribe to new messages
    const handleNewMessage = (message: FirebaseMessage) => {
      console.log('New message received:', message);
      
      // Add to local state
      setFirebaseMessages(prev => {
        // Check if message already exists
        const exists = prev.some(m => m.id === message.id);
        if (exists) {
          console.log('Message already exists in state, not adding');
          return prev;
        }
        
        console.log('Adding new message to state');
        
        // Add new message and sort
        const newMessages = [...prev, message];
        return newMessages.sort((a, b) => 
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
      });
      
      // Mark as read if from other user
      if (message.senderId !== user.id && message.id) {
        console.log('Marking message as read:', message.id);
        markMessageAsRead(conversation.id, message.id);
      }
      
      // Refresh conversation list to update unread counts
      queryClient.invalidateQueries({ queryKey: ['/api/conversations'] });
    };
    
    // Subscribe to typing status
    const handleTypingStatus = (data: { userId: number, isTyping: boolean }) => {
      if (data.userId !== user.id) {
        setTypingUserId(data.userId);
        setIsTyping(data.isTyping);
      }
    };
    
    // Register listeners
    subscribeToMessages(conversation.id, handleNewMessage);
    subscribeToTypingStatus(conversation.id, handleTypingStatus);
    
    return () => {
      // Clean up listeners
      unsubscribeFromMessages(conversation.id);
      unsubscribeFromTypingStatus(conversation.id);
    };
  }, [conversation.id, isInitialized, user, subscribeToMessages, unsubscribeFromMessages, 
      subscribeToTypingStatus, unsubscribeFromTypingStatus, markMessageAsRead, queryClient]);
  
  // Handle typing status
  const handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    
    // Send typing status via Firebase
    if (isInitialized) {
      setTypingStatus(conversation.id, true);
    }
    
    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Set new timeout for stopping typing
    typingTimeoutRef.current = setTimeout(() => {
      if (isInitialized) {
        setTypingStatus(conversation.id, false);
      }
    }, 3000);
  };
  
  // Scroll to bottom when Firebase messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [firebaseMessages]);
  
  // Clear timeout on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      sendMessageMutation.mutate();
    }
  };
  
  const formatMessageDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, 'h:mm a');
  };
  
  return (
    <div className="flex flex-col h-full">
      <div className="p-3 border-b flex items-center gap-3">
        <Button 
          variant="ghost" 
          size="icon"
          className="h-8 w-8 lg:hidden"
          onClick={onBack}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        
        <Avatar className="h-9 w-9">
          <AvatarImage 
            src={otherParticipant?.profilePicture || ''} 
            alt={otherParticipant?.firstName || 'User'} 
          />
          <AvatarFallback className="bg-primary text-primary-foreground">
            {otherParticipant?.firstName?.[0] || otherParticipant?.email?.[0]?.toUpperCase() || 'U'}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm truncate">
            {otherParticipant?.firstName && otherParticipant?.lastName
              ? `${otherParticipant.firstName} ${otherParticipant.lastName}`
              : otherParticipant?.email?.split('@')[0] || 'User'}
          </p>
          
          {property && (
            <p className="text-xs text-muted-foreground truncate flex items-center gap-1">
              <Building className="h-3 w-3" />
              {property.title}
            </p>
          )}
        </div>
        
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => {
            // Show property details or participant details
          }}
        >
          <Info className="h-4 w-4" />
        </Button>
      </div>
      
      <ScrollArea className="flex-1" ref={scrollAreaRef}>
        <div className="p-4 space-y-4">
          {/* Property info card at the top */}
          {property && (
            <div className="bg-muted rounded-lg p-3 mb-6">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 bg-primary/10 rounded-md flex items-center justify-center text-primary">
                  <Building className="h-6 w-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">{property.title}</p>
                  <p className="text-xs text-muted-foreground truncate">{property.address}</p>
                  <p className="text-xs font-medium">${property.price}/month</p>
                </div>
                {property.images && property.images.length > 0 && (
                  <div 
                    className="h-14 w-14 rounded-md bg-cover bg-center shrink-0"
                    style={{ backgroundImage: `url(${property.images[0]})` }}
                  />
                )}
              </div>
            </div>
          )}
          
          {/* Welcome message if no messages */}
          {(!firebaseMessages || firebaseMessages.length === 0) && (
            <div className="text-center my-8">
              <div className="bg-primary/10 h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-medium">Start a conversation</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Send a message to {otherParticipant?.firstName || 'the landlord'} about this property
              </p>
            </div>
          )}
          
          {/* Firebase Messages */}
          {firebaseMessages.map((msg: FirebaseMessage, index: number) => {
            const isSentByMe = msg.senderId === user?.id;
            const showAvatar = 
              index === 0 || 
              firebaseMessages[index - 1].senderId !== msg.senderId;
            
            return (
              <div 
                key={msg.id || index} 
                className={cn(
                  "flex",
                  isSentByMe ? "justify-end" : "justify-start"
                )}
              >
                <div className={cn(
                  "flex gap-2 max-w-[80%]",
                  isSentByMe ? "flex-row-reverse" : "flex-row"
                )}>
                  {!isSentByMe && showAvatar && (
                    <Avatar className="h-8 w-8 mt-1">
                      <AvatarImage 
                        src={otherParticipant?.profilePicture || ''} 
                        alt={otherParticipant?.firstName || 'User'} 
                      />
                      <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                        {otherParticipant?.firstName?.[0] || otherParticipant?.email?.[0]?.toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                  )}
                  
                  {!isSentByMe && !showAvatar && <div className="w-8" />}
                  
                  <div>
                    <div 
                      className={cn(
                        "rounded-lg px-3 py-2 text-sm inline-block",
                        isSentByMe 
                          ? "bg-primary text-primary-foreground rounded-tr-none" 
                          : "bg-muted rounded-tl-none"
                      )}
                    >
                      {msg.content}
                    </div>
                    <div className={cn(
                      "text-xs text-muted-foreground mt-1",
                      isSentByMe ? "text-right" : "text-left"
                    )}>
                      {formatMessageDate(msg.createdAt ? new Date(msg.createdAt).toISOString() : new Date().toISOString())}
                      {isSentByMe && msg.read && (
                        <span className="ml-1 text-blue-500">✓</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          
          {/* Typing indicator */}
          {isTyping && (
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <div className="flex space-x-1">
                <div className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
              <span>Typing...</span>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>
      
      <form 
        onSubmit={handleSubmit}
        className="border-t p-3 flex items-end gap-2"
      >
        <Textarea
          placeholder="Type a message..."
          className="min-h-[60px] max-h-[120px]"
          value={message}
          onChange={handleMessageChange}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              if (message.trim()) {
                sendMessageMutation.mutate();
              }
            }
          }}
        />
        <Button 
          type="submit" 
          size="icon" 
          className="h-10 w-10 shrink-0"
          disabled={sendMessageMutation.isPending || !message.trim()}
        >
          {sendMessageMutation.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </form>
    </div>
  );
}