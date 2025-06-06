import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import Sidebar from "@/components/layout/Sidebar";
import MobileHeader from "@/components/layout/MobileHeader";
import CampaignCard from "@/components/campaigns/CampaignCard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus } from "lucide-react";
import type { CampaignWithCollaborations } from "@shared/schema";

export default function Campaigns() {
  const { toast } = useToast();
  const [statusFilter, setStatusFilter] = useState("all");

  const { data: campaigns, isLoading } = useQuery({
    queryKey: ["/api/campaigns", { status: statusFilter }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (statusFilter !== "all") params.append("status", statusFilter);
      
      const response = await fetch(`/api/campaigns?${params}`);
      if (!response.ok) {
        throw new Error("Failed to fetch campaigns");
      }
      return response.json();
    },
  });

  const handleCreateCampaign = () => {
    toast({
      title: "Create Campaign",
      description: "Campaign creation form would open here.",
    });
  };

  const handleViewCampaign = (campaign: CampaignWithCollaborations) => {
    toast({
      title: "View Campaign",
      description: `Viewing details for ${campaign.name}`,
    });
  };

  const handleEditCampaign = (campaign: CampaignWithCollaborations) => {
    toast({
      title: "Edit Campaign",
      description: `Edit form for ${campaign.name} would open here.`,
    });
  };

  const getStatusCounts = () => {
    if (!campaigns) return { active: 0, pending: 0, completed: 0 };
    
    return campaigns.reduce(
      (counts: any, campaign: CampaignWithCollaborations) => {
        counts[campaign.status] = (counts[campaign.status] || 0) + 1;
        return counts;
      },
      { active: 0, pending: 0, completed: 0 }
    );
  };

  const statusCounts = getStatusCounts();

  const filteredCampaigns = campaigns?.filter((campaign: CampaignWithCollaborations) => 
    statusFilter === "all" || campaign.status === statusFilter
  ) || [];

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <MobileHeader />
        <div className="flex-1 overflow-auto">
          <div className="p-4 md:p-8">
            <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Campaigns</h1>
                <p className="mt-2 text-gray-600">Manage your influencer marketing campaigns.</p>
              </div>
              <Button
                onClick={handleCreateCampaign}
                className="mt-4 sm:mt-0 bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <Plus className="mr-2 h-4 w-4" />
                New Campaign
              </Button>
            </div>

            {/* Campaign Status Tabs */}
            <div className="mb-8">
              <nav className="flex space-x-8">
                <button
                  onClick={() => setStatusFilter("all")}
                  className={`border-b-2 py-2 px-1 font-medium text-sm transition-colors ${
                    statusFilter === "all"
                      ? "border-primary text-primary"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                >
                  All Campaigns
                </button>
                <button
                  onClick={() => setStatusFilter("active")}
                  className={`border-b-2 py-2 px-1 font-medium text-sm transition-colors ${
                    statusFilter === "active"
                      ? "border-primary text-primary"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Active ({statusCounts.active})
                </button>
                <button
                  onClick={() => setStatusFilter("pending")}
                  className={`border-b-2 py-2 px-1 font-medium text-sm transition-colors ${
                    statusFilter === "pending"
                      ? "border-primary text-primary"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Pending ({statusCounts.pending})
                </button>
                <button
                  onClick={() => setStatusFilter("completed")}
                  className={`border-b-2 py-2 px-1 font-medium text-sm transition-colors ${
                    statusFilter === "completed"
                      ? "border-primary text-primary"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Completed ({statusCounts.completed})
                </button>
              </nav>
            </div>

            {/* Campaign Cards */}
            {isLoading ? (
              <div className="space-y-6">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="bg-white rounded-xl border border-gray-200 shadow-sm">
                    <div className="p-6">
                      <Skeleton className="h-32 w-full" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredCampaigns.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">
                  {statusFilter === "all" 
                    ? "No campaigns found. Create your first campaign to get started."
                    : `No ${statusFilter} campaigns found.`
                  }
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {filteredCampaigns.map((campaign: CampaignWithCollaborations) => (
                  <CampaignCard
                    key={campaign.id}
                    campaign={campaign}
                    onView={handleViewCampaign}
                    onEdit={handleEditCampaign}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
