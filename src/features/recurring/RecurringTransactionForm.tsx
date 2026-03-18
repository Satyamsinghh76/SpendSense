import { useState, useEffect } from "react";
import { useAccountsList, useCategoriesList, useCreateRecurringTransaction, useUpdateRecurringTransaction } from "@/lib/data-hooks";
import { toast } from "sonner";

interface RecurringTransactionFormProps {
  recurringTransaction?: any;
  onClose: () => void;
}

export default function RecurringTransactionForm({ 
  recurringTransaction, 
  onClose 
}: RecurringTransactionFormProps) {
  const [formData, setFormData] = useState({
    accountId: "",
    amount: "",
    description: "",
    category: "",
    type: "expense" as "income" | "expense",
    frequency: "monthly" as "daily" | "weekly" | "monthly" | "yearly",
    startDate: new Date().toISOString().split('T')[0],
    endDate: "",
  });

  const accounts = useAccountsList();
  const categories = useCategoriesList();
  const createRecurringTransaction = useCreateRecurringTransaction();
  const updateRecurringTransaction = useUpdateRecurringTransaction();

  useEffect(() => {
    if (recurringTransaction) {
      setFormData({
        accountId: recurringTransaction.accountId,
        amount: recurringTransaction.amount.toString(),
        description: recurringTransaction.description,
        category: recurringTransaction.category,
        type: recurringTransaction.type,
        frequency: recurringTransaction.frequency,
        startDate: new Date(recurringTransaction.startDate).toISOString().split('T')[0],
        endDate: recurringTransaction.endDate 
          ? new Date(recurringTransaction.endDate).toISOString().split('T')[0] 
          : "",
      });
    }
  }, [recurringTransaction]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.accountId || !formData.amount || !formData.description || !formData.category) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      if (recurringTransaction) {
        await updateRecurringTransaction({
          id: recurringTransaction._id,
          amount: parseFloat(formData.amount),
          description: formData.description,
          category: formData.category,
          frequency: formData.frequency,
          endDate: formData.endDate ? new Date(formData.endDate).getTime() : undefined,
        });
        toast.success("Recurring transaction updated successfully");
      } else {
        await createRecurringTransaction({
          accountId: formData.accountId as any,
          amount: parseFloat(formData.amount),
          description: formData.description,
          category: formData.category,
          type: formData.type,
          frequency: formData.frequency,
          startDate: new Date(formData.startDate).getTime(),
          endDate: formData.endDate ? new Date(formData.endDate).getTime() : undefined,
        });
        toast.success("Recurring transaction created successfully");
      }
      onClose();
    } catch (error) {
      toast.error("Failed to save recurring transaction");
    }
  };

  const filteredCategories = categories?.filter(cat => cat.type === formData.type) || [];

  if (accounts === undefined || categories === undefined) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              {recurringTransaction ? "Edit Recurring Transaction" : "Add Recurring Transaction"}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Transaction Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
              <div className="flex gap-2">
                {["income", "expense"].map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setFormData({ ...formData, type: type as any, category: "" })}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      formData.type === type
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Account */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Account *</label>
              <select
                value={formData.accountId}
                onChange={(e) => setFormData({ ...formData, accountId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select an account</option>
                {accounts.map((account) => (
                  <option key={account._id} value={account._id}>
                    {account.name} (${account.balance.toLocaleString()})
                  </option>
                ))}
              </select>
            </div>

            {/* Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Amount *</label>
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

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter description"
                required
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select a category</option>
                {filteredCategories.map((category) => (
                  <option key={category._id} value={category.name}>
                    {category.icon} {category.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Frequency */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Frequency *</label>
              <select
                value={formData.frequency}
                onChange={(e) => setFormData({ ...formData, frequency: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>

            {/* Start Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date *</label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* End Date (Optional) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date (Optional)</label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">Leave empty for indefinite recurring</p>
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                {recurringTransaction ? "Update" : "Create"} Recurring Transaction
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
