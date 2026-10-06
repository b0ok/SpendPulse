import React, { useState } from 'react';
import { BillReminder, CategoryId, Expense } from '../../types/expense';
import { CATEGORIES } from '../../data/categories';
import {
  evaluateAllBills,
  requestNotificationPermission,
  triggerSystemNotification,
  EvaluatedBill,
} from '../../utils/billReminders';
import { formatCurrency } from '../../utils/analytics';
import {
  Bell,
  BellRing,
  Calendar,
  CheckCircle,
  AlertCircle,
  AlertTriangle,
  Clock,
  Plus,
  Trash2,
  Edit2,
  Check,
  RotateCcw,
  ExternalLink,
  ShieldAlert,
} from 'lucide-react';

interface Props {
  bills: BillReminder[];
  onSaveBill: (bill: BillReminder) => void;
  onDeleteBill: (id: string) => void;
  onMarkPaid: (billId: string, alsoLogExpense: boolean) => void;
  onMarkUnpaid: (billId: string) => void;
}

export const BillRemindersView: React.FC<Props> = ({
  bills,
  onSaveBill,
  onDeleteBill,
  onMarkPaid,
  onMarkUnpaid,
}) => {
  const [filter, setFilter] = useState<'all' | 'action_needed' | 'paid'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBill, setEditingBill] = useState<BillReminder | null>(null);
  const [notificationPermissionGranted, setNotificationPermissionGranted] = useState(
    typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted'
  );
  const [notificationStatusMsg, setNotificationStatusMsg] = useState<string | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [payee, setPayee] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDayOfMonth, setDueDayOfMonth] = useState<number>(15);
  const [category, setCategory] = useState<CategoryId>('utilities');
  const [notifyDaysBefore, setNotifyDaysBefore] = useState<number>(3);
  const [autoPay, setAutoPay] = useState(false);
  const [notes, setNotes] = useState('');

  const evaluatedBills = evaluateAllBills(bills);

  const overdueCount = evaluatedBills.filter((b) => b.status === 'overdue').length;
  const dueTodayCount = evaluatedBills.filter((b) => b.status === 'due_today').length;
  const approachingCount = evaluatedBills.filter((b) => b.status === 'approaching').length;
  const actionRequiredCount = overdueCount + dueTodayCount + approachingCount;

  const totalUnpaidAmount = evaluatedBills
    .filter((b) => !b.bill.isPaid)
    .reduce((sum, b) => sum + b.bill.amount, 0);

  const totalPaidAmount = evaluatedBills
    .filter((b) => b.bill.isPaid)
    .reduce((sum, b) => sum + b.bill.amount, 0);

  const filteredBills = evaluatedBills.filter(({ status, bill }) => {
    if (filter === 'action_needed') {
      return status === 'overdue' || status === 'due_today' || status === 'approaching';
    }
    if (filter === 'paid') {
      return bill.isPaid;
    }
    return true;
  });

  const handleEnableNotifications = async () => {
    const granted = await requestNotificationPermission();
    setNotificationPermissionGranted(granted);
    if (granted) {
      setNotificationStatusMsg('Browser notifications active! You will be alerted for upcoming due dates.');
      triggerSystemNotification(
        'SpendPulse Bill Reminders Enabled',
        `Notifications configured. ${actionRequiredCount} bill(s) currently require attention.`
      );
    } else {
      setNotificationStatusMsg('Notification permission was dismissed or blocked by browser.');
    }
  };

  const openAddModal = () => {
    setEditingBill(null);
    setTitle('');
    setPayee('');
    setAmount('');
    setDueDayOfMonth(15);
    setCategory('utilities');
    setNotifyDaysBefore(3);
    setAutoPay(false);
    setNotes('');
    setIsModalOpen(true);
  };

  const openEditModal = (b: BillReminder) => {
    setEditingBill(b);
    setTitle(b.title);
    setPayee(b.payee);
    setAmount(b.amount.toString());
    setDueDayOfMonth(b.dueDayOfMonth);
    setCategory(b.category);
    setNotifyDaysBefore(b.notifyDaysBefore || 3);
    setAutoPay(Boolean(b.autoPay));
    setNotes(b.notes || '');
    setIsModalOpen(true);
  };

  const handleSaveModal = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0 || !title.trim()) return;

    const payload: BillReminder = {
      id: editingBill ? editingBill.id : `bill-${Date.now()}`,
      title: title.trim(),
      payee: payee.trim() || title.trim(),
      amount: parsedAmount,
      dueDayOfMonth: Math.min(31, Math.max(1, Number(dueDayOfMonth))),
      category,
      notifyDaysBefore: Math.max(1, Number(notifyDaysBefore)),
      isPaid: editingBill ? editingBill.isPaid : false,
      autoPay,
      notes: notes.trim(),
    };

    onSaveBill(payload);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Bill Reminders Overview & Notification Setup */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800/80">
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                <BellRing className="w-5 h-5 text-indigo-400" />
                Bill Payment Reminders & Schedules
              </h2>
              {actionRequiredCount > 0 ? (
                <span className="inline-flex items-center gap-1 text-xs font-mono text-amber-400 font-semibold bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
                  <Clock className="w-3.5 h-3.5" />
                  {actionRequiredCount} Action Required
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-xs font-mono text-emerald-400 font-semibold bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                  <CheckCircle className="w-3.5 h-3.5" />
                  All Current Bills Settled
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Input due dates and configure custom advance alert windows (e.g., 3 or 7 days prior) to avoid late fees.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 self-start md:self-auto">
            {!notificationPermissionGranted && (
              <button
                type="button"
                onClick={handleEnableNotifications}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-indigo-300 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 rounded-lg transition-colors"
              >
                <Bell className="w-3.5 h-3.5" />
                <span>Enable System Alerts</span>
              </button>
            )}

            <button
              type="button"
              onClick={openAddModal}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-sm transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add Bill Reminder</span>
            </button>
          </div>
        </div>

        {notificationStatusMsg && (
          <div className="mt-4 p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-xs text-indigo-200 flex items-center justify-between">
            <span>{notificationStatusMsg}</span>
            <button
              type="button"
              onClick={() => setNotificationStatusMsg(null)}
              className="text-indigo-400 hover:text-indigo-200"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Metric Cards Row */}
        <div className="pt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-950/40 p-3.5 rounded-xl border border-slate-800/80">
            <span className="text-xs text-slate-400">Pending Outflow Due</span>
            <div className="text-xl font-bold font-mono text-slate-100 tabular-nums mt-0.5">
              {formatCurrency(totalUnpaidAmount)}
            </div>
            <span className="text-[11px] text-slate-500 font-mono">
              {evaluatedBills.filter((b) => !b.bill.isPaid).length} unpaid bills
            </span>
          </div>

          <div className="bg-slate-950/40 p-3.5 rounded-xl border border-slate-800/80">
            <span className="text-xs text-slate-400">Overdue Or Today</span>
            <div
              className={`text-xl font-bold font-mono tabular-nums mt-0.5 ${
                overdueCount + dueTodayCount > 0 ? 'text-rose-400' : 'text-slate-100'
              }`}
            >
              {overdueCount + dueTodayCount}
            </div>
            <span className="text-[11px] text-slate-500 font-mono">
              {overdueCount} overdue · {dueTodayCount} due today
            </span>
          </div>

          <div className="bg-slate-950/40 p-3.5 rounded-xl border border-slate-800/80">
            <span className="text-xs text-slate-400">Approaching Due Date</span>
            <div
              className={`text-xl font-bold font-mono tabular-nums mt-0.5 ${
                approachingCount > 0 ? 'text-amber-400' : 'text-slate-100'
              }`}
            >
              {approachingCount}
            </div>
            <span className="text-[11px] text-slate-500 font-mono">Within configured warning window</span>
          </div>

          <div className="bg-slate-950/40 p-3.5 rounded-xl border border-slate-800/80">
            <span className="text-xs text-slate-400">Settled This Cycle</span>
            <div className="text-xl font-bold font-mono text-emerald-400 tabular-nums mt-0.5">
              {formatCurrency(totalPaidAmount)}
            </div>
            <span className="text-[11px] text-slate-500 font-mono">
              {evaluatedBills.filter((b) => b.bill.isPaid).length} marked as paid
            </span>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 p-1 bg-slate-900 border border-slate-800 rounded-xl text-xs">
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 font-medium rounded-lg transition-colors ${
              filter === 'all'
                ? 'bg-slate-800 text-slate-100 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All Reminders ({evaluatedBills.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter('action_needed')}
            className={`px-3 py-1.5 font-medium rounded-lg transition-colors flex items-center gap-1.5 ${
              filter === 'action_needed'
                ? 'bg-amber-500/20 text-amber-300 shadow-sm border border-amber-500/30'
                : 'text-slate-400 hover:text-amber-400'
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>Action Required ({actionRequiredCount})</span>
          </button>
          <button
            type="button"
            onClick={() => setFilter('paid')}
            className={`px-3 py-1.5 font-medium rounded-lg transition-colors flex items-center gap-1.5 ${
              filter === 'paid'
                ? 'bg-emerald-500/20 text-emerald-300 shadow-sm border border-emerald-500/30'
                : 'text-slate-400 hover:text-emerald-400'
            }`}
          >
            <Check className="w-3.5 h-3.5 text-emerald-400" />
            <span>Paid ({evaluatedBills.filter((b) => b.bill.isPaid).length})</span>
          </button>
        </div>
      </div>

      {/* Bills Card Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredBills.map(({ bill, status, daysRemaining, formattedDueDate, isTriggeringNotification }) => {
          const catMeta = CATEGORIES[bill.category];

          let borderStyle = 'border-slate-800';
          let statusLabel = 'Upcoming';
          let statusColor = 'text-slate-400 bg-slate-800/60 border-slate-700';

          if (status === 'overdue') {
            borderStyle = 'border-rose-500/50 ring-1 ring-rose-500/20 shadow-sm shadow-rose-950/20';
            statusLabel = `Overdue by ${Math.abs(daysRemaining)}d`;
            statusColor = 'text-rose-300 bg-rose-500/20 border-rose-500/30';
          } else if (status === 'due_today') {
            borderStyle = 'border-amber-500/50 ring-1 ring-amber-500/20 shadow-sm shadow-amber-950/20';
            statusLabel = 'Due Today';
            statusColor = 'text-amber-300 bg-amber-500/20 border-amber-500/30';
          } else if (status === 'approaching') {
            borderStyle = 'border-amber-500/40';
            statusLabel = `Due in ${daysRemaining} days`;
            statusColor = 'text-amber-300 bg-amber-500/20 border-amber-500/30';
          } else if (status === 'paid') {
            borderStyle = 'border-emerald-500/30 opacity-80';
            statusLabel = 'Settled';
            statusColor = 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
          }

          return (
            <div
              key={bill.id}
              className={`bg-slate-900 rounded-xl border p-4 transition-all duration-200 flex flex-col justify-between ${borderStyle}`}
            >
              <div>
                {/* Header with Title and Urgency Badge */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="min-w-0">
                    <h3 className="text-sm font-semibold text-slate-100 truncate">
                      {bill.title}
                    </h3>
                    <div className="text-xs text-slate-400 truncate">
                      Payee: {bill.payee}
                    </div>
                  </div>

                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-mono font-medium rounded-md border shrink-0 ${statusColor}`}
                  >
                    {status === 'overdue' && <AlertCircle className="w-3 h-3 text-rose-400" />}
                    {status === 'due_today' && <Clock className="w-3 h-3 text-amber-400" />}
                    {status === 'approaching' && <BellRing className="w-3 h-3 text-amber-400" />}
                    {status === 'paid' && <Check className="w-3 h-3 text-emerald-400" />}
                    {statusLabel}
                  </span>
                </div>

                {/* Amount and Due Date */}
                <div className="flex items-baseline justify-between py-2 border-y border-slate-800/80 my-2">
                  <div>
                    <span className="text-[11px] text-slate-400">Due on Day {bill.dueDayOfMonth}</span>
                    <div className="text-xs font-mono text-slate-300 mt-0.5">
                      {formattedDueDate}
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[11px] text-slate-400">Bill Total</span>
                    <div className="text-lg font-bold font-mono text-slate-100 tabular-nums">
                      {formatCurrency(bill.amount)}
                    </div>
                  </div>
                </div>

                {/* Category & Notification Window Setting */}
                <div className="flex items-center justify-between text-xs text-slate-400 mb-3">
                  <div className="flex items-center gap-1.5">
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: catMeta?.color || '#94a3b8' }}
                    />
                    <span>{catMeta?.name || bill.category}</span>
                  </div>

                  <div className="flex items-center gap-1 font-mono text-[11px] text-slate-400">
                    <Bell className="w-3 h-3 text-indigo-400" />
                    <span>Alert: {bill.notifyDaysBefore}d before</span>
                  </div>
                </div>

                {bill.notes && (
                  <div className="text-[11px] text-slate-400 italic mb-3 bg-slate-950/40 p-2 rounded-md">
                    {bill.notes}
                  </div>
                )}
              </div>

              {/* Actions Footer */}
              <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => openEditModal(bill)}
                    className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded transition-colors"
                    title="Edit bill details"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onDeleteBill(bill.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded transition-colors"
                    title="Delete reminder"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {bill.isPaid ? (
                  <button
                    type="button"
                    onClick={() => onMarkUnpaid(bill.id)}
                    className="flex items-center gap-1 px-3 py-1 text-xs font-medium text-slate-400 hover:text-slate-200 bg-slate-800/80 hover:bg-slate-800 rounded-lg transition-colors"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Mark Unpaid</span>
                  </button>
                ) : (
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => onMarkPaid(bill.id, false)}
                      className="px-2.5 py-1 text-xs font-medium text-slate-300 hover:text-slate-100 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
                      title="Mark as paid without adding transaction"
                    >
                      Paid
                    </button>
                    <button
                      type="button"
                      onClick={() => onMarkPaid(bill.id, true)}
                      className="flex items-center gap-1 px-3 py-1 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-sm transition-colors"
                      title="Mark as paid AND log into expense ledger"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Pay & Log</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Bill Setup / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden my-8">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
              <h3 className="text-base font-semibold text-slate-100">
                {editingBill ? 'Edit Bill Reminder' : 'Add Bill Reminder'}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-100"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveModal} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Bill Name / Service <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Electric Utility, Fiber Internet"
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
                    Due Day of Month <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    required
                    value={dueDayOfMonth}
                    onChange={(e) => setDueDayOfMonth(parseInt(e.target.value, 10))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Payee / Provider Name
                </label>
                <input
                  type="text"
                  value={payee}
                  onChange={(e) => setPayee(e.target.value)}
                  placeholder="e.g. Con Edison, Verizon"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                />
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
                    {Object.values(CATEGORIES).map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Notify Days in Advance
                  </label>
                  <select
                    value={notifyDaysBefore}
                    onChange={(e) => setNotifyDaysBefore(parseInt(e.target.value, 10))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                  >
                    <option value={1}>1 day before</option>
                    <option value={2}>2 days before</option>
                    <option value={3}>3 days before</option>
                    <option value={5}>5 days before</option>
                    <option value={7}>7 days before</option>
                    <option value={10}>10 days before</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="flex items-center gap-2 cursor-pointer select-none py-1">
                  <input
                    type="checkbox"
                    checked={autoPay}
                    onChange={(e) => setAutoPay(e.target.checked)}
                    className="rounded bg-slate-950 border-slate-700 text-indigo-600 focus:ring-0"
                  />
                  <span className="text-xs text-slate-300">Auto-debit / Auto-pay enabled</span>
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
                  placeholder="e.g. Checking account ending in 4012"
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
                  {editingBill ? 'Save Changes' : 'Create Reminder'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
