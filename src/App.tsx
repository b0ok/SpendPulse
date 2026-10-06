/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import {
  Expense,
  CategoryBudgets,
  CategoryId,
  BillReminder,
  RecurringExpenseRule,
} from './types/expense';
import {
  loadStoredExpenses,
  saveStoredExpenses,
  loadStoredBudgets,
  saveStoredBudgets,
  loadStoredBills,
  saveStoredBills,
  loadStoredRecurringRules,
  saveStoredRecurringRules,
} from './utils/storage';
import {
  getAvailableMonths,
  getMonthlySummary,
  getDailySpendingSeries,
  getCategoryBreakdown,
  getMonthOverMonthSeries,
  getSpendingHabits,
  formatCurrency,
} from './utils/analytics';
import { processRecurringExpenses } from './utils/recurringEngine';
import { evaluateAllBills, triggerSystemNotification } from './utils/billReminders';
import { TopBar, ActiveTab } from './components/TopBar';
import { MonthSelector } from './components/MonthSelector';
import { MetricCards } from './components/MetricCards';
import { DailySpendTrendChart } from './components/charts/DailySpendTrendChart';
import { CategoryDonutChart } from './components/charts/CategoryDonutChart';
import { MonthOverMonthBarChart } from './components/charts/MonthOverMonthBarChart';
import { SpendingHabitsView } from './components/charts/SpendingHabitsView';
import { BudgetDashboardView } from './components/budget/BudgetDashboardView';
import { BillRemindersView } from './components/reminders/BillRemindersView';
import { RecurringExpensesView } from './components/recurring/RecurringExpensesView';
import { NotificationCenterModal } from './components/NotificationCenterModal';
import { ExpenseTable } from './components/ExpenseTable';
import { ExpenseFormModal } from './components/ExpenseFormModal';
import { BudgetManagerModal } from './components/BudgetManagerModal';
import { DataBackupModal } from './components/DataBackupModal';
import {
  Plus,
  SlidersHorizontal,
  TrendingUp,
  Receipt,
  PieChart,
  Calendar,
  Sparkles,
  ArrowRight,
  Bell,
  CheckCircle2,
  AlertTriangle,
  Zap,
} from 'lucide-react';

