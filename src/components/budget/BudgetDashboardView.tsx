import React, { useState } from 'react';
import { CategoryBudgets, CategoryId } from '../../types/expense';
import { CATEGORIES, CATEGORY_LIST } from '../../data/categories';
import { formatCurrency, CategoryBreakdownItem } from '../../utils/analytics';
import {
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  Sliders,
  Sparkles,
  ArrowUpRight,
  TrendingUp,
  RotateCcw,
  Plus,
  Filter,
} from 'lucide-react';

interface Props {
  budgets: CategoryBudgets;
  breakdown: CategoryBreakdownItem[];
  totalSpent: number;
  monthLabel: string;
  onUpdateBudget: (categoryId: CategoryId, newLimit: number) => void;
  onOpenBudgetModal: () => void;
}

export const BudgetDashboardView: React.FC<Props> = ({
  budgets,
  breakdown,
  totalSpent,
  monthLabel,
  onUpdateBudget,
  onOpenBudgetModal,
}) => {
  const [filterMode, setFilterMode] = useState<'all' | 'alert' | 'approaching' | 'healthy'>('all');
  const [editingCatId, setEditingCatId] = useState<CategoryId | null>(null);
  const [editLimitVal, setEditLimitVal] = useState<string>('');

  const totalBudget = Object.values(budgets).reduce((sum, b) => sum + b, 0);
  const totalRemaining = totalBudget - totalSpent;
  const overallUsedPct = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

  // Categorize items
  const enrichedCategories = CATEGORY_LIST.map((cat) => {
    const breakdownItem = breakdown.find((b) => b.category === cat.id);
    const spent = breakdownItem ? breakdownItem.total : 0;
    const limit = budgets[cat.id] ?? cat.defaultBudget;
    const usedPct = limit > 0 ? (spent / limit) * 100 : 0;
    const remaining = limit - spent;

    let alertStatus: 'healthy' | 'approaching' | 'exceeded' = 'healthy';
    if (spent > limit) {
      alertStatus = 'exceeded';
    } else if (usedPct >= 80) {
      alertStatus = 'approaching';
    }

    return {
      cat,
      spent,
      limit,
      usedPct,
      remaining,
      alertStatus,
      transactionCount: breakdownItem ? breakdownItem.count : 0,
    };
  });

  const exceededCount = enrichedCategories.filter((c) => c.alertStatus === 'exceeded').length;
  const approachingCount = enrichedCategories.filter((c) => c.alertStatus === 'approaching').length;
  const healthyCount = enrichedCategories.filter((c) => c.alertStatus === 'healthy').length;

  const filteredCategories = enrichedCategories.filter((item) => {
    if (filterMode === 'alert') return item.alertStatus === 'exceeded';
    if (filterMode === 'approaching') return item.alertStatus === 'approaching';
    if (filterMode === 'healthy') return item.alertStatus === 'healthy';
    return true;
  });

  const startInlineEdit = (catId: CategoryId, currentLimit: number) => {
    setEditingCatId(catId);
    setEditLimitVal(currentLimit.toString());
  };

  const saveInlineEdit = (catId: CategoryId) => {
    const val = parseFloat(editLimitVal);
    if (!isNaN(val) && val >= 0) {
      onUpdateBudget(catId, val);
    }
    setEditingCatId(null);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Global Budget Health */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800/80">
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-lg font-bold text-slate-100">
                Monthly Spending Budgets ({monthLabel})
              </h2>
              {exceededCount > 0 ? (
                <span className="inline-flex items-center gap-1 text-xs font-mono text-rose-400 font-semibold bg-rose-500/10 px-2.5 py-0.5 rounded-full border border-rose-500/20">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {exceededCount} Over Limit
                </span>
              ) : approachingCount > 0 ? (
                <span className="inline-flex items-center gap-1 text-xs font-mono text-amber-400 font-semibold bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  {approachingCount} Approaching Limit
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-xs font-mono text-emerald-400 font-semibold bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  All Targets Healthy
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Configure spending limits per category. Visual indicators trigger when reaching 80% (approaching) or 100% (exceeded).
            </p>
          </div>

          <button
            type="button"
            onClick={onOpenBudgetModal}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors shrink-0 self-start md:self-auto"
          >
            <Sliders className="w-3.5 h-3.5 text-indigo-400" />
            <span>Adjust All Limits</span>
          </button>
        </div>

        {/* Global Progress Bar with Multi-Segment & Key Stats */}
        <div className="pt-6 grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
          <div>
            <span className="text-xs text-slate-400 font-medium">Total Monthly Cap</span>
            <div className="text-2xl font-bold font-mono text-slate-100 tabular-nums mt-0.5">
              {formatCurrency(totalBudget)}
            </div>
            <span className="text-[11px] text-slate-500 font-mono">Combined limit across categories</span>
          </div>

          <div>
            <span className="text-xs text-slate-400 font-medium">Expenditure Outflow</span>
            <div className="text-2xl font-bold font-mono text-slate-100 tabular-nums mt-0.5">
              {formatCurrency(totalSpent)}
            </div>
            <span className="text-[11px] text-slate-500 font-mono">
              {overallUsedPct.toFixed(1)}% of total pool utilized
            </span>
          </div>

          <div>
            <span className="text-xs text-slate-400 font-medium">Remaining Cushion</span>
            <div
              className={`text-2xl font-bold font-mono tabular-nums mt-0.5 ${
                totalRemaining < 0 ? 'text-rose-400' : 'text-emerald-400'
              }`}
            >
              {formatCurrency(Math.abs(totalRemaining))}
              {totalRemaining < 0 && <span className="text-xs font-sans font-normal ml-1">overrun</span>}
            </div>
            <span className="text-[11px] text-slate-500 font-mono">
              {totalRemaining < 0 ? 'Exceeded available budget' : 'Available buffer for remainder'}
            </span>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-mono text-slate-400">
              <span>Overall Utilization</span>
              <span className="font-semibold text-slate-200">{overallUsedPct.toFixed(0)}%</span>
            </div>
            <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-800">
              <div
                className={`h-full transition-all duration-300 rounded-full ${
                  totalRemaining < 0
                    ? 'bg-rose-500'
                    : overallUsedPct > 80
                    ? 'bg-amber-400'
                    : 'bg-indigo-500'
                }`}
                style={{ width: `${Math.min(100, overallUsedPct)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs for Categories */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 p-1 bg-slate-900 border border-slate-800 rounded-xl text-xs">
          <button
            type="button"
            onClick={() => setFilterMode('all')}
            className={`px-3 py-1.5 font-medium rounded-lg transition-colors ${
              filterMode === 'all'
                ? 'bg-slate-800 text-slate-100 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All Categories ({enrichedCategories.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterMode('alert')}
            className={`px-3 py-1.5 font-medium rounded-lg transition-colors flex items-center gap-1.5 ${
              filterMode === 'alert'
                ? 'bg-rose-500/20 text-rose-300 shadow-sm border border-rose-500/30'
                : 'text-slate-400 hover:text-rose-400'
            }`}
          >
            <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
            <span>Exceeded ({exceededCount})</span>
          </button>
          <button
            type="button"
            onClick={() => setFilterMode('approaching')}
            className={`px-3 py-1.5 font-medium rounded-lg transition-colors flex items-center gap-1.5 ${
              filterMode === 'approaching'
                ? 'bg-amber-500/20 text-amber-300 shadow-sm border border-amber-500/30'
                : 'text-slate-400 hover:text-amber-400'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            <span>Approaching 80%+ ({approachingCount})</span>
          </button>
          <button
            type="button"
            onClick={() => setFilterMode('healthy')}
            className={`px-3 py-1.5 font-medium rounded-lg transition-colors flex items-center gap-1.5 ${
              filterMode === 'healthy'
                ? 'bg-emerald-500/20 text-emerald-300 shadow-sm border border-emerald-500/30'
                : 'text-slate-400 hover:text-emerald-400'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Healthy ({healthyCount})</span>
          </button>
        </div>

        <div className="text-xs text-slate-500 font-mono">
          Click any limit to edit inline
        </div>
      </div>

      {/* Category Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCategories.map(({ cat, spent, limit, usedPct, remaining, alertStatus, transactionCount }) => {
          const isEditing = editingCatId === cat.id;

          return (
            <div
              key={cat.id}
              className={`bg-slate-900 rounded-xl border p-4 transition-all duration-200 ${
                alertStatus === 'exceeded'
                  ? 'border-rose-500/40 shadow-sm shadow-rose-950/20 ring-1 ring-rose-500/20'
                  : alertStatus === 'approaching'
                  ? 'border-amber-500/40 shadow-sm shadow-amber-950/20 ring-1 ring-amber-500/20'
                  : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              {/* Header with Visual Status Indicator */}
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <span
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ backgroundColor: cat.color }}
                  />
                  <div className="min-w-0">
                    <h3 className="text-sm font-semibold text-slate-100 truncate">
                      {cat.name}
                    </h3>
                    <div className="text-[11px] text-slate-400 capitalize">
                      {cat.classification.replace('_', ' ')} · {transactionCount} txns
                    </div>
                  </div>
                </div>

                {/* Visual Status Indicator Tag */}
                {alertStatus === 'exceeded' && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-mono font-semibold text-rose-300 bg-rose-500/20 border border-rose-500/30 rounded-md shrink-0">
                    <AlertCircle className="w-3 h-3 text-rose-400" />
                    Exceeded
                  </span>
                )}
                {alertStatus === 'approaching' && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-mono font-semibold text-amber-300 bg-amber-500/20 border border-amber-500/30 rounded-md shrink-0">
                    <AlertTriangle className="w-3 h-3 text-amber-400" />
                    Approaching
                  </span>
                )}
                {alertStatus === 'healthy' && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-mono font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-md shrink-0">
                    <CheckCircle2 className="w-3 h-3" />
                    On Track
                  </span>
                )}
              </div>

              {/* Amounts and Inline Limit Configuration */}
              <div className="space-y-1 mb-3 pt-1">
                <div className="flex items-baseline justify-between">
                  <span className="text-xs text-slate-400">Spent:</span>
                  <span className="text-lg font-bold font-mono text-slate-100 tabular-nums">
                    {formatCurrency(spent)}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Monthly Limit:</span>
                  {isEditing ? (
                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-500 font-mono">$</span>
                      <input
                        type="number"
                        step="10"
                        min="0"
                        value={editLimitVal}
                        onChange={(e) => setEditLimitVal(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') saveInlineEdit(cat.id);
                          if (e.key === 'Escape') setEditingCatId(null);
                        }}
                        autoFocus
                        className="w-20 bg-slate-950 border border-indigo-500 rounded px-1.5 py-0.5 text-xs font-mono text-slate-100 text-right focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => saveInlineEdit(cat.id)}
                        className="text-[11px] text-indigo-400 hover:text-indigo-300 font-semibold font-mono"
                      >
                        Set
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => startInlineEdit(cat.id, limit)}
                      className="font-mono text-slate-300 hover:text-indigo-300 underline decoration-dotted underline-offset-2 transition-colors cursor-pointer"
                      title="Click to change limit"
                    >
                      ${Math.round(limit)}
                    </button>
                  )}
                </div>

                <div className="flex items-baseline justify-between text-xs font-mono pt-1">
                  <span className="text-slate-400">
                    {alertStatus === 'exceeded' ? 'Deficit:' : 'Remaining:'}
                  </span>
                  <span
                    className={`font-semibold tabular-nums ${
                      alertStatus === 'exceeded'
                        ? 'text-rose-400'
                        : alertStatus === 'approaching'
                        ? 'text-amber-400'
                        : 'text-emerald-400'
                    }`}
                  >
                    {alertStatus === 'exceeded'
                      ? `+${formatCurrency(Math.abs(remaining))} over`
                      : `${formatCurrency(remaining)} left`}
                  </span>
                </div>
              </div>

              {/* Progress Gauge Bar with Threshold Indicators */}
              <div className="space-y-1">
                <div className="relative w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-800">
                  {/* 80% Threshold Marker */}
                  <div
                    className="absolute top-0 bottom-0 w-0.5 bg-slate-700 z-10"
                    style={{ left: '80%' }}
                    title="80% Caution Threshold"
                  />
                  {/* Gauge fill */}
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      alertStatus === 'exceeded'
                        ? 'bg-rose-500'
                        : alertStatus === 'approaching'
                        ? 'bg-amber-400'
                        : 'bg-emerald-400'
                    }`}
                    style={{ width: `${Math.min(100, usedPct)}%` }}
                  />
                </div>

                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>{usedPct.toFixed(0)}% used</span>
                  <span>Cap: ${Math.round(limit)}</span>
                </div>
              </div>

              {/* Specific Warning Callout if Over or Approaching */}
              {alertStatus === 'exceeded' && (
                <div className="mt-3 p-2 bg-rose-500/10 border border-rose-500/20 rounded-lg text-[11px] text-rose-300 flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0 text-rose-400" />
                  <span>
                    Spending exceeded by {formatCurrency(Math.abs(remaining))}. Consider trimming or increasing limit.
                  </span>
                </div>
              )}
              {alertStatus === 'approaching' && (
                <div className="mt-3 p-2 bg-amber-500/10 border border-amber-500/20 rounded-lg text-[11px] text-amber-300 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-amber-400" />
                  <span>
                    Nearing monthly cap with only {formatCurrency(remaining)} remaining buffer.
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
