import { Expense, CategoryBudgets, BillReminder, RecurringExpenseRule } from '../types/expense';
import { INITIAL_EXPENSES } from '../data/initialExpenses';
import { DEFAULT_BUDGETS } from '../data/categories';
import { INITIAL_BILLS, INITIAL_RECURRING_RULES } from '../data/initialBillsAndRecurring';

const EXPENSES_STORAGE_KEY = 'spendpulse_expenses_v1';
const BUDGETS_STORAGE_KEY = 'spendpulse_budgets_v1';
const BILLS_STORAGE_KEY = 'spendpulse_bills_v1';
const RECURRING_STORAGE_KEY = 'spendpulse_recurring_v1';

export function loadStoredExpenses(): Expense[] {
  try {
    const raw = localStorage.getItem(EXPENSES_STORAGE_KEY);
    if (!raw) {
      saveStoredExpenses(INITIAL_EXPENSES);
      return INITIAL_EXPENSES;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return INITIAL_EXPENSES;
  } catch (err) {
    console.error('Failed to parse stored expenses, reverting to defaults:', err);
    return INITIAL_EXPENSES;
  }
}

export function saveStoredExpenses(expenses: Expense[]): void {
  try {
    localStorage.setItem(EXPENSES_STORAGE_KEY, JSON.stringify(expenses));
  } catch (err) {
    console.error('Failed to save expenses to localStorage:', err);
  }
}

export function loadStoredBudgets(): CategoryBudgets {
  try {
    const raw = localStorage.getItem(BUDGETS_STORAGE_KEY);
    if (!raw) {
      saveStoredBudgets(DEFAULT_BUDGETS);
      return DEFAULT_BUDGETS;
    }
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_BUDGETS, ...parsed };
  } catch (err) {
    console.error('Failed to parse stored budgets, reverting to defaults:', err);
    return DEFAULT_BUDGETS;
  }
}

export function saveStoredBudgets(budgets: CategoryBudgets): void {
  try {
    localStorage.setItem(BUDGETS_STORAGE_KEY, JSON.stringify(budgets));
  } catch (err) {
    console.error('Failed to save budgets to localStorage:', err);
  }
}

export function loadStoredBills(): BillReminder[] {
  try {
    const raw = localStorage.getItem(BILLS_STORAGE_KEY);
    if (!raw) {
      saveStoredBills(INITIAL_BILLS);
      return INITIAL_BILLS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : INITIAL_BILLS;
  } catch (err) {
    console.error('Failed to parse stored bills, reverting to defaults:', err);
    return INITIAL_BILLS;
  }
}

export function saveStoredBills(bills: BillReminder[]): void {
  try {
    localStorage.setItem(BILLS_STORAGE_KEY, JSON.stringify(bills));
  } catch (err) {
    console.error('Failed to save bills to localStorage:', err);
  }
}

export function loadStoredRecurringRules(): RecurringExpenseRule[] {
  try {
    const raw = localStorage.getItem(RECURRING_STORAGE_KEY);
    if (!raw) {
      saveStoredRecurringRules(INITIAL_RECURRING_RULES);
      return INITIAL_RECURRING_RULES;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : INITIAL_RECURRING_RULES;
  } catch (err) {
    console.error('Failed to parse stored recurring rules, reverting to defaults:', err);
    return INITIAL_RECURRING_RULES;
  }
}

export function saveStoredRecurringRules(rules: RecurringExpenseRule[]): void {
  try {
    localStorage.setItem(RECURRING_STORAGE_KEY, JSON.stringify(rules));
  } catch (err) {
    console.error('Failed to save recurring rules to localStorage:', err);
  }
}

export function resetToSampleData(): {
  expenses: Expense[];
  budgets: CategoryBudgets;
  bills: BillReminder[];
  recurring: RecurringExpenseRule[];
} {
  saveStoredExpenses(INITIAL_EXPENSES);
  saveStoredBudgets(DEFAULT_BUDGETS);
  saveStoredBills(INITIAL_BILLS);
  saveStoredRecurringRules(INITIAL_RECURRING_RULES);
  return {
    expenses: INITIAL_EXPENSES,
    budgets: DEFAULT_BUDGETS,
    bills: INITIAL_BILLS,
    recurring: INITIAL_RECURRING_RULES,
  };
}

export function exportExpensesToCsv(expenses: Expense[]): void {
  const headers = ['ID', 'Date', 'Amount', 'Description', 'Category', 'Payee', 'Payment Method', 'Is Recurring', 'Notes'];
  const rows = expenses.map((e) => [
    e.id,
    e.date,
    e.amount.toFixed(2),
    `"${(e.description || '').replace(/"/g, '""')}"`,
    e.category,
    `"${(e.payee || '').replace(/"/g, '""')}"`,
    e.paymentMethod,
    e.isRecurring ? 'Yes' : 'No',
    `"${(e.notes || '').replace(/"/g, '""')}"`,
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `spendpulse_expenses_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportDataToJson(
  expenses: Expense[],
  budgets: CategoryBudgets,
  bills: BillReminder[],
  recurring: RecurringExpenseRule[]
): void {
  const payload = {
    version: '1.2',
    exportedAt: new Date().toISOString(),
    expenses,
    budgets,
    bills,
    recurring,
  };
  const jsonString = JSON.stringify(payload, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `spendpulse_backup_${new Date().toISOString().split('T')[0]}.json`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function importDataFromJson(
  jsonText: string
): {
  success: boolean;
  expenses?: Expense[];
  budgets?: CategoryBudgets;
  bills?: BillReminder[];
  recurring?: RecurringExpenseRule[];
  error?: string;
} {
  try {
    const parsed = JSON.parse(jsonText);
    if (!parsed || !Array.isArray(parsed.expenses)) {
      return { success: false, error: 'Invalid file format: Missing expenses array.' };
    }
    const expenses: Expense[] = parsed.expenses.map((item: any, idx: number) => ({
      id: item.id || `imported-${Date.now()}-${idx}`,
      amount: Number(item.amount) || 0,
      description: String(item.description || 'Imported Expense'),
      category: item.category || 'other',
      date: item.date || new Date().toISOString().split('T')[0],
      payee: String(item.payee || ''),
      paymentMethod: item.paymentMethod || 'Credit Card',
      isRecurring: Boolean(item.isRecurring),
      recurringRuleId: item.recurringRuleId,
      notes: item.notes || '',
    }));

    const budgets = parsed.budgets || DEFAULT_BUDGETS;
    const bills = Array.isArray(parsed.bills) ? parsed.bills : INITIAL_BILLS;
    const recurring = Array.isArray(parsed.recurring) ? parsed.recurring : INITIAL_RECURRING_RULES;

    saveStoredExpenses(expenses);
    saveStoredBudgets(budgets);
    saveStoredBills(bills);
    saveStoredRecurringRules(recurring);

    return { success: true, expenses, budgets, bills, recurring };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to parse JSON file' };
  }
}
