import { BillReminder } from '../types/expense';

export type BillUrgencyStatus = 'overdue' | 'due_today' | 'approaching' | 'upcoming' | 'paid';

export interface EvaluatedBill {
  bill: BillReminder;
  status: BillUrgencyStatus;
  daysRemaining: number;
  formattedDueDate: string;
  isTriggeringNotification: boolean;
}

export function evaluateBill(bill: BillReminder, today: Date = new Date()): EvaluatedBill {
  const currentDay = today.getDate();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth() + 1;
  const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();

  const dueDay = Math.min(bill.dueDayOfMonth, daysInMonth);
  const formattedDueDate = `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(
    dueDay
  ).padStart(2, '0')}`;

  if (bill.isPaid) {
    return {
      bill,
      status: 'paid',
      daysRemaining: dueDay - currentDay,
      formattedDueDate,
      isTriggeringNotification: false,
    };
  }

  const daysRemaining = dueDay - currentDay;

  if (daysRemaining < 0) {
    return {
      bill,
      status: 'overdue',
      daysRemaining,
      formattedDueDate,
      isTriggeringNotification: true,
    };
  }

  if (daysRemaining === 0) {
    return {
      bill,
      status: 'due_today',
      daysRemaining: 0,
      formattedDueDate,
      isTriggeringNotification: true,
    };
  }

  if (daysRemaining <= bill.notifyDaysBefore) {
    return {
      bill,
      status: 'approaching',
      daysRemaining,
      formattedDueDate,
      isTriggeringNotification: true,
    };
  }

  return {
    bill,
    status: 'upcoming',
    daysRemaining,
    formattedDueDate,
    isTriggeringNotification: false,
  };
}

export function evaluateAllBills(bills: BillReminder[], today: Date = new Date()): EvaluatedBill[] {
  return bills
    .map((b) => evaluateBill(b, today))
    .sort((a, b) => {
      // Sort priority: overdue -> due_today -> approaching -> upcoming -> paid
      const order: Record<BillUrgencyStatus, number> = {
        overdue: 0,
        due_today: 1,
        approaching: 2,
        upcoming: 3,
        paid: 4,
      };
      if (order[a.status] !== order[b.status]) {
        return order[a.status] - order[b.status];
      }
      return a.daysRemaining - b.daysRemaining;
    });
}

export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) {
    return false;
  }
  if (Notification.permission === 'granted') {
    return true;
  }
  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }
  return false;
}

export function triggerSystemNotification(title: string, body: string): void {
  if ('Notification' in window && Notification.permission === 'granted') {
    try {
      new Notification(title, {
        body,
        icon: '/favicon.ico',
      });
    } catch (e) {
      console.warn('System notification failed:', e);
    }
  }
}
