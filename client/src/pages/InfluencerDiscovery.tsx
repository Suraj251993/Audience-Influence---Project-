import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import Sidebar from "@/components/layout/Sidebar";
import MobileHeader from "@/components/layout/MobileHeader";
import SearchFilters from "@/components/influencers/SearchFilters";
import InfluencerCard from "@/components/influencers/InfluencerCard";
import { Skeleton } from "@/components/ui/skeleton";
import type { Influencer } from "@shared/schema";

export default function InfluencerDiscovery() {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All Categories");
  const [followers, setFollowers] = useState("any");

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

  const handleContactInfluencer = (influencer: Influencer) => {
    toast({
      title: "Contact Request",
      description: `Contact form for ${influencer.name} would open here.`,
    });
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
    </div>
  );
}
