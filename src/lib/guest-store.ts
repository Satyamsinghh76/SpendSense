import { useSyncExternalStore } from "react";

// ── Types ────────────────────────────────────────────
interface GuestAccount {
  _id: string;
  _creationTime: number;
  userId: string;
  name: string;
  type: "cash" | "credit" | "savings" | "loans" | "investment";
  balance: number;
  currency: string;
  isShared: boolean;
  color: string;
}

interface GuestTransaction {
  _id: string;
  _creationTime: number;
  userId: string;
  accountId: string;
  amount: number;
  description: string;
  category: string;
  type: "income" | "expense" | "transfer";
  date: number;
  isRecurring: boolean;
  tags?: string[];
  accountName: string;
}

interface GuestCategory {
  _id: string;
  _creationTime: number;
  userId: string;
  name: string;
  type: "income" | "expense";
  color: string;
  icon: string;
  isDefault: boolean;
}

interface GuestBudget {
  _id: string;
  _creationTime: number;
  userId: string;
  category: string;
  amount: number;
  period: string;
  spent: number;
  currency: string;
}

interface GuestRecurringTransaction {
  _id: string;
  _creationTime: number;
  userId: string;
  accountId: string;
  amount: number;
  description: string;
  category: string;
  type: "income" | "expense";
  frequency: "daily" | "weekly" | "monthly" | "yearly";
  startDate: number;
  endDate?: number;
  isActive: boolean;
  lastProcessed?: number;
  nextDue: number;
  accountName: string;
}

export interface GuestData {
  accounts: GuestAccount[];
  transactions: GuestTransaction[];
  categories: GuestCategory[];
  budgets: GuestBudget[];
  recurringTransactions: GuestRecurringTransaction[];
}

// ── Demo Data ────────────────────────────────────────
const DAY = 86_400_000;

