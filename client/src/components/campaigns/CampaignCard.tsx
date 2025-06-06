import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Edit } from "lucide-react";
import type { CampaignWithCollaborations } from "@shared/schema";

interface CampaignCardProps {
  campaign: CampaignWithCollaborations;
  onView?: (campaign: CampaignWithCollaborations) => void;
  onEdit?: (campaign: CampaignWithCollaborations) => void;
}

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    active: "bg-green-100 text-green-800",
    pending: "bg-yellow-100 text-yellow-800",
    completed: "bg-blue-100 text-blue-800",
    draft: "bg-gray-100 text-gray-800",
    cancelled: "bg-red-100 text-red-800",
  };
  return colors[status] || "bg-gray-100 text-gray-800";
};

const formatCurrency = (amount: string | number) => {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
  }).format(num);
};

const formatNumber = (num: number) => {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(0)}K`;
  return num.toString();
};

export default function CampaignCard({ campaign, onView, onEdit }: CampaignCardProps) {
  const totalReach = campaign.collaborations.reduce(
    (sum, col) => sum + (col.actualReach || 0),
    0
  );
  
  const avgEngagement = campaign.collaborations.length > 0
    ? campaign.collaborations.reduce(
        (sum, col) => sum + (parseFloat(col.actualEngagement || "0")),
        0
      ) / campaign.collaborations.length
    : 0;

  const formatDate = (date: Date | null) => {
    if (!date) return "Not set";
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <Card className="border border-gray-200 shadow-sm">
      <CardContent className="p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center mb-2">
              <h3 className="text-lg font-semibold text-gray-900">{campaign.name}</h3>
              <Badge className={`ml-3 ${getStatusColor(campaign.status)}`}>
                {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
              </Badge>
            </div>
            <p className="text-gray-600 mb-2">{campaign.description}</p>
            <div className="flex items-center text-sm text-gray-500">
              <Calendar className="mr-2 h-4 w-4" />
              <span>
                Started {formatDate(campaign.startDate)} • Ends {formatDate(campaign.endDate)}
              </span>
            </div>
          </div>
          <div className="mt-4 lg:mt-0 lg:ml-6 flex gap-2">
            <Button
              onClick={() => onView?.(campaign)}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              View Details
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onEdit?.(campaign)}
            >
              <Edit className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
          <div className="text-center">
            <p className="text-lg font-bold text-gray-900">
              {campaign.collaborations.length}
            </p>
            <p className="text-xs text-gray-500">Influencers</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-gray-900">
              {formatNumber(totalReach)}
            </p>
            <p className="text-xs text-gray-500">Total Reach</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-gray-900">
              {avgEngagement > 0 ? `${avgEngagement.toFixed(1)}%` : "-"}
            </p>
            <p className="text-xs text-gray-500">Avg Engagement</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-gray-900">
              {formatCurrency(campaign.budget)}
            </p>
            <p className="text-xs text-gray-500">Budget</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-gray-900">285%</p>
            <p className="text-xs text-gray-500">ROI</p>
          </div>
        </div>

        {campaign.collaborations.length > 0 && (
          <div className="flex items-center space-x-4">
            <div className="flex -space-x-2">
              {campaign.collaborations.slice(0, 3).map((collaboration, index) => (
                <img
                  key={collaboration.id}
                  className="w-8 h-8 rounded-full border-2 border-white object-cover"
                  src={collaboration.influencer.profileImageUrl || "/api/placeholder/32/32"}
                  alt={collaboration.influencer.name}
                />
              ))}
              {campaign.collaborations.length > 3 && (
                <div className="w-8 h-8 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center">
                  <span className="text-xs text-gray-600">
                    +{campaign.collaborations.length - 3}
                  </span>
                </div>
              )}
            </div>
            <div className="text-sm text-gray-600">
              <span className="font-medium">{campaign.collaborations.length} influencers</span> participating
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
