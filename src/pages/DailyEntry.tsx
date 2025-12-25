import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { 
  Plus, 
  Minus, 
  Save, 
  Apple, 
  GlassWater,
  Scale,
  IndianRupee,
  CreditCard,
  Wallet,
  Trash2,
  ChevronRight,
  ChevronLeft
} from "lucide-react";
import { 
  getDailyEntry, 
  saveDailyEntry, 
  createEmptyDailyEntry, 
  calculateEntryTotals,
  formatCurrency,
  getTodayDate,
  DailyEntry
} from "@/lib/store";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const FRUITS = ["Apple", "Banana", "Orange", "Guava", "Grapes", "Sapodilla", "Pomegranate", "Watermelon", "Papaya"];
const JUICE_TYPES = ["Watermelon", "Lemon/Lime", "Orange", "Mixed Fruit", "Seasonal"];

type Step = "purchase" | "production" | "sales" | "collection";

const steps: { id: Step; title: string; icon: any }[] = [
  { id: "purchase", title: "Morning Purchase", icon: Apple },
  { id: "production", title: "Production", icon: GlassWater },
  { id: "sales", title: "Sales", icon: IndianRupee },
  { id: "collection", title: "Collection", icon: Wallet },
];

export default function DailyEntryPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const dateParam = searchParams.get("date") || getTodayDate();
  
  const [currentDate, setCurrentDate] = useState(dateParam);
  const [entry, setEntry] = useState<DailyEntry>(createEmptyDailyEntry(currentDate));
  const [currentStep, setCurrentStep] = useState<Step>("purchase");
  const [newFruit, setNewFruit] = useState({ fruit: "", quantity: 0, pricePerKg: 0 });
  const [newJuice, setNewJuice] = useState({ type: "", liters: 0 });
  const [newExpense, setNewExpense] = useState({ item: "", amount: 0 });

  useEffect(() => {
    const existingEntry = getDailyEntry(currentDate);
    if (existingEntry) {
      setEntry(existingEntry);
    } else {
      setEntry(createEmptyDailyEntry(currentDate));
    }
  }, [currentDate]);

  const handleDateChange = (days: number) => {
    const date = new Date(currentDate);
    date.setDate(date.getDate() + days);
    const newDate = date.toISOString().split("T")[0];
    setCurrentDate(newDate);
    setSearchParams({ date: newDate });
  };

  const addFruit = () => {
    if (!newFruit.fruit || newFruit.quantity <= 0 || newFruit.pricePerKg <= 0) {
      toast.error("Please fill all fruit details");
      return;
    }
    
    const fruitEntry = {
      ...newFruit,
      totalCost: newFruit.quantity * newFruit.pricePerKg,
    };
    
    setEntry(prev => ({
      ...prev,
      rawFruits: [...prev.rawFruits, fruitEntry],
    }));
    
    setNewFruit({ fruit: "", quantity: 0, pricePerKg: 0 });
  };

  const removeFruit = (index: number) => {
    setEntry(prev => ({
      ...prev,
      rawFruits: prev.rawFruits.filter((_, i) => i !== index),
    }));
  };

  const addJuice = () => {
    if (!newJuice.type || newJuice.liters <= 0) {
      toast.error("Please fill juice details");
      return;
    }
    
    setEntry(prev => ({
      ...prev,
      juiceProduction: [...prev.juiceProduction, newJuice],
    }));
    
    setNewJuice({ type: "", liters: 0 });
  };

  const removeJuice = (index: number) => {
    setEntry(prev => ({
      ...prev,
      juiceProduction: prev.juiceProduction.filter((_, i) => i !== index),
    }));
  };

  const addExpense = () => {
    if (!newExpense.item || newExpense.amount <= 0) {
      toast.error("Please fill expense details");
      return;
    }
    
    setEntry(prev => ({
      ...prev,
      dailyExpenses: [...prev.dailyExpenses, newExpense],
    }));
    
    setNewExpense({ item: "", amount: 0 });
  };

  const removeExpense = (index: number) => {
    setEntry(prev => ({
      ...prev,
      dailyExpenses: prev.dailyExpenses.filter((_, i) => i !== index),
    }));
  };

  const updateSales = (type: keyof typeof entry.sales, field: "quantity" | "price", value: number) => {
    setEntry(prev => ({
      ...prev,
      sales: {
        ...prev.sales,
        [type]: {
          ...prev.sales[type],
          [field]: value,
        },
      },
    }));
  };

  const updateCollection = (field: "cashCollection" | "gpayCollection", value: number) => {
    setEntry(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const updateProduction = (type: keyof typeof entry.fruitBoxes, value: number) => {
    setEntry(prev => ({
      ...prev,
      fruitBoxes: {
        ...prev.fruitBoxes,
        [type]: value,
      },
    }));
  };

  const handleSave = () => {
    const calculatedEntry = calculateEntryTotals(entry);
    saveDailyEntry(calculatedEntry);
    setEntry(calculatedEntry);
    toast.success("Entry saved successfully!");
  };

  const calculated = calculateEntryTotals(entry);

  const renderStepContent = () => {
    switch (currentStep) {
      case "purchase":
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Apple className="text-primary" size={20} />
                  Raw Fruits Purchase
                </CardTitle>
                <CardDescription>Add today's fruit purchases</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="col-span-2 sm:col-span-1">
                    <Label>Fruit</Label>
                    <select
                      value={newFruit.fruit}
                      onChange={(e) => setNewFruit(prev => ({ ...prev, fruit: e.target.value }))}
                      className="w-full h-10 px-3 rounded-lg border border-input bg-background text-sm"
                    >
                      <option value="">Select fruit</option>
                      {FRUITS.map(f => (
                        <option key={f} value={f}>{f}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label>Qty (kg)</Label>
                    <Input
                      type="number"
                      step="0.5"
                      value={newFruit.quantity || ""}
                      onChange={(e) => setNewFruit(prev => ({ ...prev, quantity: parseFloat(e.target.value) || 0 }))}
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <Label>₹/kg</Label>
                    <Input
                      type="number"
                      value={newFruit.pricePerKg || ""}
                      onChange={(e) => setNewFruit(prev => ({ ...prev, pricePerKg: parseFloat(e.target.value) || 0 }))}
                      placeholder="0"
                    />
                  </div>
                  <div className="flex items-end">
                    <Button onClick={addFruit} className="w-full gap-2">
                      <Plus size={16} /> Add
                    </Button>
                  </div>
                </div>

                {entry.rawFruits.length > 0 && (
                  <div className="space-y-2 pt-4 border-t">
                    {entry.rawFruits.map((fruit, index) => (
                      <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                        <div className="flex items-center gap-3">
                          <span className="font-medium">{fruit.fruit}</span>
                          <span className="text-sm text-muted-foreground">
                            {fruit.quantity}kg × ₹{fruit.pricePerKg}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-semibold">{formatCurrency(fruit.totalCost)}</span>
                          <Button variant="ghost" size="icon" onClick={() => removeFruit(index)}>
                            <Trash2 size={16} className="text-destructive" />
                          </Button>
                        </div>
                      </div>
                    ))}
                    <div className="flex justify-end pt-2">
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Total Purchase</p>
                        <p className="text-xl font-display font-bold text-primary">
                          {formatCurrency(entry.rawFruits.reduce((sum, f) => sum + f.totalCost, 0))}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <IndianRupee className="text-secondary" size={20} />
                  Daily Consumable Expenses
                </CardTitle>
                <CardDescription>Cups, boxes, ice, etc.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2">
                    <Label>Item</Label>
                    <Input
                      value={newExpense.item}
                      onChange={(e) => setNewExpense(prev => ({ ...prev, item: e.target.value }))}
                      placeholder="e.g. Cups, Boxes, Ice"
                    />
                  </div>
                  <div className="flex items-end gap-2">
                    <div className="flex-1">
                      <Label>₹</Label>
                      <Input
                        type="number"
                        value={newExpense.amount || ""}
                        onChange={(e) => setNewExpense(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
                        placeholder="0"
                      />
                    </div>
                    <Button onClick={addExpense} size="icon">
                      <Plus size={16} />
                    </Button>
                  </div>
                </div>

                {entry.dailyExpenses.length > 0 && (
                  <div className="space-y-2 pt-4 border-t">
                    {entry.dailyExpenses.map((expense, index) => (
                      <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                        <span className="font-medium">{expense.item}</span>
                        <div className="flex items-center gap-3">
                          <span className="font-semibold">{formatCurrency(expense.amount)}</span>
                          <Button variant="ghost" size="icon" onClick={() => removeExpense(index)}>
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
        );

      case "production":
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Scale className="text-primary" size={20} />
                  Fruit Box Production
                </CardTitle>
                <CardDescription>How many boxes did you prepare today?</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { key: "bigCombo", label: "Big Combo (₹59)", color: "bg-secondary/20 border-secondary/30" },
                    { key: "mediumCombo", label: "Medium Combo (₹39)", color: "bg-primary/20 border-primary/30" },
                    { key: "smallBox", label: "Small Box (₹29)", color: "bg-success/20 border-success/30" },
                    { key: "juiceOnly", label: "Juice Only (₹20)", color: "bg-chart-5/20 border-chart-5/30" },
                  ].map(({ key, label, color }) => (
                    <div key={key} className={cn("p-4 rounded-xl border", color)}>
                      <Label className="text-sm">{label}</Label>
                      <div className="flex items-center gap-2 mt-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => updateProduction(key as keyof typeof entry.fruitBoxes, Math.max(0, entry.fruitBoxes[key as keyof typeof entry.fruitBoxes] - 1))}
                        >
                          <Minus size={16} />
                        </Button>
                        <Input
                          type="number"
                          value={entry.fruitBoxes[key as keyof typeof entry.fruitBoxes]}
                          onChange={(e) => updateProduction(key as keyof typeof entry.fruitBoxes, parseInt(e.target.value) || 0)}
                          className="text-center text-lg font-semibold"
                        />
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => updateProduction(key as keyof typeof entry.fruitBoxes, entry.fruitBoxes[key as keyof typeof entry.fruitBoxes] + 1)}
                        >
                          <Plus size={16} />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GlassWater className="text-secondary" size={20} />
                  Juice Production
                </CardTitle>
                <CardDescription>Track your juice preparation</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2">
                    <Label>Type</Label>
                    <select
                      value={newJuice.type}
                      onChange={(e) => setNewJuice(prev => ({ ...prev, type: e.target.value }))}
                      className="w-full h-10 px-3 rounded-lg border border-input bg-background text-sm"
                    >
                      <option value="">Select type</option>
                      {JUICE_TYPES.map(j => (
                        <option key={j} value={j}>{j}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-end gap-2">
                    <div className="flex-1">
                      <Label>Liters</Label>
                      <Input
                        type="number"
                        step="0.5"
                        value={newJuice.liters || ""}
                        onChange={(e) => setNewJuice(prev => ({ ...prev, liters: parseFloat(e.target.value) || 0 }))}
                      />
                    </div>
                    <Button onClick={addJuice} size="icon">
                      <Plus size={16} />
                    </Button>
                  </div>
                </div>

                {entry.juiceProduction.length > 0 && (
                  <div className="space-y-2 pt-4 border-t">
                    {entry.juiceProduction.map((juice, index) => (
                      <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                        <span className="font-medium">{juice.type}</span>
                        <div className="flex items-center gap-3">
                          <span className="font-semibold">{juice.liters}L</span>
                          <Button variant="ghost" size="icon" onClick={() => removeJuice(index)}>
                            <Trash2 size={16} className="text-destructive" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Scale className="text-primary" size={20} />
                  Weight Tracking
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Wastage (kg)</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={entry.wastageWeight || ""}
                      onChange={(e) => setEntry(prev => ({ ...prev, wastageWeight: parseFloat(e.target.value) || 0 }))}
                      placeholder="0"
                    />
                  </div>
                  <div className="p-4 rounded-xl bg-muted/50">
                    <p className="text-sm text-muted-foreground">Total Raw Weight</p>
                    <p className="text-xl font-display font-bold">{calculated.totalRawWeight.toFixed(1)} kg</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Used: {calculated.usedWeight.toFixed(1)} kg
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case "sales":
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <IndianRupee className="text-success" size={20} />
                Sales Tracking
              </CardTitle>
              <CardDescription>Record today's sales</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { key: "bigCombo", label: "Big Combo", defaultPrice: 59, color: "border-secondary/30" },
                  { key: "mediumCombo", label: "Medium Combo", defaultPrice: 39, color: "border-primary/30" },
                  { key: "smallBox", label: "Small Box", defaultPrice: 29, color: "border-success/30" },
                  { key: "juiceOnly", label: "Juice Only", defaultPrice: 20, color: "border-chart-5/30" },
                ].map(({ key, label, defaultPrice, color }) => {
                  const sale = entry.sales[key as keyof typeof entry.sales];
                  const revenue = sale.quantity * sale.price;
                  
                  return (
                    <div key={key} className={cn("p-4 rounded-xl border bg-card", color)}>
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-medium">{label}</span>
                        <span className="text-lg font-display font-bold text-success">
                          {formatCurrency(revenue)}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label className="text-xs">Quantity Sold</Label>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => updateSales(key as keyof typeof entry.sales, "quantity", Math.max(0, sale.quantity - 1))}
                            >
                              <Minus size={14} />
                            </Button>
                            <Input
                              type="number"
                              value={sale.quantity}
                              onChange={(e) => updateSales(key as keyof typeof entry.sales, "quantity", parseInt(e.target.value) || 0)}
                              className="text-center h-8"
                            />
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => updateSales(key as keyof typeof entry.sales, "quantity", sale.quantity + 1)}
                            >
                              <Plus size={14} />
                            </Button>
                          </div>
                        </div>
                        <div>
                          <Label className="text-xs">Price (₹)</Label>
                          <Input
                            type="number"
                            value={sale.price}
                            onChange={(e) => updateSales(key as keyof typeof entry.sales, "price", parseInt(e.target.value) || defaultPrice)}
                            className="h-8"
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}

                <div className="p-4 rounded-xl bg-success/10 border border-success/30">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Total Revenue</span>
                    <span className="text-2xl font-display font-bold text-success">
                      {formatCurrency(calculated.totalRevenue)}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );

      case "collection":
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wallet className="text-primary" size={20} />
                  Payment Collection
                </CardTitle>
                <CardDescription>Track cash and digital payments</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  <div className="p-4 rounded-xl bg-success/10 border border-success/30">
                    <div className="flex items-center gap-3 mb-3">
                      <Wallet className="text-success" size={20} />
                      <Label className="font-medium">Cash Collection</Label>
                    </div>
                    <Input
                      type="number"
                      value={entry.cashCollection || ""}
                      onChange={(e) => updateCollection("cashCollection", parseFloat(e.target.value) || 0)}
                      placeholder="0"
                      className="text-lg"
                    />
                  </div>

                  <div className="p-4 rounded-xl bg-primary/10 border border-primary/30">
                    <div className="flex items-center gap-3 mb-3">
                      <CreditCard className="text-primary" size={20} />
                      <Label className="font-medium">GPay / PhonePe</Label>
                    </div>
                    <Input
                      type="number"
                      value={entry.gpayCollection || ""}
                      onChange={(e) => updateCollection("gpayCollection", parseFloat(e.target.value) || 0)}
                      placeholder="0"
                      className="text-lg"
                    />
                  </div>

                  <div className="p-4 rounded-xl bg-muted">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Total Collection</span>
                      <span className="text-xl font-display font-bold">
                        {formatCurrency(calculated.totalCollection)}
                      </span>
                    </div>
                    {calculated.totalRevenue > 0 && calculated.totalCollection !== calculated.totalRevenue && (
                      <p className="text-xs text-muted-foreground mt-2">
                        Expected: {formatCurrency(calculated.totalRevenue)} 
                        {calculated.totalCollection > calculated.totalRevenue ? " (Over)" : " (Pending)"}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Profit Summary */}
            <Card className="border-2 border-success/30 bg-success/5">
              <CardHeader>
                <CardTitle className="text-success">Today's Profit Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Revenue</span>
                    <span className="font-semibold">{formatCurrency(calculated.totalRevenue)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Raw Fruit Cost</span>
                    <span className="font-semibold text-destructive">
                      -{formatCurrency(entry.rawFruits.reduce((sum, f) => sum + f.totalCost, 0))}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Daily Expenses</span>
                    <span className="font-semibold text-destructive">
                      -{formatCurrency(entry.dailyExpenses.reduce((sum, e) => sum + e.amount, 0))}
                    </span>
                  </div>
                  <div className="pt-3 border-t border-success/30">
                    <div className="flex justify-between items-center">
                      <span className="font-display font-semibold text-lg">Gross Profit</span>
                      <span className={cn(
                        "text-2xl font-display font-bold",
                        calculated.grossProfit >= 0 ? "text-success" : "text-destructive"
                      )}>
                        {formatCurrency(calculated.grossProfit)}
                      </span>
                    </div>
                    <div className="flex justify-between mt-2">
                      <span className="text-sm text-muted-foreground">Profit Margin</span>
                      <span className="font-semibold">{calculated.profitMargin.toFixed(1)}%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );
    }
  };

  const currentStepIndex = steps.findIndex(s => s.id === currentStep);

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground">Daily Entry</h1>
            <p className="text-muted-foreground">Track your business day</p>
          </div>
          <Button onClick={handleSave} className="gap-2 gradient-primary text-primary-foreground">
            <Save size={16} />
            Save Entry
          </Button>
        </div>

        {/* Date Navigation */}
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <Button variant="ghost" onClick={() => handleDateChange(-1)}>
                <ChevronLeft size={20} />
              </Button>
              <div className="text-center">
                <p className="text-lg font-display font-semibold">
                  {new Date(currentDate).toLocaleDateString('en-IN', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                </p>
                {currentDate === getTodayDate() && (
                  <span className="text-xs bg-secondary text-secondary-foreground px-2 py-0.5 rounded-full">
                    Today
                  </span>
                )}
              </div>
              <Button 
                variant="ghost" 
                onClick={() => handleDateChange(1)}
                disabled={currentDate >= getTodayDate()}
              >
                <ChevronRight size={20} />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Step Navigation */}
        <div className="flex items-center justify-between overflow-x-auto pb-2">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = step.id === currentStep;
            const isPast = index < currentStepIndex;
            
            return (
              <button
                key={step.id}
                onClick={() => setCurrentStep(step.id)}
                className={cn(
                  "flex flex-col items-center gap-2 px-4 py-3 rounded-xl transition-all min-w-[80px]",
                  isActive && "bg-primary text-primary-foreground shadow-glow",
                  isPast && !isActive && "text-success",
                  !isActive && !isPast && "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                <Icon size={20} />
                <span className="text-xs font-medium whitespace-nowrap">{step.title}</span>
              </button>
            );
          })}
        </div>

        {/* Step Content */}
        {renderStepContent()}

        {/* Navigation Buttons */}
        <div className="flex justify-between pt-4">
          <Button
            variant="outline"
            onClick={() => setCurrentStep(steps[Math.max(0, currentStepIndex - 1)].id)}
            disabled={currentStepIndex === 0}
            className="gap-2"
          >
            <ChevronLeft size={16} />
            Previous
          </Button>
          {currentStepIndex < steps.length - 1 ? (
            <Button
              onClick={() => setCurrentStep(steps[currentStepIndex + 1].id)}
              className="gap-2"
            >
              Next
              <ChevronRight size={16} />
            </Button>
          ) : (
            <Button onClick={handleSave} className="gap-2 gradient-success text-success-foreground">
              <Save size={16} />
              Save & Complete
            </Button>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
