import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import NotFound from "./pages/NotFound";
import Dashboard from "./pages/dashboard/dashboard";
import TransactionHistory from "./pages/dashboard/TransactionHistory";
import MarketsPage from "./pages/dashboard/MarketsPage";
import WalletPage from "./pages/dashboard/WalletPage";
import WithdrawPage from "./pages/dashboard/WithdrawPage";
import KycPage from "./pages/dashboard/KycPage";
import CustomerCarePage from "./pages/dashboard/CustomerCarePage";
import Affiliates from "./pages/dashboard/Affiliates";
import Settings from "./pages/dashboard/settings";
import ConnectWalletPage from "./pages/dashboard/ConnectWalletPage";
import TradingPage from "./pages/dashboard/TradingPage";
import PositionsPage from "./pages/dashboard/PositionsPage";
import SignIn from "./pages/auth/signIn";
import SignUp from "./pages/auth/SignUp";
import OtpVerify from "./pages/auth/OtpVerify";
import GTpayoutOverview from "./pages/dashboard/gtpayout/Overview";
import GTpayoutAdmin from "./pages/admin/GTpayoutAdmin";
import GTpayoutTrades from "./pages/admin/GTpayoutTrades";
import GTpayoutAnalytics from "./pages/admin/GTpayoutAnalytics";
import TradingWallet from "./pages/dashboard/gtpayout/TradingWallet";
import ManualTrading from "./pages/dashboard/gtpayout/ManualTrading";
import TradingBot from "./pages/dashboard/gtpayout/TradingBot";
import TradeHistory from "./pages/dashboard/gtpayout/TradeHistory";
import Performance from "./pages/dashboard/gtpayout/Performance";
import GTSettings from "./pages/dashboard/gtpayout/GTSettings";
import Maintenance from "./pages/Maintenance";

import Community from "./pages/Community";
import Cryptocurrencies from "./pages/Cryptocurrencies";
import Exchanges from "./pages/Exchanges";
import Products from "./pages/Products";
import Learn from "./pages/Learn";
import AdminDashboard from "./pages/admin/AdminDashboard";
import UsersManagement from "./pages/admin/UsersManagement";
import KycReview from "./pages/admin/KycReview";
import TransactionsAdmin from "./pages/admin/TransactionsAdmin";
import WithdrawalsAdmin from "./pages/admin/WithdrawalsAdmin";
import WalletsAdmin from "./pages/admin/WalletsAdmin";
import AnalyticsAdmin from "./pages/admin/AnalyticsAdmin";
import ActivityLogs from "./pages/admin/ActivityLogs";
import SystemSettings from "./pages/admin/SystemSettings";
import BalanceAdjustment from "./pages/admin/BalanceAdjustment";
import NotificationsAdmin from "./pages/admin/NotificationsAdmin";
import About from "./pages/About";
import ConnectedWallets from "./pages/admin/connected";
import EmailManagement from "./pages/admin/EmailManagement";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";

import { useDarkMode } from "./hooks/useDarkMode";
import ChatBot from "./components/ChatBot";
import BottomNav from "./components/BottomNav";

const queryClient = new QueryClient();

import { useSystemSettings } from "./hooks/useAdminData";
import { useEffect, useCallback, useRef, useMemo } from "react";
import { useLocation } from "react-router-dom";

