import React, { useState } from 'react';
import { CategoryBudgets, CategoryId } from '../types/expense';
import { CATEGORY_LIST, DEFAULT_BUDGETS } from '../data/categories';
import { formatCurrency } from '../utils/analytics';
import { X, Sliders, RotateCcw, Check } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  budgets: CategoryBudgets;
  onSaveBudgets: (newBudgets: CategoryBudgets) => void;
}

export const BudgetManagerModal: React.FC<Props> = ({
  isOpen,
  onClose,
  budgets,
  onSaveBudgets,
}) => {
  const [currentBudgets, setCurrentBudgets] = useState<CategoryBudgets>(budgets);

  React.useEffect(() => {
    setCurrentBudgets(budgets);
  }, [budgets, isOpen]);

  if (!isOpen) return null;

  const handleBudgetChange = (catId: CategoryId, valueStr: string) => {
    const val = parseFloat(valueStr) || 0;
    setCurrentBudgets((prev) => ({
      ...prev,
      [catId]: Math.max(0, val),
    }));
  };

  const handleResetDefaults = () => {
    setCurrentBudgets(DEFAULT_BUDGETS);
  };

  const totalMonthlyBudget = Object.values(currentBudgets).reduce((sum, b) => sum + b, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveBudgets(currentBudgets);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden my-8">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <div>
            <h2 className="text-base font-semibold text-slate-100 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-indigo-400" />
              Category Budget Targets
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Set monthly spending thresholds to monitor pace and prevent overruns
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-100 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Total Overview strip */}
        <div className="px-6 py-3 bg-slate-950/60 border-b border-slate-800/80 flex items-center justify-between">
          <span className="text-xs text-slate-400">Total Monthly Expenditure Ceiling:</span>
          <span className="text-sm font-bold font-mono text-indigo-300 tabular-nums">
            {formatCurrency(totalMonthlyBudget)}
          </span>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="max-h-[380px] overflow-y-auto pr-1 space-y-3">
            {CATEGORY_LIST.map((cat) => (
              <div
                key={cat.id}
                className="flex items-center justify-between gap-4 p-2.5 bg-slate-950/40 border border-slate-800/80 rounded-lg"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: cat.color }}
                  />
                  <div className="min-w-0">
                    <div className="text-xs font-medium text-slate-200 truncate">
                      {cat.name}
                    </div>
                    <div className="text-[10px] text-slate-500 capitalize">
                      {cat.classification.replace('_', ' ')}
                    </div>
                  </div>
                </div>

                <div className="relative w-32 shrink-0">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500 text-xs font-mono">
                    $
                  </span>
                  <input
                    type="number"
                    step="10"
                    min="0"
                    value={currentBudgets[cat.id] ?? cat.defaultBudget}
                    onChange={(e) => handleBudgetChange(cat.id, e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-6 pr-2 py-1.5 text-xs font-mono text-slate-100 text-right focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between gap-3 pt-5 mt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={handleResetDefaults}
              className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Defaults</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Save Targets</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
