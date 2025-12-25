import { useState, useEffect } from "react";
import { getDailyEntries, formatCurrency, formatDate, DailyEntry, saveDailyEntry } from "@/lib/store";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Star, Smile, Meh, Frown, Save } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const moods = [
  { value: "great", label: "Great", icon: Smile, color: "text-success" },
  { value: "good", label: "Good", icon: Smile, color: "text-primary" },
  { value: "okay", label: "Okay", icon: Meh, color: "text-warning" },
  { value: "tough", label: "Tough", icon: Frown, color: "text-destructive" },
] as const;

export default function ReviewPage() {
  const [entries, setEntries] = useState<DailyEntry[]>([]);
  const [selected, setSelected] = useState<DailyEntry | null>(null);

  useEffect(() => {
    const all = getDailyEntries().sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    setEntries(all);
    if (all.length > 0) setSelected(all[0]);
  }, []);

  const handleSave = () => {
    if (!selected) return;
    saveDailyEntry(selected);
    toast.success("Review saved!");
  };

  const updateReview = (field: string, value: any) => {
    if (!selected) return;
    setSelected({ ...selected, selfReview: { ...selected.selfReview, [field]: value } });
  };

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-display font-bold">End of Day Review</h1>
          <p className="text-muted-foreground">Reflect on your business day</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-4">
          <Card className="lg:col-span-1 h-fit">
            <CardHeader><CardTitle>Select Day</CardTitle></CardHeader>
            <CardContent className="space-y-2 max-h-96 overflow-y-auto">
              {entries.map((entry) => (
                <button key={entry.id} onClick={() => setSelected(entry)}
                  className={cn("w-full text-left p-3 rounded-lg transition-colors", selected?.id === entry.id ? "bg-primary text-primary-foreground" : "bg-muted/50 hover:bg-muted")}>
                  <p className="font-medium">{formatDate(entry.date)}</p>
                  <p className="text-xs opacity-70">{formatCurrency(entry.grossProfit)} profit</p>
                </button>
              ))}
              {entries.length === 0 && <p className="text-center py-4 text-muted-foreground">No entries yet</p>}
            </CardContent>
          </Card>

          {selected && (
            <Card className="lg:col-span-2">
              <CardHeader className="flex-row items-center justify-between">
                <CardTitle>Review - {formatDate(selected.date)}</CardTitle>
                <Button onClick={handleSave} className="gap-2"><Save size={16} />Save</Button>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <p className="text-sm font-medium mb-3">How was your day?</p>
                  <div className="flex gap-2">
                    {moods.map(({ value, label, icon: Icon, color }) => (
                      <button key={value} onClick={() => updateReview("mood", value)}
                        className={cn("flex-1 p-3 rounded-xl border transition-all", selected.selfReview.mood === value ? "border-primary bg-primary/10" : "border-border hover:border-primary/50")}>
                        <Icon size={24} className={cn("mx-auto mb-1", color)} />
                        <p className="text-xs">{label}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium mb-2">Rating</p>
                  <div className="flex gap-1">
                    {[1,2,3,4,5].map((n) => (
                      <button key={n} onClick={() => updateReview("rating", n)}>
                        <Star size={28} className={cn(n <= selected.selfReview.rating ? "text-secondary fill-secondary" : "text-muted")} />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium mb-2">Notes</p>
                  <Textarea value={selected.selfReview.notes} onChange={(e) => updateReview("notes", e.target.value)} placeholder="What went well today?" rows={3} />
                </div>

                <div>
                  <p className="text-sm font-medium mb-2">Challenges</p>
                  <Textarea value={selected.selfReview.challenges} onChange={(e) => updateReview("challenges", e.target.value)} placeholder="Any difficulties faced?" rows={2} />
                </div>

                <div>
                  <p className="text-sm font-medium mb-2">Improvements for Tomorrow</p>
                  <Textarea value={selected.selfReview.improvements} onChange={(e) => updateReview("improvements", e.target.value)} placeholder="What will you do better?" rows={2} />
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
