import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  description: string;
  icon: LucideIcon;
  trend?: string;
  trendColor?: string;
}

export function StatsCard({ title, value, description, icon: Icon, trend, trendColor }: StatsCardProps) {
  return (
    <Card className="bg-card/40 border-border/40 shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <Icon className="w-4 h-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className={`text-xs ${trendColor || 'text-muted-foreground'}`}>
          {description}
          {trend && <span className="ml-1 font-medium">{trend}</span>}
        </p>
      </CardContent>
    </Card>
  );
}
