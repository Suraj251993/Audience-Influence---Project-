import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import Sidebar from "@/components/layout/Sidebar";
import MobileHeader from "@/components/layout/MobileHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Users, 
  DollarSign, 
  Eye,
  MessageCircle,
  Calendar
} from "lucide-react";

interface CollaborationWithDetails {
  id: number;
  campaignId: number;
  influencerId: number;
  status: string;
  agreedRate: string | null;
  deliverables: string | null;
  actualReach: number | null;
  actualEngagement: string | null;
  completedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  campaign: {
    id: number;
    name: string;
    category: string;
    budget: string;
  };
  influencer: {
    id: number;
    name: string;
    handle: string;
    profileImageUrl: string | null;
    followers: number;
    engagementRate: string;
  };
}

export default function Collaborations() {
  const { toast } = useToast();
  const [statusFilter, setStatusFilter] = useState("all");

  const { data: collaborations, isLoading } = useQuery<CollaborationWithDetails[]>({
    queryKey: ["/api/collaborations", { status: statusFilter }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (statusFilter !== "all") params.append("status", statusFilter);
      
      const response = await fetch(`/api/collaborations?${params}`);
      if (!response.ok) {
        throw new Error("Failed to fetch collaborations");
      }
      return response.json();
    },
  });

  const updateCollaborationMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const response = await fetch(`/api/collaborations/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) {
        throw new Error("Failed to update collaboration");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/collaborations"] });
      queryClient.invalidateQueries({ queryKey: ["/api/campaigns"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({
        title: "Collaboration Updated",
        description: "Collaboration status has been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update collaboration: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const handleStatusUpdate = (collaborationId: number, newStatus: string) => {
    updateCollaborationMutation.mutate({ id: collaborationId, status: newStatus });
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: "bg-yellow-100 text-yellow-800",
      accepted: "bg-blue-100 text-blue-800",
      active: "bg-purple-100 text-purple-800",
      completed: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "cancelled":
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-600" />;
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + "M";
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + "K";
    }
    return num.toString();
  };

  const statusCounts = collaborations?.reduce((acc, collaboration) => {
    acc[collaboration.status] = (acc[collaboration.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};

  const filteredCollaborations = collaborations?.filter(collaboration => 
    statusFilter === "all" || collaboration.status === statusFilter
  ) || [];

  return (
    <div className="min-h-screen bg-gray-50">
      <MobileHeader />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6 lg:ml-64">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-gray-900">Collaborations</h1>
              <p className="text-gray-600 mt-1">Manage your influencer partnerships and track progress</p>
            </div>

            {/* Status Filter Tabs */}
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
                  All Collaborations
                </button>
                <button
                  onClick={() => setStatusFilter("pending")}
                  className={`border-b-2 py-2 px-1 font-medium text-sm transition-colors ${
                    statusFilter === "pending"
                      ? "border-primary text-primary"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Pending ({statusCounts.pending || 0})
                </button>
                <button
                  onClick={() => setStatusFilter("active")}
                  className={`border-b-2 py-2 px-1 font-medium text-sm transition-colors ${
                    statusFilter === "active"
                      ? "border-primary text-primary"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Active ({statusCounts.active || 0})
                </button>
                <button
                  onClick={() => setStatusFilter("completed")}
                  className={`border-b-2 py-2 px-1 font-medium text-sm transition-colors ${
                    statusFilter === "completed"
                      ? "border-primary text-primary"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Completed ({statusCounts.completed || 0})
                </button>
              </nav>
            </div>

            {/* Collaborations List */}
            {isLoading ? (
              <div className="space-y-6">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Card key={i}>
                    <CardContent className="p-6">
                      <Skeleton className="h-32 w-full" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredCollaborations.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">
                  {statusFilter === "all" 
                    ? "No collaborations found. Start by contacting influencers from the discovery page."
                    : `No ${statusFilter} collaborations found.`
                  }
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {filteredCollaborations.map((collaboration) => (
                  <Card key={collaboration.id} className="overflow-hidden">
                    <CardHeader className="pb-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-4">
                          <Avatar className="h-12 w-12">
                            <AvatarImage 
                              src={collaboration.influencer.profileImageUrl || ""} 
                              alt={collaboration.influencer.name} 
                            />
                            <AvatarFallback>
                              {collaboration.influencer.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <CardTitle className="text-lg">{collaboration.influencer.name}</CardTitle>
                            <CardDescription className="flex items-center space-x-2">
                              <span>{collaboration.influencer.handle}</span>
                              <span>•</span>
                              <span>{formatNumber(collaboration.influencer.followers)} followers</span>
                              <span>•</span>
                              <span>{collaboration.influencer.engagementRate}% engagement</span>
                            </CardDescription>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(collaboration.status)}
                          <Badge className={getStatusColor(collaboration.status)}>
                            {collaboration.status}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="pt-0">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Campaign Details</h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-500">Campaign:</span>
                              <span className="font-medium">{collaboration.campaign.name}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-500">Category:</span>
                              <span>{collaboration.campaign.category}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-500">Budget:</span>
                              <span>${collaboration.campaign.budget}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-500">Agreed Rate:</span>
                              <span className="font-medium">${collaboration.agreedRate || "TBD"}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Performance</h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-500 flex items-center">
                                <Eye className="h-3 w-3 mr-1" />
                                Reach:
                              </span>
                              <span className="font-medium">
                                {collaboration.actualReach ? formatNumber(collaboration.actualReach) : "Pending"}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-500 flex items-center">
                                <MessageCircle className="h-3 w-3 mr-1" />
                                Engagement:
                              </span>
                              <span className="font-medium">
                                {collaboration.actualEngagement ? `${collaboration.actualEngagement}%` : "Pending"}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-500 flex items-center">
                                <Calendar className="h-3 w-3 mr-1" />
                                Created:
                              </span>
                              <span>{new Date(collaboration.createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {collaboration.deliverables && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <h4 className="font-medium text-gray-900 mb-2">Deliverables</h4>
                          <p className="text-sm text-gray-600">{collaboration.deliverables}</p>
                        </div>
                      )}
                      
                      {collaboration.status === "pending" && (
                        <div className="mt-4 pt-4 border-t border-gray-200 flex space-x-2">
                          <Button
                            size="sm"
                            onClick={() => handleStatusUpdate(collaboration.id, "active")}
                            disabled={updateCollaborationMutation.isPending}
                          >
                            Accept
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleStatusUpdate(collaboration.id, "cancelled")}
                            disabled={updateCollaborationMutation.isPending}
                          >
                            Decline
                          </Button>
                        </div>
                      )}
                      
                      {collaboration.status === "active" && (
                        <div className="mt-4 pt-4 border-t border-gray-200 flex space-x-2">
                          <Button
                            size="sm"
                            onClick={() => handleStatusUpdate(collaboration.id, "completed")}
                            disabled={updateCollaborationMutation.isPending}
                          >
                            Mark as Completed
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}