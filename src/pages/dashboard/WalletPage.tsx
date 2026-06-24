import TopBar from '@/components/dashboard/TopBar';
import { useState, useEffect } from "react";
import { FaWallet, FaArrowDown, FaCopy, FaBars, FaMoon, FaSun, FaBell, FaUserCircle } from "react-icons/fa";
import QRCode from "react-qr-code";
import { useNavigate } from "react-router-dom";
import { submitUserDeposit } from "@/lib/api/dashboardService";

import Sidebar from "./dashboardWidgets/Sidebar";
import Footer from "@/components/landing/Footer";
import { useSystemSettings } from "@/hooks/useAdminData";

interface WalletInfo {
  name: string;
  symbol: string;
  network: string;
  balance: string;
  fiatValue: string;
  address: string;
  depositTime: string;
  rateUSD: number;
}

const wallets: WalletInfo[] = [
  {
    name: "Bitcoin",
    symbol: "BTC",
    network: "Bitcoin Network",
    balance: "1 BTC",
    fiatValue: "$95,780.45",
    address: "bc1qpvah8vcv9vwlv9e8hp6dcfa5yk7jgmwjmd0sgq",
    depositTime: "10-30 mins",
    rateUSD: 42500,
  },
  {
    name: "Ethereum",
    symbol: "ETH",
    network: "ERC20",
    balance: "1.86 ETH",
    fiatValue: "$4,920.10",
    address: "0xdad04a4C7a3cEfc3129BEaA35b06Fe7f57c95A76",
    depositTime: "2-5 mins",
    rateUSD: 2640,
  },
  {
    name: "USDT",
    symbol: "USDT",
    network: "TRON (TRC20)",
    balance: "850 USDT",
    fiatValue: "$850.00",
    address: "TWP3ZmMskrLqhFZv3miP2D3CgNZSiG5mc7",
    depositTime: "1-3 mins",
    rateUSD: 1,
  },
];

// Map symbols to CoinGecko IDs
const coinGeckoIds: Record<string, string> = {
  BTC: "bitcoin",
  ETH: "ethereum",
  USDT: "tether",
};

