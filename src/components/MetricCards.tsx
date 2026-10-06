import React from 'react';
import { MonthSummary } from '../types/expense';
import { formatCurrency } from '../utils/analytics';
import { Wallet, Target, Clock, TrendingUp, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface Props {
  summary: MonthSummary;
}

export const MetricCards: React.FC<Props> = ({ summary }) => {
  const isOverBudget = summary.remainingBudget < 0;
  const isNearBudget = summary.budgetUtilizationPct >= 85 && !isOverBudget;

  const budgetStatusText = isOverBudget
    ? 'Cap exceeded'
    : isNearBudget
    ? 'Approaching limit'
    : 'On track';

  const budgetStatusColor = isOverBudget
    ? 'text-rose-400'
    : isNearBudget
    ? 'text-amber-400'
    : 'text-emerald-400';

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Total Outflow */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
          <span className="font-medium">Total Month Outflow</span>
          <Wallet className="w-4 h-4 text-indigo-400" />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold text-slate-100 font-mono tabular-nums">
            {formatCurrency(summary.totalSpent)}
          </span>
        </div>
        <div className="mt-2 text-xs text-slate-400 font-mono flex items-center gap-1.5">
          <span>{summary.transactionCount} entries recorded</span>
          <span aria-hidden="true">·</span>
          <span>{summary.elapsedDays} of {summary.daysInMonth} days</span>
        </div>
      </div>

      {/* 2. Budget Buffer */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
          <span className="font-medium">Remaining Budget Pool</span>
          <Target className="w-4 h-4 text-sky-400" />
        </div>
        <div className="flex items-baseline gap-2">
          <span
            className={`text-2xl font-bold font-mono tabular-nums ${
              isOverBudget ? 'text-rose-400' : 'text-slate-100'
            }`}
          >
            {formatCurrency(Math.abs(summary.remainingBudget))}
          </span>
          {isOverBudget && <span className="text-xs text-rose-400 font-medium">deficit</span>}
        </div>
        <div className="mt-2 text-xs text-slate-400 font-mono flex items-center gap-1.5">
          <span className={budgetStatusColor}>{budgetStatusText}</span>
          <span aria-hidden="true">·</span>
          <span>{summary.budgetUtilizationPct.toFixed(0)}% utilized</span>
        </div>
      </div>

      {/* 3. Daily Velocity */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
          <span className="font-medium">Daily Outflow Velocity</span>
          <Clock className="w-4 h-4 text-amber-400" />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold text-slate-100 font-mono tabular-nums">
            {formatCurrency(summary.averagePerDay)}
          </span>
          <span className="text-xs text-slate-400">/ day</span>
        </div>
        <div className="mt-2 text-xs text-slate-400 font-mono flex items-center gap-1.5">
          <span>Target: {formatCurrency(summary.budgetTotal / summary.daysInMonth)}/day</span>
        </div>
      </div>

      {/* 4. Projected Month-End */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
          <span className="font-medium">Projected Month-End</span>
          <TrendingUp className="w-4 h-4 text-purple-400" />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold text-slate-100 font-mono tabular-nums">
            {formatCurrency(summary.projectedMonthEnd)}
          </span>
        </div>
        <div className="mt-2 text-xs text-slate-400 font-mono flex items-center gap-1.5">
          <span>Cap: {formatCurrency(summary.budgetTotal)}</span>
          <span aria-hidden="true">·</span>
          <span
            className={
              summary.projectedMonthEnd > summary.budgetTotal ? 'text-rose-400' : 'text-emerald-400'
            }
          >
            {summary.projectedMonthEnd > summary.budgetTotal ? 'Over pace' : 'Within target'}
          </span>
        </div>
      </div>
    </div>
  );
};
