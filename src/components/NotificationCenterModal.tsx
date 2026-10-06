import React from 'react';
import { BillReminder, CategoryBudgets } from '../types/expense';
import { CATEGORIES } from '../data/categories';
import { evaluateAllBills } from '../utils/billReminders';
import { CategoryBreakdownItem, formatCurrency } from '../utils/analytics';
import {
  X,
  Bell,
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Repeat,
  ArrowRight,
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  bills: BillReminder[];
  breakdown: CategoryBreakdownItem[];
  budgets: CategoryBudgets;
  onNavigateToTab: (tab: 'budget' | 'bills' | 'recurring') => void;
}

export const NotificationCenterModal: React.FC<Props> = ({
  isOpen,
  onClose,
  bills,
  breakdown,
  budgets,
  onNavigateToTab,
}) => {
  if (!isOpen) return null;

  const evaluatedBills = evaluateAllBills(bills);
  const urgentBills = evaluatedBills.filter(
    (b) => b.status === 'overdue' || b.status === 'due_today' || b.status === 'approaching'
  );

  const budgetAlerts = breakdown
    .map((item) => {
      const limit = budgets[item.category] || item.budget;
      const usedPct = limit > 0 ? (item.total / limit) * 100 : 0;
      const isOver = item.total > limit;
      const isApproaching = usedPct >= 80 && !isOver;

      return {
        item,
        limit,
        usedPct,
        isOver,
        isApproaching,
      };
    })
    .filter((b) => b.isOver || b.isApproaching);

  const totalAlertCount = urgentBills.length + budgetAlerts.length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden my-8">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-indigo-400" />
            <h2 className="text-base font-semibold text-slate-100">
              Alerts & Notifications ({totalAlertCount})
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-100 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 max-h-[480px] overflow-y-auto space-y-4">
          {totalAlertCount === 0 ? (
            <div className="py-8 text-center text-slate-500">
              <CheckCircle2 className="w-10 h-10 text-emerald-400/80 mx-auto mb-2" />
              <p className="text-sm font-medium text-slate-300">All Systems On Track</p>
              <p className="text-xs text-slate-500 mt-1">
                No bills due within warning windows, and all category spending is below 80% of limits.
              </p>
            </div>
          ) : (
            <>
              {/* Bill Reminders Section */}
              {urgentBills.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                      Upcoming & Overdue Bills ({urgentBills.length})
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onNavigateToTab('bills');
                      }}
                      className="text-indigo-400 hover:text-indigo-300 flex items-center gap-0.5"
                    >
                      <span>Manage Bills</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>

                  <div className="space-y-2">
                    {urgentBills.map(({ bill, status, daysRemaining, formattedDueDate }) => (
                      <div
                        key={bill.id}
                        className={`p-3 rounded-xl border text-xs flex items-center justify-between gap-3 ${
                          status === 'overdue'
                            ? 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                            : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                        }`}
                      >
                        <div className="min-w-0">
                          <div className="font-semibold text-slate-100 truncate">
                            {bill.title}
                          </div>
                          <div className="text-[11px] text-slate-400 mt-0.5 font-mono">
                            {status === 'overdue'
                              ? `Overdue by ${Math.abs(daysRemaining)} days (${formattedDueDate})`
                              : status === 'due_today'
                              ? `Due Today (${formattedDueDate})`
                              : `Due in ${daysRemaining} days (${formattedDueDate})`}
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <div className="font-mono font-bold text-slate-100 tabular-nums">
                            {formatCurrency(bill.amount)}
                          </div>
                          <span
                            className={`text-[10px] font-mono uppercase font-semibold ${
                              status === 'overdue' ? 'text-rose-400' : 'text-amber-400'
                            }`}
                          >
                            {status === 'overdue' ? 'Overdue' : 'Due Soon'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Category Budget Alerts Section */}
              {budgetAlerts.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-slate-800">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
                    <span className="flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                      Category Budget Thresholds ({budgetAlerts.length})
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onNavigateToTab('budget');
                      }}
                      className="text-indigo-400 hover:text-indigo-300 flex items-center gap-0.5"
                    >
                      <span>Adjust Budgets</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>

                  <div className="space-y-2">
                    {budgetAlerts.map(({ item, limit, usedPct, isOver }) => (
                      <div
                        key={item.category}
                        className={`p-3 rounded-xl border text-xs flex items-center justify-between gap-3 ${
                          isOver
                            ? 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                            : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                        }`}
                      >
                        <div className="min-w-0">
                          <div className="font-semibold text-slate-100 truncate">
                            {item.name}
                          </div>
                          <div className="text-[11px] text-slate-400 mt-0.5 font-mono">
                            {isOver
                              ? `Exceeded limit of ${formatCurrency(limit)} by +${formatCurrency(
                                  item.total - limit
                                )}`
                              : `Utilized ${usedPct.toFixed(0)}% of ${formatCurrency(limit)} cap`}
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <div className="font-mono font-bold text-slate-100 tabular-nums">
                            {formatCurrency(item.total)}
                          </div>
                          <span
                            className={`text-[10px] font-mono uppercase font-semibold ${
                              isOver ? 'text-rose-400' : 'text-amber-400'
                            }`}
                          >
                            {isOver ? 'Exceeded' : 'Approaching'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        <div className="px-6 py-3 bg-slate-950/60 border-t border-slate-800 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-slate-300 hover:text-white"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
