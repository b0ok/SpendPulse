# SpendPulse — Expense & Budget Intelligence

**SpendPulse** is a personal finance management and expense intelligence platform built with React 19, TypeScript, and Tailwind CSS. It is designed to provide actionable spending habit analytics, monthly budgeting controls with visual overrun alerts, bill payment reminder notifications, and automated recurring expense logging.

---

## Key Features

### 1. Category Budgeting & Visual Spending Limits
- **Monthly Spending Limits**: Set custom monthly caps for essential and discretionary categories, including Groceries, Entertainment, Transportation, Housing, Food & Dining, Utilities, and Shopping.
- **Visual Alert Thresholds**:
  - **On Track (< 80% spent)**: Emerald progress gauge and safe remaining cushion.
  - **Approaching Limit (80%–99% spent)**: Amber warning indicator displaying the exact remaining buffer.
  - **Exceeded Budget (≥ 100% spent)**: High-visibility rose alert badge and banner highlighting the deficit and over-budget amount.
- **Inline Limit Adjustments**: Click directly on any category's limit in the dashboard to modify target thresholds on the fly without navigating away.
- **Budget Health Filtering**: Filter views by *All*, *Exceeded*, *Approaching 80%+*, or *Healthy* categories.

### 2. Bill Payment Reminders & Scheduled Alerts
- **Configurable Due Dates**: Input recurring monthly bills (utilities, internet, insurance, tuition, loans) with designated due days.
- **Configurable Advance Notifications**: Customize advance warning windows per bill (e.g., 1, 2, 3, 5, 7, or 10 days before due date).
- **Urgency Classification**: Real-time status detection categorized into *Overdue*, *Due Today*, *Due Soon (Approaching)*, or *Settled*.
- **Native Browser Notifications**: Integrated with the Web Notification API to send desktop alerts as due dates approach.
- **One-Click Pay & Log**: Settle bills with a single click, with an optional instant action to automatically record the payment in your transaction ledger.
- **Central Notification Center**: Top Bar bell icon featuring an unread alert badge and a unified panel displaying upcoming bills and budget threshold warnings.

### 3. Automated Recurring Expenses Engine
- **Scheduled Commitments**: Manage fixed monthly commitments such as apartment rent, media subscriptions, fitness memberships, and auto loans.
- **Automated Logging**: The engine monitors scheduled dates each monthly cycle and automatically injects due expenses into the ledger, preventing duplicate entries.
- **Rule Management**: Easily edit amounts, change scheduled days, toggle pause/active states, or cancel rules at any time.
- **On-Demand Processing**: Includes a "Process Due Rules" manual trigger and individual "Log Now" actions.

### 4. Visual Analytics & Spending Habits
- **Daily Spending Velocity & Burn Curve**: Interactive SVG chart displaying day-to-day transaction spikes alongside cumulative month-to-date progression with hover crosshair tooltips.
- **Category Donut Distribution**: Segmented SVG donut chart with interactive hover highlighting and wallet-share percentage breakdown.
- **Month-over-Month Trajectory**: 6-month historical comparative bar chart segmenting essential needs versus discretionary wants, complete with percentage deltas.
- **Weekend vs. Weekday Intensity**: Compares average daily weekend outflow against weekday spending to highlight habit surges.
- **50/30/20 Budget Model**: Classifies transactions into Essential Needs vs. Discretionary Wants, measuring alignment against the 50/30 rule.
- **Weekly Rhythm**: Day-of-the-week breakdown (Monday through Sunday) to uncover weekly spending patterns.
- **Top Merchant Leaderboard**: Ranked overview of highest-volume payees and purchase frequencies.

### 5. High-Density Transaction Ledger & Data Portability
- **Ledger Controls**: Live text search across payees, descriptions, and notes; category filters; and sorting by date, amount, payee, or description.
- **Batch Operations**: Select multiple transactions for bulk deletion or duplication.
- **Data Portability**: Full CSV export for spreadsheets, JSON backups, file restoration, and a 1-click sample dataset restore.

---

## Tech Stack & Architecture

- **Framework**: React 19 (Hooks, Functional Components, Strict Mode)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4 (`@theme` font configuration)
- **Typography**: Plus Jakarta Sans (Display/Body) and JetBrains Mono (`tabular-nums` for financial data)
- **Icons**: Lucide React
- **Animations**: Motion
- **Build Tool**: Vite
- **Storage**: Client-side `localStorage` persistence with JSON backup and CSV export

---

## Project Structure

```
├── src/
│   ├── components/
│   │   ├── budget/
│   │   │   └── BudgetDashboardView.tsx      # Category limits & overrun alerts
│   │   ├── charts/
│   │   │   ├── CategoryDonutChart.tsx       # Interactive SVG donut chart
│   │   │   ├── DailySpendTrendChart.tsx     # Area & daily spike velocity chart
│   │   │   ├── MonthOverMonthBarChart.tsx   # 6-month comparative bar chart
│   │   │   └── SpendingHabitsView.tsx       # Behavioral habits & cadence
│   │   ├── recurring/
│   │   │   └── RecurringExpensesView.tsx    # Automated recurring expenses
│   │   ├── reminders/
│   │   │   └── BillRemindersView.tsx        # Bill due dates & notifications
│   │   ├── BudgetManagerModal.tsx           # Full budget configuration modal
│   │   ├── DataBackupModal.tsx              # Export/Import CSV & JSON
│   │   ├── ExpenseFormModal.tsx             # Add & Edit expense modal
│   │   ├── ExpenseTable.tsx                 # High-density transaction table
│   │   ├── MetricCards.tsx                  # Monthly KPI summary cards
│   │   ├── MonthSelector.tsx                # Month cycle navigation
│   │   ├── NotificationCenterModal.tsx      # System alert center modal
│   │   └── TopBar.tsx                       # Strict 3-zone navigation bar
│   ├── data/
│   │   ├── categories.ts                    # Category definitions & color palette
│   │   ├── initialBillsAndRecurring.ts      # Seed bills and recurring rules
│   │   └── initialExpenses.ts               # Multi-month demo dataset
│   ├── types/
│   │   └── expense.ts                       # TypeScript interfaces & types
│   ├── utils/
│   │   ├── analytics.ts                     # Financial formulas & aggregations
│   │   ├── billReminders.ts                 # Notification & urgency evaluator
│   │   ├── recurringEngine.ts               # Auto-logging recurring logic
│   │   └── storage.ts                       # Persistence & backup utilities
│   ├── App.tsx                              # Main application coordinator
│   ├── index.css                            # Tailwind CSS setup & theme
│   └── main.tsx                             # Application entry point
├── metadata.json                            # AI Studio applet metadata
├── package.json
└── vite.config.ts
```

---

## Getting Started

### Prerequisites
- Node.js (v18 or newer recommended)
- npm or yarn

### Installation
```bash
npm install
```

### Development
Start the local development server:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build
Compile and bundle for production:
```bash
npm run build
```

### Type Checking & Linting
Validate syntax and TypeScript types:
```bash
npm run lint
```

---

## Privacy & Data Ownership

SpendPulse runs completely client-side. All expense ledgers, budget configurations, scheduled bills, and recurring commitments are stored securely in your browser's local storage. No financial data is sent to external servers. You can export complete backups in JSON or CSV format at any time.
