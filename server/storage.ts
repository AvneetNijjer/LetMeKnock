import { 
  users, User, InsertUser, 
  properties, Property, InsertProperty,
  bookmarks, Bookmark, InsertBookmark,
  bookings, Booking, InsertBooking,
  conversations, Conversation, InsertConversation,
  conversationParticipants, ConversationParticipant, InsertConversationParticipant,
  messages, Message, InsertMessage,
  notifications, Notification, InsertNotification
} from "@shared/schema";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByProviderId(providerId: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined>;
  
  // Property operations
  getProperty(id: number): Promise<Property | undefined>;
  getAllProperties(): Promise<Property[]>;
  getFeaturedProperties(): Promise<Property[]>;
  getPropertiesByType(propertyType: string): Promise<Property[]>;
  getPropertiesByCampus(campus: string): Promise<Property[]>;
  getPropertiesByOwner(ownerId: number): Promise<Property[]>;
  createProperty(property: InsertProperty): Promise<Property>;
  updateProperty(id: number, property: Partial<InsertProperty>): Promise<Property | undefined>;
  deleteProperty(id: number): Promise<boolean>;
  
  // Bookmark operations
  getBookmarksByUserId(userId: number): Promise<Bookmark[]>;
  createBookmark(bookmark: InsertBookmark): Promise<Bookmark>;
  deleteBookmark(userId: number, propertyId: number): Promise<boolean>;
  
  // Booking/Viewing operations
  getBooking(id: number): Promise<Booking | undefined>;
  getBookingsByUserId(userId: number): Promise<Booking[]>;
  getBookingsByPropertyId(propertyId: number): Promise<Booking[]>;
  getBookingsByOwnerId(ownerId: number): Promise<Booking[]>;
  createBooking(booking: InsertBooking): Promise<Booking>;
  updateBooking(id: number, booking: Partial<InsertBooking>): Promise<Booking | undefined>;
  deleteBooking(id: number): Promise<boolean>;
  
  // Messaging operations
  getConversationsByUserId(userId: number): Promise<any[]>;
  getConversationById(id: number): Promise<any | undefined>;
  getConversationByParticipants(userId: number, receiverId: number, propertyId?: number): Promise<any | undefined>;
  createConversation(conversation: { propertyId: number, lastMessageAt: Date }): Promise<any>;
  updateConversation(id: number, data: { lastMessageAt: Date }): Promise<any | undefined>;
  addConversationParticipant(participant: { conversationId: number, userId: number }): Promise<any>;
  getConversationParticipants(conversationId: number): Promise<any[]>;
  createMessage(message: { conversationId: number, senderId: number, content: string, read: boolean }): Promise<any>;
  markConversationAsRead(conversationId: number, userId: number): Promise<void>;
  getUnreadMessageCount(userId: number): Promise<number>;
  
  // Notification operations
  getNotificationsByUserId(userId: number): Promise<Notification[]>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  markNotificationAsRead(id: number): Promise<void>;
  markAllNotificationsAsRead(userId: number): Promise<void>;
  getUnreadNotificationCount(userId: number): Promise<number>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private properties: Map<number, Property>;
  private bookmarks: Map<number, Bookmark>;
  private bookings: Map<number, Booking>;
  private conversations: Map<number, Conversation>;
  private conversationParticipants: Map<number, ConversationParticipant>;
  private messages: Map<number, Message>;
  private notifications: Map<number, Notification>;
  userId: number;
  propertyId: number;
  bookmarkId: number;
  bookingId: number;
  conversationId: number;
  participantId: number;
  messageId: number;
  notificationId: number;

  constructor() {
    this.users = new Map();
    this.properties = new Map();
    this.bookmarks = new Map();
    this.bookings = new Map();
    this.conversations = new Map();
    this.conversationParticipants = new Map();
    this.messages = new Map();
    this.notifications = new Map();
    this.userId = 1;
    this.propertyId = 1;
    this.bookmarkId = 1;
    this.bookingId = 1;
    this.conversationId = 1;
    this.participantId = 1;
    this.messageId = 1;
    this.notificationId = 1;
    
    // Initialize with sample properties
    this.initializeProperties();
  }
  
  private initializeProperties() {
    // Make sure we properly handle all properties to match the schema
    const sampleProperties: Omit<Property, 'id' | 'createdAt' | 'updatedAt'>[] = [
      {
        title: "Cozy Student Suite",
        description: "A cozy suite perfect for students, close to campus and amenities. This beautiful property features modern appliances, high-speed internet, and is just a short walk from campus. The neighborhood is quiet and safe, ideal for focused studying.",
        price: 800,
        location: "Westdale",
        campus: "McMaster",
        bedrooms: 1,
        bathrooms: 1,
        propertyType: "Suite",
        furnished: true,
        address: "101 Sterling St, Hamilton, ON",
        city: "Hamilton",
        state: "ON",
        zipCode: "L8S 2P2",
        distance: "5 min walk to campus",
        amenities: ["Wi-Fi", "Laundry", "Utilities Included", "Air Conditioning", "Heating"],
        images: [
          "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80"
        ],
        featured: true,
        rating: 4,
        reviewCount: 12,
        ownerId: 1,
        latitude: "43.2612",
        longitude: "-79.9164",
        availableFrom: "2023-09-01",
        leaseTerms: "12 months",
        petsAllowed: false,
        distanceToCampus: "0.5",
        travelTime: 5,
        status: 'published'
      },
      {
        title: "Modern Student Apartment",
        description: "A modern apartment with all amenities included, perfect for students. This spacious property has been recently renovated with new flooring, kitchen appliances, and bathroom fixtures. Located in a vibrant neighborhood with easy access to public transportation and grocery stores.",
        price: 1200,
        location: "Ainslie Wood",
        campus: "McMaster",
        bedrooms: 2,
        bathrooms: 1,
        propertyType: "Apartment",
        furnished: true,
        address: "20 Emerson St, Hamilton, ON",
        city: "Hamilton",
        state: "ON",
        zipCode: "L8S 2X8",
        distance: "10 min walk to campus",
        amenities: ["Wi-Fi", "Laundry", "Parking", "Utilities Included", "Dishwasher", "Storage"],
        images: [
          "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80"
        ],
        featured: true,
        rating: 5,
        reviewCount: 8,
        ownerId: 1,
        latitude: "43.2569",
        longitude: "-79.9030",
        availableFrom: "2023-08-15",
        leaseTerms: "8 months",
        petsAllowed: true,
        distanceToCampus: "0.8",
        travelTime: 10,
        status: 'published'
      },
      {
        title: "Spacious Student House",
        description: "A spacious house with multiple bedrooms, perfect for a group of students. This charming property offers ample space for studying and socializing, with a large kitchen, comfortable living room, and spacious bedrooms. The backyard is perfect for outdoor gatherings during warmer months.",
        price: 2400,
        location: "Westdale",
        campus: "McMaster",
        bedrooms: 4,
        bathrooms: 2,
        propertyType: "House",
        furnished: false,
        address: "45 Thorndale St N, Hamilton, ON",
        city: "Hamilton",
        state: "ON",
        zipCode: "L8S 3B9",
        distance: "15 min walk to campus",
        amenities: ["Laundry", "Parking", "Backyard", "Basement", "Deck", "High-Speed Internet"],
        images: [
          "https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?auto=format&fit=crop&w=800&q=80"
        ],
        featured: false,
        rating: 4,
        reviewCount: 5,
        ownerId: 2,
        latitude: "43.2657",
        longitude: "-79.9080",
        availableFrom: "2023-09-01",
        leaseTerms: "12 months",
        petsAllowed: false,
        distanceToCampus: "1.2",
        travelTime: 15,
        status: 'published'
      },
      {
        title: "Luxury Student Condo",
        description: "A luxury condo with premium amenities, ideal for students who want comfort. This upscale property features high-end finishes, stainless steel appliances, and floor-to-ceiling windows with stunning views. The building offers 24/7 security, a fitness center, and study lounges.",
        price: 1800,
        location: "Downtown Hamilton",
        campus: "McMaster",
        bedrooms: 2,
        bathrooms: 2,
        propertyType: "Condo",
        furnished: true,
        address: "150 Main St W, Hamilton, ON",
        city: "Hamilton",
        state: "ON",
        zipCode: "L8P 1H8",
        distance: "20 min bus to campus",
        amenities: ["Wi-Fi", "Laundry", "Parking", "Gym", "Pool", "Security", "Study Room", "Rooftop Terrace"],
        images: [
          "https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=800&q=80"
        ],
        featured: true,
        rating: 5,
        reviewCount: 15,
        ownerId: 2,
        latitude: "43.2567",
        longitude: "-79.8865",
        availableFrom: "2023-08-01",
        leaseTerms: "12 months",
        petsAllowed: true,
        distanceToCampus: "2.5",
        travelTime: 20,
        status: 'published'
      },
      {
        title: "Affordable Student Basement",
        description: "An affordable basement apartment, perfect for students on a budget. This cozy space has been thoughtfully designed to maximize comfort and functionality. The separate entrance provides privacy, and all utilities are included in the rent.",
        price: 650,
        location: "Ainslie Wood",
        campus: "McMaster",
        bedrooms: 1,
        bathrooms: 1,
        propertyType: "Basement",
        furnished: true,
        address: "30 Paisley Ave S, Hamilton, ON",
        city: "Hamilton",
        state: "ON",
        zipCode: "L8S 1T4",
        distance: "12 min walk to campus",
        amenities: ["Wi-Fi", "Laundry", "Utilities Included", "Separate Entrance", "Small Kitchen"],
        images: [
          "https://images.unsplash.com/photo-1560185007-cde436f6a4d0?auto=format&fit=crop&w=800&q=80"
        ],
        featured: false,
        rating: 3,
        reviewCount: 4,
        ownerId: 3,
        latitude: "43.2584",
        longitude: "-79.9017",
        availableFrom: "2023-07-15",
        leaseTerms: "8 months",
        petsAllowed: false,
        distanceToCampus: "0.9",
        travelTime: 12,
        status: 'published'
      },
      {
        title: "Student Studio near Campus",
        description: "A studio apartment close to campus, perfect for individual students. This efficient space has been designed with students in mind, offering a comfortable living environment with all the essentials. The building is well-maintained and has a friendly community atmosphere.",
        price: 900,
        location: "Westdale",
        campus: "McMaster",
        bedrooms: 1,
        bathrooms: 1,
        propertyType: "Studio",
        furnished: true,
        address: "10 Dalewood Ave, Hamilton, ON",
        city: "Hamilton",
        state: "ON",
        zipCode: "L8S 1Y4",
        distance: "8 min walk to campus",
        amenities: ["Wi-Fi", "Laundry", "Utilities Included", "Study Desk", "Kitchenette"],
        images: [
          "https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&w=800&q=80"
        ],
        featured: false,
        rating: 4,
        reviewCount: 7,
        ownerId: 3,
        latitude: "43.2595",
        longitude: "-79.9121",
        availableFrom: "2023-09-01",
        leaseTerms: "12 months",
        petsAllowed: false,
        distanceToCampus: "0.7",
        travelTime: 8,
        status: 'published'
      },
      {
        title: "Premium Student Loft",
        description: "A premium loft-style apartment with modern design and premium amenities. This unique living space features high ceilings, exposed brick, and an open concept layout. The building is in a trendy area with cafes, shops, and restaurants just steps away.",
        price: 1500,
        location: "Kirkendall",
        campus: "McMaster",
        bedrooms: 1,
        bathrooms: 1,
        propertyType: "Loft",
        furnished: true,
        address: "220 Locke St S, Hamilton, ON",
        city: "Hamilton",
        state: "ON",
        zipCode: "L8P 4B7",
        distance: "20 min bus to campus",
        amenities: ["Wi-Fi", "Laundry", "Parking", "Gym", "Rooftop Access", "Bike Storage"],
        images: [
          "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80"
        ],
        featured: true,
        rating: 5,
        reviewCount: 9,
        ownerId: 1,
        latitude: "43.2527",
        longitude: "-79.8884",
        availableFrom: "2023-08-01",
        leaseTerms: "8 months",
        petsAllowed: true,
        distanceToCampus: "2.8",
        travelTime: 20,
        status: 'published'
      },
      {
        title: "Budget-Friendly Student Room",
        description: "A budget-friendly room in a shared house, perfect for students looking to save money. This comfortable room is part of a friendly shared house with common areas that foster a sense of community. All utilities and internet are included in the rent.",
        price: 550,
        location: "Westdale",
        campus: "McMaster",
        bedrooms: 1,
        bathrooms: 1,
        propertyType: "Room",
        furnished: true,
        address: "15 Barclay St, Hamilton, ON",
        city: "Hamilton",
        state: "ON",
        zipCode: "L8S 1M4",
        distance: "15 min walk to campus",
        amenities: ["Wi-Fi", "Shared Laundry", "Utilities Included", "Shared Kitchen", "Common Living Area"],
        images: [
          "https://images.unsplash.com/photo-1566195992011-5f6b21e539aa?auto=format&fit=crop&w=800&q=80"
        ],
        featured: false,
        rating: 4,
        reviewCount: 11,
        ownerId: 2,
        latitude: "43.2634",
        longitude: "-79.9139",
        availableFrom: "2023-07-01",
        leaseTerms: "4 months",
        petsAllowed: false,
        distanceToCampus: "1.1",
        travelTime: 15,
        status: 'published'
      }
    ];
    
    for (const property of sampleProperties) {
      this.createProperty(property);
    }
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email
    );
  }

  async getUserByProviderId(providerId: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.providerId === providerId
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userId++;
    const user: User = { 
      ...insertUser, 
      id, 
      authProvider: insertUser.authProvider || "email",
      providerId: insertUser.providerId || null,
      firstName: insertUser.firstName || null,
      lastName: insertUser.lastName || null,
      dateOfBirth: insertUser.dateOfBirth || null,
      profilePicture: insertUser.profilePicture || null,
      createdAt: new Date() 
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, userData: Partial<InsertUser>): Promise<User | undefined> {
    const existingUser = this.users.get(id);
    if (!existingUser) return undefined;
    
    const updatedUser = { ...existingUser, ...userData };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Property operations
  async getProperty(id: number): Promise<Property | undefined> {
    return this.properties.get(id);
  }

  async getAllProperties(): Promise<Property[]> {
    return Array.from(this.properties.values());
  }

  async getFeaturedProperties(): Promise<Property[]> {
    return Array.from(this.properties.values()).filter(
      (property) => property.featured
    );
  }

  async getPropertiesByType(propertyType: string): Promise<Property[]> {
    return Array.from(this.properties.values()).filter(
      (property) => property.propertyType === propertyType
    );
  }

  async getPropertiesByCampus(campus: string): Promise<Property[]> {
    return Array.from(this.properties.values()).filter(
      (property) => property.campus === campus
    );
  }

  async createProperty(insertProperty: InsertProperty): Promise<Property> {
    const id = this.propertyId++;
    
    // Create a new property object explicitly with all required fields
    const property: Property = {
      id,
      title: insertProperty.title,
      description: insertProperty.description,
      price: insertProperty.price,
      location: insertProperty.location,
      campus: insertProperty.campus,
      bedrooms: insertProperty.bedrooms,
      bathrooms: insertProperty.bathrooms,
      propertyType: insertProperty.propertyType,
      furnished: insertProperty.furnished !== undefined ? insertProperty.furnished : false,
      address: insertProperty.address || '',
      city: insertProperty.city || 'Hamilton',
      state: insertProperty.state || 'ON',
      zipCode: insertProperty.zipCode || null,
      distance: insertProperty.distance || null,
      amenities: insertProperty.amenities || [],
      images: insertProperty.images || [],
      featured: insertProperty.featured !== undefined ? insertProperty.featured : false,
      rating: insertProperty.rating || null,
      reviewCount: insertProperty.reviewCount || 0,
      ownerId: insertProperty.ownerId || null,
      latitude: insertProperty.latitude || null,
      longitude: insertProperty.longitude || null,
      availableFrom: insertProperty.availableFrom || null,
      leaseTerms: insertProperty.leaseTerms || null,
      petsAllowed: insertProperty.petsAllowed !== undefined ? insertProperty.petsAllowed : false,
      distanceToCampus: insertProperty.distanceToCampus || null,
      travelTime: insertProperty.travelTime || null,
      status: insertProperty.status || 'published',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    this.properties.set(id, property);
    return property;
  }

  // Bookmark operations
  async getBookmarksByUserId(userId: number): Promise<Bookmark[]> {
    return Array.from(this.bookmarks.values()).filter(
      (bookmark) => bookmark.userId === userId
    );
  }

  async createBookmark(insertBookmark: InsertBookmark): Promise<Bookmark> {
    const id = this.bookmarkId++;
    const bookmark: Bookmark = { 
      ...insertBookmark, 
      id, 
      createdAt: new Date() 
    };
    this.bookmarks.set(id, bookmark);
    return bookmark;
  }

  async deleteBookmark(userId: number, propertyId: number): Promise<boolean> {
    const bookmark = Array.from(this.bookmarks.values()).find(
      (b) => b.userId === userId && b.propertyId === propertyId
    );
    
    if (!bookmark) return false;
    
    return this.bookmarks.delete(bookmark.id);
  }

  // Additional Property operations
  async getPropertiesByOwner(ownerId: number): Promise<Property[]> {
    return Array.from(this.properties.values()).filter(
      (property) => property.ownerId === ownerId
    );
  }

  async updateProperty(id: number, propertyData: Partial<InsertProperty>): Promise<Property | undefined> {
    const existingProperty = this.properties.get(id);
    if (!existingProperty) return undefined;
    
    const updatedProperty = { 
      ...existingProperty, 
      ...propertyData,
      updatedAt: new Date()
    };
    this.properties.set(id, updatedProperty);
    return updatedProperty;
  }
  
  async deleteProperty(id: number): Promise<boolean> {
    const existingProperty = this.properties.get(id);
    if (!existingProperty) return false;
    
    // Delete the property
    const success = this.properties.delete(id);
    
    // Also delete any bookmarks associated with this property
    if (success) {
      const bookmarksToDelete = Array.from(this.bookmarks.values())
        .filter(bookmark => bookmark.propertyId === id);
      
      for (const bookmark of bookmarksToDelete) {
        this.bookmarks.delete(bookmark.id);
      }
      
      // Delete any bookings associated with this property
      const bookingsToDelete = Array.from(this.bookings.values())
        .filter(booking => booking.propertyId === id);
      
      for (const booking of bookingsToDelete) {
        this.bookings.delete(booking.id);
      }
    }
    
    return success;
  }

  // Booking operations
  async getBooking(id: number): Promise<Booking | undefined> {
    return this.bookings.get(id);
  }

  async getBookingsByUserId(userId: number): Promise<Booking[]> {
    return Array.from(this.bookings.values()).filter(
      (booking) => booking.userId === userId
    );
  }

  async getBookingsByPropertyId(propertyId: number): Promise<Booking[]> {
    return Array.from(this.bookings.values()).filter(
      (booking) => booking.propertyId === propertyId
    );
  }

  async getBookingsByOwnerId(ownerId: number): Promise<Booking[]> {
    // First find properties owned by this owner
    const ownerProperties = await this.getPropertiesByOwner(ownerId);
    const propertyIds = ownerProperties.map(p => p.id);
    
    // Then find all bookings for these properties
    return Array.from(this.bookings.values()).filter(
      (booking) => propertyIds.includes(booking.propertyId)
    );
  }

  async createBooking(insertBooking: InsertBooking): Promise<Booking> {
    const id = this.bookingId++;
    const booking: Booking = { 
      ...insertBooking, 
      id, 
      status: insertBooking.status || 'pending',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.bookings.set(id, booking);
    return booking;
  }

  async updateBooking(id: number, bookingData: Partial<InsertBooking>): Promise<Booking | undefined> {
    const existingBooking = this.bookings.get(id);
    if (!existingBooking) return undefined;
    
    const updatedBooking = { 
      ...existingBooking, 
      ...bookingData,
      updatedAt: new Date()
    };
    this.bookings.set(id, updatedBooking);
    return updatedBooking;
  }

  async deleteBooking(id: number): Promise<boolean> {
    return this.bookings.delete(id);
  }

  // Messaging operations
  async getConversationsByUserId(userId: number): Promise<Conversation[]> {
    // Find all conversation participants with this userId
    const participantEntries = Array.from(this.conversationParticipants.values())
      .filter(participant => participant.userId === userId);
    
    // Get the conversations for these participants
    const conversationIds = participantEntries.map(p => p.conversationId);
    const conversations = Array.from(this.conversations.values())
      .filter(convo => conversationIds.includes(convo.id))
      .sort((a, b) => {
        // Sort by lastMessageAt descending
        return new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime();
      });
    
    return conversations;
  }

  async getConversationById(id: number): Promise<any | undefined> {
    const conversation = this.conversations.get(id);
    if (!conversation) return undefined;
    
    // Get participants
    const participants = await this.getConversationParticipants(id);
    
    // Get messages
    const messages = Array.from(this.messages.values())
      .filter(msg => msg.conversationId === id)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    
    // Get property
    const property = conversation.propertyId ? this.properties.get(conversation.propertyId) : null;
    
    return {
      ...conversation,
      participants,
      messages,
      property
    };
  }

  async getConversationByParticipants(userId: number, receiverId: number, propertyId?: number): Promise<any | undefined> {
    // Get all conversations for this user
    const userConversations = await this.getConversationsByUserId(userId);
    
    // Filter out conversations that have the receiver as a participant and match the property if specified
    for (const conversation of userConversations) {
      const participants = await this.getConversationParticipants(conversation.id);
      
      // Check if the receiver is a participant
      const isReceiverParticipant = participants.some(p => p.userId === receiverId);
      
      // Check if property matches if specified
      const propertyMatches = propertyId ? conversation.propertyId === propertyId : true;
      
      if (isReceiverParticipant && propertyMatches) {
        return {
          ...conversation,
          participants,
          messages: Array.from(this.messages.values())
            .filter(msg => msg.conversationId === conversation.id)
            .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
        };
      }
    }
    
    return undefined;
  }

  async createConversation(conversation: { propertyId: number, lastMessageAt: Date }): Promise<Conversation> {
    const id = this.conversationId++;
    
    const newConversation: Conversation = {
      id,
      propertyId: conversation.propertyId,
      lastMessageAt: conversation.lastMessageAt,
      createdAt: new Date()
    };
    
    this.conversations.set(id, newConversation);
    return newConversation;
  }

  async updateConversation(id: number, data: { lastMessageAt: Date }): Promise<Conversation | undefined> {
    const conversation = this.conversations.get(id);
    if (!conversation) return undefined;
    
    const updatedConversation = {
      ...conversation,
      lastMessageAt: data.lastMessageAt
    };
    
    this.conversations.set(id, updatedConversation);
    return updatedConversation;
  }

  async addConversationParticipant(participant: { conversationId: number, userId: number }): Promise<ConversationParticipant> {
    const id = this.participantId++;
    
    const newParticipant: ConversationParticipant = {
      id,
      conversationId: participant.conversationId,
      userId: participant.userId,
      createdAt: new Date()
    };
    
    this.conversationParticipants.set(id, newParticipant);
    return newParticipant;
  }

  async getConversationParticipants(conversationId: number): Promise<ConversationParticipant[]> {
    return Array.from(this.conversationParticipants.values())
      .filter(p => p.conversationId === conversationId);
  }

  async createMessage(message: { conversationId: number, senderId: number, content: string, read: boolean }): Promise<Message> {
    const id = this.messageId++;
    
    const newMessage: Message = {
      id,
      conversationId: message.conversationId,
      senderId: message.senderId,
      content: message.content,
      read: message.read,
      createdAt: new Date()
    };
    
    this.messages.set(id, newMessage);
    return newMessage;
  }

  async markConversationAsRead(conversationId: number, userId: number): Promise<void> {
    // Mark all messages in this conversation as read for this user
    // (where the user is not the sender)
    Array.from(this.messages.values())
      .filter(message => 
        message.conversationId === conversationId && 
        message.senderId !== userId && 
        !message.read
      )
      .forEach(message => {
        this.messages.set(message.id, {
          ...message,
          read: true
        });
      });
  }

  async getUnreadMessageCount(userId: number): Promise<number> {
    // Get all conversations this user is part of
    const userConversations = await this.getConversationsByUserId(userId);
    const conversationIds = userConversations.map(c => c.id);
    
    // Count unread messages in these conversations where the user is not the sender
    return Array.from(this.messages.values())
      .filter(message => 
        conversationIds.includes(message.conversationId) && 
        message.senderId !== userId && 
        !message.read
      )
      .length;
  }

  // Notification operations
  async getNotificationsByUserId(userId: number): Promise<Notification[]> {
    return Array.from(this.notifications.values())
      .filter(notification => notification.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async createNotification(notification: InsertNotification): Promise<Notification> {
    const id = this.notificationId++;
    
    const newNotification: Notification = {
      id,
      userId: notification.userId,
      type: notification.type,
      title: notification.title,
      content: notification.content,
      relatedId: notification.relatedId || null,
      relatedType: notification.relatedType || null,
      read: notification.read || false,
      createdAt: new Date()
    };
    
    this.notifications.set(id, newNotification);
    return newNotification;
  }

  async markNotificationAsRead(id: number): Promise<void> {
    const notification = this.notifications.get(id);
    if (!notification) return;
    
    this.notifications.set(id, {
      ...notification,
      read: true
    });
  }

  async markAllNotificationsAsRead(userId: number): Promise<void> {
    // Update all notifications for this user to mark them as read
    Array.from(this.notifications.values())
      .filter(notification => notification.userId === userId && !notification.read)
      .forEach(notification => {
        this.notifications.set(notification.id, {
          ...notification,
          read: true
        });
      });
  }

  async getUnreadNotificationCount(userId: number): Promise<number> {
    return Array.from(this.notifications.values())
      .filter(notification => notification.userId === userId && !notification.read)
      .length;
  }
}

export const storage = new MemStorage();
