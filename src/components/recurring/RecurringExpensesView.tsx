import React, { useState } from 'react';
import { RecurringExpenseRule, CategoryId, PaymentMethod } from '../../types/expense';
import { CATEGORIES, CATEGORY_LIST } from '../../data/categories';
import { formatCurrency } from '../../utils/analytics';
import {
  Repeat,
  Plus,
  Play,
  Pause,
  Edit2,
  Trash2,
  CheckCircle2,
  Clock,
  Sparkles,
  Calendar,
  Zap,
} from 'lucide-react';

interface Props {
  recurringRules: RecurringExpenseRule[];
  onSaveRule: (rule: RecurringExpenseRule) => void;
  onDeleteRule: (id: string) => void;
  onToggleActive: (id: string) => void;
  onManualTriggerLog: (ruleId: string) => void;
  onRunAutoLogEngine: () => void;
  currentMonthKey: string;
}

const PRESET_TEMPLATES = [
  { title: 'Apartment Monthly Rent', amount: 1800, category: 'housing' as CategoryId, day: 1, method: 'Bank Transfer' as PaymentMethod },
  { title: 'Streaming Subscription Bundle', amount: 19.99, category: 'subscriptions' as CategoryId, day: 4, method: 'Credit Card' as PaymentMethod },
  { title: 'Fitness & Gym Membership', amount: 50, category: 'health_wellness' as CategoryId, day: 6, method: 'Credit Card' as PaymentMethod },
  { title: 'Student Loan Installment', amount: 250, category: 'other' as CategoryId, day: 20, method: 'Bank Transfer' as PaymentMethod },
  { title: 'Vehicle Financing / Lease', amount: 320, category: 'transportation' as CategoryId, day: 15, method: 'Bank Transfer' as PaymentMethod },
];

