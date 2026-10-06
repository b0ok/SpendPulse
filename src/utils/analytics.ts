import { Expense, CategoryBudgets, CategoryId, MonthSummary } from '../types/expense';
import { CATEGORIES } from '../data/categories';

export type { MonthSummary };

export interface DailySpendPoint {
  day: number;
  dateStr: string;
  amount: number;
  cumulative: number;
  transactionCount: number;
  topItem?: string;
}

export interface CategoryBreakdownItem {
  category: CategoryId;
  name: string;
  color: string;
  icon: string;
  total: number;
  count: number;
  percentage: number;
  budget: number;
  budgetUsedPct: number;
  isOverBudget: boolean;
}

export interface MonthOverMonthPoint {
  monthKey: string;
  label: string;
  totalSpent: number;
  essentialSpent: number;
  discretionarySpent: number;
  transactionCount: number;
}

export interface SpendingHabitsData {
  weekdayTotal: number;
  weekdayAvgPerDay: number;
  weekendTotal: number;
  weekendAvgPerDay: number;
  weekendVsWeekdayPct: number; // percentage of spend occurring on weekends
  dayOfWeekAverages: { dayName: string; shortName: string; average: number; total: number; count: number }[];
  needsTotal: number;
  wantsTotal: number;
  needsPercentage: number;
  wantsPercentage: number;
  topMerchants: { name: string; total: number; count: number; percentage: number }[];
  highestDay: { date: string; amount: number; description: string } | null;
  avgTransactionSize: number;
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatCompactCurrency(amount: number): string {
  if (Math.abs(amount) >= 1000) {
    return `$${(amount / 1000).toFixed(1)}k`;
  }
  return `$${Math.round(amount)}`;
}

export function getMonthLabel(monthKey: string): string {
  const [year, month] = monthKey.split('-').map(Number);
  const date = new Date(year, month - 1, 1);
  return date.toLocaleString('en-US', { month: 'long', year: 'numeric' });
}

export function getShortMonthLabel(monthKey: string): string {
  const [year, month] = monthKey.split('-').map(Number);
  const date = new Date(year, month - 1, 1);
  return date.toLocaleString('en-US', { month: 'short' });
}

export function getDaysInMonth(year: number, monthIndex: number): number {
  return new Date(year, monthIndex + 1, 0).getDate();
}

export function getAvailableMonths(expenses: Expense[]): string[] {
  const set = new Set<string>();
  // Include current month
  const now = new Date();
  const currentKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  set.add(currentKey);

  for (const exp of expenses) {
    if (exp.date && exp.date.length >= 7) {
      set.add(exp.date.substring(0, 7));
    }
  }

  return Array.from(set).sort((a, b) => b.localeCompare(a));
}

export function getMonthlySummary(
  expenses: Expense[],
  monthKey: string,
  budgets: CategoryBudgets
): MonthSummary {
  const [year, month] = monthKey.split('-').map(Number);
  const monthExpenses = expenses.filter((e) => e.date.startsWith(monthKey));

  const totalSpent = monthExpenses.reduce((sum, e) => sum + e.amount, 0);
  const budgetTotal = Object.values(budgets).reduce((sum, b) => sum + b, 0);
  const remainingBudget = budgetTotal - totalSpent;
  const budgetUtilizationPct = budgetTotal > 0 ? (totalSpent / budgetTotal) * 100 : 0;

  const daysInMonth = getDaysInMonth(year, month - 1);

  // Check if it's the current month to compute elapsed days
  const now = new Date();
  const isCurrentMonth =
    now.getFullYear() === year && now.getMonth() + 1 === month;
  const elapsedDays = isCurrentMonth ? Math.min(now.getDate(), daysInMonth) : daysInMonth;

  const averagePerDay = elapsedDays > 0 ? totalSpent / elapsedDays : 0;
  const projectedMonthEnd = isCurrentMonth
    ? averagePerDay * daysInMonth
    : totalSpent;

  // Breakdown by classification & top category
  let essentialSpent = 0;
  let discretionarySpent = 0;
  const catTotals: Record<string, number> = {};

  for (const exp of monthExpenses) {
    catTotals[exp.category] = (catTotals[exp.category] || 0) + exp.amount;
    const catMeta = CATEGORIES[exp.category];
    if (catMeta && catMeta.classification === 'essential') {
      essentialSpent += exp.amount;
    } else {
      discretionarySpent += exp.amount;
    }
  }

  let topCategory: CategoryId | null = null;
  let maxCatAmount = -1;
  for (const [cat, amt] of Object.entries(catTotals)) {
    if (amt > maxCatAmount) {
      maxCatAmount = amt;
      topCategory = cat as CategoryId;
    }
  }

  return {
    monthKey,
    monthLabel: getMonthLabel(monthKey),
    totalSpent,
    budgetTotal,
    remainingBudget,
    budgetUtilizationPct,
    transactionCount: monthExpenses.length,
    averagePerDay,
    projectedMonthEnd,
    daysInMonth,
    elapsedDays,
    topCategory,
    essentialSpent,
    discretionarySpent,
  };
}

export function getDailySpendingSeries(
  expenses: Expense[],
  monthKey: string
): DailySpendPoint[] {
  const [year, month] = monthKey.split('-').map(Number);
  const daysInMonth = getDaysInMonth(year, month - 1);
  const monthExpenses = expenses.filter((e) => e.date.startsWith(monthKey));

  // Map day number (1..daysInMonth) to transactions
  const dayMap: Record<number, { amount: number; count: number; topItem?: string; maxItemAmount: number }> = {};
  for (let d = 1; d <= daysInMonth; d++) {
    dayMap[d] = { amount: 0, count: 0, maxItemAmount: 0 };
  }

  for (const exp of monthExpenses) {
    const day = parseInt(exp.date.split('-')[2], 10);
    if (dayMap[day]) {
      dayMap[day].amount += exp.amount;
      dayMap[day].count += 1;
      if (exp.amount > dayMap[day].maxItemAmount) {
        dayMap[day].maxItemAmount = exp.amount;
        dayMap[day].topItem = `${exp.payee ? exp.payee + ': ' : ''}${exp.description}`;
      }
    }
  }

  let cumulative = 0;
  const series: DailySpendPoint[] = [];

  for (let d = 1; d <= daysInMonth; d++) {
    cumulative += dayMap[d].amount;
    const dateStr = `${monthKey}-${String(d).padStart(2, '0')}`;
    series.push({
      day: d,
      dateStr,
      amount: dayMap[d].amount,
      cumulative,
      transactionCount: dayMap[d].count,
      topItem: dayMap[d].topItem,
    });
  }

  return series;
}

export function getCategoryBreakdown(
  expenses: Expense[],
  monthKey: string,
  budgets: CategoryBudgets
): CategoryBreakdownItem[] {
  const monthExpenses = expenses.filter((e) => e.date.startsWith(monthKey));
  const totalMonthSpent = monthExpenses.reduce((sum, e) => sum + e.amount, 0);

  const catMap: Record<CategoryId, { total: number; count: number }> = {} as any;
  for (const catId of Object.keys(CATEGORIES) as CategoryId[]) {
    catMap[catId] = { total: 0, count: 0 };
  }

  for (const exp of monthExpenses) {
    if (catMap[exp.category]) {
      catMap[exp.category].total += exp.amount;
      catMap[exp.category].count += 1;
    } else {
      catMap[exp.category] = { total: exp.amount, count: 1 };
    }
  }

  const items: CategoryBreakdownItem[] = (Object.keys(CATEGORIES) as CategoryId[])
    .map((catId) => {
      const meta = CATEGORIES[catId];
      const data = catMap[catId] || { total: 0, count: 0 };
      const budget = budgets[catId] || meta.defaultBudget;
      const percentage = totalMonthSpent > 0 ? (data.total / totalMonthSpent) * 100 : 0;
      const budgetUsedPct = budget > 0 ? (data.total / budget) * 100 : 0;

      return {
        category: catId,
        name: meta.name,
        color: meta.color,
        icon: meta.icon,
        total: data.total,
        count: data.count,
        percentage,
        budget,
        budgetUsedPct,
        isOverBudget: data.total > budget,
      };
    })
    .filter((item) => item.total > 0 || item.budget > 0)
    .sort((a, b) => b.total - a.total);

  return items;
}

export function getMonthOverMonthSeries(
  expenses: Expense[],
  monthsLimit = 6
): MonthOverMonthPoint[] {
  const allMonths = getAvailableMonths(expenses);
  const targetMonths = allMonths.slice(0, monthsLimit).reverse();

  return targetMonths.map((mKey) => {
    const mExpenses = expenses.filter((e) => e.date.startsWith(mKey));
    let totalSpent = 0;
    let essentialSpent = 0;
    let discretionarySpent = 0;

    for (const exp of mExpenses) {
      totalSpent += exp.amount;
      const catMeta = CATEGORIES[exp.category];
      if (catMeta && catMeta.classification === 'essential') {
        essentialSpent += exp.amount;
      } else {
        discretionarySpent += exp.amount;
      }
    }

    return {
      monthKey: mKey,
      label: getShortMonthLabel(mKey),
      totalSpent,
      essentialSpent,
      discretionarySpent,
      transactionCount: mExpenses.length,
    };
  });
}

export function getSpendingHabits(
  expenses: Expense[],
  monthKey: string
): SpendingHabitsData {
  const monthExpenses = expenses.filter((e) => e.date.startsWith(monthKey));

  let weekdayTotal = 0;
  let weekdayCountDays = 0;
  let weekendTotal = 0;
  let weekendCountDays = 0;

  // Day of week stats: 0 = Sun, 1 = Mon, ..., 6 = Sat
  const dayNames = [
    { short: 'Sun', full: 'Sunday' },
    { short: 'Mon', full: 'Monday' },
    { short: 'Tue', full: 'Tuesday' },
    { short: 'Wed', full: 'Wednesday' },
    { short: 'Thu', full: 'Thursday' },
    { short: 'Fri', full: 'Friday' },
    { short: 'Sat', full: 'Saturday' },
  ];

  const dowTotals = dayNames.map((d) => ({ name: d.full, short: d.short, total: 0, count: 0 }));

  const merchantTotals: Record<string, { total: number; count: number }> = {};
  let needsTotal = 0;
  let wantsTotal = 0;

  let highestDay: { date: string; amount: number; description: string } | null = null;
  const dailySpendMap: Record<string, { amount: number; items: string[] }> = {};

  for (const exp of monthExpenses) {
    const dateObj = new Date(exp.date + 'T12:00:00'); // Safe mid-day to prevent timezone drift
    const dayOfWeek = dateObj.getDay();

    dowTotals[dayOfWeek].total += exp.amount;
    dowTotals[dayOfWeek].count += 1;

    if (dayOfWeek === 0 || dayOfWeek === 6) {
      weekendTotal += exp.amount;
    } else {
      weekdayTotal += exp.amount;
    }

    // Essential vs Discretionary
    const cat = CATEGORIES[exp.category];
    if (cat && cat.classification === 'essential') {
      needsTotal += exp.amount;
    } else {
      wantsTotal += exp.amount;
    }

    // Merchants
    const merchant = exp.payee?.trim() || 'Uncategorized Payee';
    if (!merchantTotals[merchant]) {
      merchantTotals[merchant] = { total: 0, count: 0 };
    }
    merchantTotals[merchant].total += exp.amount;
    merchantTotals[merchant].count += 1;

    // Daily aggregates
    if (!dailySpendMap[exp.date]) {
      dailySpendMap[exp.date] = { amount: 0, items: [] };
    }
    dailySpendMap[exp.date].amount += exp.amount;
    dailySpendMap[exp.date].items.push(exp.description);
  }

  // Find peak day
  for (const [date, data] of Object.entries(dailySpendMap)) {
    if (!highestDay || data.amount > highestDay.amount) {
      highestDay = {
        date,
        amount: data.amount,
        description: data.items.join(', '),
      };
    }
  }

  // Calculate distinct weekday/weekend day counts in month
  const [year, month] = monthKey.split('-').map(Number);
  const daysInMonth = getDaysInMonth(year, month - 1);
  for (let d = 1; d <= daysInMonth; d++) {
    const dow = new Date(year, month - 1, d).getDay();
    if (dow === 0 || dow === 6) {
      weekendCountDays++;
    } else {
      weekdayCountDays++;
    }
  }

  const weekdayAvgPerDay = weekdayCountDays > 0 ? weekdayTotal / weekdayCountDays : 0;
  const weekendAvgPerDay = weekendCountDays > 0 ? weekendTotal / weekendCountDays : 0;
  const grandTotal = weekdayTotal + weekendTotal;
  const weekendVsWeekdayPct = grandTotal > 0 ? (weekendTotal / grandTotal) * 100 : 0;

  const needsPercentage = grandTotal > 0 ? (needsTotal / grandTotal) * 100 : 0;
  const wantsPercentage = grandTotal > 0 ? (wantsTotal / grandTotal) * 100 : 0;

  // Day of week averages
  const dayOfWeekAverages = dowTotals.map((item, index) => {
    // Count how many times this day of week occurs in the month
    let occurrences = 0;
    for (let d = 1; d <= daysInMonth; d++) {
      if (new Date(year, month - 1, d).getDay() === index) occurrences++;
    }
    const average = occurrences > 0 ? item.total / occurrences : 0;
    return {
      dayName: item.name,
      shortName: item.short,
      average,
      total: item.total,
      count: item.count,
    };
  });

  // Reorder starting Monday: Mon, Tue, Wed, Thu, Fri, Sat, Sun
  const reorderedDow = [
    dayOfWeekAverages[1],
    dayOfWeekAverages[2],
    dayOfWeekAverages[3],
    dayOfWeekAverages[4],
    dayOfWeekAverages[5],
    dayOfWeekAverages[6],
    dayOfWeekAverages[0],
  ];

  const topMerchants = Object.entries(merchantTotals)
    .map(([name, data]) => ({
      name,
      total: data.total,
      count: data.count,
      percentage: grandTotal > 0 ? (data.total / grandTotal) * 100 : 0,
    }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);

  const avgTransactionSize =
    monthExpenses.length > 0 ? grandTotal / monthExpenses.length : 0;

  return {
    weekdayTotal,
    weekdayAvgPerDay,
    weekendTotal,
    weekendAvgPerDay,
    weekendVsWeekdayPct,
    dayOfWeekAverages: reorderedDow,
    needsTotal,
    wantsTotal,
    needsPercentage,
    wantsPercentage,
    topMerchants,
    highestDay,
    avgTransactionSize,
  };
}
