import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import NotFound from "./pages/NotFound";
import Dashboard from "./pages/dashboard/dashboard";
import TransactionHistory from "./pages/dashboard/TransactionHistory";
import MarketsPage from "./pages/dashboard/MarketsPage";
import WalletPage from "./pages/dashboard/WalletPage";
import WithdrawPage from "./pages/dashboard/WithdrawPage";
import KycPage from "./pages/dashboard/KycPage";
import CryptoFAQ from "./pages/dashboard/CryptoFaq";
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
import TradingWallet from "./pages/dashboard/gtpayout/TradingWallet";
import ManualTrading from "./pages/dashboard/gtpayout/ManualTrading";
import TradingBot from "./pages/dashboard/gtpayout/TradingBot";
import Leaderboard from "./pages/dashboard/gtpayout/Leaderboard";
import Maintenance from "./pages/Maintenance";

import { useDarkMode } from "./hooks/useDarkMode";
import ChatBot from "./components/ChatBot";
import BottomNav from "./components/BottomNav";

const queryClient = new QueryClient();

import { useSystemSettings } from "./hooks/useAdminData";
import { useEffect, useCallback, useRef } from "react";

const AppContent = () => {
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

  if (isMaintenanceMode && !window.location.pathname.startsWith("/admin")) {
    return <Maintenance />;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/otp-verify" element={<OtpVerify />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/history" element={<TransactionHistory />} />
        <Route path="/markets" element={<MarketsPage />} />
        <Route path="/wallet" element={<WalletPage />} />
        <Route path="/withdrawal" element={<WithdrawPage />} />
        <Route path="/kyc_verify" element={<KycPage />} />
        <Route path="/faqs" element={<CryptoFAQ />} />
        <Route path="/customercare" element={<CustomerCarePage />} />
        <Route path="/affiliates" element={<Affiliates />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/connect_wallet" element={<ConnectWalletPage />} />
        <Route path="/wallets/deposit" element={<WalletPage />} />
        <Route path="/trade" element={<TradingPage />} />
        <Route path="/positions" element={<PositionsPage />} />

        {/* Admin GTpayout Route */}
        <Route path="/admin/gtpayout" element={<GTpayoutAdmin />} />

        {/* GTpayout Routes */}
        <Route path="/dashboard/gtpayout" element={<GTpayoutOverview />} />
        <Route path="/dashboard/gtpayout/trading" element={<ManualTrading />} />
        <Route path="/dashboard/gtpayout/bot" element={<TradingBot />} />
        <Route path="/dashboard/gtpayout/history" element={<GTpayoutOverview />} />
        <Route path="/dashboard/gtpayout/wallet" element={<TradingWallet />} />
        <Route path="/dashboard/gtpayout/performance" element={<GTpayoutOverview />} />
        <Route path="/dashboard/gtpayout/leaderboard" element={<Leaderboard />} />
        <Route path="/dashboard/gtpayout/settings" element={<GTpayoutOverview />} />

        <Route path="*" element={<NotFound />} />
      </Routes>
      <ChatBot />
      <BottomNav />
    </BrowserRouter>
  );
};

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