export const RecurringExpensesView: React.FC<Props> = ({
  recurringRules,
  onSaveRule,
  onDeleteRule,
  onToggleActive,
  onManualTriggerLog,
  onRunAutoLogEngine,
  currentMonthKey,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<RecurringExpenseRule | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<CategoryId>('housing');
  const [payee, setPayee] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Bank Transfer');
  const [dayOfMonth, setDayOfMonth] = useState<number>(1);
  const [autoLog, setAutoLog] = useState<boolean>(true);
  const [notes, setNotes] = useState('');

  const activeRules = recurringRules.filter((r) => r.isActive);
  const totalMonthlyCommitment = activeRules.reduce((sum, r) => sum + r.amount, 0);

  const loggedThisMonthCount = activeRules.filter(
    (r) => r.lastLoggedMonth === currentMonthKey
  ).length;

  const openAddModal = () => {
    setEditingRule(null);
    setTitle('');
    setAmount('');
    setCategory('housing');
    setPayee('');
    setPaymentMethod('Bank Transfer');
    setDayOfMonth(1);
    setAutoLog(true);
    setNotes('');
    setIsModalOpen(true);
  };

  const openEditModal = (rule: RecurringExpenseRule) => {
    setEditingRule(rule);
    setTitle(rule.title);
    setAmount(rule.amount.toString());
    setCategory(rule.category);
    setPayee(rule.payee);
    setPaymentMethod(rule.paymentMethod);
    setDayOfMonth(rule.dayOfMonth);
    setAutoLog(rule.autoLog);
    setNotes(rule.notes || '');
    setIsModalOpen(true);
  };

  const applyTemplate = (tmpl: typeof PRESET_TEMPLATES[0]) => {
    setTitle(tmpl.title);
    setAmount(tmpl.amount.toString());
    setCategory(tmpl.category);
    setPaymentMethod(tmpl.method);
    setDayOfMonth(tmpl.day);
    setPayee(tmpl.title.split(' ')[0]);
  };

  const handleSubmitModal = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0 || !title.trim()) return;

    const payload: RecurringExpenseRule = {
      id: editingRule ? editingRule.id : `rec-${Date.now()}`,
      title: title.trim(),
      amount: parsedAmount,
      category,
      payee: payee.trim() || title.trim(),
      paymentMethod,
      frequency: 'monthly',
      dayOfMonth: Math.min(31, Math.max(1, Number(dayOfMonth))),
      startDate: editingRule ? editingRule.startDate : new Date().toISOString().split('T')[0],
      isActive: editingRule ? editingRule.isActive : true,
      lastLoggedMonth: editingRule ? editingRule.lastLoggedMonth : undefined,
      autoLog,
      notes: notes.trim(),
    };

    onSaveRule(payload);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Overview Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800/80">
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                <Repeat className="w-5 h-5 text-indigo-400" />
                Scheduled Recurring Expenses
              </h2>
              <span className="inline-flex items-center gap-1 text-xs font-mono text-indigo-300 font-semibold bg-indigo-500/10 px-2.5 py-0.5 rounded-full border border-indigo-500/20">
                {activeRules.length} Active Rules
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Automated expenses (rent, subscriptions, loan payments) are automatically logged into your monthly ledger on their scheduled day.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 self-start md:self-auto">
            <button
              type="button"
              onClick={onRunAutoLogEngine}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors"
              title="Scan and log any recurring expenses due today"
            >
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Process Due Rules</span>
            </button>

            <button
              type="button"
              onClick={openAddModal}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-sm transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>New Recurring Rule</span>
            </button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="pt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-slate-950/40 p-3.5 rounded-xl border border-slate-800/80">
            <span className="text-xs text-slate-400">Total Fixed Monthly Commitments</span>
            <div className="text-2xl font-bold font-mono text-slate-100 tabular-nums mt-0.5">
              {formatCurrency(totalMonthlyCommitment)}
            </div>
            <span className="text-[11px] text-slate-500 font-mono">
              Recurring outflow per monthly cycle
            </span>
          </div>

          <div className="bg-slate-950/40 p-3.5 rounded-xl border border-slate-800/80">
            <span className="text-xs text-slate-400">Logged For Current Month</span>
            <div className="text-2xl font-bold font-mono text-emerald-400 tabular-nums mt-0.5">
              {loggedThisMonthCount} of {activeRules.length}
            </div>
            <span className="text-[11px] text-slate-500 font-mono">
              Already inserted into ledger for {currentMonthKey}
            </span>
          </div>

          <div className="bg-slate-950/40 p-3.5 rounded-xl border border-slate-800/80">
            <span className="text-xs text-slate-400">Upcoming Later This Month</span>
            <div className="text-2xl font-bold font-mono text-indigo-300 tabular-nums mt-0.5">
              {activeRules.length - loggedThisMonthCount}
            </div>
            <span className="text-[11px] text-slate-500 font-mono">
              Will trigger automatically when their date arrives
            </span>
          </div>
        </div>
      </div>

      {/* Rules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {recurringRules.map((rule) => {
          const catMeta = CATEGORIES[rule.category];
          const isLoggedThisMonth = rule.lastLoggedMonth === currentMonthKey;

          return (
            <div
              key={rule.id}
              className={`bg-slate-900 rounded-xl border p-4 transition-all duration-200 flex flex-col justify-between ${
                !rule.isActive
                  ? 'border-slate-800/60 opacity-60'
                  : isLoggedThisMonth
                  ? 'border-indigo-500/30 shadow-sm'
                  : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="min-w-0">
                    <h3 className="text-sm font-semibold text-slate-100 truncate">
                      {rule.title}
                    </h3>
                    <div className="text-xs text-slate-400 truncate">
                      Payee: {rule.payee}
                    </div>
                  </div>

                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-mono font-medium rounded-md border shrink-0 ${
                      !rule.isActive
                        ? 'text-slate-500 bg-slate-800/40 border-slate-700'
                        : isLoggedThisMonth
                        ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
                        : 'text-indigo-300 bg-indigo-500/10 border-indigo-500/20'
                    }`}
                  >
                    {!rule.isActive ? (
                      'Paused'
                    ) : isLoggedThisMonth ? (
                      <>
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        Logged for {currentMonthKey}
                      </>
                    ) : (
                      <>
                        <Clock className="w-3 h-3 text-indigo-400" />
                        Scheduled: Day {rule.dayOfMonth}
                      </>
                    )}
                  </span>
                </div>

                {/* Amount & Schedule */}
                <div className="flex items-baseline justify-between py-2 border-y border-slate-800/80 my-2">
                  <div>
                    <span className="text-[11px] text-slate-400">Scheduled Date</span>
                    <div className="text-xs font-mono font-medium text-slate-200 mt-0.5">
                      Day {rule.dayOfMonth} of every month
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[11px] text-slate-400">Monthly Amount</span>
                    <div className="text-lg font-bold font-mono text-slate-100 tabular-nums">
                      {formatCurrency(rule.amount)}
                    </div>
                  </div>
                </div>

                {/* Category & Payment Method */}
                <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                  <div className="flex items-center gap-1.5">
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: catMeta?.color || '#94a3b8' }}
                    />
                    <span>{catMeta?.name || rule.category}</span>
                  </div>

                  <span className="font-mono text-[11px] text-slate-500">
                    {rule.paymentMethod}
                  </span>
                </div>

                {rule.notes && (
                  <div className="text-[11px] text-slate-400 italic mb-3 bg-slate-950/40 p-2 rounded-md">
                    {rule.notes}
                  </div>
                )}
              </div>

              {/* Actions Footer */}
              <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => openEditModal(rule)}
                    className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded transition-colors"
                    title="Edit recurring rule"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => onToggleActive(rule.id)}
                    className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded transition-colors"
                    title={rule.isActive ? 'Pause rule' : 'Resume rule'}
                  >
                    {rule.isActive ? (
                      <Pause className="w-3.5 h-3.5 text-amber-400" />
                    ) : (
                      <Play className="w-3.5 h-3.5 text-emerald-400" />
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => onDeleteRule(rule.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded transition-colors"
                    title="Cancel & delete rule"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {!isLoggedThisMonth && rule.isActive && (
                  <button
                    type="button"
                    onClick={() => onManualTriggerLog(rule.id)}
                    className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-indigo-300 hover:text-indigo-100 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 rounded-lg transition-colors"
                  >
                    <Zap className="w-3 h-3" />
                    <span>Log Now</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden my-8">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
              <h3 className="text-base font-semibold text-slate-100">
                {editingRule ? 'Edit Recurring Expense Rule' : 'Setup Recurring Expense'}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-100"
              >
                ✕
              </button>
            </div>

            {/* Presets */}
            {!editingRule && (
              <div className="px-6 pt-3 pb-2 border-b border-slate-800/60 bg-slate-950/40">
                <div className="text-[11px] font-mono uppercase text-slate-500 mb-1.5">
                  Popular Presets
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {PRESET_TEMPLATES.map((tmpl) => (
                    <button
                      key={tmpl.title}
                      type="button"
                      onClick={() => applyTemplate(tmpl)}
                      className="px-2 py-0.5 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700"
                    >
                      {tmpl.title.split(' ')[0]} (${tmpl.amount})
                    </button>
                  ))}
                </div>
              </div>
            )}

            <form onSubmit={handleSubmitModal} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Commitment Name <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Apartment Monthly Rent, Netflix"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Amount (USD) <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Day of Month (1–31) <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    required
                    value={dayOfMonth}
                    onChange={(e) => setDayOfMonth(parseInt(e.target.value, 10))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as CategoryId)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
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
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Credit Card">Credit Card</option>
                    <option value="Debit Card">Debit Card</option>
                    <option value="Apple / Google Pay">Apple / Google Pay</option>
                    <option value="Cash">Cash</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Payee / Merchant Name
                </label>
                <input
                  type="text"
                  value={payee}
                  onChange={(e) => setPayee(e.target.value)}
                  placeholder="e.g. Avon Crest Properties, Netflix"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 cursor-pointer select-none py-1">
                  <input
                    type="checkbox"
                    checked={autoLog}
                    onChange={(e) => setAutoLog(e.target.checked)}
                    className="rounded bg-slate-950 border-slate-700 text-indigo-600 focus:ring-0"
                  />
                  <span className="text-xs text-slate-300">
                    Automatically log to ledger on scheduled date
                  </span>
                </label>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Optional Notes
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Fixed lease through December"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs text-slate-400 hover:text-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-sm"
                >
                  {editingRule ? 'Save Changes' : 'Create Recurring Rule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
