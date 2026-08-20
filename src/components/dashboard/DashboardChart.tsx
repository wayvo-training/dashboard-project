import {
  useEffect,
  useState,
} from "react";

import DateRangeFilter, {
  type DateRange,
} from "../common/DateRangeFilter";

import DashboardAreaChart from "../common/DashboardAreaChart";

type ChartData = {
  created_at: string;
  total_revenue: string;
  orders: string;
  new_customers: string;
  active_accounts: string;
  cancelled_orders: string;
  growth_rate: string;
};

function DashboardChart() {
  const [data, setData] = useState<ChartData[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const [dateRange, setDateRange] =
    useState<DateRange>("7days");

  const [customStartDate, setCustomStartDate] =
    useState("");

  const [customEndDate, setCustomEndDate] =
    useState("");

  // ==========================================
  // FETCH DATA FROM BACKEND
  // ==========================================

  useEffect(() => {
    const fetchChartData = async () => {
      try {
        setLoading(true);
        setError(null);

        let url =
          "http://localhost:5000/api/dashboard/history";

        // ==========================================
        // PREDEFINED RANGES
        // ==========================================

        if (dateRange === "7days") {
          url += "?range=7days";
        }

        else if (dateRange === "1month") {
          url += "?range=1month";
        }

        else if (dateRange === "3months") {
          url += "?range=3months";
        }

        // ==========================================
        // CUSTOM RANGE
        // ==========================================

        else if (dateRange === "custom") {
          // Wait until both dates are selected
          if (
            !customStartDate ||
            !customEndDate
          ) {
            setData([]);
            setLoading(false);
            return;
          }

          url +=
            `?startDate=${customStartDate}` +
            `&endDate=${customEndDate}`;
        }

        // ==========================================
        // API REQUEST
        // ==========================================

        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(
            `Failed to fetch chart data: ${response.status}`
          );
        }

        const result: ChartData[] =
          await response.json();

        console.log(
          "Chart API response:",
          result
        );

        setData(result);

      } catch (error) {
        console.error(
          "Chart fetch error:",
          error
        );

        setError(
          error instanceof Error
            ? error.message
            : "Failed to fetch chart data"
        );

        setData([]);

      } finally {
        setLoading(false);
      }
    };

    fetchChartData();

  }, [
    dateRange,
    customStartDate,
    customEndDate,
  ]);

  // ==========================================
  // AVAILABLE DATA RANGE
  // ==========================================

  const availableStartDate =
    data.length > 0
      ? data[0].created_at.slice(0, 10)
      : "";

  const availableEndDate =
    data.length > 0
      ? data[data.length - 1].created_at.slice(0, 10)
      : "";

  // ==========================================
  // FORMAT REVENUE DATA
  // ==========================================

  const revenueData = data.map(
    (item) => ({
      date: new Date(
        item.created_at
      ).toLocaleDateString(
        "en-US",
        {
          month: "short",
          day: "numeric",
        }
      ),

      revenue: Number(
        item.total_revenue
      ),
    })
  );

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <p>
        Loading chart...
      </p>
    );
  }

  // ==========================================
  // ERROR
  // ==========================================

  if (error) {
    return (
      <div className="rounded-lg border p-6">

        <p className="font-semibold text-red-500">
          Failed to load chart
        </p>

        <p className="text-sm text-muted-foreground">
          {error}
        </p>

      </div>
    );
  }

  // ==========================================
  // UI
  // ==========================================

  return (
    <div className="w-full">

      <div className="mb-6">

        <h2 className="text-2xl font-semibold">
          Revenue Overview
        </h2>

        <p className="text-sm text-muted-foreground">
          Analyze daily revenue over different
          time periods.
        </p>

      </div>

      <DateRangeFilter
        value={dateRange}
        onChange={setDateRange}
        startDate={customStartDate}
        endDate={customEndDate}
        onStartDateChange={
          setCustomStartDate
        }
        onEndDateChange={
          setCustomEndDate
        }
        minDate={availableStartDate}
        maxDate={availableEndDate}
      />

      {data.length > 0 && (
        <p className="mb-4 text-sm text-muted-foreground">
          Available data:{" "}
          <span className="font-medium text-foreground">
            {availableStartDate}
          </span>{" "}
          →{" "}
          <span className="font-medium text-foreground">
            {availableEndDate}
          </span>
        </p>
      )}

      {revenueData.length > 0 ? (

        <DashboardAreaChart
          data={revenueData}
          dataKey="revenue"
          title="Revenue Overview"
          description="Daily revenue performance"
          formatter="currency"
        />

      ) : (

        <div className="flex h-[400px] items-center justify-center rounded-xl border">

          <p className="text-muted-foreground">
            Select a valid date range.
          </p>

        </div>

      )}

    </div>
  );
}

export default DashboardChart;