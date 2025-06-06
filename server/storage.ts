import {
  users,
  influencers,
  campaigns,
  collaborations,
  analytics,
  type User,
  type InsertUser,
  type Influencer,
  type InsertInfluencer,
  type Campaign,
  type InsertCampaign,
  type Collaboration,
  type InsertCollaboration,
  type Analytics,
  type InsertAnalytics,
  type CampaignWithCollaborations,
  type InfluencerWithStats,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, like, and, gte, lte, sql, asc } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Influencer operations
  getInfluencers(filters?: {
    category?: string;
    minFollowers?: number;
    maxFollowers?: number;
    search?: string;
  }): Promise<InfluencerWithStats[]>;
  getInfluencer(id: number): Promise<Influencer | undefined>;
  createInfluencer(influencer: InsertInfluencer): Promise<Influencer>;
  updateInfluencer(id: number, updates: Partial<InsertInfluencer>): Promise<Influencer>;
  deleteInfluencer(id: number): Promise<void>;

  // Campaign operations
  getCampaigns(userId?: number, status?: string): Promise<CampaignWithCollaborations[]>;
  getCampaign(id: number): Promise<CampaignWithCollaborations | undefined>;
  createCampaign(campaign: InsertCampaign): Promise<Campaign>;
  updateCampaign(id: number, updates: Partial<InsertCampaign>): Promise<Campaign>;
  deleteCampaign(id: number): Promise<void>;

  // Collaboration operations
  getCollaborations(campaignId?: number, influencerId?: number): Promise<(Collaboration & {
    campaign: Campaign;
    influencer: Influencer;
  })[]>;
  createCollaboration(collaboration: InsertCollaboration): Promise<Collaboration>;
  updateCollaboration(id: number, updates: Partial<InsertCollaboration>): Promise<Collaboration>;

  // Analytics operations
  getAnalytics(campaignId: number): Promise<Analytics[]>;
  createAnalytics(analytics: InsertAnalytics): Promise<Analytics>;
  getDashboardStats(userId?: number): Promise<{
    activeCampaigns: number;
    totalReach: number;
    avgEngagementRate: number;
    totalROI: number;
  }>;

  // Initial data seeding
  seedData(): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(userData: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(userData).returning();
    return user;
  }

  async getInfluencers(filters?: {
    category?: string;
    minFollowers?: number;
    maxFollowers?: number;
    search?: string;
  }): Promise<InfluencerWithStats[]> {
    let query = db.select().from(influencers);
    
    const conditions = [];
    
    if (filters?.category && filters.category !== "All Categories") {
      conditions.push(eq(influencers.category, filters.category));
    }
    
    if (filters?.minFollowers) {
      conditions.push(gte(influencers.followers, filters.minFollowers));
    }
    
    if (filters?.maxFollowers) {
      conditions.push(lte(influencers.followers, filters.maxFollowers));
    }
    
    if (filters?.search) {
      conditions.push(
        sql`(${influencers.name} ILIKE ${`%${filters.search}%`} OR ${influencers.handle} ILIKE ${`%${filters.search}%`})`
      );
    }
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }
    
    const result = await query.orderBy(desc(influencers.followers));
    return result;
  }

  async getInfluencer(id: number): Promise<Influencer | undefined> {
    const [influencer] = await db.select().from(influencers).where(eq(influencers.id, id));
    return influencer;
  }

  async createInfluencer(influencerData: InsertInfluencer): Promise<Influencer> {
    const [influencer] = await db.insert(influencers).values(influencerData).returning();
    return influencer;
  }

  async updateInfluencer(id: number, updates: Partial<InsertInfluencer>): Promise<Influencer> {
    const [influencer] = await db
      .update(influencers)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(influencers.id, id))
      .returning();
    return influencer;
  }

  async deleteInfluencer(id: number): Promise<void> {
    await db.delete(influencers).where(eq(influencers.id, id));
  }

  async getCampaigns(userId?: number, status?: string): Promise<CampaignWithCollaborations[]> {
    let query = db
      .select()
      .from(campaigns)
      .leftJoin(users, eq(campaigns.createdBy, users.id));
    
    const conditions = [];
    
    if (userId) {
      conditions.push(eq(campaigns.createdBy, userId));
    }
    
    if (status && status !== "all") {
      conditions.push(eq(campaigns.status, status));
    }
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }
    
    const campaignsData = await query.orderBy(desc(campaigns.createdAt));
    
    // Get collaborations for each campaign
    const campaignsWithCollaborations: CampaignWithCollaborations[] = [];
    
    for (const row of campaignsData) {
      const collaborationsData = await db
        .select()
        .from(collaborations)
        .leftJoin(influencers, eq(collaborations.influencerId, influencers.id))
        .where(eq(collaborations.campaignId, row.campaigns.id));
      
      campaignsWithCollaborations.push({
        ...row.campaigns,
        creator: row.users!,
        collaborations: collaborationsData.map(colRow => ({
          ...colRow.collaborations,
          influencer: colRow.influencers!,
        })),
      });
    }
    
    return campaignsWithCollaborations;
  }

  async getCampaign(id: number): Promise<CampaignWithCollaborations | undefined> {
    const [campaignData] = await db
      .select()
      .from(campaigns)
      .leftJoin(users, eq(campaigns.createdBy, users.id))
      .where(eq(campaigns.id, id));
    
    if (!campaignData) return undefined;
    
    const collaborationsData = await db
      .select()
      .from(collaborations)
      .leftJoin(influencers, eq(collaborations.influencerId, influencers.id))
      .where(eq(collaborations.campaignId, id));
    
    return {
      ...campaignData.campaigns,
      creator: campaignData.users!,
      collaborations: collaborationsData.map(colRow => ({
        ...colRow.collaborations,
        influencer: colRow.influencers!,
      })),
    };
  }

  async createCampaign(campaignData: InsertCampaign): Promise<Campaign> {
    const [campaign] = await db.insert(campaigns).values(campaignData).returning();
    return campaign;
  }

  async updateCampaign(id: number, updates: Partial<InsertCampaign>): Promise<Campaign> {
    const [campaign] = await db
      .update(campaigns)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(campaigns.id, id))
      .returning();
    return campaign;
  }

  async deleteCampaign(id: number): Promise<void> {
    await db.delete(campaigns).where(eq(campaigns.id, id));
  }

  async getCollaborations(campaignId?: number, influencerId?: number): Promise<(Collaboration & {
    campaign: Campaign;
    influencer: Influencer;
  })[]> {
    let query = db
      .select()
      .from(collaborations)
      .leftJoin(campaigns, eq(collaborations.campaignId, campaigns.id))
      .leftJoin(influencers, eq(collaborations.influencerId, influencers.id));
    
    const conditions = [];
    
    if (campaignId) {
      conditions.push(eq(collaborations.campaignId, campaignId));
    }
    
    if (influencerId) {
      conditions.push(eq(collaborations.influencerId, influencerId));
    }
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }
    
    const result = await query.orderBy(desc(collaborations.createdAt));
    
    return result.map(row => ({
      ...row.collaborations,
      campaign: row.campaigns!,
      influencer: row.influencers!,
    }));
  }

  async createCollaboration(collaborationData: InsertCollaboration): Promise<Collaboration> {
    const [collaboration] = await db.insert(collaborations).values(collaborationData).returning();
    return collaboration;
  }

  async updateCollaboration(id: number, updates: Partial<InsertCollaboration>): Promise<Collaboration> {
    const [collaboration] = await db
      .update(collaborations)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(collaborations.id, id))
      .returning();
    return collaboration;
  }

  async getAnalytics(campaignId: number): Promise<Analytics[]> {
    return await db
      .select()
      .from(analytics)
      .where(eq(analytics.campaignId, campaignId))
      .orderBy(asc(analytics.date));
  }

  async createAnalytics(analyticsData: InsertAnalytics): Promise<Analytics> {
    const [analyticsRecord] = await db.insert(analytics).values(analyticsData).returning();
    return analyticsRecord;
  }

  async getDashboardStats(userId?: number): Promise<{
    activeCampaigns: number;
    totalReach: number;
    avgEngagementRate: number;
    totalROI: number;
  }> {
    // Get active campaigns count
    const activeCampaignsQuery = db
      .select({ count: sql<number>`count(*)` })
      .from(campaigns)
      .where(eq(campaigns.status, "active"));
    
    if (userId) {
      activeCampaignsQuery.where(eq(campaigns.createdBy, userId));
    }
    
    const [activeCampaignsResult] = await activeCampaignsQuery;
    
    // Calculate total reach and engagement from collaborations
    const collaborationsQuery = db
      .select({
        totalReach: sql<number>`COALESCE(SUM(${collaborations.actualReach}), 0)`,
        avgEngagement: sql<number>`COALESCE(AVG(${collaborations.actualEngagement}), 0)`,
      })
      .from(collaborations)
      .leftJoin(campaigns, eq(collaborations.campaignId, campaigns.id))
      .where(eq(collaborations.status, "completed"));
    
    if (userId) {
      collaborationsQuery.where(eq(campaigns.createdBy, userId));
    }
    
    const [collaborationsResult] = await collaborationsQuery;
    
    return {
      activeCampaigns: activeCampaignsResult.count,
      totalReach: collaborationsResult.totalReach || 0,
      avgEngagementRate: Number(collaborationsResult.avgEngagement) || 0,
      totalROI: 325, // Placeholder ROI calculation
    };
  }

  async seedData(): Promise<void> {
    // Check if data already exists
    const existingInfluencers = await db.select().from(influencers).limit(1);
    if (existingInfluencers.length > 0) return;

    // Create sample user
    const [sampleUser] = await db.insert(users).values({
      username: "admin",
      email: "admin@influencehub.com",
      password: "password", // In production, this should be hashed
      role: "Brand Manager",
      firstName: "Sarah",
      lastName: "Johnson",
      profileImageUrl: "https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150",
    }).returning();

    // Seed influencers
    const influencerData = [
      {
        name: "Emma Style",
        handle: "@emmastyle",
        email: "emma@style.com",
        category: "Fashion & Beauty",
        followers: 450000,
        engagementRate: "4.8",
        ratePerPost: "500",
        profileImageUrl: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150",
        bio: "Fashion influencer sharing daily style inspiration",
        isVerified: true,
      },
      {
        name: "TechReviewer",
        handle: "@techreviewer",
        email: "tech@reviewer.com",
        category: "Technology",
        followers: 280000,
        engagementRate: "5.2",
        ratePerPost: "400",
        profileImageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150",
        bio: "Tech enthusiast reviewing the latest gadgets",
        isVerified: true,
      },
      {
        name: "FitLife Coach",
        handle: "@fitlifecoach",
        email: "fit@life.com",
        category: "Health & Fitness",
        followers: 320000,
        engagementRate: "6.1",
        ratePerPost: "350",
        profileImageUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150",
        bio: "Fitness coach helping people live their best life",
        isVerified: true,
      },
      {
        name: "Foodie Adventures",
        handle: "@foodieadventures",
        email: "foodie@adventures.com",
        category: "Food & Lifestyle",
        followers: 190000,
        engagementRate: "7.3",
        ratePerPost: "300",
        profileImageUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150",
        bio: "Food blogger exploring culinary adventures",
        isVerified: false,
      },
      {
        name: "Wanderlust Tales",
        handle: "@wanderlusttales",
        email: "wander@lust.com",
        category: "Travel",
        followers: 680000,
        engagementRate: "4.9",
        ratePerPost: "750",
        profileImageUrl: "https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150",
        bio: "Travel blogger sharing stories from around the world",
        isVerified: true,
      },
      {
        name: "Lifestyle Maven",
        handle: "@lifestylemaven",
        email: "lifestyle@maven.com",
        category: "Lifestyle",
        followers: 520000,
        engagementRate: "5.5",
        ratePerPost: "600",
        profileImageUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150",
        bio: "Lifestyle influencer sharing daily inspiration",
        isVerified: true,
      },
    ];

    const createdInfluencers = await db.insert(influencers).values(influencerData).returning();

    // Seed campaigns
    const campaignData = [
      {
        name: "Summer Fashion Collection",
        description: "Beauty & Fashion campaign targeting young women aged 18-35",
        category: "Fashion & Beauty",
        budget: "7500",
        status: "active",
        startDate: new Date("2024-06-15"),
        endDate: new Date("2024-07-15"),
        targetAudience: "Young women aged 18-35",
        goals: "Increase brand awareness and drive sales",
        createdBy: sampleUser.id,
      },
      {
        name: "Tech Product Launch",
        description: "Launch campaign for new smartphone targeting tech enthusiasts",
        category: "Technology",
        budget: "5200",
        status: "pending",
        startDate: new Date("2024-07-01"),
        endDate: new Date("2024-08-01"),
        targetAudience: "Tech enthusiasts aged 25-45",
        goals: "Generate buzz for product launch",
        createdBy: sampleUser.id,
      },
      {
        name: "Fitness Challenge",
        description: "Health & Fitness campaign promoting workout program",
        category: "Health & Fitness",
        budget: "2200",
        status: "completed",
        startDate: new Date("2024-05-01"),
        endDate: new Date("2024-05-31"),
        targetAudience: "Fitness enthusiasts aged 20-40",
        goals: "Promote new workout program",
        createdBy: sampleUser.id,
      },
    ];

    const createdCampaigns = await db.insert(campaigns).values(campaignData).returning();

    // Seed collaborations
    const collaborationData = [
      {
        campaignId: createdCampaigns[0].id,
        influencerId: createdInfluencers[0].id,
        status: "completed",
        agreedRate: "500",
        deliverables: "2 Instagram posts, 1 story",
        actualReach: 450000,
        actualEngagement: "4.8",
        completedAt: new Date("2024-06-20"),
      },
      {
        campaignId: createdCampaigns[1].id,
        influencerId: createdInfluencers[1].id,
        status: "pending",
        agreedRate: "400",
        deliverables: "1 YouTube review, 2 Instagram posts",
      },
      {
        campaignId: createdCampaigns[2].id,
        influencerId: createdInfluencers[2].id,
        status: "completed",
        agreedRate: "350",
        deliverables: "1 workout video, 3 Instagram posts",
        actualReach: 320000,
        actualEngagement: "6.1",
        completedAt: new Date("2024-05-25"),
      },
    ];

    await db.insert(collaborations).values(collaborationData);
  }
}

export const storage = new DatabaseStorage();
