import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { formatDate } from "@/lib/store";

interface SalesChartProps {
  data: {
    date: string;
    sales: number;
  }[];
}

export function SalesChart({ data }: SalesChartProps) {
  const chartData = data.map((d) => ({
    ...d,
    formattedDate: formatDate(d.date),
  }));

  const maxSales = Math.max(...data.map(d => d.sales));

  return (
    <div className="stat-card h-[320px]">
      <div className="mb-6">
        <h3 className="font-display font-semibold text-lg text-foreground">Daily Sales</h3>
        <p className="text-sm text-muted-foreground">Total items sold per day</p>
      </div>
      
      <ResponsiveContainer width="100%" height="80%">
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis 
            dataKey="formattedDate" 
            tick={{ fontSize: 11 }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis 
            tick={{ fontSize: 11 }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip 
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "12px",
              boxShadow: "var(--shadow-medium)",
            }}
            labelStyle={{ color: "hsl(var(--foreground))" }}
            formatter={(value: number) => [`${value} items`, 'Sales']}
          />
          <Bar dataKey="sales" radius={[6, 6, 0, 0]} name="Sales">
            {chartData.map((entry, index) => (
              <Cell 
                key={`cell-${index}`}
                fill={entry.sales === maxSales 
                  ? "hsl(var(--secondary))" 
                  : "hsl(var(--primary))"
                }
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
