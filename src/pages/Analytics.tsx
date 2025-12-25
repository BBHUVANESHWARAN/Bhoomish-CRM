import { useEffect, useState } from "react";
import { getDailyEntries, getWeeklyData, calculateMetrics, formatCurrency } from "@/lib/store";
import { AppLayout } from "@/components/layout/AppLayout";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { SalesChart } from "@/components/dashboard/SalesChart";
import { StatCard } from "@/components/dashboard/StatCard";
import { TrendingUp, Target, Calendar, Percent } from "lucide-react";

export default function AnalyticsPage() {
  const [chartData, setChartData] = useState<any[]>([]);
  const [metrics, setMetrics] = useState(calculateMetrics());

  useEffect(() => {
    setChartData(getWeeklyData(8));
    setMetrics(calculateMetrics());
  }, []);

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-display font-bold">Analytics & Growth</h1>
          <p className="text-muted-foreground">Business performance insights</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Avg Daily Revenue" value={formatCurrency(metrics.avgDailyRevenue)} icon={<TrendingUp size={20} />} />
          <StatCard title="Avg Daily Profit" value={formatCurrency(metrics.avgDailyProfit)} icon={<Target size={20} />} variant="success" />
          <StatCard title="Days Tracked" value={getDailyEntries().length} icon={<Calendar size={20} />} />
          <StatCard title="Avg Margin" value={`${metrics.avgProfitMargin.toFixed(1)}%`} icon={<Percent size={20} />} variant="warning" />
        </div>

        {chartData.length > 0 ? (
          <>
            <RevenueChart data={chartData} />
            <SalesChart data={chartData} />
          </>
        ) : (
          <div className="stat-card text-center py-16">
            <p className="text-muted-foreground">Add daily entries to see analytics</p>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
