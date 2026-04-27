import { Unauthenticated } from "convex/react";
import { SignInForm } from "@/features/auth/SignInForm";
import { SignOutButton } from "@/features/auth/SignOutButton";
import { AuthGate, useGuestAuth } from "@/features/auth/GuestAuthContext";
import { useLoggedInUser, useInitializeUserData } from "@/lib/data-hooks";
import { Toaster } from "sonner";
import Dashboard from "@/features/dashboard/Dashboard";
import { useState, useEffect, useRef } from "react";
import TransactionList from "@/features/transactions/TransactionList";
import BudgetSettings from "@/features/budgets/BudgetSettings";
import AccountManager from "@/features/accounts/AccountManager";
import RecurringTransactionList from "@/features/recurring/RecurringTransactionList";
import { AIAssistant } from "@/features/ai-assistant";

export default function App() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const tabs = [
    { key: "dashboard", label: "Dashboard" },
    { key: "transactions", label: "Transactions" },
    { key: "recurring", label: "Recurring" },
    { key: "budgets", label: "Budgets" },
    { key: "accounts", label: "Accounts" },
    { key: "ai-assistant", label: "🤖 AI Assistant" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 h-16 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">💰 SpendSense</h2>
          <AuthGate>
            <div className="flex items-center gap-4">
              {/* Desktop nav */}
              <nav className="hidden md:flex gap-6">
                {tabs.map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      activeTab === tab.key
                        ? "bg-blue-100 text-blue-700"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </nav>
              {/* Mobile menu button */}
              <button
                type="button"
                aria-label="Toggle navigation menu"
                className="md:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {mobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
              <SignOutButton />
            </div>
          </AuthGate>
        </div>
        {/* Mobile nav dropdown */}
        <AuthGate>
          {mobileMenuOpen && (
            <nav className="md:hidden border-t bg-white px-4 py-2 space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => { setActiveTab(tab.key); setMobileMenuOpen(false); }}
                  className={`block w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === tab.key
                      ? "bg-blue-100 text-blue-700"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          )}
        </AuthGate>
      </header>

      <main className="flex-1">
        <Content activeTab={activeTab} />
      </main>
      <Toaster />
    </div>
  );
}

function Content({ activeTab }: { activeTab: string }) {
  const { isGuest } = useGuestAuth();
  const loggedInUser = useLoggedInUser();
  const initializeUserData = useInitializeUserData();
  const hasInitialized = useRef(false);

  // Initialize user data on first login (only once per session, skip for guests)
  useEffect(() => {
    if (!isGuest && loggedInUser && !hasInitialized.current) {
      hasInitialized.current = true;
      initializeUserData().catch(console.error);
    }
  }, [loggedInUser, initializeUserData, isGuest]);

  // Loading state — only for real auth, guests load instantly
  if (!isGuest && loggedInUser === undefined) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const isLoggedIn = isGuest || !!loggedInUser;
  const displayName = isGuest
    ? "Guest"
    : (loggedInUser as any)?.name || (loggedInUser as any)?.email?.split("@")[0] || "friend";

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {isLoggedIn ? (
        <>
          {isGuest && (
            <div className="mb-4 bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
              <span>You're in Guest Mode — data is stored locally in your browser.</span>
            </div>
          )}

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome back, {displayName}!
            </h1>
            <p className="text-gray-600">Manage your finances with ease</p>
          </div>

          {activeTab === "dashboard" && <Dashboard />}
          {activeTab === "transactions" && <TransactionList />}
          {activeTab === "recurring" && <RecurringTransactionList />}
          {activeTab === "budgets" && <BudgetSettings />}
          {activeTab === "accounts" && <AccountManager />}
          {activeTab === "ai-assistant" && <AIAssistant />}
        </>
      ) : (
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
      )}
    </div>
  );
}
