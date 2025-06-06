import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface KPICardProps {
  title: string;
  value: string | number;
  change: string;
  icon: LucideIcon;
  iconColor: string;
  iconBgColor: string;
}

export default function KPICard({
  title,
  value,
  change,
  icon: Icon,
  iconColor,
  iconBgColor,
}: KPICardProps) {
  const isPositive = change.startsWith("+");

  return (
    <Card className="border border-gray-200 shadow-sm">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-3xl font-bold text-gray-900">{value}</p>
          </div>
          <div className={`p-3 ${iconBgColor} rounded-lg`}>
            <Icon className={`h-5 w-5 ${iconColor}`} />
          </div>
        </div>
        <div className="mt-4 flex items-center text-sm">
          <span className={isPositive ? "text-green-500" : "text-red-500"} + " font-medium"}>
            {change}
          </span>
          <span className="text-gray-600 ml-2">from last month</span>
        </div>
      </CardContent>
    </Card>
  );
}
