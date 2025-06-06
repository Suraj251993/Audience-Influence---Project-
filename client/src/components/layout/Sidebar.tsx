import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { 
  ChartLine, 
  Users, 
  Rocket, 
  Handshake, 
  BarChart3, 
  Settings, 
  Megaphone 
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/", icon: ChartLine },
  { name: "Discover Influencers", href: "/influencers", icon: Users },
  { name: "Campaigns", href: "/campaigns", icon: Rocket },
  { name: "Collaborations", href: "/collaborations", icon: Handshake },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
];

export default function Sidebar() {
  const [location] = useLocation();

  return (
    <div className="hidden md:flex md:w-64 md:flex-col">
      <div className="flex flex-col flex-1 min-h-0 bg-white border-r border-gray-200">
        <div className="flex items-center flex-shrink-0 px-4 py-6">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Megaphone className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="ml-2 text-xl font-bold text-gray-900">InfluenceHub</span>
          </div>
        </div>
        <nav className="flex-1 px-4 pb-4 space-y-1">
          {navigation.map((item) => {
            const isActive = location === item.href;
            return (
              <Link key={item.name} href={item.href}
                className={cn(
                  isActive
                    ? "bg-primary-50 text-primary-700"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                  "flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors"
                )}
              >
                <item.icon
                  className={cn(
                    isActive ? "text-primary-500" : "text-gray-400",
                    "mr-3 h-5 w-5"
                  )}
                />
                {item.name}
              </Link>
            );
          })}
          <div className="pt-4 mt-4 border-t border-gray-200">
            <Link href="/settings"
              className="text-gray-600 hover:bg-gray-50 hover:text-gray-900 flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors"
            >
              <Settings className="mr-3 h-5 w-5 text-gray-400" />
              Settings
            </Link>
          </div>
        </nav>
        <div className="flex-shrink-0 p-4 border-t border-gray-200">
          <div className="flex items-center">
            <img
              className="w-8 h-8 rounded-full object-cover"
              src="https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150"
              alt="User profile"
            />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-700">Sarah Johnson</p>
              <p className="text-xs text-gray-500">Brand Manager</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
