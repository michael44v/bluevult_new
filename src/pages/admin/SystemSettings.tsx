import { useState, useEffect } from "react";
import AdminLayout from "./components/AdminLayout";
import { FaSave, FaGlobe, FaShieldAlt, FaMoneyBillWave, FaBell } from "react-icons/fa";
import { useSystemSettings, useUpdateSystemSettings } from "@/hooks/useAdminData";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

const SystemSettings: React.FC = () => {
  const { data: settings = [], isLoading } = useSystemSettings();
  const updateSettings = useUpdateSystemSettings();

  // Platform Settings
  const [platformName, setPlatformName] = useState("BlueVult");
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [registrationEnabled, setRegistrationEnabled] = useState(true);

  // Transaction Limits
  const [minDeposit, setMinDeposit] = useState("50");
  const [maxDeposit, setMaxDeposit] = useState("100000");
  const [minWithdrawal, setMinWithdrawal] = useState("100");
  const [maxWithdrawal, setMaxWithdrawal] = useState("50000");
  const [withdrawalFee, setWithdrawalFee] = useState("2.5");

  // Security Settings
  const [require2FA, setRequire2FA] = useState(false);
  const [force2FA, setForce2FA] = useState(false);
  const [kycRequired, setKycRequired] = useState(true);
  const [sessionTimeout, setSessionTimeout] = useState("30");

  // Notification Settings
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);
  const [adminAlerts, setAdminAlerts] = useState(true);

  // Load settings from API
  useEffect(() => {
    if (settings.length > 0) {
      settings.forEach((s) => {
        switch (s.setting_key) {
          case "platform_name": setPlatformName(s.setting_value); break;
          case "maintenance_mode": setMaintenanceMode(s.setting_value === "true"); break;
          case "registration_enabled": setRegistrationEnabled(s.setting_value === "true"); break;
          case "min_deposit": setMinDeposit(s.setting_value); break;
          case "max_deposit": setMaxDeposit(s.setting_value); break;
          case "min_withdrawal": setMinWithdrawal(s.setting_value); break;
          case "max_withdrawal": setMaxWithdrawal(s.setting_value); break;
          case "withdrawal_fee": setWithdrawalFee(s.setting_value); break;
          case "require_2fa": setRequire2FA(s.setting_value === "true"); break;
          case "force_2fa": setForce2FA(s.setting_value === "true"); break;
          case "kyc_required": setKycRequired(s.setting_value === "true"); break;
          case "session_timeout": setSessionTimeout(s.setting_value); break;
          case "email_notifications": setEmailNotifications(s.setting_value === "true"); break;
          case "sms_notifications": setSmsNotifications(s.setting_value === "true"); break;
          case "admin_alerts": setAdminAlerts(s.setting_value === "true"); break;
        }
      });
    }
  }, [settings]);

  const handleSave = () => {
    const settingsToSave = {
      platform_name: platformName,
      maintenance_mode: maintenanceMode.toString(),
      registration_enabled: registrationEnabled.toString(),
      min_deposit: minDeposit,
      max_deposit: maxDeposit,
      min_withdrawal: minWithdrawal,
      max_withdrawal: maxWithdrawal,
      withdrawal_fee: withdrawalFee,
      require_2fa: require2FA.toString(),
      force_2fa: force2FA.toString(),
      kyc_required: kycRequired.toString(),
      session_timeout: sessionTimeout,
      email_notifications: emailNotifications.toString(),
      sms_notifications: smsNotifications.toString(),
      admin_alerts: adminAlerts.toString(),
    };

    updateSettings.mutate(settingsToSave, {
      onSuccess: () => {
        toast.success("Settings saved successfully!");
      },
      onError: () => {
        toast.error("Failed to save settings");
      },
    });
  };

  if (isLoading) {
    return (
      <AdminLayout title="System Settings">
        <div className="space-y-6 max-w-4xl">
          <Skeleton className="h-12 w-64 bg-[#1a1d2a]" />
          {Array(4).fill(0).map((_, i) => (
            <Skeleton key={i} className="h-48 bg-[#1a1d2a]" />
          ))}
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="System Settings">
      <div className="space-y-6 max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">System Settings</h2>
            <p className="text-gray-400">Configure platform settings and preferences</p>
          </div>
          <button
            onClick={handleSave}
            disabled={updateSettings.isPending}
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center gap-2 disabled:opacity-50"
          >
            <FaSave /> {updateSettings.isPending ? "Saving..." : "Save Changes"}
          </button>
        </div>

        {/* Platform Settings */}
        <div className="bg-[#1a1d2a] rounded-2xl p-6 border border-gray-800">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <FaGlobe className="text-blue-400" />
            </div>
            <h3 className="text-lg font-semibold text-white">Platform Settings</h3>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Platform Name</label>
              <input
                type="text"
                value={platformName}
                onChange={(e) => setPlatformName(e.target.value)}
                className="w-full px-4 py-3 bg-[#0f111b] border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
            <div className="flex items-center justify-between py-3 border-b border-gray-800">
              <div>
                <p className="text-white">Maintenance Mode</p>
                <p className="text-gray-400 text-sm">Disable access for all users</p>
              </div>
              <button
                onClick={() => setMaintenanceMode(!maintenanceMode)}
                className={`w-14 h-7 rounded-full transition ${maintenanceMode ? "bg-red-600" : "bg-gray-700"}`}
              >
                <div className={`w-5 h-5 bg-white rounded-full transition-transform ${maintenanceMode ? "translate-x-8" : "translate-x-1"}`} />
              </button>
            </div>
            <div className="flex items-center justify-between py-3">
              <div>
                <p className="text-white">User Registration</p>
                <p className="text-gray-400 text-sm">Allow new user signups</p>
              </div>
              <button
                onClick={() => setRegistrationEnabled(!registrationEnabled)}
                className={`w-14 h-7 rounded-full transition ${registrationEnabled ? "bg-green-600" : "bg-gray-700"}`}
              >
                <div className={`w-5 h-5 bg-white rounded-full transition-transform ${registrationEnabled ? "translate-x-8" : "translate-x-1"}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Transaction Limits */}
        <div className="bg-[#1a1d2a] rounded-2xl p-6 border border-gray-800">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-green-500/20 rounded-lg">
              <FaMoneyBillWave className="text-green-400" />
            </div>
            <h3 className="text-lg font-semibold text-white">Transaction Limits</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Min Deposit ($)</label>
              <input
                type="number"
                value={minDeposit}
                onChange={(e) => setMinDeposit(e.target.value)}
                className="w-full px-4 py-3 bg-[#0f111b] border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Max Deposit ($)</label>
              <input
                type="number"
                value={maxDeposit}
                onChange={(e) => setMaxDeposit(e.target.value)}
                className="w-full px-4 py-3 bg-[#0f111b] border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Min Withdrawal ($)</label>
              <input
                type="number"
                value={minWithdrawal}
                onChange={(e) => setMinWithdrawal(e.target.value)}
                className="w-full px-4 py-3 bg-[#0f111b] border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Max Withdrawal ($)</label>
              <input
                type="number"
                value={maxWithdrawal}
                onChange={(e) => setMaxWithdrawal(e.target.value)}
                className="w-full px-4 py-3 bg-[#0f111b] border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm text-gray-400 mb-2">Withdrawal Fee (%)</label>
              <input
                type="number"
                value={withdrawalFee}
                onChange={(e) => setWithdrawalFee(e.target.value)}
                step="0.1"
                className="w-full px-4 py-3 bg-[#0f111b] border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
          </div>
        </div>

        {/* Security Settings */}
        <div className="bg-[#1a1d2a] rounded-2xl p-6 border border-gray-800">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-red-500/20 rounded-lg">
              <FaShieldAlt className="text-red-400" />
            </div>
            <h3 className="text-lg font-semibold text-white">Security Settings</h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-gray-800">
              <div>
                <p className="text-white">Require 2FA (Security Question)</p>
                <p className="text-gray-400 text-sm">Force users to answer a security question</p>
              </div>
              <button
                onClick={() => setRequire2FA(!require2FA)}
                className={`w-14 h-7 rounded-full transition ${require2FA ? "bg-green-600" : "bg-gray-700"}`}
              >
                <div className={`w-5 h-5 bg-white rounded-full transition-transform ${require2FA ? "translate-x-8" : "translate-x-1"}`} />
              </button>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-gray-800">
              <div>
                <p className="text-white">Force 2FA (Security Code)</p>
                <p className="text-gray-400 text-sm">Require OTP code for login</p>
              </div>
              <button
                onClick={() => setForce2FA(!force2FA)}
                className={`w-14 h-7 rounded-full transition ${force2FA ? "bg-green-600" : "bg-gray-700"}`}
              >
                <div className={`w-5 h-5 bg-white rounded-full transition-transform ${force2FA ? "translate-x-8" : "translate-x-1"}`} />
              </button>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-gray-800">
              <div>
                <p className="text-white">KYC Required for Withdrawals</p>
                <p className="text-gray-400 text-sm">Users must verify identity to withdraw</p>
              </div>
              <button
                onClick={() => setKycRequired(!kycRequired)}
                className={`w-14 h-7 rounded-full transition ${kycRequired ? "bg-green-600" : "bg-gray-700"}`}
              >
                <div className={`w-5 h-5 bg-white rounded-full transition-transform ${kycRequired ? "translate-x-8" : "translate-x-1"}`} />
              </button>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Session Timeout (minutes)</label>
              <input
                type="number"
                value={sessionTimeout}
                onChange={(e) => setSessionTimeout(e.target.value)}
                className="w-full px-4 py-3 bg-[#0f111b] border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="bg-[#1a1d2a] rounded-2xl p-6 border border-gray-800">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-yellow-500/20 rounded-lg">
              <FaBell className="text-yellow-400" />
            </div>
            <h3 className="text-lg font-semibold text-white">Notification Settings</h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-gray-800">
              <div>
                <p className="text-white">Email Notifications</p>
                <p className="text-gray-400 text-sm">Send email notifications to users</p>
              </div>
              <button
                onClick={() => setEmailNotifications(!emailNotifications)}
                className={`w-14 h-7 rounded-full transition ${emailNotifications ? "bg-green-600" : "bg-gray-700"}`}
              >
                <div className={`w-5 h-5 bg-white rounded-full transition-transform ${emailNotifications ? "translate-x-8" : "translate-x-1"}`} />
              </button>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-gray-800">
              <div>
                <p className="text-white">SMS Notifications</p>
                <p className="text-gray-400 text-sm">Send SMS for critical alerts</p>
              </div>
              <button
                onClick={() => setSmsNotifications(!smsNotifications)}
                className={`w-14 h-7 rounded-full transition ${smsNotifications ? "bg-green-600" : "bg-gray-700"}`}
              >
                <div className={`w-5 h-5 bg-white rounded-full transition-transform ${smsNotifications ? "translate-x-8" : "translate-x-1"}`} />
              </button>
            </div>
            <div className="flex items-center justify-between py-3">
              <div>
                <p className="text-white">Admin Alerts</p>
                <p className="text-gray-400 text-sm">Notify admins of important events</p>
              </div>
              <button
                onClick={() => setAdminAlerts(!adminAlerts)}
                className={`w-14 h-7 rounded-full transition ${adminAlerts ? "bg-green-600" : "bg-gray-700"}`}
              >
                <div className={`w-5 h-5 bg-white rounded-full transition-transform ${adminAlerts ? "translate-x-8" : "translate-x-1"}`} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default SystemSettings;