import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/auth-context';
import firebaseMessagingService, { 
  FirebaseMessage, 
  MessageListener, 
  TypingStatusListener 
} from '@/lib/firebase';

export default function useFirebaseMessaging() {
  const { user } = useAuth();
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Initialize Firebase messaging when user is authenticated
  useEffect(() => {
    if (user?.id && !isInitialized) {
      firebaseMessagingService.initialize(user.id);
      setIsInitialized(true);
    }
    
    return () => {
      // Clean up on unmount
      if (isInitialized) {
        firebaseMessagingService.cleanup();
        setIsInitialized(false);
      }
    };
  }, [user?.id, isInitialized]);
  
  // Wrap Firebase messaging methods in React hooks
  const sendMessage = useCallback((message: Omit<FirebaseMessage, 'id' | 'createdAt'>) => {
    return firebaseMessagingService.sendMessage(message);
  }, []);
  
  const subscribeToMessages = useCallback((conversationId: number, callback: MessageListener) => {
    firebaseMessagingService.subscribeToMessages(conversationId, callback);
  }, []);
  
  const unsubscribeFromMessages = useCallback((conversationId: number, callback?: MessageListener) => {
    firebaseMessagingService.unsubscribeFromMessages(conversationId, callback);
  }, []);
  
  const setTypingStatus = useCallback((conversationId: number, isTyping: boolean) => {
    firebaseMessagingService.setTypingStatus(conversationId, isTyping);
  }, []);
  
  const subscribeToTypingStatus = useCallback((conversationId: number, callback: TypingStatusListener) => {
    firebaseMessagingService.subscribeToTypingStatus(conversationId, callback);
  }, []);
  
  const unsubscribeFromTypingStatus = useCallback((conversationId: number, callback?: TypingStatusListener) => {
    firebaseMessagingService.unsubscribeFromTypingStatus(conversationId, callback);
  }, []);
  
  const markMessageAsRead = useCallback((conversationId: number, messageId: string) => {
    firebaseMessagingService.markMessageAsRead(conversationId, messageId);
  }, []);
  
  const getConversationMessages = useCallback((conversationId: number) => {
    return firebaseMessagingService.getConversationMessages(conversationId);
  }, []);
  
  return {
    isInitialized,
    sendMessage,
    subscribeToMessages,
    unsubscribeFromMessages,
    setTypingStatus,
    subscribeToTypingStatus,
    unsubscribeFromTypingStatus,
    markMessageAsRead,
    getConversationMessages,
  };
}