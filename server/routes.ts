import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertInfluencerSchema, insertCampaignSchema, insertCollaborationSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize database with sample data
  app.post("/api/seed", async (req, res) => {
    try {
      await storage.seedData();
      res.json({ message: "Database seeded successfully" });
    } catch (error) {
      console.error("Error seeding database:", error);
      res.status(500).json({ message: "Failed to seed database" });
    }
  });

  // Dashboard stats
  app.get("/api/dashboard/stats", async (req, res) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  // Influencer routes
  app.get("/api/influencers", async (req, res) => {
    try {
      const { category, minFollowers, maxFollowers, search } = req.query;
      
      const filters: any = {};
      if (category) filters.category = category as string;
      if (minFollowers) filters.minFollowers = parseInt(minFollowers as string);
      if (maxFollowers) filters.maxFollowers = parseInt(maxFollowers as string);
      if (search) filters.search = search as string;
      
      const influencers = await storage.getInfluencers(filters);
      res.json(influencers);
    } catch (error) {
      console.error("Error fetching influencers:", error);
      res.status(500).json({ message: "Failed to fetch influencers" });
    }
  });

  app.get("/api/influencers/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const influencer = await storage.getInfluencer(id);
      
      if (!influencer) {
        return res.status(404).json({ message: "Influencer not found" });
      }
      
      res.json(influencer);
    } catch (error) {
      console.error("Error fetching influencer:", error);
      res.status(500).json({ message: "Failed to fetch influencer" });
    }
  });

  app.post("/api/influencers", async (req, res) => {
    try {
      const validatedData = insertInfluencerSchema.parse(req.body);
      const influencer = await storage.createInfluencer(validatedData);
      res.status(201).json(influencer);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Error creating influencer:", error);
      res.status(500).json({ message: "Failed to create influencer" });
    }
  });

  app.put("/api/influencers/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertInfluencerSchema.partial().parse(req.body);
      const influencer = await storage.updateInfluencer(id, validatedData);
      res.json(influencer);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Error updating influencer:", error);
      res.status(500).json({ message: "Failed to update influencer" });
    }
  });

  app.delete("/api/influencers/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteInfluencer(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting influencer:", error);
      res.status(500).json({ message: "Failed to delete influencer" });
    }
  });

  // Campaign routes
  app.get("/api/campaigns", async (req, res) => {
    try {
      const { userId, status } = req.query;
      const campaigns = await storage.getCampaigns(
        userId ? parseInt(userId as string) : undefined,
        status as string
      );
      res.json(campaigns);
    } catch (error) {
      console.error("Error fetching campaigns:", error);
      res.status(500).json({ message: "Failed to fetch campaigns" });
    }
  });

  app.get("/api/campaigns/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const campaign = await storage.getCampaign(id);
      
      if (!campaign) {
        return res.status(404).json({ message: "Campaign not found" });
      }
      
      res.json(campaign);
    } catch (error) {
      console.error("Error fetching campaign:", error);
      res.status(500).json({ message: "Failed to fetch campaign" });
    }
  });

  app.post("/api/campaigns", async (req, res) => {
    try {
      const validatedData = insertCampaignSchema.parse(req.body);
      const campaign = await storage.createCampaign(validatedData);
      res.status(201).json(campaign);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Error creating campaign:", error);
      res.status(500).json({ message: "Failed to create campaign" });
    }
  });

  app.put("/api/campaigns/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertCampaignSchema.partial().parse(req.body);
      const campaign = await storage.updateCampaign(id, validatedData);
      res.json(campaign);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Error updating campaign:", error);
      res.status(500).json({ message: "Failed to update campaign" });
    }
  });

  app.patch("/api/campaigns/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertCampaignSchema.partial().parse(req.body);
      const campaign = await storage.updateCampaign(id, validatedData);
      res.json(campaign);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Error updating campaign:", error);
      res.status(500).json({ message: "Failed to update campaign" });
    }
  });

  app.delete("/api/campaigns/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteCampaign(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting campaign:", error);
      res.status(500).json({ message: "Failed to delete campaign" });
    }
  });

  // Collaboration routes
  app.get("/api/collaborations", async (req, res) => {
    try {
      const { campaignId, influencerId } = req.query;
      const collaborations = await storage.getCollaborations(
        campaignId ? parseInt(campaignId as string) : undefined,
        influencerId ? parseInt(influencerId as string) : undefined
      );
      res.json(collaborations);
    } catch (error) {
      console.error("Error fetching collaborations:", error);
      res.status(500).json({ message: "Failed to fetch collaborations" });
    }
  });

  app.post("/api/collaborations", async (req, res) => {
    try {
      const validatedData = insertCollaborationSchema.parse(req.body);
      const collaboration = await storage.createCollaboration(validatedData);
      res.status(201).json(collaboration);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Error creating collaboration:", error);
      res.status(500).json({ message: "Failed to create collaboration" });
    }
  });

  app.put("/api/collaborations/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertCollaborationSchema.partial().parse(req.body);
      const collaboration = await storage.updateCollaboration(id, validatedData);
      res.json(collaboration);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Error updating collaboration:", error);
      res.status(500).json({ message: "Failed to update collaboration" });
    }
  });

  // Analytics routes
  app.get("/api/analytics/:campaignId", async (req, res) => {
    try {
      const campaignId = parseInt(req.params.campaignId);
      const analytics = await storage.getAnalytics(campaignId);
      res.json(analytics);
    } catch (error) {
      console.error("Error fetching analytics:", error);
      res.status(500).json({ message: "Failed to fetch analytics" });
    }
  });

  // User profile routes
  app.get("/api/user/profile", async (req, res) => {
    try {
      const userProfile = await storage.getUserProfile();
      res.json(userProfile);
    } catch (error) {
      console.error("Error fetching user profile:", error);
      res.status(500).json({ message: "Failed to fetch user profile" });
    }
  });

  app.put("/api/user/profile", async (req, res) => {
    try {
      const { firstName, lastName, email, role } = req.body;
      
      // Validate required fields
      if (!firstName || !lastName || !email) {
        return res.status(400).json({ message: "First name, last name, and email are required" });
      }
      
      const updatedUser = await storage.updateUserProfile({
        firstName,
        lastName,
        email,
        role,
      });
      
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating user profile:", error);
      res.status(500).json({ message: "Failed to update user profile" });
    }
  });

  app.put("/api/user/password", async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body;
      
      // Validate required fields
      if (!currentPassword || !newPassword) {
        return res.status(400).json({ message: "Current password and new password are required" });
      }
      
      // For demo purposes, simulate password validation
      if (currentPassword === "wrongpassword") {
        return res.status(400).json({ message: "Current password is incorrect" });
      }
      
      res.json({ message: "Password updated successfully" });
    } catch (error) {
      console.error("Error updating password:", error);
      res.status(500).json({ message: "Failed to update password" });
    }
  });

  app.put("/api/user/notifications", async (req, res) => {
    try {
      const notifications = req.body;
      
      // For demo purposes, just return success
      res.json({ message: "Notification preferences updated successfully", notifications });
    } catch (error) {
      console.error("Error updating notification preferences:", error);
      res.status(500).json({ message: "Failed to update notification preferences" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