function createDefaultData(): GuestData {
  const now = Date.now();
  const today = new Date();
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1).getTime();
  const currentPeriod = today.toISOString().slice(0, 7);

  return {
    accounts: [
      { _id: "g-acc-1", _creationTime: now, userId: "guest-user", name: "Main Wallet", type: "cash", balance: 2450, currency: "USD", isShared: false, color: "#3B82F6" },
      { _id: "g-acc-2", _creationTime: now, userId: "guest-user", name: "Savings", type: "savings", balance: 12500, currency: "USD", isShared: false, color: "#10B981" },
      { _id: "g-acc-3", _creationTime: now, userId: "guest-user", name: "Credit Card", type: "credit", balance: -890, currency: "USD", isShared: false, color: "#EF4444" },
    ],
    transactions: [
      { _id: "g-tx-1", _creationTime: monthStart + 1 * DAY, userId: "guest-user", accountId: "g-acc-1", amount: 3500, description: "Monthly Salary", category: "Salary", type: "income", date: monthStart + 1 * DAY, isRecurring: false, accountName: "Main Wallet" },
      { _id: "g-tx-2", _creationTime: monthStart + 3 * DAY, userId: "guest-user", accountId: "g-acc-1", amount: 87.5, description: "Grocery Shopping", category: "Food & Dining", type: "expense", date: monthStart + 3 * DAY, isRecurring: false, accountName: "Main Wallet" },
      { _id: "g-tx-3", _creationTime: monthStart + 5 * DAY, userId: "guest-user", accountId: "g-acc-1", amount: 24, description: "Uber Ride", category: "Transportation", type: "expense", date: monthStart + 5 * DAY, isRecurring: false, accountName: "Main Wallet" },
      { _id: "g-tx-4", _creationTime: monthStart + 6 * DAY, userId: "guest-user", accountId: "g-acc-3", amount: 15.99, description: "Netflix Subscription", category: "Entertainment", type: "expense", date: monthStart + 6 * DAY, isRecurring: false, accountName: "Credit Card" },
      { _id: "g-tx-5", _creationTime: monthStart + 8 * DAY, userId: "guest-user", accountId: "g-acc-1", amount: 18.5, description: "Lunch with Friends", category: "Food & Dining", type: "expense", date: monthStart + 8 * DAY, isRecurring: false, accountName: "Main Wallet" },
      { _id: "g-tx-6", _creationTime: monthStart + 10 * DAY, userId: "guest-user", accountId: "g-acc-1", amount: 500, description: "Freelance Project", category: "Freelance", type: "income", date: monthStart + 10 * DAY, isRecurring: false, accountName: "Main Wallet" },
      { _id: "g-tx-7", _creationTime: now - 2 * DAY, userId: "guest-user", accountId: "g-acc-1", amount: 45, description: "Gas Station", category: "Transportation", type: "expense", date: now - 2 * DAY, isRecurring: false, accountName: "Main Wallet" },
      { _id: "g-tx-8", _creationTime: now - DAY, userId: "guest-user", accountId: "g-acc-3", amount: 120, description: "Online Shopping", category: "Shopping", type: "expense", date: now - DAY, isRecurring: false, accountName: "Credit Card" },
      { _id: "g-tx-9", _creationTime: now, userId: "guest-user", accountId: "g-acc-1", amount: 5.5, description: "Morning Coffee", category: "Food & Dining", type: "expense", date: now, isRecurring: false, accountName: "Main Wallet" },
      { _id: "g-tx-10", _creationTime: now, userId: "guest-user", accountId: "g-acc-1", amount: 85, description: "Electricity Bill", category: "Bills & Utilities", type: "expense", date: now, isRecurring: false, accountName: "Main Wallet" },
    ],
    categories: [
      { _id: "g-cat-1", _creationTime: now, userId: "guest-user", name: "Food & Dining", type: "expense", color: "#FF6B6B", icon: "\u{1F37D}\u{FE0F}", isDefault: true },
      { _id: "g-cat-2", _creationTime: now, userId: "guest-user", name: "Transportation", type: "expense", color: "#4ECDC4", icon: "\u{1F697}", isDefault: true },
      { _id: "g-cat-3", _creationTime: now, userId: "guest-user", name: "Shopping", type: "expense", color: "#45B7D1", icon: "\u{1F6CD}\u{FE0F}", isDefault: true },
      { _id: "g-cat-4", _creationTime: now, userId: "guest-user", name: "Entertainment", type: "expense", color: "#96CEB4", icon: "\u{1F3AC}", isDefault: true },
      { _id: "g-cat-5", _creationTime: now, userId: "guest-user", name: "Bills & Utilities", type: "expense", color: "#FFEAA7", icon: "\u{1F4A1}", isDefault: true },
      { _id: "g-cat-6", _creationTime: now, userId: "guest-user", name: "Healthcare", type: "expense", color: "#DDA0DD", icon: "\u{1F3E5}", isDefault: true },
      { _id: "g-cat-7", _creationTime: now, userId: "guest-user", name: "Education", type: "expense", color: "#98D8C8", icon: "\u{1F4DA}", isDefault: true },
      { _id: "g-cat-8", _creationTime: now, userId: "guest-user", name: "Travel", type: "expense", color: "#F7DC6F", icon: "\u{2708}\u{FE0F}", isDefault: true },
      { _id: "g-cat-9", _creationTime: now, userId: "guest-user", name: "Salary", type: "income", color: "#52C41A", icon: "\u{1F4B0}", isDefault: true },
      { _id: "g-cat-10", _creationTime: now, userId: "guest-user", name: "Freelance", type: "income", color: "#1890FF", icon: "\u{1F4BC}", isDefault: true },
      { _id: "g-cat-11", _creationTime: now, userId: "guest-user", name: "Investment", type: "income", color: "#722ED1", icon: "\u{1F4C8}", isDefault: true },
      { _id: "g-cat-12", _creationTime: now, userId: "guest-user", name: "Other Income", type: "income", color: "#13C2C2", icon: "\u{1F4B5}", isDefault: true },
    ],
    budgets: [
      { _id: "g-bud-1", _creationTime: now, userId: "guest-user", category: "Food & Dining", amount: 500, period: currentPeriod, spent: 0, currency: "USD" },
      { _id: "g-bud-2", _creationTime: now, userId: "guest-user", category: "Transportation", amount: 200, period: currentPeriod, spent: 0, currency: "USD" },
      { _id: "g-bud-3", _creationTime: now, userId: "guest-user", category: "Entertainment", amount: 150, period: currentPeriod, spent: 0, currency: "USD" },
    ],
    recurringTransactions: [
      { _id: "g-rec-1", _creationTime: now, userId: "guest-user", accountId: "g-acc-1", amount: 3500, description: "Monthly Salary", category: "Salary", type: "income", frequency: "monthly", startDate: now - 30 * DAY, isActive: true, nextDue: now + 17 * DAY, accountName: "Main Wallet" },
      { _id: "g-rec-2", _creationTime: now, userId: "guest-user", accountId: "g-acc-3", amount: 15.99, description: "Netflix", category: "Entertainment", type: "expense", frequency: "monthly", startDate: now - 30 * DAY, isActive: true, nextDue: now + 23 * DAY, accountName: "Credit Card" },
    ],
  };
}

