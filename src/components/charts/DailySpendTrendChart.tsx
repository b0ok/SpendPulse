import React, { useState } from 'react';
import { DailySpendPoint, formatCurrency } from '../../utils/analytics';
import { TrendingUp, Calendar, Zap } from 'lucide-react';

interface Props {
  data: DailySpendPoint[];
  monthBudget: number;
  daysInMonth: number;
  elapsedDays: number;
}

export const DailySpendTrendChart: React.FC<Props> = ({
  data,
  monthBudget,
  daysInMonth,
  elapsedDays,
}) => {
  const [hoveredPoint, setHoveredPoint] = useState<DailySpendPoint | null>(null);
  const [viewMode, setViewMode] = useState<'daily' | 'cumulative'>('daily');

  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-slate-500 text-sm">
        No transaction records for this month period
      </div>
    );
  }

  // Dimensions
  const svgWidth = 800;
  const svgHeight = 260;
  const paddingLeft = 55;
  const paddingRight = 20;
  const paddingTop = 25;
  const paddingBottom = 35;
  const chartWidth = svgWidth - paddingLeft - paddingRight;
  const chartHeight = svgHeight - paddingTop - paddingBottom;

  // Max value calculation
  const maxDaily = Math.max(...data.map((d) => d.amount), 50);
  const maxCumulative = Math.max(
    ...data.map((d) => d.cumulative),
    monthBudget > 0 ? monthBudget : 100
  );

  const maxValue = viewMode === 'daily' ? maxDaily * 1.15 : maxCumulative * 1.1;

  // Coordinate mappers
  const getX = (index: number) => {
    return paddingLeft + (index / (data.length - 1)) * chartWidth;
  };

  const getY = (val: number) => {
    const clamped = Math.max(0, val);
    return paddingTop + chartHeight - (clamped / maxValue) * chartHeight;
  };

  // Generate path data
  const points = data.map((d, i) => {
    const val = viewMode === 'daily' ? d.amount : d.cumulative;
    return {
      x: getX(i),
      y: getY(val),
      point: d,
    };
  });

  // SVG Area path & Line path
  const linePath = points.reduce((acc, curr, i) => {
    return i === 0 ? `M ${curr.x} ${curr.y}` : `${acc} L ${curr.x} ${curr.y}`;
  }, '');

  const areaPath = `${linePath} L ${points[points.length - 1].x} ${
    paddingTop + chartHeight
  } L ${points[0].x} ${paddingTop + chartHeight} Z`;

  // Y-axis grid ticks (4 ticks)
  const yTicks = [0, 0.33, 0.66, 1].map((pct) => {
    const val = maxValue * pct;
    return {
      val,
      y: getY(val),
    };
  });

  // Current month budget line for cumulative view
  const budgetY = viewMode === 'cumulative' && monthBudget > 0 ? getY(monthBudget) : null;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold text-slate-100">
              Daily Spending Velocity
            </h3>
            <span className="text-xs text-slate-500 font-mono">· {daysInMonth} Days</span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            {viewMode === 'daily'
              ? 'Individual daily transaction spikes and peaks'
              : 'Cumulative expenditure progression towards monthly cap'}
          </p>
        </div>

        {/* View Toggle Segmented Control */}
        <div className="flex items-center gap-1 p-1 bg-slate-950/80 border border-slate-800 rounded-lg text-xs self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setViewMode('daily')}
            className={`px-3 py-1.5 font-medium rounded-md transition-colors ${
              viewMode === 'daily'
                ? 'bg-slate-800 text-indigo-300 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Daily Spikes
          </button>
          <button
            type="button"
            onClick={() => setViewMode('cumulative')}
            className={`px-3 py-1.5 font-medium rounded-md transition-colors ${
              viewMode === 'cumulative'
                ? 'bg-slate-800 text-indigo-300 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Cumulative Curve
          </button>
        </div>
      </div>

      {/* SVG Canvas */}
      <div className="relative w-full overflow-hidden">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-auto select-none"
          style={{ minHeight: '220px' }}
        >
          <defs>
            <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6366f1" stopOpacity="0.35" />
              <stop offset="90%" stopColor="#6366f1" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#818cf8" />
              <stop offset="100%" stopColor="#6366f1" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {yTicks.map((tick, i) => (
            <g key={i}>
              <line
                x1={paddingLeft}
                y1={tick.y}
                x2={svgWidth - paddingRight}
                y2={tick.y}
                stroke="#334155"
                strokeDasharray="3 3"
                strokeOpacity="0.4"
              />
              <text
                x={paddingLeft - 8}
                y={tick.y + 4}
                textAnchor="end"
                className="fill-slate-500 text-[10px] font-mono tabular-nums"
              >
                ${Math.round(tick.val)}
              </text>
            </g>
          ))}

          {/* Cumulative Budget limit line */}
          {budgetY !== null && budgetY >= paddingTop && budgetY <= paddingTop + chartHeight && (
            <g>
              <line
                x1={paddingLeft}
                y1={budgetY}
                x2={svgWidth - paddingRight}
                y2={budgetY}
                stroke="#f43f5e"
                strokeDasharray="4 4"
                strokeWidth="1.5"
                strokeOpacity="0.75"
              />
              <text
                x={svgWidth - paddingRight}
                y={budgetY - 5}
                textAnchor="end"
                className="fill-rose-400 text-[10px] font-medium font-mono"
              >
                Budget Cap: ${Math.round(monthBudget)}
              </text>
            </g>
          )}

          {/* Area fill */}
          <path d={areaPath} fill="url(#areaGradient)" />

          {/* Line stroke */}
          <path
            d={linePath}
            fill="none"
            stroke="url(#lineGradient)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Data interactive points & bars */}
          {points.map((pt, i) => {
            const isHovered = hoveredPoint?.day === pt.point.day;
            const hasSpend = pt.point.amount > 0;
            const isToday = pt.point.day === elapsedDays;

            return (
              <g
                key={i}
                className="cursor-pointer"
                onMouseEnter={() => setHoveredPoint(pt.point)}
                onMouseLeave={() => setHoveredPoint(null)}
              >
                {/* Hit test vertical slice */}
                <rect
                  x={pt.x - chartWidth / (data.length * 2)}
                  y={paddingTop}
                  width={chartWidth / data.length}
                  height={chartHeight}
                  fill="transparent"
                />

                {/* Vertical bar on spike in daily mode */}
                {viewMode === 'daily' && hasSpend && (
                  <line
                    x1={pt.x}
                    y1={pt.y}
                    x2={pt.x}
                    y2={paddingTop + chartHeight}
                    stroke={isHovered ? '#818cf8' : '#475569'}
                    strokeWidth={isHovered ? 2 : 1}
                    strokeOpacity={isHovered ? 0.9 : 0.4}
                  />
                )}

                {/* Point circle */}
                {(hasSpend || isHovered || isToday) && (
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r={isHovered ? 5.5 : hasSpend ? 3.5 : 2}
                    className={`transition-all duration-150 ${
                      isHovered
                        ? 'fill-indigo-300 stroke-slate-900 stroke-2'
                        : hasSpend
                        ? 'fill-indigo-500'
                        : 'fill-slate-600'
                    }`}
                  />
                )}
              </g>
            );
          })}

          {/* Active hover crosshair */}
          {hoveredPoint && (
            <line
              x1={getX(hoveredPoint.day - 1)}
              y1={paddingTop}
              x2={getX(hoveredPoint.day - 1)}
              y2={paddingTop + chartHeight}
              stroke="#6366f1"
              strokeDasharray="2 2"
              strokeWidth="1.5"
              strokeOpacity="0.6"
            />
          )}

          {/* X-axis days */}
          {[1, 5, 10, 15, 20, 25, daysInMonth].map((d) => {
            if (d > daysInMonth) return null;
            const x = getX(d - 1);
            return (
              <text
                key={d}
                x={x}
                y={svgHeight - 12}
                textAnchor="middle"
                className="fill-slate-500 text-[10px] font-mono tabular-nums"
              >
                Day {d}
              </text>
            );
          })}
        </svg>

        {/* Floating Tooltip Card */}
        {hoveredPoint && (
          <div
            className="absolute z-20 pointer-events-none bg-slate-900/95 border border-slate-700 backdrop-blur-md px-3 py-2 rounded-lg shadow-xl text-xs max-w-xs transition-opacity"
            style={{
              left: `${Math.min(
                Math.max(10, ((hoveredPoint.day - 1) / (data.length - 1)) * 100),
                80
              )}%`,
              top: '12px',
            }}
          >
            <div className="flex items-center justify-between gap-4 font-mono pb-1 border-b border-slate-800 text-slate-400">
              <span>{hoveredPoint.dateStr}</span>
              <span className="text-slate-500">Day {hoveredPoint.day}</span>
            </div>
            <div className="mt-1.5 flex items-baseline justify-between gap-4">
              <span className="text-slate-400">Day Total:</span>
              <span className="font-semibold text-slate-100 font-mono tabular-nums">
                {formatCurrency(hoveredPoint.amount)}
              </span>
            </div>
            <div className="flex items-baseline justify-between gap-4 mt-0.5">
              <span className="text-slate-400">Cumulative:</span>
              <span className="font-mono text-indigo-300 tabular-nums">
                {formatCurrency(hoveredPoint.cumulative)}
              </span>
            </div>
            {hoveredPoint.topItem && (
              <div className="mt-1.5 pt-1 border-t border-slate-800 text-[11px] text-slate-300 truncate">
                <span className="text-slate-500">Key: </span>
                {hoveredPoint.topItem}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="mt-3 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between text-xs text-slate-400 gap-2">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 inline-block"></span>
            <span>Recorded Spending</span>
          </div>
          {monthBudget > 0 && (
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-0.5 bg-rose-500 inline-block"></span>
              <span>Target Ceiling (${Math.round(monthBudget)})</span>
            </div>
          )}
        </div>
        <div className="text-slate-500 font-mono">
          {data.reduce((cnt, d) => cnt + d.transactionCount, 0)} total entries in period
        </div>
      </div>
    </div>
  );
};
