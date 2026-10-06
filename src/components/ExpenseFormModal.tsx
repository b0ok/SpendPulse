import React, { useState, useEffect } from 'react';
import { Expense, CategoryId, PaymentMethod } from '../types/expense';
import { CATEGORY_LIST } from '../data/categories';
import { X, DollarSign, Calendar, Tag, CreditCard, Store, FileText, Repeat } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (expenseData: Omit<Expense, 'id'> | Expense) => void;
  initialExpense?: Expense | null;
  defaultDate?: string;
}

const QUICK_PRESETS = [
  { label: 'Coffee', amount: 5.75, category: 'food_dining' as CategoryId, payee: 'Coffee Shop', desc: 'Coffee & pastry' },
  { label: 'Lunch', amount: 16.5, category: 'food_dining' as CategoryId, payee: 'Local Deli', desc: 'Lunch combo' },
  { label: 'Groceries', amount: 82.0, category: 'groceries' as CategoryId, payee: "Trader Joe's", desc: 'Weekly market haul' },
  { label: 'Subway/Transit', amount: 30.0, category: 'transportation' as CategoryId, payee: 'Transit Authority', desc: 'Transit card reload' },
  { label: 'Gas Fuel', amount: 48.0, category: 'transportation' as CategoryId, payee: 'Shell Fuel', desc: 'Gasoline refill' },
];

export const ExpenseFormModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onSave,
  initialExpense,
  defaultDate,
}) => {
  const [amount, setAmount] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [category, setCategory] = useState<CategoryId>('food_dining');
  const [date, setDate] = useState<string>(
    defaultDate || new Date().toISOString().split('T')[0]
  );
  const [payee, setPayee] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Credit Card');
  const [isRecurring, setIsRecurring] = useState<boolean>(false);
  const [notes, setNotes] = useState<string>('');
  const [errors, setErrors] = useState<{ amount?: string; description?: string }>({});

  useEffect(() => {
    if (initialExpense) {
      setAmount(initialExpense.amount.toString());
      setDescription(initialExpense.description);
      setCategory(initialExpense.category);
      setDate(initialExpense.date);
      setPayee(initialExpense.payee || '');
      setPaymentMethod(initialExpense.paymentMethod || 'Credit Card');
      setIsRecurring(Boolean(initialExpense.isRecurring));
      setNotes(initialExpense.notes || '');
    } else {
      setAmount('');
      setDescription('');
      setCategory('food_dining');
      setDate(defaultDate || new Date().toISOString().split('T')[0]);
      setPayee('');
      setPaymentMethod('Credit Card');
      setIsRecurring(false);
      setNotes('');
    }
    setErrors({});
  }, [initialExpense, isOpen, defaultDate]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    const newErrors: { amount?: string; description?: string } = {};

    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      newErrors.amount = 'Please enter a valid positive amount.';
    }
    if (!description.trim()) {
      newErrors.description = 'Description is required.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const payload = {
      amount: parsedAmount,
      description: description.trim(),
      category,
      date,
      payee: payee.trim(),
      paymentMethod,
      isRecurring,
      notes: notes.trim(),
    };

    if (initialExpense) {
      onSave({ ...payload, id: initialExpense.id });
    } else {
      onSave(payload);
    }
    onClose();
  };

  const applyPreset = (preset: typeof QUICK_PRESETS[0]) => {
    setAmount(preset.amount.toString());
    setDescription(preset.desc);
    setCategory(preset.category);
    setPayee(preset.payee);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <div>
            <h2 className="text-base font-semibold text-slate-100">
              {initialExpense ? 'Edit Transaction' : 'Record New Expense'}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Enter details to update your monthly ledger and budget metrics
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

        {/* Quick Presets (Only on Add) */}
        {!initialExpense && (
          <div className="px-6 pt-3 pb-2 border-b border-slate-800/60 bg-slate-950/40">
            <div className="text-[11px] font-mono uppercase text-slate-500 mb-1.5">
              Quick Presets
            </div>
            <div className="flex flex-wrap gap-1.5">
              {QUICK_PRESETS.map((p) => (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => applyPreset(p)}
                  className="px-2.5 py-1 text-xs bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-300 rounded-md transition-colors"
                >
                  {p.label} (${p.amount.toFixed(2)})
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Amount & Date row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Amount (USD) <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-mono">
                  $
                </span>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  autoFocus={!initialExpense}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-7 pr-3 py-2 text-sm font-mono text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
              {errors.amount && (
                <p className="text-[11px] text-rose-400 mt-1">{errors.amount}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Transaction Date <span className="text-rose-400">*</span>
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-slate-100 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Description <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Organic produce & pantry haul"
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
            />
            {errors.description && (
              <p className="text-[11px] text-rose-400 mt-1">{errors.description}</p>
            )}
          </div>

          {/* Category & Payment Method */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as CategoryId)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500 transition-colors"
              >
                {CATEGORY_LIST.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Payment Method
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500 transition-colors"
              >
                <option value="Credit Card">Credit Card</option>
                <option value="Debit Card">Debit Card</option>
                <option value="Apple / Google Pay">Apple / Google Pay</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Cash">Cash</option>
              </select>
            </div>
          </div>

          {/* Payee & Recurring */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Payee / Merchant Name
              </label>
              <input
                type="text"
                value={payee}
                onChange={(e) => setPayee(e.target.value)}
                placeholder="e.g. Trader Joe's, Uber, Amazon"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>

            <div className="sm:col-span-1 pb-2">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isRecurring}
                  onChange={(e) => setIsRecurring(e.target.checked)}
                  className="rounded bg-slate-950 border-slate-700 text-indigo-600 focus:ring-0"
                />
                <span className="text-xs text-slate-300">Recurring</span>
              </label>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Optional Notes
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Split with roomate; work reimbursement pending"
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-slate-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-sm transition-colors"
            >
              {initialExpense ? 'Save Changes' : 'Record Expense'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
