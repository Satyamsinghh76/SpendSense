import { useBudgetComparison } from "@/lib/data-hooks";

interface BudgetProgressProps {
  period: string;
}

export default function BudgetProgress({ period }: BudgetProgressProps) {
  const budgetComparison = useBudgetComparison({ period });

  if (budgetComparison === undefined) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Budget Progress</h3>
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-4 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (budgetComparison.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Budget Progress</h3>
        <div className="text-center py-8">
          <p className="text-gray-500 mb-4">No budgets set for this month</p>
          <p className="text-sm text-gray-400">Set up budgets to track your spending</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Budget Progress</h3>
      <div className="space-y-4">
        {budgetComparison.map((budget) => {
          const isOverBudget = budget.spent > budget.budgeted;
          const progressPercentage = Math.min((budget.spent / budget.budgeted) * 100, 100);
          
          return (
            <div key={budget.category} className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">{budget.category}</span>
                <span className={`text-sm ${isOverBudget ? 'text-red-600' : 'text-gray-600'}`}>
                  ${budget.spent.toFixed(2)} / ${budget.budgeted.toFixed(2)}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${
                    isOverBudget ? 'bg-red-500' : 'bg-blue-500'
                  }`}
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>
              {budget.remaining < 0 && (
                <p className="text-xs text-red-600">
                  Over budget by ${Math.abs(budget.remaining).toFixed(2)}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
