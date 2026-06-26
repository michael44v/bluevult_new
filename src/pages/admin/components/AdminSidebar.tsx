import { useState } from "react";


import { Link, useLocation } from "react-router-dom";
import {
  FaChartPie,
  FaUsers,
  FaEnvelope,
  FaIdCard,
  FaExchangeAlt,
  FaWallet,
  FaMoneyBillWave,
  FaChartLine,
  FaHistory,
  FaCogs,
  FaBalanceScale,
  FaBell,
  FaSignOutAlt,
  FaShieldAlt,
  FaChevronDown,
  FaChevronUp,
  FaRobot,
} from "react-icons/fa";

interface SidebarItemProps {
  to: string;
  label: string;
  Icon: React.ElementType;
  onClick?: () => void;
}

interface AdminSidebarProps {
  onClose?: () => void;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({ onClose }) => {
  const { pathname } = useLocation();
  const [financeOpen, setFinanceOpen] = useState(false);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [dark, setDark] = useState(false);

  const isActive = (to: string) => pathname === to || pathname.startsWith(to + "/");

  const SidebarItem: React.FC<SidebarItemProps> = ({ to, label, Icon, onClick }) => (
    <Link
      to={to}
      onClick={onClick}
      className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition
        ${
          isActive(to)
            ? "bg-red-600 text-white"
            : "text-gray-300 hover:bg-white/10"
        }`}
    >
      <Icon className="text-base" />
      {label}
    </Link>
  );

  return (
    <aside className="w-64 h-screen overflow-y-auto p-4 bg-[#0a0f1f] border-r border-gray-800 flex flex-col gap-4">
      {/* Brand */}
      <div className="flex items-center gap-2 px-2">
        <FaShieldAlt className="text-red-500 text-2xl" />
        <h1 className="text-xl font-bold text-white">
          Admin Panel
        </h1>
      </div>

      {/* Admin Profile */}
      <div className="bg-[#1a1d2a] rounded-2xl p-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-red-600 flex items-center justify-center text-white font-bold text-lg">
            A
          </div>
          <div className="flex-1">
            <p className="font-semibold text-white">Super Admin</p>
            <p className="text-xs text-gray-400">info@bluevult.com</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="bg-[#1a1d2a] rounded-2xl p-3 flex-1 flex flex-col">
        <nav className="space-y-1 flex-1">
          <SidebarItem to="/admin" label="Dashboard" Icon={FaChartPie} />
          <SidebarItem to="/admin/users" label="Users Management" Icon={FaUsers} />
          <SidebarItem to="/admin/kyc" label="KYC Review" Icon={FaIdCard} /> 
          <SidebarItem to="/admin/balance" label="Balance Adjustment" Icon={FaBalanceScale} />
          <SidebarItem to="/admin/connected" label="Connected Wallet" Icon={FaBalanceScale} />
          <SidebarItem to="/admin/gtpayout" label="GTpayout Management" Icon={FaRobot} />
          <SidebarItem to="/admin/email" label="Email Management" Icon={FaEnvelope} />

          {/* Finance Dropdown */}
          <div>
            <button
              onClick={() => setFinanceOpen(!financeOpen)}
              className={`flex items-center justify-between w-full px-4 py-3 rounded-lg text-sm font-medium transition text-gray-300 hover:bg-white/10`}
            >
              <span className="flex items-center gap-3">
                <FaMoneyBillWave />
                Finance
              </span>
              {financeOpen ? <FaChevronUp /> : <FaChevronDown />}
            </button>

            {financeOpen && (
              <div className="ml-4 mt-1 space-y-1">
                <SidebarItem to="/admin/transactions" label="Transactions" Icon={FaExchangeAlt} />
              {/*   <SidebarItem to="/admin/withdrawals" label="Withdrawals" Icon={FaWallet} /> */}
                <SidebarItem to="/admin/wallets" label="Platform Wallets" Icon={FaBalanceScale} />
              </div>
            )}
          </div>

          {/* Advanced Dropdown */}
          <div>
            <button
              onClick={() => setAdvancedOpen(!advancedOpen)}
              className={`flex items-center justify-between w-full px-4 py-3 rounded-lg text-sm font-medium transition text-gray-300 hover:bg-white/10`}
            >
              <span className="flex items-center gap-3">
                <FaCogs />
                Advanced
              </span>
              {advancedOpen ? <FaChevronUp /> : <FaChevronDown />}
            </button>

            {advancedOpen && (
              <div className="ml-4 mt-1 space-y-1">
                <SidebarItem to="/admin/analytics" label="Analytics" Icon={FaChartLine} />
                <SidebarItem to="/admin/activity" label="Activity Logs" Icon={FaHistory} />
                <SidebarItem to="/admin/settings" label="System Settings" Icon={FaCogs} />
               
                <SidebarItem to="/admin/notifications" label="Notifications" Icon={FaBell} />
              </div>
            )}
          </div>
        </nav>

        {/* Back to Main */}
        <Link
          to="/dashboard"
          className="mt-4 flex items-center justify-center gap-2 py-2 px-4 rounded-lg bg-gray-700 text-white hover:bg-gray-600 transition"
        >
          <FaSignOutAlt />
          Back to Dashboard
        </Link>
      </div>
    </aside>
  );
};

export default AdminSidebar;
