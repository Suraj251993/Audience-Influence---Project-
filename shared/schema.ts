import { pgTable, text, serial, integer, boolean, timestamp, decimal, varchar, jsonb, index } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for Express sessions
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").unique(),
  password: text("password").notNull(),
  role: text("role").notNull().default("Brand Manager"), // Brand Manager, Marketing Team, Campaign Coordinator
  firstName: text("first_name"),
  lastName: text("last_name"),
  profileImageUrl: text("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Influencers table
export const influencers = pgTable("influencers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  handle: text("handle").notNull().unique(),
  email: text("email"),
  category: text("category").notNull(), // Fashion & Beauty, Technology, Health & Fitness, etc.
  followers: integer("followers").notNull(),
  engagementRate: decimal("engagement_rate", { precision: 5, scale: 2 }).notNull(),
  ratePerPost: decimal("rate_per_post", { precision: 10, scale: 2 }).notNull(),
  profileImageUrl: text("profile_image_url"),
  bio: text("bio"),
  isVerified: boolean("is_verified").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Campaigns table
export const campaigns = pgTable("campaigns", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  category: text("category").notNull(),
  budget: decimal("budget", { precision: 10, scale: 2 }).notNull(),
  status: text("status").notNull().default("draft"), // draft, active, pending, completed, cancelled
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  targetAudience: text("target_audience"),
  goals: text("goals"),
  createdBy: integer("created_by").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Collaborations table (junction between campaigns and influencers)
export const collaborations = pgTable("collaborations", {
  id: serial("id").primaryKey(),
  campaignId: integer("campaign_id").references(() => campaigns.id).notNull(),
  influencerId: integer("influencer_id").references(() => influencers.id).notNull(),
  status: text("status").notNull().default("pending"), // pending, accepted, declined, completed
  agreedRate: decimal("agreed_rate", { precision: 10, scale: 2 }),
  deliverables: text("deliverables"),
  actualReach: integer("actual_reach"),
  actualEngagement: decimal("actual_engagement", { precision: 5, scale: 2 }),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Analytics table for campaign performance tracking
export const analytics = pgTable("analytics", {
  id: serial("id").primaryKey(),
  campaignId: integer("campaign_id").references(() => campaigns.id).notNull(),
  collaborationId: integer("collaboration_id").references(() => collaborations.id),
  metric: text("metric").notNull(), // reach, engagement, clicks, conversions, etc.
  value: decimal("value", { precision: 15, scale: 2 }).notNull(),
  date: timestamp("date").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  campaigns: many(campaigns),
}));

export const influencersRelations = relations(influencers, ({ many }) => ({
  collaborations: many(collaborations),
}));

export const campaignsRelations = relations(campaigns, ({ one, many }) => ({
  creator: one(users, {
    fields: [campaigns.createdBy],
    references: [users.id],
  }),
  collaborations: many(collaborations),
  analytics: many(analytics),
}));

export const collaborationsRelations = relations(collaborations, ({ one, many }) => ({
  campaign: one(campaigns, {
    fields: [collaborations.campaignId],
    references: [campaigns.id],
  }),
  influencer: one(influencers, {
    fields: [collaborations.influencerId],
    references: [influencers.id],
  }),
  analytics: many(analytics),
}));

export const analyticsRelations = relations(analytics, ({ one }) => ({
  campaign: one(campaigns, {
    fields: [analytics.campaignId],
    references: [campaigns.id],
  }),
  collaboration: one(collaborations, {
    fields: [analytics.collaborationId],
    references: [collaborations.id],
  }),
}));

// Zod schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  email: true,
  password: true,
  role: true,
  firstName: true,
  lastName: true,
  profileImageUrl: true,
});

export const insertInfluencerSchema = createInsertSchema(influencers).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCampaignSchema = createInsertSchema(campaigns).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCollaborationSchema = createInsertSchema(collaborations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAnalyticsSchema = createInsertSchema(analytics).omit({
  id: true,
  createdAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Influencer = typeof influencers.$inferSelect;
export type InsertInfluencer = z.infer<typeof insertInfluencerSchema>;
export type Campaign = typeof campaigns.$inferSelect;
export type InsertCampaign = z.infer<typeof insertCampaignSchema>;
export type Collaboration = typeof collaborations.$inferSelect;
export type InsertCollaboration = z.infer<typeof insertCollaborationSchema>;
export type Analytics = typeof analytics.$inferSelect;
export type InsertAnalytics = z.infer<typeof insertAnalyticsSchema>;

// Extended types for API responses
export type CampaignWithCollaborations = Campaign & {
  collaborations: (Collaboration & {
    influencer: Influencer;
  })[];
  creator: User;
};

export type InfluencerWithStats = Influencer & {
  totalCollaborations?: number;
  avgRating?: number;
};
