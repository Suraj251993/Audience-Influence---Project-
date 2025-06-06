import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useEffect } from "react";
import Sidebar from "@/components/layout/Sidebar";
import MobileHeader from "@/components/layout/MobileHeader";
import KPICard from "@/components/dashboard/KPICard";
import PerformanceChart from "@/components/dashboard/PerformanceChart";
import CategoryChart from "@/components/dashboard/CategoryChart";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Rocket, 
  Eye, 
  Heart, 
  TrendingUp 
} from "lucide-react";
import type { CampaignWithCollaborations } from "@shared/schema";

export default function Dashboard() {
  const { toast } = useToast();

  // Initialize data on first load
  const { mutate: seedData } = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/seed");
    },
    onSuccess: () => {
      queryClient.invalidateQueries();
    },
    onError: (error) => {
      console.error("Error seeding data:", error);
    },
  });

  const { data: stats, isLoading: statsLoading } = useQuery<{
    activeCampaigns: number;
    totalReach: number;
    avgEngagementRate: number;
    totalROI: number;
  }>({
    queryKey: ["/api/dashboard/stats"],
  });

  const { data: campaigns, isLoading: campaignsLoading } = useQuery<CampaignWithCollaborations[]>({
    queryKey: ["/api/campaigns"],
  });

  // Seed data on component mount if no campaigns exist
  useEffect(() => {
    if (campaigns && campaigns.length === 0) {
      seedData();
    }
  }, [campaigns, seedData]);

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      active: "bg-green-100 text-green-800",
      pending: "bg-yellow-100 text-yellow-800",
      completed: "bg-blue-100 text-blue-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(0)}K`;
    return num.toString();
  };

  const formatCurrency = (amount: string | number) => {
    const num = typeof amount === "string" ? parseFloat(amount) : amount;
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(num);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <MobileHeader />
        <div className="flex-1 overflow-auto">
          <div className="p-4 md:p-8">
            <div className="mb-8">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Dashboard</h1>
              <p className="mt-2 text-gray-600">Welcome back! Here's your campaign overview.</p>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {statsLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <Card key={i} className="border border-gray-200 shadow-sm">
                    <CardContent className="p-6">
                      <Skeleton className="h-20 w-full" />
                    </CardContent>
                  </Card>
                ))
              ) : (
                <>
                  <KPICard
                    title="Active Campaigns"
                    value={stats?.activeCampaigns || 0}
                    change="+8.2%"
                    icon={Rocket}
                    iconColor="text-primary-500"
                    iconBgColor="bg-primary-50"
                  />
                  <KPICard
                    title="Total Reach"
                    value={stats?.totalReach ? formatNumber(stats.totalReach) : "0"}
                    change="+12.5%"
                    icon={Eye}
                    iconColor="text-green-500"
                    iconBgColor="bg-green-50"
                  />
                  <KPICard
                    title="Engagement Rate"
                    value={stats?.avgEngagementRate ? `${stats.avgEngagementRate.toFixed(1)}%` : "0%"}
                    change="+2.1%"
                    icon={Heart}
                    iconColor="text-blue-500"
                    iconBgColor="bg-blue-50"
                  />
                  <KPICard
                    title="ROI"
                    value={`${stats?.totalROI || 0}%`}
                    change="+18.7%"
                    icon={TrendingUp}
                    iconColor="text-purple-500"
                    iconBgColor="bg-purple-50"
                  />
                </>
              )}
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              <PerformanceChart />
              <CategoryChart />
            </div>

            {/* Recent Campaigns */}
            <Card className="border border-gray-200 shadow-sm">
              <CardHeader className="border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold text-gray-900">
                    Recent Campaigns
                  </CardTitle>
                  <Button
                    variant="ghost"
                    className="text-primary hover:text-primary/80"
                    onClick={() => window.location.href = "/campaigns"}
                  >
                    View all
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {campaignsLoading ? (
                  <div className="p-6">
                    <Skeleton className="h-40 w-full" />
                  </div>
                ) : campaigns?.length === 0 ? (
                  <div className="p-6 text-center text-gray-500">
                    No campaigns found. Create your first campaign to get started.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Campaign
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Influencer
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Reach
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Budget
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {campaigns?.slice(0, 3).map((campaign: CampaignWithCollaborations) => (
                          <tr key={campaign.id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">
                                {campaign.name}
                              </div>
                              <div className="text-sm text-gray-500">{campaign.category}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {campaign.collaborations.length > 0 ? (
                                <div className="flex items-center">
                                  <img
                                    className="w-8 h-8 rounded-full object-cover"
                                    src={campaign.collaborations[0].influencer.profileImageUrl || "/api/placeholder/32/32"}
                                    alt={campaign.collaborations[0].influencer.name}
                                  />
                                  <div className="ml-3">
                                    <div className="text-sm font-medium text-gray-900">
                                      {campaign.collaborations[0].influencer.name}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                      {campaign.collaborations[0].influencer.handle}
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                <span className="text-sm text-gray-500">No influencers</span>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <Badge className={getStatusColor(campaign.status)}>
                                {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                              </Badge>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {campaign.collaborations.length > 0
                                ? formatNumber(
                                    campaign.collaborations.reduce(
                                      (sum, col) => sum + (col.actualReach || 0),
                                      0
                                    )
                                  )
                                : "0"}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {formatCurrency(campaign.budget)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
