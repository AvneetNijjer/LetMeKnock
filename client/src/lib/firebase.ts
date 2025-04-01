import { initializeApp } from 'firebase/app';
import { 
  getDatabase, 
  ref, 
  set, 
  onValue, 
  push, 
  get, 
  query, 
  orderByChild, 
  update,
  serverTimestamp,
  off
} from 'firebase/database';

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Messaging types
export type FirebaseMessage = {
  id?: string;
  conversationId: number;
  senderId: number;
  content: string;
  read: boolean;
  createdAt: any; // Firebase timestamp
};

export type MessageListener = (message: FirebaseMessage) => void;
export type TypingStatusListener = (data: { userId: number, isTyping: boolean }) => void;

// Messaging service
export class FirebaseMessagingService {
  private userId: number | null = null;
  private messageListeners: Map<number, MessageListener[]> = new Map();
  private typingStatusListeners: Map<number, TypingStatusListener[]> = new Map();
  
  // Initialize with user ID
  initialize(userId: number) {
    this.userId = userId;
    console.log('Firebase messaging initialized for user:', userId);
    return this;
  }
  
  // Create a unique conversation ID in Firebase format
  private getConversationPath(conversationId: number) {
    return `conversations/${conversationId}`;
  }
  
  // Send a message
  async sendMessage(message: Omit<FirebaseMessage, 'id' | 'createdAt'>) {
    if (!this.userId) {
      console.error('Cannot send message: User ID not set');
      return null;
    }
    
    try {
      console.log('Sending Firebase message:', message);
      
      // Check required fields
      if (!message.conversationId) {
        console.error('Missing conversationId in message');
        return null;
      }
      
      if (!message.senderId) {
        console.error('Missing senderId in message');
        return null;
      }
      
      if (!message.content) {
        console.error('Missing content in message');
        return null;
      }
      
      // Create message in Firebase
      const conversationRef = ref(db, `${this.getConversationPath(message.conversationId)}/messages`);
      const newMessageRef = push(conversationRef);
      
      // Generate current timestamp if Firebase serverTimestamp isn't working properly
      const clientTimestamp = new Date().toISOString();
      
      const messageData = {
        ...message,
        // Include both server and client timestamps
        createdAt: serverTimestamp(),
        clientTimestamp: clientTimestamp
      };
      
      // Set the message data
      await set(newMessageRef, messageData);
      
      // Update last message timestamp on the conversation
      await update(ref(db, this.getConversationPath(message.conversationId)), {
        lastMessageAt: serverTimestamp(),
        lastClientTimestamp: clientTimestamp
      });
      
      // Get message with ID for return
      const result = { 
        id: newMessageRef.key, 
        ...messageData, 
        createdAt: new Date() // Use local date for immediate display
      };
      
      console.log('Message sent successfully:', result);
      return result;
    } catch (error) {
      console.error('Error sending message:', error);
      return null;
    }
  }
  
