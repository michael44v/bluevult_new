import TopBar from '@/components/dashboard/TopBar';
import { useState, useEffect } from "react";
import { FaWallet, FaArrowUp, FaBars, FaMoon, FaSun, FaBell, FaUserCircle ,FaBitcoin,FaEthereum } from "react-icons/fa";
import { SiTether } from "react-icons/si";
import { useNavigate } from "react-router-dom";

import Sidebar from "./dashboardWidgets/Sidebar";
import Footer from "@/components/landing/Footer";

interface WalletInfo {
  name: string;
  symbol: string;
  network: string;
  balance: number;
  fee: number;
  processingTime: string;
  rateUSD: number;
  icon: JSX.Element;
}

const wallets: WalletInfo[] = [
  {
    name: "Bitcoin",
    symbol: "BTC",
    network: "Bitcoin Network",
    balance: 0,
    fee: 0.0005,
    processingTime: "10–30 minutes",
    rateUSD: 42500,
    icon: <FaBitcoin className="text-orange-500 text-2xl" />,
  },
  {
    name: "Ethereum",
    symbol: "ETH",
    network: "ERC20",
    balance: 0,
    fee: 0.005,
    processingTime: "5–15 minutes",
    rateUSD: 2640,
    icon: <FaEthereum className="text-blue-500 text-2xl" />,
  },
  {
    name: "USDT",
    symbol: "USDT",
    network: "TRC20",
    balance: 0,
    fee: 1,
    processingTime: "1–5 minutes",
    rateUSD: 1,
    icon: <SiTether className="text-green-500 text-2xl" />,
  },
];

