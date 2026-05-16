import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  FaWallet,
  FaRegCopy,
  FaChartPie,
  FaChartLine,
  FaCoins,
  FaUniversity,
  FaBitcoin,
  FaDollarSign,
  FaPlus,
  FaUserCheck,
  FaQuestionCircle,
  FaHeadset,
  FaUsers,
  FaCogs,
  FaSignOutAlt,
} from "react-icons/fa";
import { setWithExpiry } from "../killer";

import LoggedOutModal from "@/pages/auth/LoggedOutModal";

interface SidebarItemProps {
  to: string;
  label: string;
  Icon: React.ElementType;
  onClick?: () => void;
}

interface SidebarProps {
  onClose?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onClose }) => {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const [walletsOpen, setWalletsOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [profilePic, setProfilePic] = useState(""); // stores profile image URL
  const defaultAvatar = "https://png.pngtree.com/png-clipart/20200224/original/pngtree-cartoon-color-simple-male-avatar-png-image_5230557.jpg"; 

  // Persist UID and username from localStorage
  const [uid, setUid] = useState(() => localStorage.getItem("user_id") || "");
  const [userName, setUserName] = useState(() => localStorage.getItem("user_name") || "");

  const isActive = (to: string) => pathname.startsWith(to);

  const handleCopy = () => {
    navigator.clipboard.writeText(uid);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleConfirm = () => {
    localStorage.clear();
    navigate("/signin", { replace: true });
  };
useEffect(() => {
  // If no UID in localStorage, show logged out modal
  if (!uid) {
    setShowModal(true);
    return;
  }

  const fetchDataOnce = async () => {
    try {
      
      const response = await fetch("https://bluevult.com/api/index.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          q: "sidebar",
          uid,
        }),
      });

      const data = await response.json();

      if (data?.user_name) {
         if(data.user_status == 'suspended') {
                alert('Hello '+data.user_name+', Your account has been suspended! contact Admin to unsuspend.');
               navigate("/signin");
         }else {
        localStorage.setItem("user_name", data.user_name);
        localStorage.setItem("user_email", data.user_email);
        localStorage.setItem("user_image_url", data.profile);
        //email
        setUserName(data.user_name);
         }
      }

         const profile =
        data?.profile && data.profile !== "empty"
        ? data.profile // direct Cloudinary URL
        : defaultAvatar;

      setProfilePic(profile);
    } catch (error) {
      console.error("Error fetching sidebar data:", error);
    }
  };

  fetchDataOnce();
}, [uid]); // ✅ ONLY uid
  const SidebarItem: React.FC<SidebarItemProps> = ({ to, label, Icon, onClick }) => (
    <Link
      to={to}
      onClick={onClick}
      className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition
        ${
          isActive(to)
            ? "bg-blue-600 text-white"
            : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/10"
        }`}
    >
      <Icon className="text-base" />
      {label}
    </Link>
  );

  return (
    <aside className="w-64 min-h-screen p-4 bg-gray-50 dark:bg-[#020617] border-r flex flex-col gap-4">
      <LoggedOutModal open={showModal} onConfirm={handleConfirm} />

      <h1 className="text-xl font-bold px-2 text-gray-900 dark:text-white">BlueVult</h1>

      {/* ===== User Profile ===== */}
      <div className="bg-white dark:bg-[#0a1120] rounded-2xl p-4 shadow">
        <div className="flex items-center gap-3">
          <img
            src={profilePic}
            alt=""
            className="w-12 h-12 rounded-full object-cover border-2 border-blue-600"
          />
          <div className="flex-1">
            <p className="font-semibold text-gray-900 dark:text-white">
              {userName || "Loading..."}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
              <FaBitcoin className="text-yellow-400" /> BTC Enthusiast
            </p>

            {/* UID Section */}
            <div className="mt-2 flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300">
              <span className="font-mono">{Number(uid)+734350}</span>
              <button
                onClick={handleCopy}
                className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition"
                title="Copy UID"
              >
                <FaRegCopy className="text-gray-500 dark:text-gray-400 text-sm" />
              </button>
              {copied && <span className="text-green-500">Copied!</span>}
            </div>
          </div>
        </div>
      </div>

      {/* ===== Navigation ===== */}
      <div className="bg-white dark:bg-[#0a1120] rounded-2xl p-3 shadow flex-1 flex flex-col">
        <nav className="space-y-1 flex-1">
          <SidebarItem to="/dashboard" label="Dashboard" Icon={FaChartPie} />
          <SidebarItem to="/markets" label="Markets" Icon={FaChartLine} />
          <SidebarItem to="/history" label="Transaction History" Icon={FaCoins} />

          {/* Banking / Wallets Dropdown */}
          <div>
            <button
              onClick={() => setWalletsOpen(!walletsOpen)}
              className={`flex items-center justify-between w-full px-4 py-3 rounded-lg text-sm font-medium transition
                ${
                  isActive("/Banking")
                    ? "bg-green-600 text-white"
                    : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/10"
                }`}
            >
              <span className="flex items-center gap-3">
                <FaUniversity />
                Banking
              </span>
              <span className={`transition-transform text-xs ${walletsOpen ? "rotate-90" : ""}`}>
                ▶
              </span>
            </button>

            {walletsOpen && (
              <div className="ml-6 mt-2 space-y-1">
                <SidebarItem
                  to="/wallets/deposit"
                  label="Deposit"
                  Icon={FaBitcoin}
                  onClick={() => setWalletsOpen(false)}
                />
                <SidebarItem
                  to="/withdrawal"
                  label="Withdrawal"
                  Icon={FaDollarSign}
                  onClick={() => setWalletsOpen(false)}
                />
                <SidebarItem
                  to="/connect_wallet"
                  label="Connect Wallet"
                  Icon={FaPlus}
                  onClick={() => setWalletsOpen(false)}
                />
              </div>
            )}
          </div>

          <SidebarItem to="/kyc_verify" label="KYC" Icon={FaUserCheck} />
          <SidebarItem to="/customercare" label="Customer Care" Icon={FaHeadset} />
          <SidebarItem to="/affiliates" label="Affiliates" Icon={FaUsers} />
          <SidebarItem to="/settings" label="Settings" Icon={FaCogs} />
        </nav>

        {/* Logout */}
        <button
          onClick={handleConfirm}
          className="mt-4 flex items-center justify-center gap-2 py-2 px-4 rounded-lg
            bg-red-500 text-white hover:bg-red-600 transition"
        >
          <FaSignOutAlt />
          Log Out
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;