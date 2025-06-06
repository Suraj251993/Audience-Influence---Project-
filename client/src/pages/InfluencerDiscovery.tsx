import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import Sidebar from "@/components/layout/Sidebar";
import MobileHeader from "@/components/layout/MobileHeader";
import SearchFilters from "@/components/influencers/SearchFilters";
import InfluencerCard from "@/components/influencers/InfluencerCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { insertCollaborationSchema, type Influencer, type InsertCollaboration, type Campaign } from "@shared/schema";
import { z } from "zod";

const collaborationFormSchema = insertCollaborationSchema.extend({
  campaignId: z.number().min(1, "Please select a campaign"),
  agreedRate: z.string().min(1, "Please enter the agreed rate"),
  deliverables: z.string().min(1, "Please specify deliverables"),
});

type CollaborationFormData = z.infer<typeof collaborationFormSchema>;

export default function InfluencerDiscovery() {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All Categories");
  const [followers, setFollowers] = useState("any");
  const [isContactDialogOpen, setIsContactDialogOpen] = useState(false);
  const [selectedInfluencer, setSelectedInfluencer] = useState<Influencer | null>(null);

  const getFollowerRange = (range: string) => {
    switch (range) {
      case "1k-10k":
        return { min: 1000, max: 10000 };
      case "10k-100k":
        return { min: 10000, max: 100000 };
      case "100k-1m":
        return { min: 100000, max: 1000000 };
      case "1m+":
        return { min: 1000000, max: undefined };
      default:
        return { min: undefined, max: undefined };
    }
  };

  const { data: influencers, isLoading } = useQuery({
    queryKey: ["/api/influencers", { search, category, followers }],
    queryFn: async () => {
      const params = new URLSearchParams();
      
      if (search) params.append("search", search);
      if (category !== "All Categories") params.append("category", category);
      
      const range = getFollowerRange(followers);
      if (range.min) params.append("minFollowers", range.min.toString());
      if (range.max) params.append("maxFollowers", range.max.toString());
      
      const response = await fetch(`/api/influencers?${params}`);
      if (!response.ok) {
        throw new Error("Failed to fetch influencers");
      }
      return response.json();
    },
  });

  const { data: campaigns } = useQuery<Campaign[]>({
    queryKey: ["/api/campaigns", { status: "active" }],
    queryFn: async () => {
      const response = await fetch("/api/campaigns?status=active");
      if (!response.ok) {
        throw new Error("Failed to fetch campaigns");
      }
      return response.json();
    },
  });

  const form = useForm<CollaborationFormData>({
    resolver: zodResolver(collaborationFormSchema),
    defaultValues: {
      campaignId: 0,
      influencerId: 0,
      status: "pending",
      agreedRate: "",
      deliverables: "",
    },
  });

  const createCollaborationMutation = useMutation({
    mutationFn: async (data: CollaborationFormData) => {
      const response = await fetch("/api/collaborations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error("Failed to create collaboration");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/campaigns"] });
      queryClient.invalidateQueries({ queryKey: ["/api/collaborations"] });
      setIsContactDialogOpen(false);
      form.reset();
      toast({
        title: "Collaboration Request Sent",
        description: `Your collaboration request has been sent to ${selectedInfluencer?.name}.`,
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to send collaboration request: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const handleContactInfluencer = (influencer: Influencer) => {
    setSelectedInfluencer(influencer);
    form.setValue("influencerId", influencer.id);
    form.setValue("agreedRate", influencer.ratePerPost || "");
    setIsContactDialogOpen(true);
  };

  const onSubmit = (data: CollaborationFormData) => {
    createCollaborationMutation.mutate(data);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <MobileHeader />
        <div className="flex-1 overflow-auto">
          <div className="p-4 md:p-8">
            <div className="mb-8">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                Discover Influencers
              </h1>
              <p className="mt-2 text-gray-600">
                Find the perfect influencers for your campaigns.
              </p>
            </div>

            <SearchFilters
              search={search}
              category={category}
              followers={followers}
              onSearchChange={setSearch}
              onCategoryChange={setCategory}
              onFollowersChange={setFollowers}
            />

            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="bg-white rounded-xl border border-gray-200 shadow-sm">
                    <div className="p-6">
                      <Skeleton className="h-40 w-full" />
                    </div>
                  </div>
                ))}
              </div>
            ) : influencers?.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No influencers found matching your criteria.</p>
                <p className="text-gray-400 mt-2">Try adjusting your search filters.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {influencers?.map((influencer: Influencer) => (
                  <InfluencerCard
                    key={influencer.id}
                    influencer={influencer}
                    onContact={handleContactInfluencer}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Contact Influencer Dialog */}
      <Dialog open={isContactDialogOpen} onOpenChange={setIsContactDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              Contact {selectedInfluencer?.name}
            </DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="campaignId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Select Campaign</FormLabel>
                    <Select 
                      onValueChange={(value) => field.onChange(parseInt(value))} 
                      value={field.value?.toString() || ""}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose a campaign" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {campaigns?.map((campaign) => (
                          <SelectItem key={campaign.id} value={campaign.id.toString()}>
                            {campaign.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="agreedRate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Agreed Rate ($)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="Enter agreed rate" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="deliverables"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Deliverables</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Describe the expected deliverables (e.g., 2 Instagram posts, 1 story)" 
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
              
              <div className="flex justify-end space-x-2 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsContactDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={createCollaborationMutation.isPending}
                >
                  {createCollaborationMutation.isPending ? "Sending..." : "Send Request"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
