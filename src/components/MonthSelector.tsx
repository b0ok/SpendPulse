import React from 'react';
import { ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react';
import { getMonthLabel } from '../utils/analytics';

interface Props {
  selectedMonth: string;
  availableMonths: string[];
  onSelectMonth: (monthKey: string) => void;
}

export const MonthSelector: React.FC<Props> = ({
  selectedMonth,
  availableMonths,
  onSelectMonth,
}) => {
  const currentIndex = availableMonths.indexOf(selectedMonth);
  const hasNewer = currentIndex > 0;
  const hasOlder = currentIndex < availableMonths.length - 1 && currentIndex !== -1;

  const handlePrev = () => {
    if (hasOlder) {
      onSelectMonth(availableMonths[currentIndex + 1]);
    }
  };

  const handleNext = () => {
    if (hasNewer) {
      onSelectMonth(availableMonths[currentIndex - 1]);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5">
        <button
          type="button"
          onClick={handlePrev}
          disabled={!hasOlder}
          title="Previous Month"
          className="p-1.5 text-slate-400 hover:text-slate-100 disabled:opacity-30 disabled:hover:text-slate-400 transition-colors rounded-md"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <div className="relative flex items-center px-2">
          <CalendarDays className="w-3.5 h-3.5 text-indigo-400 mr-2 shrink-0 pointer-events-none" />
          <select
            value={selectedMonth}
            onChange={(e) => onSelectMonth(e.target.value)}
            className="bg-transparent text-xs font-semibold text-slate-100 appearance-none pr-4 pl-0 py-1 cursor-pointer focus:outline-none"
          >
            {availableMonths.map((mKey) => (
              <option key={mKey} value={mKey} className="bg-slate-900 text-slate-100">
                {getMonthLabel(mKey)}
              </option>
            ))}
          </select>
        </div>

        <button
          type="button"
          onClick={handleNext}
          disabled={!hasNewer}
          title="Next Month"
          className="p-1.5 text-slate-400 hover:text-slate-100 disabled:opacity-30 disabled:hover:text-slate-400 transition-colors rounded-md"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