export default function DepositPage() {
  const navigate = useNavigate();

  const [selected, setSelected] = useState(wallets[0]);
  const [usdAmount, setUsdAmount] = useState("");
  const [cryptoAmount, setCryptoAmount] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dark, setDark] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const { data: settings = [] } = useSystemSettings();
  const minDeposit = settings.find(s => s.setting_key === "min_deposit")?.setting_value;
  const maxDeposit = settings.find(s => s.setting_key === "max_deposit")?.setting_value;
  const emailNotifications = settings.find(s => s.setting_key === "email_notifications")?.setting_value !== "false";

  const userId = localStorage.getItem("user_id");

  // Calculate crypto amount in selected currency from USD
  useEffect(() => {
    if (!usdAmount) {
      setCryptoAmount("");
      return;
    }
    const usd = parseFloat(usdAmount);
    if (!isNaN(usd)) {
      const converted = usd / selected.rateUSD;
      setCryptoAmount(converted.toFixed(6));
    }
  }, [usdAmount, selected]);

  const copyAddress = () => {
    navigator.clipboard.writeText(selected.address);
    alert("Wallet address copied!");
  };

  const handlePaymentMade = async () => {
    if (!usdAmount || !cryptoAmount) {
      alert("Please enter an amount before confirming payment.");
      return;
    }

    const amount = parseFloat(usdAmount);
    if (minDeposit && amount < parseFloat(minDeposit)) {
      alert(`Minimum deposit amount is $${parseFloat(minDeposit).toLocaleString()}`);
      return;
    }
    if (maxDeposit && amount > parseFloat(maxDeposit)) {
      alert(`Maximum deposit amount is $${parseFloat(maxDeposit).toLocaleString()}`);
      return;
    }

    setModalOpen(false);
    setLoading(true);

    try {
      // 1️⃣ Get CoinGecko IDs
      const coinId = coinGeckoIds[selected.symbol];
      if (!coinId) throw new Error("Unsupported crypto");

      // 2️⃣ Fetch real-time BTC & selected crypto prices
      const priceRes = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,${coinId}&vs_currencies=usd`
      );
      const priceData = await priceRes.json();
      const btcPriceUSD = priceData.bitcoin.usd;
      const cryptoPriceUSD = coinId === "bitcoin" ? btcPriceUSD : priceData[coinId]?.usd;

      if (!cryptoPriceUSD) throw new Error("Failed to fetch crypto price");

      // 3️⃣ Convert USD to BTC
      let amountBTC: number;
      if (selected.symbol === "BTC") {
        amountBTC = parseFloat(usdAmount) / btcPriceUSD;
      } else {
        amountBTC = parseFloat(usdAmount) / btcPriceUSD; // direct USD → BTC conversion
      }

      // 4️⃣ Send to backend: original crypto + BTC + USD
      const data = await submitUserDeposit({
          user_id: userId,
          crypto: selected.symbol,
          amount_crypto: parseFloat(cryptoAmount),
          amount_usd: parseFloat(usdAmount),
          amount_btc: amountBTC.toFixed(8),
      });

      if (data.status === "success") {
        document.body.style.transition = "opacity 1.5s";
        document.body.style.opacity = "0.6";

    if (emailNotifications) {
      fetch('/api/mail.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: 'Deposit Request of $' + parseFloat(usdAmount) +' recieved.',
          name :localStorage.getItem("user_name"),
          email: localStorage.getItem("user_email"),

          message: 'Your Deposit request of $' + parseFloat(usdAmount)+ ' ('+ amountBTC.toFixed(8)+' BTC) have been recieved and is under review. You will recieve the funds when the block is confirmed 10 - 15 minutes time.'
        })
      })
      .then(res => res.json())
      .then(console.log)   // will show success or error from PHP
      .catch(console.error);
    }


        setTimeout(() => {
          navigate("/history");
          document.body.style.opacity = "1";
        }, 1500);
      } else {
        alert(data.message || "Payment failed. Try again.");
      }
    } catch (err) {
      console.error(err);
      alert((err as Error).message || "Error sending payment. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen ${dark ? "dark" : ""} bg-gray-50 text-gray-900`}>
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 w-64 bg-white dark:bg-[#020617] shadow-lg z-50 transform transition-transform duration-300
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}
      >
        <Sidebar onClose={() => setSidebarOpen(false)} />
      </div>

      {sidebarOpen && <div className="fixed inset-0 bg-black/30 z-40 md:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Topbar */}
      <TopBar title="Wallet" onSidebarToggle={() => setSidebarOpen(true)} />

      <main className="pt-24 lg:pl-64 px-6 pb-16">
        <div className="max-w-4xl mx-auto space-y-10">
          <div>
            <h1 className="text-3xl font-bold">Deposit {selected.symbol}</h1>
            <p className="text-gray-600 mt-1">Scan the QR code or copy the wallet address to deposit.</p>
          </div>

          {/* Wallet selector */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {wallets.map((wallet) => (
              <button
                key={wallet.symbol}
                onClick={() => setSelected(wallet)}
                className={`p-4 rounded-xl border transition ${
                  selected.symbol === wallet.symbol
                    ? "bg-white shadow-md border-gray-300"
                    : "bg-gray-100 border-gray-200 hover:shadow-sm"
                }`}
              >
                <p className="font-medium">{wallet.name}</p>
                <p className="text-sm text-gray-500">{wallet.network}</p>
              </button>
            ))}
          </div>

          {/* Deposit card */}
          <div className="bg-white shadow-lg rounded-2xl p-8 space-y-6">
            <div className="flex flex-col items-center">
              <div className="bg-gray-100 p-5 rounded-full">
                <FaWallet className="text-4xl text-gray-600" />
              </div>
              <p className="text-2xl font-semibold mt-4">{selected.balance}</p>
              <p className="text-gray-500">≈ {selected.fiatValue}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <Info label="Asset" value={selected.name} />
              <Info label="Symbol" value={selected.symbol} />
              <Info label="Network" value={selected.network} />
              <Info label="Deposit Time" value={selected.depositTime} />
            </div>

            <div className="flex flex-col items-center space-y-3">
              <QRCode value={selected.address} size={180} />
              <div className="flex items-center gap-2">
                <p className="break-all font-mono">{selected.address}</p>
                <button onClick={copyAddress} className="p-2 bg-gray-200 rounded hover:bg-gray-300 transition">
                  <FaCopy />
                </button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4">
              <input
                type="number"
                placeholder="Amount in USD"
                value={usdAmount}
                onChange={(e) => setUsdAmount(e.target.value)}
                className="flex-1 p-3 border rounded shadow-sm"
              />
              <input
                type="text"
                placeholder={`Equivalent in ${selected.symbol}`}
                value={cryptoAmount}
                readOnly
                className="flex-1 p-3 border rounded shadow-sm bg-gray-100 text-gray-700"
              />
            </div>

            {/* Warning */}
            <div className="bg-yellow-100 text-yellow-900 border-l-4 border-yellow-500 p-4 rounded-md space-y-1">
              <p className="font-semibold">Important!</p>
              <p className="text-sm">Send crypto <strong>only</strong> to this address to prevent permanent loss of funds.</p>
              <p className="text-sm">Click <strong>Made Payment</strong> only after completing your payment.</p>
            </div>

            <div className="flex justify-center">
              <button
                onClick={() => setModalOpen(true)}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-6 py-3 shadow-md transition"
              >
                <FaArrowDown />
                Made Payment
              </button>
            </div>
          </div>
        </div>
      </main>

      <Footer />

      {/* Payment Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-[#0f111b] rounded-2xl p-6 w-96 space-y-4 text-center">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              Confirm Payment
            </h2>
            <p className="text-gray-700 dark:text-gray-300">
              I have made the payment of <strong>${usdAmount}</strong> to the company address.
            </p>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              Your deposit will be confirmed within 12-15 minutes.
            </p>
            <div className="flex justify-between gap-3 mt-4">
              <button
                onClick={() => setModalOpen(false)}
                className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 py-2 rounded-xl hover:bg-gray-300 dark:hover:bg-gray-600 transition"
              >
                Cancel
              </button>
              <button
                onClick={handlePaymentMade}
                disabled={loading}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-xl transition disabled:opacity-50"
              >
                {loading ? "Processing..." : "Confirm Payment"}
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
      <p className="text-sm text-gray-500">{label}</p>
      <p className="font-medium">{value}</p>
    </div>
  );
}
