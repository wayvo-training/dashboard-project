import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type ChartData = {
  date: string;
  [key: string]: string | number;
};

type DashboardAreaChartProps = {
  data: ChartData[];
  dataKey: string;
  title: string;
  description?: string;
  formatter?: "currency" | "number" | "percentage";
};

function DashboardAreaChart({
  data,
  dataKey,
  title,
  description,
  formatter = "number",
}: DashboardAreaChartProps) {

  const formatValue = (value: number) => {
    if (formatter === "currency") {
      return `₹${value.toLocaleString("en-IN")}`;
    }

    if (formatter === "percentage") {
      return `${value}%`;
    }

    return value.toLocaleString("en-IN");
  };

  return (
    <div className="w-full rounded-xl border bg-background shadow-sm">

      {/* Chart header */}

      <div className="border-b px-6 py-5">

        <h3 className="text-lg font-semibold">
          {title}
        </h3>

        {description && (
          <p className="mt-1 text-sm text-muted-foreground">
            {description}
          </p>
        )}

      </div>

      {/* Chart */}

      <div className="p-6">

        <div className="h-[400px] w-full">

          <ResponsiveContainer
            width="100%"
            height="100%"
          >

            <AreaChart
              data={data}
              margin={{
                top: 10,
                right: 10,
                left: 10,
                bottom: 10,
              }}
            >

              <defs>

                <linearGradient
                  id={`area-gradient-${dataKey}`}
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >

                  <stop
                    offset="0%"
                    stopColor="currentColor"
                    stopOpacity={0.25}
                  />

                  <stop
                    offset="100%"
                    stopColor="currentColor"
                    stopOpacity={0.02}
                  />

                </linearGradient>

              </defs>

              <CartesianGrid
                vertical={false}
                strokeDasharray="3 3"
                className="stroke-muted"
              />

              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
              />

              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(value) =>
                  formatter === "currency"
                    ? `₹${(Number(value) / 1000).toFixed(0)}k`
                    : String(value)
                }
              />

              <Tooltip
                formatter={(value) =>
                  formatValue(Number(value))
                }
              />

              <Area
                type="monotone"
                dataKey={dataKey}
                stroke="currentColor"
                strokeWidth={2}
                fill={`url(#area-gradient-${dataKey})`}
                fillOpacity={1}
                dot={false}
                activeDot={{
                  r: 4,
                }}
              />

            </AreaChart>

          </ResponsiveContainer>

        </div>

      </div>

    </div>
  );
}

export default DashboardAreaChart;