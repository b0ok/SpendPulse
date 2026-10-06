import React, { useState, useMemo } from 'react';
import { Expense, CategoryId } from '../types/expense';
import { CATEGORIES, CATEGORY_LIST } from '../data/categories';
import { formatCurrency } from '../utils/analytics';
import {
  Search,
  SlidersHorizontal,
  Trash2,
  Edit2,
  Copy,
  Plus,
  ArrowUpDown,
  Repeat,
  FileSpreadsheet,
} from 'lucide-react';

interface Props {
  expenses: Expense[];
  onEditExpense: (expense: Expense) => void;
  onDeleteExpense: (id: string) => void;
  onDuplicateExpense: (expense: Expense) => void;
  onOpenAddModal: () => void;
  selectedCategoryFilter?: CategoryId | null;
  onSelectCategoryFilter?: (catId: CategoryId | null) => void;
}

type SortField = 'date' | 'amount' | 'description' | 'payee';
type SortOrder = 'asc' | 'desc';

export const ExpenseTable: React.FC<Props> = ({
  expenses,
  onEditExpense,
  onDeleteExpense,
  onDuplicateExpense,
  onOpenAddModal,
  selectedCategoryFilter,
  onSelectCategoryFilter,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>(selectedCategoryFilter || 'all');
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Keep internal filter in sync if external selectedCategoryFilter changes
  React.useEffect(() => {
    if (selectedCategoryFilter) {
      setCategoryFilter(selectedCategoryFilter);
    }
  }, [selectedCategoryFilter]);

  const handleCategoryChange = (val: string) => {
    setCategoryFilter(val);
    if (onSelectCategoryFilter) {
      onSelectCategoryFilter(val === 'all' ? null : (val as CategoryId));
    }
  };

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const filteredAndSortedExpenses = useMemo(() => {
    return expenses
      .filter((item) => {
        const matchesCategory =
          categoryFilter === 'all' || item.category === categoryFilter;

        const q = searchQuery.toLowerCase().trim();
        const matchesSearch =
          !q ||
          item.description.toLowerCase().includes(q) ||
          item.payee.toLowerCase().includes(q) ||
          (item.notes && item.notes.toLowerCase().includes(q));

        return matchesCategory && matchesSearch;
      })
      .sort((a, b) => {
        let cmp = 0;
        if (sortField === 'date') {
          cmp = a.date.localeCompare(b.date);
        } else if (sortField === 'amount') {
          cmp = a.amount - b.amount;
        } else if (sortField === 'description') {
          cmp = a.description.localeCompare(b.description);
        } else if (sortField === 'payee') {
          cmp = a.payee.localeCompare(b.payee);
        }
        return sortOrder === 'asc' ? cmp : -cmp;
      });
  }, [expenses, categoryFilter, searchQuery, sortField, sortOrder]);

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredAndSortedExpenses.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredAndSortedExpenses.map((e) => e.id)));
    }
  };

  const toggleSelectRow = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const handleBatchDelete = () => {
    if (selectedIds.size === 0) return;
    if (window.confirm(`Delete ${selectedIds.size} selected transaction(s)?`)) {
      selectedIds.forEach((id) => onDeleteExpense(id));
      setSelectedIds(new Set());
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
      {/* Table Toolbar */}
      <div className="p-4 border-b border-slate-800 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Left: Search input & Category dropdown */}
        <div className="flex flex-1 items-center gap-2.5">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search payee, description, notes..."
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => handleCategoryChange(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors shrink-0"
          >
            <option value="all">All Categories</option>
            {CATEGORY_LIST.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Right: Batch Actions & New Expense */}
        <div className="flex items-center gap-2 self-end md:self-auto shrink-0">
          {selectedIds.size > 0 && (
            <button
              type="button"
              onClick={handleBatchDelete}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 rounded-lg transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete ({selectedIds.size})</span>
            </button>
          )}

          <div className="text-xs text-slate-500 font-mono">
            Showing {filteredAndSortedExpenses.length} of {expenses.length}
          </div>
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-950/60 text-[11px] font-mono uppercase text-slate-400">
              <th className="py-2.5 px-3 w-8">
                <input
                  type="checkbox"
                  checked={
                    filteredAndSortedExpenses.length > 0 &&
                    selectedIds.size === filteredAndSortedExpenses.length
                  }
                  onChange={toggleSelectAll}
                  className="rounded bg-slate-900 border-slate-700 text-indigo-600 focus:ring-0 cursor-pointer"
                />
              </th>
              <th
                onClick={() => toggleSort('date')}
                className="py-2.5 px-3 cursor-pointer hover:text-slate-200 transition-colors"
              >
                <div className="flex items-center gap-1">
                  <span>Date</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-500" />
                </div>
              </th>
              <th
                onClick={() => toggleSort('description')}
                className="py-2.5 px-3 cursor-pointer hover:text-slate-200 transition-colors"
              >
                <div className="flex items-center gap-1">
                  <span>Description & Payee</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-500" />
                </div>
              </th>
              <th className="py-2.5 px-3">Category</th>
              <th className="py-2.5 px-3">Payment Method</th>
              <th
                onClick={() => toggleSort('amount')}
                className="py-2.5 px-3 text-right cursor-pointer hover:text-slate-200 transition-colors"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Amount</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-500" />
                </div>
              </th>
              <th className="py-2.5 px-3 text-right w-24">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-xs">
            {filteredAndSortedExpenses.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-500">
                  <div className="flex flex-col items-center justify-center">
                    <FileSpreadsheet className="w-8 h-8 text-slate-600 mb-2" />
                    <p className="text-sm font-medium text-slate-400">No transactions recorded</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {searchQuery || categoryFilter !== 'all'
                        ? 'Try clearing the search or category filters'
                        : 'Log your first expense to begin tracking'}
                    </p>
                    <button
                      type="button"
                      onClick={onOpenAddModal}
                      className="mt-3 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors inline-flex items-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Log New Expense</span>
                    </button>
                  </div>
                </td>
              </tr>
            ) : (
              filteredAndSortedExpenses.map((exp) => {
                const isSelected = selectedIds.has(exp.id);
                const catMeta = CATEGORIES[exp.category];

                return (
                  <tr
                    key={exp.id}
                    className={`h-11 transition-colors ${
                      isSelected
                        ? 'bg-slate-800/70'
                        : 'hover:bg-slate-800/40 bg-transparent'
                    }`}
                  >
                    <td className="py-2 px-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelectRow(exp.id)}
                        className="rounded bg-slate-900 border-slate-700 text-indigo-600 focus:ring-0 cursor-pointer"
                      />
                    </td>
                    <td className="py-2 px-3 font-mono text-slate-400 tabular-nums whitespace-nowrap">
                      {exp.date}
                    </td>
                    <td className="py-2 px-3 min-w-[200px]">
                      <div className="font-medium text-slate-200 flex items-center gap-1.5">
                        <span className="truncate">{exp.description}</span>
                        {exp.isRecurring && (
                          <span
                            title="Recurring commitment"
                            className="text-slate-400 hover:text-indigo-400 shrink-0"
                          >
                            <Repeat className="w-3 h-3" />
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono flex items-center gap-1.5 mt-0.5">
                        <span>{exp.payee || 'Direct Expense'}</span>
                        {exp.notes && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span className="truncate max-w-[180px] italic">{exp.notes}</span>
                          </>
                        )}
                      </div>
                    </td>
                    <td className="py-2 px-3 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{ backgroundColor: catMeta?.color || '#94a3b8' }}
                        />
                        <span className="text-slate-300">
                          {catMeta?.name || exp.category}
                        </span>
                      </div>
                    </td>
                    <td className="py-2 px-3 text-slate-400 whitespace-nowrap font-mono text-[11px]">
                      {exp.paymentMethod}
                    </td>
                    <td className="py-2 px-3 text-right font-mono font-semibold text-slate-100 tabular-nums whitespace-nowrap">
                      {formatCurrency(exp.amount)}
                    </td>
                    <td className="py-2 px-3 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => onDuplicateExpense(exp)}
                          title="Duplicate transaction"
                          className="p-1 text-slate-500 hover:text-slate-300 rounded hover:bg-slate-800 transition-colors"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onEditExpense(exp)}
                          title="Edit transaction"
                          className="p-1 text-slate-500 hover:text-indigo-300 rounded hover:bg-slate-800 transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeleteExpense(exp.id)}
                          title="Delete transaction"
                          className="p-1 text-slate-500 hover:text-rose-400 rounded hover:bg-slate-800 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
