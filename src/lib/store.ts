// BHOOMISH Business CRM - Data Store
// Using localStorage for now - can connect to database later

export interface DailyEntry {
  id: string;
  date: string;
  
  // Morning Purchase
  rawFruits: {
    fruit: string;
    quantity: number; // kg
    pricePerKg: number;
    totalCost: number;
  }[];
  
  // Production
  fruitBoxes: {
    bigCombo: number;
    mediumCombo: number;
    smallBox: number;
    juiceOnly: number;
  };
  
  juiceProduction: {
    type: string;
    liters: number;
  }[];
  
  // Weight tracking
  totalRawWeight: number; // kg
  wastageWeight: number; // kg
  usedWeight: number; // kg
  
  // Sales
  sales: {
    bigCombo: { quantity: number; price: number };
    mediumCombo: { quantity: number; price: number };
    smallBox: { quantity: number; price: number };
    juiceOnly: { quantity: number; price: number };
  };
  
  // Collection
  cashCollection: number;
  gpayCollection: number;
  totalCollection: number;
  
  // Daily Expenses (Consumables)
  dailyExpenses: {
    item: string;
    amount: number;
  }[];
  
  // Calculations
  totalRevenue: number;
  totalExpenses: number;
  grossProfit: number;
  profitMargin: number;
  
  // Self Review
  selfReview: {
    notes: string;
    challenges: string;
    improvements: string;
    mood: 'great' | 'good' | 'okay' | 'tough';
    rating: number; // 1-5
  };
  
  createdAt: string;
  updatedAt: string;
}

export interface FixedExpense {
  id: string;
  name: string;
  amount: number;
  category: 'equipment' | 'setup' | 'license' | 'other';
  date: string;
  notes?: string;
}

export interface BusinessMetrics {
  totalRevenue: number;
  totalExpenses: number;
  totalProfit: number;
  avgDailyRevenue: number;
  avgDailyProfit: number;
  totalSalesCount: number;
  avgProfitMargin: number;
  bestDay: { date: string; profit: number } | null;
  worstDay: { date: string; profit: number } | null;
}

// Storage keys
const DAILY_ENTRIES_KEY = 'bhoomish_daily_entries';
const FIXED_EXPENSES_KEY = 'bhoomish_fixed_expenses';

// Helper to generate unique ID
export const generateId = () => Math.random().toString(36).substring(2, 15);

// Get today's date in YYYY-MM-DD format
export const getTodayDate = () => new Date().toISOString().split('T')[0];

// Daily Entries CRUD
export const getDailyEntries = (): DailyEntry[] => {
  const data = localStorage.getItem(DAILY_ENTRIES_KEY);
  return data ? JSON.parse(data) : [];
};

export const saveDailyEntry = (entry: DailyEntry): void => {
  const entries = getDailyEntries();
  const existingIndex = entries.findIndex(e => e.date === entry.date);
  
  if (existingIndex >= 0) {
    entries[existingIndex] = { ...entry, updatedAt: new Date().toISOString() };
  } else {
    entries.push(entry);
  }
  
  localStorage.setItem(DAILY_ENTRIES_KEY, JSON.stringify(entries));
};

export const getDailyEntry = (date: string): DailyEntry | null => {
  const entries = getDailyEntries();
  return entries.find(e => e.date === date) || null;
};

export const deleteDailyEntry = (id: string): void => {
  const entries = getDailyEntries().filter(e => e.id !== id);
  localStorage.setItem(DAILY_ENTRIES_KEY, JSON.stringify(entries));
};

// Fixed Expenses CRUD
export const getFixedExpenses = (): FixedExpense[] => {
  const data = localStorage.getItem(FIXED_EXPENSES_KEY);
  return data ? JSON.parse(data) : [];
};

export const saveFixedExpense = (expense: FixedExpense): void => {
  const expenses = getFixedExpenses();
  const existingIndex = expenses.findIndex(e => e.id === expense.id);
  
  if (existingIndex >= 0) {
    expenses[existingIndex] = expense;
  } else {
    expenses.push(expense);
  }
  
  localStorage.setItem(FIXED_EXPENSES_KEY, JSON.stringify(expenses));
};

export const deleteFixedExpense = (id: string): void => {
  const expenses = getFixedExpenses().filter(e => e.id !== id);
  localStorage.setItem(FIXED_EXPENSES_KEY, JSON.stringify(expenses));
};

