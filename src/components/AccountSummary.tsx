import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

const accountTypeColors = {
  cash: 'bg-green-100 text-green-800',
  credit: 'bg-red-100 text-red-800',
  savings: 'bg-blue-100 text-blue-800',
  loans: 'bg-orange-100 text-orange-800',
  investment: 'bg-purple-100 text-purple-800',
};

const accountTypeIcons = {
  cash: '💵',
  credit: '💳',
  savings: '🏦',
  loans: '📋',
  investment: '📈',
};

export default function AccountSummary() {
  const accounts = useQuery(api.accounts.list);

  if (accounts === undefined) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Summary</h3>
        <div className="animate-pulse grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Summary</h3>
      {accounts.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500 mb-4">No accounts yet</p>
          <p className="text-sm text-gray-400">Add your first account to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {accounts.map((account) => (
            <div key={account._id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{accountTypeIcons[account.type]}</span>
                  <h4 className="font-medium text-gray-900">{account.name}</h4>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${accountTypeColors[account.type]}`}>
                  {account.type}
                </span>
              </div>
              <p className={`text-lg font-bold ${
                account.balance >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                ${account.balance.toLocaleString()}
              </p>
              <p className="text-xs text-gray-500 mt-1">{account.currency}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
