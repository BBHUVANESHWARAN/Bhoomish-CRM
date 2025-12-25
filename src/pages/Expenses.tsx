import { useState, useEffect } from "react";
import { Plus, Trash2, Receipt } from "lucide-react";
import { getFixedExpenses, saveFixedExpense, deleteFixedExpense, generateId, formatCurrency, FixedExpense } from "@/lib/store";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<FixedExpense[]>([]);
  const [newExpense, setNewExpense] = useState({ name: "", amount: 0, category: "equipment" as const, notes: "" });

  useEffect(() => {
    setExpenses(getFixedExpenses());
  }, []);

  const handleAdd = () => {
    if (!newExpense.name || newExpense.amount <= 0) {
      toast.error("Please fill all details");
      return;
    }
    const expense: FixedExpense = {
      id: generateId(),
      ...newExpense,
      date: new Date().toISOString().split("T")[0],
    };
    saveFixedExpense(expense);
    setExpenses(getFixedExpenses());
    setNewExpense({ name: "", amount: 0, category: "equipment", notes: "" });
    toast.success("Expense added!");
  };

  const handleDelete = (id: string) => {
    deleteFixedExpense(id);
    setExpenses(getFixedExpenses());
    toast.success("Expense deleted");
  };

  const total = expenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-display font-bold">Fixed Expenses</h1>
          <p className="text-muted-foreground">One-time equipment & setup costs</p>
        </div>

        <Card>
          <CardHeader><CardTitle>Add New Expense</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2 sm:col-span-1">
                <Label>Item Name</Label>
                <Input value={newExpense.name} onChange={(e) => setNewExpense(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Juicer Machine" />
              </div>
              <div>
                <Label>Amount (₹)</Label>
                <Input type="number" value={newExpense.amount || ""} onChange={(e) => setNewExpense(p => ({ ...p, amount: parseFloat(e.target.value) || 0 }))} />
              </div>
            </div>
            <Button onClick={handleAdd} className="gap-2"><Plus size={16} />Add Expense</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2"><Receipt size={20} />All Fixed Expenses</CardTitle>
            <span className="text-lg font-bold text-primary">{formatCurrency(total)}</span>
          </CardHeader>
          <CardContent>
            {expenses.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground">No fixed expenses yet</p>
            ) : (
              <div className="space-y-2">
                {expenses.map((expense) => (
                  <div key={expense.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div>
                      <p className="font-medium">{expense.name}</p>
                      <p className="text-xs text-muted-foreground">{expense.date}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-semibold">{formatCurrency(expense.amount)}</span>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(expense.id)}>
                        <Trash2 size={16} className="text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
