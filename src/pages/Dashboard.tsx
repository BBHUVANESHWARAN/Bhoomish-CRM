import { useEffect, useState } from "react";
import { 
  IndianRupee, 
  TrendingUp, 
  ShoppingCart, 
  Percent,
  Calendar,
  Sparkles,
  RefreshCw
} from "lucide-react";
import { 
  getDailyEntries, 
  calculateMetrics, 
  getWeeklyData, 
  formatCurrency,
  generateSampleData,
  DailyEntry,
  BusinessMetrics
} from "@/lib/store";
import { AppLayout } from "@/components/layout/AppLayout";
import { StatCard } from "@/components/dashboard/StatCard";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { SalesChart } from "@/components/dashboard/SalesChart";
import { ExpenseBreakdown } from "@/components/dashboard/ExpenseBreakdown";
import { RecentEntries } from "@/components/dashboard/RecentEntries";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Link } from "react-router-dom";

export default function Dashboard() {
  const [entries, setEntries] = useState<DailyEntry[]>([]);
  const [metrics, setMetrics] = useState<BusinessMetrics | null>(null);
  const [chartData, setChartData] = useState<any[]>([]);

  const loadData = () => {
    const allEntries = getDailyEntries();
    setEntries(allEntries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    setMetrics(calculateMetrics());
    setChartData(getWeeklyData(4));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleGenerateSampleData = () => {
    generateSampleData();
    loadData();
    toast.success("Sample data generated! You can now explore the dashboard.");
  };

  // Calculate expense breakdown
  const getExpenseBreakdown = () => {
    const rawFruitTotal = entries.reduce((sum, e) => 
      sum + e.rawFruits.reduce((s, f) => s + f.totalCost, 0), 0);
    const dailyExpenseTotal = entries.reduce((sum, e) => 
      sum + e.dailyExpenses.reduce((s, d) => s + d.amount, 0), 0);
    
    return [
      { name: "Raw Fruits", value: rawFruitTotal },
      { name: "Consumables", value: dailyExpenseTotal },
    ].filter(d => d.value > 0);
  };

  const today = new Date().toLocaleDateString('en-IN', { 
    weekday: 'long', 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric' 
  });

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-display font-bold text-foreground">
              Good Morning! ☀️
            </h1>
            <p className="text-muted-foreground mt-1">{today}</p>
          </div>
          
          <div className="flex items-center gap-3">
            {entries.length === 0 && (
              <Button 
                onClick={handleGenerateSampleData}
                variant="outline"
                className="gap-2"
              >
                <Sparkles size={16} />
                Load Demo Data
              </Button>
            )}
            <Link to="/daily-entry">
              <Button className="gap-2 gradient-primary text-primary-foreground hover:opacity-90">
                <Calendar size={16} />
                Today's Entry
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        {metrics && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Total Revenue"
              value={formatCurrency(metrics.totalRevenue)}
              icon={<IndianRupee size={22} />}
              trend={{ value: 12, label: "vs last month" }}
              variant="primary"
            />
            <StatCard
              title="Total Profit"
              value={formatCurrency(metrics.totalProfit)}
              icon={<TrendingUp size={22} />}
              trend={{ value: 8, label: "vs last month" }}
              variant="success"
            />
            <StatCard
              title="Items Sold"
              value={metrics.totalSalesCount.toLocaleString()}
              icon={<ShoppingCart size={22} />}
              subtitle="Total combos & boxes"
            />
            <StatCard
              title="Avg Margin"
              value={`${metrics.avgProfitMargin.toFixed(1)}%`}
              icon={<Percent size={22} />}
              subtitle="Profit per sale"
              variant="warning"
            />
          </div>
        )}

        {/* Charts Row */}
        {chartData.length > 0 ? (
          <div className="grid lg:grid-cols-2 gap-4">
            <RevenueChart data={chartData} />
            <SalesChart data={chartData} />
          </div>
        ) : (
          <div className="stat-card flex flex-col items-center justify-center py-16 text-center">
            <div className="p-4 rounded-full bg-muted mb-4">
              <TrendingUp size={32} className="text-muted-foreground" />
            </div>
            <h3 className="font-display font-semibold text-lg mb-2">No Data Yet</h3>
            <p className="text-muted-foreground mb-4 max-w-md">
              Start tracking your business by adding your first daily entry, or load demo data to explore.
            </p>
            <div className="flex gap-3">
              <Button onClick={handleGenerateSampleData} variant="outline" className="gap-2">
                <Sparkles size={16} />
                Load Demo Data
              </Button>
              <Link to="/daily-entry">
                <Button className="gap-2">
                  <Calendar size={16} />
                  Add First Entry
                </Button>
              </Link>
            </div>
          </div>
        )}

        {/* Bottom Row */}
        {entries.length > 0 && (
          <div className="grid lg:grid-cols-2 gap-4">
            <ExpenseBreakdown data={getExpenseBreakdown()} />
            <RecentEntries entries={entries} />
          </div>
        )}

        {/* Quick Stats */}
        {metrics && metrics.bestDay && (
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="stat-card bg-success/5 border-success/20">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-success/20 text-success">
                  <TrendingUp size={20} />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Best Day</p>
                  <p className="font-display font-semibold text-lg text-foreground">
                    {formatCurrency(metrics.bestDay.profit)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(metrics.bestDay.date).toLocaleDateString('en-IN', { 
                      weekday: 'short', day: 'numeric', month: 'short' 
                    })}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                  <IndianRupee size={20} />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Avg Daily Profit</p>
                  <p className="font-display font-semibold text-lg text-foreground">
                    {formatCurrency(metrics.avgDailyProfit)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {entries.length} days tracked
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
