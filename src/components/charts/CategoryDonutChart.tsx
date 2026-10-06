import React, { useState } from 'react';
import { CategoryBreakdownItem, formatCurrency } from '../../utils/analytics';
import { CategoryId } from '../../types/expense';
import { AlertCircle, CheckCircle2, ChevronRight } from 'lucide-react';

interface Props {
  breakdown: CategoryBreakdownItem[];
  totalSpent: number;
  onSelectCategory?: (categoryId: CategoryId | null) => void;
  selectedCategory?: CategoryId | null;
}

export const CategoryDonutChart: React.FC<Props> = ({
  breakdown,
  totalSpent,
  onSelectCategory,
  selectedCategory,
}) => {
  const [hoveredCategory, setHoveredCategory] = useState<CategoryId | null>(null);

  const activeCategory = hoveredCategory || selectedCategory;
  const activeItem = breakdown.find((b) => b.category === activeCategory);

  // SVG Donut geometry
  const size = 260;
  const strokeWidth = 32;
  const radius = (size - strokeWidth) / 2;
  const center = size / 2;
  const circumference = 2 * Math.PI * radius;

  // Filter to items with > 0 total for donut slices
  const spentItems = breakdown.filter((b) => b.total > 0);

  // Calculate stroke dash offsets
  let accumulatedAngle = 0;
  const slices = spentItems.map((item) => {
    const fraction = totalSpent > 0 ? item.total / totalSpent : 0;
    const strokeDasharray = `${fraction * circumference} ${circumference}`;
    const strokeDashoffset = -accumulatedAngle * circumference;
    accumulatedAngle += fraction;
    return {
      item,
      strokeDasharray,
      strokeDashoffset,
    };
  });

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800/80">
        <div>
          <h3 className="text-base font-semibold text-slate-100">
            Category Spending Distribution
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Share of wallet by category vs. assigned budget caps
          </p>
        </div>
        {selectedCategory && (
          <button
            type="button"
            onClick={() => onSelectCategory && onSelectCategory(null)}
            className="text-xs text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
          >
            Clear Filter
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* SVG Donut Visual */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center">
          <div className="relative w-[240px] h-[240px] flex items-center justify-center">
            {spentItems.length === 0 ? (
              <div className="w-[200px] h-[200px] rounded-full border-4 border-dashed border-slate-800 flex items-center justify-center text-xs text-slate-500 text-center px-4">
                No recorded spending in this period
              </div>
            ) : (
              <>
                <svg
                  width={size}
                  height={size}
                  viewBox={`0 0 ${size} ${size}`}
                  className="transform -rotate-90"
                >
                  {/* Background Track */}
                  <circle
                    cx={center}
                    cy={center}
                    r={radius}
                    fill="transparent"
                    stroke="#1e293b"
                    strokeWidth={strokeWidth - 6}
                  />

                  {/* Slices */}
                  {slices.map(({ item, strokeDasharray, strokeDashoffset }) => {
                    const isHighlighted =
                      activeCategory === item.category || (!activeCategory && true);
                    const isSelected = selectedCategory === item.category;

                    return (
                      <circle
                        key={item.category}
                        cx={center}
                        cy={center}
                        r={radius}
                        fill="transparent"
                        stroke={item.color}
                        strokeWidth={
                          isSelected
                            ? strokeWidth + 6
                            : activeCategory === item.category
                            ? strokeWidth + 4
                            : strokeWidth
                        }
                        strokeDasharray={strokeDasharray}
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="butt"
                        className="transition-all duration-200 cursor-pointer"
                        style={{
                          opacity: isHighlighted ? 1 : 0.35,
                          filter: isSelected ? 'drop-shadow(0 0 6px rgba(99,102,241,0.5))' : 'none',
                        }}
                        onMouseEnter={() => setHoveredCategory(item.category)}
                        onMouseLeave={() => setHoveredCategory(null)}
                        onClick={() =>
                          onSelectCategory &&
                          onSelectCategory(
                            selectedCategory === item.category ? null : item.category
                          )
                        }
                      />
                    );
                  })}
                </svg>

                {/* Donut Center Label */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none px-6">
                  {activeItem ? (
                    <>
                      <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider truncate max-w-[150px]">
                        {activeItem.name}
                      </span>
                      <span className="text-xl font-bold text-slate-100 font-mono tabular-nums mt-0.5">
                        {formatCurrency(activeItem.total)}
                      </span>
                      <span
                        className="text-xs font-mono font-medium mt-0.5"
                        style={{ color: activeItem.color }}
                      >
                        {activeItem.percentage.toFixed(1)}% of total
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="text-[11px] text-slate-400 uppercase tracking-wider">
                        Total Outflow
                      </span>
                      <span className="text-2xl font-bold text-slate-100 font-mono tabular-nums mt-0.5">
                        {formatCurrency(totalSpent)}
                      </span>
                      <span className="text-xs text-slate-500 font-mono mt-0.5">
                        {spentItems.length} active categories
                      </span>
                    </>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Category Ranking & Budget Utilization Bars */}
        <div className="lg:col-span-7 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono pb-1 border-b border-slate-800">
            <span>Category & Budget Status</span>
            <span>Spent / Cap</span>
          </div>

          <div className="max-h-[300px] overflow-y-auto pr-1 space-y-2.5">
            {breakdown.map((item) => {
              const isSelected = selectedCategory === item.category;
              const isHovered = hoveredCategory === item.category;
              const barPercentage = Math.min(100, item.budgetUsedPct);

              return (
                <div
                  key={item.category}
                  className={`p-2.5 rounded-lg border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-slate-800/90 border-indigo-500/50 shadow-sm'
                      : isHovered
                      ? 'bg-slate-800/50 border-slate-700'
                      : 'bg-slate-950/40 border-slate-800/80 hover:bg-slate-800/30'
                  }`}
                  onMouseEnter={() => setHoveredCategory(item.category)}
                  onMouseLeave={() => setHoveredCategory(null)}
                  onClick={() =>
                    onSelectCategory &&
                    onSelectCategory(
                      selectedCategory === item.category ? null : item.category
                    )
                  }
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className="w-2.5 h-2.5 rounded-sm shrink-0"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-xs font-medium text-slate-200 truncate">
                        {item.name}
                      </span>
                      {item.isOverBudget && (
                        <span className="text-[11px] text-rose-400 flex items-center gap-0.5 font-mono">
                          <AlertCircle className="w-3 h-3" /> Over
                        </span>
                      )}
                    </div>

                    <div className="flex items-baseline gap-2 shrink-0 text-xs font-mono">
                      <span className="font-semibold text-slate-100 tabular-nums">
                        {formatCurrency(item.total)}
                      </span>
                      <span className="text-slate-500 tabular-nums">
                        / ${Math.round(item.budget)}
                      </span>
                      <span className="text-slate-400 w-12 text-right">
                        {item.percentage.toFixed(1)}%
                      </span>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        item.isOverBudget
                          ? 'bg-rose-500'
                          : item.budgetUsedPct > 85
                          ? 'bg-amber-400'
                          : 'bg-emerald-400'
                      }`}
                      style={{ width: `${barPercentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
