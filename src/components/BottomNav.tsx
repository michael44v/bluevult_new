import { Link, useLocation } from "react-router-dom";
import {
  FaChartPie,
  FaChartLine,
  FaPlusCircle,
  FaHistory,
  FaCogs
} from "react-icons/fa";

const BottomNav = () => {
  const { pathname } = useLocation();

  const isActive = (path: string) => pathname === path;

  const navItems = [
    { path: "/dashboard", label: "Home", icon: FaChartPie },
    { path: "/markets", label: "Markets", icon: FaChartLine },
    { path: "/wallets/deposit", label: "Deposit", icon: FaPlusCircle, special: true },
    { path: "/history", label: "History", icon: FaHistory },
    { path: "/settings", label: "Settings", icon: FaCogs },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 lg:hidden bg-white dark:bg-[#0f111b] border-t border-gray-200 dark:border-gray-800 px-2 py-2 z-[100] flex justify-around items-center shadow-[0_-4px_10px_rgba(0,0,0,0.1)]">
      {navItems.map((item) => {
        const Icon = item.icon;
        if (item.special) {
          return (
            <Link
              key={item.path}
              to={item.path}
              className="relative -top-6 flex flex-col items-center"
            >
              <div className="w-14 h-14 bg-gradient-to-tr from-blue-600 to-cyan-400 rounded-full flex items-center justify-center text-white shadow-xl border-4 border-white dark:border-[#0f111b] transform transition active:scale-90">
                <Icon className="text-2xl" />
              </div>
              <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 mt-1">
                {item.label}
              </span>
            </Link>
          );
        }

        return (
          <Link
            key={item.path}
            to={item.path}
            className={`flex flex-col items-center p-2 rounded-xl transition-all ${
              isActive(item.path)
                ? "text-blue-600 dark:text-blue-400"
                : "text-gray-400 dark:text-gray-500 hover:text-gray-600"
            }`}
          >
            <Icon className="text-xl" />
            <span className="text-[10px] font-medium mt-1">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
};

export default BottomNav;
