import { Expense, RecurringExpenseRule } from '../types/expense';
import { getDaysInMonth } from './analytics';

export interface ProcessRecurringResult {
  newExpenses: Expense[];
  updatedRules: RecurringExpenseRule[];
  loggedCount: number;
  loggedNames: string[];
}

export function processRecurringExpenses(
  rules: RecurringExpenseRule[],
  expenses: Expense[],
  today: Date = new Date()
): ProcessRecurringResult {
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth() + 1;
  const currentDay = today.getDate();
  const currentMonthKey = `${currentYear}-${String(currentMonth).padStart(2, '0')}`;
  const daysInCurMonth = getDaysInMonth(currentYear, currentMonth - 1);

  const newlyLoggedExpenses: Expense[] = [];
  const updatedRules: RecurringExpenseRule[] = [];
  const loggedNames: string[] = [];

  for (const rule of rules) {
    if (!rule.isActive || !rule.autoLog) {
      updatedRules.push(rule);
      continue;
    }

    // Determine the scheduled day for this month
    const scheduledDay = Math.min(rule.dayOfMonth, daysInCurMonth);
    const scheduledDateStr = `${currentMonthKey}-${String(scheduledDay).padStart(2, '0')}`;

    // Has the scheduled date arrived yet this month?
    const isDue = currentDay >= scheduledDay;

    // Has it already been logged in expenses for this month?
    const alreadyLoggedExpense = expenses.some(
      (e) =>
        (e.recurringRuleId === rule.id && e.date.startsWith(currentMonthKey)) ||
        (e.isRecurring && e.description === rule.title && e.date.startsWith(currentMonthKey))
    );

    const alreadyMarkedLogged = rule.lastLoggedMonth === currentMonthKey;

    if (isDue && !alreadyLoggedExpense && !alreadyMarkedLogged) {
      const generatedExpense: Expense = {
        id: `rec-${rule.id}-${currentMonthKey}`,
        amount: rule.amount,
        description: rule.title,
        category: rule.category,
        date: scheduledDateStr,
        payee: rule.payee,
        paymentMethod: rule.paymentMethod,
        isRecurring: true,
        recurringRuleId: rule.id,
        notes: rule.notes
          ? `${rule.notes} (Scheduled Auto-Log)`
          : `Auto-logged recurring commitment for ${currentMonthKey}`,
      };

      newlyLoggedExpenses.push(generatedExpense);
      loggedNames.push(`${rule.title} ($${rule.amount.toFixed(2)})`);

      updatedRules.push({
        ...rule,
        lastLoggedMonth: currentMonthKey,
      });
    } else {
      updatedRules.push(rule);
    }
  }

  return {
    newExpenses: newlyLoggedExpenses,
    updatedRules,
    loggedCount: newlyLoggedExpenses.length,
    loggedNames,
  };
}
