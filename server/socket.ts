import { Server as SocketServer } from 'socket.io';
import { storage } from './storage';
import { log } from './vite';

// Store connected users with their socket IDs
const connectedUsers: Map<number, string[]> = new Map();

// Track which rooms users are in
const userRooms: Map<string, number[]> = new Map();

export function setupSocketHandlers(io: SocketServer) {
  io.on('connection', socket => {
    const userId = Number(socket.handshake.query.userId);
    
    if (isNaN(userId)) {
      log(`Socket connection rejected: invalid userId`, 'socket');
      socket.disconnect();
      return;
    }
    
    log(`User ${userId} connected with socket ${socket.id}`, 'socket');
    
    // Register the user connection
    if (!connectedUsers.has(userId)) {
      connectedUsers.set(userId, []);
    }
    connectedUsers.get(userId)?.push(socket.id);
    
    // Join conversation handler
    socket.on('join_conversation', async ({ conversationId }) => {
      const roomName = `conversation:${conversationId}`;
      socket.join(roomName);
      
      // Keep track of which conversations the user is in
      if (!userRooms.has(socket.id)) {
        userRooms.set(socket.id, []);
      }
      userRooms.get(socket.id)?.push(conversationId);
      
      log(`User ${userId} joined conversation ${conversationId}`, 'socket');
    });
    
    // Leave conversation handler
    socket.on('leave_conversation', ({ conversationId }) => {
      const roomName = `conversation:${conversationId}`;
      socket.leave(roomName);
      
      // Update tracking
      const userConversations = userRooms.get(socket.id) || [];
      const updatedConversations = userConversations.filter(id => id !== conversationId);
      userRooms.set(socket.id, updatedConversations);
      
      log(`User ${userId} left conversation ${conversationId}`, 'socket');
    });
    
    // New message handler
    socket.on('new_message', async (message) => {
      try {
        const { conversationId, senderId, content } = message;
        
        if (!conversationId || !senderId || !content) {
          socket.emit('error', { message: 'Missing required fields for message' });
          return;
        }
        
        // Create message in storage
        const newMessage = await storage.createMessage({
          conversationId,
          senderId,
          content,
          read: false
        });
        
        // Update conversation last activity time
        await storage.updateConversation(conversationId, { lastMessageAt: new Date() });
        
        // Get participants to notify
        const participants = await storage.getConversationParticipants(conversationId);
        
        // Create notification for other participants
        for (const participant of participants) {
          if (participant.userId !== senderId) {
            await storage.createNotification({
              userId: participant.userId,
              type: 'message',
              title: 'New Message',
              content: content.length > 50 ? content.substring(0, 47) + '...' : content,
              relatedId: conversationId,
              relatedType: 'conversation',
              read: false
            });
            
            // Emit to all connected devices of this user
            const recipientSockets = connectedUsers.get(participant.userId) || [];
            for (const socketId of recipientSockets) {
              io.to(socketId).emit('notification', {
                type: 'message',
                conversation: conversationId
              });
            }
          }
        }
        
        // Broadcast to the conversation room
        io.to(`conversation:${conversationId}`).emit('new_message', newMessage);
        
        log(`New message from user ${senderId} in conversation ${conversationId}`, 'socket');
      } catch (error) {
        console.error('Error processing new message:', error);
        socket.emit('error', { message: 'Failed to process message' });
      }
    });
    
    // User typing handler
    socket.on('user_typing', ({ conversationId, userId }) => {
      socket.to(`conversation:${conversationId}`).emit('user_typing', { userId, conversationId });
    });
    
    // User stopped typing handler
    socket.on('user_stopped_typing', ({ conversationId, userId }) => {
      socket.to(`conversation:${conversationId}`).emit('user_stopped_typing', { userId, conversationId });
    });
    
    // Mark message as read handler
    socket.on('message_read', async ({ messageId, conversationId }) => {
      try {
        // Find the message and mark as read
        await storage.markConversationAsRead(conversationId, userId);
        
        // Notify others in the conversation that message was read
        socket.to(`conversation:${conversationId}`).emit('message_read', { 
          messageId, 
          conversationId,
          readBy: userId 
        });
        
        log(`User ${userId} marked message ${messageId} as read`, 'socket');
      } catch (error) {
        console.error('Error marking message as read:', error);
        socket.emit('error', { message: 'Failed to mark message as read' });
      }
    });
    
    // Handle disconnect
    socket.on('disconnect', () => {
      log(`User ${userId} disconnected from socket ${socket.id}`, 'socket');
      
      // Clean up socket from connected users
      const userSockets = connectedUsers.get(userId) || [];
      const updatedSockets = userSockets.filter(id => id !== socket.id);
      
      if (updatedSockets.length === 0) {
        connectedUsers.delete(userId);
      } else {
        connectedUsers.set(userId, updatedSockets);
      }
      
      // Clean up user rooms
      userRooms.delete(socket.id);
    });
  });
  
  return io;
}