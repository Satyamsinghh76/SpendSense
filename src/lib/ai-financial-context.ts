type TxnType = "income" | "expense";

export interface ChatTransaction {
  _id?: string;
  description: string;
  category: string;
  amount: number;
  date: number;
  type: TxnType;
}

export interface ChatBudget {
  _id?: string;
  category: string;
  amount: number;
}

export interface ChatCategory {
  _id?: string;
  name: string;
  type: TxnType;
}

const USD = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2,
});

function formatAmount(value: number) {
  return USD.format(value || 0);
}

function toDateLabel(timestamp: number) {
  return new Date(timestamp).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

export function buildFinancialContextText(
  transactions: ChatTransaction[],
  budgets: ChatBudget[],
  categories: ChatCategory[]
): string {
  const safeTxns = Array.isArray(transactions) ? transactions : [];
  const expenseTxns = safeTxns.filter((t) => t.type === "expense");
  const totalSpending = expenseTxns.reduce((sum, t) => sum + (t.amount || 0), 0);

  const spendingByCategory = new Map<string, number>();
  for (const txn of expenseTxns) {
    const key = txn.category || "Uncategorized";
    spendingByCategory.set(key, (spendingByCategory.get(key) || 0) + (txn.amount || 0));
  }

  const topCategoryLines = [...spendingByCategory.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([category, amount]) => `- ${category}: ${formatAmount(amount)}`);

  const recentTxnLines = [...safeTxns]
    .sort((a, b) => b.date - a.date)
    .slice(0, 8)
    .map((txn) => {
      const sign = txn.type === "income" ? "+" : "-";
      return `- ${toDateLabel(txn.date)} | ${txn.description} | ${txn.category} | ${sign}${formatAmount(txn.amount)}`;
    });

  const budgetMap = new Map((budgets || []).map((b) => [b.category, b.amount]));
  const overspendingLines = [...spendingByCategory.entries()]
    .map(([category, spent]) => {
      const budget = budgetMap.get(category);
      if (!budget || budget <= 0) return null;
      const diff = spent - budget;
      if (diff <= 0) return null;
      return `- ${category}: over by ${formatAmount(diff)} (spent ${formatAmount(spent)} vs budget ${formatAmount(budget)})`;
    })
    .filter((line): line is string => Boolean(line));

  const trackedExpenseCategories = (categories || [])
    .filter((c) => c.type === "expense")
    .map((c) => c.name)
    .slice(0, 20)
    .join(", ");

  return [
    "FINANCIAL SNAPSHOT",
    `Total spending: ${formatAmount(totalSpending)}`,
    "",
    "Category-wise spending:",
    ...(topCategoryLines.length > 0 ? topCategoryLines : ["- No expense data"]),
    "",
    "Recent transactions:",
    ...(recentTxnLines.length > 0 ? recentTxnLines : ["- No transactions"]),
    "",
    "Budget insights:",
    ...(overspendingLines.length > 0 ? overspendingLines : ["- No category is currently over budget based on available budgets"]),
    "",
    `Expense categories tracked: ${trackedExpenseCategories || "None"}`,
  ].join("\n");
}
