/**
 * Guest-aware data hooks.
 *
 * Each hook wraps a Convex useQuery / useMutation. When the user is a guest,
 * the Convex call is skipped and data comes from the local guest-store instead.
 * Components can call these hooks exactly like the originals — no other changes needed.
 */
import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/api";
import { useGuestAuth } from "@/features/auth/GuestAuthContext";
import { useGuestData, guestStore } from "@/lib/guest-store";

// ── Query Hooks ──────────────────────────────────────

export function useLoggedInUser() {
  const { isGuest, guestUser } = useGuestAuth();
  const real = useQuery(api.auth.loggedInUser, isGuest ? "skip" : undefined);
  return isGuest ? guestUser : real;
}

export function useAccountsList() {
  const { isGuest } = useGuestAuth();
  const gd = useGuestData();
  const real = useQuery(api.accounts.list, isGuest ? "skip" : {});
  return isGuest ? gd.accounts : real;
}

export function useBalanceSummary() {
  const { isGuest } = useGuestAuth();
  const gd = useGuestData();
  const real = useQuery(api.accounts.getBalanceSummary, isGuest ? "skip" : {});
  if (!isGuest) return real;

  const summary = { totalAssets: 0, totalLiabilities: 0, netWorth: 0, byType: {} as Record<string, number> };
  gd.accounts.forEach((a) => {
    if (a.type === "loans" || a.type === "credit") {
      summary.totalLiabilities += Math.abs(a.balance);
    } else {
      summary.totalAssets += a.balance;
    }
    summary.byType[a.type] = (summary.byType[a.type] || 0) + a.balance;
  });
  summary.netWorth = summary.totalAssets - summary.totalLiabilities;
  return summary;
}

export function useTransactionsList(args: {
  accountId?: any;
  category?: string;
  startDate?: number;
  endDate?: number;
  limit?: number;
}) {
  const { isGuest } = useGuestAuth();
  const gd = useGuestData();
  const real = useQuery(api.transactions.list, isGuest ? "skip" : args);
  if (!isGuest) return real;

  let txs = [...gd.transactions].sort((a, b) => b.date - a.date);
  if (args.accountId) txs = txs.filter((t) => t.accountId === args.accountId);
  if (args.category) txs = txs.filter((t) => t.category === args.category);
  if (args.startDate) txs = txs.filter((t) => t.date >= args.startDate!);
  if (args.endDate) txs = txs.filter((t) => t.date <= args.endDate!);
  return txs.slice(0, args.limit || 50);
}

export function useExpenseBreakdown(args: { startDate: number; endDate: number }) {
  const { isGuest } = useGuestAuth();
  const gd = useGuestData();
  const real = useQuery(api.transactions.getExpenseBreakdown, isGuest ? "skip" : args);
  if (!isGuest) return real;

  const breakdown: Record<string, number> = {};
  gd.transactions.forEach((t) => {
    if (t.type === "expense" && t.date >= args.startDate && t.date <= args.endDate) {
      breakdown[t.category] = (breakdown[t.category] || 0) + t.amount;
    }
  });
  return Object.entries(breakdown).map(([category, amount]) => ({ category, amount }));
}

