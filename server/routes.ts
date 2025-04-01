import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { Server as SocketServer } from "socket.io";
import { setupSocketHandlers } from "./socket";
import { insertUserSchema, insertBookmarkSchema, insertPropertySchema } from "@shared/schema";
import { z } from "zod";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";

export async function registerRoutes(app: Express): Promise<Server> {
  // User endpoints
  app.get("/api/users/:id", async (req: Request, res: Response) => {
    const userId = parseInt(req.params.id);
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }
    
    const user = await storage.getUser(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // Don't return sensitive information
    const { id, email, firstName, lastName, dateOfBirth, profilePicture, authProvider } = user;
    return res.json({ id, email, firstName, lastName, dateOfBirth, profilePicture, authProvider });
  });
  
  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      const { email, providerId, authProvider } = req.body;
      
      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }
      
      let user = await storage.getUserByEmail(email);
      
      if (!user && providerId) {
        // Try to find by provider ID
        user = await storage.getUserByProviderId(providerId);
      }
      
      if (!user) {
        // User doesn't exist, create a new one
        try {
          const userData = insertUserSchema.parse({
            email,
            providerId,
            authProvider: authProvider || "email",
          });
          
          user = await storage.createUser(userData);
        } catch (error) {
          if (error instanceof ZodError) {
            const validationError = fromZodError(error);
            return res.status(400).json({ message: validationError.message });
          }
          throw error;
        }
      }
      
      return res.status(200).json({
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        profilePicture: user.profilePicture
      });
    } catch (error) {
      console.error("Login error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.put("/api/users/:id", async (req: Request, res: Response) => {
    const userId = parseInt(req.params.id);
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }
    
    try {
      const userData = insertUserSchema.partial().parse(req.body);
      const updatedUser = await storage.updateUser(userId, userData);
      
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const { id, email, firstName, lastName, dateOfBirth, profilePicture } = updatedUser;
      return res.json({ id, email, firstName, lastName, dateOfBirth, profilePicture });
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Property endpoints
  app.get("/api/properties", async (_req: Request, res: Response) => {
    try {
      const properties = await storage.getAllProperties();
      return res.json(properties);
    } catch (error) {
      console.error("Error fetching properties:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.get("/api/properties/featured", async (_req: Request, res: Response) => {
    try {
      const featuredProperties = await storage.getFeaturedProperties();
      return res.json(featuredProperties);
    } catch (error) {
      console.error("Error fetching featured properties:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.get("/api/properties/:id", async (req: Request, res: Response) => {
    const propertyId = parseInt(req.params.id);
    if (isNaN(propertyId)) {
      return res.status(400).json({ message: "Invalid property ID" });
    }
    
    const property = await storage.getProperty(propertyId);
    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }
    
    return res.json(property);
  });
  
  // Filter properties by type and campus
  app.get("/api/properties/filter", async (req: Request, res: Response) => {
    try {
      const { type, campus } = req.query;
      let filteredProperties;
      
      if (type && typeof type === 'string') {
        filteredProperties = await storage.getPropertiesByType(type);
      } else if (campus && typeof campus === 'string') {
        filteredProperties = await storage.getPropertiesByCampus(campus);
      } else {
        filteredProperties = await storage.getAllProperties();
      }
      
      return res.json(filteredProperties);
    } catch (error) {
      console.error("Error filtering properties:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Bookmark endpoints
  app.get("/api/users/:userId/bookmarks", async (req: Request, res: Response) => {
    const userId = parseInt(req.params.userId);
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }
    
    try {
      const bookmarks = await storage.getBookmarksByUserId(userId);
      return res.json(bookmarks);
    } catch (error) {
      console.error("Error fetching bookmarks:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.post("/api/bookmarks", async (req: Request, res: Response) => {
    try {
      const bookmarkData = insertBookmarkSchema.parse(req.body);
      const bookmark = await storage.createBookmark(bookmarkData);
      return res.status(201).json(bookmark);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.delete("/api/bookmarks", async (req: Request, res: Response) => {
    try {
      const { userId, propertyId } = req.body;
      
      if (!userId || !propertyId) {
        return res.status(400).json({ message: "User ID and property ID are required" });
      }
      
      const userIdNum = parseInt(userId);
      const propertyIdNum = parseInt(propertyId);
      
      if (isNaN(userIdNum) || isNaN(propertyIdNum)) {
        return res.status(400).json({ message: "Invalid user ID or property ID" });
      }
      
      const success = await storage.deleteBookmark(userIdNum, propertyIdNum);
      
      if (!success) {
        return res.status(404).json({ message: "Bookmark not found" });
      }
      
      return res.status(200).json({ message: "Bookmark deleted successfully" });
    } catch (error) {
      console.error("Error deleting bookmark:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Create property listing
  app.post("/api/properties", async (req: Request, res: Response) => {
    try {
      const propertyData = insertPropertySchema.parse(req.body);
      const newProperty = await storage.createProperty(propertyData);
      return res.status(201).json(newProperty);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      console.error("Error creating property:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Update property listing
  app.put("/api/properties/:id", async (req: Request, res: Response) => {
    const propertyId = parseInt(req.params.id);
    if (isNaN(propertyId)) {
      return res.status(400).json({ message: "Invalid property ID" });
    }
    
    try {
      const propertyData = insertPropertySchema.partial().parse(req.body);
      const updatedProperty = await storage.updateProperty(propertyId, propertyData);
      
      if (!updatedProperty) {
        return res.status(404).json({ message: "Property not found" });
      }
      
      return res.json(updatedProperty);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      console.error("Error updating property:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Delete property listing
  app.delete("/api/properties/:id", async (req: Request, res: Response) => {
    const propertyId = parseInt(req.params.id);
    if (isNaN(propertyId)) {
      return res.status(400).json({ message: "Invalid property ID" });
    }
    
    try {
      // Note: deleteProperty method needs to be implemented in storage.ts
      const success = await storage.deleteProperty(propertyId);
      
      if (!success) {
        return res.status(404).json({ message: "Property not found" });
      }
      
      return res.status(200).json({ message: "Property deleted successfully" });
    } catch (error) {
      console.error("Error deleting property:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Get properties by owner
  app.get("/api/properties/owner/:ownerId", async (req: Request, res: Response) => {
    const ownerId = parseInt(req.params.ownerId);
    if (isNaN(ownerId)) {
      return res.status(400).json({ message: "Invalid owner ID" });
    }
    
    try {
      const properties = await storage.getPropertiesByOwner(ownerId);
      return res.json(properties);
    } catch (error) {
      console.error("Error fetching owner's properties:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Messaging and Notification Routes
  app.get("/api/conversations", async (req: Request, res: Response) => {
    try {
      const userId = req.query.userId ? parseInt(req.query.userId as string) : undefined;
      if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
      }
      
      const conversations = await storage.getConversationsByUserId(userId);
      return res.status(200).json(conversations);
    } catch (error) {
      console.error("Error fetching conversations:", error);
      return res.status(500).json({ message: "Failed to fetch conversations" });
    }
  });
  
  app.get("/api/conversations/:id", async (req: Request, res: Response) => {
    try {
      const conversationId = parseInt(req.params.id);
      if (isNaN(conversationId)) {
        return res.status(400).json({ message: "Invalid conversation ID" });
      }
      
      const conversation = await storage.getConversationById(conversationId);
      if (!conversation) {
        return res.status(404).json({ message: "Conversation not found" });
      }
      
      return res.status(200).json(conversation);
    } catch (error) {
      console.error("Error fetching conversation:", error);
      return res.status(500).json({ message: "Failed to fetch conversation" });
    }
  });
  
  app.post("/api/conversations", async (req: Request, res: Response) => {
    try {
      const { userId, propertyId, receiverId, message } = req.body;
      
      if (!userId || !propertyId || !receiverId || !message) {
        return res.status(400).json({ message: "Missing required fields" });
      }
      
      // Create or get conversation
      let conversation = await storage.getConversationByParticipants(userId, receiverId, propertyId);
      
      if (!conversation) {
        conversation = await storage.createConversation({
          propertyId,
          lastMessageAt: new Date()
        });
        
        // Add participants
        await storage.addConversationParticipant({
          conversationId: conversation.id,
          userId
        });
        
        await storage.addConversationParticipant({
          conversationId: conversation.id,
          userId: receiverId
        });
      }
      
      // Add message
      const newMessage = await storage.createMessage({
        conversationId: conversation.id,
        senderId: userId,
        content: message,
        read: false
      });
      
      // Update conversation last message time
      await storage.updateConversation(conversation.id, { lastMessageAt: new Date() });
      
      // Create notification for receiver
      await storage.createNotification({
        userId: receiverId,
        type: 'message',
        title: 'New Message',
        content: message.length > 50 ? message.substring(0, 47) + '...' : message,
        relatedId: conversation.id,
        relatedType: 'conversation',
        read: false
      });
      
      return res.status(201).json({ conversation, message: newMessage });
    } catch (error) {
      console.error("Error creating conversation:", error);
      return res.status(500).json({ message: "Failed to create conversation" });
    }
  });
  
  app.post("/api/conversations/:id/messages", async (req: Request, res: Response) => {
    try {
      const conversationId = parseInt(req.params.id);
      const { content, senderId } = req.body;
      
      if (!content || !senderId) {
        return res.status(400).json({ message: "Content and sender ID are required" });
      }
      
      const conversation = await storage.getConversationById(conversationId);
      if (!conversation) {
        return res.status(404).json({ message: "Conversation not found" });
      }
      
      // Find the recipient (the other participant)
      const participants = await storage.getConversationParticipants(conversationId);
      const recipient = participants.find(p => p.userId !== senderId);
      
      if (!recipient) {
        return res.status(404).json({ message: "Recipient not found" });
      }
      
      // Create message
      const message = await storage.createMessage({
        conversationId,
        senderId,
        content,
        read: false
      });
      
      // Update conversation last message time
      await storage.updateConversation(conversationId, { lastMessageAt: new Date() });
      
      // Create notification
      await storage.createNotification({
        userId: recipient.userId,
        type: 'message',
        title: 'New Message',
        content: content.length > 50 ? content.substring(0, 47) + '...' : content,
        relatedId: conversationId,
        relatedType: 'conversation',
        read: false
      });
      
      return res.status(201).json(message);
    } catch (error) {
      console.error("Error sending message:", error);
      return res.status(500).json({ message: "Failed to send message" });
    }
  });
  
  app.put("/api/conversations/:id/read", async (req: Request, res: Response) => {
    try {
      const conversationId = parseInt(req.params.id);
      const { userId } = req.body;
      
      if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
      }
      
      await storage.markConversationAsRead(conversationId, userId);
      return res.status(200).json({ success: true });
    } catch (error) {
      console.error("Error marking conversation as read:", error);
      return res.status(500).json({ message: "Failed to mark conversation as read" });
    }
  });
  
  app.get("/api/notifications", async (req: Request, res: Response) => {
    try {
      const userId = req.query.userId ? parseInt(req.query.userId as string) : undefined;
      
      if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
      }
      
      const notifications = await storage.getNotificationsByUserId(userId);
      return res.status(200).json(notifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      return res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });
  
  app.put("/api/notifications/:id/read", async (req: Request, res: Response) => {
    try {
      const notificationId = parseInt(req.params.id);
      
      if (isNaN(notificationId)) {
        return res.status(400).json({ message: "Invalid notification ID" });
      }
      
      await storage.markNotificationAsRead(notificationId);
      return res.status(200).json({ success: true });
    } catch (error) {
      console.error("Error marking notification as read:", error);
      return res.status(500).json({ message: "Failed to mark notification as read" });
    }
  });
  
  app.put("/api/notifications/read-all", async (req: Request, res: Response) => {
    try {
      const { userId } = req.body;
      
      if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
      }
      
      await storage.markAllNotificationsAsRead(userId);
      return res.status(200).json({ success: true });
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      return res.status(500).json({ message: "Failed to mark all notifications as read" });
    }
  });
  
  app.get("/api/unread-counts", async (req: Request, res: Response) => {
    try {
      const userId = req.query.userId ? parseInt(req.query.userId as string) : undefined;
      
      if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
      }
      
      const messageCount = await storage.getUnreadMessageCount(userId);
      const notificationCount = await storage.getUnreadNotificationCount(userId);
      
      return res.status(200).json({
        messages: messageCount,
        notifications: notificationCount
      });
    } catch (error) {
      console.error("Error fetching unread counts:", error);
      return res.status(500).json({ message: "Failed to fetch unread counts" });
    }
  });

  const httpServer = createServer(app);
  
  // Initialize Socket.IO server
  const io = new SocketServer(httpServer, {
    path: '/api/socket',
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    }
  });
  
  // Set up socket.io connection handling
  setupSocketHandlers(io);
  
  return httpServer;
}