export default function App() {
  const [expenses, setExpenses] = useState<Expense[]>(() => loadStoredExpenses());
  const [budgets, setBudgets] = useState<CategoryBudgets>(() => loadStoredBudgets());
  const [bills, setBills] = useState<BillReminder[]>(() => loadStoredBills());
  const [recurringRules, setRecurringRules] = useState<RecurringExpenseRule[]>(() =>
    loadStoredRecurringRules()
  );
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');

  // Month selection
  const availableMonths = useMemo(() => getAvailableMonths(expenses), [expenses]);
  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    const months = getAvailableMonths(expenses);
    return months[0] || '2026-10';
  });

  // Filter state
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<CategoryId | null>(null);

  // Modals state
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [isBudgetsOpen, setIsBudgetsOpen] = useState(false);
  const [isBackupOpen, setIsBackupOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [engineNotificationMsg, setEngineNotificationMsg] = useState<string | null>(null);

  // Ensure selectedMonth stays valid if months change
  useEffect(() => {
    if (!availableMonths.includes(selectedMonth) && availableMonths.length > 0) {
      setSelectedMonth(availableMonths[0]);
    }
  }, [availableMonths, selectedMonth]);

  // AUTO-LOGGING ENGINE: Run on mount to check if any recurring expenses are due today or scheduled
  useEffect(() => {
    const today = new Date();
    const result = processRecurringExpenses(recurringRules, expenses, today);

    if (result.loggedCount > 0) {
      const mergedExpenses = [...result.newExpenses, ...expenses];
      setExpenses(mergedExpenses);
      saveStoredExpenses(mergedExpenses);

      setRecurringRules(result.updatedRules);
      saveStoredRecurringRules(result.updatedRules);

      const msg = `Auto-logged ${result.loggedCount} scheduled recurring expense(s): ${result.loggedNames.join(
        ', '
      )}`;
      setEngineNotificationMsg(msg);
      triggerSystemNotification('SpendPulse Scheduled Auto-Log', msg);
    }
  }, []);

  // Expense Handlers
  const handleSaveExpense = (expenseData: Omit<Expense, 'id'> | Expense) => {
    let nextExpenses: Expense[];
    if ('id' in expenseData) {
      nextExpenses = expenses.map((e) => (e.id === expenseData.id ? (expenseData as Expense) : e));
    } else {
      const newExp: Expense = {
        ...expenseData,
        id: `exp-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      };
      nextExpenses = [newExp, ...expenses];
    }
    setExpenses(nextExpenses);
    saveStoredExpenses(nextExpenses);
  };

  const handleDeleteExpense = (id: string) => {
    const nextExpenses = expenses.filter((e) => e.id !== id);
    setExpenses(nextExpenses);
    saveStoredExpenses(nextExpenses);
  };

  const handleDuplicateExpense = (expense: Expense) => {
    const duplicated: Expense = {
      ...expense,
      id: `exp-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      date: new Date().toISOString().split('T')[0],
      description: `${expense.description} (Copy)`,
    };
    const next = [duplicated, ...expenses];
    setExpenses(next);
    saveStoredExpenses(next);
  };

  // Budget Handlers
  const handleSaveBudgets = (newBudgets: CategoryBudgets) => {
    setBudgets(newBudgets);
    saveStoredBudgets(newBudgets);
  };

  const handleUpdateSingleBudget = (catId: CategoryId, newLimit: number) => {
    const updated = {
      ...budgets,
      [catId]: Math.max(0, newLimit),
    };
    setBudgets(updated);
    saveStoredBudgets(updated);
  };

  // Bill Reminders Handlers
  const handleSaveBill = (bill: BillReminder) => {
    const exists = bills.some((b) => b.id === bill.id);
    const updated = exists ? bills.map((b) => (b.id === bill.id ? bill : b)) : [bill, ...bills];
    setBills(updated);
    saveStoredBills(updated);
  };

  const handleDeleteBill = (id: string) => {
    const updated = bills.filter((b) => b.id !== id);
    setBills(updated);
    saveStoredBills(updated);
  };

  const handleMarkBillPaid = (billId: string, alsoLogExpense: boolean) => {
    const targetBill = bills.find((b) => b.id === billId);
    if (!targetBill) return;

    const todayStr = new Date().toISOString().split('T')[0];
    const updated = bills.map((b) =>
      b.id === billId ? { ...b, isPaid: true, lastPaidDate: todayStr } : b
    );
    setBills(updated);
    saveStoredBills(updated);

    if (alsoLogExpense) {
      const generatedExpense: Expense = {
        id: `bill-paid-${billId}-${Date.now()}`,
        amount: targetBill.amount,
        description: targetBill.title,
        category: targetBill.category,
        date: todayStr,
        payee: targetBill.payee,
        paymentMethod: targetBill.autoPay ? 'Bank Transfer' : 'Credit Card',
        notes: `Bill payment settlement (${targetBill.notes || 'Routine monthly bill'})`,
      };
      const nextExpenses = [generatedExpense, ...expenses];
      setExpenses(nextExpenses);
      saveStoredExpenses(nextExpenses);
    }
  };

  const handleMarkBillUnpaid = (billId: string) => {
    const updated = bills.map((b) => (b.id === billId ? { ...b, isPaid: false } : b));
    setBills(updated);
    saveStoredBills(updated);
  };

  // Recurring Expenses Handlers
  const handleSaveRecurringRule = (rule: RecurringExpenseRule) => {
    const exists = recurringRules.some((r) => r.id === rule.id);
    const updated = exists
      ? recurringRules.map((r) => (r.id === rule.id ? rule : r))
      : [rule, ...recurringRules];
    setRecurringRules(updated);
    saveStoredRecurringRules(updated);
  };

  const handleDeleteRecurringRule = (id: string) => {
    const updated = recurringRules.filter((r) => r.id !== id);
    setRecurringRules(updated);
    saveStoredRecurringRules(updated);
  };

  const handleToggleRecurringActive = (id: string) => {
    const updated = recurringRules.map((r) =>
      r.id === id ? { ...r, isActive: !r.isActive } : r
    );
    setRecurringRules(updated);
    saveStoredRecurringRules(updated);
  };

  const handleManualTriggerRecurring = (ruleId: string) => {
    const rule = recurringRules.find((r) => r.id === ruleId);
    if (!rule) return;

    const todayStr = new Date().toISOString().split('T')[0];
    const curMonthKey = todayStr.substring(0, 7);

    const generatedExpense: Expense = {
      id: `rec-manual-${rule.id}-${Date.now()}`,
      amount: rule.amount,
      description: rule.title,
      category: rule.category,
      date: todayStr,
      payee: rule.payee,
      paymentMethod: rule.paymentMethod,
      isRecurring: true,
      recurringRuleId: rule.id,
      notes: rule.notes
        ? `${rule.notes} (Manual Run)`
        : `Manually logged recurring expense for ${curMonthKey}`,
    };

    const nextExpenses = [generatedExpense, ...expenses];
    setExpenses(nextExpenses);
    saveStoredExpenses(nextExpenses);

    const nextRules = recurringRules.map((r) =>
      r.id === ruleId ? { ...r, lastLoggedMonth: curMonthKey } : r
    );
    setRecurringRules(nextRules);
    saveStoredRecurringRules(nextRules);

    setEngineNotificationMsg(`Logged "${rule.title}" ($${rule.amount.toFixed(2)}) to ledger.`);
  };

  const handleRunAutoLogEngine = () => {
    const today = new Date();
    const result = processRecurringExpenses(recurringRules, expenses, today);

    if (result.loggedCount > 0) {
      const mergedExpenses = [...result.newExpenses, ...expenses];
      setExpenses(mergedExpenses);
      saveStoredExpenses(mergedExpenses);

      setRecurringRules(result.updatedRules);
      saveStoredRecurringRules(result.updatedRules);

      setEngineNotificationMsg(
        `Auto-log engine processed: ${result.loggedCount} transaction(s) logged.`
      );
    } else {
      setEngineNotificationMsg('All scheduled recurring expenses for this period are already up to date.');
    }
  };

  const handleDataRestored = (
    newExpenses: Expense[],
    newBudgets: CategoryBudgets,
    newBills: BillReminder[],
    newRecurring: RecurringExpenseRule[]
  ) => {
    setExpenses(newExpenses);
    setBudgets(newBudgets);
    setBills(newBills);
    setRecurringRules(newRecurring);
    const months = getAvailableMonths(newExpenses);
    if (months.length > 0) {
      setSelectedMonth(months[0]);
    }
  };

  // Monthly Analytics Calculations
  const monthSummary = useMemo(
    () => getMonthlySummary(expenses, selectedMonth, budgets),
    [expenses, selectedMonth, budgets]
  );

  const dailySpendData = useMemo(
    () => getDailySpendingSeries(expenses, selectedMonth),
    [expenses, selectedMonth]
  );

  const categoryBreakdown = useMemo(
    () => getCategoryBreakdown(expenses, selectedMonth, budgets),
    [expenses, selectedMonth, budgets]
  );

  const monthOverMonthData = useMemo(
    () => getMonthOverMonthSeries(expenses, 6),
    [expenses]
  );

  const spendingHabitsData = useMemo(
    () => getSpendingHabits(expenses, selectedMonth),
    [expenses, selectedMonth]
  );

  const currentMonthExpenses = useMemo(
    () => expenses.filter((e) => e.date.startsWith(selectedMonth)),
    [expenses, selectedMonth]
  );

  // Alert Counter for TopBar Bell
  const alertCount = useMemo(() => {
    const evaluated = evaluateAllBills(bills);
    const urgentBillsCount = evaluated.filter(
      (b) => b.status === 'overdue' || b.status === 'due_today' || b.status === 'approaching'
    ).length;

    const budgetAlertsCount = categoryBreakdown.filter(
      (b) => b.isOverBudget || b.budgetUsedPct >= 80
    ).length;

    return urgentBillsCount + budgetAlertsCount;
  }, [bills, categoryBreakdown]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Strict 1-Row, 3-Zone Top Bar with Navigation and Notifications */}
      <TopBar
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
        }}
        onOpenAddExpense={() => {
          setEditingExpense(null);
          setIsAddExpenseOpen(true);
        }}
        onOpenBudgets={() => setIsBudgetsOpen(true)}
        onOpenBackup={() => setIsBackupOpen(true)}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        alertCount={alertCount}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Banner Alert Toast if recurring engine performed actions */}
        {engineNotificationMsg && (
          <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-xs text-indigo-200 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400 shrink-0" />
              <span>{engineNotificationMsg}</span>
            </div>
            <button
              type="button"
              onClick={() => setEngineNotificationMsg(null)}
              className="text-indigo-400 hover:text-indigo-200 font-mono text-[11px]"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Sub-header with Month Selector and Status (On overview and ledger) */}
        {(activeTab === 'overview' || activeTab === 'ledger' || activeTab === 'charts') && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-white">
                  {monthSummary.monthLabel}
                </h1>
                <span className="text-xs text-slate-500 font-mono">
                  · {monthSummary.transactionCount} transactions
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Financial summary, category breakdowns, and behavioral spending habits
              </p>
            </div>

            <div className="flex items-center gap-3">
              <MonthSelector
                selectedMonth={selectedMonth}
                availableMonths={availableMonths}
                onSelectMonth={setSelectedMonth}
              />

              <button
                type="button"
                onClick={() => setIsBudgetsOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg transition-colors"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-400" />
                <span>Adjust Caps</span>
              </button>
            </div>
          </div>
        )}

        {/* Top 4 Key Metric Cards (visible on dashboard overview) */}
        {activeTab === 'overview' && <MetricCards summary={monthSummary} />}

        {/* TAB 1: DASHBOARD OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Daily Velocity Chart */}
              <div className="lg:col-span-7">
                <DailySpendTrendChart
                  data={dailySpendData}
                  monthBudget={monthSummary.budgetTotal}
                  daysInMonth={monthSummary.daysInMonth}
                  elapsedDays={monthSummary.elapsedDays}
                />
              </div>

              {/* Month-over-Month historical bar chart */}
              <div className="lg:col-span-5">
                <MonthOverMonthBarChart
                  data={monthOverMonthData}
                  currentMonthKey={selectedMonth}
                  onSelectMonth={setSelectedMonth}
                />
              </div>
            </div>

            {/* Category Donut & Budget Utilization Section */}
            <CategoryDonutChart
              breakdown={categoryBreakdown}
              totalSpent={monthSummary.totalSpent}
              selectedCategory={selectedCategoryFilter}
              onSelectCategory={(catId) => {
                setSelectedCategoryFilter(catId);
                if (catId) setActiveTab('ledger');
              }}
            />

            {/* Recent Transactions Strip */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-semibold text-slate-100">
                    Recent Monthly Activity
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Latest transactions recorded for {monthSummary.monthLabel}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('ledger')}
                  className="flex items-center gap-1 text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
                >
                  <span>View Full Ledger</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <ExpenseTable
                expenses={currentMonthExpenses.slice(0, 8)}
                onEditExpense={(exp) => {
                  setEditingExpense(exp);
                  setIsAddExpenseOpen(true);
                }}
                onDeleteExpense={handleDeleteExpense}
                onDuplicateExpense={handleDuplicateExpense}
                onOpenAddModal={() => {
                  setEditingExpense(null);
                  setIsAddExpenseOpen(true);
                }}
                selectedCategoryFilter={selectedCategoryFilter}
                onSelectCategoryFilter={setSelectedCategoryFilter}
              />
            </div>
          </div>
        )}

        {/* TAB 2: BUDGETING & SPENDING LIMITS (Requested Feature) */}
        {activeTab === 'budget' && (
          <BudgetDashboardView
            budgets={budgets}
            breakdown={categoryBreakdown}
            totalSpent={monthSummary.totalSpent}
            monthLabel={monthSummary.monthLabel}
            onUpdateBudget={handleUpdateSingleBudget}
            onOpenBudgetModal={() => setIsBudgetsOpen(true)}
          />
        )}

        {/* TAB 3: BILL PAYMENT REMINDERS (Requested Feature) */}
        {activeTab === 'bills' && (
          <BillRemindersView
            bills={bills}
            onSaveBill={handleSaveBill}
            onDeleteBill={handleDeleteBill}
            onMarkPaid={handleMarkBillPaid}
            onMarkUnpaid={handleMarkBillUnpaid}
          />
        )}

        {/* TAB 4: RECURRING EXPENSES & AUTO-LOGGING (Requested Feature) */}
        {activeTab === 'recurring' && (
          <RecurringExpensesView
            recurringRules={recurringRules}
            onSaveRule={handleSaveRecurringRule}
            onDeleteRule={handleDeleteRecurringRule}
            onToggleActive={handleToggleRecurringActive}
            onManualTriggerLog={handleManualTriggerRecurring}
            onRunAutoLogEngine={handleRunAutoLogEngine}
            currentMonthKey={selectedMonth}
          />
        )}

        {/* TAB 5: VISUAL CHARTS & SPENDING HABITS */}
        {activeTab === 'charts' && (
          <div className="space-y-6">
            <DailySpendTrendChart
              data={dailySpendData}
              monthBudget={monthSummary.budgetTotal}
              daysInMonth={monthSummary.daysInMonth}
              elapsedDays={monthSummary.elapsedDays}
            />

            <SpendingHabitsView
              habits={spendingHabitsData}
              monthLabel={monthSummary.monthLabel}
            />

            <MonthOverMonthBarChart
              data={monthOverMonthData}
              currentMonthKey={selectedMonth}
              onSelectMonth={setSelectedMonth}
            />
          </div>
        )}

        {/* TAB 6: COMPLETE LEDGER */}
        {activeTab === 'ledger' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2">
              <div>
                <h2 className="text-base font-semibold text-slate-100">
                  Transactions Ledger ({monthSummary.monthLabel})
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Filter, search, audit, edit, and organize your expenses
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setEditingExpense(null);
                  setIsAddExpenseOpen(true);
                }}
                className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-sm transition-colors self-start sm:self-auto"
              >
                <Plus className="w-4 h-4" />
                <span>Add Transaction</span>
              </button>
            </div>

            <ExpenseTable
              expenses={currentMonthExpenses}
              onEditExpense={(exp) => {
                setEditingExpense(exp);
                setIsAddExpenseOpen(true);
              }}
              onDeleteExpense={handleDeleteExpense}
              onDuplicateExpense={handleDuplicateExpense}
              onOpenAddModal={() => {
                setEditingExpense(null);
                setIsAddExpenseOpen(true);
              }}
              selectedCategoryFilter={selectedCategoryFilter}
              onSelectCategoryFilter={setSelectedCategoryFilter}
            />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 mt-12 py-6 bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-200">SpendPulse</span>
            <span aria-hidden="true">·</span>
            <span>Budget Control, Bill Schedules & Automated Recurring Outflows</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <button
              type="button"
              onClick={() => setIsBackupOpen(true)}
              className="hover:text-slate-200 transition-colors"
            >
              Export CSV / JSON
            </button>
            <span aria-hidden="true">·</span>
            <button
              type="button"
              onClick={() => setIsBudgetsOpen(true)}
              className="hover:text-slate-200 transition-colors"
            >
              Configure Budgets
            </button>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <ExpenseFormModal
        isOpen={isAddExpenseOpen}
        onClose={() => {
          setIsAddExpenseOpen(false);
          setEditingExpense(null);
        }}
        onSave={handleSaveExpense}
        initialExpense={editingExpense}
        defaultDate={`${selectedMonth}-01`}
      />

      <BudgetManagerModal
        isOpen={isBudgetsOpen}
        onClose={() => setIsBudgetsOpen(false)}
        budgets={budgets}
        onSaveBudgets={handleSaveBudgets}
      />

      <DataBackupModal
        isOpen={isBackupOpen}
        onClose={() => setIsBackupOpen(false)}
        expenses={expenses}
        budgets={budgets}
        bills={bills}
        recurring={recurringRules}
        onDataRestored={handleDataRestored}
      />

      <NotificationCenterModal
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        bills={bills}
        breakdown={categoryBreakdown}
        budgets={budgets}
        onNavigateToTab={(tab) => {
          if (tab === 'budget') setActiveTab('budget');
          if (tab === 'bills') setActiveTab('bills');
          if (tab === 'recurring') setActiveTab('recurring');
        }}
      />
    </div>
  );
}
