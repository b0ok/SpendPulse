import React from 'react';
import { Plus, Download, SlidersHorizontal, Bell, RefreshCw } from 'lucide-react';

export type ActiveTab =
  | 'overview'
  | 'budget'
  | 'bills'
  | 'recurring'
  | 'charts'
  | 'habits'
  | 'ledger';

interface Props {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  onOpenAddExpense: () => void;
  onOpenBudgets: () => void;
  onOpenBackup: () => void;
  onOpenNotifications: () => void;
  alertCount: number;
}

export const TopBar: React.FC<Props> = ({
  activeTab,
  onTabChange,
  onOpenAddExpense,
  onOpenBudgets,
  onOpenBackup,
  onOpenNotifications,
  alertCount,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-slate-950/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Zone 1: Brand Wordmark (Single text element) */}
        <button
          type="button"
          onClick={() => onTabChange('overview')}
          className="text-lg font-bold tracking-tight text-slate-100 hover:text-white transition-colors text-left shrink-0"
        >
          SpendPulse
        </button>

        {/* Zone 2: Clean Navigation Links */}
        <nav className="hidden md:flex items-center gap-5 text-sm font-medium">
          <button
            type="button"
            onClick={() => onTabChange('overview')}
            className={`whitespace-nowrap transition-colors py-1 ${
              activeTab === 'overview'
                ? 'text-indigo-400 border-b-2 border-indigo-500 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Dashboard
          </button>
          <button
            type="button"
            onClick={() => onTabChange('budget')}
            className={`whitespace-nowrap transition-colors py-1 ${
              activeTab === 'budget'
                ? 'text-indigo-400 border-b-2 border-indigo-500 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Budgets
          </button>
          <button
            type="button"
            onClick={() => onTabChange('bills')}
            className={`whitespace-nowrap transition-colors py-1 ${
              activeTab === 'bills'
                ? 'text-indigo-400 border-b-2 border-indigo-500 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Bill Reminders
          </button>
          <button
            type="button"
            onClick={() => onTabChange('recurring')}
            className={`whitespace-nowrap transition-colors py-1 ${
              activeTab === 'recurring'
                ? 'text-indigo-400 border-b-2 border-indigo-500 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Recurring
          </button>
          <button
            type="button"
            onClick={() => onTabChange('charts')}
            className={`whitespace-nowrap transition-colors py-1 ${
              activeTab === 'charts'
                ? 'text-indigo-400 border-b-2 border-indigo-500 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Analytics
          </button>
          <button
            type="button"
            onClick={() => onTabChange('ledger')}
            className={`whitespace-nowrap transition-colors py-1 ${
              activeTab === 'ledger'
                ? 'text-indigo-400 border-b-2 border-indigo-500 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Ledger
          </button>
        </nav>

        {/* Zone 3: Primary Actions */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Notification Center Bell */}
          <button
            type="button"
            onClick={onOpenNotifications}
            title={`${alertCount} active alerts`}
            className="relative p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors border border-slate-800"
          >
            <Bell className="w-4 h-4" />
            {alertCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center font-mono">
                {alertCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={onOpenBackup}
            title="Data Management (Export / Import / Reset)"
            className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors border border-slate-800"
          >
            <Download className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={onOpenAddExpense}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-sm transition-colors whitespace-nowrap active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            <span>Add Expense</span>
          </button>
        </div>
      </div>

      {/* Mobile nav drawer strip */}
      <div className="md:hidden flex items-center overflow-x-auto px-4 py-2 bg-slate-900 border-t border-slate-800/80 gap-4 text-xs font-medium">
        <button
          type="button"
          onClick={() => onTabChange('overview')}
          className={`whitespace-nowrap ${
            activeTab === 'overview' ? 'text-indigo-400 font-semibold' : 'text-slate-400'
          }`}
        >
          Dashboard
        </button>
        <button
          type="button"
          onClick={() => onTabChange('budget')}
          className={`whitespace-nowrap ${
            activeTab === 'budget' ? 'text-indigo-400 font-semibold' : 'text-slate-400'
          }`}
        >
          Budgets
        </button>
        <button
          type="button"
          onClick={() => onTabChange('bills')}
          className={`whitespace-nowrap ${
            activeTab === 'bills' ? 'text-indigo-400 font-semibold' : 'text-slate-400'
          }`}
        >
          Bills
        </button>
        <button
          type="button"
          onClick={() => onTabChange('recurring')}
          className={`whitespace-nowrap ${
            activeTab === 'recurring' ? 'text-indigo-400 font-semibold' : 'text-slate-400'
          }`}
        >
          Recurring
        </button>
        <button
          type="button"
          onClick={() => onTabChange('charts')}
          className={`whitespace-nowrap ${
            activeTab === 'charts' ? 'text-indigo-400 font-semibold' : 'text-slate-400'
          }`}
        >
          Analytics
        </button>
        <button
          type="button"
          onClick={() => onTabChange('ledger')}
          className={`whitespace-nowrap ${
            activeTab === 'ledger' ? 'text-indigo-400 font-semibold' : 'text-slate-400'
          }`}
        >
          Ledger
        </button>
      </div>
    </header>
  );
};
