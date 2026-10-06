import React from 'react';
import { MonthOverMonthPoint, formatCurrency } from '../../utils/analytics';
import { TrendingDown, TrendingUp, Calendar } from 'lucide-react';

interface Props {
  data: MonthOverMonthPoint[];
  currentMonthKey: string;
  onSelectMonth: (monthKey: string) => void;
}

export const MonthOverMonthBarChart: React.FC<Props> = ({
  data,
  currentMonthKey,
  onSelectMonth,
}) => {
  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-slate-500 text-sm">
        Insufficient historical data for month-over-month comparison
      </div>
    );
  }

  const maxSpend = Math.max(...data.map((d) => d.totalSpent), 100);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 mb-4 border-b border-slate-800/80">
        <div>
          <h3 className="text-base font-semibold text-slate-100">
            Month-over-Month Trajectory
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Historical outflow divided by essential needs vs. discretionary wants
          </p>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5 text-slate-300">
            <span className="w-2.5 h-2.5 rounded-sm bg-sky-500 inline-block" />
            <span>Essential Needs</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-300">
            <span className="w-2.5 h-2.5 rounded-sm bg-indigo-500 inline-block" />
            <span>Discretionary</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 pt-2">
        {data.map((item, idx) => {
          const isSelected = item.monthKey === currentMonthKey;
          const heightPct = Math.max(12, Math.round((item.totalSpent / maxSpend) * 100));

          // Calculate delta from previous month in array
          const prevItem = idx > 0 ? data[idx - 1] : null;
          let diffPct: number | null = null;
          if (prevItem && prevItem.totalSpent > 0) {
            diffPct = ((item.totalSpent - prevItem.totalSpent) / prevItem.totalSpent) * 100;
          }

          const essentialRatio =
            item.totalSpent > 0 ? (item.essentialSpent / item.totalSpent) * 100 : 50;
          const discretionaryRatio = 100 - essentialRatio;

          return (
            <button
              key={item.monthKey}
              type="button"
              onClick={() => onSelectMonth(item.monthKey)}
              className={`flex flex-col items-center p-3 rounded-xl border text-center transition-all group ${
                isSelected
                  ? 'bg-slate-800/90 border-indigo-500 shadow-md ring-1 ring-indigo-500/30'
                  : 'bg-slate-950/40 border-slate-800/80 hover:bg-slate-800/40 hover:border-slate-700'
              }`}
            >
              {/* Delta badge */}
              <div className="h-5 flex items-center justify-center text-[11px] font-mono mb-2">
                {diffPct !== null ? (
                  <span
                    className={`inline-flex items-center gap-0.5 font-medium ${
                      diffPct > 0 ? 'text-rose-400' : 'text-emerald-400'
                    }`}
                  >
                    {diffPct > 0 ? (
                      <TrendingUp className="w-3 h-3" />
                    ) : (
                      <TrendingDown className="w-3 h-3" />
                    )}
                    {Math.abs(diffPct).toFixed(0)}%
                  </span>
                ) : (
                  <span className="text-slate-600 font-mono text-[10px]">baseline</span>
                )}
              </div>

              {/* Bar visualization */}
              <div className="w-full h-36 flex items-end justify-center py-1">
                <div
                  className="w-10 sm:w-12 rounded-t-lg overflow-hidden flex flex-col justify-end transition-all duration-300 shadow-sm"
                  style={{ height: `${heightPct}%` }}
                >
                  {/* Discretionary Top Segment */}
                  <div
                    className="w-full bg-indigo-500/80 transition-all"
                    style={{ height: `${discretionaryRatio}%` }}
                    title={`Discretionary: ${formatCurrency(item.discretionarySpent)}`}
                  />
                  {/* Essential Bottom Segment */}
                  <div
                    className="w-full bg-sky-500/80 transition-all"
                    style={{ height: `${essentialRatio}%` }}
                    title={`Essential: ${formatCurrency(item.essentialSpent)}`}
                  />
                </div>
              </div>

              {/* Month Label & Total */}
              <div className="mt-3 w-full border-t border-slate-800/80 pt-2">
                <div
                  className={`text-xs font-semibold ${
                    isSelected ? 'text-indigo-300' : 'text-slate-300'
                  }`}
                >
                  {item.label}
                </div>
                <div className="text-xs font-mono font-bold text-slate-100 tabular-nums mt-0.5">
                  {formatCurrency(item.totalSpent)}
                </div>
                <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                  {item.transactionCount} entries
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
