import { io, Socket } from 'socket.io-client';
import { Message } from '@shared/schema';

// Define event types
export type SocketEvent = 
  | 'connect'
  | 'disconnect'
  | 'new_message'
  | 'notification'
  | 'user_typing'
  | 'user_stopped_typing'
  | 'message_read'
  | 'join_conversation'
  | 'leave_conversation';

class SocketService {
  private socket: Socket | null = null;
  private userId: number | null = null;
  private listeners: Map<string, Array<(...args: any[]) => void>> = new Map();

  connect(userId: number) {
    if (this.socket) {
      this.disconnect();
    }

    this.userId = userId;
    this.socket = io('/', {
      path: '/api/socket',
      transports: ['websocket', 'polling'],
      query: { userId: userId.toString() }
    });

    this.setupListeners();
    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.userId = null;
    }
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  joinConversation(conversationId: number) {
    if (this.socket && this.isConnected()) {
      this.socket.emit('join_conversation', { conversationId });
    }
  }

  leaveConversation(conversationId: number) {
    if (this.socket && this.isConnected()) {
      this.socket.emit('leave_conversation', { conversationId });
    }
  }

  sendMessage(message: Omit<Message, 'id' | 'createdAt'>) {
    if (this.socket && this.isConnected()) {
      this.socket.emit('new_message', message);
    }
  }

  sendTypingStatus(conversationId: number, isTyping: boolean) {
    if (this.socket && this.isConnected()) {
      this.socket.emit(
        isTyping ? 'user_typing' : 'user_stopped_typing',
        { conversationId, userId: this.userId }
      );
    }
  }

  markMessageAsRead(messageId: number, conversationId: number) {
    if (this.socket && this.isConnected()) {
      this.socket.emit('message_read', { messageId, conversationId });
    }
  }

  on(event: SocketEvent, callback: (...args: any[]) => void) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)?.push(callback);

    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  off(event: SocketEvent, callback?: (...args: any[]) => void) {
    if (callback && this.listeners.has(event)) {
      const callbacks = this.listeners.get(event);
      if (callbacks) {
        const index = callbacks.indexOf(callback);
        if (index !== -1) {
          callbacks.splice(index, 1);
        }
      }
    } else {
      this.listeners.delete(event);
    }

    if (this.socket) {
      if (callback) {
        this.socket.off(event, callback);
      } else {
        this.socket.off(event);
      }
    }
  }

  private setupListeners() {
    if (!this.socket) return;

    // Re-attach all listeners
    this.listeners.forEach((callbacks, event) => {
      callbacks.forEach(callback => {
        this.socket?.on(event, callback);
      });
    });
  }
}

// Singleton instance
export const socketService = new SocketService();
export default socketService;