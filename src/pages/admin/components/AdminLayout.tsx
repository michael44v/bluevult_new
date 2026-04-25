import { useState, ReactNode } from "react";
import { FaBars, FaMoon, FaSun, FaBell, FaUserCircle } from "react-icons/fa";
import AdminSidebar from "./AdminSidebar";

interface AdminLayoutProps {
  children: ReactNode;
  title: string;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children, title }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dark, setDark] = useState(true);

  return (
    <div className={dark ? "dark" : ""}>
      <div className="flex min-h-screen bg-[#0f111b] text-gray-100">
        {/* Mobile overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-20 bg-black bg-opacity-50 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <div
          className={`fixed inset-y-0 left-0 z-30 w-64 bg-[#0a0f1f] shadow-lg transform transition-transform duration-300 lg:translate-x-0 ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <AdminSidebar onClose={() => setSidebarOpen(false)} />
        </div>

        {/* Main content */}
        <div className="flex-1 flex flex-col lg:ml-64">
          {/* Topbar */}
          <div className="fixed top-0 left-0 lg:left-64 right-0 h-16 bg-[#0a0f1f] border-b border-gray-800 px-6 flex items-center justify-between z-50">
            <div className="flex items-center gap-4">
              <button
                className="lg:hidden p-2 rounded-md text-white hover:bg-white/10"
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                <FaBars className="text-xl text-white" />
              </button>
              <h1 className="text-lg font-bold text-white">{title}</h1>
              <span className="px-2 py-1 text-xs bg-red-600 text-white rounded-full">Admin</span>
            </div>

            <div className="flex items-center gap-5">
              <button
                onClick={() => setDark(!dark)}
                className="p-2 rounded-lg hover:bg-gray-800 transition"
              >
                {dark ? <FaSun className="text-yellow-400" /> : <FaMoon className="text-gray-400" />}
              </button>

              <button className="relative p-2 rounded-lg hover:bg-gray-800 transition">
                <FaBell className="text-white" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-ping"></span>
              </button>

              <FaUserCircle className="text-3xl opacity-80 text-white" />
            </div>
          </div>

          {/* Page content */}
          <main className="flex-1 p-6 mt-16">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
