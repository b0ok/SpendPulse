import { CategoryId, CategoryMeta } from '../types/expense';

export const CATEGORIES: Record<CategoryId, CategoryMeta> = {
  housing: {
    id: 'housing',
    name: 'Housing & Rent',
    icon: 'Home',
    color: '#38bdf8', // sky-400
    tailwindBg: 'bg-sky-500/10',
    tailwindText: 'text-sky-400',
    tailwindBorder: 'border-sky-500/20',
    defaultBudget: 1800,
    classification: 'essential',
  },
  groceries: {
    id: 'groceries',
    name: 'Groceries & Market',
    icon: 'ShoppingCart',
    color: '#34d399', // emerald-400
    tailwindBg: 'bg-emerald-500/10',
    tailwindText: 'text-emerald-400',
    tailwindBorder: 'border-emerald-500/20',
    defaultBudget: 550,
    classification: 'essential',
  },
  food_dining: {
    id: 'food_dining',
    name: 'Food & Dining Out',
    icon: 'Utensils',
    color: '#fb923c', // orange-400
    tailwindBg: 'bg-orange-500/10',
    tailwindText: 'text-orange-400',
    tailwindBorder: 'border-orange-500/20',
    defaultBudget: 400,
    classification: 'discretionary',
  },
  transportation: {
    id: 'transportation',
    name: 'Transportation & Transit',
    icon: 'Car',
    color: '#a78bfa', // purple-400
    tailwindBg: 'bg-purple-500/10',
    tailwindText: 'text-purple-400',
    tailwindBorder: 'border-purple-500/20',
    defaultBudget: 220,
    classification: 'essential',
  },
  utilities: {
    id: 'utilities',
    name: 'Utilities & Bills',
    icon: 'Zap',
    color: '#facc15', // yellow-400
    tailwindBg: 'bg-yellow-500/10',
    tailwindText: 'text-yellow-400',
    tailwindBorder: 'border-yellow-500/20',
    defaultBudget: 240,
    classification: 'essential',
  },
  entertainment: {
    id: 'entertainment',
    name: 'Entertainment & Leisure',
    icon: 'Film',
    color: '#f472b6', // pink-400
    tailwindBg: 'bg-pink-500/10',
    tailwindText: 'text-pink-400',
    tailwindBorder: 'border-pink-500/20',
    defaultBudget: 200,
    classification: 'discretionary',
  },
  health_wellness: {
    id: 'health_wellness',
    name: 'Health & Wellness',
    icon: 'HeartPulse',
    color: '#2dd4bf', // teal-400
    tailwindBg: 'bg-teal-500/10',
    tailwindText: 'text-teal-400',
    tailwindBorder: 'border-teal-500/20',
    defaultBudget: 160,
    classification: 'essential',
  },
  shopping: {
    id: 'shopping',
    name: 'Shopping & Goods',
    icon: 'ShoppingBag',
    color: '#818cf8', // indigo-400
    tailwindBg: 'bg-indigo-500/10',
    tailwindText: 'text-indigo-400',
    tailwindBorder: 'border-indigo-500/20',
    defaultBudget: 250,
    classification: 'discretionary',
  },
  personal_care: {
    id: 'personal_care',
    name: 'Personal Care',
    icon: 'Sparkles',
    color: '#e879f9', // fuchsia-400
    tailwindBg: 'bg-fuchsia-500/10',
    tailwindText: 'text-fuchsia-400',
    tailwindBorder: 'border-fuchsia-500/20',
    defaultBudget: 120,
    classification: 'discretionary',
  },
  subscriptions: {
    id: 'subscriptions',
    name: 'Subscriptions & Software',
    icon: 'Repeat',
    color: '#60a5fa', // blue-400
    tailwindBg: 'bg-blue-500/10',
    tailwindText: 'text-blue-400',
    tailwindBorder: 'border-blue-500/20',
    defaultBudget: 90,
    classification: 'discretionary',
  },
  travel: {
    id: 'travel',
    name: 'Travel & Vacations',
    icon: 'Plane',
    color: '#fdba74', // amber-300
    tailwindBg: 'bg-amber-500/10',
    tailwindText: 'text-amber-400',
    tailwindBorder: 'border-amber-500/20',
    defaultBudget: 200,
    classification: 'discretionary',
  },
  other: {
    id: 'other',
    name: 'Miscellaneous',
    icon: 'CircleHelp',
    color: '#94a3b8', // slate-400
    tailwindBg: 'bg-slate-500/10',
    tailwindText: 'text-slate-400',
    tailwindBorder: 'border-slate-500/20',
    defaultBudget: 100,
    classification: 'discretionary',
  },
};

export const CATEGORY_LIST = Object.values(CATEGORIES);

export const DEFAULT_BUDGETS: Record<CategoryId, number> = Object.fromEntries(
  CATEGORY_LIST.map((cat) => [cat.id, cat.defaultBudget])
) as Record<CategoryId, number>;
