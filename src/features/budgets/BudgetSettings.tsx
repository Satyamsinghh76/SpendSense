import { useState } from "react";
import { useBudgetsList, useBudgetComparison, useCategoriesList, useUpsertBudget, useRemoveBudget } from "@/lib/data-hooks";
import { toast } from "sonner";

export default function BudgetSettings() {
  const [selectedPeriod, setSelectedPeriod] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    category: "",
    amount: "",
  });

  const budgets = useBudgetsList({ period: selectedPeriod });
  const budgetComparison = useBudgetComparison({ period: selectedPeriod });
  const categories = useCategoriesList();
  const upsertBudget = useUpsertBudget();
  const deleteBudget = useRemoveBudget();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.category || !formData.amount) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      await upsertBudget({
        category: formData.category,
        amount: parseFloat(formData.amount),
        period: selectedPeriod,
        currency: "USD",
      });
      toast.success("Budget saved successfully");
      setShowForm(false);
      setFormData({ category: "", amount: "" });
    } catch (error) {
      toast.error("Failed to save budget");
    }
  };

  const handleDelete = async (budgetId: string) => {
    if (confirm("Are you sure you want to delete this budget?")) {
      try {
        await deleteBudget({ id: budgetId as any });
        toast.success("Budget deleted successfully");
      } catch (error) {
        toast.error("Failed to delete budget");
      }
    }
  };

  const expenseCategories = categories?.filter(cat => cat.type === "expense") || [];

  if (budgets === undefined || budgetComparison === undefined || categories === undefined) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Budget Settings</h2>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Set Budget
        </button>
      </div>

      {/* Period Selector */}
      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <label className="block text-sm font-medium text-gray-700 mb-2">Budget Period</label>
        <input
          type="month"
          value={selectedPeriod}
          onChange={(e) => setSelectedPeriod(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Budget Overview */}
      {budgetComparison.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Budget Overview</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">
                ${budgetComparison.reduce((sum, b) => sum + b.budgeted, 0).toFixed(2)}
              </p>
              <p className="text-sm text-gray-600">Total Budgeted</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">
                ${budgetComparison.reduce((sum, b) => sum + b.spent, 0).toFixed(2)}
              </p>
              <p className="text-sm text-gray-600">Total Spent</p>
            </div>
            <div className="text-center">
              <p className={`text-2xl font-bold ${
                budgetComparison.reduce((sum, b) => sum + b.remaining, 0) >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                ${budgetComparison.reduce((sum, b) => sum + b.remaining, 0).toFixed(2)}
              </p>
              <p className="text-sm text-gray-600">Remaining</p>
            </div>
          </div>
        </div>
      )}

      {/* Budget List */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Category Budgets</h3>
        </div>
        
        {budgetComparison.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">🎯</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No budgets set</h3>
            <p className="text-gray-500 mb-4">Set your first budget to start tracking your spending</p>
            <button
              onClick={() => setShowForm(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Set Budget
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {budgetComparison.map((budget) => {
              const category = categories.find(c => c.name === budget.category);
              const isOverBudget = budget.spent > budget.budgeted;
              const progressPercentage = Math.min((budget.spent / budget.budgeted) * 100, 100);
              
              return (
                <div key={budget.category} className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{category?.icon || '📝'}</span>
                      <div>
                        <h4 className="font-medium text-gray-900">{budget.category}</h4>
                        <p className="text-sm text-gray-500">
                          ${budget.spent.toFixed(2)} of ${budget.budgeted.toFixed(2)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-medium ${
                        isOverBudget ? 'text-red-600' : 'text-green-600'
                      }`}>
                        {progressPercentage.toFixed(1)}%
                      </span>
                      <button
                        onClick={() => {
                          const budgetToDelete = budgets.find(b => b.category === budget.category);
                          if (budgetToDelete) handleDelete(budgetToDelete._id);
                        }}
                        className="text-red-600 hover:text-red-800 p-1"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full transition-all duration-300 ${
                        isOverBudget ? 'bg-red-500' : 'bg-blue-500'
                      }`}
                      style={{ width: `${progressPercentage}%` }}
                    ></div>
                  </div>
                  
                  {budget.remaining < 0 && (
                    <p className="text-sm text-red-600 mt-2">
                      Over budget by ${Math.abs(budget.remaining).toFixed(2)}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Budget Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Set Budget</h3>
                <button
                  onClick={() => setShowForm(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select a category</option>
                    {expenseCategories.map((category) => (
                      <option key={category._id} value={category.name}>
                        {category.icon} {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Budget Amount</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0.00"
                    required
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Set Budget
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
