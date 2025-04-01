import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/auth-context';
import { socketService, SocketEvent } from '@/lib/socket';

export default function useSocket() {
  const { user } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  
  // Connect to the socket service when the user is authenticated
  useEffect(() => {
    const connectSocket = () => {
      if (user?.id && !socketService.isConnected()) {
        socketService.connect(user.id);
      }
    };
    
    const setupListeners = () => {
      socketService.on('connect', () => {
        setIsConnected(true);
      });
      
      socketService.on('disconnect', () => {
        setIsConnected(false);
      });
    };
    
    connectSocket();
    setupListeners();
    
    return () => {
      socketService.off('connect');
      socketService.off('disconnect');
    };
  }, [user?.id]);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (socketService.isConnected()) {
        socketService.disconnect();
      }
    };
  }, []);
  
  // Expose socket service methods
  const sendMessage = useCallback((message: { conversationId: number, senderId: number, content: string }) => {
    socketService.sendMessage(message);
  }, []);
  
  const joinConversation = useCallback((conversationId: number) => {
    socketService.joinConversation(conversationId);
  }, []);
  
  const leaveConversation = useCallback((conversationId: number) => {
    socketService.leaveConversation(conversationId);
  }, []);
  
  const sendTypingStatus = useCallback((conversationId: number, isTyping: boolean) => {
    socketService.sendTypingStatus(conversationId, isTyping);
  }, []);
  
  const markMessageAsRead = useCallback((messageId: number, conversationId: number) => {
    socketService.markMessageAsRead(messageId, conversationId);
  }, []);
  
  const on = useCallback((event: SocketEvent, callback: (...args: any[]) => void) => {
    socketService.on(event, callback);
  }, []);
  
  const off = useCallback((event: SocketEvent, callback?: (...args: any[]) => void) => {
    socketService.off(event, callback);
  }, []);
  
  return {
    isConnected,
    sendMessage,
    joinConversation,
    leaveConversation,
    sendTypingStatus,
    markMessageAsRead,
    on,
    off
  };
}