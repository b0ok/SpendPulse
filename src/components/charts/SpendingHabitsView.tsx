import React from 'react';
import { SpendingHabitsData, formatCurrency } from '../../utils/analytics';
import {
  Calendar,
  CreditCard,
  PieChart,
  Store,
  Flame,
  ArrowUpRight,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

interface Props {
  habits: SpendingHabitsData;
  monthLabel: string;
}

export const SpendingHabitsView: React.FC<Props> = ({ habits, monthLabel }) => {
  const maxDayAvg = Math.max(...habits.dayOfWeekAverages.map((d) => d.average), 1);

  // Check 50/30 rule alignment
  const needsStatus =
    habits.needsPercentage <= 50
      ? 'Optimal (Within 50% limit)'
      : habits.needsPercentage <= 65
      ? 'Moderate (Slightly elevated)'
      : 'Heavy (Fixed overhead is high)';

  const wantsStatus =
    habits.wantsPercentage <= 30
      ? 'Disciplined (Under 30%)'
      : habits.wantsPercentage <= 45
      ? 'Elevated Discretionary'
      : 'High Discretionary Spending';

  const weekendMultiplier =
    habits.weekdayAvgPerDay > 0
      ? (habits.weekendAvgPerDay / habits.weekdayAvgPerDay).toFixed(1)
      : '1.0';

  return (
    <div className="space-y-6">
      {/* Habit Metrics Banner Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Weekend vs Weekday Dynamic */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="font-medium text-slate-300">Weekend vs. Weekday Bias</span>
            <Calendar className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-100 font-mono tabular-nums">
              {weekendMultiplier}x
            </span>
            <span className="text-xs text-slate-400">weekend spend intensity</span>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-800/80 space-y-2 text-xs">
            <div className="flex justify-between items-center text-slate-400">
              <span>Sat & Sun Avg / Day:</span>
              <span className="font-mono font-semibold text-slate-200 tabular-nums">
                {formatCurrency(habits.weekendAvgPerDay)}
              </span>
            </div>
            <div className="flex justify-between items-center text-slate-400">
              <span>Mon - Fri Avg / Day:</span>
              <span className="font-mono text-slate-300 tabular-nums">
                {formatCurrency(habits.weekdayAvgPerDay)}
              </span>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-1 flex">
              <div
                className="bg-indigo-500 h-full"
                style={{ width: `${100 - habits.weekendVsWeekdayPct}%` }}
                title="Weekday share"
              />
              <div
                className="bg-purple-500 h-full"
                style={{ width: `${habits.weekendVsWeekdayPct}%` }}
                title="Weekend share"
              />
            </div>
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>Weekday: {(100 - habits.weekendVsWeekdayPct).toFixed(0)}%</span>
              <span>Weekend: {habits.weekendVsWeekdayPct.toFixed(0)}%</span>
            </div>
          </div>
        </div>

        {/* Card 2: Essential (Needs) vs Discretionary (Wants) 50/30 Model */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="font-medium text-slate-300">50/30 Budget Habit Index</span>
            <PieChart className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-100 font-mono tabular-nums">
              {habits.needsPercentage.toFixed(0)}% / {habits.wantsPercentage.toFixed(0)}%
            </span>
            <span className="text-xs text-slate-400">Needs vs Wants</span>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-800/80 space-y-2 text-xs">
            <div className="flex justify-between items-center text-slate-400">
              <span>Essential (Housing, Groceries, Transit):</span>
              <span className="font-mono font-semibold text-sky-300 tabular-nums">
                {formatCurrency(habits.needsTotal)}
              </span>
            </div>
            <div className="flex justify-between items-center text-slate-400">
              <span>Discretionary (Dining, Leisure, Shopping):</span>
              <span className="font-mono text-indigo-300 tabular-nums">
                {formatCurrency(habits.wantsTotal)}
              </span>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-1 flex">
              <div
                className="bg-sky-400 h-full"
                style={{ width: `${habits.needsPercentage}%` }}
              />
              <div
                className="bg-indigo-400 h-full"
                style={{ width: `${habits.wantsPercentage}%` }}
              />
            </div>
            <div className="text-[11px] text-slate-400 italic">
              {needsStatus}
            </div>
          </div>
        </div>

        {/* Card 3: Ticket Size & Outlier Day */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="font-medium text-slate-300">Transaction Dynamics</span>
            <CreditCard className="w-4 h-4 text-amber-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-100 font-mono tabular-nums">
              {formatCurrency(habits.avgTransactionSize)}
            </span>
            <span className="text-xs text-slate-400">avg. ticket size</span>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-800/80 space-y-2 text-xs">
            {habits.highestDay ? (
              <>
                <div className="flex justify-between items-center text-slate-400">
                  <span>Peak Single Day Spend:</span>
                  <span className="font-mono font-semibold text-rose-300 tabular-nums">
                    {formatCurrency(habits.highestDay.amount)}
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 truncate font-mono">
                  {habits.highestDay.date} · {habits.highestDay.description}
                </div>
              </>
            ) : (
              <div className="text-slate-500">No outlier entries found</div>
            )}
            <div className="pt-1 text-[11px] text-emerald-400/90 flex items-center gap-1 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
              <span>Routine spending cadence monitored</span>
            </div>
          </div>
        </div>
      </div>

      {/* Day-of-Week Rhythm Bar & Top Merchants */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Day-of-week cadence */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="pb-3 mb-4 border-b border-slate-800/80">
            <h3 className="text-base font-semibold text-slate-100">
              Weekly Spending Rhythm (Day-by-Day Pattern)
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Average daily expenditure calculated for each day of the week in {monthLabel}
            </p>
          </div>

          <div className="grid grid-cols-7 gap-2 pt-2">
            {habits.dayOfWeekAverages.map((day) => {
              const heightPct = Math.max(8, Math.round((day.average / maxDayAvg) * 100));
              const isWeekend = day.shortName === 'Sat' || day.shortName === 'Sun';

              return (
                <div key={day.shortName} className="flex flex-col items-center">
                  <div className="h-44 w-full flex items-end justify-center py-1">
                    <div
                      className={`w-full max-w-[36px] rounded-t-md transition-all duration-300 flex flex-col justify-end ${
                        isWeekend
                          ? 'bg-purple-500/80 hover:bg-purple-400'
                          : 'bg-indigo-500/70 hover:bg-indigo-400'
                      }`}
                      style={{ height: `${heightPct}%` }}
                      title={`${day.dayName}: Average ${formatCurrency(day.average)} across ${day.count} occurrences`}
                    />
                  </div>

                  <div className="w-full text-center mt-2 pt-2 border-t border-slate-800/80">
                    <div
                      className={`text-xs font-semibold ${
                        isWeekend ? 'text-purple-300' : 'text-slate-300'
                      }`}
                    >
                      {day.shortName}
                    </div>
                    <div className="text-[11px] font-mono font-medium text-slate-200 tabular-nums mt-0.5">
                      ${Math.round(day.average)}
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono">
                      {day.count} txns
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-indigo-500/80 inline-block" />
              <span>Weekday Workflows (Mon–Fri)</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-purple-500/80 inline-block" />
              <span>Weekend Surges (Sat–Sun)</span>
            </span>
          </div>
        </div>

        {/* Top Merchants Leaderboard */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="pb-3 mb-4 border-b border-slate-800/80">
            <div className="flex items-center gap-2">
              <Store className="w-4 h-4 text-indigo-400" />
              <h3 className="text-base font-semibold text-slate-100">
                Top Merchant Destinations
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Where your money is concentrated most heavily
            </p>
          </div>

          {habits.topMerchants.length === 0 ? (
            <div className="h-44 flex items-center justify-center text-xs text-slate-500">
              No merchant data recorded
            </div>
          ) : (
            <div className="space-y-3">
              {habits.topMerchants.map((merchant, index) => (
                <div
                  key={merchant.name}
                  className="bg-slate-950/50 border border-slate-800/80 p-2.5 rounded-lg flex items-center justify-between"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-5 text-center text-xs font-mono font-semibold text-slate-500">
                      0{index + 1}
                    </span>
                    <div className="min-w-0">
                      <div className="text-xs font-medium text-slate-200 truncate">
                        {merchant.name}
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono">
                        {merchant.count} transaction{merchant.count === 1 ? '' : 's'} · {merchant.percentage.toFixed(1)}% of total
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-xs font-bold font-mono text-slate-100 tabular-nums">
                      {formatCurrency(merchant.total)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