export function useDailySpending(args: { startDate: number; endDate: number }) {
  const { isGuest } = useGuestAuth();
  const gd = useGuestData();
  const real = useQuery(api.transactions.getDailySpending, isGuest ? "skip" : args);
  if (!isGuest) return real;

  const daily: Record<string, { income: number; expense: number }> = {};
  gd.transactions.forEach((t) => {
    if (t.date >= args.startDate && t.date <= args.endDate) {
      const date = new Date(t.date).toISOString().split("T")[0];
      if (!daily[date]) daily[date] = { income: 0, expense: 0 };
      if (t.type === "income") daily[date].income += t.amount;
      else if (t.type === "expense") daily[date].expense += t.amount;
    }
  });
  return Object.entries(daily)
    .map(([date, d]) => ({ date, ...d }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

export function useCategoriesList() {
  const { isGuest } = useGuestAuth();
  const gd = useGuestData();
  const real = useQuery(api.categories.list, isGuest ? "skip" : {});
  return isGuest ? gd.categories : real;
}

export function useBudgetsList(args: { period: string }) {
  const { isGuest } = useGuestAuth();
  const gd = useGuestData();
  const real = useQuery(api.budgets.list, isGuest ? "skip" : args);
  return isGuest ? gd.budgets.filter((b) => b.period === args.period) : real;
}

export function useBudgetComparison(args: { period: string }) {
  const { isGuest } = useGuestAuth();
  const gd = useGuestData();
  const real = useQuery(api.budgets.getBudgetComparison, isGuest ? "skip" : args);
  if (!isGuest) return real;

  const budgets = gd.budgets.filter((b) => b.period === args.period);
  const [year, month] = args.period.split("-");
  const startDate = new Date(parseInt(year), parseInt(month) - 1, 1).getTime();
  const endDate = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59).getTime();
  const spending: Record<string, number> = {};
  gd.transactions.forEach((t) => {
    if (t.type === "expense" && t.date >= startDate && t.date <= endDate) {
      spending[t.category] = (spending[t.category] || 0) + t.amount;
    }
  });
  return budgets.map((b) => ({
    category: b.category,
    budgeted: b.amount,
    spent: spending[b.category] || 0,
    remaining: b.amount - (spending[b.category] || 0),
    percentage: ((spending[b.category] || 0) / b.amount) * 100,
  }));
}

export function useRecurringTransactionsList() {
  const { isGuest } = useGuestAuth();
  const gd = useGuestData();
  const real = useQuery(api.recurringTransactions.list, isGuest ? "skip" : {});
  return isGuest ? gd.recurringTransactions : real;
}

// ── Mutation Hooks ───────────────────────────────────

export function useInitializeUserData() {
  const { isGuest } = useGuestAuth();
  const real = useMutation(api.auth.initializeUserData);
  return isGuest ? guestStore.initializeUserData : real;
}

export function useCreateTransaction() {
  const { isGuest } = useGuestAuth();
  const real = useMutation(api.transactions.create);
  return isGuest ? guestStore.createTransaction : real;
}

export function useUpdateTransaction() {
  const { isGuest } = useGuestAuth();
  const real = useMutation(api.transactions.update);
  return isGuest ? guestStore.updateTransaction : real;
}

export function useRemoveTransaction() {
  const { isGuest } = useGuestAuth();
  const real = useMutation(api.transactions.remove);
  return isGuest ? guestStore.removeTransaction : real;
}

export function useCreateAccount() {
  const { isGuest } = useGuestAuth();
  const real = useMutation(api.accounts.create);
  return isGuest ? guestStore.createAccount : real;
}

export function useUpdateAccount() {
  const { isGuest } = useGuestAuth();
  const real = useMutation(api.accounts.update);
  return isGuest ? guestStore.updateAccount : real;
}

export function useRemoveAccount() {
  const { isGuest } = useGuestAuth();
  const real = useMutation(api.accounts.remove);
  return isGuest ? guestStore.removeAccount : real;
}

export function useUpsertBudget() {
  const { isGuest } = useGuestAuth();
  const real = useMutation(api.budgets.upsert);
  return isGuest ? guestStore.upsertBudget : real;
}

export function useRemoveBudget() {
  const { isGuest } = useGuestAuth();
  const real = useMutation(api.budgets.remove);
  return isGuest ? guestStore.removeBudget : real;
}

export function useCreateRecurringTransaction() {
  const { isGuest } = useGuestAuth();
  const real = useMutation(api.recurringTransactions.create);
  return isGuest ? guestStore.createRecurringTransaction : real;
}

export function useUpdateRecurringTransaction() {
  const { isGuest } = useGuestAuth();
  const real = useMutation(api.recurringTransactions.update);
  return isGuest ? guestStore.updateRecurringTransaction : real;
}

export function useRemoveRecurringTransaction() {
  const { isGuest } = useGuestAuth();
  const real = useMutation(api.recurringTransactions.remove);
  return isGuest ? guestStore.removeRecurringTransaction : real;
}
