import { useTransactionsList } from "@/lib/data-hooks";

export default function RecentTransactions() {
  const transactions = useTransactionsList({ limit: 5 });

  if (transactions === undefined) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Transactions</h3>
        <div className="animate-pulse space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex justify-between items-center">
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Transactions</h3>
      {transactions.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500 mb-4">No transactions yet</p>
          <p className="text-sm text-gray-400">Start by adding your first transaction</p>
        </div>
      ) : (
        <div className="space-y-3">
          {transactions.map((transaction) => (
            <div key={transaction._id} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
              <div className="flex-1">
                <p className="font-medium text-gray-900 text-sm">{transaction.description}</p>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span>{transaction.category}</span>
                  <span>•</span>
                  <span>{transaction.accountName}</span>
                  <span>•</span>
                  <span>{new Date(transaction.date).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="text-right">
                <p className={`font-medium text-sm ${
                  transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toFixed(2)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