// Calculate metrics
export const calculateMetrics = (): BusinessMetrics => {
  const entries = getDailyEntries();
  const fixedExpenses = getFixedExpenses();
  
  if (entries.length === 0) {
    return {
      totalRevenue: 0,
      totalExpenses: 0,
      totalProfit: 0,
      avgDailyRevenue: 0,
      avgDailyProfit: 0,
      totalSalesCount: 0,
      avgProfitMargin: 0,
      bestDay: null,
      worstDay: null,
    };
  }
  
  const totalFixedExpenses = fixedExpenses.reduce((sum, e) => sum + e.amount, 0);
  const totalRevenue = entries.reduce((sum, e) => sum + e.totalRevenue, 0);
  const totalDailyExpenses = entries.reduce((sum, e) => sum + e.totalExpenses, 0);
  const totalExpenses = totalDailyExpenses + totalFixedExpenses;
  const totalProfit = totalRevenue - totalExpenses;
  
  const totalSalesCount = entries.reduce((sum, e) => {
    return sum + 
      e.sales.bigCombo.quantity + 
      e.sales.mediumCombo.quantity + 
      e.sales.smallBox.quantity + 
      e.sales.juiceOnly.quantity;
  }, 0);
  
  const avgProfitMargin = entries.reduce((sum, e) => sum + e.profitMargin, 0) / entries.length;
  
  // Find best and worst days
  const sortedByProfit = [...entries].sort((a, b) => b.grossProfit - a.grossProfit);
  
  return {
    totalRevenue,
    totalExpenses,
    totalProfit,
    avgDailyRevenue: totalRevenue / entries.length,
    avgDailyProfit: totalProfit / entries.length,
    totalSalesCount,
    avgProfitMargin,
    bestDay: sortedByProfit[0] ? { date: sortedByProfit[0].date, profit: sortedByProfit[0].grossProfit } : null,
    worstDay: sortedByProfit[sortedByProfit.length - 1] ? { date: sortedByProfit[sortedByProfit.length - 1].date, profit: sortedByProfit[sortedByProfit.length - 1].grossProfit } : null,
  };
};

// Get weekly data for charts
export const getWeeklyData = (weeks: number = 4) => {
  const entries = getDailyEntries();
  const now = new Date();
  const startDate = new Date(now);
  startDate.setDate(startDate.getDate() - (weeks * 7));
  
  return entries
    .filter(e => new Date(e.date) >= startDate)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map(e => ({
      date: e.date,
      revenue: e.totalRevenue,
      profit: e.grossProfit,
      expenses: e.totalExpenses,
      sales: e.sales.bigCombo.quantity + e.sales.mediumCombo.quantity + e.sales.smallBox.quantity + e.sales.juiceOnly.quantity,
    }));
};