const AppContentInner = () => {
  const location = useLocation();
  const { data: settings = [] } = useSystemSettings();
  const isMaintenanceMode = Array.isArray(settings) && settings.find(s => s.setting_key === "maintenance_mode")?.setting_value === "true";
  const sessionTimeoutMinutes = parseInt(Array.isArray(settings) && settings.find(s => s.setting_key === "session_timeout")?.setting_value || "30", 10);

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const logout = useCallback(() => {
    localStorage.removeItem("user_id");
    window.location.href = "/signin";
  }, []);

  const resetTimer = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (localStorage.getItem("user_id")) {
      timeoutRef.current = setTimeout(logout, sessionTimeoutMinutes * 60 * 1000);
    }
  }, [logout, sessionTimeoutMinutes]);

  useEffect(() => {
    const events = ["mousedown", "keydown", "scroll", "touchstart"];
    events.forEach(event => window.addEventListener(event, resetTimer));
    resetTimer();

    return () => {
      events.forEach(event => window.removeEventListener(event, resetTimer));
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [resetTimer]);

  if (isMaintenanceMode && !location.pathname.startsWith("/admin")) {
    return <Maintenance />;
  }

  const showWidgets = useMemo(() => {
    const isAuthPage = ["/signin", "/signup", "/otp-verify", "/reset", "/forgot-password"].includes(location.pathname.toLowerCase());
    const isLandingPage = ["/", "/about", "/community", "/cryptocurrencies", "/exchanges", "/products", "/learn"].includes(location.pathname);
    const isAdminPage = location.pathname.toLowerCase().startsWith("/admin");
    const userId = localStorage.getItem("user_id");
    return userId && !isAuthPage && !isLandingPage && !isAdminPage;
  }, [location.pathname]);

  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signIn" element={<Navigate to="/signin" replace />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/signUp" element={<Navigate to="/signup" replace />} />
        <Route path="/otp-verify" element={<OtpVerify />} />
        <Route path="/otp_verify" element={<Navigate to="/otp-verify" replace />} />

        {/* Main Dashboard replaced by GTpayout Overview */}
        <Route path="/dashboard" element={<GTpayoutOverview />} />

        <Route path="/history" element={<TransactionHistory />} />
        <Route path="/markets" element={<MarketsPage />} />
        <Route path="/wallet" element={<WalletPage />} />
        <Route path="/wallets/:type" element={<WalletPage />} />
        <Route path="/withdrawal" element={<WithdrawPage />} />
        <Route path="/kyc_verify" element={<KycPage />} />
        <Route path="/customercare" element={<CustomerCarePage />} />
        <Route path="/affiliates" element={<Affiliates />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/connect_wallet" element={<ConnectWalletPage />} />
        <Route path="/wallets/deposit" element={<WalletPage />} />
        <Route path="/trade" element={<TradingPage />} />
        <Route path="/positions" element={<PositionsPage />} />

        <Route path="/about" element={<About />} />
        <Route path="/community" element={<Community />} />
        <Route path="/cryptocurrencies" element={<Cryptocurrencies />} />
        <Route path="/exchanges" element={<Exchanges />} />
        <Route path="/products" element={<Products />} />
        <Route path="/learn" element={<Learn />} />
        <Route path="/reset" element={<ResetPassword />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/referral/:id" element={<About />} />

        {/* Admin Routes */}
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/users" element={<UsersManagement />} />
        <Route path="/admin/kyc" element={<KycReview />} />
        <Route path="/admin/transactions" element={<TransactionsAdmin />} />
        <Route path="/admin/withdrawals" element={<WithdrawalsAdmin />} />
        <Route path="/admin/wallets" element={<WalletsAdmin />} />
        <Route path="/admin/analytics" element={<AnalyticsAdmin />} />
        <Route path="/admin/activity" element={<ActivityLogs />} />
        <Route path="/admin/settings" element={<SystemSettings />} />
        <Route path="/admin/balance" element={<BalanceAdjustment />} />
        <Route path="/admin/connected" element={<ConnectedWallets />} />
        <Route path="/admin/notifications" element={<NotificationsAdmin />} />
        <Route path="/admin/email" element={<EmailManagement />} />

        {/* Admin GTpayout Route */}
        <Route path="/admin/gtpayout" element={<GTpayoutAdmin />} />
        <Route path="/admin/gtpayout/trades" element={<GTpayoutTrades />} />
        <Route path="/admin/gtpayout/analytics" element={<GTpayoutAnalytics />} />

        {/* GTpayout Routes */}
        <Route path="/dashboard/gtpayout" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard/gtpayout/trading" element={<ManualTrading />} />
        <Route path="/dashboard/gtpayout/bot" element={<TradingBot />} />
        <Route path="/dashboard/gtpayout/history" element={<TradeHistory />} />
        <Route path="/dashboard/gtpayout/wallet" element={<TradingWallet />} />
        <Route path="/dashboard/gtpayout/performance" element={<Performance />} />
        <Route path="/dashboard/gtpayout/settings" element={<GTSettings />} />

        <Route path="*" element={<NotFound />} />
      </Routes>
      {showWidgets && <ChatBot />}
      {showWidgets && <BottomNav />}
    </>
  );
};

const AppContent = () => (
  <BrowserRouter>
    <AppContentInner />
  </BrowserRouter>
);

const App = () => {
  useDarkMode();
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AppContent />
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
