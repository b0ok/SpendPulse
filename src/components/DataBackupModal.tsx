import React, { useRef, useState } from 'react';
import { Expense, CategoryBudgets, BillReminder, RecurringExpenseRule } from '../types/expense';
import {
  exportExpensesToCsv,
  exportDataToJson,
  importDataFromJson,
  resetToSampleData,
} from '../utils/storage';
import {
  X,
  FileSpreadsheet,
  Download,
  Upload,
  RotateCcw,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  expenses: Expense[];
  budgets: CategoryBudgets;
  bills: BillReminder[];
  recurring: RecurringExpenseRule[];
  onDataRestored: (
    newExpenses: Expense[],
    newBudgets: CategoryBudgets,
    newBills: BillReminder[],
    newRecurring: RecurringExpenseRule[]
  ) => void;
}

export const DataBackupModal: React.FC<Props> = ({
  isOpen,
  onClose,
  expenses,
  budgets,
  bills,
  recurring,
  onDataRestored,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleExportCsv = () => {
    exportExpensesToCsv(expenses);
  };

  const handleExportJson = () => {
    exportDataToJson(expenses, budgets, bills, recurring);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const res = importDataFromJson(text);
      if (res.success && res.expenses && res.budgets && res.bills && res.recurring) {
        onDataRestored(res.expenses, res.budgets, res.bills, res.recurring);
        setIsSuccess(true);
        setImportStatus(`Successfully restored ${res.expenses.length} transactions, budgets, bills, and recurring rules.`);
      } else {
        setIsSuccess(false);
        setImportStatus(res.error || 'Failed to import backup file.');
      }
    };
    reader.readAsText(file);
  };

  const handleResetSample = () => {
    if (
      window.confirm(
        'Reload sample dataset? This will restore realistic transaction history, bill reminders, and recurring commitments.'
      )
    ) {
      const restored = resetToSampleData();
      onDataRestored(restored.expenses, restored.budgets, restored.bills, restored.recurring);
      setIsSuccess(true);
      setImportStatus('Demo sample dataset loaded successfully.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden my-8">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <div>
            <h2 className="text-base font-semibold text-slate-100">
              Data Management & Portability
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Export records, backup JSON, or restore default datasets
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

        <div className="p-6 space-y-4">
          {importStatus && (
            <div
              className={`p-3 rounded-lg text-xs flex items-start gap-2 border ${
                isSuccess
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'
                  : 'bg-rose-500/10 border-rose-500/20 text-rose-300'
              }`}
            >
              {isSuccess ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              )}
              <span>{importStatus}</span>
            </div>
          )}

          {/* Export Options */}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-300">Export Ledger</span>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={handleExportCsv}
                className="flex items-center justify-center gap-2 px-3 py-2.5 bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-xl text-xs text-slate-200 transition-colors"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                <span>Export CSV</span>
              </button>
              <button
                type="button"
                onClick={handleExportJson}
                className="flex items-center justify-center gap-2 px-3 py-2.5 bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-xl text-xs text-slate-200 transition-colors"
              >
                <Download className="w-4 h-4 text-indigo-400" />
                <span>JSON Backup</span>
              </button>
            </div>
          </div>

          {/* Import Option */}
          <div className="space-y-2 pt-2 border-t border-slate-800/80">
            <span className="text-xs font-semibold text-slate-300">Restore Backup</span>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".json"
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full flex items-center justify-center gap-2 px-3 py-2.5 bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-xl text-xs text-slate-200 transition-colors"
            >
              <Upload className="w-4 h-4 text-sky-400" />
              <span>Import JSON File</span>
            </button>
          </div>

          {/* Reset Demo Data */}
          <div className="space-y-2 pt-2 border-t border-slate-800/80">
            <span className="text-xs font-semibold text-slate-300">Sample Demo Environment</span>
            <button
              type="button"
              onClick={handleResetSample}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 rounded-xl text-xs text-slate-300 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
              <span>Reload 5-Month Sample Data</span>
            </button>
          </div>
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
