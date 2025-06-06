import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Influencer } from "@shared/schema";

interface InfluencerCardProps {
  influencer: Influencer;
  onContact?: (influencer: Influencer) => void;
}

const getCategoryColor = (category: string) => {
  const colors: Record<string, string> = {
    "Fashion & Beauty": "bg-pink-100 text-pink-800",
    "Technology": "bg-blue-100 text-blue-800",
    "Health & Fitness": "bg-green-100 text-green-800",
    "Food & Lifestyle": "bg-orange-100 text-orange-800",
    "Travel": "bg-purple-100 text-purple-800",
    "Lifestyle": "bg-indigo-100 text-indigo-800",
  };
  return colors[category] || "bg-gray-100 text-gray-800";
};

const formatNumber = (num: number) => {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(0)}K`;
  return num.toString();
};

export default function InfluencerCard({ influencer, onContact }: InfluencerCardProps) {
  return (
    <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center mb-4">
          <img
            className="w-12 h-12 rounded-full object-cover"
            src={influencer.profileImageUrl || "/api/placeholder/50/50"}
            alt={influencer.name}
          />
          <div className="ml-3">
            <h3 className="text-lg font-semibold text-gray-900">{influencer.name}</h3>
            <p className="text-gray-600">{influencer.handle}</p>
          </div>
        </div>
        
        <div className="mb-4">
          <Badge className={getCategoryColor(influencer.category)}>
            {influencer.category}
          </Badge>
        </div>
        
        <div className="grid grid-cols-3 gap-4 mb-4 text-center">
          <div>
            <p className="text-lg font-bold text-gray-900">
              {formatNumber(influencer.followers)}
            </p>
            <p className="text-xs text-gray-500">Followers</p>
          </div>
          <div>
            <p className="text-lg font-bold text-gray-900">
              {influencer.engagementRate}%
            </p>
            <p className="text-xs text-gray-500">Engagement</p>
          </div>
          <div>
            <p className="text-lg font-bold text-gray-900">
              ${influencer.ratePerPost}
            </p>
            <p className="text-xs text-gray-500">Per Post</p>
          </div>
        </div>
        
        <Button
          className="w-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          onClick={() => onContact?.(influencer)}
        >
          Contact Influencer
        </Button>
      </CardContent>
    </Card>
  );
}
