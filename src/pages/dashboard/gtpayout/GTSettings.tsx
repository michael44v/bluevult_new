import { useState } from "react";
import GTpayoutLayout from "./GTpayoutLayout";
import { FaShieldAlt, FaRobot, FaBell, FaWallet, FaSave } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

const GTSettings = () => {
  const [settings, setSettings] = useState({
    autoTrade: true,
    notifications: true,
    riskLevel: 'balanced',
    maxDailyLoss: '500',
    maxTrades: '10',
    twoFactor: false
  });

  const handleSave = () => {
    alert("GTpayout settings saved successfully!");
  };

  const SettingSection = ({ title, icon: Icon, children }: any) => (
    <div className="bg-slate-900/50 p-6 rounded-3xl border border-slate-800 shadow-xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-blue-600/20 flex items-center justify-center text-blue-500">
          <Icon size={18} />
        </div>
        <h3 className="text-lg font-bold">{title}</h3>
      </div>
      <div className="space-y-6">
        {children}
      </div>
    </div>
  );

  return (
    <GTpayoutLayout title="GTpayout Settings">
      <div className="max-w-[1000px] mx-auto space-y-6 pb-10">

        <SettingSection title="Bot Preferences" icon={FaRobot}>
          <div className="flex justify-between items-center">
            <div>
              <p className="font-bold text-white">Automated Trading Bot</p>
              <p className="text-sm text-slate-500">Enable or disable AI bot execution</p>
            </div>
            <Switch
              checked={settings.autoTrade}
              onCheckedChange={(checked) => setSettings({...settings, autoTrade: checked})}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-400">Default Risk Level</label>
              <select
                value={settings.riskLevel}
                onChange={(e) => setSettings({...settings, riskLevel: e.target.value})}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white outline-none"
              >
                <option value="conservative">Conservative (Low Risk)</option>
                <option value="balanced">Balanced (Medium Risk)</option>
                <option value="aggressive">Aggressive (High Risk)</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-400">Max Daily Loss ($)</label>
              <input
                type="number"
                value={settings.maxDailyLoss}
                onChange={(e) => setSettings({...settings, maxDailyLoss: e.target.value})}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white outline-none"
              />
            </div>
          </div>
        </SettingSection>

        <SettingSection title="Wallet & Security" icon={FaShieldAlt}>
          <div className="flex justify-between items-center">
             <div>
               <p className="font-bold text-white">Auto-Transfer Profits</p>
               <p className="text-sm text-slate-500">Move profits to Main Wallet automatically</p>
             </div>
             <Switch />
          </div>
          <div className="flex justify-between items-center border-t border-slate-800 pt-6">
             <div>
               <p className="font-bold text-white">Double Execution Protection</p>
               <p className="text-sm text-slate-500">Prevents opening two trades on the same asset</p>
             </div>
             <Switch checked />
          </div>
        </SettingSection>

        <SettingSection title="Notifications" icon={FaBell}>
           <div className="space-y-4">
              {['Trade Opened', 'Trade Closed', 'Bot Status Changed', 'Large P&L Alerts'].map(item => (
                <div key={item} className="flex justify-between items-center">
                   <span className="text-slate-300">{item}</span>
                   <Switch checked />
                </div>
              ))}
           </div>
        </SettingSection>

        <div className="flex justify-end">
           <Button
            onClick={handleSave}
            className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-6 rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-blue-600/20"
           >
             <FaSave /> Save Settings
           </Button>
        </div>

      </div>
    </GTpayoutLayout>
  );
};

export default GTSettings;
