import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  TrendingUp,
  TrendingDown,
} from "lucide-react";

export type MetricCardProps = {
  title: string;
  value: string | number;
  percentage: string;
  description: string;
  sub_desc: string;
  performance_indicator: "up" | "down";
};

export default function MetricCard({
  title,
  value,
  percentage,
  description,
  sub_desc,
  performance_indicator,
}: MetricCardProps) {

  const Icon =
    performance_indicator === "up"
      ? TrendingUp
      : TrendingDown;

  return (
    <Card className="h-[120px] w-full">

      <CardHeader className="flex flex-row items-start justify-between space-y-0 px-4 pb-1 pt-3">

        <CardTitle className="text-xs font-medium text-muted-foreground">
          {title}
        </CardTitle>

        <div className="flex items-center gap-1 rounded-md border px-2 py-0.5 text-[10px] font-medium">
          <Icon className="h-3 w-3" />
          {percentage}
        </div>

      </CardHeader>

      <CardContent className="px-4 pb-3">

        <p className="text-xl font-semibold">
          {value}
        </p>

        <div className="mt-2 flex items-center gap-1 text-[10px] font-medium">
          <Icon className="h-3 w-3" />
          {description}
        </div>

        <p className="text-[10px] text-muted-foreground">
          {sub_desc}
        </p>

      </CardContent>

    </Card>
  );
}