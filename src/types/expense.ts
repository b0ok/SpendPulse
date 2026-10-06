export type CategoryId =
  | 'housing'
  | 'groceries'
  | 'food_dining'
  | 'transportation'
  | 'utilities'
  | 'entertainment'
  | 'health_wellness'
  | 'shopping'
  | 'personal_care'
  | 'subscriptions'
  | 'travel'
  | 'other';

export type CategoryClassification = 'essential' | 'discretionary' | 'savings_growth';

export type PaymentMethod =
  | 'Credit Card'
  | 'Debit Card'
  | 'Cash'
  | 'Apple / Google Pay'
  | 'Bank Transfer';

export interface CategoryMeta {
  id: CategoryId;
  name: string;
  icon: string;
  color: string;
  tailwindBg: string;
  tailwindText: string;
  tailwindBorder: string;
  defaultBudget: number;
  classification: CategoryClassification;
}

export interface Expense {
  id: string;
  amount: number;
  description: string;
  category: CategoryId;
  date: string; // YYYY-MM-DD
  payee: string;
  paymentMethod: PaymentMethod;
  isRecurring?: boolean;
  recurringRuleId?: string;
  notes?: string;
  tags?: string[];
}

export type CategoryBudgets = Record<CategoryId, number>;

export type BudgetAlertStatus = 'normal' | 'approaching' | 'exceeded';

export interface BillReminder {
  id: string;
  title: string;
  payee: string;
  amount: number;
  dueDayOfMonth: number; // 1 - 31
  category: CategoryId;
  notifyDaysBefore: number; // configurable e.g. 1, 3, 5, 7 days
  isPaid: boolean;
  lastPaidDate?: string; // YYYY-MM-DD
  autoPay?: boolean;
  notes?: string;
}

export interface RecurringExpenseRule {
  id: string;
  title: string;
  amount: number;
  category: CategoryId;
  payee: string;
  paymentMethod: PaymentMethod;
  frequency: 'monthly' | 'bi-weekly' | 'yearly';
  dayOfMonth: number; // 1 - 31
  startDate: string; // YYYY-MM-DD
  isActive: boolean;
  lastLoggedMonth?: string; // e.g. "2026-10" to prevent duplicate logging
  autoLog: boolean;
  notes?: string;
}

export interface MonthSummary {
  monthKey: string; // YYYY-MM
  monthLabel: string;
  totalSpent: number;
  budgetTotal: number;
  remainingBudget: number;
  budgetUtilizationPct: number;
  transactionCount: number;
  averagePerDay: number;
  projectedMonthEnd: number;
  daysInMonth: number;
  elapsedDays: number;
  topCategory: CategoryId | null;
  essentialSpent: number;
  discretionarySpent: number;
}
