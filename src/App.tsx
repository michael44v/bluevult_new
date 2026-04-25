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
import SignIn from "./pages/auth/signIn";
import SignUp from "./pages/auth/SignUp";

import { useDarkMode } from "./hooks/useDarkMode";
import ChatBot from "./components/ChatBot";
import BottomNav from "./components/BottomNav";

const queryClient = new QueryClient();

const App = () => {
  useDarkMode();
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/signin" element={<SignIn />} />
            <Route path="/signup" element={<SignUp />} />
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

            <Route path="*" element={<NotFound />} />
          </Routes>
          <ChatBot />
          <BottomNav />
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
