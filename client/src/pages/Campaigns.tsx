import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import Sidebar from "@/components/layout/Sidebar";
import MobileHeader from "@/components/layout/MobileHeader";
import CampaignCard from "@/components/campaigns/CampaignCard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";
import { insertCampaignSchema, type CampaignWithCollaborations, type InsertCampaign } from "@shared/schema";

export default function Campaigns() {
  const { toast } = useToast();
  const [statusFilter, setStatusFilter] = useState("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

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

  const form = useForm<InsertCampaign>({
    resolver: zodResolver(insertCampaignSchema),
    defaultValues: {
      name: "",
      description: "",
      category: "",
      budget: "",
      status: "draft",
      targetAudience: "",
      goals: "",
      createdBy: 1, // Default user ID for demo
    },
  });

  const createCampaignMutation = useMutation({
    mutationFn: async (data: InsertCampaign) => {
      const response = await fetch("/api/campaigns", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error("Failed to create campaign");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/campaigns"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      setIsCreateDialogOpen(false);
      form.reset();
      toast({
        title: "Campaign Created",
        description: "Your campaign has been created successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to create campaign: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const handleCreateCampaign = () => {
    setIsCreateDialogOpen(true);
  };

  const onSubmit = (data: InsertCampaign) => {
    createCampaignMutation.mutate(data);
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
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    onClick={handleCreateCampaign}
                    className="mt-4 sm:mt-0 bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    New Campaign
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px]">
                  <DialogHeader>
                    <DialogTitle>Create New Campaign</DialogTitle>
                  </DialogHeader>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Campaign Name</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter campaign name" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="category"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Category</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select category" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="Fashion & Beauty">Fashion & Beauty</SelectItem>
                                  <SelectItem value="Technology">Technology</SelectItem>
                                  <SelectItem value="Health & Fitness">Health & Fitness</SelectItem>
                                  <SelectItem value="Food & Lifestyle">Food & Lifestyle</SelectItem>
                                  <SelectItem value="Travel">Travel</SelectItem>
                                  <SelectItem value="Lifestyle">Lifestyle</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Describe your campaign objectives and requirements" 
                                className="min-h-[80px]"
                                value={field.value || ""}
                                onChange={field.onChange}
                                onBlur={field.onBlur}
                                name={field.name}
                                ref={field.ref}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="budget"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Budget ($)</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  placeholder="Enter budget amount" 
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="status"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Status</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select status" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="draft">Draft</SelectItem>
                                  <SelectItem value="pending">Pending</SelectItem>
                                  <SelectItem value="active">Active</SelectItem>
                                  <SelectItem value="completed">Completed</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <FormField
                        control={form.control}
                        name="targetAudience"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Target Audience</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="e.g., Young professionals aged 25-35" 
                                value={field.value || ""}
                                onChange={field.onChange}
                                onBlur={field.onBlur}
                                name={field.name}
                                ref={field.ref}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="goals"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Campaign Goals</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Describe your campaign goals and expected outcomes" 
                                className="min-h-[60px]"
                                value={field.value || ""}
                                onChange={field.onChange}
                                onBlur={field.onBlur}
                                name={field.name}
                                ref={field.ref}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="flex justify-end space-x-2 pt-4">
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => setIsCreateDialogOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button 
                          type="submit" 
                          disabled={createCampaignMutation.isPending}
                        >
                          {createCampaignMutation.isPending ? "Creating..." : "Create Campaign"}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
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
