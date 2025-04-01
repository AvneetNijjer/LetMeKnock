import { pgTable, text, serial, timestamp, integer, boolean, jsonb, numeric, date, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Enums for property status
export const propertyStatusEnum = pgEnum('property_status', [
  'draft', 
  'published', 
  'hidden', 
  'removed'
]);

// Enums for booking status
export const bookingStatusEnum = pgEnum('booking_status', [
  'pending',
  'confirmed',
  'cancelled',
  'completed'
]);

export const userTypeEnum = pgEnum('user_type', [
  'student',
  'landlord',
  'admin'
]);

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  authProvider: text("auth_provider").notNull().default("email"),
  providerId: text("provider_id"),
  firstName: text("first_name"),
  lastName: text("last_name"),
  dateOfBirth: text("date_of_birth"),
  profilePicture: text("profile_picture"),
  coverPhoto: text("cover_photo"),
  bio: text("bio"),
  userType: userTypeEnum("user_type").default('student'),
  education: text("education"),
  graduationYear: integer("graduation_year"),
  major: text("major"),
  verified: boolean("verified").default(false),
  socialLinks: jsonb("social_links"), // Store social media links as JSON
  contactEmail: text("contact_email"), // Optional different email for contact
  phoneNumber: text("phone_number"),
  notificationPreferences: jsonb("notification_preferences"), // Store notification settings as JSON
  privacySettings: jsonb("privacy_settings"), // Store privacy settings as JSON
  createdAt: timestamp("created_at").defaultNow().notNull(),
  lastActive: timestamp("last_active"),
});

export const properties = pgTable("properties", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  price: integer("price").notNull(),
  location: text("location").notNull(),
  campus: text("campus").notNull(),
  bedrooms: integer("bedrooms").notNull(),
  bathrooms: integer("bathrooms").notNull(),
  propertyType: text("property_type").notNull(),
  furnished: boolean("furnished").notNull().default(false),
  address: text("address").notNull(),
  city: text("city").notNull().default("Hamilton"),
  state: text("state").notNull().default("ON"),
  zipCode: text("zip_code"),
  distance: text("distance"),
  amenities: text("amenities").array(),
  images: text("images").array(),
  featured: boolean("featured").notNull().default(false),
  ownerId: integer("owner_id").references(() => users.id),
  latitude: numeric("latitude"),
  longitude: numeric("longitude"),
  availableFrom: date("available_from"),
  leaseTerms: text("lease_terms"),
  petsAllowed: boolean("pets_allowed").default(false),
  distanceToCampus: numeric("distance_to_campus"),
  travelTime: integer("travel_time"), // Travel time to campus in minutes
  rating: integer("rating"),
  reviewCount: integer("review_count").default(0),
  status: propertyStatusEnum("status").default('published'),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const bookmarks = pgTable("bookmarks", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  propertyId: integer("property_id").notNull().references(() => properties.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const amenities = pgTable("amenities", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  category: text("category").notNull(),
  icon: text("icon"),
});

export const propertyAmenities = pgTable("property_amenities", {
  id: serial("id").primaryKey(),
  propertyId: integer("property_id").notNull().references(() => properties.id, { onDelete: 'cascade' }),
  amenityId: integer("amenity_id").notNull().references(() => amenities.id),
});

export const propertyImages = pgTable("property_images", {
  id: serial("id").primaryKey(),
  propertyId: integer("property_id").notNull().references(() => properties.id, { onDelete: 'cascade' }),
  url: text("url").notNull(),
  caption: text("caption"),
  isPrimary: boolean("is_primary").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const conversations = pgTable("conversations", {
  id: serial("id").primaryKey(),
  propertyId: integer("property_id").references(() => properties.id),
  lastMessageAt: timestamp("last_message_at").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const conversationParticipants = pgTable("conversation_participants", {
  id: serial("id").primaryKey(),
  conversationId: integer("conversation_id").notNull().references(() => conversations.id, { onDelete: 'cascade' }),
  userId: integer("user_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  conversationId: integer("conversation_id").notNull().references(() => conversations.id, { onDelete: 'cascade' }),
  senderId: integer("sender_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  read: boolean("read").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  propertyId: integer("property_id").notNull().references(() => properties.id, { onDelete: 'cascade' }),
  userId: integer("user_id").notNull().references(() => users.id),
  rating: integer("rating").notNull(),
  comment: text("comment"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const bookings = pgTable("bookings", {
  id: serial("id").primaryKey(),
  propertyId: integer("property_id").notNull().references(() => properties.id, { onDelete: 'cascade' }),
  userId: integer("user_id").notNull().references(() => users.id),
  ownerId: integer("owner_id").notNull().references(() => users.id),
  bookingType: text("booking_type").notNull(), // 'viewing' or 'lease'
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time").notNull(),
  status: bookingStatusEnum("status").default('pending'),
  notes: text("notes"),
  contactInfo: text("contact_info"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  type: text("type").notNull(), // 'message', 'booking', 'property_update', etc.
  title: text("title").notNull(),
  content: text("content").notNull(),
  relatedId: integer("related_id"), // ID of the related entity (message, booking, etc.)
  relatedType: text("related_type"), // Type of the related entity ('message', 'booking', 'property', etc.)
  read: boolean("read").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertPropertySchema = createInsertSchema(properties).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertBookmarkSchema = createInsertSchema(bookmarks).omit({
  id: true,
  createdAt: true,
});

export const insertAmenitySchema = createInsertSchema(amenities).omit({
  id: true,
});

export const insertPropertyAmenitySchema = createInsertSchema(propertyAmenities).omit({
  id: true,
});

export const insertPropertyImageSchema = createInsertSchema(propertyImages).omit({
  id: true,
  createdAt: true,
});

export const insertConversationSchema = createInsertSchema(conversations).omit({
  id: true,
  createdAt: true,
});

export const insertConversationParticipantSchema = createInsertSchema(conversationParticipants).omit({
  id: true,
  createdAt: true,
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  createdAt: true,
});

export const insertReviewSchema = createInsertSchema(reviews).omit({
  id: true,
  createdAt: true,
});

export const insertBookingSchema = createInsertSchema(bookings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertProperty = z.infer<typeof insertPropertySchema>;
export type Property = typeof properties.$inferSelect;

export type InsertBookmark = z.infer<typeof insertBookmarkSchema>;
export type Bookmark = typeof bookmarks.$inferSelect;

export type InsertAmenity = z.infer<typeof insertAmenitySchema>;
export type Amenity = typeof amenities.$inferSelect;

export type InsertPropertyAmenity = z.infer<typeof insertPropertyAmenitySchema>;
export type PropertyAmenity = typeof propertyAmenities.$inferSelect;

export type InsertPropertyImage = z.infer<typeof insertPropertyImageSchema>;
export type PropertyImage = typeof propertyImages.$inferSelect;

export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messages.$inferSelect;

export type InsertReview = z.infer<typeof insertReviewSchema>;
export type Review = typeof reviews.$inferSelect;

export type InsertBooking = z.infer<typeof insertBookingSchema>;
export type Booking = typeof bookings.$inferSelect;

export type InsertConversation = z.infer<typeof insertConversationSchema>;
export type Conversation = typeof conversations.$inferSelect;

export type InsertConversationParticipant = z.infer<typeof insertConversationParticipantSchema>;
export type ConversationParticipant = typeof conversationParticipants.$inferSelect;

export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type Notification = typeof notifications.$inferSelect;
