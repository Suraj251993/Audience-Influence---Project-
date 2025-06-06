import {
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

export class MemoryStorage implements IStorage {
  private users: User[] = [];
  private influencers: Influencer[] = [];
  private campaigns: Campaign[] = [];
  private collaborations: Collaboration[] = [];
  private analytics: Analytics[] = [];
  private nextId = 1;

  async getUser(id: number): Promise<User | undefined> {
    return this.users.find(user => user.id === id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return this.users.find(user => user.username === username);
  }

  async createUser(userData: InsertUser): Promise<User> {
    const user: User = {
      id: this.nextId++,
      username: userData.username,
      email: userData.email || null,
      password: userData.password,
      role: userData.role || "Brand Manager",
      firstName: userData.firstName || null,
      lastName: userData.lastName || null,
      profileImageUrl: userData.profileImageUrl || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.users.push(user);
    return user;
  }

  async getInfluencers(filters?: {
    category?: string;
    minFollowers?: number;
    maxFollowers?: number;
    search?: string;
  }): Promise<InfluencerWithStats[]> {
    let filteredInfluencers = [...this.influencers];
    
    if (filters?.category && filters.category !== "All Categories") {
      filteredInfluencers = filteredInfluencers.filter(inf => inf.category === filters.category);
    }
    
    if (filters?.minFollowers) {
      filteredInfluencers = filteredInfluencers.filter(inf => inf.followers >= filters.minFollowers!);
    }
    
    if (filters?.maxFollowers) {
      filteredInfluencers = filteredInfluencers.filter(inf => inf.followers <= filters.maxFollowers!);
    }
    
    if (filters?.search) {
      const searchLower = filters.search.toLowerCase();
      filteredInfluencers = filteredInfluencers.filter(inf => 
        inf.name.toLowerCase().includes(searchLower) || 
        inf.handle.toLowerCase().includes(searchLower)
      );
    }
    
    return filteredInfluencers.sort((a, b) => b.followers - a.followers);
  }

  async getInfluencer(id: number): Promise<Influencer | undefined> {
    return this.influencers.find(inf => inf.id === id);
  }

  async createInfluencer(influencerData: InsertInfluencer): Promise<Influencer> {
    const influencer: Influencer = {
      id: this.nextId++,
      name: influencerData.name,
      handle: influencerData.handle,
      email: influencerData.email || null,
      category: influencerData.category,
      followers: influencerData.followers,
      engagementRate: influencerData.engagementRate,
      ratePerPost: influencerData.ratePerPost,
      profileImageUrl: influencerData.profileImageUrl || null,
      bio: influencerData.bio || null,
      isVerified: influencerData.isVerified || false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.influencers.push(influencer);
    return influencer;
  }

  async updateInfluencer(id: number, updates: Partial<InsertInfluencer>): Promise<Influencer> {
    const index = this.influencers.findIndex(inf => inf.id === id);
    if (index === -1) throw new Error("Influencer not found");
    
    this.influencers[index] = {
      ...this.influencers[index],
      ...updates,
      updatedAt: new Date(),
    };
    return this.influencers[index];
  }

  async deleteInfluencer(id: number): Promise<void> {
    const index = this.influencers.findIndex(inf => inf.id === id);
    if (index !== -1) {
      this.influencers.splice(index, 1);
    }
  }

  async getCampaigns(userId?: number, status?: string): Promise<CampaignWithCollaborations[]> {
    let filteredCampaigns = [...this.campaigns];
    
    if (userId) {
      filteredCampaigns = filteredCampaigns.filter(camp => camp.createdBy === userId);
    }
    
    if (status && status !== "all") {
      filteredCampaigns = filteredCampaigns.filter(camp => camp.status === status);
    }
    
    return filteredCampaigns.map(campaign => {
      const creator = this.users.find(user => user.id === campaign.createdBy)!;
      const campaignCollaborations = this.collaborations
        .filter(col => col.campaignId === campaign.id)
        .map(col => ({
          ...col,
          influencer: this.influencers.find(inf => inf.id === col.influencerId)!,
        }));
      
      return {
        ...campaign,
        creator,
        collaborations: campaignCollaborations,
      };
    }).sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime());
  }

  async getCampaign(id: number): Promise<CampaignWithCollaborations | undefined> {
    const campaign = this.campaigns.find(camp => camp.id === id);
    if (!campaign) return undefined;
    
    const creator = this.users.find(user => user.id === campaign.createdBy)!;
    const campaignCollaborations = this.collaborations
      .filter(col => col.campaignId === campaign.id)
      .map(col => ({
        ...col,
        influencer: this.influencers.find(inf => inf.id === col.influencerId)!,
      }));
    
    return {
      ...campaign,
      creator,
      collaborations: campaignCollaborations,
    };
  }

  async createCampaign(campaignData: InsertCampaign): Promise<Campaign> {
    const campaign: Campaign = {
      id: this.nextId++,
      ...campaignData,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.campaigns.push(campaign);
    return campaign;
  }

  async updateCampaign(id: number, updates: Partial<InsertCampaign>): Promise<Campaign> {
    const index = this.campaigns.findIndex(camp => camp.id === id);
    if (index === -1) throw new Error("Campaign not found");
    
    this.campaigns[index] = {
      ...this.campaigns[index],
      ...updates,
      updatedAt: new Date(),
    };
    return this.campaigns[index];
  }

  async deleteCampaign(id: number): Promise<void> {
    const index = this.campaigns.findIndex(camp => camp.id === id);
    if (index !== -1) {
      this.campaigns.splice(index, 1);
    }
  }

  async getCollaborations(campaignId?: number, influencerId?: number): Promise<(Collaboration & {
    campaign: Campaign;
    influencer: Influencer;
  })[]> {
    let filteredCollaborations = [...this.collaborations];
    
    if (campaignId) {
      filteredCollaborations = filteredCollaborations.filter(col => col.campaignId === campaignId);
    }
    
    if (influencerId) {
      filteredCollaborations = filteredCollaborations.filter(col => col.influencerId === influencerId);
    }
    
    return filteredCollaborations.map(col => ({
      ...col,
      campaign: this.campaigns.find(camp => camp.id === col.campaignId)!,
      influencer: this.influencers.find(inf => inf.id === col.influencerId)!,
    })).sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime());
  }

  async createCollaboration(collaborationData: InsertCollaboration): Promise<Collaboration> {
    const collaboration: Collaboration = {
      id: this.nextId++,
      ...collaborationData,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.collaborations.push(collaboration);
    return collaboration;
  }

  async updateCollaboration(id: number, updates: Partial<InsertCollaboration>): Promise<Collaboration> {
    const index = this.collaborations.findIndex(col => col.id === id);
    if (index === -1) throw new Error("Collaboration not found");
    
    this.collaborations[index] = {
      ...this.collaborations[index],
      ...updates,
      updatedAt: new Date(),
    };
    return this.collaborations[index];
  }

  async getAnalytics(campaignId: number): Promise<Analytics[]> {
    return this.analytics
      .filter(analytics => analytics.campaignId === campaignId)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }

  async createAnalytics(analyticsData: InsertAnalytics): Promise<Analytics> {
    const analytics: Analytics = {
      id: this.nextId++,
      ...analyticsData,
      createdAt: new Date(),
    };
    this.analytics.push(analytics);
    return analytics;
  }

  async getDashboardStats(userId?: number): Promise<{
    activeCampaigns: number;
    totalReach: number;
    avgEngagementRate: number;
    totalROI: number;
  }> {
    let campaigns = this.campaigns;
    if (userId) {
      campaigns = campaigns.filter(camp => camp.createdBy === userId);
    }
    
    const activeCampaigns = campaigns.filter(camp => camp.status === "active").length;
    
    const completedCollaborations = this.collaborations.filter(col => 
      col.status === "completed" && 
      (!userId || campaigns.some(camp => camp.id === col.campaignId))
    );
    
    const totalReach = completedCollaborations.reduce((sum, col) => sum + (col.actualReach || 0), 0);
    const avgEngagementRate = completedCollaborations.length > 0
      ? completedCollaborations.reduce((sum, col) => sum + (parseFloat(col.actualEngagement || "0")), 0) / completedCollaborations.length
      : 0;
    
    return {
      activeCampaigns,
      totalReach,
      avgEngagementRate,
      totalROI: 325, // Sample ROI
    };
  }

  async seedData(): Promise<void> {
    // Check if data already exists
    if (this.influencers.length > 0) return;

    // Create sample user
    const sampleUser = await this.createUser({
      username: "admin",
      email: "admin@influencehub.com",
      password: "password",
      role: "Brand Manager",
      firstName: "Sarah",
      lastName: "Johnson",
      profileImageUrl: "https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150",
    });

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

    const createdInfluencers = [];
    for (const influencer of influencerData) {
      const created = await this.createInfluencer(influencer);
      createdInfluencers.push(created);
    }

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

    const createdCampaigns = [];
    for (const campaign of campaignData) {
      const created = await this.createCampaign(campaign);
      createdCampaigns.push(created);
    }

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
        actualReach: null,
        actualEngagement: null,
        completedAt: null,
      },
      {
        campaignId: createdCampaigns[2].id,
        influencerId: createdInfluencers[2].id,
        status: "completed",
        agreedRate: "350",
        deliverables: "3 workout videos, 5 Instagram posts",
        actualReach: 320000,
        actualEngagement: "6.1",
        completedAt: new Date("2024-05-25"),
      },
    ];

    for (const collaboration of collaborationData) {
      await this.createCollaboration(collaboration);
    }
  }
}

export const storage = new MemoryStorage();