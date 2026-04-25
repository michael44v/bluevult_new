import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchAllUsers,
  fetchUserBalances,
  fetchKYCSubmissions,
  fetchAllTransactions,
  fetchWithdrawals,
  fetchConnectedWallets,
  fetchNotifications,
  fetchDashboardStats,
  updateUserStatus,
  updateUserBalance,
  updateKYCStatus,
  updateTransactionStatus,
  sendNotification,
  fetchActivityLogs,
  fetchActivityLogStats,
  fetchSystemSettings,
  updateSystemSettings,
  fetchAnalyticsData,
  fetchPlatformWallets,
  fetchWalletMovements,
  fetchWalletBalanceHistory,

  fetchApprovedDeposits,

  User,
  UserBalance,
  UserKYC,
  Transaction,
  ConnectedWallet,
  Notification,
  ActivityLog,
  SystemSettings,
  AnalyticsData,
  PlatformWallet,
  WalletMovement,
} from "@/lib/api/admin";

// Query hooks for fetching data

export function useUsers() {
  return useQuery<User[], Error>({
    queryKey: ["admin", "users"],
    queryFn: fetchAllUsers,
    staleTime: 30000,
  });
}

export function useUserBalances() {
  return useQuery<UserBalance[], Error>({
    queryKey: ["admin", "balances"],
    queryFn: fetchUserBalances,
    staleTime: 30000,
  });
}

export function useKYCSubmissions() {
  return useQuery<UserKYC[], Error>({
    queryKey: ["admin", "kyc"],
    queryFn: fetchKYCSubmissions,
    staleTime: 30000,
  });
}

export function useTransactions() {
  return useQuery<Transaction[], Error>({
    queryKey: ["admin", "transactions"],
    queryFn: fetchAllTransactions,
    staleTime: 30000,
  });
}

export function useWithdrawals() {
  return useQuery<Transaction[], Error>({
    queryKey: ["admin", "withdrawals"],
    queryFn: fetchWithdrawals,
    staleTime: 30000,
  });
}


export function useRevenue() {
  return useQuery({
    queryKey: ["admin", "revenue"],
    queryFn: fetchApprovedDeposits,
    staleTime: 30000
  });
}


export function useConnectedWallets() {
  return useQuery<ConnectedWallet[], Error>({
    queryKey: ["admin", "wallets"],
    queryFn: fetchConnectedWallets,
    staleTime: 30000,
  });
}

export function useNotifications() {
  return useQuery<Notification[], Error>({
    queryKey: ["admin", "notifications"],
    queryFn: fetchNotifications,
    staleTime: 30000,
  });
}

export function useDashboardStats() {
  return useQuery({
    queryKey: ["admin", "stats"],
    queryFn: fetchDashboardStats,
    staleTime: 30000,
  });
}

// Activity Logs
export function useActivityLogs() {
  return useQuery<ActivityLog[], Error>({
    queryKey: ["admin", "activity_logs"],
    queryFn: fetchActivityLogs,
    staleTime: 30000,
  });
}

export function useActivityLogStats() {
  return useQuery({
    queryKey: ["admin", "activity_log_stats"],
    queryFn: fetchActivityLogStats,
    staleTime: 30000,
  });
}

// System Settings
export function useSystemSettings() {
  return useQuery<SystemSettings[], Error>({
    queryKey: ["admin", "settings"],
    queryFn: fetchSystemSettings,
    staleTime: 30000,
  });
}

// Analytics
export function useAnalyticsData() {
  return useQuery<AnalyticsData, Error>({
    queryKey: ["admin", "analytics"],
    queryFn: fetchAnalyticsData,
    staleTime: 60000,
  });
}

// Platform Wallets
export function usePlatformWallets() {
  return useQuery<PlatformWallet[], Error>({
    queryKey: ["admin", "platform_wallets"],
    queryFn: fetchPlatformWallets,
    staleTime: 30000,
  });
}

export function useWalletMovements() {
  return useQuery<WalletMovement[], Error>({
    queryKey: ["admin", "wallet_movements"],
    queryFn: fetchWalletMovements,
    staleTime: 30000,
  });
}

export function useWalletBalanceHistory() {
  return useQuery<{ date: string; btc: number; eth: number; usdt: number }[], Error>({
    queryKey: ["admin", "wallet_history"],
    queryFn: fetchWalletBalanceHistory,
    staleTime: 60000,
  });
}

// Mutation hooks for updating data

export function useUpdateUserStatus() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ userId, status }: { userId: number; status: string }) =>
      updateUserStatus(userId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
    },
  });
}

export function useUpdateUserBalance() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ 
      userId, 
      amount, 
      type, 
      reason 
    }: { 
      userId: number; 
      amount: number; 
      type: "credit" | "debit"; 
      reason: string;
    }) => updateUserBalance(userId, amount, type, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "balances"] });
    },
  });
}

export function useUpdateKYCStatus() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ 
      userId, 
      status 
    }: { 
      userId: number; 
      status: "verified" | "rejected"; 
    }) => updateKYCStatus(userId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "kyc"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
    },
  });
}

export function useUpdateTransactionStatus() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ transId, status }: { transId: number; status: string }) =>
      updateTransactionStatus(transId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "transactions"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "withdrawals"] });
    },
  });
}

export function useSendNotification() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ 
      userId, 
      title, 
      message, 
      channel 
    }: { 
      userId: number | "all"; 
      title: string; 
      message: string; 
      channel: string;
    }) => sendNotification(userId, title, message, channel),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "notifications"] });
    },
  });
}

export function useUpdateSystemSettings() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (settings: Record<string, string>) => updateSystemSettings(settings),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "settings"] });
    },
  });
}