// ── Reactive Store ───────────────────────────────────
const STORAGE_KEY = "spendsense_guest_data";

function loadData(): GuestData {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch { /* ignore parse errors */ }
  return createDefaultData();
}

function saveData(d: GuestData) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(d));
}

let data = loadData();
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
}

function getSnapshot(): GuestData {
  return data;
}

function update(fn: (prev: GuestData) => GuestData) {
  data = fn(data);
  saveData(data);
  listeners.forEach((l) => l());
}

/** React hook — subscribes to store and re-renders on changes */
export function useGuestData(): GuestData {
  return useSyncExternalStore(subscribe, getSnapshot);
}

// ── ID Generator ─────────────────────────────────────
let idCounter = Date.now();
function nextId(prefix: string) {
  return `${prefix}-${++idCounter}`;
}

// ── CRUD Operations ──────────────────────────────────
export const guestStore = {
  // Accounts
  createAccount: async (args: any) => {
    const id = nextId("g-acc");
    update((prev) => ({
      ...prev,
      accounts: [
        ...prev.accounts,
        {
          _id: id, _creationTime: Date.now(), userId: "guest-user",
          name: args.name, type: args.type, balance: args.balance,
          currency: args.currency, isShared: false, color: args.color,
        },
      ],
    }));
    return id;
  },

  updateAccount: async (args: any) => {
    update((prev) => ({
      ...prev,
      accounts: prev.accounts.map((a) => {
        if (a._id !== args.id) return a;
        const u: any = {};
        if (args.name !== undefined) u.name = args.name;
        if (args.balance !== undefined) u.balance = args.balance;
        if (args.color !== undefined) u.color = args.color;
        return { ...a, ...u };
      }),
    }));
  },

  removeAccount: async (args: any) => {
    update((prev) => ({
      ...prev,
      accounts: prev.accounts.filter((a) => a._id !== args.id),
      transactions: prev.transactions.filter((t) => t.accountId !== args.id),
      recurringTransactions: prev.recurringTransactions.filter((r) => r.accountId !== args.id),
    }));
  },

  // Transactions
  createTransaction: async (args: any) => {
    const id = nextId("g-tx");
    const accountName = data.accounts.find((a) => a._id === args.accountId)?.name || "Unknown";
    update((prev) => ({
      ...prev,
      transactions: [
        {
          _id: id, _creationTime: Date.now(), userId: "guest-user",
          accountId: args.accountId, amount: args.amount, description: args.description,
          category: args.category, type: args.type, date: args.date || Date.now(),
          isRecurring: false, tags: args.tags, accountName,
        },
        ...prev.transactions,
      ],
      accounts: prev.accounts.map((a) => {
        if (a._id !== args.accountId) return a;
        const change = args.type === "expense" ? -args.amount : args.amount;
        return { ...a, balance: a.balance + change };
      }),
    }));
    return id;
  },

  updateTransaction: async (args: any) => {
    update((prev) => {
      const tx = prev.transactions.find((t) => t._id === args.id);
      if (!tx) return prev;
      const u: any = {};
      if (args.amount !== undefined) u.amount = args.amount;
      if (args.description !== undefined) u.description = args.description;
      if (args.category !== undefined) u.category = args.category;
      if (args.tags !== undefined) u.tags = args.tags;

      let accounts = prev.accounts;
      if (args.amount !== undefined && args.amount !== tx.amount) {
        accounts = accounts.map((a) => {
          if (a._id !== tx.accountId) return a;
          const oldC = tx.type === "expense" ? -tx.amount : tx.amount;
          const newC = tx.type === "expense" ? -args.amount : args.amount;
          return { ...a, balance: a.balance - oldC + newC };
        });
      }
      return {
        ...prev,
        transactions: prev.transactions.map((t) => (t._id === args.id ? { ...t, ...u } : t)),
        accounts,
      };
    });
  },

  removeTransaction: async (args: any) => {
    update((prev) => {
      const tx = prev.transactions.find((t) => t._id === args.id);
      if (!tx) return prev;
      return {
        ...prev,
        transactions: prev.transactions.filter((t) => t._id !== args.id),
        accounts: prev.accounts.map((a) => {
          if (a._id !== tx.accountId) return a;
          const revert = tx.type === "expense" ? tx.amount : -tx.amount;
          return { ...a, balance: a.balance + revert };
        }),
      };
    });
  },

  // Budgets
  upsertBudget: async (args: any) => {
    update((prev) => {
      const existing = prev.budgets.find((b) => b.category === args.category && b.period === args.period);
      if (existing) {
        return { ...prev, budgets: prev.budgets.map((b) => (b._id === existing._id ? { ...b, amount: args.amount } : b)) };
      }
      return {
        ...prev,
        budgets: [
          ...prev.budgets,
          { _id: nextId("g-bud"), _creationTime: Date.now(), userId: "guest-user", category: args.category, amount: args.amount, period: args.period, spent: 0, currency: args.currency },
        ],
      };
    });
  },

  removeBudget: async (args: any) => {
    update((prev) => ({ ...prev, budgets: prev.budgets.filter((b) => b._id !== args.id) }));
  },

  // Recurring Transactions
  createRecurringTransaction: async (args: any) => {
    const id = nextId("g-rec");
    const accountName = data.accounts.find((a) => a._id === args.accountId)?.name || "Unknown";
    const freqMs: Record<string, number> = { daily: DAY, weekly: 7 * DAY, monthly: 30 * DAY, yearly: 365 * DAY };
    update((prev) => ({
      ...prev,
      recurringTransactions: [
        ...prev.recurringTransactions,
        {
          _id: id, _creationTime: Date.now(), userId: "guest-user",
          accountId: args.accountId, amount: args.amount, description: args.description,
          category: args.category, type: args.type, frequency: args.frequency,
          startDate: args.startDate, endDate: args.endDate, isActive: true,
          nextDue: args.startDate + (freqMs[args.frequency] || 30 * DAY), accountName,
        },
      ],
    }));
    return id;
  },

  updateRecurringTransaction: async (args: any) => {
    update((prev) => ({
      ...prev,
      recurringTransactions: prev.recurringTransactions.map((rt) => {
        if (rt._id !== args.id) return rt;
        const u: any = {};
        if (args.amount !== undefined) u.amount = args.amount;
        if (args.description !== undefined) u.description = args.description;
        if (args.category !== undefined) u.category = args.category;
        if (args.frequency !== undefined) u.frequency = args.frequency;
        if (args.isActive !== undefined) u.isActive = args.isActive;
        if (args.endDate !== undefined) u.endDate = args.endDate;
        return { ...rt, ...u };
      }),
    }));
  },

  removeRecurringTransaction: async (args: any) => {
    update((prev) => ({
      ...prev,
      recurringTransactions: prev.recurringTransactions.filter((rt) => rt._id !== args.id),
    }));
  },

  initializeUserData: async () => ({ message: "Guest data initialized" }),
};
