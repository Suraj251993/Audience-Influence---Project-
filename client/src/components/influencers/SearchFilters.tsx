import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search } from "lucide-react";

interface SearchFiltersProps {
  search: string;
  category: string;
  followers: string;
  onSearchChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onFollowersChange: (value: string) => void;
}

const categories = [
  "All Categories",
  "Fashion & Beauty",
  "Technology", 
  "Health & Fitness",
  "Food & Lifestyle",
  "Travel",
  "Lifestyle",
];

const followerRanges = [
  { label: "Any Size", value: "any" },
  { label: "1K - 10K", value: "1k-10k" },
  { label: "10K - 100K", value: "10k-100k" },
  { label: "100K - 1M", value: "100k-1m" },
  { label: "1M+", value: "1m+" },
];

export default function SearchFilters({
  search,
  category,
  followers,
  onSearchChange,
  onCategoryChange,
  onFollowersChange,
}: SearchFiltersProps) {
  return (
    <Card className="border border-gray-200 shadow-sm mb-8">
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <Label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
              Search Influencers
            </Label>
            <div className="relative">
              <Input
                id="search"
                type="text"
                className="pl-10"
                placeholder="Search by name, niche, or handle..."
                value={search}
                onChange={(e) => onSearchChange(e.target.value)}
              />
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            </div>
          </div>
          
          <div>
            <Label className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </Label>
            <Select value={category} onValueChange={onCategoryChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label className="block text-sm font-medium text-gray-700 mb-2">
              Followers
            </Label>
            <Select value={followers} onValueChange={onFollowersChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select range" />
              </SelectTrigger>
              <SelectContent>
                {followerRanges.map((range) => (
                  <SelectItem key={range.value} value={range.value}>
                    {range.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
