import { useState, useEffect } from "react";
import { FaBars, FaBell, FaUserCircle, FaSun, FaMoon } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

interface TopBarProps {
  title: string;
  onSidebarToggle: () => void;
}

const TopBar: React.FC<TopBarProps> = ({ title, onSidebarToggle }) => {
  const navigate = useNavigate();
  const [dark, setDark] = useState(localStorage.getItem("theme") === "dark");
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const uid = localStorage.getItem("user_id");

  useEffect(() => {
    const fetchNotifications = async () => {
      if (!uid) return;
      try {
        const res = await fetch("https://bluevult.com/api/index.php", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ q: "get_notifications", uid }),
        });
        const data = await res.json();
        if (data.success) {
          setNotifications(data.notifications);
        }
      } catch (err) {
        console.error("Error fetching notifications:", err);
      }
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, [uid]);

  const toggleDark = () => {
    const newDark = !dark;
    setDark(newDark);
    document.documentElement.classList.toggle("dark", newDark);
    localStorage.setItem("theme", newDark ? "dark" : "light");
  };

  const markNotificationsSeen = async () => {
    setShowNotifications(!showNotifications);
    if (!showNotifications && notifications.some(n => n.is_notified === 0)) {
       await fetch("https://bluevult.com/api/index.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ q: "mark_notifications_seen", uid }),
      });
    }
  };

  const unreadCount = notifications.filter(n => n.notification_status === 'unread').length;

  return (
    <div className="fixed top-0 left-0 md:left-64 right-0 h-16 bg-white dark:bg-[#020617]/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 px-6 flex items-center justify-between z-50 transition-colors duration-300">
      <div className="flex items-center gap-4">
        <button
          className="lg:hidden p-2 rounded-md text-gray-600 dark:text-white hover:bg-gray-100 dark:hover:bg-white/10"
          onClick={onSidebarToggle}
        >
          <FaBars className="text-xl" />
        </button>
        <h1 className="text-lg font-bold text-gray-900 dark:text-white hidden sm:block">
          {title}
        </h1>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={toggleDark}
          className="p-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-yellow-400 hover:scale-110 transition active:scale-95"
        >
          {dark ? <FaSun /> : <FaMoon />}
        </button>

        <div className="relative">
          <button
            onClick={markNotificationsSeen}
            className="p-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-white hover:scale-110 transition active:scale-95"
          >
            <FaBell />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] flex items-center justify-center rounded-full border-2 border-white dark:border-[#020617] animate-bounce">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-3 w-80 bg-white dark:bg-[#0f111b] rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden animate-in fade-in slide-in-from-top-5">
              <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-white/5">
                <h3 className="font-bold dark:text-white">Notifications</h3>
                <span className="text-xs text-blue-600 cursor-pointer">Clear all</span>
              </div>
              <div className="max-h-96 overflow-y-auto">
                {notifications.length === 0 ? (
                  <p className="p-8 text-center text-gray-500 text-sm">No new notifications</p>
                ) : (
                  notifications.map((n, i) => (
                    <div
                      key={i}
                      className="p-4 border-b border-gray-50 dark:border-gray-800/50 hover:bg-gray-50 dark:hover:bg-white/5 transition cursor-pointer"
                    >
                      <p className="text-sm font-bold text-gray-900 dark:text-white">{n.notification}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{n.notification_desc}</p>
                      <span className="text-[10px] text-gray-400 mt-2 block">{n.notification_time}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <button
          onClick={() => navigate("/settings")}
          className="hover:scale-110 transition active:scale-95"
        >
          <FaUserCircle className="text-3xl text-blue-600" />
        </button>
      </div>
    </div>
  );
};

export default TopBar;
