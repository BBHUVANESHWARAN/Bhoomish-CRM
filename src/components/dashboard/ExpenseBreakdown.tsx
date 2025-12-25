import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { formatCurrency } from "@/lib/store";

interface ExpenseBreakdownProps {
  data: {
    name: string;
    value: number;
  }[];
}

const COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--secondary))",
  "hsl(var(--success))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

export function ExpenseBreakdown({ data }: ExpenseBreakdownProps) {
  const total = data.reduce((sum, d) => sum + d.value, 0);

  return (
    <div className="stat-card h-[320px]">
      <div className="mb-4">
        <h3 className="font-display font-semibold text-lg text-foreground">Expense Breakdown</h3>
        <p className="text-sm text-muted-foreground">Where your money goes</p>
      </div>
      
      <ResponsiveContainer width="100%" height="75%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={50}
            outerRadius={80}
            paddingAngle={4}
            dataKey="value"
          >
            {data.map((_, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={COLORS[index % COLORS.length]}
                strokeWidth={0}
              />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value: number) => formatCurrency(value)}
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "12px",
              boxShadow: "var(--shadow-medium)",
            }}
          />
        </PieChart>
      </ResponsiveContainer>
      
      <div className="flex flex-wrap justify-center gap-3 mt-2">
        {data.map((item, index) => (
          <div key={item.name} className="flex items-center gap-2 text-xs">
            <div 
              className="w-2.5 h-2.5 rounded-full" 
              style={{ backgroundColor: COLORS[index % COLORS.length] }}
            />
            <span className="text-muted-foreground">{item.name}</span>
            <span className="font-medium text-foreground">
              {((item.value / total) * 100).toFixed(0)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