// Create empty daily entry template
export const createEmptyDailyEntry = (date: string): DailyEntry => ({
  id: generateId(),
  date,
  rawFruits: [],
  fruitBoxes: { bigCombo: 0, mediumCombo: 0, smallBox: 0, juiceOnly: 0 },
  juiceProduction: [],
  totalRawWeight: 0,
  wastageWeight: 0,
  usedWeight: 0,
  sales: {
    bigCombo: { quantity: 0, price: 59 },
    mediumCombo: { quantity: 0, price: 39 },
    smallBox: { quantity: 0, price: 29 },
    juiceOnly: { quantity: 0, price: 20 },
  },
  cashCollection: 0,
  gpayCollection: 0,
  totalCollection: 0,
  dailyExpenses: [],
  totalRevenue: 0,
  totalExpenses: 0,
  grossProfit: 0,
  profitMargin: 0,
  selfReview: {
    notes: '',
    challenges: '',
    improvements: '',
    mood: 'good',
    rating: 3,
  },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

// Calculate entry totals
export const calculateEntryTotals = (entry: DailyEntry): DailyEntry => {
  // Calculate raw fruit cost
  const rawFruitCost = entry.rawFruits.reduce((sum, f) => sum + f.totalCost, 0);
  
  // Calculate daily expenses
  const dailyExpenseTotal = entry.dailyExpenses.reduce((sum, e) => sum + e.amount, 0);
  
  // Total expenses
  const totalExpenses = rawFruitCost + dailyExpenseTotal;
  
  // Calculate revenue from sales
  const revenue = 
    (entry.sales.bigCombo.quantity * entry.sales.bigCombo.price) +
    (entry.sales.mediumCombo.quantity * entry.sales.mediumCombo.price) +
    (entry.sales.smallBox.quantity * entry.sales.smallBox.price) +
    (entry.sales.juiceOnly.quantity * entry.sales.juiceOnly.price);
  
  // Total collection
  const totalCollection = entry.cashCollection + entry.gpayCollection;
  
  // Gross profit
  const grossProfit = revenue - totalExpenses;
  
  // Profit margin
  const profitMargin = revenue > 0 ? (grossProfit / revenue) * 100 : 0;
  
  // Weight calculations
  const totalRawWeight = entry.rawFruits.reduce((sum, f) => sum + f.quantity, 0);
  const usedWeight = totalRawWeight - entry.wastageWeight;
  
  return {
    ...entry,
    totalRawWeight,
    usedWeight,
    totalRevenue: revenue,
    totalExpenses,
    totalCollection,
    grossProfit,
    profitMargin,
    updatedAt: new Date().toISOString(),
  };
};

// Format currency (INR)
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

// Format date
export const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
};

// Sample data generator for demo
export const generateSampleData = () => {
  const entries: DailyEntry[] = [];
  const today = new Date();
  
  for (let i = 30; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    
    // Skip some random days
    if (Math.random() > 0.85) continue;
    
    const bigSales = Math.floor(Math.random() * 30) + 20;
    const mediumSales = Math.floor(Math.random() * 25) + 15;
    const smallSales = Math.floor(Math.random() * 20) + 10;
    const juiceSales = Math.floor(Math.random() * 15) + 5;
    
    const rawFruitCost = Math.floor(Math.random() * 500) + 800;
    const dailyExpenses = Math.floor(Math.random() * 200) + 150;
    
    const entry = createEmptyDailyEntry(dateStr);
    entry.rawFruits = [
      { fruit: 'Apple', quantity: 3, pricePerKg: 120, totalCost: 360 },
      { fruit: 'Banana', quantity: 2, pricePerKg: 40, totalCost: 80 },
      { fruit: 'Orange', quantity: 4, pricePerKg: 80, totalCost: 320 },
      { fruit: 'Grapes', quantity: 1.5, pricePerKg: 100, totalCost: 150 },
    ];
    entry.sales = {
      bigCombo: { quantity: bigSales, price: 59 },
      mediumCombo: { quantity: mediumSales, price: 39 },
      smallBox: { quantity: smallSales, price: 29 },
      juiceOnly: { quantity: juiceSales, price: 20 },
    };
    entry.dailyExpenses = [
      { item: 'Cups & Boxes', amount: 100 },
      { item: 'Ice', amount: 50 },
    ];
    entry.cashCollection = Math.floor((bigSales * 59 + mediumSales * 39 + smallSales * 29 + juiceSales * 20) * 0.6);
    entry.gpayCollection = Math.floor((bigSales * 59 + mediumSales * 39 + smallSales * 29 + juiceSales * 20) * 0.4);
    entry.wastageWeight = Math.random() * 0.5;
    entry.selfReview = {
      notes: 'Good day overall',
      challenges: 'Morning rush was intense',
      improvements: 'Prepare more medium combos',
      mood: ['great', 'good', 'okay'][Math.floor(Math.random() * 3)] as 'great' | 'good' | 'okay',
      rating: Math.floor(Math.random() * 2) + 3,
    };
    
    const calculated = calculateEntryTotals(entry);
    entries.push(calculated);
  }
  
  localStorage.setItem(DAILY_ENTRIES_KEY, JSON.stringify(entries));
  
  // Add some fixed expenses
  const fixedExpenses: FixedExpense[] = [
    { id: generateId(), name: 'Fruit Cutting Board', amount: 500, category: 'equipment', date: '2024-01-01' },
    { id: generateId(), name: 'Display Stand', amount: 2000, category: 'equipment', date: '2024-01-01' },
    { id: generateId(), name: 'Juicer Machine', amount: 3500, category: 'equipment', date: '2024-01-01' },
    { id: generateId(), name: 'Signboard', amount: 1500, category: 'setup', date: '2024-01-01' },
  ];
  
  localStorage.setItem(FIXED_EXPENSES_KEY, JSON.stringify(fixedExpenses));
};
