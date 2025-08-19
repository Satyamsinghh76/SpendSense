import { Authenticated, Unauthenticated, useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { SignInForm } from "./SignInForm";
import { SignOutButton } from "./SignOutButton";
import { Toaster } from "sonner";
import Dashboard from "./components/Dashboard";
import { useState, useEffect } from "react";
import TransactionList from "./components/TransactionList";
import BudgetSettings from "./components/BudgetSettings";
import AccountManager from "./components/AccountManager";
import RecurringTransactionList from "./components/RecurringTransactionList";

export default function App() {
  const [activeTab, setActiveTab] = useState("dashboard");

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 h-16 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">💰 Expense Manager</h2>
          <Authenticated>
            <div className="flex items-center gap-4">
              <nav className="hidden md:flex gap-6">
                <button
                  onClick={() => setActiveTab("dashboard")}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === "dashboard"
                      ? "bg-blue-100 text-blue-700"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Dashboard
                </button>
                <button
                  onClick={() => setActiveTab("transactions")}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === "transactions"
                      ? "bg-blue-100 text-blue-700"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Transactions
                </button>
                <button
                  onClick={() => setActiveTab("recurring")}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === "recurring"
                      ? "bg-blue-100 text-blue-700"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Recurring
                </button>
                <button
                  onClick={() => setActiveTab("budgets")}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === "budgets"
                      ? "bg-blue-100 text-blue-700"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Budgets
                </button>
                <button
                  onClick={() => setActiveTab("accounts")}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === "accounts"
                      ? "bg-blue-100 text-blue-700"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Accounts
                </button>
              </nav>
              <SignOutButton />
            </div>
          </Authenticated>
        </div>
      </header>

      <main className="flex-1">
        <Content activeTab={activeTab} />
      </main>
      <Toaster />
    </div>
  );
}

function Content({ activeTab }: { activeTab: string }) {
  const loggedInUser = useQuery(api.auth.loggedInUser);
  const initializeUserData = useMutation(api.auth.initializeUserData);

  // Initialize user data on first login
  useEffect(() => {
    if (loggedInUser) {
      initializeUserData().catch(console.error);
    }
  }, [loggedInUser, initializeUserData]);

  if (loggedInUser === undefined) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <Authenticated>
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {loggedInUser?.name || loggedInUser?.email?.split('@')[0] || "friend"}!
          </h1>
          <p className="text-gray-600">Manage your finances with ease</p>
        </div>

        {activeTab === "dashboard" && <Dashboard />}
        {activeTab === "transactions" && <TransactionList />}
        {activeTab === "recurring" && <RecurringTransactionList />}
        {activeTab === "budgets" && <BudgetSettings />}
        {activeTab === "accounts" && <AccountManager />}
      </Authenticated>

      <Unauthenticated>
        <div className="flex flex-col items-center justify-center min-h-[500px] gap-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Take Control of Your Finances
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl">
              Track expenses, manage budgets, and achieve your financial goals with our comprehensive expense management platform.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="text-3xl mb-3">📊</div>
                <h3 className="font-semibold text-gray-900 mb-2">Smart Analytics</h3>
                <p className="text-gray-600 text-sm">Visual dashboards and insights into your spending patterns</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="text-3xl mb-3">🏦</div>
                <h3 className="font-semibold text-gray-900 mb-2">Multiple Accounts</h3>
                <p className="text-gray-600 text-sm">Manage cash, credit, savings, and loan accounts in one place</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="text-3xl mb-3">🎯</div>
                <h3 className="font-semibold text-gray-900 mb-2">Budget Goals</h3>
                <p className="text-gray-600 text-sm">Set monthly budgets and track your progress</p>
              </div>
            </div>
          </div>
          <div className="w-full max-w-md">
            <SignInForm />
          </div>
        </div>
      </Unauthenticated>
    </div>
  );
}
