import { useState, useEffect } from "react";
import GTpayoutLayout from "./GTpayoutLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { FaExchangeAlt, FaHistory, FaWallet } from "react-icons/fa";

const TradingWallet = () => {
  const uid = localStorage.getItem("user_id");
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [amount, setAmount] = useState("");
  const [direction, setDirection] = useState<"main_to_trading" | "trading_to_main">("main_to_trading");
  const [transferring, setTransferring] = useState(false);

  const fetchData = async () => {
    try {
      const response = await fetch("https://bluevult.com/api/index.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ q: "gtpayout_wallet", uid }),
      });
      const json = await response.json();
      if (json.success) {
        setData(json);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [uid]);

  const handleTransfer = async () => {
    const amt = parseFloat(amount);
    if (isNaN(amt) || amt <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    setTransferring(true);
    try {
      const from = direction === "main_to_trading" ? "main" : "trading";
      const to = direction === "main_to_trading" ? "trading" : "main";

      const response = await fetch("https://bluevult.com/api/index.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ q: "transfer_funds", uid, from, to, amount: amt }),
      });
      const json = await response.json();
      if (json.success) {
        toast.success(json.message);
        setAmount("");
        fetchData();
      } else {
        toast.error(json.message);
      }
    } catch (error) {
      toast.error("Transfer failed");
    } finally {
      setTransferring(false);
    }
  };

  if (loading) return <GTpayoutLayout title="Trading Wallet">Loading...</GTpayoutLayout>;

  return (
    <GTpayoutLayout title="Trading Wallet">
      <div className="grid md:grid-cols-2 gap-6">
        {/* Wallet Balances */}
        <div className="space-y-6">
          <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700 shadow-xl">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <FaWallet className="text-emerald-500" /> Wallet Overview
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-slate-900 rounded-xl">
                <span className="text-slate-400">Main Wallet</span>
                <span className="text-2xl font-bold">${parseFloat(data?.main_balance || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                <span className="text-emerald-400">Trading Wallet</span>
                <span className="text-2xl font-bold text-emerald-400">${parseFloat(data?.trading_wallet?.balance || 0).toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700 shadow-xl">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <FaExchangeAlt className="text-blue-500" /> Transfer Funds
            </h3>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Button
                  variant={direction === "main_to_trading" ? "default" : "outline"}
                  onClick={() => setDirection("main_to_trading")}
                  className="flex-1"
                >
                  Main → Trading
                </Button>
                <Button
                  variant={direction === "trading_to_main" ? "default" : "outline"}
                  onClick={() => setDirection("trading_to_main")}
                  className="flex-1"
                >
                  Trading → Main
                </Button>
              </div>
              <Input
                type="number"
                placeholder="Amount to transfer"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="bg-slate-900 border-slate-700 text-white h-12"
              />
              <Button
                onClick={handleTransfer}
                disabled={transferring}
                className="w-full bg-blue-600 hover:bg-blue-700 py-6"
              >
                {transferring ? "Processing..." : "Transfer Now"}
              </Button>
            </div>
          </div>
        </div>

        {/* Transfer History */}
        <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700 shadow-xl overflow-hidden flex flex-col">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <FaHistory className="text-purple-500" /> Transfer History
          </h3>
          <div className="flex-1 overflow-y-auto space-y-3">
            {data?.history?.length > 0 ? (
              data.history.map((tx: any) => (
                <div key={tx.transfer_id} className="p-3 bg-slate-900 rounded-lg flex justify-between items-center border border-slate-800">
                  <div>
                    <p className="text-sm font-bold capitalize">
                      {tx.from_wallet} → {tx.to_wallet}
                    </p>
                    <p className="text-xs text-slate-500">{tx.created_at}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-white">${parseFloat(tx.amount).toLocaleString()}</p>
                    <span className="text-[10px] uppercase font-bold text-emerald-400">{tx.status}</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-slate-500 py-10">No transfer history yet.</p>
            )}
          </div>
        </div>
      </div>
    </GTpayoutLayout>
  );
};

export default TradingWallet;
