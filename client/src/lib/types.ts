export interface NavigationState {
  currentView: string;
  setCurrentView: (view: string) => void;
}

export interface DashboardStats {
  activeCampaigns: number;
  totalReach: number;
  avgEngagementRate: number;
  totalROI: number;
}

export interface InfluencerFilters {
  search: string;
  category: string;
  followers: string;
}

export interface CampaignFilters {
  status: string;
  userId?: number;
}

// Chart data types
export interface PerformanceChartData {
  month: string;
  reach: number;
}

export interface CategoryChartData {
  name: string;
  value: number;
  color: string;
}