  // Subscribe to messages for a conversation
  subscribeToMessages(conversationId: number, callback: MessageListener) {
    if (!this.messageListeners.has(conversationId)) {
      this.messageListeners.set(conversationId, []);
    }
    
    this.messageListeners.get(conversationId)?.push(callback);
    
    const messagesRef = ref(db, `${this.getConversationPath(conversationId)}/messages`);
    
    // First get the current messages to establish a baseline
    get(messagesRef).then((snapshot) => {
      const data = snapshot.val();
      if (!data) return;
      
      // Convert object to array and add ids
      const messages = Object.entries(data).map(([id, message]: [string, any]) => ({
        id,
        ...message,
        // Convert server timestamp to Date if needed
        createdAt: message.createdAt ? new Date(message.createdAt) : new Date()
      }));
      
      // Sort by timestamp
      const sortedMessages = messages.sort((a, b) => 
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
      
      // Call the callback with each message to initialize the chat
      sortedMessages.forEach(message => {
        callback(message);
      });
    }).catch(error => {
      console.error("Error getting initial messages:", error);
    });
    
    // Then listen for changes/additions
    onValue(messagesRef, (snapshot) => {
      const data = snapshot.val();
      if (!data) return;
      
      // Process all messages including any new ones
      Object.entries(data).forEach(([id, messageData]: [string, any]) => {
        const message = {
          id,
          ...messageData,
          createdAt: messageData.createdAt ? new Date(messageData.createdAt) : new Date()
        };
        
        // Notify all listeners about this message
        this.messageListeners.get(conversationId)?.forEach(listener => {
          listener(message);
        });
      });
    });
    
    console.log(`Subscribed to messages for conversation: ${conversationId}`);
  }
  
  // Unsubscribe from messages for a conversation
  unsubscribeFromMessages(conversationId: number, callback?: MessageListener) {
    if (!this.messageListeners.has(conversationId)) return;
    
    if (callback) {
      // Remove specific listener
      const listeners = this.messageListeners.get(conversationId) || [];
      this.messageListeners.set(
        conversationId,
        listeners.filter(listener => listener !== callback)
      );
    } else {
      // Remove all listeners
      this.messageListeners.delete(conversationId);
    }
    
    // Remove Firebase listener
    const messagesRef = ref(db, `${this.getConversationPath(conversationId)}/messages`);
    off(messagesRef);
    
    console.log(`Unsubscribed from messages for conversation: ${conversationId}`);
  }
  
  // Set typing status
  async setTypingStatus(conversationId: number, isTyping: boolean) {
    if (!this.userId) return;
    
    try {
      await set(
        ref(db, `${this.getConversationPath(conversationId)}/typing/${this.userId}`), 
        isTyping ? { timestamp: serverTimestamp() } : null
      );
      
      console.log(`Typing status set to ${isTyping} for conversation: ${conversationId}`);
    } catch (error) {
      console.error('Error setting typing status:', error);
    }
  }
  
  // Subscribe to typing status changes
  subscribeToTypingStatus(conversationId: number, callback: TypingStatusListener) {
    if (!this.typingStatusListeners.has(conversationId)) {
      this.typingStatusListeners.set(conversationId, []);
    }
    
    this.typingStatusListeners.get(conversationId)?.push(callback);
    
    const typingRef = ref(db, `${this.getConversationPath(conversationId)}/typing`);
    
    // Listen for typing status changes
    onValue(typingRef, (snapshot) => {
      const data = snapshot.val();
      if (!data) return;
      
      // Notify about each user's typing status
      Object.entries(data).forEach(([userId, value]: [string, any]) => {
        const parsedUserId = parseInt(userId, 10);
        
        // Don't notify about our own typing status
        if (parsedUserId === this.userId) return;
        
        this.typingStatusListeners.get(conversationId)?.forEach(listener => {
          listener({ userId: parsedUserId, isTyping: !!value });
        });
      });
    });
    
    console.log(`Subscribed to typing status for conversation: ${conversationId}`);
  }
  
  // Unsubscribe from typing status changes
  unsubscribeFromTypingStatus(conversationId: number, callback?: TypingStatusListener) {
    if (!this.typingStatusListeners.has(conversationId)) return;
    
    if (callback) {
      // Remove specific listener
      const listeners = this.typingStatusListeners.get(conversationId) || [];
      this.typingStatusListeners.set(
        conversationId,
        listeners.filter(listener => listener !== callback)
      );
    } else {
      // Remove all listeners
      this.typingStatusListeners.delete(conversationId);
    }
    
    // Remove Firebase listener
    const typingRef = ref(db, `${this.getConversationPath(conversationId)}/typing`);
    off(typingRef);
    
    console.log(`Unsubscribed from typing status for conversation: ${conversationId}`);
  }
  
  // Mark message as read
  async markMessageAsRead(conversationId: number, messageId: string) {
    if (!this.userId) return;
    
    try {
      await update(
        ref(db, `${this.getConversationPath(conversationId)}/messages/${messageId}`), 
        { read: true }
      );
      
      console.log(`Message ${messageId} marked as read in conversation: ${conversationId}`);
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  }
  
  // Get all messages for a conversation
  async getConversationMessages(conversationId: number): Promise<FirebaseMessage[]> {
    try {
      console.log(`Fetching messages for conversation: ${conversationId}`);
      const messagesRef = query(
        ref(db, `${this.getConversationPath(conversationId)}/messages`),
        orderByChild('createdAt')
      );
      
      const snapshot = await get(messagesRef);
      const data = snapshot.val();
      
      if (!data) {
        console.log(`No messages found for conversation: ${conversationId}`);
        return [];
      }
      
      console.log(`Found messages for conversation: ${conversationId}`, Object.keys(data).length);
      
      // Convert object to array and add ids
      const messages = Object.entries(data).map(([id, message]: [string, any]) => {
        // Make sure all fields are present
        if (!message.content) {
          console.warn(`Message ${id} is missing content:`, message);
        }
        
        return {
          id,
          conversationId,
          senderId: message.senderId,
          content: message.content || '',
          read: !!message.read,
          // Convert server timestamp to Date if needed
          createdAt: message.createdAt ? new Date(message.createdAt) : new Date()
        };
      });
      
      // Sort by timestamp
      const sortedMessages = messages.sort((a, b) => 
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
      
      return sortedMessages;
    } catch (error) {
      console.error('Error getting conversation messages:', error);
      return [];
    }
  }
  
  // Clean up any listeners on unmount or user sign out
  cleanup() {
    // Clean up message listeners
    this.messageListeners.forEach((_, conversationId) => {
      this.unsubscribeFromMessages(conversationId);
    });
    
    // Clean up typing listeners
    this.typingStatusListeners.forEach((_, conversationId) => {
      this.unsubscribeFromTypingStatus(conversationId);
    });
    
    this.userId = null;
    console.log('Firebase messaging service cleaned up');
  }
}

// Create singleton instance
export const firebaseMessagingService = new FirebaseMessagingService();

export default firebaseMessagingService;