export default function WithdrawPage() {
  const [selected, setSelected] = useState(wallets[0]);
  const [amountUSD, setAmountUSD] = useState("");
  const [amountCrypto, setAmountCrypto] = useState("");
  const [address, setAddress] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dark, setDark] = useState(false);
  const [kycStatus, setKycStatus] = useState<"verified" | "unverified">("unverified");
  const [modal, setModal] = useState<null | "kyc" | "confirm">();
  const navigate = useNavigate();
  const uid = localStorage.getItem("user_id"); // example

  // Convert USD to crypto
  useEffect(() => {
    if (!amountUSD) {
      setAmountCrypto("");
      return;
    }
    const usd = parseFloat(amountUSD);
    if (!isNaN(usd)) {
      setAmountCrypto((usd / selected.rateUSD).toFixed(6));
    }
  }, [amountUSD, selected]);

  // On page load, check KYC & fetch balance
  useEffect(() => {
    const checkKYCAndBalance = async () => {
      if (!uid) return;

      try {
        // 🔹 Check KYC
        const kycRes = await fetch("https://bluevult.com/api/index.php", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ q: "get_kyc_status", uid }),
        });
        const kycData = await kycRes.json();
        setKycStatus(kycData.kyc);

        if (kycData.kyc === "unverified") {
          setModal("kyc");
          return;
        }

        // 🔹 Fetch user balances
        const balRes = await fetch("https://bluevult.com/api/index.php", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ q: "get_balance", uid }),
        });
        const balData = await balRes.json();

        // Update wallets with user balance
        wallets.forEach((w) => {
          if (balData[w.symbol] !== undefined) w.balance = balData[w.symbol];
        });
        setSelected(wallets[0]); // refresh
      } catch (err) {
        console.error(err);
      }
    };

    checkKYCAndBalance();
  }, [uid]);

  const handleWithdraw = () => {
    if (!address || !amountUSD) return alert("Enter address and amount");

    // Show confirm modal
    setModal("confirm");
  };

  const confirmWithdraw = async () => {
    if (!uid) return;
    try {
      const res = await fetch("https://bluevult.com/api/index.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          q: "withdraw",
          uid,
          crypto: selected.symbol,
          amount: amountCrypto,
          amount_usd: amountUSD,
          address,
        }),
      });
      const data = await res.json();

      if (data.status === "success") {
        // Fade out before redirect
        document.body.style.transition = "opacity 1.5s";
        document.body.style.opacity = "0.8";
        setTimeout(() => navigate("/history"), 1500);
      } else {
        alert(data.message || "Withdrawal failed");
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900">
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 w-64 bg-white dark:bg-[#020617] shadow-lg z-50 transform transition-transform duration-300
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}
      >
        <Sidebar onClose={() => setSidebarOpen(false)} />
      </div>

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Top bar */}
      <TopBar title="Withdrawal" onSidebarToggle={() => setSidebarOpen(true)} />

      {/* Main content */}
      <main className="pt-28 lg:pl-64 px-6 pb-20">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Asset selector */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {wallets.map((wallet) => (
              <button
                key={wallet.symbol}
                onClick={() => setSelected(wallet)}
                className={`p-4 rounded-xl border text-left transition shadow-sm flex items-center gap-4
                ${selected.symbol === wallet.symbol ? "bg-white border-gray-400" : "bg-gray-50 border-gray-200 hover:bg-white"}`}
              >
                <div className="p-3 bg-gray-100 rounded-full">{wallet.icon}</div>
                <div>
                  <p className="font-medium">{wallet.name}</p>
                  <p className="text-xs text-gray-500">{wallet.network}</p>
                </div>
              </button>
            ))}
          </div>

          {/* Withdrawal card */}
          <div className="bg-white rounded-2xl shadow-md p-8 space-y-8">
            {/* Balance */}
            <div className="flex flex-col items-center">
              <div className="bg-gray-100 p-5 rounded-full">
                <FaWallet className="text-3xl text-gray-600" />
              </div>
              <p className="text-2xl font-semibold mt-4">
                {selected.balance} {selected.symbol}
              </p>
              <p className="text-sm text-gray-500">Available balance</p>
            </div>

            {/* Withdrawal address */}
            <div>
              <label className="text-sm font-medium">Withdrawal Address</label>
              <input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder={`Enter ${selected.symbol} address`}
                className="w-full mt-2 p-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-gray-300"
              />
            </div>

            {/* Amount USD */}
            <div>
              <label className="text-sm font-medium">Amount (USD)</label>
              <input
                type="number"
                value={amountUSD}
                onChange={(e) => setAmountUSD(e.target.value)}
                placeholder={`Amount in USD`}
                className="w-full mt-2 p-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-gray-300"
              />
            </div>

            {/* Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <Info label="Network Fee" value={`${selected.fee} ${selected.symbol}`} />
              <Info label="Processing Time" value={selected.processingTime} />
            </div>

            {/* Warning */}
            <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-md text-sm text-yellow-800">
              <p className="font-semibold">Important</p>
              <p>Ensure the withdrawal address is correct. Transactions cannot be reversed.</p>
            </div>

            {/* Withdraw button */}
            <button
              onClick={handleWithdraw}
              className="w-full flex items-center justify-center gap-2 bg-gray-900 text-white py-4 rounded-xl hover:bg-gray-800 transition shadow"
            >
              <FaArrowUp /> Withdraw
            </button>
          </div>
        </div>
      </main>

      <Footer />

      {/* Modals */}
      {modal === "kyc" && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl max-w-sm text-center space-y-4">
            <p className="font-bold text-lg">KYC Required</p>
            <p>You need to complete your KYC to be eligible to withdraw.</p>
            <button
              onClick={() => navigate("/kyc_verify")}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg"
            >
              Verify Now
            </button>
          </div>
        </div>
      )}

      {modal === "confirm" && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl max-w-sm text-center space-y-4">
            <p className="font-bold text-lg">Confirm Withdrawal</p>
            <p>Confirm the withdrawal to {address} for {amountUSD} USD?</p>
            <div className="flex justify-center gap-4">
              <button
                onClick={confirmWithdraw}
                className="bg-green-600 text-white px-4 py-2 rounded-lg"
              >
                Confirm
              </button>
              <button
                onClick={() => setModal(null)}
                className="bg-gray-300 px-4 py-2 rounded-lg"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-gray-500">{label}</p>
      <p className="font-medium">{value}</p>
    </div>
  );
}