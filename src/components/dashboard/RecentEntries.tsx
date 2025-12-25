import { DailyEntry, formatCurrency, formatDate } from "@/lib/store";
import { Smile, Meh, Frown, Star, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

interface RecentEntriesProps {
  entries: DailyEntry[];
}

const moodIcons = {
  great: Smile,
  good: Smile,
  okay: Meh,
  tough: Frown,
};

const moodColors = {
  great: "text-success",
  good: "text-primary",
  okay: "text-warning",
  tough: "text-destructive",
};

export function RecentEntries({ entries }: RecentEntriesProps) {
  const recentEntries = entries.slice(0, 5);

  return (
    <div className="stat-card">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-display font-semibold text-lg text-foreground">Recent Days</h3>
          <p className="text-sm text-muted-foreground">Your latest business entries</p>
        </div>
        <Link 
          to="/review" 
          className="text-sm text-primary hover:underline flex items-center gap-1"
        >
          View all <ChevronRight size={14} />
        </Link>
      </div>
      
      <div className="space-y-3">
        {recentEntries.length === 0 ? (
          <p className="text-center py-8 text-muted-foreground">
            No entries yet. Start by adding today's data!
          </p>
        ) : (
          recentEntries.map((entry) => {
            const MoodIcon = moodIcons[entry.selfReview.mood];
            const totalSales = 
              entry.sales.bigCombo.quantity + 
              entry.sales.mediumCombo.quantity + 
              entry.sales.smallBox.quantity + 
              entry.sales.juiceOnly.quantity;

            return (
              <Link
                key={entry.id}
                to={`/daily-entry?date=${entry.date}`}
                className="flex items-center justify-between p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg bg-card ${moodColors[entry.selfReview.mood]}`}>
                    <MoodIcon size={18} />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{formatDate(entry.date)}</p>
                    <p className="text-xs text-muted-foreground">{totalSales} items sold</p>
                  </div>
                </div>
                
                <div className="text-right">
                  <p className={`font-semibold ${entry.grossProfit >= 0 ? 'text-success' : 'text-destructive'}`}>
                    {formatCurrency(entry.grossProfit)}
                  </p>
                  <div className="flex items-center gap-0.5 justify-end">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={10}
                        className={i < entry.selfReview.rating ? "text-secondary fill-secondary" : "text-muted"}
                      />
                    ))}
                  </div>
                </div>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}
