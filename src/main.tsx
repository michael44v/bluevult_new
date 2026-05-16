import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import './index.css';
import SignIn from './pages/auth/signIn';
import SignUp from './pages/auth/SignUp';
import Dashboard from './pages/dashboard/dashboard';
import TransactionHistory from './pages/dashboard/TransactionHistory';
import MarketsPage from './pages/dashboard/MarketsPage';
import WalletPage from './pages/dashboard/WalletPage';
import WithdrawPage from './pages/dashboard/WithdrawPage';
import ConnectWalletPage from './pages/dashboard/ConnectWalletPage';
import KycPage from './pages/dashboard/KycPage';
import CustomerCarePage from './pages/dashboard/CustomerCarePage';
import UserProfile from './pages/dashboard/settings';
import ReferralPage from './pages/dashboard/Affiliates';
import Community from './pages/Community';
import Cryptocurrencies from './pages/Cryptocurrencies';
import Exchanges from './pages/Exchanges';
import Products from './pages/Products';
import Learn from './pages/Learn';

 
import AdminDashboard from './pages/admin/AdminDashboard';
import UsersManagement from './pages/admin/UsersManagement';
import KycReview from './pages/admin/KycReview';
import TransactionsAdmin from './pages/admin/TransactionsAdmin';
import WithdrawalsAdmin from './pages/admin/WithdrawalsAdmin';
import WalletsAdmin from './pages/admin/WalletsAdmin';
import AnalyticsAdmin from './pages/admin/AnalyticsAdmin';
import ActivityLogs from './pages/admin/ActivityLogs';
import SystemSettings from './pages/admin/SystemSettings';
import BalanceAdjustment from './pages/admin/BalanceAdjustment';
import NotificationsAdmin from './pages/admin/NotificationsAdmin';
import About from './pages/About';
import Referral from './pages/dashboard/referals';
import OtpVerify from './pages/auth/otpVerify';
import ConnectedWallets from './pages/admin/connected';
import EmailManagement from './pages/admin/EmailManagement';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
{/*

*/}
const queryClient = new QueryClient();

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
         <Route path="/signIn" element={<SignIn />} />
          <Route path="/signUp" element={<SignUp />} />
          <Route path="/otp_verify" element={<OtpVerify />} />
         <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/history" element={<TransactionHistory />} />
            <Route path="/markets" element={<MarketsPage />} />
             <Route path="/wallets/:type" element={<WalletPage />} />

             <Route path="/withdrawal" element={<WithdrawPage />} />
            <Route path="/connect_wallet" element={<ConnectWalletPage />} />
             <Route path="/kyc_verify" element={<KycPage />} />
             
             <Route path="/customercare" element={<CustomerCarePage />} />
              <Route path="/settings" element={<UserProfile />} />
              <Route path="/affiliates" element={<ReferralPage />} />
              <Route path="/about" element={<About />} />
              <Route path="/reset" element={<ResetPassword />} />
               <Route path="/referral/:id" element={<About />} />
                 <Route path="/forgot-password" element={<ForgotPassword />} />
                 <Route path="/community" element={<Community />} />
                 <Route path="/cryptocurrencies" element={<Cryptocurrencies />} />
                 <Route path="/exchanges" element={<Exchanges />} />
                 <Route path="/products" element={<Products />} />
                 <Route path="/learn" element={<Learn />} />

             
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
          <Route path="/admin/email" element={<EmailManagement />} />{/*
          */}
          
      </Routes>
    </BrowserRouter>
</QueryClientProvider>
);