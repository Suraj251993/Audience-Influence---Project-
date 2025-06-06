import { useQuery } from "@tanstack/react-query";
import Sidebar from "@/components/layout/Sidebar";
import MobileHeader from "@/components/layout/MobileHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from "recharts";
import { TrendingUp, Users, Eye, Heart, MessageCircle, Share2, DollarSign, Target } from "lucide-react";
import type { CampaignWithCollaborations } from "@shared/schema";

const performanceData = [
  { month: "Jan", reach: 45000, engagement: 2300, clicks: 890 },
  { month: "Feb", reach: 52000, engagement: 2800, clicks: 1120 },
  { month: "Mar", reach: 48000, engagement: 2600, clicks: 950 },
  { month: "Apr", reach: 61000, engagement: 3200, clicks: 1340 },
  { month: "May", reach: 55000, engagement: 2900, clicks: 1180 },
  { month: "Jun", reach: 67000, engagement: 3500, clicks: 1450 },
];

const engagementData = [
  { name: "Likes", value: 45, color: "#3B82F6" },
  { name: "Comments", value: 25, color: "#10B981" },
  { name: "Shares", value: 20, color: "#F59E0B" },
  { name: "Saves", value: 10, color: "#EF4444" },
];

const topInfluencers = [
  { name: "Emma Style", campaigns: 3, totalReach: 450000, avgEngagement: 4.8, revenue: 1500 },
  { name: "Wanderlust Tales", campaigns: 2, totalReach: 680000, avgEngagement: 4.9, revenue: 1750 },
  { name: "FitLife Coach", campaigns: 2, totalReach: 320000, avgEngagement: 6.1, revenue: 700 },
  { name: "TechReviewer", campaigns: 1, totalReach: 280000, avgEngagement: 5.2, revenue: 400 },
];

export default function Analytics() {
  const { data: campaigns, isLoading } = useQuery<CampaignWithCollaborations[]>({
    queryKey: ["/api/campaigns"],
  });

  const { data: stats, isLoading: statsLoading } = useQuery<{
    activeCampaigns: number;
    totalReach: number;
    avgEngagementRate: number;
    totalROI: number;
  }>({
    queryKey: ["/api/dashboard/stats"],
  });

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + "M";
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + "K";
    }
    return num.toString();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <MobileHeader />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6 lg:ml-64">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-gray-900">Analytics & Insights</h1>
              <p className="text-gray-600 mt-1">Track your campaign performance and ROI</p>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-600">Total Reach</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {statsLoading ? <Skeleton className="h-8 w-16" /> : formatNumber(stats?.totalReach || 0)}
                      </p>
                      <p className="text-xs text-green-600 flex items-center mt-1">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        +12% from last month
                      </p>
                    </div>
                    <div className="ml-4 p-3 bg-blue-100 rounded-lg">
                      <Eye className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-600">Avg Engagement</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {statsLoading ? <Skeleton className="h-8 w-16" /> : `${stats?.avgEngagementRate?.toFixed(1) || 0}%`}
                      </p>
                      <p className="text-xs text-green-600 flex items-center mt-1">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        +0.8% from last month
                      </p>
                    </div>
                    <div className="ml-4 p-3 bg-green-100 rounded-lg">
                      <Heart className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-600">Active Campaigns</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {statsLoading ? <Skeleton className="h-8 w-16" /> : stats?.activeCampaigns || 0}
                      </p>
                      <p className="text-xs text-blue-600 flex items-center mt-1">
                        <Target className="h-3 w-3 mr-1" />
                        2 launching soon
                      </p>
                    </div>
                    <div className="ml-4 p-3 bg-purple-100 rounded-lg">
                      <Target className="h-6 w-6 text-purple-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-600">Total ROI</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {statsLoading ? <Skeleton className="h-8 w-16" /> : `${stats?.totalROI || 0}%`}
                      </p>
                      <p className="text-xs text-green-600 flex items-center mt-1">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        Excellent performance
                      </p>
                    </div>
                    <div className="ml-4 p-3 bg-yellow-100 rounded-lg">
                      <DollarSign className="h-6 w-6 text-yellow-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Performance Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Performance Trends</CardTitle>
                  <CardDescription>Reach and engagement over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={performanceData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Line type="monotone" dataKey="reach" stroke="#3B82F6" strokeWidth={2} />
                        <Line type="monotone" dataKey="engagement" stroke="#10B981" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Engagement Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle>Engagement Breakdown</CardTitle>
                  <CardDescription>Distribution of engagement types</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={engagementData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={120}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {engagementData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    {engagementData.map((item) => (
                      <div key={item.name} className="flex items-center">
                        <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: item.color }}></div>
                        <span className="text-sm text-gray-600">{item.name}: {item.value}%</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Top Performing Influencers */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Top Performing Influencers</CardTitle>
                <CardDescription>Your most successful collaborations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topInfluencers.map((influencer, index) => (
                    <div key={influencer.name} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{influencer.name}</p>
                          <p className="text-sm text-gray-500">{influencer.campaigns} campaigns</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-8 text-right">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{formatNumber(influencer.totalReach)}</p>
                          <p className="text-xs text-gray-500">Total Reach</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{influencer.avgEngagement}%</p>
                          <p className="text-xs text-gray-500">Avg Engagement</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">${influencer.revenue}</p>
                          <p className="text-xs text-gray-500">Revenue Generated</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Campaigns */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Campaign Performance</CardTitle>
                <CardDescription>Latest campaign results and metrics</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                  </div>
                ) : campaigns?.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No campaigns available yet.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {campaigns?.slice(0, 5).map((campaign) => (
                      <div key={campaign.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3">
                            <h3 className="font-medium text-gray-900">{campaign.name}</h3>
                            <Badge variant={
                              campaign.status === "active" ? "default" :
                              campaign.status === "completed" ? "secondary" :
                              campaign.status === "pending" ? "outline" : "destructive"
                            }>
                              {campaign.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-500 mt-1">{campaign.category}</p>
                        </div>
                        <div className="grid grid-cols-3 gap-8 text-right">
                          <div>
                            <p className="text-sm font-medium text-gray-900">{campaign.collaborations.length}</p>
                            <p className="text-xs text-gray-500">Collaborations</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {formatNumber(campaign.collaborations.reduce((sum, col) => sum + (col.actualReach || 0), 0))}
                            </p>
                            <p className="text-xs text-gray-500">Total Reach</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">${campaign.budget}</p>
                            <p className="text-xs text-gray-500">Budget</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}